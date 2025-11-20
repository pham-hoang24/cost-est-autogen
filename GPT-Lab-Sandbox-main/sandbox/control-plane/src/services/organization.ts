import { db } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer' | 'guest';
  permissions: string[];
  joined_at: string;
  invited_by: string;
  status: 'active' | 'pending' | 'suspended';
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
  };
}

export interface OrganizationPermission {
  id: string;
  organization_id: string;
  permission_name: string;
  permission_description: string;
  allowed_roles: string[];
  resource_type: 'project' | 'dataset' | 'service' | 'user' | 'analytics';
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'view';
  conditions: Record<string, any>;
  created_at: string;
}

export interface OrganizationAnalytics {
  id: string;
  organization_id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'usage' | 'performance' | 'compliance' | 'cost';
  recorded_at: string;
  metadata: Record<string, any>;
}

export interface OrganizationSettings {
  analytics_enabled: boolean;
  compliance_mode: 'strict' | 'moderate' | 'relaxed';
  data_retention_days: number;
  auto_approve_members: boolean;
  require_admin_approval: boolean;
  max_concurrent_projects: number;
  default_project_quota: {
    cpu_hours: number;
    gpu_hours: number;
    storage_gb: number;
  };
}

export class OrganizationService {
  // Get organization details
  static async getOrganization(organizationId: string) {
    const org = await db.get(`
      SELECT 
        o.*,
        u.email as admin_email,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM organizations o
      LEFT JOIN users u ON o.admin_user_id = u.id
      WHERE o.id = ?
    `, [organizationId]);

    if (!org) {
      throw new Error('Organization not found');
    }

    // Parse settings JSON
    org.settings = JSON.parse(org.settings || '{}');
    
    return org;
  }

  // Get organization members
  static async getOrganizationMembers(organizationId: string, filters?: {
    status?: string;
    role?: string;
    search?: string;
  }) {
    let query = `
      SELECT 
        om.*,
        u.email,
        u.first_name,
        u.last_name,
        u.role as user_role,
        u.status as user_status
      FROM organization_members om
      LEFT JOIN users u ON om.user_id = u.id
      WHERE om.organization_id = ?
    `;
    
    const params: any[] = [organizationId];
    
    if (filters?.status) {
      query += ' AND om.status = ?';
      params.push(filters.status);
    }
    
    if (filters?.role) {
      query += ' AND om.role = ?';
      params.push(filters.role);
    }
    
    if (filters?.search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY om.joined_at DESC';
    
    const members = await db.all(query, params);
    
    return members.map((member: any) => ({
      ...member,
      permissions: JSON.parse(member.permissions || '[]')
    }));
  }

  // Add member to organization
  static async addMember(organizationId: string, userId: string, role: string, invitedBy: string) {
    const memberId = uuidv4();
    
    await db.run(`
      INSERT INTO organization_members (
        id, organization_id, user_id, role, invited_by, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [memberId, organizationId, userId, role, invitedBy, 'active']);
    
    // Update member count
    await db.run(`
      UPDATE organizations 
      SET member_count = (
        SELECT COUNT(*) FROM organization_members 
        WHERE organization_id = ? AND status = 'active'
      )
      WHERE id = ?
    `, [organizationId, organizationId]);
    
    return memberId;
  }

  // Remove member from organization
  static async removeMember(organizationId: string, userId: string) {
    await db.run(`
      DELETE FROM organization_members 
      WHERE organization_id = ? AND user_id = ?
    `, [organizationId, userId]);
    
    // Update member count
    await db.run(`
      UPDATE organizations 
      SET member_count = (
        SELECT COUNT(*) FROM organization_members 
        WHERE organization_id = ? AND status = 'active'
      )
      WHERE id = ?
    `, [organizationId, organizationId]);
  }

  // Update member role
  static async updateMemberRole(organizationId: string, userId: string, newRole: string) {
    await db.run(`
      UPDATE organization_members 
      SET role = ?, permissions = ?
      WHERE organization_id = ? AND user_id = ?
    `, [newRole, '[]', organizationId, userId]);
  }

  // Get organization permissions
  static async getOrganizationPermissions(organizationId: string) {
    const permissions = await db.all(`
      SELECT * FROM organization_permissions 
      WHERE organization_id = ?
      ORDER BY permission_name
    `, [organizationId]);
    
    return permissions.map((permission: any) => ({
      ...permission,
      allowed_roles: JSON.parse(permission.allowed_roles || '[]'),
      conditions: JSON.parse(permission.conditions || '{}')
    }));
  }

  // Create organization permission
  static async createPermission(organizationId: string, permissionData: {
    permission_name: string;
    permission_description: string;
    allowed_roles: string[];
    resource_type: string;
    action: string;
    conditions?: Record<string, any>;
  }) {
    const permissionId = uuidv4();
    
    await db.run(`
      INSERT INTO organization_permissions (
        id, organization_id, permission_name, permission_description,
        allowed_roles, resource_type, action, conditions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      permissionId,
      organizationId,
      permissionData.permission_name,
      permissionData.permission_description,
      JSON.stringify(permissionData.allowed_roles),
      permissionData.resource_type,
      permissionData.action,
      JSON.stringify(permissionData.conditions || {})
    ]);
    
    return permissionId;
  }

  // Update organization permission
  static async updatePermission(permissionId: string, permissionData: Partial<OrganizationPermission>) {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (permissionData.permission_name) {
      updates.push('permission_name = ?');
      params.push(permissionData.permission_name);
    }
    
    if (permissionData.permission_description) {
      updates.push('permission_description = ?');
      params.push(permissionData.permission_description);
    }
    
    if (permissionData.allowed_roles) {
      updates.push('allowed_roles = ?');
      params.push(JSON.stringify(permissionData.allowed_roles));
    }
    
    if (permissionData.resource_type) {
      updates.push('resource_type = ?');
      params.push(permissionData.resource_type);
    }
    
    if (permissionData.action) {
      updates.push('action = ?');
      params.push(permissionData.action);
    }
    
    if (permissionData.conditions) {
      updates.push('conditions = ?');
      params.push(JSON.stringify(permissionData.conditions));
    }
    
    params.push(permissionId);

    await db.run(`
      UPDATE organization_permissions 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
  }

  // Delete organization permission
  static async deletePermission(permissionId: string) {
    await db.run(`
      DELETE FROM organization_permissions 
      WHERE id = ?
    `, [permissionId]);
  }

  // Get organization analytics
  static async getOrganizationAnalytics(organizationId: string, filters?: {
    metric_type?: string;
    start_date?: string;
    end_date?: string;
  }) {
    let query = `
      SELECT * FROM organization_analytics 
      WHERE organization_id = ?
    `;
    
    const params: any[] = [organizationId];
    
    if (filters?.metric_type) {
      query += ' AND metric_type = ?';
      params.push(filters.metric_type);
    }
    
    if (filters?.start_date) {
      query += ' AND recorded_at >= ?';
      params.push(filters.start_date);
    }
    
    if (filters?.end_date) {
      query += ' AND recorded_at <= ?';
      params.push(filters.end_date);
    }
    
    query += ' ORDER BY recorded_at DESC';
    
    const analytics = await db.all(query, params);
    
    return analytics.map((analytic: any) => ({
      ...analytic,
      metadata: JSON.parse(analytic.metadata || '{}')
    }));
  }

  // Record analytics metric
  static async recordAnalyticsMetric(organizationId: string, metricData: {
    metric_name: string;
    metric_value: number;
    metric_type: 'usage' | 'performance' | 'compliance' | 'cost';
    metadata?: Record<string, any>;
  }) {
    const metricId = uuidv4();

    await db.run(`
      INSERT INTO organization_analytics (
        id, organization_id, metric_name, metric_value, 
        metric_type, metadata
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      metricId,
      organizationId,
      metricData.metric_name,
      metricData.metric_value,
      metricData.metric_type,
      JSON.stringify(metricData.metadata || {})
    ]);
    
    return metricId;
  }

  // Update organization settings
  static async updateOrganizationSettings(organizationId: string, settings: Partial<OrganizationSettings>) {
    const currentOrg = await this.getOrganization(organizationId);
    const currentSettings = currentOrg.settings || {};
    
    const updatedSettings = {
      ...currentSettings,
      ...settings
    };
    
    await db.run(`
      UPDATE organizations 
      SET settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(updatedSettings), organizationId]);
    
    return updatedSettings;
  }

  // Check user permission in organization
  static async checkUserPermission(organizationId: string, userId: string, permission: string): Promise<boolean> {
    // Check if user is member of organization
    const member = await db.get(`
      SELECT role, permissions FROM organization_members 
      WHERE organization_id = ? AND user_id = ? AND status = 'active'
    `, [organizationId, userId]);
    
    if (!member) {
      return false;
    }
    
    // Check if permission exists for organization
    const permissionData = await db.get(`
      SELECT allowed_roles FROM organization_permissions 
      WHERE organization_id = ? AND permission_name = ?
    `, [organizationId, permission]);
    
    if (!permissionData) {
      return false;
    }
    
    const allowedRoles = JSON.parse(permissionData.allowed_roles || '[]');
    return allowedRoles.includes(member.role);
  }

  // Get user's organization memberships
  static async getUserOrganizations(userId: string) {
    const memberships = await db.all(`
      SELECT 
        om.*,
        o.name as organization_name,
        o.description as organization_description,
        o.status as organization_status,
        admin.email as admin_email,
        admin.first_name as admin_first_name,
        admin.last_name as admin_last_name
      FROM organization_members om
      LEFT JOIN organizations o ON om.organization_id = o.id
      LEFT JOIN users admin ON o.admin_user_id = admin.id
      WHERE om.user_id = ? AND om.status = 'active'
      ORDER BY om.joined_at DESC
    `, [userId]);
    
    return memberships.map((membership: any) => ({
      ...membership,
      permissions: JSON.parse(membership.permissions || '[]')
    }));
  }

  // Generate organization analytics report
  static async generateAnalyticsReport(organizationId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const analytics = await this.getOrganizationAnalytics(organizationId, {
      start_date: startDate.toISOString(),
      end_date: now.toISOString()
    });
    
    // Group analytics by type
    const report = {
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      summary: {
        total_metrics: analytics.length,
        usage_metrics: analytics.filter((a: any) => a.metric_type === 'usage').length,
        performance_metrics: analytics.filter((a: any) => a.metric_type === 'performance').length,
        compliance_metrics: analytics.filter((a: any) => a.metric_type === 'compliance').length,
        cost_metrics: analytics.filter((a: any) => a.metric_type === 'cost').length
      },
      metrics_by_type: {
        usage: analytics.filter((a: any) => a.metric_type === 'usage'),
        performance: analytics.filter((a: any) => a.metric_type === 'performance'),
        compliance: analytics.filter((a: any) => a.metric_type === 'compliance'),
        cost: analytics.filter((a: any) => a.metric_type === 'cost')
      }
    };
    
    return report;
  }
}