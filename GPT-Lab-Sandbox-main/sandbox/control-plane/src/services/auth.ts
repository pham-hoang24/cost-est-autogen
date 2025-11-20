import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { validatePasswordStrength } from '../config/security.js';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('🚨 SECURITY WARNING: Using default JWT secret in development. Set JWT_SECRET in production!');
  return 'sw4e-governance-secret-key-change-in-production';
})();
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization?: string;
  signup_reason?: string;
  research_area?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization?: string;
  signup_reason?: string;
  research_area?: string;
  role?: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: Partial<User>;
  message?: string;
}

export interface SignupResult {
  success: boolean;
  user?: Partial<User>;
  message?: string;
}

// Create new user (signup)
export const createUser = async (userData: CreateUserData): Promise<SignupResult> => {
  try {
    const { email, password, first_name, last_name, organization, signup_reason, research_area, role = 'viewer' } = userData;
    
    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return { success: false, message: 'Missing required fields' };
    }
    
    // Enhanced password validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return { 
        success: false, 
        message: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
      };
    }
    
    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    
    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, organization, signup_reason, research_area, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `, [userId, email.toLowerCase(), password_hash, first_name, last_name, organization, signup_reason, research_area, role, now, now]);
    
    // Log signup
    await logAuditAction(userId, 'signup', 'User registered successfully');
    
    return {
      success: true,
      user: {
        id: userId,
        email: email.toLowerCase(),
        first_name,
        last_name,
        organization,
        signup_reason,
        research_area,
        role,
        status: 'pending'
      }
    };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, message: 'Internal server error' };
  }
};

// Authenticate user (login)
export const authenticateUser = async (email: string, password: string): Promise<LoginResult> => {
  try {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    
    // Get user from database
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Allow pending users to login but with limited access
    if (user.status === 'rejected') {
      return { success: false, message: 'Your account has been rejected. Please contact support.' };
    } else if (user.status === 'suspended') {
      return { success: false, message: 'Your account has been suspended. Please contact support.' };
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Update last login
    const now = new Date().toISOString();
    await db.run('UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?', [now, now, user.id]);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        status: user.status,
        name: `${user.first_name} ${user.last_name}`
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Log successful login
    await logAuditAction(user.id, 'login', 'User logged in successfully');
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status,
        organization: user.organization,
        signup_reason: user.signup_reason,
        research_area: user.research_area,
        created_at: user.created_at,
        approved_at: user.approved_at,
        approved_by: user.approved_by
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Internal server error' };
  }
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<{ valid: boolean; user?: Partial<User>; message?: string }> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get fresh user data
    const user = await db.get('SELECT * FROM users WHERE id = ? AND status = ?', [decoded.userId, 'approved']);
    
    if (!user) {
      return { valid: false, message: 'User not found or not approved' };
    }
    
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status
      }
    };
  } catch (error) {
    return { valid: false, message: 'Invalid token' };
  }
};

// Logout user
export const logoutUser = async (userId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just log the logout
    await logAuditAction(userId, 'logout', 'User logged out');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Internal server error' };
  }
};

// Approve user (admin only)
export const approveUser = async (userId: string, adminUserId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const now = new Date().toISOString();
    
    await db.run('UPDATE users SET status = ?, updated_at = ? WHERE id = ?', ['approved', now, userId]);
    
    await logAuditAction(adminUserId, 'approve_user', `Approved user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Approve user error:', error);
    return { success: false, message: 'Internal server error' };
  }
};

// Reject user (admin only)
export const rejectUser = async (userId: string, adminUserId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const now = new Date().toISOString();
    
    await db.run('UPDATE users SET status = ?, updated_at = ? WHERE id = ?', ['rejected', now, userId]);
    
    await logAuditAction(adminUserId, 'reject_user', `Rejected user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Reject user error:', error);
    return { success: false, message: 'Internal server error' };
  }
};

// Log audit action
export const logAuditAction = async (userId: string, action: string, details: string): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Get user email for audit log
    const user = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
    const userEmail = user?.email || 'unknown';
    
    await db.run(`
      INSERT INTO governance_audit (action_type, actor_id, actor_email, action_description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [action, userId, userEmail, details, now]);
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
