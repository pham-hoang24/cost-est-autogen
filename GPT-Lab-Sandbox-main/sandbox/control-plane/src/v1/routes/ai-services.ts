import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// AI Service schema
const AIServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  service_type: z.enum(['llm', 'ml_model', 'nlp', 'computer_vision', 'speech', 'recommendation']),
  model_name: z.string(),
  version: z.string(),
  endpoint_url: z.string(),
  status: z.enum(['active', 'maintenance', 'deprecated']),
  access_level: z.enum(['public', 'restricted', 'private']),
  cost_per_request: z.number(),
  max_requests_per_day: z.number(),
  requires_gpu: z.boolean(),
  gdpr_compliant: z.boolean()
});

// GET /api/ai-services - List all AI services
router.get('/', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    
    const { page = 1, limit = 20, service_type, access_level, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query based on filters
    let whereClause = '1=1';
    const params: any[] = [];
    
    if (service_type && service_type !== 'all') {
      whereClause += ' AND service_type = ?';
      params.push(service_type);
    }
    
    if (access_level && access_level !== 'all') {
      whereClause += ' AND access_level = ?';
      params.push(access_level);
    }
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM ai_services WHERE ${whereClause}`;
    const totalResult = await db.get(countQuery, params);
    const total = totalResult?.count || 0;
    
    // Get paginated services
    const servicesQuery = `
      SELECT * FROM ai_services 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const services = await db.all(servicesQuery, [...params, limitNum, offset]);
    
    // Convert boolean fields
    const servicesWithBooleans = services.map((service: any) => ({
      ...service,
      requires_gpu: Boolean(service.requires_gpu),
      gdpr_compliant: Boolean(service.gdpr_compliant)
    }));
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      data: servicesWithBooleans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('AI services fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch AI services', details: error });
  }
});

// GET /api/ai-services/:id - Get specific AI service
router.get('/:id', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    const { id } = req.params;
    
    const service = await db.get('SELECT * FROM ai_services WHERE id = ?', [id]);
    
    if (!service) {
      return res.status(404).json({ error: 'AI service not found' });
    }
    
    res.json({
      success: true,
      data: {
        ...service,
        requires_gpu: Boolean(service.requires_gpu),
        gdpr_compliant: Boolean(service.gdpr_compliant)
      }
    });
  } catch (error) {
    console.error('AI service fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch AI service', details: error });
  }
});

// GET /api/ai-services/:id/access - Get user access to AI service
router.get('/:id/access', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    // Check if user has access to this service
    const access = await db.get(`
      SELECT usa.*, as.name as service_name 
      FROM user_service_access usa
      JOIN ai_services as ON usa.service_id = as.id
      WHERE usa.user_id = ? AND usa.service_id = ?
    `, [userId, id]);
    
    if (!access) {
      return res.json({
        success: true,
        data: {
          has_access: false,
          message: 'No access granted to this service'
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        has_access: Boolean(access.access_granted),
        daily_limit: access.daily_limit,
        monthly_limit: access.monthly_limit,
        used_today: access.used_today,
        used_this_month: access.used_this_month,
        granted_at: access.granted_at,
        expires_at: access.expires_at,
        service_name: access.service_name
      }
    });
  } catch (error) {
    console.error('Service access check error:', error);
    res.status(500).json({ error: 'Failed to check service access', details: error });
  }
});

// POST /api/ai-services/:id/request - Request access to AI service
router.post('/:id/request', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const { justification, daily_limit, monthly_limit } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    // Check if service exists
    const service = await db.get('SELECT * FROM ai_services WHERE id = ?', [id]);
    if (!service) {
      return res.status(404).json({ error: 'AI service not found' });
    }
    
    // Check if user already has access
    const existingAccess = await db.get(`
      SELECT * FROM user_service_access 
      WHERE user_id = ? AND service_id = ?
    `, [userId, id]);
    
    if (existingAccess) {
      return res.status(400).json({ error: 'Access already granted or requested' });
    }
    
    // Create access request (pending approval)
    const { v4: uuidv4 } = await import('uuid');
    const accessId = uuidv4();
    
    await db.run(`
      INSERT INTO user_service_access (
        id, user_id, service_id, access_granted, daily_limit, monthly_limit,
        granted_by, granted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      accessId,
      userId,
      id,
      0, // Not granted yet, needs admin approval
      daily_limit || 100,
      monthly_limit || 1000,
      'pending_approval',
      new Date().toISOString()
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Access request submitted for approval',
      data: {
        access_id: accessId,
        service_name: service.name,
        status: 'pending_approval'
      }
    });
  } catch (error) {
    console.error('Service access request error:', error);
    res.status(500).json({ error: 'Failed to request service access', details: error });
  }
});

// POST /api/ai-services/:id/grant-access - Grant access to AI service (admin only)
router.post('/:id/grant-access', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    const { id } = req.params;
    const { user_id, daily_limit, monthly_limit, expires_at } = req.body;
    const adminId = req.headers['x-user-id'] as string;
    
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    // Check if service exists
    const service = await db.get('SELECT * FROM ai_services WHERE id = ?', [id]);
    if (!service) {
      return res.status(404).json({ error: 'AI service not found' });
    }
    
    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if access already exists
    const existingAccess = await db.get(`
      SELECT * FROM user_service_access 
      WHERE user_id = ? AND service_id = ?
    `, [user_id, id]);
    
    if (existingAccess) {
      // Update existing access
      await db.run(`
        UPDATE user_service_access 
        SET access_granted = 1, daily_limit = ?, monthly_limit = ?, 
            granted_by = ?, granted_at = ?, expires_at = ?
        WHERE user_id = ? AND service_id = ?
      `, [
        daily_limit || 100,
        monthly_limit || 1000,
        adminId,
        new Date().toISOString(),
        expires_at,
        user_id,
        id
      ]);
    } else {
      // Create new access
      const { v4: uuidv4 } = await import('uuid');
      const accessId = uuidv4();
      
      await db.run(`
        INSERT INTO user_service_access (
          id, user_id, service_id, access_granted, daily_limit, monthly_limit,
          granted_by, granted_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        accessId,
        user_id,
        id,
        1, // Granted
        daily_limit || 100,
        monthly_limit || 1000,
        adminId,
        new Date().toISOString(),
        expires_at
      ]);
    }
    
    res.json({
      success: true,
      message: 'Access granted successfully',
      data: {
        user_email: user.email,
        service_name: service.name,
        daily_limit: daily_limit || 100,
        monthly_limit: monthly_limit || 1000,
        granted_by: adminId,
        expires_at: expires_at
      }
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({ error: 'Failed to grant access', details: error });
  }
});

// POST /api/ai-services - Create new AI service (admin only)
router.post('/', async (req, res) => {
  try {
    const serviceData = AIServiceSchema.parse(req.body);
    const adminId = req.headers['x-user-id'] as string;
    
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const { db } = await import('../../database/init.js');
    const { v4: uuidv4 } = await import('uuid');
    
    const serviceId = uuidv4();
    const insertService = `
      INSERT INTO ai_services (
        id, name, description, service_type, model_name, version, endpoint_url,
        status, access_level, cost_per_request, max_requests_per_day,
        requires_gpu, gdpr_compliant, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(insertService, [
      serviceId,
      serviceData.name,
      serviceData.description,
      serviceData.service_type,
      serviceData.model_name,
      serviceData.version,
      serviceData.endpoint_url,
      serviceData.status,
      serviceData.access_level,
      serviceData.cost_per_request,
      serviceData.max_requests_per_day,
      serviceData.requires_gpu ? 1 : 0,
      serviceData.gdpr_compliant ? 1 : 0,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    
    // Get the created service
    const createdService = await db.get('SELECT * FROM ai_services WHERE id = ?', [serviceId]);

    res.status(201).json({
      success: true,
      message: 'AI service created successfully',
      data: {
        ...createdService,
        requires_gpu: Boolean(createdService.requires_gpu),
        gdpr_compliant: Boolean(createdService.gdpr_compliant)
      }
    });
  } catch (error) {
    console.error('AI service creation error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: (error as z.ZodError).format() });
    } else {
      res.status(500).json({ error: 'AI service creation failed', details: error });
    }
  }
});

export { router as aiServicesRouter };
