import { Router } from 'express';
import { OrganizationService } from '../../services/organization.js';
import { db } from '../../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await db.all(`
      SELECT 
        o.*,
        u.email as admin_email,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM organizations o
      LEFT JOIN users u ON o.admin_user_id = u.id
      ORDER BY o.created_at DESC
    `);

    const organizationsWithSettings = organizations.map(org => ({
      ...org,
      settings: JSON.parse(org.settings || '{}')
    }));

    res.json({
      success: true,
      data: organizationsWithSettings
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch organizations'
    });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const organization = await OrganizationService.getOrganization(req.params.id);
    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Organization not found'
    });
  }
});

// Create new organization
router.post('/', async (req, res) => {
  try {
    const { name, description, admin_user_id, total_cpu_limit, total_gpu_limit, total_storage_limit, max_members, compliance_mode, data_retention_days } = req.body;

    if (!name || !admin_user_id) {
      return res.status(400).json({
        success: false,
        error: 'Organization name and admin user ID are required'
      });
    }

    const organizationId = uuidv4();
    
    const settings = {
      analytics_enabled: true,
      compliance_mode: compliance_mode || 'moderate',
      data_retention_days: data_retention_days || 365,
      auto_approve_members: false,
      require_admin_approval: true,
      max_concurrent_projects: 10,
      default_project_quota: {
        cpu_hours: 100,
        gpu_hours: 10,
        storage_gb: 50
      }
    };

    await db.run(`
      INSERT INTO organizations (
        id, name, description, admin_user_id, total_cpu_limit, 
        total_gpu_limit, total_storage_limit, max_members, 
        compliance_mode, data_retention_days, settings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      organizationId, name, description, admin_user_id, total_cpu_limit || 1000,
      total_gpu_limit || 100, total_storage_limit || 1000, max_members || 50,
      compliance_mode || 'moderate', data_retention_days || 365, JSON.stringify(settings)
    ]);

    // Add admin as first member
    await OrganizationService.addMember(organizationId, admin_user_id, 'admin', 'system');

    // Create default permissions
    const defaultPermissions = [
      {
        permission_name: 'create_projects',
        permission_description: 'Allow users to create new projects',
        allowed_roles: ['admin', 'member'],
        resource_type: 'project',
        action: 'create'
      },
      {
        permission_name: 'manage_members',
        permission_description: 'Allow users to invite and manage organization members',
        allowed_roles: ['admin'],
        resource_type: 'user',
        action: 'manage'
      },
      {
        permission_name: 'view_analytics',
        permission_description: 'Allow users to view organization analytics',
        allowed_roles: ['admin', 'member'],
        resource_type: 'analytics',
        action: 'view'
      },
      {
        permission_name: 'access_datasets',
        permission_description: 'Allow users to access organization datasets',
        allowed_roles: ['admin', 'member', 'viewer'],
        resource_type: 'dataset',
        action: 'read'
      },
      {
        permission_name: 'use_ai_services',
        permission_description: 'Allow users to use AI services',
        allowed_roles: ['admin', 'member'],
        resource_type: 'service',
        action: 'create'
      }
    ];

    for (const permission of defaultPermissions) {
      await OrganizationService.createPermission(organizationId, permission);
    }

    const newOrganization = await OrganizationService.getOrganization(organizationId);

    res.status(201).json({
      success: true,
      data: newOrganization
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create organization'
    });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const { name, description, total_cpu_limit, total_gpu_limit, total_storage_limit, max_members, status, compliance_mode, data_retention_days } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (total_cpu_limit !== undefined) {
      updates.push('total_cpu_limit = ?');
      params.push(total_cpu_limit);
    }
    if (total_gpu_limit !== undefined) {
      updates.push('total_gpu_limit = ?');
      params.push(total_gpu_limit);
    }
    if (total_storage_limit !== undefined) {
      updates.push('total_storage_limit = ?');
      params.push(total_storage_limit);
    }
    if (max_members !== undefined) {
      updates.push('max_members = ?');
      params.push(max_members);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (compliance_mode !== undefined) {
      updates.push('compliance_mode = ?');
      params.push(compliance_mode);
    }
    if (data_retention_days !== undefined) {
      updates.push('data_retention_days = ?');
      params.push(data_retention_days);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await db.run(`
      UPDATE organizations 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    const updatedOrganization = await OrganizationService.getOrganization(req.params.id);

    res.json({
      success: true,
      data: updatedOrganization
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update organization'
    });
  }
});

// Get organization members
router.get('/:id/members', async (req, res) => {
  try {
    const { status, role, search } = req.query;
    const members = await OrganizationService.getOrganizationMembers(req.params.id, {
      status: status as string,
      role: role as string,
      search: search as string
    });

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization members'
    });
  }
});

// Add member to organization
router.post('/:id/members', async (req, res) => {
  try {
    const { user_id, role } = req.body;
    const invitedBy = req.user?.id || 'system';

    if (!user_id || !role) {
      return res.status(400).json({
        success: false,
        error: 'User ID and role are required'
      });
    }

    const memberId = await OrganizationService.addMember(req.params.id, user_id, role, invitedBy);

    res.status(201).json({
      success: true,
      data: { id: memberId }
    });
  } catch (error) {
    console.error('Error adding organization member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add organization member'
    });
  }
});

// Remove member from organization
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    await OrganizationService.removeMember(req.params.id, req.params.userId);

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing organization member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove organization member'
    });
  }
});

// Update member role
router.put('/:id/members/:userId', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    await OrganizationService.updateMemberRole(req.params.id, req.params.userId, role);

    res.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member role'
    });
  }
});

// Get organization permissions
router.get('/:id/permissions', async (req, res) => {
  try {
    const permissions = await OrganizationService.getOrganizationPermissions(req.params.id);

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching organization permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization permissions'
    });
  }
});

// Create organization permission
router.post('/:id/permissions', async (req, res) => {
  try {
    const permissionData = req.body;

    const permissionId = await OrganizationService.createPermission(req.params.id, permissionData);

    res.status(201).json({
      success: true,
      data: { id: permissionId }
    });
  } catch (error) {
    console.error('Error creating organization permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create organization permission'
    });
  }
});

// Update organization permission
router.put('/permissions/:permissionId', async (req, res) => {
  try {
    const permissionData = req.body;

    await OrganizationService.updatePermission(req.params.permissionId, permissionData);

    res.json({
      success: true,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update organization permission'
    });
  }
});

// Delete organization permission
router.delete('/permissions/:permissionId', async (req, res) => {
  try {
    await OrganizationService.deletePermission(req.params.permissionId);

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete organization permission'
    });
  }
});

// Get organization analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { metric_type, start_date, end_date, period } = req.query;

    if (period) {
      const report = await OrganizationService.generateAnalyticsReport(req.params.id, period as any);
      return res.json({
        success: true,
        data: report
      });
    }

    const analytics = await OrganizationService.getOrganizationAnalytics(req.params.id, {
      metric_type: metric_type as string,
      start_date: start_date as string,
      end_date: end_date as string
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching organization analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization analytics'
    });
  }
});

// Record analytics metric
router.post('/:id/analytics', async (req, res) => {
  try {
    const metricData = req.body;

    const metricId = await OrganizationService.recordAnalyticsMetric(req.params.id, metricData);

    res.status(201).json({
      success: true,
      data: { id: metricId }
    });
  } catch (error) {
    console.error('Error recording analytics metric:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record analytics metric'
    });
  }
});

// Update organization settings
router.put('/:id/settings', async (req, res) => {
  try {
    const settings = req.body;

    const updatedSettings = await OrganizationService.updateOrganizationSettings(req.params.id, settings);

    res.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update organization settings'
    });
  }
});

// Check user permission
router.get('/:id/permissions/check', async (req, res) => {
  try {
    const { user_id, permission } = req.query;

    if (!user_id || !permission) {
      return res.status(400).json({
        success: false,
        error: 'User ID and permission are required'
      });
    }

    const hasPermission = await OrganizationService.checkUserPermission(
      req.params.id,
      user_id as string,
      permission as string
    );

    res.json({
      success: true,
      data: { hasPermission }
    });
  } catch (error) {
    console.error('Error checking user permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check user permission'
    });
  }
});

// Get user organizations
router.get('/user/:userId', async (req, res) => {
  try {
    const memberships = await OrganizationService.getUserOrganizations(req.params.userId);

    res.json({
      success: true,
      data: memberships
    });
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user organizations'
    });
  }
});

export default router;