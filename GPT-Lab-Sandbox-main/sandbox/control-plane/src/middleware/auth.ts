import { Request, Response, NextFunction } from 'express';
import { verifyToken, User } from '../services/auth.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Authentication middleware - verifies token and sets req.user
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    
    console.log('🔍 Auth Debug:', {
      hasAuthHeader: !!req.headers.authorization,
      hasCookie: !!req.cookies.sw4e_token,
      tokenLength: token?.length || 0,
      url: req.url
    });
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code: 'NO_TOKEN'
      });
    }
    
    const tokenResult = await verifyToken(token);
    
    console.log('🔍 Token verification result:', { valid: tokenResult?.valid, user: !!tokenResult?.user });
    
    if (!tokenResult?.valid || !tokenResult.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }
    
    req.user = tokenResult.user as User;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication - sets req.user if token is valid but doesn't require it
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    
    if (token) {
      const tokenResult = await verifyToken(token);
      if (tokenResult?.valid && tokenResult.user) {
        req.user = tokenResult.user as User;
      }
    }
    
    next();
  } catch (error) {
    // Don't block request on error, just continue without user
    console.warn('Optional auth error:', error);
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

// Admin access middleware (super_admin or research_admin)
export const requireAdmin = requireRole('super_admin', 'research_admin');

// Super admin only middleware
export const requireSuperAdmin = requireRole('super_admin');

// Researcher access middleware (researcher or admin)
export const requireResearcher = requireRole('super_admin', 'research_admin', 'researcher');

// Check if user can manage other users
export const canManageUsers = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_USER'
    });
  }
  
  const canManage = ['super_admin', 'research_admin'].includes(req.user.role);
  
  if (!canManage) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User management privileges required.',
      code: 'CANNOT_MANAGE_USERS'
    });
  }
  
  next();
};

// Check if user can access governance features
export const canAccessGovernance = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_USER'
    });
  }
  
  const canAccess = ['super_admin', 'research_admin'].includes(req.user.role);
  
  if (!canAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Governance access requires admin privileges.',
      code: 'CANNOT_ACCESS_GOVERNANCE'
    });
  }
  
  next();
};

// Check if user can approve other users
export const canApproveUsers = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_USER'
    });
  }
  
  const canApprove = ['super_admin', 'research_admin'].includes(req.user.role);
  
  if (!canApprove) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User approval privileges required.',
      code: 'CANNOT_APPROVE_USERS'
    });
  }
  
  next();
};

// Resource access control middleware
export const requireResourceAccess = (resourceType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }
    
    // Define access rules for different resources
    const accessRules: { [key: string]: string[] } = {
      'projects': ['super_admin', 'research_admin', 'researcher'],
      'experiments': ['super_admin', 'research_admin', 'researcher'],
      'models': ['super_admin', 'research_admin', 'researcher'],
      'datasets': ['super_admin', 'research_admin', 'researcher'],
      'services': ['super_admin', 'research_admin', 'researcher'],
      'governance': ['super_admin', 'research_admin'],
      'admin': ['super_admin'],
      'analytics': ['super_admin', 'research_admin', 'researcher', 'viewer'],
      'reports': ['super_admin', 'research_admin', 'researcher', 'viewer']
    };
    
    const allowedRoles = accessRules[resourceType] || ['super_admin'];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${resourceType} access requires one of: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_RESOURCE_ACCESS'
      });
    }
    
    next();
  };
};

// Check if user can modify their own data or if they're an admin
export const canModifyUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_USER'
    });
  }
  
  const targetUserId = req.params.userId || req.params.id;
  const isAdmin = ['super_admin', 'research_admin'].includes(req.user.role);
  const isOwnData = req.user.id === targetUserId;
  
  if (!isAdmin && !isOwnData) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify your own data or need admin privileges.',
      code: 'CANNOT_MODIFY_USER'
    });
  }
  
  next();
};

// Rate limiting for authentication endpoints
const authAttempts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitAuth = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    if (now % 1000 === 0) { // Clean up every ~1000 requests
      for (const [key, value] of authAttempts.entries()) {
        if (now > value.resetTime) {
          authAttempts.delete(key);
        }
      }
    }
    
    const attempts = authAttempts.get(clientId);
    
    if (!attempts) {
      authAttempts.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (now > attempts.resetTime) {
      authAttempts.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (attempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((attempts.resetTime - now) / 1000)
      });
    }
    
    attempts.count++;
    next();
  };
};

export default {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireResearcher,
  canManageUsers,
  canAccessGovernance,
  canApproveUsers,
  requireResourceAccess,
  canModifyUser,
  rateLimitAuth
};
