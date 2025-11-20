/**
 * SW4E Role System Extension - Safe Middleware
 * This extends the existing system WITHOUT breaking changes
 */

import { Request, Response, NextFunction } from 'express';
import { 
  getRoleHierarchy, 
  getUserEffectivePermissions, 
  checkUserPermission,
  getRoleCategory,
  getRoleDisplayName
} from '../services/roleExtension.js';

// Extend Request interface to include role extension data
declare global {
  namespace Express {
    interface Request {
      userRoleInfo?: {
        role: string;
        accessLevel: string;
        category: string;
        displayName: string;
        permissions: string[];
      };
    }
  }
}

// NEW middleware: Get user role information (additive only)
export const getUserRoleInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Get role hierarchy information
    const roleHierarchy = await getRoleHierarchy(userRole);
    if (!roleHierarchy) {
      return next();
    }

    // Get user's effective permissions
    const permissions = await getUserEffectivePermissions(userId);

    // Add role information to request
    req.userRoleInfo = {
      role: userRole,
      accessLevel: roleHierarchy.access_level,
      category: roleHierarchy.category,
      displayName: getRoleDisplayName(userRole),
      permissions: permissions
    };

    next();
  } catch (error) {
    console.error('Error getting user role info:', error);
    next();
  }
};

// NEW middleware: Check access level (additive only)
export const requireAccessLevel = (requiredLevel: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    if (!req.userRoleInfo) {
      return res.status(500).json({
        success: false,
        message: 'Role information not available',
        code: 'ROLE_INFO_MISSING'
      });
    }

    const accessLevels = ['guest', 'support', 'professional', 'manager', 'org_admin', 'super_admin'];
    const userLevelIndex = accessLevels.indexOf(req.userRoleInfo.accessLevel);
    const requiredLevelIndex = accessLevels.indexOf(requiredLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required access level: ${requiredLevel}. Your level: ${req.userRoleInfo.accessLevel}`,
        code: 'INSUFFICIENT_ACCESS_LEVEL'
      });
    }

    next();
  };
};

// NEW middleware: Check role category (additive only)
export const requireRoleCategory = (requiredCategory: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    if (!req.userRoleInfo) {
      return res.status(500).json({
        success: false,
        message: 'Role information not available',
        code: 'ROLE_INFO_MISSING'
      });
    }

    if (req.userRoleInfo.category !== requiredCategory) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role category: ${requiredCategory}. Your category: ${req.userRoleInfo.category}`,
        code: 'INSUFFICIENT_ROLE_CATEGORY'
      });
    }

    next();
  };
};

// NEW middleware: Check custom permission (additive only)
export const requireCustomPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    try {
      const hasPermission = await checkUserPermission(req.user.id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
          code: 'INSUFFICIENT_PERMISSION'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking custom permission:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// NEW middleware: Check multiple permissions (additive only)
export const requireAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    try {
      const userPermissions = await getUserEffectivePermissions(req.user.id);
      const hasAnyPermission = permissions.some(permission => userPermissions.includes(permission));
      
      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required any of: ${permissions.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// NEW middleware: Check all permissions (additive only)
export const requireAllPermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    try {
      const userPermissions = await getUserEffectivePermissions(req.user.id);
      const hasAllPermissions = permissions.every(permission => userPermissions.includes(permission));
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required all of: ${permissions.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// NEW middleware: Organization role access (additive only)
export const requireOrganizationRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    // Check if user has the required role in the organization
    const userRole = req.user.role;
    const organizationId = req.params.organizationId || req.body.organizationId;

    // Super admins can access any organization
    if (userRole === 'super_admin') {
      return next();
    }

    // Check if user has the required role
    if (userRole !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${requiredRole}. Your role: ${userRole}`,
        code: 'INSUFFICIENT_ORGANIZATION_ROLE'
      });
    }

    // TODO: In production, check if user belongs to the specific organization
    // For now, we'll allow access if the role matches

    next();
  };
};

// NEW middleware: Temporary role access (additive only)
export const checkTemporaryRole = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_USER'
    });
  }

  try {
    // TODO: Implement temporary role checking
    // This would check if the user has any active temporary roles
    // and apply their permissions
    
    next();
  } catch (error) {
    console.error('Error checking temporary role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'TEMPORARY_ROLE_CHECK_ERROR'
    });
  }
};

// NEW middleware: Role delegation access (additive only)
export const requireRoleDelegation = (fromRole: string, toRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    try {
      const userRole = req.user.role;
      
      // Check if user can delegate from their role to the target role
      if (userRole !== fromRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Only ${fromRole} can delegate to ${toRole}`,
          code: 'INSUFFICIENT_DELEGATION_ROLE'
        });
      }

      // TODO: Check delegation matrix in database
      // For now, we'll allow delegation based on role hierarchy

      next();
    } catch (error) {
      console.error('Error checking role delegation:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'DELEGATION_CHECK_ERROR'
      });
    }
  };
};

// NEW middleware: Audit role changes (additive only)
export const auditRoleChange = (actionType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Store original values for audit
      const originalValues = {
        role: req.user?.role,
        permissions: req.userRoleInfo?.permissions || []
      };

      // Continue with the request
      next();

      // After the request, log the changes
      if (req.user && req.body) {
        const newValues = {
          role: req.body.role || req.user.role,
          permissions: req.userRoleInfo?.permissions || []
        };

        // TODO: Implement audit logging
        // await logRoleChange(
        //   req.user.id,
        //   actionType,
        //   req.params.userId || req.body.userId,
        //   req.body,
        //   originalValues,
        //   newValues,
        //   req.ip,
        //   req.get('User-Agent')
        // );
      }
    } catch (error) {
      console.error('Error in audit role change middleware:', error);
      next();
    }
  };
};

// NEW middleware: Role-based resource access (additive only)
export const requireResourceAccess = (resourceType: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    try {
      const permission = `${resourceType}:${action}`;
      const hasPermission = await checkUserPermission(req.user.id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
          code: 'INSUFFICIENT_RESOURCE_PERMISSION'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking resource access:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'RESOURCE_ACCESS_CHECK_ERROR'
      });
    }
  };
};

// NEW middleware: Role-based service access (additive only)
export const requireServiceAccess = (serviceId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_USER'
      });
    }

    try {
      const permission = `service:${serviceId}`;
      const hasPermission = await checkUserPermission(req.user.id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
          code: 'INSUFFICIENT_SERVICE_PERMISSION'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking service access:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'SERVICE_ACCESS_CHECK_ERROR'
      });
    }
  };
};
