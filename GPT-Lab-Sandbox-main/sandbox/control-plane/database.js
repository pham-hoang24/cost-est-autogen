import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'sw4e_database.db');
    this.init();
  }

  init() {
    try {
      // Create database connection
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
      console.log('🗄️  Database connected:', this.dbPath);
      
      // Run migrations
      this.runMigrations();
      
      // Seed initial data if needed
      this.seedInitialData();
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  runMigrations() {
    console.log('🔄 Running database migrations...');
    
    // Users table with comprehensive role system
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'researcher',
        status TEXT NOT NULL DEFAULT 'pending',
        subscription_tier TEXT NOT NULL DEFAULT 'basic',
        organization_id TEXT,
        organization_role TEXT,
        project_role TEXT,
        permissions JSON,
        organization TEXT,
        department TEXT,
        position TEXT,
        phone_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        approved_by TEXT,
        approved_at DATETIME,
        rejected_by TEXT,
        rejected_at DATETIME,
        created_by TEXT,
        FOREIGN KEY (organization_id) REFERENCES organizations(id)
      )
    `);

    // Organizations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        admin_email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        member_count INTEGER DEFAULT 0,
        max_members INTEGER DEFAULT 50,
        storage_limit_gb INTEGER DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT
      )
    `);

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        project_type TEXT NOT NULL,
        visibility TEXT NOT NULL DEFAULT 'private',
        legal_basis TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        member_count INTEGER DEFAULT 0,
        resource_count INTEGER DEFAULT 0,
        requires_dpia BOOLEAN DEFAULT FALSE,
        cross_border_transfers BOOLEAN DEFAULT FALSE,
        subscription_tier_required TEXT DEFAULT 'basic',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )
    `);

    // Services table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_deployed DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Project members table for role-based access
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'contributor',
        permissions JSON,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        invited_by TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(project_id, user_id)
      )
    `);

    // Organization members table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        permissions JSON,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        invited_by TEXT,
        FOREIGN KEY (organization_id) REFERENCES organizations(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(organization_id, user_id)
      )
    `);

    // Role permissions table for flexible role system
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role TEXT PRIMARY KEY,
        role_type TEXT NOT NULL,
        permissions JSON NOT NULL,
        ui_access JSON,
        api_access JSON,
        subscription_required TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update existing project_members table with permissions
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS project_members_new (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'contributor',
        permissions JSON,
        status TEXT NOT NULL DEFAULT 'active',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        invited_by TEXT,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(project_id, user_id)
      )
    `);

    // Invitations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        invited_by TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        accepted_at DATETIME,
        legal_basis TEXT NOT NULL,
        requires_dpia BOOLEAN DEFAULT FALSE,
        cross_border_transfers BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (invited_by) REFERENCES users (id)
      )
    `);

    // Organization members table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        status TEXT NOT NULL DEFAULT 'active',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(organization_id, user_id)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
      CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
      CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
    `);

    // AI Services table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        requirements TEXT,
        access_level TEXT DEFAULT 'restricted',
        requires_approval BOOLEAN DEFAULT true,
        max_users INTEGER,
        current_users INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        documentation TEXT,
        api_endpoint TEXT,
        cost_per_request REAL,
        gdpr_compliant BOOLEAN DEFAULT false,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Service Access table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_service_access (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        approved_by TEXT,
        expires_at DATETIME,
        usage_count INTEGER DEFAULT 0,
        last_used DATETIME,
        admin_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (service_id) REFERENCES ai_services (id),
        UNIQUE(user_id, service_id)
      )
    `);

    // Hardware Resources table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hardware_resources (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('GPU', 'CPU', 'Memory', 'Storage', 'Network')),
        name TEXT NOT NULL,
        cluster TEXT NOT NULL,
        location TEXT NOT NULL,
        specifications TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('available', 'busy', 'maintenance', 'reserved')),
        utilization REAL DEFAULT 0,
        cost_per_hour REAL NOT NULL,
        energy_efficiency REAL DEFAULT 0,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Hardware Requests table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hardware_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        resource_type TEXT NOT NULL CHECK(resource_type IN ('GPU', 'CPU', 'Memory', 'Storage', 'Network')),
        specifications TEXT NOT NULL,
        priority TEXT NOT NULL CHECK(priority IN ('low', 'normal', 'high', 'critical')),
        justification TEXT NOT NULL,
        expected_usage TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'allocated', 'running', 'completed', 'cancelled')),
        admin_notes TEXT,
        reviewed_by TEXT,
        approved_by TEXT,
        reviewed_at DATETIME,
        approved_at DATETIME,
        allocated_at DATETIME,
        started_at DATETIME,
        completed_at DATETIME,
        estimated_cost REAL,
        actual_cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (reviewed_by) REFERENCES users (id),
        FOREIGN KEY (approved_by) REFERENCES users (id)
      )
    `);

    // Resource Allocations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resource_allocations (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('allocated', 'running', 'completed', 'failed', 'cancelled')),
        cost REAL NOT NULL,
        utilization REAL DEFAULT 0,
        performance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES hardware_requests (id),
        FOREIGN KEY (resource_id) REFERENCES hardware_resources (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `);

    // Resource Metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resource_metrics (
        id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL,
        allocation_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        utilization REAL NOT NULL,
        performance REAL NOT NULL,
        health REAL NOT NULL,
        cost REAL NOT NULL,
        energy_consumption REAL NOT NULL,
        FOREIGN KEY (resource_id) REFERENCES hardware_resources (id),
        FOREIGN KEY (allocation_id) REFERENCES resource_allocations (id)
      )
    `);

    // Create indexes for AI services
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_ai_services_category ON ai_services(category);
      CREATE INDEX IF NOT EXISTS idx_ai_services_status ON ai_services(status);
      CREATE INDEX IF NOT EXISTS idx_user_service_access_user ON user_service_access(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_service_access_service ON user_service_access(service_id);
      CREATE INDEX IF NOT EXISTS idx_user_service_access_status ON user_service_access(status);
    `);

    console.log('✅ Database migrations completed');
  }

  seedInitialData() {
    // Check if data already exists
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count > 0) {
      console.log('📊 Database already has data, skipping user seed');
      // Always seed role permissions and AI services even if users exist
      this.seedRolePermissions();
      this.seedAIServices();
      return;
    }

    console.log('🌱 Seeding initial data...');

    // Insert default admin user
    const insertUser = this.db.prepare(`
      INSERT INTO users (id, email, password, first_name, last_name, role, status, subscription_tier, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      '1',
      'admin@sw4e.org',
      'admin123',
      'SW4E',
      'Administrator',
      'super_admin',
      'active',
      'enterprise',
      new Date().toISOString()
    );

    // Insert demo users
    const demoUsers = [
      {
        id: '2',
        email: 'researcher@university.edu',
        password: 'researcher123',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'researcher',
        status: 'active',
        subscription_tier: 'academic',
        organization: 'University of Helsinki',
        department: 'Computer Science',
        position: 'Professor'
      },
      {
        id: '3',
        email: 'student@university.edu',
        password: 'student123',
        firstName: 'Alex',
        lastName: 'Chen',
        role: 'student',
        status: 'pending',
        subscription_tier: 'free',
        organization: 'Aalto University',
        department: 'Data Science',
        position: 'PhD Student'
      },
      {
        id: '4',
        email: 'maria.garcia@tuni.fi',
        password: 'maria123',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'researcher',
        status: 'active',
        subscription_tier: 'professional',
        organization: 'Tampere University',
        department: 'AI Research',
        position: 'Research Scientist'
      },
      {
        id: '5',
        email: 'peter.andersson@abo.fi',
        password: 'peter123',
        firstName: 'Peter',
        lastName: 'Andersson',
        role: 'researcher',
        status: 'pending',
        subscription_tier: 'basic',
        organization: 'Åbo Akademi University',
        department: 'Machine Learning',
        position: 'Postdoc'
      }
    ];

    demoUsers.forEach(user => {
      insertUser.run(
        user.id,
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        user.role,
        user.status,
        user.subscription_tier,
        new Date().toISOString()
      );
    });

    // Insert organizations
    const insertOrg = this.db.prepare(`
      INSERT INTO organizations (id, name, description, admin_email, status, member_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const organizations = [
      {
        id: '1',
        name: 'SW4E Research Institute',
        description: 'Primary research organization for SW4E platform',
        admin_email: 'admin@sw4e.org',
        status: 'active',
        member_count: 5
      },
      {
        id: '2',
        name: 'University of Helsinki',
        description: 'Leading Finnish university with strong AI research programs',
        admin_email: 'admin@helsinki.fi',
        status: 'active',
        member_count: 3
      },
      {
        id: '3',
        name: 'Aalto University',
        description: 'Technical university focused on technology and business',
        admin_email: 'admin@aalto.fi',
        status: 'active',
        member_count: 2
      },
      {
        id: '4',
        name: 'Tampere University',
        description: 'Research university with strong engineering programs',
        admin_email: 'admin@tuni.fi',
        status: 'active',
        member_count: 1
      },
      {
        id: '5',
        name: 'VTT Technical Research Centre',
        description: 'Finland\'s leading research and technology company',
        admin_email: 'admin@vtt.fi',
        status: 'active',
        member_count: 0
      },
      {
        id: '6',
        name: 'University of Oulu',
        description: 'Northern Finland\'s largest university',
        admin_email: 'admin@oulu.fi',
        status: 'active',
        member_count: 0
      },
      {
        id: '7',
        name: 'LUT University',
        description: 'University focusing on business and technology',
        admin_email: 'admin@lut.fi',
        status: 'active',
        member_count: 0
      },
      {
        id: '8',
        name: 'Åbo Akademi University',
        description: 'Swedish-language university in Finland',
        admin_email: 'admin@abo.fi',
        status: 'pending',
        member_count: 1
      },
      {
        id: '9',
        name: 'University of Jyväskylä',
        description: 'Comprehensive university in Central Finland',
        admin_email: 'admin@jyu.fi',
        status: 'active',
        member_count: 0
      }
    ];

    organizations.forEach(org => {
      insertOrg.run(
        org.id,
        org.name,
        org.description,
        org.admin_email,
        org.status,
        org.member_count,
        new Date().toISOString()
      );
    });

    // Insert projects
    const insertProject = this.db.prepare(`
      INSERT INTO projects (id, name, description, owner_id, project_type, visibility, legal_basis, status, member_count, resource_count, requires_dpia, cross_border_transfers, subscription_tier_required, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const projects = [
      {
        id: '1',
        name: 'AI Ethics Research',
        description: 'Collaborative research on ethical AI development and deployment practices in healthcare applications',
        owner_id: '1',
        project_type: 'research',
        visibility: 'organization',
        legal_basis: 'research_exemption',
        status: 'active',
        member_count: 5,
        resource_count: 12,
        requires_dpia: true,
        cross_border_transfers: false,
        subscription_tier_required: 'basic'
      },
      {
        id: '2',
        name: 'Medical Image Analysis',
        description: 'Deep learning models for medical image classification and diagnosis using federated learning',
        owner_id: '2',
        project_type: 'ai_development',
        visibility: 'private',
        legal_basis: 'consent',
        status: 'active',
        member_count: 8,
        resource_count: 25,
        requires_dpia: true,
        cross_border_transfers: true,
        subscription_tier_required: 'professional'
      },
      {
        id: '3',
        name: 'ANSI',
        description: 'Advanced Neural Systems Integration project',
        owner_id: '1',
        project_type: 'research',
        visibility: 'organization',
        legal_basis: 'research_exemption',
        status: 'active',
        member_count: 1,
        resource_count: 3,
        requires_dpia: false,
        cross_border_transfers: false,
        subscription_tier_required: 'basic'
      }
    ];

    projects.forEach(project => {
      insertProject.run(
        project.id,
        project.name,
        project.description,
        project.owner_id,
        project.project_type,
        project.visibility,
        project.legal_basis,
        project.status,
        project.member_count,
        project.resource_count,
        project.requires_dpia,
        project.cross_border_transfers,
        project.subscription_tier_required,
        new Date().toISOString()
      );
    });

    // Insert services
    const insertService = this.db.prepare(`
      INSERT INTO services (id, name, type, status, description, version, created_at, last_deployed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const services = [
      {
        id: '1',
        name: 'AI Services Platform',
        type: 'ai-services',
        status: 'active',
        description: 'Comprehensive AI model deployment and management platform',
        version: '2.1.0',
        created_at: new Date('2025-06-25').toISOString(),
        last_deployed: new Date('2025-09-21').toISOString()
      },
      {
        id: '2',
        name: 'Data Catalog Service',
        type: 'data-catalog',
        status: 'active',
        description: 'Centralized data management and discovery platform',
        version: '1.8.2',
        created_at: new Date('2025-07-10').toISOString(),
        last_deployed: new Date('2025-09-20').toISOString()
      },
      {
        id: '3',
        name: 'Collaboration Hub',
        type: 'collaboration',
        status: 'active',
        description: 'Multi-party collaboration and project management system',
        version: '3.0.1',
        created_at: new Date('2025-07-25').toISOString(),
        last_deployed: new Date('2025-09-22').toISOString()
      },
      {
        id: '4',
        name: 'Security & Compliance',
        type: 'security',
        status: 'maintenance',
        description: 'GDPR and EU AI Act compliance monitoring system',
        version: '1.5.0',
        created_at: new Date('2025-08-09').toISOString(),
        last_deployed: new Date('2025-09-15').toISOString()
      },
      {
        id: '5',
        name: 'Analytics Dashboard',
        type: 'analytics',
        status: 'active',
        description: 'Real-time system analytics and performance monitoring',
        version: '2.0.0',
        created_at: new Date('2025-08-24').toISOString(),
        last_deployed: new Date('2025-09-23').toISOString()
      },
      {
        id: '6',
        name: 'Model Training Service',
        type: 'ai-services',
        status: 'offline',
        description: 'Distributed model training and fine-tuning platform',
        version: '1.2.0',
        created_at: new Date('2025-09-03').toISOString(),
        last_deployed: new Date('2025-09-10').toISOString()
      }
    ];

    services.forEach(service => {
      insertService.run(
        service.id,
        service.name,
        service.type,
        service.status,
        service.description,
        service.version,
        service.created_at,
        service.last_deployed
      );
    });

    // Seed role permissions for flexible role system
    this.seedRolePermissions();

    // Seed AI services
    this.seedAIServices();
    
    // Seed hardware resources
    this.seedHardwareResources();
    
    // Seed sample projects and users for hardware requests
    this.seedSampleProjectsAndUsers();

    console.log('✅ Initial data seeded successfully');
  }

  seedRolePermissions() {
    console.log('🎭 Seeding role permissions...');
    
    const insertRolePermission = this.db.prepare(`
      INSERT OR REPLACE INTO role_permissions (role, role_type, permissions, ui_access, api_access, subscription_required)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const rolePermissions = [
      // System-level roles
      {
        role: 'super_admin',
        role_type: 'system',
        permissions: JSON.stringify({
          system_admin: true,
          user_management: true,
          organization_management: true,
          project_management: true,
          service_management: true,
          compliance_management: true,
          billing_management: true,
          audit_access: true
        }),
        ui_access: JSON.stringify(['admin_console', 'system_settings', 'global_analytics', 'user_management', 'organization_management', 'project_management', 'service_management', 'compliance_dashboard']),
        api_access: JSON.stringify(['*']),
        subscription_required: 'enterprise'
      },
      {
        role: 'platform_admin',
        role_type: 'system',
        permissions: JSON.stringify({
          user_management: true,
          organization_management: true,
          project_management: true,
          service_management: true,
          compliance_management: true,
          audit_access: true
        }),
        ui_access: JSON.stringify(['admin_console', 'user_management', 'organization_management', 'project_management', 'service_management', 'compliance_dashboard']),
        api_access: JSON.stringify(['/api/admin/*', '/api/users/*', '/api/organizations/*', '/api/projects/*', '/api/services/*']),
        subscription_required: 'enterprise'
      },
      
      // Organization-level roles
      {
        role: 'org_owner',
        role_type: 'organization',
        permissions: JSON.stringify({
          organization_management: true,
          member_management: true,
          project_management: true,
          billing_management: true,
          analytics_access: true
        }),
        ui_access: JSON.stringify(['organization_dashboard', 'member_management', 'project_management', 'organization_analytics', 'billing_management']),
        api_access: JSON.stringify(['/api/organizations/*', '/api/org-members/*', '/api/org-projects/*']),
        subscription_required: 'professional'
      },
      {
        role: 'org_admin',
        role_type: 'organization',
        permissions: JSON.stringify({
          member_management: true,
          project_management: true,
          analytics_access: true
        }),
        ui_access: JSON.stringify(['organization_dashboard', 'member_management', 'project_management', 'organization_analytics']),
        api_access: JSON.stringify(['/api/org-members/*', '/api/org-projects/*']),
        subscription_required: 'professional'
      },
      {
        role: 'org_manager',
        role_type: 'organization',
        permissions: JSON.stringify({
          project_management: true,
          team_management: true,
          analytics_access: true
        }),
        ui_access: JSON.stringify(['organization_dashboard', 'project_management', 'team_management', 'project_analytics']),
        api_access: JSON.stringify(['/api/org-projects/*', '/api/collaboration/*']),
        subscription_required: 'professional'
      },
      
      // Project-level roles
      {
        role: 'project_owner',
        role_type: 'project',
        permissions: JSON.stringify({
          project_management: true,
          member_management: true,
          resource_management: true,
          analytics_access: true
        }),
        ui_access: JSON.stringify(['project_dashboard', 'member_management', 'resource_management', 'project_analytics']),
        api_access: JSON.stringify(['/api/projects/*', '/api/project-members/*', '/api/project-data/*']),
        subscription_required: 'basic'
      },
      {
        role: 'project_lead',
        role_type: 'project',
        permissions: JSON.stringify({
          project_management: true,
          team_management: true,
          analytics_access: true
        }),
        ui_access: JSON.stringify(['project_dashboard', 'team_management', 'project_analytics']),
        api_access: JSON.stringify(['/api/projects/*', '/api/collaboration/*']),
        subscription_required: 'basic'
      },
      
      // Research-level roles
      {
        role: 'senior_researcher',
        role_type: 'research',
        permissions: JSON.stringify({
          ai_services: true,
          experiment_management: true,
          data_access: true,
          collaboration: true,
          publishing: true
        }),
        ui_access: JSON.stringify(['research_dashboard', 'ai_services', 'experiment_management', 'collaboration_tools', 'data_catalog']),
        api_access: JSON.stringify(['/api/ai-services/*', '/api/experiments/*', '/api/research/*', '/api/collaboration/*']),
        subscription_required: 'academic'
      },
      {
        role: 'researcher',
        role_type: 'research',
        permissions: JSON.stringify({
          ai_services: true,
          experiment_management: true,
          data_access: true,
          collaboration: true
        }),
        ui_access: JSON.stringify(['research_dashboard', 'ai_services', 'experiment_management', 'collaboration_tools']),
        api_access: JSON.stringify(['/api/ai-services/*', '/api/experiments/*', '/api/collaboration/*']),
        subscription_required: 'basic'
      },
      {
        role: 'student',
        role_type: 'research',
        permissions: JSON.stringify({
          ai_services: true,
          experiment_management: true,
          data_access: true
        }),
        ui_access: JSON.stringify(['student_dashboard', 'ai_services', 'experiment_management', 'educational_resources']),
        api_access: JSON.stringify(['/api/ai-services/*', '/api/experiments/*']),
        subscription_required: 'basic'
      },
      
      // Project participation roles
      {
        role: 'contributor',
        role_type: 'project',
        permissions: JSON.stringify({
          project_participation: true,
          data_access: true,
          collaboration: true
        }),
        ui_access: JSON.stringify(['project_workspace', 'collaboration_tools']),
        api_access: JSON.stringify(['/api/projects/*', '/api/collaboration/*']),
        subscription_required: 'basic'
      },
      {
        role: 'viewer',
        role_type: 'project',
        permissions: JSON.stringify({
          project_viewing: true,
          data_access: true
        }),
        ui_access: JSON.stringify(['project_overview']),
        api_access: JSON.stringify(['/api/projects/*']),
        subscription_required: 'basic'
      }
    ];

    rolePermissions.forEach(role => {
      insertRolePermission.run(
        role.role,
        role.role_type,
        role.permissions,
        role.ui_access,
        role.api_access,
        role.subscription_required
      );
    });

    console.log('✅ Role permissions seeded successfully');
  }

  // User operations
  createUser(userData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password, first_name, last_name, role, status, subscription_tier, organization, department, position, phone_number, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = `user-${Date.now()}`;
    stmt.run(
      id,
      userData.email,
      userData.password || 'temppass123',
      userData.firstName,
      userData.lastName,
      userData.role || 'researcher',
      userData.status || 'pending',
      userData.subscription_tier || 'basic',
      userData.organization || null,
      userData.department || null,
      userData.position || null,
      userData.phoneNumber || null,
      new Date().toISOString(),
      userData.created_by || null
    );
    
    return this.getUserById(id);
  }

  getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  getUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  updateUserStatus(id, status, updatedBy) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET status = ?, updated_at = CURRENT_TIMESTAMP, 
          ${status === 'active' ? 'approved_by = ?, approved_at = CURRENT_TIMESTAMP' : 'rejected_by = ?, rejected_at = CURRENT_TIMESTAMP'}
      WHERE id = ?
    `);
    
    if (status === 'active') {
      stmt.run(status, updatedBy, id);
    } else {
      stmt.run(status, updatedBy, id);
    }
    
    return this.getUserById(id);
  }

  // Organization operations
  createOrganization(orgData) {
    const stmt = this.db.prepare(`
      INSERT INTO organizations (id, name, description, admin_email, status, member_count, max_members, storage_limit_gb, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = `org-${Date.now()}`;
    stmt.run(
      id,
      orgData.name,
      orgData.description,
      orgData.admin_email,
      orgData.status || 'active',
      orgData.member_count || 0,
      orgData.max_members || 50,
      orgData.storage_limit_gb || 100,
      new Date().toISOString(),
      orgData.created_by || null
    );
    
    return this.getOrganizationById(id);
  }

  getOrganizationById(id) {
    const stmt = this.db.prepare('SELECT * FROM organizations WHERE id = ?');
    return stmt.get(id);
  }

  getAllOrganizations() {
    const stmt = this.db.prepare('SELECT * FROM organizations ORDER BY created_at DESC');
    return stmt.all();
  }

  // Project operations
  createProject(projectData) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, owner_id, project_type, visibility, legal_basis, status, member_count, resource_count, requires_dpia, cross_border_transfers, subscription_tier_required, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = `project-${Date.now()}`;
    stmt.run(
      id,
      projectData.name,
      projectData.description,
      projectData.owner_id,
      projectData.project_type,
      projectData.visibility || 'private',
      projectData.legal_basis,
      projectData.status || 'active',
      projectData.member_count || 0,
      projectData.resource_count || 0,
      projectData.requires_dpia ? 1 : 0,
      projectData.cross_border_transfers ? 1 : 0,
      projectData.subscription_tier_required || 'basic',
      new Date().toISOString()
    );
    
    return this.getProjectById(id);
  }

  getProjectById(id) {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id);
  }

  getAllProjects() {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all();
  }

  // Service operations
  getAllServices() {
    const stmt = this.db.prepare('SELECT * FROM services ORDER BY created_at DESC');
    return stmt.all();
  }

  // Dashboard statistics
  getDashboardStats() {
    const stats = {};
    
    // User statistics
    const userStats = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM users
    `).get();
    
    stats.totalUsers = userStats.total;
    stats.activeUsers = userStats.active;
    stats.pendingUsers = userStats.pending;
    
    // Organization statistics
    const orgStats = this.db.prepare('SELECT COUNT(*) as total FROM organizations').get();
    stats.totalOrganizations = orgStats.total;
    
    // Project statistics
    const projectStats = this.db.prepare('SELECT COUNT(*) as total FROM projects').get();
    stats.totalProjects = projectStats.total;
    
    // Service statistics
    const serviceStats = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM services
    `).get();
    
    stats.totalServices = serviceStats.total;
    stats.activeServices = serviceStats.active;
    
    // Resource utilization (simulated)
    stats.resourceUtilization = {
      cpu: Math.floor(Math.random() * 30) + 20,
      gpu: Math.floor(Math.random() * 40) + 10,
      storage: Math.floor(Math.random() * 20) + 50,
      memory: Math.floor(Math.random() * 25) + 60
    };
    
    return stats;
  }

  // Role-based access control functions
  getUserPermissions(userId) {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return null;

    const rolePermission = this.db.prepare('SELECT * FROM role_permissions WHERE role = ?').get(user.role);
    if (!rolePermission) return null;

    return {
      user: user,
      role: rolePermission.role,
      roleType: rolePermission.role_type,
      permissions: JSON.parse(rolePermission.permissions),
      uiAccess: JSON.parse(rolePermission.ui_access),
      apiAccess: JSON.parse(rolePermission.api_access),
      subscriptionRequired: rolePermission.subscription_required
    };
  }

  hasPermission(userId, permission) {
    const userPermissions = this.getUserPermissions(userId);
    if (!userPermissions) return false;
    
    return userPermissions.permissions[permission] === true;
  }

  hasUIAccess(userId, uiComponent) {
    const userPermissions = this.getUserPermissions(userId);
    if (!userPermissions) return false;
    
    return userPermissions.uiAccess.includes(uiComponent) || userPermissions.uiAccess.includes('*');
  }

  hasAPIAccess(userId, apiEndpoint) {
    const userPermissions = this.getUserPermissions(userId);
    if (!userPermissions) return false;
    
    return userPermissions.apiAccess.includes('*') || 
           userPermissions.apiAccess.some(pattern => apiEndpoint.startsWith(pattern));
  }

  checkSubscriptionAccess(userId, requiredTier) {
    const user = this.db.prepare('SELECT subscription_tier FROM users WHERE id = ?').get(userId);
    if (!user) return false;

    const tierLevels = { 'basic': 1, 'academic': 2, 'professional': 3, 'enterprise': 4 };
    const userTier = tierLevels[user.subscription_tier] || 0;
    const requiredLevel = tierLevels[requiredTier] || 0;
    
    return userTier >= requiredLevel;
  }

  getUsersByRole(role) {
    return this.db.prepare('SELECT * FROM users WHERE role = ?').all(role);
  }

  getUsersByOrganization(organizationId) {
    return this.db.prepare('SELECT * FROM users WHERE organization_id = ?').all(organizationId);
  }

  getProjectMembers(projectId) {
    return this.db.prepare(`
      SELECT u.*, pm.role as project_role, pm.joined_at
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = ?
    `).all(projectId);
  }

  getOrganizationMembers(organizationId) {
    return this.db.prepare(`
      SELECT u.*, om.role as org_role, om.joined_at
      FROM users u
      JOIN organization_members om ON u.id = om.user_id
      WHERE om.organization_id = ?
    `).all(organizationId);
  }

  addProjectMember(projectId, userId, role = 'contributor', permissions = null, invitedBy = null) {
    const id = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT INTO project_members (id, project_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `);
    
    return stmt.run(id, projectId, userId, role);
  }

  getProjectMembersByUserId(userId) {
    return this.db.prepare(`
      SELECT pm.*, p.name as project_name
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      WHERE pm.user_id = ?
    `).all(userId);
  }

  addOrganizationMember(organizationId, userId, role = 'member', permissions = null, invitedBy = null) {
    const id = `om_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stmt = this.db.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `);
    
    return stmt.run(id, organizationId, userId, role);
  }

  updateUserRole(userId, newRole, organizationRole = null, projectRole = null) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET role = ?, organization_role = ?, project_role = ?, updated_at = ?
      WHERE id = ?
    `);
    
    return stmt.run(newRole, organizationRole, projectRole, new Date().toISOString(), userId);
  }

  // AI Services Management
  createAIService(serviceData) {
    const stmt = this.db.prepare(`
      INSERT INTO ai_services (
        id, name, description, category, requirements, access_level,
        requires_approval, max_users, status, documentation, api_endpoint,
        cost_per_request, gdpr_compliant, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = `ai_svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    stmt.run(
      id,
      serviceData.name,
      serviceData.description,
      serviceData.category,
      serviceData.requirements,
      serviceData.access_level || 'restricted',
      serviceData.requires_approval ? 1 : 0, // Convert boolean to integer
      serviceData.max_users,
      serviceData.status || 'active',
      serviceData.documentation,
      serviceData.api_endpoint,
      serviceData.cost_per_request,
      serviceData.gdpr_compliant ? 1 : 0, // Convert boolean to integer
      serviceData.created_by
    );
    
    return id;
  }

  getAIServices() {
    const stmt = this.db.prepare('SELECT * FROM ai_services ORDER BY created_at DESC');
    return stmt.all();
  }

  getAIServiceById(id) {
    const stmt = this.db.prepare('SELECT * FROM ai_services WHERE id = ?');
    return stmt.get(id);
  }

  updateAIService(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE ai_services SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values);
  }

  deleteAIService(id) {
    const stmt = this.db.prepare('DELETE FROM ai_services WHERE id = ?');
    stmt.run(id);
  }

  // User Service Access Management
  requestServiceAccess(userId, serviceId, requestData) {
    const stmt = this.db.prepare(`
      INSERT INTO user_service_access (
        id, user_id, service_id, status, admin_notes
      ) VALUES (?, ?, ?, ?, ?)
    `);
    
    const id = `access_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    stmt.run(
      id,
      userId,
      serviceId,
      'pending',
      requestData.admin_notes || null
    );
    
    return id;
  }

  getUserServiceAccess(userId) {
    const stmt = this.db.prepare(`
      SELECT usa.*, ai.name as service_name, ai.description as service_description,
             ai.category, ai.access_level, ai.requires_approval
      FROM user_service_access usa
      JOIN ai_services ai ON usa.service_id = ai.id
      WHERE usa.user_id = ?
      ORDER BY usa.requested_at DESC
    `);
    return stmt.all(userId);
  }

  getServiceAccessRequests() {
    const stmt = this.db.prepare(`
        SELECT usa.*, u.email as user_email, u.role as user_role,
             ai.name as service_name, ai.description as service_description
      FROM user_service_access usa
      JOIN users u ON usa.user_id = u.id
      JOIN ai_services ai ON usa.service_id = ai.id
      ORDER BY usa.requested_at DESC
    `);
    return stmt.all();
  }

  updateServiceAccessRequest(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE user_service_access SET ${fields} WHERE id = ?`);
    stmt.run(...values);
  }

  getUserApprovedServices(userId) {
    const stmt = this.db.prepare(`
      SELECT ai.*, usa.status, usa.approved_at, usa.usage_count, usa.last_used
      FROM ai_services ai
      JOIN user_service_access usa ON ai.id = usa.service_id
      WHERE usa.user_id = ? AND usa.status = 'approved'
      ORDER BY usa.approved_at DESC
    `);
    return stmt.all(userId);
  }

  incrementServiceUsage(userId, serviceId) {
    const stmt = this.db.prepare(`
      UPDATE user_service_access 
      SET usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP
      WHERE user_id = ? AND service_id = ? AND status = 'approved'
    `);
    stmt.run(userId, serviceId);
  }

  // Hardware Resource Management Functions
  createHardwareResource(resourceData) {
    const id = `hw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const {
      type, name, cluster, location, specifications, status, cost_per_hour, 
      energy_efficiency, created_by
    } = resourceData;
    
    const stmt = this.db.prepare(`
      INSERT INTO hardware_resources (
        id, type, name, cluster, location, specifications, status, 
        cost_per_hour, energy_efficiency, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      stmt.run(
        id, type, name, cluster, location, JSON.stringify(specifications), 
        status, cost_per_hour, energy_efficiency, created_by
      );
      return { success: true, id };
    } catch (error) {
      console.error('Error creating hardware resource:', error);
      return { success: false, error: error.message };
    }
  }

  getHardwareResources() {
    try {
      const stmt = this.db.prepare(`
        SELECT hr.*, u.email as created_by_email
        FROM hardware_resources hr
        LEFT JOIN users u ON hr.created_by = u.id
        ORDER BY hr.created_at DESC
      `);
      const resources = stmt.all();
      
      return resources.map(resource => ({
        ...resource,
        specifications: JSON.parse(resource.specifications || '{}')
      }));
    } catch (error) {
      console.error('Error fetching hardware resources:', error);
      return [];
    }
  }

  getHardwareResourceById(id) {
    try {
      const stmt = this.db.prepare(`
        SELECT hr.*, u.email as created_by_email
        FROM hardware_resources hr
        LEFT JOIN users u ON hr.created_by = u.id
        WHERE hr.id = ?
      `);
      const resource = stmt.get(id);
      
      if (resource) {
        resource.specifications = JSON.parse(resource.specifications || '{}');
      }
      
      return resource;
    } catch (error) {
      console.error('Error fetching hardware resource:', error);
      return null;
    }
  }

  updateHardwareResource(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'specifications') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    try {
      const stmt = this.db.prepare(`
        UPDATE hardware_resources 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);
      const result = stmt.run(...values);
      
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Error updating hardware resource:', error);
      return { success: false, error: error.message };
    }
  }

  deleteHardwareResource(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM hardware_resources WHERE id = ?');
      const result = stmt.run(id);
      
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Error deleting hardware resource:', error);
      return { success: false, error: error.message };
    }
  }

  // Hardware Request Management Functions
  createHardwareRequest(requestData) {
    const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const {
      user_id, project_id, resource_type, specifications, priority, 
      justification, expected_usage, start_date, end_date, estimated_cost
    } = requestData;
    
    const stmt = this.db.prepare(`
      INSERT INTO hardware_requests (
        id, user_id, project_id, resource_type, specifications, priority,
        justification, expected_usage, start_date, end_date, status, estimated_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
    `);
    
    try {
      stmt.run(
        id, user_id, project_id, resource_type, JSON.stringify(specifications),
        priority, justification, expected_usage, start_date, end_date, estimated_cost
      );
      return { success: true, id };
    } catch (error) {
      console.error('Error creating hardware request:', error);
      return { success: false, error: error.message };
    }
  }

  getHardwareRequests(userId = null) {
    try {
      let query = `
        SELECT hr.*, u.email as user_email, u.role as user_role,
               p.name as project_name
        FROM hardware_requests hr
        LEFT JOIN users u ON hr.user_id = u.id
        LEFT JOIN projects p ON hr.project_id = p.id
      `;
      
      const params = [];
      if (userId) {
        query += ' WHERE hr.user_id = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY hr.created_at DESC';
      
      const stmt = this.db.prepare(query);
      const requests = stmt.all(...params);
      
      return requests.map(request => ({
        ...request,
        specifications: JSON.parse(request.specifications || '{}')
      }));
    } catch (error) {
      console.error('Error fetching hardware requests:', error);
      return [];
    }
  }

  updateHardwareRequest(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'specifications') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });
    
    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    try {
      const stmt = this.db.prepare(`
        UPDATE hardware_requests 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);
      const result = stmt.run(...values);
      
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Error updating hardware request:', error);
      return { success: false, error: error.message };
    }
  }

  approveHardwareRequest(id, adminId, adminNotes = '') {
    try {
      const stmt = this.db.prepare(`
        UPDATE hardware_requests 
        SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP, 
            admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(adminId, adminNotes, id);
      
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Error approving hardware request:', error);
      return { success: false, error: error.message };
    }
  }

  rejectHardwareRequest(id, adminId, adminNotes = '') {
    try {
      const stmt = this.db.prepare(`
        UPDATE hardware_requests 
        SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
            admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(adminId, adminNotes, id);
      
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Error rejecting hardware request:', error);
      return { success: false, error: error.message };
    }
  }

  // Seed Hardware Resources
  seedHardwareResources() {
    console.log('🖥️ Seeding hardware resources...');
    
    const resources = [
      {
        type: 'GPU',
        name: 'NVIDIA A100 80GB',
        cluster: 'production',
        location: 'EU-Central-1',
        specifications: {
          model: 'A100',
          memory: 80,
          computeCapability: '8.0',
          powerConsumption: 400,
          cores: 6912
        },
        status: 'available',
        cost_per_hour: 2.50,
        energy_efficiency: 95,
        created_by: 'system'
      },
      {
        type: 'GPU',
        name: 'NVIDIA V100 32GB',
        cluster: 'production',
        location: 'EU-Central-1',
        specifications: {
          model: 'V100',
          memory: 32,
          computeCapability: '7.0',
          powerConsumption: 300,
          cores: 5120
        },
        status: 'available',
        cost_per_hour: 1.80,
        energy_efficiency: 90,
        created_by: 'system'
      },
      {
        type: 'GPU',
        name: 'NVIDIA T4 16GB',
        cluster: 'development',
        location: 'EU-West-1',
        specifications: {
          model: 'T4',
          memory: 16,
          computeCapability: '7.5',
          powerConsumption: 70,
          cores: 2560
        },
        status: 'available',
        cost_per_hour: 0.80,
        energy_efficiency: 85,
        created_by: 'system'
      },
      {
        type: 'CPU',
        name: 'Intel Xeon Gold 6248R',
        cluster: 'production',
        location: 'EU-Central-1',
        specifications: {
          cores: 24,
          threads: 48,
          frequency: 3.0,
          architecture: 'x86_64',
          cache: { L1: 32, L2: 1024, L3: 33792 }
        },
        status: 'available',
        cost_per_hour: 0.15,
        energy_efficiency: 88,
        created_by: 'system'
      },
      {
        type: 'Memory',
        name: 'DDR4-3200 128GB',
        cluster: 'production',
        location: 'EU-Central-1',
        specifications: {
          total: 128,
          available: 128,
          type: 'DDR4',
          speed: 3200,
          bandwidth: 25.6
        },
        status: 'available',
        cost_per_hour: 0.05,
        energy_efficiency: 92,
        created_by: 'system'
      }
    ];

    for (const resource of resources) {
      this.createHardwareResource(resource);
    }
  }

  // Seed sample projects and users for hardware requests
  seedSampleProjectsAndUsers() {
    console.log('👥 Seeding sample projects and users...');
    
    // Create sample users if they don't exist
    const existingUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers.count === 0) {
      const insertUser = this.db.prepare(`
        INSERT INTO users (id, email, password, role, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const users = [
        {
          id: 'user-1',
          email: 'researcher@university.edu',
          password: 'researcher123',
          role: 'researcher',
          status: 'active'
        },
        {
          id: 'user-2', 
          email: 'student@university.edu',
          password: 'student123',
          role: 'student',
          status: 'active'
        },
        {
          id: 'user-3',
          email: 'professor@university.edu', 
          password: 'professor123',
          role: 'researcher',
          status: 'active'
        }
      ];
      
      users.forEach(user => {
        insertUser.run(
          user.id,
          user.email,
          user.password,
          user.role,
          user.status,
          new Date().toISOString()
        );
      });
    }
    
    // Create sample projects
    const insertProject = this.db.prepare(`
      INSERT OR REPLACE INTO projects (id, name, description, status, owner_id, project_type, visibility, legal_basis, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const projects = [
      {
        id: 'project-1',
        name: 'Deep Learning Research',
        description: 'AI model training and research project',
        status: 'active',
        owner_id: 'user-1',
        project_type: 'research',
        visibility: 'private',
        legal_basis: 'academic_research'
      },
      {
        id: 'project-2',
        name: 'Computer Vision Analysis',
        description: 'Image processing and computer vision research',
        status: 'active',
        owner_id: 'user-3',
        project_type: 'research',
        visibility: 'private',
        legal_basis: 'academic_research'
      },
      {
        id: 'project-3',
        name: 'NLP Text Processing',
        description: 'Natural language processing research',
        status: 'active',
        owner_id: 'user-2',
        project_type: 'research',
        visibility: 'private',
        legal_basis: 'academic_research'
      }
    ];
    
    projects.forEach(project => {
      insertProject.run(
        project.id,
        project.name,
        project.description,
        project.status,
        project.owner_id,
        project.project_type,
        project.visibility,
        project.legal_basis,
        new Date().toISOString()
      );
    });
    
    // Create sample hardware requests
    const insertRequest = this.db.prepare(`
      INSERT OR REPLACE INTO hardware_requests (
        id, user_id, project_id, resource_type, specifications, priority,
        justification, expected_usage, start_date, end_date, status, estimated_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const requests = [
      {
        id: 'req-1',
        user_id: 'user-1',
        project_id: 'project-1',
        resource_type: 'GPU',
        specifications: 'Need A100 GPU for deep learning model training',
        priority: 'high',
        justification: 'Training large transformer model requires high-memory GPU',
        expected_usage: 'Model training for 48 hours',
        start_date: '2024-01-15T09:00:00Z',
        end_date: '2024-01-17T09:00:00Z',
        status: 'submitted',
        estimated_cost: 120.00
      },
      {
        id: 'req-2',
        user_id: 'user-2',
        project_id: 'project-3',
        resource_type: 'CPU',
        specifications: 'High-performance CPU for data processing',
        priority: 'normal',
        justification: 'Large dataset processing requires high CPU performance',
        expected_usage: 'Data processing for 24 hours',
        start_date: '2024-01-20T10:00:00Z',
        end_date: '2024-01-21T10:00:00Z',
        status: 'under_review',
        estimated_cost: 3.60
      },
      {
        id: 'req-3',
        user_id: 'user-3',
        project_id: 'project-2',
        resource_type: 'GPU',
        specifications: 'V100 GPU for computer vision model training',
        priority: 'high',
        justification: 'Computer vision model requires GPU acceleration',
        expected_usage: 'Model training for 72 hours',
        start_date: '2024-01-25T08:00:00Z',
        end_date: '2024-01-28T08:00:00Z',
        status: 'approved',
        estimated_cost: 129.60
      }
    ];
    
    requests.forEach(request => {
      insertRequest.run(
        request.id,
        request.user_id,
        request.project_id,
        request.resource_type,
        JSON.stringify(request.specifications),
        request.priority,
        request.justification,
        request.expected_usage,
        request.start_date,
        request.end_date,
        request.status,
        request.estimated_cost
      );
    });
    
    console.log('✅ Sample projects and users seeded successfully');
  }

  // Seed initial AI services
  seedAIServices() {
    console.log('🤖 Seeding AI services...');
    
    // Check if AI services already exist
    const existingServices = this.db.prepare('SELECT COUNT(*) as count FROM ai_services').get();
    if (existingServices.count > 0) {
      console.log('📊 AI services already exist, skipping seed');
      return;
    }
    
    // Comprehensive AI services based on customer requirements
    const services = [
      // Core Template Services
      {
        name: 'Model Benchmarking Template',
        description: 'Ready-to-use benchmarking templates for company-trained models with immediate results',
        category: 'Templates',
        requirements: 'Dataset and evaluation criteria',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 100,
        documentation: 'https://docs.example.com/benchmarking',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Requirement Document Templates',
        description: 'Upload documents and get structured outputs with automated processing',
        category: 'Templates',
        requirements: 'Document upload capability',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 200,
        documentation: 'https://docs.example.com/document-templates',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Cost Estimation Templates',
        description: 'AI-powered project cost estimation with detailed analysis and risk assessment',
        category: 'Templates',
        requirements: 'Project requirements and scope',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 150,
        documentation: 'https://docs.example.com/cost-estimation',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'AI Technique Assessment',
        description: 'Automated requirement assessment that suggests suitable AI techniques',
        category: 'Assessment',
        requirements: 'Project requirements and goals',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 75,
        documentation: 'https://docs.example.com/ai-assessment',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      
      // Experiment Services
      {
        name: 'Data Preprocessing Pipeline',
        description: 'Complete data profiling, cleaning, and transformation workflows',
        category: 'Data Processing',
        requirements: 'Dataset and preprocessing requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 80,
        documentation: 'https://docs.example.com/data-preprocessing',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Controlled Experiment Execution',
        description: 'Reproducible experiment runs with GPU allocation and monitoring',
        category: 'Experiments',
        requirements: 'Experiment configuration and resources',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 50,
        documentation: 'https://docs.example.com/experiment-execution',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Results Dashboard & Reports',
        description: 'Interactive dashboards with metrics and exportable reports',
        category: 'Analytics',
        requirements: 'Experiment results and data',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 100,
        documentation: 'https://docs.example.com/results-dashboard',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      
      // AI Services
      {
        name: 'Text Analysis AI',
        description: 'Natural language processing and sentiment analysis with EU compliance',
        category: 'NLP',
        requirements: 'Text data and analysis requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 120,
        documentation: 'https://docs.example.com/text-analysis',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Computer Vision Model',
        description: 'Image classification and object detection with privacy protection',
        category: 'Computer Vision',
        requirements: 'Image data and CV requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 90,
        documentation: 'https://docs.example.com/computer-vision',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'RAG Workflow Templates',
        description: 'Ready-to-use Retrieval-Augmented Generation templates',
        category: 'RAG',
        requirements: 'Documents and knowledge base',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 60,
        documentation: 'https://docs.example.com/rag-workflows',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Fine-Tuning Workflows',
        description: 'Custom model fine-tuning with monitoring and evaluation',
        category: 'Model Training',
        requirements: 'Training data and model requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 40,
        documentation: 'https://docs.example.com/fine-tuning',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Speech Processing Suite',
        description: 'Audio processing, speech recognition, and text-to-speech',
        category: 'Speech',
        requirements: 'Audio data and processing requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 70,
        documentation: 'https://docs.example.com/speech-processing',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Recommendation Engine',
        description: 'Personalized recommendation systems with privacy protection',
        category: 'Recommendations',
        requirements: 'User data and recommendation goals',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 85,
        documentation: 'https://docs.example.com/recommendation-engine',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Time Series Analysis',
        description: 'Advanced time series forecasting and anomaly detection',
        category: 'Time Series',
        requirements: 'Time series data and analysis goals',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 65,
        documentation: 'https://docs.example.com/time-series',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      
      // Security & Compliance Services
      {
        name: 'Security Compliance Dashboard',
        description: 'Real-time security monitoring and EU AI Act compliance tracking',
        category: 'Security',
        requirements: 'System access and compliance requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 30,
        documentation: 'https://docs.example.com/security-compliance',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Vulnerability Scanner',
        description: 'AI model security assessment and vulnerability detection',
        category: 'Security',
        requirements: 'Model access and security requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 25,
        documentation: 'https://docs.example.com/vulnerability-scanner',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'AI-Powered Test Generation',
        description: 'Generate test cases from company codebase using advanced AI',
        category: 'Testing',
        requirements: 'Codebase access and testing requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 55,
        documentation: 'https://docs.example.com/test-generation',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      
      // Infrastructure Services
      {
        name: 'GPU Resource Allocation',
        description: 'Dynamic GPU allocation and resource management',
        category: 'Infrastructure',
        requirements: 'Resource requirements and allocation needs',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 35,
        documentation: 'https://docs.example.com/gpu-allocation',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Secure Data Storage',
        description: 'Encrypted data storage with access controls and audit trails',
        category: 'Infrastructure',
        requirements: 'Data storage requirements and security needs',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 200,
        documentation: 'https://docs.example.com/secure-storage',
        gdpr_compliant: 1,
        created_by: 'system'
      },
      {
        name: 'Legal Assistant Service',
        description: 'AI-powered legal document analysis and compliance checking',
        category: 'Legal',
        requirements: 'Legal documents and compliance requirements',
        access_level: 'restricted',
        requires_approval: 1,
        max_users: 45,
        documentation: 'https://docs.example.com/legal-assistant',
        gdpr_compliant: 1,
        created_by: 'system'
      }
    ];

    services.forEach(service => {
      try {
        this.createAIService(service);
      } catch (error) {
        console.error('Error creating AI service:', service.name, error);
      }
    });
    
    console.log('✅ AI services seeded successfully');
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('🗄️  Database connection closed');
    }
  }
}

// Export singleton instance
export default new DatabaseManager();
