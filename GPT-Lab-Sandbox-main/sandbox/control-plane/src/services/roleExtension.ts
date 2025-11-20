/**
 * SW4E Role System Extension - Safe Backend Services
 * This extends the existing system WITHOUT breaking changes
 */

import { db } from '../database/init.js';

// Types for role extension (additive only)
export interface RoleHierarchy {
  role_id: string;
  parent_role: string | null;
  access_level: 'super_admin' | 'org_admin' | 'manager' | 'professional' | 'support' | 'guest';
  category: 'institutional' | 'corporate' | 'research' | 'technical' | 'administrative' | 'external';
  inherits_from: string[];
  description: string;
}

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

export interface PermissionOverride {
  id: string;
  user_id: string;
  permission_id: string;
  action: 'add' | 'remove' | 'modify';
  conditions: Record<string, any>;
  expires_at: Date | null;
  approved_by: string | null;
  reason: string | null;
}

// Role hierarchy management (NEW - doesn't affect existing)
export const getRoleHierarchy = async (role: string): Promise<RoleHierarchy | null> => {
  try {
    const roleData = await db.get(
      'SELECT * FROM role_hierarchy WHERE role_id = ?',
      [role]
    );
    
    if (!roleData) return null;
    
    return {
      role_id: roleData.role_id,
      parent_role: roleData.parent_role,
      access_level: roleData.access_level,
      category: roleData.category,
      inherits_from: JSON.parse(roleData.inherits_from || '[]'),
      description: roleData.description
    };
  } catch (error) {
    console.error('Error getting role hierarchy:', error);
    return null;
  }
};

export const getAllRoles = async (): Promise<RoleHierarchy[]> => {
  try {
    const roles = await db.all('SELECT * FROM role_hierarchy ORDER BY category, access_level');
    
    return roles.map(role => ({
      role_id: role.role_id,
      parent_role: role.parent_role,
      access_level: role.access_level,
      category: role.category,
      inherits_from: JSON.parse(role.inherits_from || '[]'),
      description: role.description
    }));
  } catch (error) {
    console.error('Error getting all roles:', error);
    return [];
  }
};

export const getRolesByCategory = async (category: string): Promise<RoleHierarchy[]> => {
  try {
    const roles = await db.all(
      'SELECT * FROM role_hierarchy WHERE category = ? ORDER BY access_level',
      [category]
    );
    
    return roles.map(role => ({
      role_id: role.role_id,
      parent_role: role.parent_role,
      access_level: role.access_level,
      category: role.category,
      inherits_from: JSON.parse(role.inherits_from || '[]'),
      description: role.description
    }));
  } catch (error) {
    console.error('Error getting roles by category:', error);
    return [];
  }
};

// User preferences management (NEW - doesn't affect existing)
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const preferences = await db.get(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    if (!preferences) return null;
    
    return {
      basic_preferences: JSON.parse(preferences.basic_preferences || '{}'),
      role_specific_preferences: JSON.parse(preferences.role_specific_preferences || '{}'),
      advanced_customizations: JSON.parse(preferences.advanced_customizations || '{}')
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<UserPreferences>
): Promise<boolean> => {
  try {
    const existing = await getUserPreferences(userId);
    if (!existing) {
      // Create new preferences
      await db.run(
        `INSERT INTO user_preferences (user_id, basic_preferences, role_specific_preferences, advanced_customizations)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          JSON.stringify(preferences.basic_preferences || {}),
          JSON.stringify(preferences.role_specific_preferences || {}),
          JSON.stringify(preferences.advanced_customizations || {})
        ]
      );
    } else {
      // Update existing preferences
      const updated = {
        basic_preferences: { ...existing.basic_preferences, ...preferences.basic_preferences },
        role_specific_preferences: { ...existing.role_specific_preferences, ...preferences.role_specific_preferences },
        advanced_customizations: { ...existing.advanced_customizations, ...preferences.advanced_customizations }
      };
      
      await db.run(
        `UPDATE user_preferences 
         SET basic_preferences = ?, role_specific_preferences = ?, advanced_customizations = ?
         WHERE user_id = ?`,
        [
          JSON.stringify(updated.basic_preferences),
          JSON.stringify(updated.role_specific_preferences),
          JSON.stringify(updated.advanced_customizations),
          userId
        ]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
};

// Permission management (NEW - doesn't affect existing)
export const getUserEffectivePermissions = async (userId: string): Promise<string[]> => {
  try {
    // Get user's role
    const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
    if (!user) return [];
    
    // Get role hierarchy
    const roleHierarchy = await getRoleHierarchy(user.role);
    if (!roleHierarchy) return [];
    
    // Get base permissions for the role
    const basePermissions = await db.all(
      'SELECT permission_name FROM role_permissions WHERE role_id = ?',
      [user.role]
    );
    
    // Get inherited permissions
    const inheritedPermissions = [];
    for (const inheritedRole of roleHierarchy.inherits_from) {
      const inherited = await db.all(
        'SELECT permission_name FROM role_permissions WHERE role_id = ?',
        [inheritedRole]
      );
      inheritedPermissions.push(...inherited.map(p => p.permission_name));
    }
    
    // Get user-specific permission overrides
    const overrides = await db.all(
      `SELECT rp.permission_name, upo.action 
       FROM user_permission_overrides upo
       JOIN role_permissions rp ON upo.permission_id = rp.id
       WHERE upo.user_id = ? AND (upo.expires_at IS NULL OR upo.expires_at > datetime('now'))`,
      [userId]
    );
    
    // Combine all permissions
    const allPermissions = new Set<string>();
    
    // Add base permissions
    basePermissions.forEach(p => allPermissions.add(p.permission_name));
    
    // Add inherited permissions
    inheritedPermissions.forEach(p => allPermissions.add(p));
    
    // Apply overrides
    overrides.forEach(override => {
      if (override.action === 'add') {
        allPermissions.add(override.permission_name);
      } else if (override.action === 'remove') {
        allPermissions.delete(override.permission_name);
      }
    });
    
    return Array.from(allPermissions);
  } catch (error) {
    console.error('Error getting user effective permissions:', error);
    return [];
  }
};

export const checkUserPermission = async (
  userId: string, 
  permission: string, 
  resource?: string
): Promise<boolean> => {
  try {
    const permissions = await getUserEffectivePermissions(userId);
    return permissions.includes(permission);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

// Role assignment management (NEW - doesn't affect existing)
export const assignTemporaryRole = async (
  userId: string,
  temporaryRole: string,
  assignedBy: string,
  startDate: Date,
  endDate: Date,
  permissions: string[] = [],
  conditions: Record<string, any> = {},
  autoRevoke: boolean = true
): Promise<boolean> => {
  try {
    await db.run(
      `INSERT INTO temporary_role_assignments 
       (id, user_id, temporary_role, assigned_by, start_date, end_date, permissions, conditions, auto_revoke)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `temp_${Date.now()}_${userId}`,
        userId,
        temporaryRole,
        assignedBy,
        startDate.toISOString(),
        endDate.toISOString(),
        JSON.stringify(permissions),
        JSON.stringify(conditions),
        autoRevoke
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error assigning temporary role:', error);
    return false;
  }
};

export const getTemporaryRoles = async (userId: string): Promise<any[]> => {
  try {
    const roles = await db.all(
      `SELECT * FROM temporary_role_assignments 
       WHERE user_id = ? AND end_date > datetime('now')
       ORDER BY start_date DESC`,
      [userId]
    );
    
    return roles.map(role => ({
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
      conditions: JSON.parse(role.conditions || '{}'),
      notification_settings: JSON.parse(role.notification_settings || '{}')
    }));
  } catch (error) {
    console.error('Error getting temporary roles:', error);
    return [];
  }
};

// Organization role customizations (NEW - doesn't affect existing)
export const getOrganizationRoleCustomizations = async (organizationId: string): Promise<any[]> => {
  try {
    const customizations = await db.all(
      'SELECT * FROM organization_role_customizations WHERE organization_id = ?',
      [organizationId]
    );
    
    return customizations.map(custom => ({
      ...custom,
      customizations: JSON.parse(custom.customizations || '{}')
    }));
  } catch (error) {
    console.error('Error getting organization role customizations:', error);
    return [];
  }
};

export const createOrganizationRoleCustomization = async (
  organizationId: string,
  roleId: string,
  customizations: Record<string, any>,
  createdBy: string
): Promise<boolean> => {
  try {
    await db.run(
      `INSERT INTO organization_role_customizations 
       (id, organization_id, role_id, customizations, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `custom_${Date.now()}_${organizationId}_${roleId}`,
        organizationId,
        roleId,
        JSON.stringify(customizations),
        createdBy
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error creating organization role customization:', error);
    return false;
  }
};

// Role delegation management (NEW - doesn't affect existing)
export const getRoleDelegationMatrix = async (): Promise<any[]> => {
  try {
    const delegations = await db.all('SELECT * FROM role_delegation_matrix ORDER BY from_role, to_role');
    
    return delegations.map(delegation => ({
      ...delegation,
      permissions_delegated: JSON.parse(delegation.permissions_delegated || '[]')
    }));
  } catch (error) {
    console.error('Error getting role delegation matrix:', error);
    return [];
  }
};

export const canDelegateRole = async (fromRole: string, toRole: string): Promise<boolean> => {
  try {
    const delegation = await db.get(
      'SELECT * FROM role_delegation_matrix WHERE from_role = ? AND to_role = ?',
      [fromRole, toRole]
    );
    
    return !!delegation;
  } catch (error) {
    console.error('Error checking role delegation:', error);
    return false;
  }
};

// Audit logging for role changes (NEW - doesn't affect existing)
export const logRoleChange = async (
  userId: string,
  actionType: string,
  targetUserId: string,
  permissionChanges: Record<string, any>,
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> => {
  try {
    await db.run(
      `INSERT INTO permission_audit_log 
       (id, user_id, action_type, target_user_id, permission_changes, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `audit_${Date.now()}_${userId}`,
        userId,
        actionType,
        targetUserId,
        JSON.stringify(permissionChanges),
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        ipAddress,
        userAgent
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error logging role change:', error);
    return false;
  }
};

// Utility functions for role management (NEW - doesn't affect existing)
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    // Existing roles
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
