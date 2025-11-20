import jwt from 'jsonwebtoken';
import database from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Basic authentication middleware (compatible with existing base64 token system)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    // Try to decode as base64 (existing system)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (decoded.exp && Date.now() > decoded.exp) {
      return res.status(403).json({ success: false, message: 'Token expired' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    // Fallback to JWT verification
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const hasPermission = database.hasPermission(req.user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Subscription-based access control middleware
export const requireSubscription = (requiredTier) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const hasAccess = database.checkSubscriptionAccess(req.user.id, requiredTier);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required subscription: ${requiredTier}` 
      });
    }

    next();
  };
};

// Organization-level access control middleware
export const requireOrganizationAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const organizationId = req.params.organizationId || req.body.organizationId;
  if (!organizationId) {
    return res.status(400).json({ success: false, message: 'Organization ID required' });
  }

  // Check if user has access to this organization
  const userPermissions = database.getUserPermissions(req.user.id);
  if (!userPermissions) {
    return res.status(403).json({ success: false, message: 'User permissions not found' });
  }

  // System admins have access to all organizations
  if (userPermissions.roleType === 'system') {
    return next();
  }

  // Check if user is member of this organization
  const user = database.getUserById(req.user.id);
  if (user.organization_id !== organizationId) {
    return res.status(403).json({ success: false, message: 'Access denied to this organization' });
  }

  next();
};

// Project-level access control middleware
export const requireProjectAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ success: false, message: 'Project ID required' });
  }

  // Check if user has access to this project
  const userPermissions = database.getUserPermissions(req.user.id);
  if (!userPermissions) {
    return res.status(403).json({ success: false, message: 'User permissions not found' });
  }

  // System admins have access to all projects
  if (userPermissions.roleType === 'system') {
    return next();
  }

  // Check if user is member of this project
  const projectMembers = database.getProjectMembers(projectId);
  const isMember = projectMembers.some(member => member.id === req.user.id);
  
  if (!isMember) {
    return res.status(403).json({ success: false, message: 'Access denied to this project' });
  }

  next();
};

// API endpoint access control middleware
export const requireAPIAccess = (endpoint) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const hasAccess = database.hasAPIAccess(req.user.id, endpoint);
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied to API endpoint: ${endpoint}` 
      });
    }

    next();
  };
};

// Multi-level access control middleware
export const requireAccess = (options = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userPermissions = database.getUserPermissions(req.user.id);
    if (!userPermissions) {
      return res.status(403).json({ success: false, message: 'User permissions not found' });
    }

    // Check role requirement
    if (options.roles) {
      const allowedRoles = Array.isArray(options.roles) ? options.roles : [options.roles];
      if (!allowedRoles.includes(userPermissions.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        });
      }
    }

    // Check permission requirement
    if (options.permission) {
      if (!userPermissions.permissions[options.permission]) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required permission: ${options.permission}` 
        });
      }
    }

    // Check subscription requirement
    if (options.subscription) {
      const hasAccess = database.checkSubscriptionAccess(req.user.id, options.subscription);
      if (!hasAccess) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required subscription: ${options.subscription}` 
        });
      }
    }

    // Check organization access
    if (options.organizationId) {
      const user = database.getUserById(req.user.id);
      if (userPermissions.roleType !== 'system' && user.organization_id !== options.organizationId) {
        return res.status(403).json({ success: false, message: 'Access denied to this organization' });
      }
    }

    // Check project access
    if (options.projectId) {
      const projectMembers = database.getProjectMembers(options.projectId);
      const isMember = projectMembers.some(member => member.id === req.user.id);
      
      if (userPermissions.roleType !== 'system' && !isMember) {
        return res.status(403).json({ success: false, message: 'Access denied to this project' });
      }
    }

    next();
  };
};

// Get user permissions for frontend
export const getUserPermissions = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userPermissions = database.getUserPermissions(req.user.id);
  if (!userPermissions) {
    return res.status(404).json({ success: false, message: 'User permissions not found' });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: userPermissions.user.id,
        email: userPermissions.user.email,
        firstName: userPermissions.user.first_name,
        lastName: userPermissions.user.last_name,
        role: userPermissions.role,
        roleType: userPermissions.roleType,
        subscriptionTier: userPermissions.user.subscription_tier,
        organization: userPermissions.user.organization,
        organizationId: userPermissions.user.organization_id
      },
      permissions: userPermissions.permissions,
      uiAccess: userPermissions.uiAccess,
      apiAccess: userPermissions.apiAccess,
      subscriptionRequired: userPermissions.subscriptionRequired
    }
  });
};

export default {
  authenticateToken,
  requireRole,
  requirePermission,
  requireSubscription,
  requireOrganizationAccess,
  requireProjectAccess,
  requireAPIAccess,
  requireAccess,
  getUserPermissions
};
