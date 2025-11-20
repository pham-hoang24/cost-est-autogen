-- SW4E Governance Database Schema
-- Professional governance system for AI research platform

-- User Roles and Permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role_type TEXT CHECK(role_type IN ('super_admin', 'research_admin', 'researcher', 'viewer')) NOT NULL DEFAULT 'viewer',
    organization_id TEXT NULL,
    organization_name TEXT NULL,
    permissions TEXT DEFAULT '{}', -- JSON string for flexible permissions
    status TEXT CHECK(status IN ('pending', 'approved', 'suspended', 'rejected')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by TEXT NULL,
    approved_at DATETIME NULL
);

-- Resource Quotas and Usage
CREATE TABLE IF NOT EXISTS resource_quotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    organization_id TEXT NULL,
    
    -- Compute Resources (hours per month)
    cpu_hours_limit INTEGER DEFAULT 100,
    gpu_hours_limit INTEGER DEFAULT 10,
    memory_gb_hours_limit INTEGER DEFAULT 1000,
    
    -- Storage Resources (GB)
    storage_gb_limit INTEGER DEFAULT 50,
    
    -- Current Usage (reset monthly)
    used_cpu_hours INTEGER DEFAULT 0,
    used_gpu_hours INTEGER DEFAULT 0,
    used_memory_gb_hours INTEGER DEFAULT 0,
    used_storage_gb INTEGER DEFAULT 0,
    
    -- Limits and Controls
    max_concurrent_experiments INTEGER DEFAULT 5,
    max_model_deployments INTEGER DEFAULT 3,
    api_requests_per_day INTEGER DEFAULT 10000,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reset_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_type TEXT CHECK(request_type IN ('user_registration', 'project_creation', 'model_deployment', 'data_access', 'service_access', 'quota_increase')) NOT NULL,
    requester_id TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    approver_id TEXT NULL,
    approver_email TEXT NULL,
    
    -- Request Status
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    -- Request Data (JSON)
    request_data TEXT DEFAULT '{}',
    rejection_reason TEXT NULL,
    approval_notes TEXT NULL,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME NULL,
    expires_at DATETIME NULL
);

-- Organizations/Research Labs
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    admin_id TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    
    -- Organization Resources
    total_cpu_hours_limit INTEGER DEFAULT 1000,
    total_gpu_hours_limit INTEGER DEFAULT 100,
    total_storage_gb_limit INTEGER DEFAULT 1000,
    
    -- Usage Tracking
    used_cpu_hours INTEGER DEFAULT 0,
    used_gpu_hours INTEGER DEFAULT 0,
    used_storage_gb INTEGER DEFAULT 0,
    
    -- Organization Settings
    auto_approve_members BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 50,
    current_members INTEGER DEFAULT 1,
    
    -- Compliance
    gdpr_compliant BOOLEAN DEFAULT TRUE,
    ai_act_compliant BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('active', 'suspended', 'archived')) DEFAULT 'active'
);

-- Audit Trail for Governance Actions
CREATE TABLE IF NOT EXISTS governance_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL, -- 'user_approved', 'role_changed', 'quota_updated', etc.
    actor_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    target_id TEXT NULL, -- ID of affected user/resource
    target_email TEXT NULL,
    
    -- Action Details
    action_description TEXT NOT NULL,
    old_values TEXT DEFAULT '{}', -- JSON of previous state
    new_values TEXT DEFAULT '{}', -- JSON of new state
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    
    -- Compliance
    compliance_impact TEXT NULL,
    risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resource Usage Tracking (for detailed monitoring)
CREATE TABLE IF NOT EXISTS resource_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    organization_id TEXT NULL,
    
    -- Resource Type
    resource_type TEXT CHECK(resource_type IN ('cpu', 'gpu', 'memory', 'storage', 'network')) NOT NULL,
    service_name TEXT NOT NULL, -- Which SW4E service was used
    
    -- Usage Metrics
    amount_used REAL NOT NULL, -- Amount of resource consumed
    unit TEXT NOT NULL, -- 'hours', 'gb', 'requests', etc.
    cost_estimate REAL DEFAULT 0,
    
    -- Session Info
    session_id TEXT,
    project_id TEXT NULL,
    experiment_id TEXT NULL,
    
    -- Metadata
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project Governance
CREATE TABLE IF NOT EXISTS project_governance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    organization_id TEXT NULL,
    
    -- Governance Status
    approval_status TEXT CHECK(approval_status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
    ethics_review_status TEXT CHECK(ethics_review_status IN ('not_required', 'pending', 'approved', 'rejected')) DEFAULT 'not_required',
    data_classification TEXT CHECK(data_classification IN ('public', 'internal', 'confidential', 'restricted')) DEFAULT 'internal',
    
    -- Compliance Flags
    contains_personal_data BOOLEAN DEFAULT FALSE,
    requires_anonymization BOOLEAN DEFAULT FALSE,
    ai_model_involved BOOLEAN DEFAULT FALSE,
    high_risk_ai_system BOOLEAN DEFAULT FALSE,
    
    -- Resource Allocation
    allocated_cpu_hours INTEGER DEFAULT 50,
    allocated_gpu_hours INTEGER DEFAULT 5,
    allocated_storage_gb INTEGER DEFAULT 20,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME NULL,
    approved_by TEXT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON user_roles(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON user_roles(role_type);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_requester ON approval_workflows(requester_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_type ON approval_workflows(request_type);

CREATE INDEX IF NOT EXISTS idx_governance_audit_actor ON governance_audit(actor_id);
CREATE INDEX IF NOT EXISTS idx_governance_audit_action ON governance_audit(action_type);
CREATE INDEX IF NOT EXISTS idx_governance_audit_date ON governance_audit(created_at);

CREATE INDEX IF NOT EXISTS idx_resource_usage_user ON resource_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_service ON resource_usage(service_name);
CREATE INDEX IF NOT EXISTS idx_resource_usage_date ON resource_usage(created_at);

-- Insert default Super Admin user
INSERT OR IGNORE INTO user_roles (user_id, email, role_type, status, permissions) 
VALUES ('super-admin-001', 'admin@sw4e.org', 'super_admin', 'approved', '{"all": true}');

-- Insert default resource quota for Super Admin
INSERT OR IGNORE INTO resource_quotas (user_id, cpu_hours_limit, gpu_hours_limit, storage_gb_limit, max_concurrent_experiments, max_model_deployments) 
VALUES ('super-admin-001', 99999, 99999, 99999, 999, 999);
