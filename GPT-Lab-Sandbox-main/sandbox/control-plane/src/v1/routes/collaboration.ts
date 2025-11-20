import { Router, Request, Response } from 'express';
import { collaborationService, CreateProjectData } from '../../services/collaboration.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateInput } from '../../middleware/validation.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  project_type: z.enum(['research', 'ai_development', 'data_analysis', 'model_training']),
  visibility: z.enum(['private', 'organization', 'public']),
  legal_basis: z.enum(['consent', 'contract', 'legitimate_interest', 'research_exemption']),
  data_retention_days: z.number().min(30).max(2555).optional(), // 30 days to 7 years
  cross_border_transfers: z.boolean().optional(),
  max_collaborators: z.number().min(1).max(100).optional(),
  collaboration_model: z.enum(['open', 'invite_only', 'approval_required']).optional()
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'contributor', 'viewer', 'reviewer']),
  message: z.string().max(500).optional(),
  permissions: z.record(z.boolean()).optional()
});

const acceptInvitationSchema = z.object({
  invitation_token: z.string().min(1),
  data_sharing_consent: z.boolean(),
  ai_processing_consent: z.boolean(),
  cross_border_consent: z.boolean().optional()
});

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/collaboration/projects - Get user's projects
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, role, project_type, limit, offset } = req.query;
    
    const filters = {
      status: status as string,
      role: role as string,
      project_type: project_type as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    };

    const result = await collaborationService.getUserProjects(userId, filters);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          projects: result.projects,
          total: result.total,
          pagination: {
            limit: filters.limit || null,
            offset: filters.offset || 0,
            has_more: filters.limit ? result.projects!.length === filters.limit : false
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/collaboration/projects - Create new project
router.post('/projects', validateInput(createProjectSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectData: CreateProjectData = req.body;
    
    const result = await collaborationService.createProject(userId, projectData, req);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          project: result.project
        },
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/collaboration/projects/:id - Get project details
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    
    // Check if user is a member of the project
    const member = await collaborationService.getProjectMember(projectId, userId);
    
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project'
      });
    }
    
    const project = await collaborationService.getProjectDetails(projectId, userId);
    
    if (project.success) {
      res.json({
        success: true,
        data: project.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: project.message
      });
    }
  } catch (error) {
    console.error('Error getting project details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/collaboration/projects/:id/invite - Invite user to project
router.post('/projects/:id/invite', validateInput(inviteUserSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    const { email, role, message, permissions } = req.body;
    
    const result = await collaborationService.inviteUserToProject(
      projectId, userId, email, role, message, permissions, req
    );
    
    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          invitation: result.invitation
        },
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/collaboration/projects/:id/members - Get project members
router.get('/projects/:id/members', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    
    // Check if user has access to view members
    const member = await collaborationService.getProjectMember(projectId, userId);
    
    if (!member || member.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to view project members'
      });
    }
    
    const members = await collaborationService.getProjectMembers(projectId);
    
    res.json({
      success: true,
      data: {
        members: members.data
      }
    });
  } catch (error) {
    console.error('Error getting project members:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/collaboration/invitations/accept - Accept project invitation
router.post('/invitations/accept', validateInput(acceptInvitationSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { invitation_token, data_sharing_consent, ai_processing_consent, cross_border_consent } = req.body;
    
    const result = await collaborationService.acceptInvitation(
      invitation_token,
      userId,
      {
        data_sharing_consent,
        ai_processing_consent,
        cross_border_consent
      },
      req
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/collaboration/invitations - Get user's invitations
router.get('/invitations', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query;
    
    const invitations = await collaborationService.getUserInvitations(userId, status as string);
    
    res.json({
      success: true,
      data: {
        invitations: invitations.data
      }
    });
  } catch (error) {
    console.error('Error getting invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/collaboration/subscription/features - Get subscription features
router.get('/subscription/features', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const features = await collaborationService.getSubscriptionFeatures(userId);
    
    res.json({
      success: true,
      data: features.data
    });
  } catch (error) {
    console.error('Error getting subscription features:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/collaboration/projects/:id/activity - Get project activity log
router.get('/projects/:id/activity', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    const { limit = 50, offset = 0 } = req.query;
    
    // Check if user has access to view activity
    const member = await collaborationService.getProjectMember(projectId, userId);
    
    if (!member || member.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to view project activity'
      });
    }
    
    const activity = await collaborationService.getProjectActivity(
      projectId, 
      parseInt(limit as string), 
      parseInt(offset as string)
    );
    
    res.json({
      success: true,
      data: activity.data
    });
  } catch (error) {
    console.error('Error getting project activity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/collaboration/projects/:id/members/:userId - Remove member from project
router.delete('/projects/:id/members/:memberId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    
    const result = await collaborationService.removeMemberFromProject(
      projectId, memberId, userId, req
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/collaboration/projects/:id/members/:memberId/role - Update member role
router.put('/projects/:id/members/:memberId/role', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    const memberId = req.params.memberId;
    const { role } = req.body;
    
    if (!['admin', 'contributor', 'viewer', 'reviewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    const result = await collaborationService.updateMemberRole(
      projectId, memberId, role, userId, req
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export { router as collaborationRouter };
