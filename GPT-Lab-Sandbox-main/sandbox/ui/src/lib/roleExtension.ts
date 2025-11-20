/**
 * SW4E Role System Extension - Safe Frontend Utilities
 * This extends the existing system WITHOUT breaking changes
 */

import { User } from './auth';

// Extended user interface (additive only)
export interface ExtendedUser extends User {
  // Existing fields remain unchanged
  id: string;
  email: string;
  role: string; // Now supports all new roles
  // ... existing fields ...
  
  // New optional fields (backward compatible)
  roleType?: 'system' | 'organization' | 'project' | 'research';
  accessLevel?: 'super_admin' | 'org_admin' | 'manager' | 'professional' | 'support' | 'guest';
  displayName?: string;
  category?: string;
  permissions?: Record<string, boolean>;
  preferences?: UserPreferences;
}

// User preferences interface
export interface UserPreferences {
  basic_preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'fi' | 'sv' | 'de' | 'fr';
    notifications: {
      email: boolean;
      inApp: boolean;
      sms: boolean;
    };
    dashboard: {
      layout: 'compact' | 'expanded' | 'custom';
      widgets: string[];
    };
  };
  role_specific_preferences: Record<string, any>;
  advanced_customizations: Record<string, any>;
}

// Role information interface
export interface RoleInfo {
  role_id: string;
  display_name: string;
  category: string;
  access_level: string;
  description: string;
  permissions: string[];
}

// Role categories
export const ROLE_CATEGORIES = {
  INSTITUTIONAL: 'institutional',
  CORPORATE: 'corporate',
  RESEARCH: 'research',
  TECHNICAL: 'technical',
  ADMINISTRATIVE: 'administrative',
  EXTERNAL: 'external'
} as const;

// Access levels
export const ACCESS_LEVELS = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  MANAGER: 'manager',
  PROFESSIONAL: 'professional',
  SUPPORT: 'support',
  GUEST: 'guest'
} as const;

// Role display names (NEW - doesn't affect existing)
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    // Existing roles (maintain compatibility)
    'super_admin': 'Super Administrator',
    'research_admin': 'Research Administrator',
    'researcher': 'Researcher',
    'viewer': 'Viewer',
    
    // University roles
    'university_admin': 'University Administrator',
    'university_coordinator': 'Research Coordinator',
    'university_faculty': 'Faculty Member',
    'university_researcher': 'University Researcher',
    'university_student': 'Graduate Student',
    
    // Corporate roles
    'corporate_admin': 'Corporate Administrator',
    'corporate_manager': 'R&D Manager',
    'corporate_researcher': 'Corporate Researcher',
    'corporate_analyst': 'Data Analyst',
    'corporate_intern': 'Research Intern',
    
    // Individual roles
    'independent_researcher': 'Independent Researcher',
    'consultant': 'Research Consultant',
    'postdoc': 'Postdoctoral Researcher',
    'visiting_scholar': 'Visiting Scholar',
    
    // Technical roles
    'data_scientist': 'Data Scientist',
    'ml_engineer': 'ML Engineer',
    'ai_researcher': 'AI Researcher',
    'security_analyst': 'Security Analyst',
    
    // Platform roles
    'platform_moderator': 'Platform Moderator',
    'platform_support': 'Platform Support',
    'platform_auditor': 'Platform Auditor',
    
    // External roles
    'government_official': 'Government Official',
    'regulatory_officer': 'Regulatory Officer',
    'funding_agency': 'Funding Agency',
    'industry_partner': 'Industry Partner'
  };
  
  return roleNames[role] || role;
};

// Role categories (NEW - doesn't affect existing)
export const getRoleCategory = (role: string): string => {
  const roleCategories: Record<string, string> = {
    // Existing roles
    'super_admin': 'administrative',
    'research_admin': 'administrative',
    'researcher': 'research',
    'viewer': 'research',
    
    // University roles
    'university_admin': 'institutional',
    'university_coordinator': 'institutional',
    'university_faculty': 'institutional',
    'university_researcher': 'institutional',
    'university_student': 'institutional',
    
    // Corporate roles
    'corporate_admin': 'corporate',
    'corporate_manager': 'corporate',
    'corporate_researcher': 'corporate',
    'corporate_analyst': 'corporate',
    'corporate_intern': 'corporate',
    
    // Individual roles
    'independent_researcher': 'research',
    'consultant': 'research',
    'postdoc': 'research',
    'visiting_scholar': 'research',
    
    // Technical roles
    'data_scientist': 'technical',
    'ml_engineer': 'technical',
    'ai_researcher': 'technical',
    'security_analyst': 'technical',
    
    // Platform roles
    'platform_moderator': 'administrative',
    'platform_support': 'administrative',
    'platform_auditor': 'administrative',
    
    // External roles
    'government_official': 'external',
    'regulatory_officer': 'external',
    'funding_agency': 'external',
    'industry_partner': 'external'
  };
  
  return roleCategories[role] || 'research';
};

// Access levels (NEW - doesn't affect existing)
export const getAccessLevel = (role: string): string => {
  const accessLevels: Record<string, string> = {
    // Existing roles
    'super_admin': 'super_admin',
    'research_admin': 'org_admin',
    'researcher': 'professional',
    'viewer': 'support',
    
    // University roles
    'university_admin': 'org_admin',
    'university_coordinator': 'manager',
    'university_faculty': 'professional',
    'university_researcher': 'professional',
    'university_student': 'support',
    
    // Corporate roles
    'corporate_admin': 'org_admin',
    'corporate_manager': 'manager',
    'corporate_researcher': 'professional',
    'corporate_analyst': 'support',
    'corporate_intern': 'support',
    
    // Individual roles
    'independent_researcher': 'professional',
    'consultant': 'professional',
    'postdoc': 'professional',
    'visiting_scholar': 'guest',
    
    // Technical roles
    'data_scientist': 'professional',
    'ml_engineer': 'professional',
    'ai_researcher': 'professional',
    'security_analyst': 'professional',
    
    // Platform roles
    'platform_moderator': 'support',
    'platform_support': 'support',
    'platform_auditor': 'support',
    
    // External roles
    'government_official': 'guest',
    'regulatory_officer': 'guest',
    'funding_agency': 'guest',
    'industry_partner': 'guest'
  };
  
  return accessLevels[role] || 'support';
};

// Extended default route function (EXTENDS existing - doesn't break)
export const getDefaultRouteForRole = (role: string): string => {
  // EXISTING LOGIC UNCHANGED - just supports more roles now
  const roleRoutes: Record<string, string> = {
    // Existing routes (maintain compatibility)
    'super_admin': '/admin',
    'research_admin': '/admin', 
    'researcher': '/dashboard',
    'viewer': '/dashboard',
    
    // NEW ROLES ADDED (additive only)
    // University routes
    'university_admin': '/admin',
    'university_coordinator': '/projects',
    'university_faculty': '/dashboard',
    'university_researcher': '/dashboard',
    'university_student': '/dashboard',
    
    // Corporate routes
    'corporate_admin': '/admin',
    'corporate_manager': '/projects',
    'corporate_researcher': '/dashboard',
    'corporate_analyst': '/dashboard',
    'corporate_intern': '/dashboard',
    
    // Individual routes
    'independent_researcher': '/dashboard',
    'consultant': '/dashboard',
    'postdoc': '/dashboard',
    'visiting_scholar': '/dashboard',
    
    // Technical routes
    'data_scientist': '/dashboard',
    'ml_engineer': '/dashboard',
    'ai_researcher': '/dashboard',
    'security_analyst': '/dashboard',
    
    // Platform routes
    'platform_moderator': '/admin',
    'platform_support': '/admin',
    'platform_auditor': '/admin',
    
    // External routes
    'government_official': '/dashboard',
    'regulatory_officer': '/dashboard',
    'funding_agency': '/dashboard',
    'industry_partner': '/dashboard'
  };
  
  return roleRoutes[role] || '/dashboard';
};

// Role-based feature access (NEW - doesn't affect existing)
export const hasFeatureAccess = (user: User, feature: string): boolean => {
  const featureAccess: Record<string, string[]> = {
    'ai_services': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher'],
    'data_preprocessing': ['super_admin', 'research_admin', 'researcher', 'university_faculty', 'university_researcher', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher'],
    'security_scanner': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin', 'security_analyst', 'platform_auditor'],
    'compliance_auditor': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin', 'security_analyst', 'platform_auditor', 'regulatory_officer'],
    'admin_dashboard': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin', 'platform_moderator', 'platform_support', 'platform_auditor'],
    'user_management': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin'],
    'project_management': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher'],
    'collaboration_tools': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher', 'consultant', 'postdoc'],
    'hardware_requests': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher'],
    'analytics': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher']
  };
  
  const allowedRoles = featureAccess[feature] || [];
  return allowedRoles.includes(user.role);
};

// Role-based navigation (NEW - doesn't affect existing)
export const getNavigationForRole = (user: User): Array<{label: string, href: string, icon?: string}> => {
  const baseNavigation = [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Projects', href: '/projects', icon: 'Folder' },
    { label: 'AI Services', href: '/ai-services', icon: 'Brain' }
  ];

  const roleNavigation: Record<string, Array<{label: string, href: string, icon?: string}>> = {
    'super_admin': [
      ...baseNavigation,
      { label: 'Admin', href: '/admin', icon: 'Settings' },
      { label: 'Users', href: '/admin/users', icon: 'Users' },
      { label: 'Organizations', href: '/admin/organizations', icon: 'Building' }
    ],
    'research_admin': [
      ...baseNavigation,
      { label: 'Admin', href: '/admin', icon: 'Settings' },
      { label: 'Users', href: '/admin/users', icon: 'Users' }
    ],
    'university_admin': [
      ...baseNavigation,
      { label: 'Admin', href: '/admin', icon: 'Settings' },
      { label: 'Users', href: '/admin/users', icon: 'Users' },
      { label: 'Students', href: '/admin/students', icon: 'GraduationCap' }
    ],
    'corporate_admin': [
      ...baseNavigation,
      { label: 'Admin', href: '/admin', icon: 'Settings' },
      { label: 'Users', href: '/admin/users', icon: 'Users' },
      { label: 'Security', href: '/admin/security', icon: 'Shield' }
    ],
    'university_coordinator': [
      ...baseNavigation,
      { label: 'Team', href: '/team', icon: 'Users' },
      { label: 'Resources', href: '/resources', icon: 'Database' }
    ],
    'corporate_manager': [
      ...baseNavigation,
      { label: 'Team', href: '/team', icon: 'Users' },
      { label: 'Resources', href: '/resources', icon: 'Database' }
    ]
  };

  return roleNavigation[user.role] || baseNavigation;
};

// Role-based permissions (NEW - doesn't affect existing)
export const getPermissionsForRole = (role: string): string[] => {
  const rolePermissions: Record<string, string[]> = {
    'super_admin': ['*'], // All permissions
    'research_admin': ['user_management', 'organization_management', 'project_management', 'ai_services', 'analytics'],
    'researcher': ['project_management', 'ai_services', 'data_preprocessing', 'collaboration_tools', 'hardware_requests'],
    'viewer': ['project_read', 'basic_ai_services'],
    
    // University roles
    'university_admin': ['user_management', 'organization_management', 'project_management', 'ai_services', 'student_management'],
    'university_coordinator': ['team_management', 'project_coordination', 'resource_requests', 'collaboration_oversight'],
    'university_faculty': ['ai_services', 'data_processing', 'student_mentorship', 'publication_management'],
    'university_researcher': ['ai_services', 'data_analysis', 'collaboration_tools', 'research_execution'],
    'university_student': ['basic_ai_services', 'learning_resources', 'mentorship_access', 'limited_data_processing'],
    
    // Corporate roles
    'corporate_admin': ['user_management', 'compliance_oversight', 'security_management', 'resource_planning'],
    'corporate_manager': ['team_oversight', 'project_coordination', 'resource_allocation', 'compliance_monitoring'],
    'corporate_researcher': ['ai_services', 'security_tools', 'compliance_auditor', 'research_execution'],
    'corporate_analyst': ['data_analysis_tools', 'basic_ai_services', 'reporting', 'business_intelligence'],
    'corporate_intern': ['learning_resources', 'supervised_research', 'basic_tools_access'],
    
    // Individual roles
    'independent_researcher': ['ai_services', 'data_processing', 'collaboration_tools', 'publication_management', 'funding_requests'],
    'consultant': ['project_based_access', 'collaboration_tools', 'specialized_expertise'],
    'postdoc': ['advanced_research_capabilities', 'mentorship', 'collaboration', 'publication'],
    'visiting_scholar': ['limited_research_access', 'collaboration_viewing', 'temporary_projects'],
    
    // Technical roles
    'data_scientist': ['advanced_analytics', 'ml_modeling', 'data_engineering', 'experiment_tools'],
    'ml_engineer': ['ai_model_development', 'ml_pipelines', 'advanced_ai_services', 'model_deployment'],
    'ai_researcher': ['cutting_edge_ai_research', 'advanced_algorithms', 'research_collaboration'],
    'security_analyst': ['security_tools', 'compliance_auditing', 'risk_assessment', 'security_monitoring'],
    
    // Platform roles
    'platform_moderator': ['content_moderation', 'user_support', 'community_management'],
    'platform_support': ['user_assistance', 'technical_support', 'issue_resolution'],
    'platform_auditor': ['compliance_auditing', 'security_assessment', 'audit_reporting'],
    
    // External roles
    'government_official': ['policy_oversight', 'compliance_monitoring', 'regulatory_access'],
    'regulatory_officer': ['compliance_oversight', 'regulatory_reporting', 'audit_access'],
    'funding_agency': ['funding_oversight', 'project_monitoring', 'grant_management'],
    'industry_partner': ['collaboration_access', 'project_participation', 'limited_platform_access']
  };
  
  return rolePermissions[role] || [];
};

// Role-based UI access (NEW - doesn't affect existing)
export const canAccessUI = (user: User, uiElement: string): boolean => {
  const uiAccess: Record<string, string[]> = {
    'admin_dashboard': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin', 'platform_moderator', 'platform_support', 'platform_auditor'],
    'user_management': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin'],
    'organization_management': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin'],
    'project_management': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher'],
    'ai_services': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher'],
    'collaboration_tools': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher', 'consultant', 'postdoc'],
    'hardware_requests': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher'],
    'analytics': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_coordinator', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_manager', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher']
  };
  
  const allowedRoles = uiAccess[uiElement] || [];
  return allowedRoles.includes(user.role);
};

// Role-based service access (NEW - doesn't affect existing)
export const canAccessService = (user: User, serviceId: string): boolean => {
  const serviceAccess: Record<string, string[]> = {
    'anomaly_detection': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher'],
    'security_scanner': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin', 'security_analyst', 'platform_auditor'],
    'compliance_auditor': ['super_admin', 'research_admin', 'university_admin', 'corporate_admin', 'security_analyst', 'platform_auditor', 'regulatory_officer'],
    'data_preprocessing': ['super_admin', 'research_admin', 'researcher', 'university_admin', 'university_faculty', 'university_researcher', 'corporate_admin', 'corporate_researcher', 'independent_researcher', 'data_scientist', 'ml_engineer', 'ai_researcher']
  };
  
  const allowedRoles = serviceAccess[serviceId] || [];
  return allowedRoles.includes(user.role);
};

// Role-based organization access (NEW - doesn't affect existing)
export const canAccessOrganization = (user: User, organizationId: string): boolean => {
  // Super admins can access all organizations
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Research admins can access their own organization
  if (user.role === 'research_admin' && user.organization_id === organizationId) {
    return true;
  }
  
  // University admins can access their own organization
  if (user.role === 'university_admin' && user.organization_id === organizationId) {
    return true;
  }
  
  // Corporate admins can access their own organization
  if (user.role === 'corporate_admin' && user.organization_id === organizationId) {
    return true;
  }
  
  return false;
};

// Role-based project access (NEW - doesn't affect existing)
export const canAccessProject = (user: User, projectId: string): boolean => {
  // Super admins can access all projects
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Research admins can access projects in their organization
  if (user.role === 'research_admin') {
    return true; // TODO: Check organization membership
  }
  
  // Researchers can access their own projects
  if (user.role === 'researcher') {
    return true; // TODO: Check project ownership/membership
  }
  
  // University roles can access projects in their organization
  if (['university_admin', 'university_coordinator', 'university_faculty', 'university_researcher'].includes(user.role)) {
    return true; // TODO: Check organization membership
  }
  
  // Corporate roles can access projects in their organization
  if (['corporate_admin', 'corporate_manager', 'corporate_researcher'].includes(user.role)) {
    return true; // TODO: Check organization membership
  }
  
  // Individual researchers can access their own projects
  if (['independent_researcher', 'consultant', 'postdoc'].includes(user.role)) {
    return true; // TODO: Check project ownership/membership
  }
  
  return false;
};
