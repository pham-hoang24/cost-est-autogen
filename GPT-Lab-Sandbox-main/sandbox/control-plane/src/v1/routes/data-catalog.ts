import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Data catalog schema
const DataCatalogSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(['research', 'industry', 'public', 'sensitive']),
  data_type: z.enum(['structured', 'unstructured', 'time_series', 'images', 'text']),
  size_gb: z.number(),
  record_count: z.number(),
  access_level: z.enum(['public', 'restricted', 'private']),
  gdpr_compliant: z.boolean(),
  data_residency: z.enum(['EU-only', 'EEA', 'global']),
  license_type: z.string(),
  tags: z.array(z.string())
});

// GET /api/data-catalog - List all datasets
router.get('/', async (req, res) => {
  try {
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    const { page = 1, limit = 20, category, data_type, access_level } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query based on filters
    let whereClause = '1=1';
    const params: any[] = [];
    
    if (category && category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    
    if (data_type && data_type !== 'all') {
      whereClause += ' AND data_type = ?';
      params.push(data_type);
    }
    
    if (access_level && access_level !== 'all') {
      whereClause += ' AND access_level = ?';
      params.push(access_level);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM data_catalog WHERE ${whereClause}`;
    const totalResult = await db.get(countQuery, params);
    const total = totalResult?.count || 0;
    
    // Get paginated datasets with owner info
    const datasetsQuery = `
      SELECT 
        dc.*,
        u.email as owner_email,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM data_catalog dc
      LEFT JOIN users u ON dc.owner_id = u.id
      WHERE ${whereClause}
      ORDER BY dc.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const datasets = await db.all(datasetsQuery, [...params, limitNum, offset]);
    
    // Parse tags for each dataset
    const datasetsWithTags = datasets.map((dataset: any) => ({
      ...dataset,
      tags: JSON.parse(dataset.tags || '[]'),
      gdpr_compliant: Boolean(dataset.gdpr_compliant)
    }));
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      data: datasetsWithTags,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Data catalog fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data catalog', details: error });
  }
});

// GET /api/data-catalog/:id - Get specific dataset
router.get('/:id', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    const { id } = req.params;
    
    const dataset = await db.get(`
      SELECT 
        dc.*,
        u.email as owner_email,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM data_catalog dc
      LEFT JOIN users u ON dc.owner_id = u.id
      WHERE dc.id = ?
    `, [id]);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    res.json({
      success: true,
      data: {
        ...dataset,
        tags: JSON.parse(dataset.tags || '[]'),
        gdpr_compliant: Boolean(dataset.gdpr_compliant)
      }
    });
  } catch (error) {
    console.error('Dataset fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dataset', details: error });
  }
});

// POST /api/data-catalog - Create new dataset
router.post('/', async (req, res) => {
  try {
    const datasetData = DataCatalogSchema.parse(req.body);
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const { db } = await import('../../database/init.js');
    const { v4: uuidv4 } = await import('uuid');
    
    const datasetId = uuidv4();
    const insertDataset = `
      INSERT INTO data_catalog (
        id, name, description, category, data_type, size_gb, record_count,
        owner_id, organization_id, access_level, gdpr_compliant, data_residency,
        license_type, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(insertDataset, [
      datasetId,
      datasetData.name,
      datasetData.description,
      datasetData.category,
      datasetData.data_type,
      datasetData.size_gb,
      datasetData.record_count,
      userId,
      'Default Organization',
      datasetData.access_level,
      datasetData.gdpr_compliant ? 1 : 0,
      datasetData.data_residency,
      datasetData.license_type,
      JSON.stringify(datasetData.tags),
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    
    // Get the created dataset
    const createdDataset = await db.get(`
      SELECT 
        dc.*,
        u.email as owner_email,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM data_catalog dc
      LEFT JOIN users u ON dc.owner_id = u.id
      WHERE dc.id = ?
    `, [datasetId]);

    res.status(201).json({
      success: true,
      message: 'Dataset created successfully',
      data: {
        ...createdDataset,
        tags: JSON.parse(createdDataset.tags || '[]'),
        gdpr_compliant: Boolean(createdDataset.gdpr_compliant)
      }
    });
  } catch (error) {
    console.error('Dataset creation error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: (error as z.ZodError).format() });
    } else {
      res.status(500).json({ error: 'Dataset creation failed', details: error });
    }
  }
});

export { router as dataCatalogRouter };
