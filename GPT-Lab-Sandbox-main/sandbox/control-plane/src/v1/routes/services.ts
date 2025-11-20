import { Router, Request, Response } from 'express';
import { db } from '../../database/init.js';

const router = Router();

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  type: 'ai-services' | 'data-catalog' | 'compute' | 'storage';
  status: 'active' | 'inactive' | 'maintenance';
  endpoint?: string;
  config: {
    enabled: boolean;
    maxConnections: number;
    timeout: number;
    retryAttempts: number;
    cacheEnabled: boolean;
    cacheExpiry: number;
    rateLimit: number;
    accessLevel: 'public' | 'restricted' | 'admin-only';
    autoScaling: boolean;
    monitoringEnabled: boolean;
    backupEnabled: boolean;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

// GET /api/services - Get all services
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, status, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        id,
        name,
        description,
        type,
        status,
        endpoint,
        config,
        created_at,
        updated_at,
        created_by
      FROM services 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const services = await db.all(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM services WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }

    const countResult = await db.get(countQuery, countParams);
    const total = countResult?.total || 0;

    res.json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

// GET /api/services/:id - Get specific service
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await db.get(`
      SELECT 
        id,
        name,
        description,
        type,
        status,
        endpoint,
        config,
        created_at,
        updated_at,
        created_by
      FROM services 
      WHERE id = ?
    `, [id]);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
        success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    });
  }
});

// POST /api/services - Create new service
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      type,
      endpoint,
      config
    } = req.body;

    // Validate required fields
    if (!name || !description || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and type are required'
      });
    }

    // Generate unique ID
    const id = `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Default configuration
    const defaultConfig = {
      enabled: true,
      maxConnections: 100,
      timeout: 30000,
      retryAttempts: 3,
      cacheEnabled: true,
      cacheExpiry: 3600,
      rateLimit: 1000,
      accessLevel: 'restricted',
      autoScaling: false,
      monitoringEnabled: true,
      backupEnabled: true,
      ...config
    };

    // Get user from request (assuming middleware sets req.user)
    const createdBy = (req as any).user?.id || 'system';

    await db.run(`
      INSERT INTO services (
        id, name, description, type, status, endpoint, config, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      name,
      description,
      type,
      'active',
      endpoint || null,
      JSON.stringify(defaultConfig),
      new Date().toISOString(),
      new Date().toISOString(),
      createdBy
    ]);

    // Fetch the created service
    const newService = await db.get(`
      SELECT 
        id,
        name,
        description,
        type,
        status,
        endpoint,
        config,
        created_at,
        updated_at,
        created_by
      FROM services 
      WHERE id = ?
    `, [id]);

    res.status(201).json({
      success: true,
      data: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service'
    });
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if service exists
    const existingService = await db.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Build update query dynamically
    const allowedFields = ['name', 'description', 'type', 'status', 'endpoint', 'config'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(key === 'config' ? JSON.stringify(value) : value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await db.run(`
      UPDATE services 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Fetch updated service
    const updatedService = await db.get(`
      SELECT 
        id,
        name,
        description,
        type,
        status,
        endpoint,
        config,
        created_at,
        updated_at,
        created_by
      FROM services 
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service'
    });
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existingService = await db.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    await db.run('DELETE FROM services WHERE id = ?', [id]);

      res.json({
        success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
});

// POST /api/services/:id/test - Test service connection
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await db.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Simulate connection test
    // In a real implementation, this would test the actual service endpoint
    const testResult = {
      success: Math.random() > 0.3, // 70% success rate for demo
      responseTime: Math.floor(Math.random() * 1000) + 100,
      timestamp: new Date().toISOString(),
      details: service.endpoint ? `Tested endpoint: ${service.endpoint}` : 'No endpoint configured'
    };

    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Error testing service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test service'
    });
  }
});

export { router as servicesRouter };
export default router;