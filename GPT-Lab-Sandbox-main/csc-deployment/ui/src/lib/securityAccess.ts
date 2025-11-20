/**
 * Security Dashboard Access Control
 * Implements role-based security dashboard filtering following industry standards
 */

export interface SecurityAccessLevel {
  level: 'full_soc' | 'operational_soc' | 'org_specific' | 'personal' | 'compliance_only';
  dashboards: string[];
  dataAccess: 'global' | 'security_only' | 'organization_only' | 'self_only' | 'compliance_only';
  canViewThreats: boolean;
  canViewIncidents: boolean;
  canViewCompliance: boolean;
  canViewCrossOrg: boolean;
  canManageSecurity: boolean;
}

export interface SecurityDashboardConfig {
  showExecutiveView: boolean;
  showOperationalView: boolean;
  showThreatIntelligence: boolean;
  showGlobalIncidents: boolean;
  showCrossOrgAnalytics: boolean;
  showComplianceDetails: boolean;
  showSecurityBudget: boolean;
  showPersonalSecurity: boolean;
  allowSecurityActions: boolean;
  allowIncidentManagement: boolean;
}

/**
 * Get security access level based on user role
 */
export const getSecurityAccessLevel = (userRole: string): SecurityAccessLevel => {
  switch (userRole) {
    case 'super_admin':
      return {
        level: 'full_soc',
        dashboards: ['executive', 'operational', 'compliance', 'strategic'],
        dataAccess: 'global',
        canViewThreats: true,
        canViewIncidents: true,
        canViewCompliance: true,
        canViewCrossOrg: true,
        canManageSecurity: true
      };
      
    case 'security_admin':
      return {
        level: 'operational_soc',
        dashboards: ['operational', 'technical'],
        dataAccess: 'security_only',
        canViewThreats: true,
        canViewIncidents: true,
        canViewCompliance: false,
        canViewCrossOrg: true,
        canManageSecurity: true
      };
      
    case 'research_admin':
      return {
        level: 'org_specific',
        dashboards: ['organizational', 'compliance'],
        dataAccess: 'organization_only',
        canViewThreats: false,
        canViewIncidents: false,
        canViewCompliance: true,
        canViewCrossOrg: false,
        canManageSecurity: false
      };
      
    case 'researcher':
      return {
        level: 'personal',
        dashboards: ['personal_security'],
        dataAccess: 'self_only',
        canViewThreats: false,
        canViewIncidents: false,
        canViewCompliance: false,
        canViewCrossOrg: false,
        canManageSecurity: false
      };
      
    case 'compliance_officer':
      return {
        level: 'compliance_only',
        dashboards: ['compliance', 'audit'],
        dataAccess: 'compliance_only',
        canViewThreats: false,
        canViewIncidents: false,
        canViewCompliance: true,
        canViewCrossOrg: true,
        canManageSecurity: false
      };
      
    default:
      return {
        level: 'personal',
        dashboards: ['personal_security'],
        dataAccess: 'self_only',
        canViewThreats: false,
        canViewIncidents: false,
        canViewCompliance: false,
        canViewCrossOrg: false,
        canManageSecurity: false
      };
  }
};

/**
 * Get dashboard configuration based on access level
 */
export const getSecurityDashboardConfig = (accessLevel: SecurityAccessLevel): SecurityDashboardConfig => {
  return {
    showExecutiveView: accessLevel.level === 'full_soc',
    showOperationalView: ['full_soc', 'operational_soc'].includes(accessLevel.level),
    showThreatIntelligence: accessLevel.canViewThreats,
    showGlobalIncidents: accessLevel.canViewIncidents,
    showCrossOrgAnalytics: accessLevel.canViewCrossOrg,
    showComplianceDetails: accessLevel.canViewCompliance,
    showSecurityBudget: accessLevel.level === 'full_soc',
    showPersonalSecurity: true, // Everyone gets personal security view
    allowSecurityActions: accessLevel.canManageSecurity,
    allowIncidentManagement: accessLevel.canManageSecurity
  };
};

/**
 * Filter security data based on user access level
 */
export const filterSecurityData = (data: any, accessLevel: SecurityAccessLevel, userId?: string, organizationId?: string) => {
  if (!data) return data;
  
  switch (accessLevel.dataAccess) {
    case 'global':
      // Super admin sees everything
      return data;
      
    case 'security_only':
      // Security admin sees technical data only (no business metrics)
      return {
        ...data,
        budget_metrics: undefined,
        business_impact: undefined,
        executive_summary: undefined
      };
      
    case 'organization_only':
      // Org admin sees only their organization's data
      return {
        ...data,
        incidents: data.incidents?.filter((incident: any) => 
          incident.organization_id === organizationId
        ),
        events: data.events?.filter((event: any) => 
          event.organization_id === organizationId
        ),
        users: data.users?.filter((user: any) => 
          user.organization_id === organizationId
        )
      };
      
    case 'self_only':
      // Researcher sees only their own data
      return {
        ...data,
        incidents: data.incidents?.filter((incident: any) => 
          incident.user_id === userId
        ),
        events: data.events?.filter((event: any) => 
          event.user_id === userId
        ),
        personal_security: data.personal_security
      };
      
    case 'compliance_only':
      // Compliance officer sees only compliance-related data
      return {
        compliance_status: data.compliance_status,
        audit_logs: data.audit_logs,
        regulatory_reports: data.regulatory_reports,
        policy_violations: data.policy_violations
      };
      
    default:
      return {};
  }
};

/**
 * Check if user can access specific security feature
 */
export const canAccessSecurityFeature = (feature: string, userRole: string): boolean => {
  const accessLevel = getSecurityAccessLevel(userRole);
  
  const featurePermissions: Record<string, string[]> = {
    'global_threat_map': ['full_soc', 'operational_soc'],
    'cross_org_analytics': ['full_soc'],
    'incident_management': ['full_soc', 'operational_soc'],
    'security_budget': ['full_soc'],
    'compliance_reports': ['full_soc', 'compliance_only'],
    'personal_security': ['full_soc', 'operational_soc', 'org_specific', 'personal'],
    'org_security': ['full_soc', 'org_specific'],
    'threat_intelligence': ['full_soc', 'operational_soc'],
    'vulnerability_management': ['full_soc', 'operational_soc'],
    'audit_logs': ['full_soc', 'compliance_only']
  };
  
  return featurePermissions[feature]?.includes(accessLevel.level) || false;
};
