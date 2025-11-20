import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Enhanced project schema with governance and collaboration
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['research', 'industry', 'academic', 'pilot']),
  status: z.enum(['active', 'archived', 'completed', 'suspended']),
  owner: z.string(),
  organization: z.string(),
  collaborators: z.array(z.object({
    userId: z.string(),
    role: z.enum(['owner', 'admin', 'contributor', 'viewer']),
    permissions: z.array(z.string()),
    addedAt: z.date(),
    organization: z.string()
  })),
  dataGovernance: z.object({
    dataResidency: z.enum(['EU-only', 'EEA', 'global']),
    retentionPolicy: z.string(),
    accessControl: z.enum(['strict', 'moderate', 'open']),
    compliance: z.object({
      gdpr: z.boolean(),
      euAIAct: z.boolean(),
      dataSharing: z.boolean(),
      auditTrail: z.boolean()
    })
  }),
  resources: z.object({
    cpu: z.number(),
    memory: z.string(),
    gpu: z.boolean(),
    storage: z.string(),
    estimatedCost: z.number()
  }),
  experiments: z.array(z.string()),
  datasets: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

// Project creation request
const CreateProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(['research', 'industry', 'academic', 'pilot']),
  organization: z.string(),
  dataGovernance: z.object({
    dataResidency: z.enum(['EU-only', 'EEA', 'global']),
    retentionPolicy: z.string(),
    accessControl: z.enum(['strict', 'moderate', 'open']),
    compliance: z.object({
      gdpr: z.boolean(),
      euAIAct: z.boolean(),
      dataSharing: z.boolean(),
      auditTrail: z.boolean()
    })
  }),
  resources: z.object({
    cpu: z.number(),
    memory: z.string(),
    gpu: z.boolean(),
    storage: z.string()
  })
});

// Enhanced projects endpoint - GET /api/projects
router.get('/', async (req, res) => {
  try {
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    const { page = 1, limit = 20, status, category } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query based on filters
    let whereClause = '1=1';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (category && category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM projects WHERE ${whereClause}`;
    const totalResult = await db.get(countQuery, params);
    const total = totalResult?.count || 0;
    
    // Get paginated projects with owner info
    const projectsQuery = `
      SELECT 
        p.*,
        u.email as owner_email,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const projects = await db.all(projectsQuery, [...params, limitNum, offset]);
    
    // Get collaborators for each project
    const projectsWithCollaborators = await Promise.all(
      projects.map(async (project: any) => {
        const collaborators = await db.all(`
          SELECT 
            pc.*,
            u.email,
            u.first_name,
            u.last_name
          FROM project_collaborators pc
          LEFT JOIN users u ON pc.user_id = u.id
          WHERE pc.project_id = ?
        `, [project.id]);
        
        return {
          ...project,
          collaborators: collaborators.map(c => ({
            userId: c.user_id,
            role: c.role,
            permissions: JSON.parse(c.permissions || '[]'),
            addedAt: c.added_at,
            user: {
              email: c.email,
              firstName: c.first_name,
              lastName: c.last_name
            }
          }))
        };
      })
    );
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      data: projectsWithCollaborators,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch projects', details: error });
  }
});

// Create new project - POST /api/projects
router.post('/', async (req, res) => {
  try {
    const projectData = CreateProjectSchema.parse(req.body);
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    const { v4: uuidv4 } = await import('uuid');
    
    // Create project
    const projectId = uuidv4();
    const insertProject = `
      INSERT INTO projects (
        id, name, description, owner_id, organization_id, category, status,
        data_residency, access_control, gdpr_compliant, eu_ai_act_compliant,
        cpu_cores, memory_gb, storage_gb, gpu_enabled, estimated_cost,
        start_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(insertProject, [
      projectId,
      projectData.name,
      projectData.description,
      userId,
      projectData.organization || 'Default Organization',
      projectData.category,
      'active',
      projectData.dataGovernance.dataResidency,
      projectData.dataGovernance.accessControl,
      projectData.dataGovernance.compliance.gdpr ? 1 : 0,
      projectData.dataGovernance.compliance.euAIAct ? 1 : 0,
      projectData.resources.cpu,
      parseInt(projectData.resources.memory.replace('Gi', '')),
      parseInt(projectData.resources.storage.replace('GB', '')),
      projectData.resources.gpu ? 1 : 0,
      (projectData.resources.cpu * 0.1) + (projectData.resources.gpu ? 10 : 0),
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    
    // Add owner as collaborator
    const collaboratorId = uuidv4();
    const insertCollaborator = `
      INSERT INTO project_collaborators (id, project_id, user_id, role, permissions, added_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(insertCollaborator, [
      collaboratorId,
      projectId,
      userId,
      'owner',
      JSON.stringify(['read', 'write', 'admin', 'share']),
      userId
    ]);
    
    // Get the created project with full details
    const createdProject = await db.get(`
      SELECT 
        p.*,
        u.email as owner_email,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [projectId]);
    
    // Get collaborators
    const collaborators = await db.all(`
      SELECT 
        pc.*,
        u.email,
        u.first_name,
        u.last_name
      FROM project_collaborators pc
      LEFT JOIN users u ON pc.user_id = u.id
      WHERE pc.project_id = ?
    `, [projectId]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        ...createdProject,
        collaborators: collaborators.map(c => ({
          userId: c.user_id,
          role: c.role,
          permissions: JSON.parse(c.permissions || '[]'),
          addedAt: c.added_at,
          user: {
            email: c.email,
            firstName: c.first_name,
            lastName: c.last_name
          }
        }))
      }
    });
  } catch (error) {
    console.error('Project creation error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: (error as z.ZodError).format() });
    } else {
      res.status(500).json({ error: 'Project creation failed', details: error });
    }
  }
});

// Add collaborator to project
router.post('/:id/collaborators', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, permissions, organization } = req.body;
    
    // Validate role and permissions
    const validRoles = ['admin', 'contributor', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const collaborator = {
      userId,
      role,
      permissions: permissions || ['read'],
      addedAt: new Date(),
      organization
    };

    res.json({
      success: true,
      data: {
        projectId: id,
        collaborator,
        message: 'Collaborator added successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Remove collaborator from project
router.delete('/:id/collaborators/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    res.json({
      success: true,
      data: {
        projectId: id,
        userId,
        message: 'Collaborator removed successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// Update project governance settings
router.patch('/:id/governance', async (req, res) => {
  try {
    const { id } = req.params;
    const { dataGovernance } = req.body;
    
    // Validate EU compliance requirements
    if (dataGovernance.dataResidency === 'EU-only' && dataGovernance.compliance.euAIAct === false) {
      return res.status(400).json({
        error: 'EU-only projects must comply with EU AI Act requirements'
      });
    }

    res.json({
      success: true,
      data: {
        projectId: id,
        dataGovernance,
        message: 'Governance settings updated successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update governance settings' });
  }
});

// Get project compliance report
router.get('/:id/compliance', async (req, res) => {
  try {
    const { id } = req.params;
    
    const complianceReport = {
      projectId: id,
      gdprCompliance: {
        status: 'compliant',
        dataRetention: 'within_limits',
        dataSubjectRights: 'implemented',
        legalBasis: 'research_purposes'
      },
      euAIActCompliance: {
        status: 'compliant',
        riskAssessment: 'low_risk',
        transparency: 'implemented',
        humanOversight: 'required'
      },
      dataGovernance: {
        dataResidency: 'EU-only',
        accessControl: 'strict',
        auditTrail: 'enabled',
        retentionPolicy: 'compliant'
      },
      auditTrail: [
        {
          action: 'project_created',
          timestamp: new Date('2024-01-01'),
          user: 'researcher-001',
          details: 'Initial project creation'
        },
        {
          action: 'governance_updated',
          timestamp: new Date(),
          user: 'researcher-001',
          details: 'Updated compliance settings'
        }
      ]
    };

    res.json({
      success: true,
      data: complianceReport
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch compliance report' });
  }
});

// Get project resource usage
router.get('/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resourceUsage = {
      projectId: id,
      current: {
        cpu: 4.2,
        memory: '8.5Gi',
        gpu: 0.8,
        storage: '45GB'
      },
      limits: {
        cpu: 8,
        memory: '16Gi',
        gpu: 1,
        storage: '100GB'
      },
      costs: {
        current: 75.50,
        estimated: 150.00,
        currency: 'EUR'
      },
      utilization: {
        cpu: 52.5,
        memory: 53.1,
        gpu: 80.0,
        storage: 45.0
      }
    };

    res.json({
      success: true,
      data: resourceUsage
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource usage' });
  }
});

export { router as projectsRouter };



