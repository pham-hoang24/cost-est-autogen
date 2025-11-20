import { Router } from 'express';
import { db } from '../../database/init.js';

const router = Router();

// Simple governance endpoints without complex authentication
router.get('/users', async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, email, first_name, last_name, role, status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

router.get('/organizations', async (req, res) => {
  try {
    const organizations = await db.all(`
      SELECT o.*, u.email as admin_email, u.first_name, u.last_name
      FROM organizations o
      LEFT JOIN users u ON o.admin_user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    res.json({
      success: true,
      organizations: organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organizations'
    });
  }
});

router.post('/organizations', async (req, res) => {
  try {
    const { name, description, plan_type, storage_limit_gb, member_limit, admin_email } = req.body;
    
    // Get admin user
    const admin = await db.get('SELECT id FROM users WHERE email = ?', [admin_email]);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    const orgId = `org_${Date.now()}`;
    await db.run(`
      INSERT INTO organizations (id, name, description, admin_user_id, total_storage_limit, max_members, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `, [orgId, name, description, admin.id, storage_limit_gb, member_limit]);
    
    res.json({
      success: true,
      organization: {
        id: orgId,
        name,
        description,
        admin_id: admin.id,
        plan_type,
        storage_limit_gb,
        member_limit,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization'
    });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalUsers: 0,
      pendingUsers: 0,
      activeUsers: 0,
      totalOrganizations: 0,
      totalProjects: 0,
      resourceUtilization: {
        cpu: 0,
        gpu: 0,
        storage: 0
      }
    };
    
    // Get user stats
    const userStats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as active
      FROM users
    `);
    
    if (userStats) {
      stats.totalUsers = userStats.total;
      stats.pendingUsers = userStats.pending;
      stats.activeUsers = userStats.active;
    }
    
    // Get organization stats
    const orgStats = await db.get('SELECT COUNT(*) as total FROM organizations');
    if (orgStats) {
      stats.totalOrganizations = orgStats.total;
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard'
    });
  }
});

export default router;
