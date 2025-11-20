// Auth utilities for role-based routing and access control

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string; // Now supports all 12 roles
  roleType?: 'system' | 'organization' | 'project' | 'research';
  organization?: string;
  organization_id?: string;
  organization_role?: string;
  project_role?: string;
  subscription?: string;
  subscription_tier?: string;
  status?: 'active' | 'pending' | 'suspended';
  permissions?: Record<string, boolean>;
  uiAccess?: string[];
  apiAccess?: string[];
}

export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    // System-level roles
    case 'super_admin':
    case 'platform_admin':
      return '/admin'; // Full system administration via Admin Console
    
    // Organization-level roles
    case 'org_owner':
    case 'org_admin':
    case 'org_manager':
      return '/admin'; // Organization management via Admin Console
    
    // Project-level roles
    case 'project_owner':
    case 'project_lead':
      return '/collaborations'; // Project management and collaboration
    
    // Research-level roles
    case 'senior_researcher':
    case 'researcher':
      return '/'; // Personal home with research tools
    case 'student':
      return '/student-dashboard'; // Educational dashboard
    
    // Project participation roles
    case 'contributor':
    case 'viewer':
      return '/'; // Project workspace access
    
    default:
      return '/';
  }
};

export const canAccessService = (
  serviceId: string, 
  userRole: string, 
  userSubscription: string = 'enterprise'
): boolean => {
  // Super admin has access to everything
  if (userRole === 'super_admin') {
    return true;
  }

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
    'ai-services': { 
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
  if (!permission) return false;

  // Check role requirement
  if (!permission.roles.includes(userRole)) {
    return false;
  }

  // If no subscription requirements, role check is sufficient
  if (!permission.subscriptions) {
    return true;
  }

  // Check subscription requirement - default to enterprise if not provided
  const subscription = userSubscription || 'enterprise';
  if (!permission.subscriptions.includes(subscription)) {
    return false;
  }

  return true;
};

export const getServiceAccessLevel = (
  serviceId: string, 
  userRole: string, 
  userSubscription: string = 'individual'
): 'full' | 'limited' | 'read-only' | 'none' => {
  if (!canAccessService(serviceId, userRole, userSubscription)) {
    return 'none';
  }

  // Define access levels based on role and service
  const accessLevels: Record<string, Record<string, string>> = {
    'data-catalog': {
      'super_admin': 'full',
      'research_admin': 'full',
      'researcher': 'full',
      'viewer': 'read-only'
    },
    'experiment-management': {
      'super_admin': 'full',
      'research_admin': 'full',
      'researcher': 'full'
    },
    'llm-management': {
      'super_admin': 'full',
      'research_admin': 'full',
      'researcher': 'limited'
    },
    'ai-chatbot': {
      'super_admin': 'full',
      'research_admin': 'full',
      'researcher': 'full',
      'viewer': 'read-only'
    },
    'governance': {
      'super_admin': 'full',
      'research_admin': 'limited'
    },
    'analytics': {
      'super_admin': 'full',
      'research_admin': 'full',
      'researcher': 'limited'
    }
  };

  return (accessLevels[serviceId]?.[userRole] as 'full' | 'limited' | 'read-only') || 'none';
};


export const getRoleDescription = (role: string): string => {
  switch (role) {
    case 'super_admin': 
      return 'Full system access, user management, and platform administration';
    case 'research_admin': 
      return 'Organization management, team oversight, and resource allocation';
    case 'researcher': 
      return 'Full access to research tools, projects, and data';
    case 'viewer': 
      return 'Read-only access to assigned projects and data';
    default: 
      return 'Limited access to platform features';
  }
};

export const getSubscriptionDisplayName = (subscription: string): string => {
  switch (subscription) {
    case 'individual': return 'Individual Plan';
    case 'research_team': return 'Research Team Plan';
    case 'enterprise': return 'Enterprise Plan';
    default: return subscription;
  }
};

export const getSubscriptionFeatures = (subscription: string): string[] => {
  switch (subscription) {
    case 'individual':
      return [
        'Basic data access',
        'Limited AI tools',
        'Personal projects',
        'Community support'
      ];
    case 'research_team':
      return [
        'Full data access',
        'Advanced AI tools',
        'Team collaboration',
        'Experiment management',
        'Priority support'
      ];
    case 'enterprise':
      return [
        'Unlimited access',
        'All AI tools',
        'Organization management',
        'Custom integrations',
        'Dedicated support',
        'Governance features'
      ];
    default:
      return [];
  }
};

// New comprehensive role-based access control functions
export const hasPermission = (user: User, permission: string): boolean => {
  if (!user.permissions) return false;
  return user.permissions[permission] === true;
};

export const hasUIAccess = (user: User, uiComponent: string): boolean => {
  if (!user.uiAccess) return false;
  return user.uiAccess.includes(uiComponent) || user.uiAccess.includes('*');
};

export const hasAPIAccess = (user: User, apiEndpoint: string): boolean => {
  if (!user.apiAccess) return false;
  return user.apiAccess.includes('*') || 
         user.apiAccess.some(pattern => apiEndpoint.startsWith(pattern));
};

export const checkSubscriptionAccess = (user: User, requiredTier: string): boolean => {
  const tierLevels = { 'basic': 1, 'academic': 2, 'professional': 3, 'enterprise': 4 };
  const userTier = tierLevels[user.subscription_tier as keyof typeof tierLevels] || 0;
  const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0;
  
  return userTier >= requiredLevel;
};

export const isSystemAdmin = (user: User): boolean => {
  return user.roleType === 'system' || user.role === 'super_admin' || user.role === 'platform_admin';
};

export const isOrganizationAdmin = (user: User): boolean => {
  return user.roleType === 'organization' || 
         ['org_owner', 'org_admin', 'org_manager'].includes(user.role);
};

export const isProjectAdmin = (user: User): boolean => {
  return user.roleType === 'project' || 
         ['project_owner', 'project_lead'].includes(user.role);
};

export const isResearcher = (user: User): boolean => {
  return user.roleType === 'research' || 
         ['senior_researcher', 'researcher', 'student'].includes(user.role);
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    'super_admin': 'Super Administrator',
    'platform_admin': 'Platform Administrator',
    'org_owner': 'Organization Owner',
    'org_admin': 'Organization Administrator',
    'org_manager': 'Organization Manager',
    'project_owner': 'Project Owner',
    'project_lead': 'Project Lead',
    'senior_researcher': 'Senior Researcher',
    'researcher': 'Researcher',
    'student': 'Student',
    'contributor': 'Contributor',
    'viewer': 'Viewer'
  };
  return roleNames[role] || role;
};

export const getRoleTypeDisplayName = (roleType: string): string => {
  const typeNames: Record<string, string> = {
    'system': 'System Level',
    'organization': 'Organization Level',
    'project': 'Project Level',
    'research': 'Research Level'
  };
  return typeNames[roleType] || roleType;
};