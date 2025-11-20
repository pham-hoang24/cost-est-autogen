import { Request, Response, NextFunction } from 'express';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  organization?: string;
  subscription_tier?: string;
  created_at: string;
  updated_at: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Service access control middleware
export const checkServiceAccess = (serviceId: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Define service permissions
    const servicePermissions: Record<string, { roles: string[], subscriptions?: string[] }> = {
      'data-catalog': { 
        roles: ['super_admin', 'research_admin', 'researcher', 'viewer'],
        subscriptions: ['individual', 'research_team', 'enterprise']
      },
      'experiment-management': { 
        roles: ['super_admin', 'research_admin', 'researcher'],
        subscriptions: ['research_team', 'enterprise']
      },
      'llm-management': { 
        roles: ['super_admin', 'research_admin', 'researcher'],
        subscriptions: ['research_team', 'enterprise']
      },
      'ai-chatbot': { 
        roles: ['super_admin', 'research_admin', 'researcher', 'viewer'],
        subscriptions: ['individual', 'research_team', 'enterprise']
      },
      'governance': { 
        roles: ['super_admin', 'research_admin']
      },
      'user-management': { 
        roles: ['super_admin', 'research_admin']
      },
      'organization-management': { 
        roles: ['super_admin', 'research_admin']
      },
      'analytics': { 
        roles: ['super_admin', 'research_admin', 'researcher'],
        subscriptions: ['research_team', 'enterprise']
      },
      'system-settings': { 
        roles: ['super_admin']
      }
    };

    const permission = servicePermissions[serviceId];
    if (!permission) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check role requirement
    if (!permission.roles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRole: permission.roles,
        userRole: user.role
      });
    }

    // Check subscription requirement
    if (permission.subscriptions && user.subscription_tier && !permission.subscriptions.includes(user.subscription_tier)) {
      return res.status(403).json({ 
        error: 'Subscription upgrade required',
        requiredSubscription: permission.subscriptions,
        userSubscription: user.subscription_tier
      });
    }

    next();
  };
};

// Resource quota checking middleware
export const checkResourceQuota = (resourceType: 'cpu' | 'memory' | 'storage') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // In a real implementation, you would check the user's current usage
      // against their quota limits from the database
      
      // For now, we'll just log the check
      console.log(`Checking ${resourceType} quota for user ${user.email}`);
      
      // Mock quota check - in production, this would query the database
      const hasQuota = true; // Replace with actual quota check
      
      if (!hasQuota) {
        return res.status(429).json({ 
          error: 'Resource quota exceeded',
          resourceType,
          message: 'Please upgrade your plan or contact administrator'
        });
      }

      next();
    } catch (error) {
      console.error('Quota check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Organization access control
export const checkOrganizationAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const organizationId = req.params.organizationId || req.body.organizationId;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Super admins can access all organizations
  if (user.role === 'super_admin') {
    return next();
  }

  // Research admins can only access their own organization
  if (user.role === 'research_admin') {
    // In production, you would check if the user belongs to this organization
    // For now, we'll allow access
    return next();
  }

  // Other roles cannot access organization management
  return res.status(403).json({ 
    error: 'Organization access denied',
    requiredRole: ['super_admin', 'research_admin']
  });
};

// Audit logging middleware
export const logServiceAccess = (serviceId: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (user) {
      console.log(`Service access: ${user.email} (${user.role}) accessed ${serviceId}`);
      
      // In production, you would log this to an audit database
      // Example: await auditLog.create({
      //   userId: user.id,
      //   action: 'service_access',
      //   serviceId,
      //   timestamp: new Date(),
      //   ipAddress: req.ip,
      //   userAgent: req.get('User-Agent')
      // });
    }
    
    next();
  };
};
