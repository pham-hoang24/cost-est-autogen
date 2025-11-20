import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'sw4e_governance.db');

// Create database connection
let db: any = null;

// Initialize database with real tables
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Open database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const schema = `
      -- Real Users Table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        organization TEXT,
        role TEXT CHECK(role IN ('super_admin', 'research_admin', 'researcher', 'viewer')) DEFAULT 'viewer',
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
        subscription_tier TEXT DEFAULT 'basic',
        signup_reason TEXT,
        research_area TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME NULL,
        approved_by TEXT NULL,
        last_login DATETIME NULL
      );

      -- User Sessions Table
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Resource Quotas Table
      CREATE TABLE IF NOT EXISTS resource_quotas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        cpu_hours_limit INTEGER DEFAULT 100,
        gpu_hours_limit INTEGER DEFAULT 10,
        storage_gb_limit INTEGER DEFAULT 50,
        api_requests_per_day INTEGER DEFAULT 10000,
        max_concurrent_experiments INTEGER DEFAULT 5,
        max_model_deployments INTEGER DEFAULT 3,
        used_cpu_hours INTEGER DEFAULT 0,
        used_gpu_hours INTEGER DEFAULT 0,
        used_storage_gb INTEGER DEFAULT 0,
        used_api_requests_today INTEGER DEFAULT 0,
        last_reset_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Approval Requests Table
      CREATE TABLE IF NOT EXISTS approval_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        request_type TEXT CHECK(request_type IN ('user_registration', 'quota_increase', 'role_change', 'project_creation')) NOT NULL,
        current_status TEXT CHECK(current_status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
        request_data TEXT NOT NULL, -- JSON string
        justification TEXT,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        requested_by TEXT NOT NULL,
        reviewed_by TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME NULL,
        expires_at DATETIME NULL,
        admin_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Audit Log Table
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action_type TEXT NOT NULL,
        action_description TEXT NOT NULL,
        target_resource TEXT,
        target_id TEXT,
        old_values TEXT, -- JSON string
        new_values TEXT, -- JSON string
        risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
        ip_address TEXT,
        user_agent TEXT,
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      );

      -- User History Table (for tracking user changes over time)
      CREATE TABLE IF NOT EXISTS user_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'restored', 'status_changed', 'role_changed'
        actor_id TEXT, -- Who performed the action
        actor_email TEXT,
        old_values TEXT, -- JSON of previous values
        new_values TEXT, -- JSON of new values
        action_description TEXT NOT NULL,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
      );

      -- Deleted Users Archive (soft delete)
      CREATE TABLE IF NOT EXISTS deleted_users (
        id TEXT PRIMARY KEY,
        original_user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        organization TEXT,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        signup_reason TEXT,
        research_area TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        approved_at DATETIME,
        approved_by TEXT,
        last_login DATETIME,
        deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_by TEXT NOT NULL,
        deleted_by_email TEXT NOT NULL,
        deletion_reason TEXT,
        can_restore INTEGER DEFAULT 1, -- 1 = can restore, 0 = permanent delete
        FOREIGN KEY (deleted_by) REFERENCES users (id) ON DELETE SET NULL
      );

      -- Organizations Table
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        admin_user_id TEXT NOT NULL,
        total_cpu_limit INTEGER DEFAULT 1000,
        total_gpu_limit INTEGER DEFAULT 100,
        total_storage_limit INTEGER DEFAULT 1000,
        member_count INTEGER DEFAULT 0,
        max_members INTEGER DEFAULT 50,
        status TEXT CHECK(status IN ('active', 'suspended', 'archived')) DEFAULT 'active',
        subscription_tier TEXT DEFAULT 'basic',
        settings TEXT DEFAULT '{}', -- JSON settings
        analytics_enabled INTEGER DEFAULT 1,
        compliance_mode TEXT CHECK(compliance_mode IN ('strict', 'moderate', 'relaxed')) DEFAULT 'moderate',
        data_retention_days INTEGER DEFAULT 365,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES users (id)
      );

      -- Organization Members Table
      CREATE TABLE IF NOT EXISTS organization_members (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'member', 'viewer', 'guest')) DEFAULT 'member',
        permissions TEXT DEFAULT '[]', -- JSON array of specific permissions
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        invited_by TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'pending', 'suspended')) DEFAULT 'active',
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(organization_id, user_id)
      );

      -- Organization Permissions Table
      CREATE TABLE IF NOT EXISTS organization_permissions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        permission_name TEXT NOT NULL,
        permission_description TEXT,
        allowed_roles TEXT DEFAULT '[]', -- JSON array of roles that can use this permission
        resource_type TEXT CHECK(resource_type IN ('project', 'dataset', 'service', 'user', 'analytics')) DEFAULT 'project',
        action TEXT CHECK(action IN ('create', 'read', 'update', 'delete', 'manage', 'view')) DEFAULT 'read',
        conditions TEXT DEFAULT '{}', -- JSON conditions for permission
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
        UNIQUE(organization_id, permission_name)
      );

      -- Organization Analytics Table
      CREATE TABLE IF NOT EXISTS organization_analytics (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_type TEXT CHECK(metric_type IN ('usage', 'performance', 'compliance', 'cost')) DEFAULT 'usage',
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT DEFAULT '{}', -- JSON metadata
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
      );

      -- Projects Table (real project management)
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        organization_id TEXT,
        category TEXT CHECK(category IN ('research', 'industry', 'academic', 'pilot')) DEFAULT 'research',
        status TEXT CHECK(status IN ('active', 'archived', 'completed', 'suspended')) DEFAULT 'active',
        data_residency TEXT CHECK(data_residency IN ('EU-only', 'EEA', 'global')) DEFAULT 'EU-only',
        access_control TEXT CHECK(access_control IN ('strict', 'moderate', 'open')) DEFAULT 'strict',
        gdpr_compliant INTEGER DEFAULT 1,
        eu_ai_act_compliant INTEGER DEFAULT 1,
        cpu_cores INTEGER DEFAULT 2,
        memory_gb INTEGER DEFAULT 4,
        storage_gb INTEGER DEFAULT 10,
        gpu_enabled INTEGER DEFAULT 0,
        estimated_cost REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        start_date DATETIME NULL,
        end_date DATETIME NULL,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Project Collaborators Table
      CREATE TABLE IF NOT EXISTS project_collaborators (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT CHECK(role IN ('owner', 'admin', 'contributor', 'viewer')) DEFAULT 'viewer',
        permissions TEXT NOT NULL, -- JSON array of permissions
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        added_by TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- User Projects Table (for tracking what users can access)
      CREATE TABLE IF NOT EXISTS user_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        project_type TEXT,
        access_level TEXT CHECK(access_level IN ('read', 'write', 'admin')) DEFAULT 'read',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Data Catalog Table
      CREATE TABLE IF NOT EXISTS data_catalog (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT CHECK(category IN ('research', 'industry', 'public', 'sensitive')) DEFAULT 'research',
        data_type TEXT CHECK(data_type IN ('structured', 'unstructured', 'time_series', 'images', 'text')) DEFAULT 'structured',
        size_gb REAL DEFAULT 0.0,
        record_count INTEGER DEFAULT 0,
        owner_id TEXT NOT NULL,
        organization_id TEXT,
        access_level TEXT CHECK(access_level IN ('public', 'restricted', 'private')) DEFAULT 'restricted',
        gdpr_compliant INTEGER DEFAULT 1,
        data_residency TEXT CHECK(data_residency IN ('EU-only', 'EEA', 'global')) DEFAULT 'EU-only',
        license_type TEXT DEFAULT 'research-only',
        tags TEXT, -- JSON array of tags
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Services Table (for service management)
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('ai-services', 'data-catalog', 'compute', 'storage')) NOT NULL,
        status TEXT CHECK(status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
        endpoint TEXT,
        config TEXT NOT NULL, -- JSON configuration
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
      );

      -- AI Services Table
      CREATE TABLE IF NOT EXISTS ai_services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        service_type TEXT CHECK(service_type IN ('llm', 'ml_model', 'nlp', 'computer_vision', 'speech', 'recommendation')) NOT NULL,
        model_name TEXT,
        version TEXT DEFAULT '1.0.0',
        endpoint_url TEXT,
        status TEXT CHECK(status IN ('active', 'maintenance', 'deprecated')) DEFAULT 'active',
        access_level TEXT CHECK(access_level IN ('public', 'restricted', 'private')) DEFAULT 'restricted',
        cost_per_request REAL DEFAULT 0.001,
        max_requests_per_day INTEGER DEFAULT 1000,
        requires_gpu INTEGER DEFAULT 0,
        gdpr_compliant INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- User Service Access Table
      CREATE TABLE IF NOT EXISTS user_service_access (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        access_granted INTEGER DEFAULT 0,
        daily_limit INTEGER DEFAULT 100,
        monthly_limit INTEGER DEFAULT 1000,
        used_today INTEGER DEFAULT 0,
        used_this_month INTEGER DEFAULT 0,
        granted_by TEXT NOT NULL,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES ai_services (id) ON DELETE CASCADE
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(current_status);
      CREATE INDEX IF NOT EXISTS idx_approval_requests_user_id ON approval_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_history_actor_id ON user_history(actor_id);
      CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON user_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_deleted_users_email ON deleted_users(email);
      CREATE INDEX IF NOT EXISTS idx_deleted_users_deleted_by ON deleted_users(deleted_by);
      CREATE INDEX IF NOT EXISTS idx_deleted_users_deleted_at ON deleted_users(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_resource_quotas_user_id ON resource_quotas(user_id);
      CREATE INDEX IF NOT EXISTS idx_organizations_admin ON organizations(admin_user_id);
      CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
      CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
      CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_organization_members_status ON organization_members(status);
      CREATE INDEX IF NOT EXISTS idx_organization_permissions_org ON organization_permissions(organization_id);
      CREATE INDEX IF NOT EXISTS idx_organization_analytics_org ON organization_analytics(organization_id);
      CREATE INDEX IF NOT EXISTS idx_organization_analytics_metric ON organization_analytics(metric_type);

      -- Service Usage Tracking Table
      CREATE TABLE IF NOT EXISTS service_usage (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        organization_id TEXT,
        service_id TEXT NOT NULL,
        usage_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
      );

      -- Service Approvals Table
      CREATE TABLE IF NOT EXISTS service_approvals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        organization_id TEXT,
        service_id TEXT NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        reviewed_by TEXT,
        review_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
      );

      -- Add subscription_tier column to users table
      CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

      -- Add subscription and quota columns to organizations table
      CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier ON organizations(subscription_tier);

      -- Access Control Indexes
      CREATE INDEX IF NOT EXISTS idx_service_usage_user_id ON service_usage(user_id);
      CREATE INDEX IF NOT EXISTS idx_service_usage_organization_id ON service_usage(organization_id);
      CREATE INDEX IF NOT EXISTS idx_service_usage_service_id ON service_usage(service_id);
      CREATE INDEX IF NOT EXISTS idx_service_usage_created_at ON service_usage(created_at);
      CREATE INDEX IF NOT EXISTS idx_service_approvals_user_id ON service_approvals(user_id);
      CREATE INDEX IF NOT EXISTS idx_service_approvals_organization_id ON service_approvals(organization_id);
      CREATE INDEX IF NOT EXISTS idx_service_approvals_service_id ON service_approvals(service_id);
      CREATE INDEX IF NOT EXISTS idx_service_approvals_status ON service_approvals(status);
    `;

    // Execute schema
    await db.exec(schema);
    
    // Execute EU AI Act compliance schema
    try {
      const euAiActSchema = fs.readFileSync(path.join(process.cwd(), 'src/database/eu-ai-act-compliance.sql'), 'utf-8');
      await db.exec(euAiActSchema);
      console.log('✅ EU AI Act compliance schema initialized');
    } catch (error) {
      console.warn('⚠️ EU AI Act compliance schema not found, skipping...');
    }

    // Execute Collaboration schema
    try {
      const collaborationSchema = fs.readFileSync(path.join(process.cwd(), 'src/database/collaboration-schema.sql'), 'utf-8');
      await db.exec(collaborationSchema);
      console.log('✅ Collaboration features schema initialized');
      
      // Initialize default subscription features
      await initializeSubscriptionFeatures();
      console.log('✅ Subscription feature gates initialized');
    } catch (error) {
      console.warn('⚠️ Collaboration schema not found, skipping...', error);
    }
    console.log('✅ Real SW4E Governance database initialized successfully');
    
    // Add subscription_tier column to users table if it doesn't exist
    try {
      const userColumns = await db.all("PRAGMA table_info(users)");
      const hasSubscriptionTier = userColumns.some((col: any) => col.name === 'subscription_tier');
      
      if (!hasSubscriptionTier) {
        await db.run('ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT "basic"');
        console.log('✅ Added subscription_tier column to users table');
      } else {
        console.log('ℹ️ subscription_tier column already exists in users table');
      }
    } catch (error) {
      console.log('ℹ️ subscription_tier column already exists in users table');
    }

    // Add subscription and quota columns to organizations table if they don't exist
    try {
      const orgColumns = await db.all("PRAGMA table_info(organizations)");
      const hasSubscriptionTier = orgColumns.some((col: any) => col.name === 'subscription_tier');
      const hasMaxUsers = orgColumns.some((col: any) => col.name === 'max_users');
      const hasMaxStorage = orgColumns.some((col: any) => col.name === 'max_storage_gb');
      const hasMaxCompute = orgColumns.some((col: any) => col.name === 'max_compute_hours');
      
      if (!hasSubscriptionTier) {
        await db.run('ALTER TABLE organizations ADD COLUMN subscription_tier TEXT DEFAULT "basic"');
      }
      if (!hasMaxUsers) {
        await db.run('ALTER TABLE organizations ADD COLUMN max_users INTEGER DEFAULT 10');
      }
      if (!hasMaxStorage) {
        await db.run('ALTER TABLE organizations ADD COLUMN max_storage_gb INTEGER DEFAULT 100');
      }
      if (!hasMaxCompute) {
        await db.run('ALTER TABLE organizations ADD COLUMN max_compute_hours INTEGER DEFAULT 500');
      }
      
      console.log('✅ Added subscription and quota columns to organizations table');
    } catch (error) {
      console.log('ℹ️ Subscription and quota columns already exist in organizations table');
    }
    
    // Create default super admin if not exists
    await createDefaultSuperAdmin();
    
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  }
};

// Initialize subscription feature gates
const initializeSubscriptionFeatures = async (): Promise<void> => {
  try {
    const subscriptionTiers = [
      {
        id: uuidv4(),
        subscription_tier: 'basic',
        max_projects: 3,
        max_collaborators_per_project: 5,
        max_storage_gb: 5,
        max_ai_compute_hours: 20,
        external_collaboration: false,
        cross_border_data_sharing: false,
        advanced_ai_features: false,
        priority_support: false,
        custom_legal_agreements: false,
        audit_trail_retention_days: 30,
        api_calls_per_month: 5000,
        webhook_endpoints: 1,
        external_integrations: false
      },
      {
        id: uuidv4(),
        subscription_tier: 'professional',
        max_projects: 10,
        max_collaborators_per_project: 15,
        max_storage_gb: 50,
        max_ai_compute_hours: 100,
        external_collaboration: true,
        cross_border_data_sharing: true,
        advanced_ai_features: true,
        priority_support: false,
        custom_legal_agreements: false,
        audit_trail_retention_days: 90,
        api_calls_per_month: 25000,
        webhook_endpoints: 5,
        external_integrations: true
      },
      {
        id: uuidv4(),
        subscription_tier: 'enterprise',
        max_projects: -1, // unlimited
        max_collaborators_per_project: 50,
        max_storage_gb: 500,
        max_ai_compute_hours: 1000,
        external_collaboration: true,
        cross_border_data_sharing: true,
        advanced_ai_features: true,
        priority_support: true,
        custom_legal_agreements: true,
        audit_trail_retention_days: 365,
        api_calls_per_month: 100000,
        webhook_endpoints: 20,
        external_integrations: true
      }
    ];

    // Insert subscription tiers if they don't exist
    for (const tier of subscriptionTiers) {
      const existing = await db.get(
        'SELECT id FROM subscription_features WHERE subscription_tier = ?',
        [tier.subscription_tier]
      );
      
      if (!existing) {
        await db.run(`
          INSERT INTO subscription_features (
            id, subscription_tier, max_projects, max_collaborators_per_project,
            max_storage_gb, max_ai_compute_hours, external_collaboration,
            cross_border_data_sharing, advanced_ai_features, priority_support,
            custom_legal_agreements, audit_trail_retention_days, api_calls_per_month,
            webhook_endpoints, external_integrations
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          tier.id, tier.subscription_tier, tier.max_projects, tier.max_collaborators_per_project,
          tier.max_storage_gb, tier.max_ai_compute_hours, tier.external_collaboration,
          tier.cross_border_data_sharing, tier.advanced_ai_features, tier.priority_support,
          tier.custom_legal_agreements, tier.audit_trail_retention_days, tier.api_calls_per_month,
          tier.webhook_endpoints, tier.external_integrations
        ]);
      }
    }
  } catch (error) {
    console.error('Error initializing subscription features:', error);
  }
};

// Create default super admin user
const createDefaultSuperAdmin = async (): Promise<void> => {
  try {
    const adminId = uuidv4();
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_DEFAULT_PASSWORD environment variable must be set in production');
      }
      console.warn('🚨 SECURITY WARNING: Using weak default admin password in development. Set ADMIN_DEFAULT_PASSWORD in production!');
      return 'admin123';
    })();
    
    // Check if super admin already exists
    const existingAdmin = await db.get('SELECT id FROM users WHERE role = ? AND status = ?', ['super_admin', 'approved']);
    
    if (existingAdmin) {
      console.log('✅ Super admin already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Insert super admin
    const insertAdmin = `
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, 
        organization, role, status, approved_at, approved_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(insertAdmin, [
      adminId,
      'admin@sw4e.org',
      hashedPassword,
      'SW4E',
      'Administrator',
      'SW4E Platform',
      'super_admin',
      'approved',
      new Date().toISOString(),
      'system'
    ]);
    
    console.log('✅ Default super admin created: admin@sw4e.org / admin123');
    
    // Insert sample AI services
    await db.run(`
      INSERT OR IGNORE INTO ai_services (id, name, description, service_type, model_name, version, endpoint_url, status, access_level, cost_per_request, max_requests_per_day, requires_gpu, gdpr_compliant)
      VALUES 
      (?, 'GPT-4 EU', 'Large Language Model for text generation and analysis', 'llm', 'gpt-4', '1.0.0', '/api/ai/gpt4', 'active', 'restricted', 0.01, 1000, 0, 1),
      (?, 'Code Analysis AI', 'AI model for analyzing code quality and security', 'ml_model', 'code-analyzer-v2', '2.1.0', '/api/ai/code-analyzer', 'active', 'restricted', 0.005, 2000, 1, 1),
      (?, 'Text Classification', 'NLP service for document classification', 'nlp', 'text-classifier', '1.5.0', '/api/ai/text-classifier', 'active', 'public', 0.001, 5000, 0, 1),
      (?, 'Image Recognition', 'Computer vision service for image analysis', 'computer_vision', 'image-recognition-v3', '3.0.0', '/api/ai/image-recognition', 'active', 'restricted', 0.008, 1500, 1, 1),
      (?, 'Sentiment Analysis', 'NLP service for sentiment analysis', 'nlp', 'sentiment-analyzer', '1.2.0', '/api/ai/sentiment', 'active', 'public', 0.002, 3000, 0, 1)
    `, [
      uuidv4(), // GPT-4 EU
      uuidv4(), // Code Analysis AI
      uuidv4(), // Text Classification
      uuidv4(), // Image Recognition
      uuidv4()  // Sentiment Analysis
    ]);

    // Insert sample data catalog
    await db.run(`
      INSERT OR IGNORE INTO data_catalog (id, name, description, category, data_type, size_gb, record_count, owner_id, organization_id, access_level, gdpr_compliant, data_residency, license_type, tags)
      VALUES 
      (?, 'Software Quality Dataset', 'Large dataset of software metrics and quality indicators', 'research', 'structured', 15.5, 150000, ?, ?, 'restricted', 1, 'EU-only', 'research-only', '["software", "quality", "metrics"]'),
      (?, 'Customer Reviews Dataset', 'Text data from customer reviews and feedback', 'industry', 'text', 8.2, 50000, ?, ?, 'restricted', 1, 'EU-only', 'research-only', '["reviews", "sentiment", "feedback"]'),
      (?, 'Public Research Data', 'Open dataset for academic research', 'public', 'structured', 25.0, 300000, ?, ?, 'public', 1, 'EU-only', 'open-source', '["research", "public", "academic"]'),
      (?, 'Time Series Data', 'Sensor and IoT data for analysis', 'industry', 'time_series', 45.8, 1000000, ?, ?, 'restricted', 1, 'EU-only', 'research-only', '["iot", "sensors", "time-series"]'),
      (?, 'Image Dataset', 'Collection of images for computer vision research', 'research', 'images', 120.5, 25000, ?, ?, 'restricted', 1, 'EU-only', 'research-only', '["images", "computer-vision", "research"]')
    `, [
      uuidv4(), adminId, 'SW4E Platform', // Software Quality Dataset
      uuidv4(), adminId, 'SW4E Platform', // Customer Reviews Dataset
      uuidv4(), adminId, 'SW4E Platform', // Public Research Data
      uuidv4(), adminId, 'SW4E Platform', // Time Series Data
      uuidv4(), adminId, 'SW4E Platform'  // Image Dataset
    ]);

    console.log('✅ Sample AI services and data catalog created');
    
    // Create default organization permissions
    await db.run(`
      INSERT OR IGNORE INTO organization_permissions (id, organization_id, permission_name, permission_description, allowed_roles, resource_type, action, conditions)
      VALUES 
      (?, ?, 'create_projects', 'Allow users to create new projects', '["admin", "member"]', 'project', 'create', '{}'),
      (?, ?, 'manage_members', 'Allow users to invite and manage organization members', '["admin"]', 'user', 'manage', '{}'),
      (?, ?, 'view_analytics', 'Allow users to view organization analytics', '["admin", "member"]', 'analytics', 'view', '{}'),
      (?, ?, 'access_datasets', 'Allow users to access organization datasets', '["admin", "member", "viewer"]', 'dataset', 'read', '{}'),
      (?, ?, 'use_ai_services', 'Allow users to use AI services', '["admin", "member"]', 'service', 'create', '{}'),
      (?, ?, 'view_compliance', 'Allow users to view compliance reports', '["admin"]', 'analytics', 'view', '{"compliance": true}')
    `, [
      uuidv4(), adminId, // create_projects
      uuidv4(), adminId, // manage_members
      uuidv4(), adminId, // view_analytics
      uuidv4(), adminId, // access_datasets
      uuidv4(), adminId, // use_ai_services
      uuidv4(), adminId  // view_compliance
    ]);

    console.log('✅ Default organization permissions created');
    
    // Create governance_audit table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS governance_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_email TEXT NOT NULL,
        target_id TEXT NULL,
        target_email TEXT NULL,
        action_description TEXT NOT NULL,
        old_values TEXT DEFAULT '{}',
        new_values TEXT DEFAULT '{}',
        risk_level TEXT DEFAULT 'low',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Governance audit table created');
    
    // Apply enhanced governance schema
    const fs = await import('fs');
    const path = await import('path');
    const enhancedSchemaPath = path.join(process.cwd(), 'src/database/enhanced-governance-schema.sql');
    const enhancedSchema = fs.readFileSync(enhancedSchemaPath, 'utf8');
    await db.exec(enhancedSchema);
    
    console.log('✅ Enhanced governance schema applied');
    
  } catch (err) {
    console.error('❌ Error creating default super admin:', err);
    throw err;
  }
};

// Export database connection
export { db };
