/**
 * Access Control Service
 * Manages user permissions based on subscription tiers and organization roles
 */

export interface SubscriptionTier {
  name: string;
  displayName: string;
  description: string;
  maxUsers: number;
  maxOrganizations: number;
  maxProjects: number;
  maxStorageGB: number;
  maxComputeHours: number;
  allowedServices: string[];
  features: string[];
  price: number;
  color: string;
}

export interface ServiceAccess {
  serviceId: string;
  serviceName: string;
  allowedTiers: string[];
  maxUsagePerMonth?: number;
  requiresApproval: boolean;
}

export interface UserAccessLevel {
  userId: string;
  subscriptionTier: string;
  organizationId?: string;
  organizationRole?: string;
  personalQuota: {
    storageGB: number;
    computeHours: number;
    projects: number;
  };
  organizationQuota?: {
    storageGB: number;
    computeHours: number;
    projects: number;
    users: number;
  };
  permissions: string[];
  restrictions: string[];
}

// Subscription Tiers Configuration
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  basic: {
    name: 'basic',
    displayName: 'Basic',
    description: 'Essential features for individual researchers',
    maxUsers: 1,
    maxOrganizations: 0,
    maxProjects: 3,
    maxStorageGB: 10,
    maxComputeHours: 50,
    allowedServices: ['data-catalog', 'basic-ai-services'],
    features: ['data-access', 'basic-analytics', 'csv-export'],
    price: 0,
    color: 'green'
  },
  professional: {
    name: 'professional',
    displayName: 'Professional',
    description: 'Advanced features for research teams',
    maxUsers: 10,
    maxOrganizations: 1,
    maxProjects: 20,
    maxStorageGB: 100,
    maxComputeHours: 500,
    allowedServices: ['data-catalog', 'ai-services', 'ml-pipeline', 'collaboration-tools'],
    features: ['data-access', 'advanced-analytics', 'team-collaboration', 'api-access', 'priority-support'],
    price: 29.99,
    color: 'blue'
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Full platform access for large organizations',
    maxUsers: -1, // Unlimited
    maxOrganizations: -1, // Unlimited
    maxProjects: -1, // Unlimited
    maxStorageGB: 1000,
    maxComputeHours: 5000,
    allowedServices: ['data-catalog', 'ai-services', 'ml-pipeline', 'collaboration-tools', 'custom-integrations', 'advanced-analytics'],
    features: ['unlimited-access', 'custom-integrations', 'dedicated-support', 'audit-logs', 'sso', 'api-access', 'white-label'],
    price: 99.99,
    color: 'purple'
  }
};

// Service Access Control Configuration
export const SERVICE_ACCESS_CONTROL: ServiceAccess[] = [
  {
    serviceId: 'data-catalog',
    serviceName: 'Data Catalog',
    allowedTiers: ['basic', 'professional', 'enterprise'],
    maxUsagePerMonth: undefined,
    requiresApproval: false
  },
  {
    serviceId: 'ai-services',
    serviceName: 'AI Services',
    allowedTiers: ['professional', 'enterprise'],
    maxUsagePerMonth: 1000, // API calls per month
    requiresApproval: false
  },
  {
    serviceId: 'ml-pipeline',
    serviceName: 'ML Pipeline',
    allowedTiers: ['professional', 'enterprise'],
    maxUsagePerMonth: 100, // Training runs per month
    requiresApproval: true
  },
  {
    serviceId: 'collaboration-tools',
    serviceName: 'Collaboration Tools',
    allowedTiers: ['professional', 'enterprise'],
    maxUsagePerMonth: undefined,
    requiresApproval: false
  },
  {
    serviceId: 'custom-integrations',
    serviceName: 'Custom Integrations',
    allowedTiers: ['enterprise'],
    maxUsagePerMonth: undefined,
    requiresApproval: true
  },
  {
    serviceId: 'advanced-analytics',
    serviceName: 'Advanced Analytics',
    allowedTiers: ['enterprise'],
    maxUsagePerMonth: undefined,
    requiresApproval: false
  }
];

/**
 * Check if user has access to a specific service
 */
export async function checkServiceAccess(
  userId: string, 
  serviceId: string, 
  organizationId?: string
): Promise<{ allowed: boolean; reason?: string; quota?: any }> {
  try {
    // Import database connection
    const { db } = await import('../database/init.js');
    
    // Get user information
    const user = await db.get(`
      SELECT u.*, o.subscription_tier as org_subscription_tier
      FROM users u
      LEFT JOIN organizations o ON u.organization = o.name
      WHERE u.id = ?
    `, [userId]);
    
    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }
    
    // Get user's subscription tier
    const userSubscriptionTier = user.subscription_tier || 'basic';
    const orgSubscriptionTier = user.org_subscription_tier;
    
    // Use organization tier if available and higher than personal tier
    const effectiveTier = getEffectiveSubscriptionTier(userSubscriptionTier, orgSubscriptionTier);
    
    // Check service access
    const serviceAccess = SERVICE_ACCESS_CONTROL.find(s => s.serviceId === serviceId);
    if (!serviceAccess) {
      return { allowed: false, reason: 'Service not found' };
    }
    
    // Check if tier allows access
    if (!serviceAccess.allowedTiers.includes(effectiveTier)) {
      return { 
        allowed: false, 
        reason: `Service requires ${getMinimumRequiredTier(serviceAccess.allowedTiers)} subscription` 
      };
    }
    
    // Check usage quotas if applicable
    if (serviceAccess.maxUsagePerMonth) {
      const currentUsage = await getServiceUsage(userId, serviceId, organizationId);
      if (currentUsage >= serviceAccess.maxUsagePerMonth) {
        return { 
          allowed: false, 
          reason: 'Monthly usage quota exceeded',
          quota: { current: currentUsage, limit: serviceAccess.maxUsagePerMonth }
        };
      }
    }
    
    // Check if approval is required
    if (serviceAccess.requiresApproval) {
      const hasApproval = await checkServiceApproval(userId, serviceId, organizationId);
      if (!hasApproval) {
        return { 
          allowed: false, 
          reason: 'Service requires admin approval' 
        };
      }
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking service access:', error);
    return { allowed: false, reason: 'Internal error' };
  }
}

/**
 * Get user's effective subscription tier (personal vs organization)
 */
function getEffectiveSubscriptionTier(personalTier: string, orgTier?: string): string {
  const tierOrder = ['basic', 'professional', 'enterprise'];
  
  if (!orgTier) return personalTier;
  
  const personalIndex = tierOrder.indexOf(personalTier);
  const orgIndex = tierOrder.indexOf(orgTier);
  
  // Return the higher tier
  return personalIndex >= orgIndex ? personalTier : orgTier;
}

/**
 * Get minimum required tier for service access
 */
function getMinimumRequiredTier(allowedTiers: string[]): string {
  const tierOrder = ['basic', 'professional', 'enterprise'];
  
  for (const tier of tierOrder) {
    if (allowedTiers.includes(tier)) {
      return SUBSCRIPTION_TIERS[tier].displayName;
    }
  }
  
  return 'Unknown';
}

/**
 * Get current service usage for user/organization
 */
async function getServiceUsage(userId: string, serviceId: string, organizationId?: string): Promise<number> {
  try {
    const { db } = await import('../database/init.js');
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const query = organizationId 
      ? `SELECT COUNT(*) as usage FROM service_usage 
         WHERE service_id = ? AND organization_id = ? AND created_at >= ?`
      : `SELECT COUNT(*) as usage FROM service_usage 
         WHERE service_id = ? AND user_id = ? AND created_at >= ?`;
    
    const params = organizationId 
      ? [serviceId, organizationId, startOfMonth.toISOString()]
      : [serviceId, userId, startOfMonth.toISOString()];
    
    const result = await db.get(query, params);
    return result?.usage || 0;
  } catch (error) {
    console.error('Error getting service usage:', error);
    return 0;
  }
}

/**
 * Check if user has approval for a service
 */
async function checkServiceApproval(userId: string, serviceId: string, organizationId?: string): Promise<boolean> {
  try {
    const { db } = await import('../database/init.js');
    
    const query = organizationId
      ? `SELECT * FROM service_approvals 
         WHERE service_id = ? AND organization_id = ? AND status = 'approved'`
      : `SELECT * FROM service_approvals 
         WHERE service_id = ? AND user_id = ? AND status = 'approved'`;
    
    const params = organizationId ? [serviceId, organizationId] : [serviceId, userId];
    const approval = await db.get(query, params);
    
    return !!approval;
  } catch (error) {
    console.error('Error checking service approval:', error);
    return false;
  }
}

/**
 * Get user's access level and permissions
 */
export async function getUserAccessLevel(userId: string): Promise<UserAccessLevel | null> {
  try {
    const { db } = await import('../database/init.js');
    
    // Get user information with organization details
    const user = await db.get(`
      SELECT u.*, o.id as organization_id, o.subscription_tier as org_subscription_tier
      FROM users u
      LEFT JOIN organizations o ON u.organization = o.name
      WHERE u.id = ?
    `, [userId]);
    
    if (!user) {
      return null;
    }
    
    const personalTier = user.subscription_tier || 'basic';
    const orgTier = user.org_subscription_tier;
    const effectiveTier = getEffectiveSubscriptionTier(personalTier, orgTier);
    
    const tierConfig = SUBSCRIPTION_TIERS[effectiveTier];
    
    // Get user's current usage
    const currentUsage = await getUserCurrentUsage(userId);
    
    // Get organization quota if applicable
    let organizationQuota;
    if (user.organization_id) {
      organizationQuota = await getOrganizationQuota(user.organization_id);
    }
    
    return {
      userId,
      subscriptionTier: effectiveTier,
      organizationId: user.organization_id,
      organizationRole: user.role,
      personalQuota: {
        storageGB: tierConfig.maxStorageGB,
        computeHours: tierConfig.maxComputeHours,
        projects: tierConfig.maxProjects
      },
      organizationQuota,
      permissions: tierConfig.features,
      restrictions: getRestrictions(effectiveTier)
    };
  } catch (error) {
    console.error('Error getting user access level:', error);
    return null;
  }
}

/**
 * Get user's current resource usage
 */
async function getUserCurrentUsage(userId: string): Promise<any> {
  try {
    const { db } = await import('../database/init.js');
    
    const usage = await db.get(`
      SELECT 
        COALESCE(SUM(used_storage_gb), 0) as storageGB,
        COALESCE(SUM(used_cpu_hours + used_gpu_hours), 0) as computeHours,
        (SELECT COUNT(*) FROM projects WHERE owner_id = ?) as projects
      FROM resource_quotas 
      WHERE user_id = ?
    `, [userId, userId]);
    
    return usage || { storageGB: 0, computeHours: 0, projects: 0 };
  } catch (error) {
    console.error('Error getting user current usage:', error);
    return { storageGB: 0, computeHours: 0, projects: 0 };
  }
}

/**
 * Get organization quota
 */
async function getOrganizationQuota(organizationId: string): Promise<any> {
  try {
    const { db } = await import('../database/init.js');
    
    const org = await db.get(`
      SELECT subscription_tier, max_users, max_storage_gb, max_compute_hours
      FROM organizations 
      WHERE id = ?
    `, [organizationId]);
    
    if (!org) return null;
    
    const tierConfig = SUBSCRIPTION_TIERS[org.subscription_tier];
    
    return {
      storageGB: org.max_storage_gb || tierConfig.maxStorageGB,
      computeHours: org.max_compute_hours || tierConfig.maxComputeHours,
      projects: tierConfig.maxProjects,
      users: org.max_users || tierConfig.maxUsers
    };
  } catch (error) {
    console.error('Error getting organization quota:', error);
    return null;
  }
}

/**
 * Get restrictions for a subscription tier
 */
function getRestrictions(tier: string): string[] {
  const restrictions = [];
  
  if (tier === 'basic') {
    restrictions.push('Limited to 3 projects', '10GB storage limit', '50 compute hours/month', 'No team collaboration');
  } else if (tier === 'professional') {
    restrictions.push('Limited to 20 projects', '100GB storage limit', '500 compute hours/month');
  }
  
  return restrictions;
}

/**
 * Log service usage
 */
export async function logServiceUsage(
  userId: string, 
  serviceId: string, 
  organizationId?: string,
  usageData?: any
): Promise<void> {
  try {
    const { db } = await import('../database/init.js');
    
    await db.run(`
      INSERT INTO service_usage (
        id, user_id, organization_id, service_id, usage_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      organizationId || null,
      serviceId,
      JSON.stringify(usageData || {}),
      new Date().toISOString()
    ]);
  } catch (error) {
    console.error('Error logging service usage:', error);
  }
}

/**
 * Request service approval
 */
export async function requestServiceApproval(
  userId: string, 
  serviceId: string, 
  organizationId?: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('../database/init.js');
    
    // Check if request already exists
    const existingRequest = await db.get(`
      SELECT * FROM service_approvals 
      WHERE service_id = ? AND user_id = ? AND organization_id = ? AND status = 'pending'
    `, [serviceId, userId, organizationId || null]);
    
    if (existingRequest) {
      return { success: false, message: 'Approval request already pending' };
    }
    
    // Create new approval request
    await db.run(`
      INSERT INTO service_approvals (
        id, user_id, organization_id, service_id, reason, status, requested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      organizationId || null,
      serviceId,
      reason || 'Service access requested',
      'pending',
      new Date().toISOString()
    ]);
    
    return { success: true, message: 'Approval request submitted successfully' };
  } catch (error) {
    console.error('Error requesting service approval:', error);
    return { success: false, message: 'Failed to submit approval request' };
  }
}
