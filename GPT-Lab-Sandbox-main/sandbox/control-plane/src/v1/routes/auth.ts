import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, authenticateUser, verifyToken, logoutUser, approveUser, rejectUser, logAuditAction } from '../../services/auth.js';
import { db } from '../../database/init.js';
import { validateInput, userRegistrationSchema, loginSchema } from '../../middleware/validation.js';
import { securityMonitoringService } from '../../services/securityMonitoring.js';

const router = Router();

// ==============================================================================
// AUTHENTICATION ROUTES
// ==============================================================================

// POST /api/auth/signup - User registration
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      organization, 
      signup_reason, 
      research_area 
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, first_name, last_name'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    const result = await createUser({
      email,
      password,
      first_name,
      last_name,
      organization,
      signup_reason,
      research_area,
      role: 'researcher' // Default role for signups
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', validateInput(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const result = await authenticateUser(email, password);
    
    if (result.success) {
      // Set HTTP-only cookie with token
      res.cookie('sw4e_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
      
      res.json({
        success: true,
        message: result.message,
        user: result.user,
        token: result.token
      });
    } else {
      // Log failed authentication attempt
      await securityMonitoringService.logSecurityEvent({
        event_type: 'authentication_failure',
        severity: 'medium',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        details: JSON.stringify({
          email: email,
          reason: result.message,
          timestamp: new Date().toISOString()
        })
      });
      
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    
    if (token) {
      await logoutUser(token);
    }
    
    // Clear cookie
    res.clearCookie('sw4e_token');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user information'
    });
  }
});

// GET /api/auth/status - Get current user's detailed status (including pending users)
router.get('/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // Decode token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sw4e-governance-secret-key-change-in-production') as any;
    
    // Get user from database (including pending users)
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
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
        approved_by: user.approved_by,
        last_login: user.last_login
      }
    });
  } catch (error) {
    console.error('Get user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user status'
    });
  }
});

// ==============================================================================
// ADMIN APPROVAL ROUTES
// ==============================================================================

// GET /api/auth/pending-users - Get users pending approval (admin only)
router.get('/pending-users', async (req, res) => {
  try {
    // Get current user (this will be enhanced with middleware later)
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = token ? await verifyToken(token) : null;
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Get pending users with their approval requests
    try {
      const users = await db.all(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.organization, 
          u.role, u.status, u.signup_reason, u.research_area, u.created_at,
          ar.id as request_id, ar.priority, ar.justification
        FROM users u
        LEFT JOIN approval_requests ar ON u.id = ar.user_id AND ar.request_type = 'user_registration' AND ar.current_status = 'pending'
        WHERE u.status = 'pending'
        ORDER BY u.created_at ASC
      `);
      
      res.json({
        success: true,
        data: users || [],
        count: users?.length || 0
      });
    } catch (err) {
      console.error('Error fetching pending users:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching pending users'
      });
    }
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending users'
    });
  }
});

// POST /api/auth/approve-user/:userId - Approve user registration (admin only)
router.post('/approve-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { admin_notes } = req.body;
    
    // Get current user
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = token ? await verifyToken(token) : null;
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const success = await approveUser(userId, currentUser.id!);
    
    if (success) {
      res.json({
        success: true,
        message: 'User approved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to approve user. User may not exist or already processed.'
      });
    }
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving user'
    });
  }
});

// POST /api/auth/reject-user/:userId - Reject user registration (admin only)
router.post('/reject-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    // Get current user
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = token ? await verifyToken(token) : null;
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const success = await rejectUser(userId, currentUser.id!);
    
    if (success) {
      res.json({
        success: true,
        message: 'User rejected successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to reject user. User may not exist or already processed.'
      });
    }
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting user'
    });
  }
});

// POST /api/auth/register - Admin user creation (admin only)
router.post('/register', async (req, res) => {
  try {
    // Get current user
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = token ? await verifyToken(token) : null;
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      role,
      organization, 
      send_welcome_email,
      require_password_change
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !first_name || !last_name || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, first_name, last_name, organization'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Role validation
    const validRoles = ['super_admin', 'research_admin', 'researcher', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: super_admin, research_admin, researcher, viewer'
      });
    }
    
    const result = await createUser({
      email,
      password,
      first_name,
      last_name,
      organization,
      role: role
    });
    
    if (result.success) {
      // Log the admin action
      await logAuditAction(
        currentUser.id!,
        'user_created',
        `Admin created user: ${email} with role ${role} in organization ${organization}`
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result.user
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during user creation'
    });
  }
});

// ==============================================================================
// USER MANAGEMENT ROUTES
// ==============================================================================

// GET /api/auth/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    
    // Get current user
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = token ? await verifyToken(token) : null;
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query
    let query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.organization, 
        u.role, u.status, u.signup_reason, u.research_area, 
        u.created_at, u.last_login, u.approved_at, u.approved_by,
        rq.cpu_hours_limit, rq.gpu_hours_limit, rq.storage_gb_limit,
        rq.used_cpu_hours, rq.used_gpu_hours, rq.used_storage_gb
      FROM users u
      LEFT JOIN resource_quotas rq ON u.id = rq.user_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status && status !== 'all') {
      query += ` AND u.status = ?`;
      params.push(status);
    }
    
    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);
    
    try {
      const users = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams: any[] = [];
      
      if (status && status !== 'all') {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      if (role && role !== 'all') {
        countQuery += ' AND role = ?';
        countParams.push(role);
      }
      
      const countResult = await db.get(countQuery, countParams);
      
      res.json({
        success: true,
        data: users || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limitNum)
        }
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
});

// PUT /api/auth/users/:id - Update user information (admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Build update query dynamically
    const allowedFields = [
      'first_name', 'last_name', 'email', 'role', 'status', 
      'organization', 'signup_reason', 'research_area'
    ];
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    // Add updated_at and updated_by
    updateFields.push('updated_at = ?', 'updated_by = ?');
    updateValues.push(new Date().toISOString(), currentUser.email);
    updateValues.push(id);
    
    await db.run(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);
    
    // Fetch updated user
    const updatedUser = await db.get(`
      SELECT 
        id, email, first_name, last_name, organization, 
        role, status, signup_reason, research_area, 
        created_at, updated_at, last_login, approved_at, approved_by
      FROM users 
      WHERE id = ?
    `, [id]);
    
    // Log audit action
    try {
      await db.run(`
        INSERT INTO audit_log (action_type, actor_id, actor_email, action_description, target_id, target_email, old_values, new_values, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        'user_updated',
        currentUser.email,
        currentUser.email,
        `User updated: ${updatedUser.email}`,
        id,
        updatedUser.email,
        JSON.stringify(existingUser),
        JSON.stringify(updates)
      ]);
    } catch (auditError) {
      console.log('Audit logging skipped (table may not exist)');
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

export { router as authRouter };
