import { Router } from 'express';
import { verifyToken } from '../../services/auth.js';

const router = Router();

// Governance Dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Get real statistics from database
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const pendingUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE status = "pending"');
    const activeUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE status = "approved"');
    
    const stats = {
      totalUsers: totalUsers?.count || 0,
      pendingUsers: pendingUsers?.count || 0,
      activeUsers: activeUsers?.count || 0,
      totalProjects: 0, // TODO: Connect to projects table
      totalExperiments: 0, // TODO: Connect to experiments table
      resourceUtilization: {
        cpu: 0, // TODO: Calculate from resource_quotas
        gpu: 0,
        storage: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Governance dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load governance dashboard'
    });
  }
});

// Mock data for development/testing
let mockUsers = [
  {
    id: '1',
    user_id: 'user-001',
    email: 'dr.smith@university.edu',
    role_type: 'researcher',
    organization_name: 'AI Research Lab',
    status: 'pending',
    created_at: new Date().toISOString(),
    cpu_hours_limit: 100,
    gpu_hours_limit: 10,
    storage_gb_limit: 50,
    used_cpu_hours: 0,
    used_gpu_hours: 0,
    used_storage_gb: 0
  },
  {
    id: '2',
    user_id: 'user-002',
    email: 'research.lead@tech.corp',
    role_type: 'research_admin',
    organization_name: 'Tech Corp Research',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    approved_at: new Date(Date.now() - 3600000).toISOString(),
    approved_by: 'admin@sw4e.org',
    cpu_hours_limit: 500,
    gpu_hours_limit: 50,
    storage_gb_limit: 200,
    used_cpu_hours: 120,
    used_gpu_hours: 15,
    used_storage_gb: 45
  },
  {
    id: '3',
    user_id: 'user-003',
    email: 'jane.researcher@university.edu',
    role_type: 'researcher',
    organization_name: 'Machine Learning Lab',
    status: 'approved',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    approved_at: new Date(Date.now() - 86400000).toISOString(),
    approved_by: 'admin@sw4e.org',
    cpu_hours_limit: 200,
    gpu_hours_limit: 20,
    storage_gb_limit: 100,
    used_cpu_hours: 80,
    used_gpu_hours: 12,
    used_storage_gb: 35
  }
];

let mockAudit = [
  {
    id: 1,
    action_type: 'user_approved',
    actor_id: 'admin-001',
    actor_email: 'admin@sw4e.org',
    action_description: 'Approved researcher registration for research.lead@tech.corp',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    risk_level: 'medium'
  },
  {
    id: 2,
    action_type: 'quota_updated',
    actor_id: 'admin-001',
    actor_email: 'admin@sw4e.org',
    action_description: 'Increased GPU quota for ML team from 50 to 100 hours',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    risk_level: 'low'
  }
];

console.log('✅ Governance mock data initialized successfully');

// Utility function to log governance actions
const logGovernanceAction = (
  actionType: string,
  actorId: string,
  actorEmail: string,
  actionDescription: string,
  targetId?: string,
  targetEmail?: string,
  oldValues?: any,
  newValues?: any,
  riskLevel: string = 'low'
) => {
  const newAuditEntry = {
    id: mockAudit.length + 1,
    action_type: actionType,
    actor_id: actorId,
    actor_email: actorEmail,
    target_id: targetId,
    target_email: targetEmail,
    action_description: actionDescription,
    old_values: oldValues || {},
    new_values: newValues || {},
    risk_level: riskLevel,
    created_at: new Date().toISOString()
  };
  
  mockAudit.unshift(newAuditEntry); // Add to beginning
};

// ==============================================================================
// USER MANAGEMENT ROUTES
// ==============================================================================

// GET /api/governance/users - List all users with their roles and status
router.get('/users', async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Build query based on filters
    let whereClause = '1=1';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (role && role !== 'all') {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM users WHERE ${whereClause}`;
    const totalResult = await db.get(countQuery, params);
    const total = totalResult?.count || 0;
    
    // Get paginated users
    const usersQuery = `
      SELECT 
        id,
        id as user_id,
        email,
        first_name,
        last_name,
        role as role_type,
        status,
        organization,
        created_at,
        approved_at,
        approved_by
      FROM users 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const users = await db.all(usersQuery, [...params, limitNum, offset]);
    
    // Get resource quotas for each user
    const usersWithQuotas = await Promise.all(
      users.map(async (user: any) => {
        const quota = await db.get(
          'SELECT * FROM resource_quotas WHERE user_id = ?',
          [user.id]
        );
        return {
          ...user,
          cpu_hours_limit: quota?.cpu_hours_limit || 100,
          gpu_hours_limit: quota?.gpu_hours_limit || 10,
          storage_gb_limit: quota?.storage_gb_limit || 50,
          used_cpu_hours: quota?.used_cpu_hours || 0,
          used_gpu_hours: quota?.used_gpu_hours || 0,
          used_storage_gb: quota?.used_storage_gb || 0,
          organization_name: user.organization || 'Default Organization'
        };
      })
    );
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      data: usersWithQuotas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// POST /api/governance/users - Create new user (registration)
router.post('/users', async (req, res) => {
  try {
    const { email, role_type = 'viewer', organization_id, organization_name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user_id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM user_roles WHERE email = ?', [email]);
    
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Create user role record
    const userQuery = `
      INSERT INTO user_roles (user_id, email, role_type, organization_id, organization_name, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      await db.run(userQuery, [user_id, email, role_type, organization_id, organization_name, 'pending']);
      
      // Create default resource quota
      const quotaQuery = `
        INSERT INTO resource_quotas (user_id, organization_id)
        VALUES (?, ?)
      `;
      
      try {
        await db.run(quotaQuery, [user_id, organization_id]);
      } catch (quotaErr) {
        console.error('Failed to create resource quota:', quotaErr);
      }
      
      // Log governance action
      try {
        logGovernanceAction(
          'user_registered',
          user_id,
          email,
          `New user registered: ${email} with role ${role_type}`,
          user_id,
          email,
          {},
          { email, role_type, status: 'pending' },
          'medium'
        );
      } catch (logErr) {
        console.error('Failed to log governance action:', logErr);
      }
      
      res.status(201).json({
        success: true,
        message: 'User registration submitted for approval',
        data: {
          user_id,
          email,
          role_type,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      res.status(500).json({ error: 'Failed to create user', details: error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// PUT /api/governance/users/:userId/approve - Approve user registration
router.put('/users/:userId/approve', async (req, res) => {
  try {
    const { userId } = req.params;
    const { approved_by, approval_notes } = req.body;
    
    if (!approved_by) {
      return res.status(400).json({ error: 'Approver information is required' });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Get current user data from the real users table
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({ error: 'User is not in pending status' });
    }
    
    // Update user status to approved
    const updateQuery = `
      UPDATE users 
      SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.run(updateQuery, [approved_by, userId]);
    
    // Log governance action (if audit table exists)
    try {
      await db.run(`
        INSERT INTO governance_audit (action_type, actor_id, actor_email, action_description, target_id, target_email, old_values, new_values, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        'user_approved',
        approved_by,
        approved_by,
        `User approved: ${user.email}`,
        userId,
        user.email,
        JSON.stringify({ status: 'pending' }),
        JSON.stringify({ status: 'approved', approved_by, approval_notes })
      ]);
    } catch (auditError) {
      console.log('Audit logging skipped (table may not exist)');
    }
    
    res.json({
      success: true,
      message: 'User approved successfully',
      data: {
        user_id: userId,
        email: user.email,
        status: 'approved',
        approved_by,
        approved_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// PUT /api/governance/users/:userId/reject - Reject user registration
router.put('/users/:userId/reject', async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejected_by, rejection_reason } = req.body;
    
    if (!rejected_by || !rejection_reason) {
      return res.status(400).json({ error: 'Rejector information and reason are required' });
    }
    
    // Get current user data
    db.get('SELECT * FROM user_roles WHERE user_id = ?', [userId], (err, user: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update user status to rejected
      const updateQuery = `
        UPDATE user_roles 
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      db.run(updateQuery, [userId], function(updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to reject user', details: updateErr.message });
        }
        
        // Log governance action
        logGovernanceAction(
          'user_rejected',
          rejected_by,
          rejected_by,
          `User rejected: ${user.email} - Reason: ${rejection_reason}`,
          userId,
          user.email,
          { status: 'pending' },
          { status: 'rejected', rejected_by, rejection_reason },
          'medium'
        );
        
        res.json({
          success: true,
          message: 'User rejected',
          data: {
            user_id: userId,
            email: user.email,
            status: 'rejected',
            rejection_reason
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// DELETE /api/governance/users/:userId - Delete user (soft delete, admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, permanent = false } = req.body;

    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;

    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Import database connection
    const { db } = await import('../../database/init.js');

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deletion of super_admin users
    if (existingUser.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete super admin users'
      });
    }

    if (permanent) {
      // Permanent deletion - remove from all tables
      await db.run('DELETE FROM users WHERE id = ?', [userId]);
      
      // Log the permanent deletion
      await db.run(`
        INSERT INTO user_history (id, user_id, action_type, actor_id, actor_email, old_values, new_values, action_description, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        'permanently_deleted',
        currentUser.id,
        currentUser.email,
        JSON.stringify(existingUser),
        JSON.stringify({}),
        `User permanently deleted by ${currentUser.email}. Reason: ${reason || 'No reason provided'}`,
        req.ip || 'unknown'
      ]);

      res.json({
        success: true,
        message: 'User permanently deleted',
        data: { userId, deleted_at: new Date().toISOString() }
      });
    } else {
      // Soft delete - move to deleted_users table
      const deletedUserId = `deleted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await db.run(`
        INSERT INTO deleted_users (
          id, original_user_id, email, first_name, last_name, organization, role, status,
          signup_reason, research_area, created_at, updated_at, approved_at, approved_by,
          last_login, deleted_by, deleted_by_email, deletion_reason, can_restore
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        deletedUserId,
        userId,
        existingUser.email,
        existingUser.first_name,
        existingUser.last_name,
        existingUser.organization,
        existingUser.role,
        existingUser.status,
        existingUser.signup_reason,
        existingUser.research_area,
        existingUser.created_at,
        existingUser.updated_at,
        existingUser.approved_at,
        existingUser.approved_by,
        existingUser.last_login,
        currentUser.id,
        currentUser.email,
        reason || 'No reason provided',
        1 // can_restore = true
      ]);

      // Delete from users table
      await db.run('DELETE FROM users WHERE id = ?', [userId]);

      // Log the soft deletion
      await db.run(`
        INSERT INTO user_history (id, user_id, action_type, actor_id, actor_email, old_values, new_values, action_description, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        'deleted',
        currentUser.id,
        currentUser.email,
        JSON.stringify(existingUser),
        JSON.stringify({ deleted_by: currentUser.email, reason: reason || 'No reason provided' }),
        `User deleted by ${currentUser.email}. Reason: ${reason || 'No reason provided'}`,
        req.ip || 'unknown'
      ]);

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: { 
          userId, 
          deleted_at: new Date().toISOString(),
          can_restore: true,
          deletion_reason: reason || 'No reason provided'
        }
      });
    }

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// GET /api/governance/users/deleted - Get deleted users (admin only)
router.get('/users/deleted', async (req, res) => {
  try {
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;

    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Import database connection
    const { db } = await import('../../database/init.js');

    const deletedUsers = await db.all(`
      SELECT * FROM deleted_users 
      ORDER BY deleted_at DESC
    `);

    res.json({
      success: true,
      data: deletedUsers
    });

  } catch (error) {
    console.error('Error fetching deleted users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deleted users'
    });
  }
});

// POST /api/governance/users/:userId/restore - Restore deleted user (admin only)
router.post('/users/:userId/restore', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;

    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Import database connection
    const { db } = await import('../../database/init.js');

    // Find the deleted user record
    const deletedUser = await db.get(`
      SELECT * FROM deleted_users 
      WHERE original_user_id = ? AND can_restore = 1
      ORDER BY deleted_at DESC
      LIMIT 1
    `, [userId]);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'Deleted user not found or cannot be restored'
      });
    }

    // Check if email already exists in users table
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [deletedUser.email]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists'
      });
    }

    // Restore user to users table
    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.run(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, organization, role, status,
        signup_reason, research_area, created_at, updated_at, approved_at, approved_by, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newUserId,
      deletedUser.email,
      'restored_user_password_hash', // Will need to reset password
      deletedUser.first_name,
      deletedUser.last_name,
      deletedUser.organization,
      deletedUser.role,
      'approved', // Restored users are automatically approved
      deletedUser.signup_reason,
      deletedUser.research_area,
      deletedUser.created_at,
      new Date().toISOString(),
      deletedUser.approved_at,
      currentUser.email, // Updated approval info
      deletedUser.last_login
    ]);

    // Create default resource quota
    await db.run(`
      INSERT INTO resource_quotas (user_id, organization_id, cpu_hours_limit, gpu_hours_limit, storage_gb_limit)
      VALUES (?, ?, ?, ?, ?)
    `, [newUserId, null, 100, 10, 50]);

    // Log the restoration
    await db.run(`
      INSERT INTO user_history (id, user_id, action_type, actor_id, actor_email, old_values, new_values, action_description, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      newUserId,
      'restored',
      currentUser.id,
      currentUser.email,
      JSON.stringify(deletedUser),
      JSON.stringify({ restored_by: currentUser.email }),
      `User restored by ${currentUser.email}`,
      req.ip || 'unknown'
    ]);

    // Remove from deleted_users table
    await db.run('DELETE FROM deleted_users WHERE id = ?', [deletedUser.id]);

    res.json({
      success: true,
      message: 'User restored successfully',
      data: { 
        userId: newUserId,
        email: deletedUser.email,
        restored_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore user'
    });
  }
});

// GET /api/governance/users/:userId/history - Get user history (admin only)
router.get('/users/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;

    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Import database connection
    const { db } = await import('../../database/init.js');

    const history = await db.all(`
      SELECT * FROM user_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user history'
    });
  }
});

// PUT /api/governance/users/:userId - Update user information (admin only)
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Build update query dynamically (only fields that exist in database)
    const allowedFields = [
      'first_name', 'last_name', 'email', 'role', 'status', 
      'organization', 'signup_reason', 'research_area'
    ];
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    // Add updated_at (updated_by column doesn't exist in database)
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(userId);
    
    await db.run(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);
    
    // Fetch updated user with quotas (same as GET endpoint)
    const updatedUser = await db.get(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.organization, 
        u.role, u.status, u.signup_reason, u.research_area, 
        u.created_at, u.updated_at, u.last_login, u.approved_at, u.approved_by,
        rq.cpu_hours_limit, rq.gpu_hours_limit, rq.storage_gb_limit,
        rq.used_cpu_hours, rq.used_gpu_hours, rq.used_storage_gb
      FROM users u
      LEFT JOIN resource_quotas rq ON u.id = rq.user_id
      WHERE u.id = ?
    `, [userId]);
    
    // Add organization name
    const userWithQuota = {
      ...updatedUser,
      cpu_hours_limit: updatedUser.cpu_hours_limit || 100,
      gpu_hours_limit: updatedUser.gpu_hours_limit || 10,
      storage_gb_limit: updatedUser.storage_gb_limit || 50,
      used_cpu_hours: updatedUser.used_cpu_hours || 0,
      used_gpu_hours: updatedUser.used_gpu_hours || 0,
      used_storage_gb: updatedUser.used_storage_gb || 0,
      organization_name: updatedUser.organization || 'Default Organization'
    };
    
    // Log user history
    try {
      await db.run(`
        INSERT INTO user_history (id, user_id, action_type, actor_id, actor_email, old_values, new_values, action_description, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        'updated',
        currentUser.id,
        currentUser.email,
        JSON.stringify(existingUser),
        JSON.stringify(updates),
        `User updated by ${currentUser.email}`,
        req.ip || 'unknown'
      ]);
    } catch (historyError) {
      console.log('User history logging skipped (table may not exist):', historyError.message);
    }

    // Log audit action (skip if audit_log table doesn't exist)
    try {
      await db.run(`
        INSERT INTO audit_log (action_type, actor_id, actor_email, action_description, target_id, target_email, old_values, new_values, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        'user_updated',
        currentUser.email,
        currentUser.email,
        `User updated: ${updatedUser.email}`,
        userId,
        updatedUser.email,
        JSON.stringify(existingUser),
        JSON.stringify(updates)
      ]);
    } catch (auditError) {
      console.log('Audit logging skipped (table may not exist):', auditError.message);
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: userWithQuota
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// ==============================================================================
// BULK OPERATIONS ENDPOINTS
// ==============================================================================

// POST /api/governance/users/bulk-approve - Bulk approve users
router.post('/users/bulk-approve', async (req, res) => {
  try {
    const { userIds, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    const results = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        // Check if user exists
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }
        
        // Skip if already approved
        if (user.status === 'approved') {
          results.push({ userId, status: 'already_approved' });
          continue;
        }
        
        // Update user status
        await db.run(`
          UPDATE users 
          SET status = 'approved', 
              approved_at = ?, 
              approved_by = ?
          WHERE id = ?
        `, [new Date().toISOString(), currentUser.email, userId]);
        
        // Log action
        await db.run(`
          INSERT INTO user_history (
            id, user_id, action_type, actor_id, actor_email,
            new_values, action_description, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          'status_changed',
          currentUser.id,
          currentUser.email,
          JSON.stringify({ status: 'approved', reason: reason || 'Bulk approval' }),
          `User approved via bulk operation${reason ? `: ${reason}` : ''}`,
          new Date().toISOString()
        ]);
        
        results.push({ userId, status: 'approved' });
      } catch (error) {
        console.error(`Error approving user ${userId}:`, error);
        errors.push({ userId, error: error.message || 'Unknown error' });
      }
    }
    
    res.json({
      success: true,
      data: {
        approved: results.filter(r => r.status === 'approved').length,
        already_approved: results.filter(r => r.status === 'already_approved').length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    console.error('Error in bulk approve:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk approve users'
    });
  }
});

// POST /api/governance/users/bulk-reject - Bulk reject users
router.post('/users/bulk-reject', async (req, res) => {
  try {
    const { userIds, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    const results = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        // Check if user exists
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }
        
        // Skip if already rejected
        if (user.status === 'rejected') {
          results.push({ userId, status: 'already_rejected' });
          continue;
        }
        
        // Update user status
        await db.run(`
          UPDATE users 
          SET status = 'rejected', 
              updated_at = ?
          WHERE id = ?
        `, [new Date().toISOString(), userId]);
        
        // Log action
        await db.run(`
          INSERT INTO user_history (
            id, user_id, action_type, actor_id, actor_email,
            new_values, action_description, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          'status_changed',
          currentUser.id,
          currentUser.email,
          JSON.stringify({ status: 'rejected', reason: reason || 'Bulk rejection' }),
          `User rejected via bulk operation${reason ? `: ${reason}` : ''}`,
          new Date().toISOString()
        ]);
        
        results.push({ userId, status: 'rejected' });
      } catch (error) {
        console.error(`Error rejecting user ${userId}:`, error);
        errors.push({ userId, error: error.message || 'Unknown error' });
      }
    }
    
    res.json({
      success: true,
      data: {
        rejected: results.filter(r => r.status === 'rejected').length,
        already_rejected: results.filter(r => r.status === 'already_rejected').length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    console.error('Error in bulk reject:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk reject users'
    });
  }
});

// POST /api/governance/users/bulk-delete - Bulk delete users
router.post('/users/bulk-delete', async (req, res) => {
  try {
    const { userIds, reason, permanent = false } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser || (currentUser.role !== 'super_admin' && currentUser.role !== 'research_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    // Import database connection
    const { db } = await import('../../database/init.js');
    
    const results = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        // Check if user exists
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }
        
        // Prevent super admin deletion
        if (user.role === 'super_admin') {
          errors.push({ userId, error: 'Cannot delete super admin' });
          continue;
        }
        
        if (permanent) {
          // Permanent delete - remove from users table
          await db.run('DELETE FROM users WHERE id = ?', [userId]);
          await db.run('DELETE FROM user_history WHERE user_id = ?', [userId]);
          await db.run('DELETE FROM deleted_users WHERE original_user_id = ?', [userId]);
          
          results.push({ userId, status: 'permanently_deleted' });
        } else {
          // Soft delete - move to deleted_users table
          await db.run(`
            INSERT INTO deleted_users (
              id, original_user_id, email, first_name, last_name,
              organization, role, status, signup_reason, research_area,
              created_at, updated_at, approved_at, approved_by, last_login,
              deleted_at, deleted_by, deleted_by_email, deletion_reason, can_restore
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            `deleted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user.id,
            user.email,
            user.first_name,
            user.last_name,
            user.organization,
            user.role,
            user.status,
            user.signup_reason,
            user.research_area,
            user.created_at,
            user.updated_at,
            user.approved_at,
            user.approved_by,
            user.last_login,
            new Date().toISOString(),
            currentUser.id,
            currentUser.email,
            reason || 'Bulk deletion',
            1
          ]);
          
          // Remove from users table
          await db.run('DELETE FROM users WHERE id = ?', [userId]);
          
          // Log action
          await db.run(`
            INSERT INTO user_history (
              id, user_id, action_type, actor_id, actor_email,
              action_description, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            'deleted',
            currentUser.id,
            currentUser.email,
            `User soft deleted via bulk operation${reason ? `: ${reason}` : ''}`,
            new Date().toISOString()
          ]);
          
          results.push({ userId, status: 'soft_deleted' });
        }
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        errors.push({ userId, error: error.message || 'Unknown error' });
      }
    }
    
    res.json({
      success: true,
      data: {
        deleted: results.length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk delete users'
    });
  }
});

// ==============================================================================
// APPROVAL WORKFLOWS ROUTES
// ==============================================================================

// GET /api/governance/approvals - Get pending approvals
router.get('/approvals', async (req, res) => {
  try {
    const { status = 'pending', type, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    // Create mock approvals based on pending users
    const mockApprovals = mockUsers
      .filter(user => user.status === status)
      .map((user, index) => ({
        id: index + 1,
        request_type: 'user_registration',
        requester_id: user.user_id,
        requester_email: user.email,
        priority: index === 0 ? 'high' : 'medium',
        status: user.status,
        created_at: user.created_at,
        request_data: {
          role: user.role_type,
          organization: user.organization_name
        }
      }));
    
    // Apply type filter if specified
    let filteredApprovals = mockApprovals;
    if (type) {
      filteredApprovals = filteredApprovals.filter(approval => approval.request_type === type);
    }
    
    // Sort by priority and date
    filteredApprovals.sort((a, b) => {
      const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    res.json({
      success: true,
      data: filteredApprovals,
      pagination: {
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// ==============================================================================
// RESOURCE QUOTA ROUTES
// ==============================================================================

// GET /api/governance/quotas - Get resource quotas
router.get('/quotas', async (req, res) => {
  try {
    const { user_id, organization_id } = req.query;
    
    let query = `
      SELECT rq.*, ur.email, ur.role_type, ur.organization_name
      FROM resource_quotas rq
      JOIN user_roles ur ON rq.user_id = ur.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (user_id) {
      query += ` AND rq.user_id = ?`;
      params.push(user_id);
    }
    
    if (organization_id) {
      query += ` AND rq.organization_id = ?`;
      params.push(organization_id);
    }
    
    query += ` ORDER BY ur.email`;
    
    db.all(query, params, (err, quotas) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch quotas', details: err.message });
      }
      
      res.json({
        success: true,
        data: quotas
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// PUT /api/governance/quotas/:userId - Update user quota
router.put('/quotas/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      cpu_hours_limit, 
      gpu_hours_limit, 
      storage_gb_limit, 
      max_concurrent_experiments,
      max_model_deployments,
      updated_by
    } = req.body;
    
    if (!updated_by) {
      return res.status(400).json({ error: 'Updated by information is required' });
    }
    
    // Get current quota
    db.get('SELECT * FROM resource_quotas WHERE user_id = ?', [userId], (err, currentQuota: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!currentQuota) {
        return res.status(404).json({ error: 'User quota not found' });
      }
      
      const updateQuery = `
        UPDATE resource_quotas 
        SET cpu_hours_limit = ?, gpu_hours_limit = ?, storage_gb_limit = ?, 
            max_concurrent_experiments = ?, max_model_deployments = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      db.run(updateQuery, [
        cpu_hours_limit || currentQuota.cpu_hours_limit,
        gpu_hours_limit || currentQuota.gpu_hours_limit,
        storage_gb_limit || currentQuota.storage_gb_limit,
        max_concurrent_experiments || currentQuota.max_concurrent_experiments,
        max_model_deployments || currentQuota.max_model_deployments,
        userId
      ], function(updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to update quota', details: updateErr.message });
        }
        
        // Log governance action
        logGovernanceAction(
          'quota_updated',
          updated_by,
          updated_by,
          `Resource quota updated for user ${userId}`,
          userId,
          undefined,
          {
            cpu_hours_limit: currentQuota.cpu_hours_limit,
            gpu_hours_limit: currentQuota.gpu_hours_limit,
            storage_gb_limit: currentQuota.storage_gb_limit
          },
          {
            cpu_hours_limit: cpu_hours_limit || currentQuota.cpu_hours_limit,
            gpu_hours_limit: gpu_hours_limit || currentQuota.gpu_hours_limit,
            storage_gb_limit: storage_gb_limit || currentQuota.storage_gb_limit
          },
          'medium'
        );
        
        res.json({
          success: true,
          message: 'Quota updated successfully',
          data: {
            user_id: userId,
            updated_fields: {
              cpu_hours_limit: cpu_hours_limit || currentQuota.cpu_hours_limit,
              gpu_hours_limit: gpu_hours_limit || currentQuota.gpu_hours_limit,
              storage_gb_limit: storage_gb_limit || currentQuota.storage_gb_limit
            }
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// ==============================================================================
// AUDIT TRAIL ROUTES
// ==============================================================================

// GET /api/governance/audit - Get audit trail
router.get('/audit', async (req, res) => {
  try {
    const { 
      action_type, 
      actor_id, 
      target_id, 
      risk_level,
      start_date,
      end_date,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = `SELECT * FROM governance_audit WHERE 1=1`;
    const params: any[] = [];
    
    if (action_type) {
      query += ` AND action_type = ?`;
      params.push(action_type);
    }
    
    if (actor_id) {
      query += ` AND actor_id = ?`;
      params.push(actor_id);
    }
    
    if (target_id) {
      query += ` AND target_id = ?`;
      params.push(target_id);
    }
    
    if (risk_level) {
      query += ` AND risk_level = ?`;
      params.push(risk_level);
    }
    
    if (start_date) {
      query += ` AND created_at >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND created_at <= ?`;
      params.push(end_date);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), offset);
    
    db.all(query, params, (err, audits) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch audit trail', details: err.message });
      }
      
      // Parse JSON fields
      const parsedAudits = (audits as any[]).map(audit => ({
        ...audit,
        old_values: JSON.parse(audit.old_values || '{}'),
        new_values: JSON.parse(audit.new_values || '{}')
      }));
      
      res.json({
        success: true,
        data: parsedAudits,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// ==============================================================================
// DASHBOARD STATISTICS ROUTES
// ==============================================================================

// GET /api/governance/stats - Get governance dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Calculate user statistics
    const userStats = {
      total: mockUsers.length,
      pending: mockUsers.filter(u => u.status === 'pending').length,
      approved: mockUsers.filter(u => u.status === 'approved').length,
      rejected: mockUsers.filter(u => u.status === 'rejected').length
    };
    
    // Calculate approval statistics (based on pending users for now)
    const approvalStats = {
      total: mockUsers.length,
      pending: mockUsers.filter(u => u.status === 'pending').length,
      approved: mockUsers.filter(u => u.status === 'approved').length,
      rejected: mockUsers.filter(u => u.status === 'rejected').length
    };
    
    // Calculate resource statistics
    const resourceStats = {
      total_cpu_allocated: mockUsers.reduce((sum, u) => sum + (u.cpu_hours_limit || 0), 0),
      total_gpu_allocated: mockUsers.reduce((sum, u) => sum + (u.gpu_hours_limit || 0), 0),
      total_storage_allocated: mockUsers.reduce((sum, u) => sum + (u.storage_gb_limit || 0), 0)
    };
    
    // Get recent activities
    const recentActivities = mockAudit.slice(0, 10);
    
    const stats = {
      users: userStats,
      approvals: approvalStats,
      resources: resourceStats,
      organizations: { total: 3, active: 3 },
      recent_activities: recentActivities
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// Organizations endpoint for governance
router.get('/organizations', async (req, res) => {
  try {
    const { db } = await import('../../database/init.js');
    
    const organizations = await db.all(`
      SELECT 
        o.*,
        u.email as admin_email,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name,
        COUNT(DISTINCT u2.id) as member_count
      FROM organizations o
      LEFT JOIN users u ON o.admin_user_id = u.id
      LEFT JOIN users u2 ON u2.organization = o.name
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    
    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Organizations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations', details: error });
  }
});

// Create organization from governance
router.post('/organizations', async (req, res) => {
  try {
    const { name, description, plan_type, storage_limit_gb, member_limit, admin_email } = req.body;
    const { db } = await import('../../database/init.js');
    const { v4: uuidv4 } = await import('uuid');
    
    // Get admin user
    const admin = await db.get('SELECT id, email FROM users WHERE email = ?', [admin_email]);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    const orgId = uuidv4();
    await db.run(`
      INSERT INTO organizations (
        id, name, description, admin_user_id, 
        total_storage_limit, max_members, status, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `, [
      orgId, 
      name, 
      description, 
      admin.id, 
      storage_limit_gb, 
      member_limit,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    
    // Get the created organization with admin details
    const createdOrg = await db.get(`
      SELECT 
        o.*,
        u.email as admin_email,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM organizations o
      LEFT JOIN users u ON o.admin_user_id = u.id
      WHERE o.id = ?
    `, [orgId]);
    
    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: createdOrg
    });
  } catch (error) {
    console.error('Organization creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      details: error
    });
  }
});

export { router as governanceRouter };