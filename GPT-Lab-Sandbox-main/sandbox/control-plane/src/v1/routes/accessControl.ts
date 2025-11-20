/**
 * Access Control API Routes
 * Handles subscription management, service access, and quota management
 */

import { Router, Request, Response } from 'express';
import { verifyToken } from '../../services/auth.js';
import { 
  getUserAccessLevel, 
  checkServiceAccess, 
  logServiceUsage, 
  requestServiceApproval,
  SUBSCRIPTION_TIERS,
  SERVICE_ACCESS_CONTROL 
} from '../../services/accessControl.js';

const router = Router();

// ==============================================================================
// SUBSCRIPTION MANAGEMENT ROUTES
// ==============================================================================

// GET /api/access-control/subscription-tiers - Get available subscription tiers
router.get('/subscription-tiers', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: Object.values(SUBSCRIPTION_TIERS)
    });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription tiers'
    });
  }
});

// GET /api/access-control/user-access - Get user's access level and permissions
router.get('/user-access', async (req: Request, res: Response) => {
  try {
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userAccess = await getUserAccessLevel(currentUser.id);
    
    if (!userAccess) {
      return res.status(404).json({
        success: false,
        message: 'User access level not found'
      });
    }

    res.json({
      success: true,
      data: userAccess
    });
  } catch (error) {
    console.error('Error fetching user access level:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user access level'
    });
  }
});

// PUT /api/access-control/user-subscription - Update user's subscription tier (admin only)
router.put('/user-subscription/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { subscriptionTier } = req.body;
    
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

    // Validate subscription tier
    if (!SUBSCRIPTION_TIERS[subscriptionTier]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription tier'
      });
    }

    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Update user subscription
    await db.run(`
      UPDATE users 
      SET subscription_tier = ?, updated_at = ?
      WHERE id = ?
    `, [subscriptionTier, new Date().toISOString(), userId]);

    // Log the change
    await db.run(`
      INSERT INTO user_history (
        id, user_id, action_type, actor_id, actor_email,
        old_values, new_values, action_description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      'role_changed',
      currentUser.id,
      currentUser.email,
      JSON.stringify({ subscription_tier: 'previous' }),
      JSON.stringify({ subscription_tier: subscriptionTier }),
      `Subscription tier updated to ${subscriptionTier}`,
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      message: 'Subscription tier updated successfully'
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription tier'
    });
  }
});

// ==============================================================================
// SERVICE ACCESS ROUTES
// ==============================================================================

// GET /api/access-control/services - Get available services and access rules
router.get('/services', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: SERVICE_ACCESS_CONTROL
    });
  } catch (error) {
    console.error('Error fetching service access rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service access rules'
    });
  }
});

// POST /api/access-control/check-service-access - Check access to specific service
router.post('/check-service-access', async (req: Request, res: Response) => {
  try {
    const { serviceId, organizationId } = req.body;
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const accessResult = await checkServiceAccess(currentUser.id, serviceId, organizationId);
    
    res.json({
      success: true,
      data: accessResult
    });
  } catch (error) {
    console.error('Error checking service access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check service access'
    });
  }
});

// POST /api/access-control/request-service-approval - Request approval for service access
router.post('/request-service-approval', async (req: Request, res: Response) => {
  try {
    const { serviceId, organizationId, reason } = req.body;
    
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await requestServiceApproval(currentUser.id, serviceId, organizationId, reason);
    
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
    console.error('Error requesting service approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request service approval'
    });
  }
});

// ==============================================================================
// SERVICE APPROVAL MANAGEMENT ROUTES (Admin Only)
// ==============================================================================

// GET /api/access-control/approval-requests - Get pending approval requests
router.get('/approval-requests', async (req: Request, res: Response) => {
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
    
    const requests = await db.all(`
      SELECT 
        sa.*,
        u.email as user_email,
        u.first_name,
        u.last_name,
        u.organization,
        o.name as organization_name
      FROM service_approvals sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN organizations o ON sa.organization_id = o.id
      WHERE sa.status = 'pending'
      ORDER BY sa.requested_at DESC
    `);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching approval requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch approval requests'
    });
  }
});

// PUT /api/access-control/approval-requests/:id - Approve or reject service access request
router.put('/approval-requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
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
    
    // Update approval request
    await db.run(`
      UPDATE service_approvals 
      SET status = ?, reviewed_at = ?, reviewed_by = ?, review_notes = ?
      WHERE id = ?
    `, [status, new Date().toISOString(), currentUser.id, reviewNotes || null, id]);

    // Get the request details for logging
    const request = await db.get(`
      SELECT * FROM service_approvals WHERE id = ?
    `, [id]);

    // Log the action
    await db.run(`
      INSERT INTO user_history (
        id, user_id, action_type, actor_id, actor_email,
        action_description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      request?.user_id,
      'status_changed',
      currentUser.id,
      currentUser.email,
      `Service approval request ${status} for service: ${request?.service_id}`,
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      message: `Service approval request ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating approval request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update approval request'
    });
  }
});

// ==============================================================================
// USAGE TRACKING ROUTES
// ==============================================================================

// GET /api/access-control/usage-stats - Get user's usage statistics
router.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    // Get current user from token
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.sw4e_token;
    const tokenResult = await verifyToken(token);
    const currentUser = tokenResult?.valid ? tokenResult.user : null;
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Import database connection
    const { db } = await import('../../database/init.js');
    
    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const usageStats = await db.all(`
      SELECT 
        service_id,
        COUNT(*) as usage_count,
        DATE(created_at) as usage_date
      FROM service_usage 
      WHERE user_id = ? AND created_at >= ?
      GROUP BY service_id, DATE(created_at)
      ORDER BY usage_date DESC
    `, [currentUser.id, startOfMonth.toISOString()]);

    // Get resource quota usage
    const quotaUsage = await db.get(`
      SELECT 
        used_cpu_hours,
        used_gpu_hours,
        used_storage_gb
      FROM resource_quotas 
      WHERE user_id = ?
    `, [currentUser.id]);

    res.json({
      success: true,
      data: {
        serviceUsage: usageStats,
        quotaUsage: quotaUsage || { used_cpu_hours: 0, used_gpu_hours: 0, used_storage_gb: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics'
    });
  }
});

export { router as accessControlRouter };
