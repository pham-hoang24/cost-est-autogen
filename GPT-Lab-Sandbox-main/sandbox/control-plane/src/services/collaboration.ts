import { db } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Types and Interfaces
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  organization_id?: string;
  project_type: 'research' | 'ai_development' | 'data_analysis' | 'model_training';
  visibility: 'private' | 'organization' | 'public';
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'research_exemption';
  data_retention_days: number;
  cross_border_transfers: boolean;
  requires_dpia: boolean;
  max_collaborators: number;
  collaboration_model: 'open' | 'invite_only' | 'approval_required';
  subscription_tier_required: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  invited_by: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer' | 'reviewer';
  permissions: Record<string, boolean>;
  consent_provided: boolean;
  consent_date?: string;
  access_level: 'full' | 'restricted' | 'read_only';
  can_invite_others: boolean;
  can_share_data: boolean;
  can_export_data: boolean;
  status: 'pending' | 'active' | 'suspended' | 'removed';
  joined_at?: string;
  last_active?: string;
}

export interface ProjectResource {
  id: string;
  project_id: string;
  uploaded_by: string;
  name: string;
  description?: string;
  resource_type: 'dataset' | 'model' | 'code' | 'document' | 'notebook' | 'result';
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  contains_pii: boolean;
  pii_categories?: string[];
  anonymization_applied: boolean;
  access_permissions: Record<string, string[]>;
  sharing_restrictions: Record<string, any>;
  download_allowed: boolean;
  external_sharing_allowed: boolean;
  version: string;
  parent_resource_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  invited_by: string;
  email: string;
  invited_user_id?: string;
  role: 'admin' | 'contributor' | 'viewer' | 'reviewer';
  message?: string;
  permissions: Record<string, boolean>;
  invitation_token: string;
  expires_at: string;
  requires_consent: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
}

export interface CreateProjectData {
  name: string;
  description?: string;
  project_type: 'research' | 'ai_development' | 'data_analysis' | 'model_training';
  visibility: 'private' | 'organization' | 'public';
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'research_exemption';
  data_retention_days?: number;
  cross_border_transfers?: boolean;
  max_collaborators?: number;
  collaboration_model?: 'open' | 'invite_only' | 'approval_required';
}

// Collaboration Service
export class CollaborationService {
  
  // Check subscription limits and permissions
  private async checkSubscriptionLimits(userId: string, action: string, additionalData?: any): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get user's subscription tier
      const user = await db.get('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      // Get subscription features
      const features = await db.get(
        'SELECT * FROM subscription_features WHERE subscription_tier = ?',
        [user.subscription_tier || 'basic']
      );

      if (!features) {
        return { allowed: false, reason: 'Subscription tier not found' };
      }

      switch (action) {
        case 'create_project':
          if (features.max_projects !== -1) {
            const projectCount = await db.get(
              'SELECT COUNT(*) as count FROM projects WHERE owner_id = ? AND status != ?',
              [userId, 'archived']
            );
            if (projectCount.count >= features.max_projects) {
              return { allowed: false, reason: `Maximum projects limit reached (${features.max_projects})` };
            }
          }
          break;

        case 'invite_collaborator':
          const currentMembers = await db.get(
            'SELECT COUNT(*) as count FROM project_members WHERE project_id = ? AND status = ?',
            [additionalData.projectId, 'active']
          );
          if (currentMembers.count >= features.max_collaborators_per_project) {
            return { allowed: false, reason: `Maximum collaborators limit reached (${features.max_collaborators_per_project})` };
          }
          break;

        case 'external_collaboration':
          if (!features.external_collaboration) {
            return { allowed: false, reason: 'External collaboration not available in your subscription tier' };
          }
          break;

        case 'cross_border_sharing':
          if (!features.cross_border_data_sharing) {
            return { allowed: false, reason: 'Cross-border data sharing not available in your subscription tier' };
          }
          break;

        case 'advanced_ai_features':
          if (!features.advanced_ai_features) {
            return { allowed: false, reason: 'Advanced AI features not available in your subscription tier' };
          }
          break;
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      return { allowed: false, reason: 'Error checking subscription limits' };
    }
  }

  // Log project activity for audit trail
  private async logActivity(
    projectId: string,
    userId: string,
    activityType: string,
    description: string,
    metadata?: Record<string, any>,
    request?: any
  ): Promise<void> {
    try {
      const activityId = uuidv4();
      const ipAddress = request?.ip || 'unknown';
      const userAgent = request?.get('User-Agent') || 'unknown';
      
      await db.run(`
        INSERT INTO project_activities (
          id, project_id, user_id, activity_type, activity_description,
          ip_address, user_agent, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        activityId, projectId, userId, activityType, description,
        ipAddress, userAgent, JSON.stringify(metadata || {})
      ]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Create a new project with compliance checks
  async createProject(userId: string, projectData: CreateProjectData, request?: any): Promise<{ success: boolean; project?: Project; message?: string }> {
    try {
      // Check subscription limits
      const subscriptionCheck = await this.checkSubscriptionLimits(userId, 'create_project');
      if (!subscriptionCheck.allowed) {
        return { success: false, message: subscriptionCheck.reason };
      }

      // Check if cross-border transfers require higher subscription
      if (projectData.cross_border_transfers) {
        const crossBorderCheck = await this.checkSubscriptionLimits(userId, 'cross_border_sharing');
        if (!crossBorderCheck.allowed) {
          return { success: false, message: crossBorderCheck.reason };
        }
      }

      // Get user's organization
      const user = await db.get('SELECT organization_id, subscription_tier FROM users WHERE id = ?', [userId]);
      
      const projectId = uuidv4();
      const now = new Date().toISOString();

      // Create project
      const project: Omit<Project, 'id'> = {
        name: projectData.name,
        description: projectData.description,
        owner_id: userId,
        organization_id: user?.organization_id,
        project_type: projectData.project_type,
        visibility: projectData.visibility,
        legal_basis: projectData.legal_basis,
        data_retention_days: projectData.data_retention_days || 365,
        cross_border_transfers: projectData.cross_border_transfers || false,
        requires_dpia: this.requiresDPIA(projectData),
        max_collaborators: projectData.max_collaborators || 10,
        collaboration_model: projectData.collaboration_model || 'invite_only',
        subscription_tier_required: user?.subscription_tier || 'basic',
        status: 'active',
        created_at: now,
        updated_at: now
      };

      await db.run(`
        INSERT INTO projects (
          id, name, description, owner_id, organization_id, project_type, visibility,
          legal_basis, data_retention_days, cross_border_transfers, requires_dpia,
          max_collaborators, collaboration_model, subscription_tier_required,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        projectId, project.name, project.description, project.owner_id, project.organization_id,
        project.project_type, project.visibility, project.legal_basis, project.data_retention_days,
        project.cross_border_transfers, project.requires_dpia, project.max_collaborators,
        project.collaboration_model, project.subscription_tier_required, project.status,
        project.created_at, project.updated_at
      ]);

      // Add owner as project member
      const memberData: Omit<ProjectMember, 'id'> = {
        project_id: projectId,
        user_id: userId,
        invited_by: userId,
        role: 'owner',
        permissions: { all: true },
        consent_provided: true,
        consent_date: now,
        access_level: 'full',
        can_invite_others: true,
        can_share_data: true,
        can_export_data: true,
        status: 'active',
        joined_at: now,
        last_active: now
      };

      const memberId = uuidv4();
      await db.run(`
        INSERT INTO project_members (
          id, project_id, user_id, invited_by, role, permissions,
          consent_provided, consent_date, access_level, can_invite_others,
          can_share_data, can_export_data, status, joined_at, last_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        memberId, memberData.project_id, memberData.user_id, memberData.invited_by,
        memberData.role, JSON.stringify(memberData.permissions), memberData.consent_provided,
        memberData.consent_date, memberData.access_level, memberData.can_invite_others,
        memberData.can_share_data, memberData.can_export_data, memberData.status,
        memberData.joined_at, memberData.last_active
      ]);

      // Log activity
      await this.logActivity(
        projectId, userId, 'project_created',
        `Project "${project.name}" created`,
        { project_type: project.project_type, visibility: project.visibility },
        request
      );

      return { 
        success: true, 
        project: { id: projectId, ...project } as Project,
        message: 'Project created successfully'
      };

    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, message: 'Failed to create project' };
    }
  }

  // Get user's projects with role-based filtering
  async getUserProjects(userId: string, filters?: { 
    status?: string; 
    role?: string; 
    project_type?: string; 
    limit?: number; 
    offset?: number;
  }): Promise<{ success: boolean; projects?: Project[]; total?: number; message?: string }> {
    try {
      let query = `
        SELECT p.*, pm.role as user_role, pm.status as membership_status
        FROM projects p
        INNER JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = ? AND pm.status != 'removed'
      `;
      const params: any[] = [userId];

      // Apply filters
      if (filters?.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
      if (filters?.role) {
        query += ' AND pm.role = ?';
        params.push(filters.role);
      }
      if (filters?.project_type) {
        query += ' AND p.project_type = ?';
        params.push(filters.project_type);
      }

      query += ' ORDER BY p.updated_at DESC';

      if (filters?.limit) {
        query += ' LIMIT ? OFFSET ?';
        params.push(filters.limit, filters.offset || 0);
      }

      const projects = await db.all(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM projects p
        INNER JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = ? AND pm.status != 'removed'
      `;
      const countParams: any[] = [userId];

      if (filters?.status) {
        countQuery += ' AND p.status = ?';
        countParams.push(filters.status);
      }
      if (filters?.role) {
        countQuery += ' AND pm.role = ?';
        countParams.push(filters.role);
      }
      if (filters?.project_type) {
        countQuery += ' AND p.project_type = ?';
        countParams.push(filters.project_type);
      }

      const totalResult = await db.get(countQuery, countParams);

      return {
        success: true,
        projects: projects as Project[],
        total: totalResult.total
      };

    } catch (error) {
      console.error('Error getting user projects:', error);
      return { success: false, message: 'Failed to get projects' };
    }
  }

  // Invite user to project with security and compliance checks
  async inviteUserToProject(
    projectId: string,
    invitedBy: string,
    email: string,
    role: 'admin' | 'contributor' | 'viewer' | 'reviewer',
    message?: string,
    permissions?: Record<string, boolean>,
    request?: any
  ): Promise<{ success: boolean; invitation?: ProjectInvitation; message?: string }> {
    try {
      // Check if user has permission to invite
      const inviterMember = await db.get(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ? AND status = ?',
        [projectId, invitedBy, 'active']
      );

      if (!inviterMember || (!inviterMember.can_invite_others && inviterMember.role !== 'owner' && inviterMember.role !== 'admin')) {
        return { success: false, message: 'You do not have permission to invite users to this project' };
      }

      // Check subscription limits
      const subscriptionCheck = await this.checkSubscriptionLimits(invitedBy, 'invite_collaborator', { projectId });
      if (!subscriptionCheck.allowed) {
        return { success: false, message: subscriptionCheck.reason };
      }

      // Check if user is already a member or has pending invitation
      const existingMember = await db.get(
        'SELECT id FROM project_members WHERE project_id = ? AND user_id IN (SELECT id FROM users WHERE email = ?)',
        [projectId, email]
      );

      if (existingMember) {
        return { success: false, message: 'User is already a member of this project' };
      }

      const existingInvitation = await db.get(
        'SELECT id FROM project_invitations WHERE project_id = ? AND email = ? AND status = ?',
        [projectId, email, 'pending']
      );

      if (existingInvitation) {
        return { success: false, message: 'User already has a pending invitation' };
      }

      // Check if invited user exists
      const invitedUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);

      // Generate secure invitation token
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const invitationId = uuidv4();
      const invitation: Omit<ProjectInvitation, 'id'> = {
        project_id: projectId,
        invited_by: invitedBy,
        email,
        invited_user_id: invitedUser?.id,
        role,
        message,
        permissions: permissions || {},
        invitation_token: invitationToken,
        expires_at: expiresAt,
        requires_consent: true,
        status: 'pending'
      };

      await db.run(`
        INSERT INTO project_invitations (
          id, project_id, invited_by, email, invited_user_id, role, message,
          permissions, invitation_token, expires_at, requires_consent, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invitationId, invitation.project_id, invitation.invited_by, invitation.email,
        invitation.invited_user_id, invitation.role, invitation.message,
        JSON.stringify(invitation.permissions), invitation.invitation_token,
        invitation.expires_at, invitation.requires_consent, invitation.status
      ]);

      // Log activity
      await this.logActivity(
        projectId, invitedBy, 'member_invited',
        `User ${email} invited with role ${role}`,
        { invited_email: email, role, permissions },
        request
      );

      return {
        success: true,
        invitation: { id: invitationId, ...invitation } as ProjectInvitation,
        message: 'Invitation sent successfully'
      };

    } catch (error) {
      console.error('Error inviting user to project:', error);
      return { success: false, message: 'Failed to send invitation' };
    }
  }

  // Accept project invitation with consent handling
  async acceptInvitation(
    invitationToken: string,
    userId: string,
    consentData: {
      data_sharing_consent: boolean;
      ai_processing_consent: boolean;
      cross_border_consent?: boolean;
    },
    request?: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Find and validate invitation
      const invitation = await db.get(
        'SELECT * FROM project_invitations WHERE invitation_token = ? AND status = ?',
        [invitationToken, 'pending']
      );

      if (!invitation) {
        return { success: false, message: 'Invalid or expired invitation' };
      }

      if (new Date(invitation.expires_at) < new Date()) {
        await db.run('UPDATE project_invitations SET status = ? WHERE id = ?', ['expired', invitation.id]);
        return { success: false, message: 'Invitation has expired' };
      }

      // Verify user email matches invitation
      const user = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
      if (user.email !== invitation.email) {
        return { success: false, message: 'Invitation is not for this user' };
      }

      // Check project still exists and has space
      const project = await db.get('SELECT * FROM projects WHERE id = ? AND status = ?', [invitation.project_id, 'active']);
      if (!project) {
        return { success: false, message: 'Project not found or inactive' };
      }

      const memberCount = await db.get(
        'SELECT COUNT(*) as count FROM project_members WHERE project_id = ? AND status = ?',
        [invitation.project_id, 'active']
      );

      if (memberCount.count >= project.max_collaborators) {
        return { success: false, message: 'Project has reached maximum collaborator limit' };
      }

      const now = new Date().toISOString();

      // Create project member
      const memberId = uuidv4();
      const memberData: Omit<ProjectMember, 'id'> = {
        project_id: invitation.project_id,
        user_id: userId,
        invited_by: invitation.invited_by,
        role: invitation.role,
        permissions: JSON.parse(invitation.permissions),
        consent_provided: consentData.data_sharing_consent,
        consent_date: now,
        access_level: this.getAccessLevelForRole(invitation.role),
        can_invite_others: invitation.role === 'admin',
        can_share_data: consentData.data_sharing_consent,
        can_export_data: consentData.data_sharing_consent && (invitation.role === 'admin' || invitation.role === 'contributor'),
        status: 'active',
        joined_at: now,
        last_active: now
      };

      await db.run(`
        INSERT INTO project_members (
          id, project_id, user_id, invited_by, role, permissions,
          consent_provided, consent_date, access_level, can_invite_others,
          can_share_data, can_export_data, status, joined_at, last_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        memberId, memberData.project_id, memberData.user_id, memberData.invited_by,
        memberData.role, JSON.stringify(memberData.permissions), memberData.consent_provided,
        memberData.consent_date, memberData.access_level, memberData.can_invite_others,
        memberData.can_share_data, memberData.can_export_data, memberData.status,
        memberData.joined_at, memberData.last_active
      ]);

      // Record consents
      await this.recordConsents(userId, invitation.project_id, consentData);

      // Update invitation status
      await db.run(
        'UPDATE project_invitations SET status = ?, accepted_at = ? WHERE id = ?',
        ['accepted', now, invitation.id]
      );

      // Log activity
      await this.logActivity(
        invitation.project_id, userId, 'member_joined',
        `User joined project with role ${invitation.role}`,
        { role: invitation.role, consent_provided: consentData },
        request
      );

      return { success: true, message: 'Successfully joined project' };

    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, message: 'Failed to accept invitation' };
    }
  }

  // Helper methods
  private requiresDPIA(projectData: CreateProjectData): boolean {
    // DPIA required for high-risk processing
    return projectData.cross_border_transfers || 
           projectData.project_type === 'ai_development' ||
           projectData.legal_basis === 'legitimate_interest';
  }

  private getAccessLevelForRole(role: string): 'full' | 'restricted' | 'read_only' {
    switch (role) {
      case 'owner':
      case 'admin':
        return 'full';
      case 'contributor':
        return 'restricted';
      case 'viewer':
      case 'reviewer':
        return 'read_only';
      default:
        return 'read_only';
    }
  }

  private async recordConsents(
    userId: string,
    projectId: string,
    consentData: {
      data_sharing_consent: boolean;
      ai_processing_consent: boolean;
      cross_border_consent?: boolean;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    const consents = [];

    if (consentData.data_sharing_consent) {
      consents.push({
        id: uuidv4(),
        user_id: userId,
        project_id: projectId,
        consent_type: 'data_sharing',
        purpose: 'Collaborative research and data sharing within project',
        data_categories: JSON.stringify(['research_data', 'project_metadata']),
        processing_activities: JSON.stringify(['sharing', 'analysis', 'storage']),
        consent_given: true,
        consent_date: now
      });
    }

    if (consentData.ai_processing_consent) {
      consents.push({
        id: uuidv4(),
        user_id: userId,
        project_id: projectId,
        consent_type: 'ai_processing',
        purpose: 'AI model training and automated processing',
        data_categories: JSON.stringify(['research_data', 'model_outputs']),
        processing_activities: JSON.stringify(['ai_training', 'automated_analysis', 'model_inference']),
        consent_given: true,
        consent_date: now
      });
    }

    if (consentData.cross_border_consent) {
      consents.push({
        id: uuidv4(),
        user_id: userId,
        project_id: projectId,
        consent_type: 'cross_border_transfer',
        purpose: 'International collaboration and data sharing',
        data_categories: JSON.stringify(['research_data', 'personal_data']),
        processing_activities: JSON.stringify(['international_transfer', 'cross_border_collaboration']),
        consent_given: true,
        consent_date: now
      });
    }

    for (const consent of consents) {
      await db.run(`
        INSERT INTO collaboration_consents (
          id, user_id, project_id, consent_type, purpose, data_categories,
          processing_activities, consent_given, consent_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        consent.id, consent.user_id, consent.project_id, consent.consent_type,
        consent.purpose, consent.data_categories, consent.processing_activities,
        consent.consent_given, consent.consent_date
      ]);
    }
  }

  // Get project member
  async getProjectMember(projectId: string, userId: string): Promise<ProjectMember | null> {
    try {
      const member = await db.get(
        'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, userId]
      );
      
      if (member) {
        return {
          ...member,
          permissions: JSON.parse(member.permissions || '{}')
        } as ProjectMember;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting project member:', error);
      return null;
    }
  }

  // Get project details with member context
  async getProjectDetails(projectId: string, userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
      
      if (!project) {
        return { success: false, message: 'Project not found' };
      }

      const member = await this.getProjectMember(projectId, userId);
      
      if (!member) {
        return { success: false, message: 'Access denied' };
      }

      // Get project statistics
      const memberCount = await db.get(
        'SELECT COUNT(*) as count FROM project_members WHERE project_id = ? AND status = ?',
        [projectId, 'active']
      );

      const resourceCount = await db.get(
        'SELECT COUNT(*) as count FROM project_resources WHERE project_id = ?',
        [projectId]
      );

      const recentActivity = await db.all(
        'SELECT * FROM project_activities WHERE project_id = ? ORDER BY created_at DESC LIMIT 10',
        [projectId]
      );

      return {
        success: true,
        data: {
          project,
          member_info: member,
          statistics: {
            member_count: memberCount.count,
            resource_count: resourceCount.count
          },
          recent_activity: recentActivity
        }
      };
    } catch (error) {
      console.error('Error getting project details:', error);
      return { success: false, message: 'Failed to get project details' };
    }
  }

  // Get project members
  async getProjectMembers(projectId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const members = await db.all(`
        SELECT pm.*, u.email, u.first_name, u.last_name, u.organization
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ? AND pm.status != 'removed'
        ORDER BY pm.joined_at ASC
      `, [projectId]);

      const processedMembers = members.map(member => ({
        ...member,
        permissions: JSON.parse(member.permissions || '{}')
      }));

      return {
        success: true,
        data: processedMembers
      };
    } catch (error) {
      console.error('Error getting project members:', error);
      return { success: false, message: 'Failed to get project members' };
    }
  }

  // Get user invitations
  async getUserInvitations(userId: string, status?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      let query = `
        SELECT pi.*, p.name as project_name, u.first_name || ' ' || u.last_name as invited_by_name
        FROM project_invitations pi
        JOIN projects p ON pi.project_id = p.id
        JOIN users u ON pi.invited_by = u.id
        WHERE pi.email = (SELECT email FROM users WHERE id = ?)
      `;
      const params: any[] = [userId];

      if (status) {
        query += ' AND pi.status = ?';
        params.push(status);
      }

      query += ' ORDER BY pi.created_at DESC';

      const invitations = await db.all(query, params);

      return {
        success: true,
        data: invitations.map(inv => ({
          ...inv,
          permissions: JSON.parse(inv.permissions || '{}')
        }))
      };
    } catch (error) {
      console.error('Error getting user invitations:', error);
      return { success: false, message: 'Failed to get invitations' };
    }
  }

  // Get subscription features for user
  async getSubscriptionFeatures(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const user = await db.get('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const features = await db.get(
        'SELECT * FROM subscription_features WHERE subscription_tier = ?',
        [user.subscription_tier || 'basic']
      );

      if (!features) {
        return { success: false, message: 'Subscription features not found' };
      }

      // Get current usage
      const projectCount = await db.get(
        'SELECT COUNT(*) as count FROM projects WHERE owner_id = ? AND status != ?',
        [userId, 'archived']
      );

      return {
        success: true,
        data: {
          subscription_tier: user.subscription_tier || 'basic',
          features,
          current_usage: {
            projects: projectCount.count
          }
        }
      };
    } catch (error) {
      console.error('Error getting subscription features:', error);
      return { success: false, message: 'Failed to get subscription features' };
    }
  }

  // Get project activity
  async getProjectActivity(projectId: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const activities = await db.all(`
        SELECT pa.*, u.first_name || ' ' || u.last_name as user_name
        FROM project_activities pa
        JOIN users u ON pa.user_id = u.id
        WHERE pa.project_id = ?
        ORDER BY pa.created_at DESC
        LIMIT ? OFFSET ?
      `, [projectId, limit, offset]);

      const processedActivities = activities.map(activity => ({
        ...activity,
        metadata: JSON.parse(activity.metadata || '{}')
      }));

      return {
        success: true,
        data: processedActivities
      };
    } catch (error) {
      console.error('Error getting project activity:', error);
      return { success: false, message: 'Failed to get project activity' };
    }
  }

  // Remove member from project
  async removeMemberFromProject(
    projectId: string,
    memberId: string,
    removedBy: string,
    request?: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if user has permission to remove members
      const remover = await this.getProjectMember(projectId, removedBy);
      
      if (!remover || (remover.role !== 'owner' && remover.role !== 'admin')) {
        return { success: false, message: 'You do not have permission to remove members' };
      }

      // Get member to be removed
      const memberToRemove = await db.get(
        'SELECT * FROM project_members WHERE id = ? AND project_id = ?',
        [memberId, projectId]
      );

      if (!memberToRemove) {
        return { success: false, message: 'Member not found' };
      }

      // Cannot remove project owner
      if (memberToRemove.role === 'owner') {
        return { success: false, message: 'Cannot remove project owner' };
      }

      // Update member status
      await db.run(
        'UPDATE project_members SET status = ?, updated_at = ? WHERE id = ?',
        ['removed', new Date().toISOString(), memberId]
      );

      // Log activity
      await this.logActivity(
        projectId, removedBy, 'member_removed',
        `Member removed from project`,
        { removed_member_id: memberToRemove.user_id },
        request
      );

      return { success: true, message: 'Member removed successfully' };
    } catch (error) {
      console.error('Error removing member:', error);
      return { success: false, message: 'Failed to remove member' };
    }
  }

  // Update member role
  async updateMemberRole(
    projectId: string,
    memberId: string,
    newRole: string,
    updatedBy: string,
    request?: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if user has permission to update roles
      const updater = await this.getProjectMember(projectId, updatedBy);
      
      if (!updater || (updater.role !== 'owner' && updater.role !== 'admin')) {
        return { success: false, message: 'You do not have permission to update member roles' };
      }

      // Get member to be updated
      const memberToUpdate = await db.get(
        'SELECT * FROM project_members WHERE id = ? AND project_id = ?',
        [memberId, projectId]
      );

      if (!memberToUpdate) {
        return { success: false, message: 'Member not found' };
      }

      // Cannot change owner role
      if (memberToUpdate.role === 'owner') {
        return { success: false, message: 'Cannot change project owner role' };
      }

      const now = new Date().toISOString();

      // Update member role and related permissions
      const newAccessLevel = this.getAccessLevelForRole(newRole);
      const canInviteOthers = newRole === 'admin';

      await db.run(`
        UPDATE project_members 
        SET role = ?, access_level = ?, can_invite_others = ?, updated_at = ?
        WHERE id = ?
      `, [newRole, newAccessLevel, canInviteOthers, now, memberId]);

      // Log activity
      await this.logActivity(
        projectId, updatedBy, 'permission_changed',
        `Member role updated from ${memberToUpdate.role} to ${newRole}`,
        { 
          member_id: memberToUpdate.user_id,
          old_role: memberToUpdate.role,
          new_role: newRole
        },
        request
      );

      return { success: true, message: 'Member role updated successfully' };
    } catch (error) {
      console.error('Error updating member role:', error);
      return { success: false, message: 'Failed to update member role' };
    }
  }
}

export const collaborationService = new CollaborationService();
