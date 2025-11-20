-- SW4E Role System Extension - Safe Database Schema
-- This extends the existing system WITHOUT breaking changes

-- 1. Role Hierarchy Mapping (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS role_hierarchy (
  role_id TEXT PRIMARY KEY,
  parent_role TEXT,
  access_level TEXT CHECK(access_level IN ('super_admin', 'org_admin', 'manager', 'professional', 'support', 'guest')),
  category TEXT CHECK(category IN ('institutional', 'corporate', 'research', 'technical', 'administrative', 'external')),
  inherits_from TEXT DEFAULT '[]', -- JSON array of roles this role inherits from
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Preferences (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  basic_preferences TEXT DEFAULT '{}', -- JSON: theme, language, notifications
  role_specific_preferences TEXT DEFAULT '{}', -- JSON: role-based customizations
  advanced_customizations TEXT DEFAULT '{}', -- JSON: custom permissions, workflows
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Role Permissions (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  permission_name TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions TEXT DEFAULT '{}', -- JSON conditions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES role_hierarchy(role_id) ON DELETE CASCADE
);

-- 4. User Permission Overrides (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  action TEXT CHECK(action IN ('add', 'remove', 'modify')) NOT NULL,
  conditions TEXT DEFAULT '{}', -- JSON conditions
  expires_at DATETIME NULL,
  approved_by TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES role_permissions(id) ON DELETE CASCADE
);

-- 5. Organization Role Customizations (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS organization_role_customizations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  customizations TEXT DEFAULT '{}', -- JSON customizations
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES role_hierarchy(role_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Temporary Role Assignments (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS temporary_role_assignments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  temporary_role TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  permissions TEXT DEFAULT '[]', -- JSON array of permissions
  conditions TEXT DEFAULT '{}', -- JSON conditions
  auto_revoke BOOLEAN DEFAULT TRUE,
  notification_settings TEXT DEFAULT '{}', -- JSON notification settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Role Delegation Matrix (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS role_delegation_matrix (
  id TEXT PRIMARY KEY,
  from_role TEXT NOT NULL,
  to_role TEXT NOT NULL,
  permissions_delegated TEXT DEFAULT '[]', -- JSON array
  duration TEXT CHECK(duration IN ('permanent', 'temporary')) DEFAULT 'permanent',
  approval_required BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Permission Audit Log (NEW TABLE - no impact on existing)
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action_type TEXT NOT NULL,
  target_user_id TEXT,
  permission_changes TEXT DEFAULT '{}', -- JSON changes
  old_values TEXT DEFAULT '{}', -- JSON old values
  new_values TEXT DEFAULT '{}', -- JSON new values
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Insert Role Hierarchy Data (NEW DATA - no impact on existing)
INSERT OR IGNORE INTO role_hierarchy (role_id, parent_role, access_level, category, inherits_from, description) VALUES
-- Existing roles (maintain compatibility)
('super_admin', NULL, 'super_admin', 'administrative', '[]', 'Full system administration'),
('research_admin', 'super_admin', 'org_admin', 'administrative', '["super_admin"]', 'Organization-level administration'),
('researcher', 'research_admin', 'professional', 'research', '["research_admin"]', 'Full research capabilities'),
('viewer', 'researcher', 'support', 'research', '["researcher"]', 'Read-only access'),

-- University roles
('university_admin', 'research_admin', 'org_admin', 'institutional', '["research_admin"]', 'University system administrator'),
('university_coordinator', 'university_admin', 'manager', 'institutional', '["university_admin"]', 'Research coordination manager'),
('university_faculty', 'university_coordinator', 'professional', 'institutional', '["university_coordinator"]', 'Faculty member/professor'),
('university_researcher', 'university_faculty', 'professional', 'institutional', '["university_faculty"]', 'University research staff'),
('university_student', 'university_researcher', 'support', 'institutional', '["university_researcher"]', 'Graduate/PhD student'),

-- Corporate roles
('corporate_admin', 'research_admin', 'org_admin', 'corporate', '["research_admin"]', 'Corporate system administrator'),
('corporate_manager', 'corporate_admin', 'manager', 'corporate', '["corporate_admin"]', 'R&D manager/director'),
('corporate_researcher', 'corporate_manager', 'professional', 'corporate', '["corporate_manager"]', 'Corporate research scientist'),
('corporate_analyst', 'corporate_researcher', 'support', 'corporate', '["corporate_researcher"]', 'Data analyst/business analyst'),
('corporate_intern', 'corporate_analyst', 'support', 'corporate', '["corporate_analyst"]', 'Research intern/trainee'),

-- Individual research roles
('independent_researcher', 'researcher', 'professional', 'research', '["researcher"]', 'Independent researcher'),
('consultant', 'independent_researcher', 'professional', 'research', '["independent_researcher"]', 'Research consultant'),
('postdoc', 'consultant', 'professional', 'research', '["consultant"]', 'Postdoctoral researcher'),
('visiting_scholar', 'postdoc', 'guest', 'research', '["postdoc"]', 'Visiting academic/researcher'),

-- Technical specialist roles
('data_scientist', 'researcher', 'professional', 'technical', '["researcher"]', 'Data science specialist'),
('ml_engineer', 'data_scientist', 'professional', 'technical', '["data_scientist"]', 'Machine learning engineer'),
('ai_researcher', 'ml_engineer', 'professional', 'technical', '["ml_engineer"]', 'AI research specialist'),
('security_analyst', 'ai_researcher', 'professional', 'technical', '["ai_researcher"]', 'Security & compliance specialist'),

-- Platform support roles
('platform_moderator', 'research_admin', 'support', 'administrative', '["research_admin"]', 'Content moderator'),
('platform_support', 'platform_moderator', 'support', 'administrative', '["platform_moderator"]', 'Technical support specialist'),
('platform_auditor', 'platform_support', 'support', 'administrative', '["platform_support"]', 'Compliance auditor'),

-- External stakeholder roles
('government_official', 'viewer', 'guest', 'external', '["viewer"]', 'Government representative'),
('regulatory_officer', 'government_official', 'guest', 'external', '["government_official"]', 'Regulatory compliance officer'),
('funding_agency', 'regulatory_officer', 'guest', 'external', '["regulatory_officer"]', 'Funding agency representative'),
('industry_partner', 'funding_agency', 'guest', 'external', '["funding_agency"]', 'Industry collaboration partner');

-- 10. Insert Role Delegation Matrix (NEW DATA - no impact on existing)
INSERT OR IGNORE INTO role_delegation_matrix (from_role, to_role, permissions_delegated, duration, approval_required) VALUES
-- University delegation
('university_admin', 'university_coordinator', '["user_management", "resource_allocation"]', 'permanent', FALSE),
('university_admin', 'university_faculty', '["student_management", "project_oversight"]', 'temporary', TRUE),
('university_coordinator', 'university_faculty', '["project_coordination", "team_management"]', 'permanent', FALSE),

-- Corporate delegation
('corporate_admin', 'corporate_manager', '["team_management", "resource_requests"]', 'permanent', FALSE),
('corporate_admin', 'corporate_researcher', '["project_leadership", "collaboration_management"]', 'temporary', TRUE),
('corporate_manager', 'corporate_researcher', '["research_execution", "data_analysis"]', 'permanent', FALSE),

-- Platform delegation
('platform_admin', 'platform_moderator', '["user_support", "content_moderation"]', 'permanent', FALSE),
('platform_admin', 'platform_support', '["technical_support", "issue_resolution"]', 'permanent', FALSE);

-- 11. Create Indexes for Performance (NEW INDEXES - no impact on existing)
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_access_level ON role_hierarchy(access_level);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy_category ON role_hierarchy(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user_id ON user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_role_customizations_org_id ON organization_role_customizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_temporary_role_assignments_user_id ON temporary_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_temporary_role_assignments_end_date ON temporary_role_assignments(end_date);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created_at ON permission_audit_log(created_at);

-- 12. Insert Basic Permissions (NEW DATA - no impact on existing)
INSERT OR IGNORE INTO role_permissions (id, role_id, permission_name, resource, action, conditions) VALUES
-- Super admin permissions
('perm_super_admin_full', 'super_admin', 'full_access', 'system', 'all', '{}'),
('perm_super_admin_users', 'super_admin', 'user_management', 'users', 'all', '{}'),
('perm_super_admin_orgs', 'super_admin', 'organization_management', 'organizations', 'all', '{}'),

-- Research admin permissions
('perm_research_admin_org', 'research_admin', 'organization_management', 'organizations', 'manage', '{"organization_id": "user.organization_id"}'),
('perm_research_admin_users', 'research_admin', 'user_management', 'users', 'manage', '{"organization_id": "user.organization_id"}'),
('perm_research_admin_projects', 'research_admin', 'project_management', 'projects', 'all', '{"organization_id": "user.organization_id"}'),

-- Researcher permissions
('perm_researcher_projects', 'researcher', 'project_management', 'projects', 'manage', '{"owner_id": "user.id"}'),
('perm_researcher_ai_services', 'researcher', 'ai_services', 'services', 'use', '{}'),
('perm_researcher_data', 'researcher', 'data_management', 'data', 'manage', '{"owner_id": "user.id"}'),

-- Viewer permissions
('perm_viewer_read', 'viewer', 'read_access', 'projects', 'read', '{"member": true}'),
('perm_viewer_basic_ai', 'viewer', 'basic_ai_services', 'services', 'use', '{"basic_only": true}');

-- 13. Update existing users table to support new roles (SAFE - additive only)
-- This extends the existing CHECK constraint without breaking existing data
-- Note: This is a SQLite limitation - we'll handle this in the application layer
-- The existing constraint will remain, and we'll add validation in the application

-- 14. Create Views for Easy Role Management (NEW VIEWS - no impact on existing)
CREATE VIEW IF NOT EXISTS user_role_summary AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  rh.access_level,
  rh.category,
  rh.description as role_description,
  up.basic_preferences,
  up.role_specific_preferences,
  u.status,
  u.created_at
FROM users u
LEFT JOIN role_hierarchy rh ON u.role = rh.role_id
LEFT JOIN user_preferences up ON u.id = up.user_id;

CREATE VIEW IF NOT EXISTS organization_role_summary AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.status as organization_status,
  COUNT(om.user_id) as member_count,
  COUNT(CASE WHEN om.role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN om.role = 'member' THEN 1 END) as member_count,
  COUNT(CASE WHEN om.role = 'viewer' THEN 1 END) as viewer_count
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id
GROUP BY o.id, o.name, o.status;
