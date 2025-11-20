/**
 * Access Control Middleware
 * Enforces subscription-based access control for services and features
 */

import { Request, Response, NextFunction } from 'express';
import { checkServiceAccess, getUserAccessLevel } from '../services/accessControl.js';

// Extend Request interface to include user access level
declare global {
  namespace Express {
    interface Request {
      userAccessLevel?: any;
    }
  }
}

/**
 * Middleware to check if user has access to a specific service
 */
export const requireServiceAccess = (serviceId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get organization ID from request or user context
      const organizationId = req.params.organizationId || req.body.organizationId || req.user?.organization;

      // Check service access
      const accessResult = await checkServiceAccess(userId, serviceId, organizationId);
      
      if (!accessResult.allowed) {
        return res.status(403).json({
          success: false,
          message: accessResult.reason || 'Access denied',
          quota: accessResult.quota,
          serviceId,
          requiresUpgrade: accessResult.reason?.includes('subscription'),
          requiresApproval: accessResult.reason?.includes('approval')
        });
      }

      // Add access info to request for potential logging
      req.userAccessLevel = {
        serviceId,
        allowed: true,
        quota: accessResult.quota
      };

      next();
    } catch (error) {
      console.error('Error in service access middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware to check subscription tier requirements
 */
export const requireSubscriptionTier = (requiredTier: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user access level
      const userAccess = await getUserAccessLevel(userId);
      
      if (!userAccess) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check tier level
      const tierOrder = ['basic', 'professional', 'enterprise'];
      const userTierIndex = tierOrder.indexOf(userAccess.subscriptionTier);
      const requiredTierIndex = tierOrder.indexOf(requiredTier);

      if (userTierIndex < requiredTierIndex) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredTier} subscription or higher`,
          currentTier: userAccess.subscriptionTier,
          requiredTier,
          upgradeRequired: true
        });
      }

      // Add user access info to request
      req.userAccessLevel = userAccess;
      next();
    } catch (error) {
      console.error('Error in subscription tier middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware to check resource quota limits
 */
export const checkResourceQuota = (resourceType: 'storage' | 'compute' | 'projects' | 'users') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user access level
      const userAccess = await getUserAccessLevel(userId);
      
      if (!userAccess) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check quota limits based on resource type
      let quotaLimit: number;
      let currentUsage: number = 0;

      switch (resourceType) {
        case 'storage':
          quotaLimit = userAccess.personalQuota.storageGB;
          // Get current storage usage from request or calculate
          currentUsage = req.body.storageGB || 0;
          break;
        case 'compute':
          quotaLimit = userAccess.personalQuota.computeHours;
          currentUsage = req.body.computeHours || 0;
          break;
        case 'projects':
          quotaLimit = userAccess.personalQuota.projects;
          currentUsage = req.body.projectCount || 0;
          break;
        case 'users':
          quotaLimit = userAccess.organizationQuota?.users || 0;
          currentUsage = req.body.userCount || 0;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type'
          });
      }

      // Check if usage would exceed quota
      if (currentUsage > quotaLimit) {
        return res.status(403).json({
          success: false,
          message: `${resourceType} quota exceeded`,
          quota: {
            limit: quotaLimit,
            current: currentUsage,
            remaining: quotaLimit - currentUsage
          },
          upgradeRequired: true
        });
      }

      // Add quota info to request
      req.userAccessLevel = {
        ...req.userAccessLevel,
        quota: {
          limit: quotaLimit,
          current: currentUsage,
          remaining: quotaLimit - currentUsage
        }
      };

      next();
    } catch (error) {
      console.error('Error in resource quota middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware to log service usage
 */
export const logServiceUsage = (serviceId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to log usage on successful responses
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logUsage(req, serviceId);
      }
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logUsage(req, serviceId);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Log service usage
 */
async function logUsage(req: Request, serviceId: string) {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    const { logServiceUsage } = await import('../services/accessControl.js');
    
    const organizationId = req.params.organizationId || req.body.organizationId || req.user?.organization;
    const usageData = {
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    };

    await logServiceUsage(userId, serviceId, organizationId, usageData);
  } catch (error) {
    console.error('Error logging service usage:', error);
  }
}

/**
 * Middleware to add user access level to all requests
 */
export const addUserAccessLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      const userAccess = await getUserAccessLevel(userId);
      req.userAccessLevel = userAccess;
    }

    next();
  } catch (error) {
    console.error('Error adding user access level:', error);
    next(); // Continue even if access level can't be determined
  }
};

/**
 * Utility function to check if user has specific permission
 */
export const hasPermission = (permissions: string[], requiredPermission: string): boolean => {
  return permissions.includes(requiredPermission) || permissions.includes('unlimited-access');
};

/**
 * Utility function to check if user is in specific tier or higher
 */
export const isTierOrHigher = (userTier: string, requiredTier: string): boolean => {
  const tierOrder = ['basic', 'professional', 'enterprise'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
};
