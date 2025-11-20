-- Enhanced SW4E Governance Database Schema
-- Phase 1: Enhanced Role System & Database Schema

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    admin_id TEXT NOT NULL,
    plan_type TEXT DEFAULT 'research_team' CHECK(plan_type IN ('individual', 'research_team', 'enterprise')),
    storage_limit_gb INTEGER DEFAULT 100,
    member_limit INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('research_admin', 'researcher', 'viewer')),
    storage_quota_gb INTEGER DEFAULT 5,
    invited_by TEXT,
    invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    joined_at DATETIME,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'suspended', 'removed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (invited_by) REFERENCES users(id),
    UNIQUE(organization_id, user_id)
);

-- Enhanced resource quotas table
CREATE TABLE IF NOT EXISTS resource_quotas (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    organization_id TEXT,
    quota_type TEXT DEFAULT 'user' CHECK(quota_type IN ('user', 'organization')),
    cpu_hours_limit INTEGER DEFAULT 50,
    gpu_hours_limit INTEGER DEFAULT 5,
    storage_gb_limit INTEGER DEFAULT 10,
    used_cpu_hours INTEGER DEFAULT 0,
    used_gpu_hours INTEGER DEFAULT 0,
    used_storage_gb INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Resource usage tracking table
CREATE TABLE IF NOT EXISTS resource_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    organization_id TEXT,
    resource_type TEXT NOT NULL CHECK(resource_type IN ('cpu', 'gpu', 'storage')),
    amount_used REAL NOT NULL,
    project_id TEXT,
    experiment_id TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Invitation tokens table
CREATE TABLE IF NOT EXISTS invitation_tokens (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    organization_id TEXT NOT NULL,
    invited_email TEXT NOT NULL,
    invited_by TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('research_admin', 'researcher', 'viewer')),
    storage_quota_gb INTEGER DEFAULT 5,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Update users table to add organization context
ALTER TABLE users ADD COLUMN organization_id TEXT;
ALTER TABLE users ADD COLUMN is_individual BOOLEAN DEFAULT 1;
ALTER TABLE users ADD COLUMN last_activity DATETIME;

-- Add foreign key constraint for organization_id in users table
-- Note: This will be added after the organizations table is created

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_admin_id ON organizations(admin_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_status ON organization_members(status);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_user_id ON resource_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_org_id ON resource_quotas(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_user_id ON resource_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_org_id ON resource_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_token ON invitation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invitation_tokens_email ON invitation_tokens(invited_email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_is_individual ON users(is_individual);

-- Insert default organization for existing super admin
INSERT OR IGNORE INTO organizations (
    id, name, description, admin_id, plan_type, storage_limit_gb, member_limit, status
) VALUES (
    'sw4e-platform-org',
    'SW4E Platform',
    'Default platform organization for system administration',
    (SELECT id FROM users WHERE email = 'admin@sw4e.org' LIMIT 1),
    'enterprise',
    99999,
    99999,
    'active'
);

-- Update super admin to be part of the platform organization
UPDATE users 
SET organization_id = 'sw4e-platform-org', is_individual = 0
WHERE email = 'admin@sw4e.org';

-- Create organization membership for super admin
INSERT OR IGNORE INTO organization_members (
    id, organization_id, user_id, role, storage_quota_gb, status, joined_at
) VALUES (
    'super-admin-membership',
    'sw4e-platform-org',
    (SELECT id FROM users WHERE email = 'admin@sw4e.org' LIMIT 1),
    'research_admin',
    99999,
    'active',
    CURRENT_TIMESTAMP
);

-- Update resource quotas for super admin
UPDATE resource_quotas 
SET organization_id = 'sw4e-platform-org', quota_type = 'organization'
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@sw4e.org' LIMIT 1);
