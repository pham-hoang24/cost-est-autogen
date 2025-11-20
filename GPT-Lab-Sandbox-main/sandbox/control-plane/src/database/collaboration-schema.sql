-- SW4E Sandbox Collaboration Features Schema
-- EU AI Act & GDPR Compliant Project Collaboration System

-- Projects Table - Core collaboration entity
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  organization_id TEXT,
  project_type TEXT CHECK(project_type IN ('research', 'ai_development', 'data_analysis', 'model_training')) DEFAULT 'research',
  visibility TEXT CHECK(visibility IN ('private', 'organization', 'public')) DEFAULT 'private',
  
  -- Legal & Compliance
  legal_basis TEXT CHECK(legal_basis IN ('consent', 'contract', 'legitimate_interest', 'research_exemption')) DEFAULT 'consent',
  data_retention_days INTEGER DEFAULT 365,
  cross_border_transfers BOOLEAN DEFAULT FALSE,
  requires_dpia BOOLEAN DEFAULT FALSE,
  gdpr_lawful_basis TEXT,
  
  -- Access Control
  max_collaborators INTEGER DEFAULT 10,
  collaboration_model TEXT CHECK(collaboration_model IN ('open', 'invite_only', 'approval_required')) DEFAULT 'invite_only',
  
  -- Subscription & Feature Gates
  subscription_tier_required TEXT DEFAULT 'basic',
  ai_features_enabled BOOLEAN DEFAULT TRUE,
  data_sharing_enabled BOOLEAN DEFAULT TRUE,
  external_collaboration_enabled BOOLEAN DEFAULT FALSE,
  
  -- Status & Metadata
  status TEXT CHECK(status IN ('active', 'paused', 'completed', 'archived')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  archived_at DATETIME NULL,
  
  -- Constraints
  FOREIGN KEY (owner_id) REFERENCES users (id),
  FOREIGN KEY (organization_id) REFERENCES organizations (id)
);

-- Project Members - Role-based collaboration
CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  
  -- Role-based Access Control
  role TEXT CHECK(role IN ('owner', 'admin', 'contributor', 'viewer', 'reviewer')) NOT NULL,
  permissions TEXT DEFAULT '{}', -- JSON: specific permissions
  
  -- Legal Compliance
  consent_provided BOOLEAN DEFAULT FALSE,
  consent_date DATETIME NULL,
  consent_withdrawn BOOLEAN DEFAULT FALSE,
  consent_withdrawal_date DATETIME NULL,
  data_processing_agreement TEXT, -- Reference to legal agreement
  
  -- Access Control
  access_level TEXT CHECK(access_level IN ('full', 'restricted', 'read_only')) DEFAULT 'restricted',
  can_invite_others BOOLEAN DEFAULT FALSE,
  can_share_data BOOLEAN DEFAULT FALSE,
  can_export_data BOOLEAN DEFAULT FALSE,
  
  -- Status & Audit
  status TEXT CHECK(status IN ('pending', 'active', 'suspended', 'removed')) DEFAULT 'pending',
  joined_at DATETIME NULL,
  last_active DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (invited_by) REFERENCES users (id),
  UNIQUE(project_id, user_id)
);

-- Project Resources - Shared data, models, code
CREATE TABLE IF NOT EXISTS project_resources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  
  -- Resource Details
  name TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK(resource_type IN ('dataset', 'model', 'code', 'document', 'notebook', 'result')) NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Data Classification & Privacy
  data_classification TEXT CHECK(data_classification IN ('public', 'internal', 'confidential', 'restricted')) DEFAULT 'internal',
  contains_pii BOOLEAN DEFAULT FALSE,
  pii_categories TEXT, -- JSON array of PII types
  anonymization_applied BOOLEAN DEFAULT FALSE,
  anonymization_method TEXT,
  
  -- Access Control
  access_permissions TEXT DEFAULT '{}', -- JSON: role-based permissions
  sharing_restrictions TEXT DEFAULT '{}', -- JSON: sharing rules
  download_allowed BOOLEAN DEFAULT TRUE,
  external_sharing_allowed BOOLEAN DEFAULT FALSE,
  
  -- Legal Compliance
  legal_holds TEXT DEFAULT '[]', -- JSON: active legal holds
  retention_policy TEXT,
  deletion_scheduled_at DATETIME NULL,
  
  -- Versioning & Lineage
  version TEXT DEFAULT '1.0',
  parent_resource_id TEXT NULL,
  lineage_info TEXT DEFAULT '{}', -- JSON: data lineage
  
  -- Metadata & Audit
  metadata TEXT DEFAULT '{}', -- JSON: additional metadata
  checksum TEXT, -- File integrity verification
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accessed_at DATETIME NULL,
  
  -- Constraints
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users (id),
  FOREIGN KEY (parent_resource_id) REFERENCES project_resources (id)
);

-- Project Activities - Comprehensive audit trail
CREATE TABLE IF NOT EXISTS project_activities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Activity Details
  activity_type TEXT CHECK(activity_type IN (
    'project_created', 'member_invited', 'member_joined', 'member_removed',
    'resource_uploaded', 'resource_shared', 'resource_downloaded', 'resource_deleted',
    'permission_changed', 'settings_updated', 'data_exported', 'ai_model_trained',
    'compliance_check', 'legal_hold_applied', 'consent_withdrawn', 'dpia_updated'
  )) NOT NULL,
  
  activity_description TEXT,
  affected_resource_id TEXT NULL,
  affected_user_id TEXT NULL,
  
  -- Legal & Compliance Tracking
  legal_basis_used TEXT,
  data_categories_involved TEXT, -- JSON array
  cross_border_transfer BOOLEAN DEFAULT FALSE,
  
  -- Technical Details
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  
  -- Metadata
  metadata TEXT DEFAULT '{}', -- JSON: additional context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (affected_resource_id) REFERENCES project_resources (id),
  FOREIGN KEY (affected_user_id) REFERENCES users (id)
);

-- Data Sharing Agreements - Legal compliance for collaboration
CREATE TABLE IF NOT EXISTS data_sharing_agreements (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  
  -- Agreement Details
  agreement_type TEXT CHECK(agreement_type IN ('dpa', 'nda', 'research_agreement', 'collaboration_agreement')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Full legal text
  version TEXT DEFAULT '1.0',
  
  -- Legal Framework
  legal_basis TEXT NOT NULL,
  jurisdiction TEXT DEFAULT 'EU',
  applicable_laws TEXT DEFAULT '["GDPR", "EU AI Act"]', -- JSON array
  
  -- Data Processing Details
  processing_purposes TEXT NOT NULL, -- JSON array
  data_categories TEXT NOT NULL, -- JSON array
  retention_period INTEGER, -- days
  deletion_requirements TEXT,
  
  -- Cross-border Transfers
  transfer_mechanisms TEXT, -- SCCs, adequacy decision, etc.
  destination_countries TEXT DEFAULT '[]', -- JSON array
  
  -- Status & Lifecycle
  status TEXT CHECK(status IN ('draft', 'active', 'expired', 'terminated')) DEFAULT 'draft',
  effective_date DATETIME,
  expiry_date DATETIME,
  auto_renewal BOOLEAN DEFAULT FALSE,
  
  -- Signatures & Approval
  created_by TEXT NOT NULL,
  approved_by TEXT NULL,
  signed_parties TEXT DEFAULT '[]', -- JSON: list of signed parties
  
  -- Audit
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  signed_at DATETIME NULL,
  
  -- Constraints
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users (id),
  FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- User Consents - GDPR compliance for collaboration
CREATE TABLE IF NOT EXISTS collaboration_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  
  -- Consent Details
  consent_type TEXT CHECK(consent_type IN (
    'data_sharing', 'ai_processing', 'cross_border_transfer', 
    'research_participation', 'automated_decision_making'
  )) NOT NULL,
  
  purpose TEXT NOT NULL,
  data_categories TEXT NOT NULL, -- JSON array
  processing_activities TEXT NOT NULL, -- JSON array
  
  -- Legal Basis
  legal_basis TEXT DEFAULT 'consent',
  consent_mechanism TEXT CHECK(consent_mechanism IN ('explicit', 'opt_in', 'contract', 'legitimate_interest')),
  
  -- Consent Lifecycle
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date DATETIME NULL,
  consent_withdrawn BOOLEAN DEFAULT FALSE,
  withdrawal_date DATETIME NULL,
  withdrawal_reason TEXT,
  
  -- Retention & Expiry
  expiry_date DATETIME NULL,
  auto_expire BOOLEAN DEFAULT TRUE,
  
  -- Audit Trail
  ip_address TEXT,
  user_agent TEXT,
  consent_evidence TEXT, -- JSON: evidence of consent
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  UNIQUE(user_id, project_id, consent_type)
);

-- Project Invitations - Secure invitation system
CREATE TABLE IF NOT EXISTS project_invitations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  
  -- Invitation Details
  email TEXT NOT NULL,
  invited_user_id TEXT NULL, -- If user already exists
  role TEXT CHECK(role IN ('admin', 'contributor', 'viewer', 'reviewer')) NOT NULL,
  
  -- Invitation Message
  message TEXT,
  permissions TEXT DEFAULT '{}', -- JSON: specific permissions
  
  -- Security
  invitation_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  -- Legal Compliance
  requires_consent BOOLEAN DEFAULT TRUE,
  data_sharing_agreement_id TEXT NULL,
  
  -- Status
  status TEXT CHECK(status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')) DEFAULT 'pending',
  accepted_at DATETIME NULL,
  declined_at DATETIME NULL,
  revoked_at DATETIME NULL,
  
  -- Audit
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users (id),
  FOREIGN KEY (invited_user_id) REFERENCES users (id),
  FOREIGN KEY (data_sharing_agreement_id) REFERENCES data_sharing_agreements (id)
);

-- Subscription Feature Gates - Control access based on subscription
CREATE TABLE IF NOT EXISTS subscription_features (
  id TEXT PRIMARY KEY,
  subscription_tier TEXT NOT NULL,
  
  -- Collaboration Limits
  max_projects INTEGER DEFAULT 5,
  max_collaborators_per_project INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 10,
  max_ai_compute_hours INTEGER DEFAULT 50,
  
  -- Feature Flags
  external_collaboration BOOLEAN DEFAULT FALSE,
  cross_border_data_sharing BOOLEAN DEFAULT FALSE,
  advanced_ai_features BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  custom_legal_agreements BOOLEAN DEFAULT FALSE,
  audit_trail_retention_days INTEGER DEFAULT 90,
  
  -- API & Integration Limits
  api_calls_per_month INTEGER DEFAULT 10000,
  webhook_endpoints INTEGER DEFAULT 3,
  external_integrations BOOLEAN DEFAULT FALSE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_status ON project_members(status);

CREATE INDEX IF NOT EXISTS idx_project_resources_project ON project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_type ON project_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_project_resources_classification ON project_resources(data_classification);

CREATE INDEX IF NOT EXISTS idx_project_activities_project ON project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_user ON project_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_type ON project_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_collaboration_consents_user ON collaboration_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_consents_project ON collaboration_consents(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_consents_type ON collaboration_consents(consent_type);

CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON project_invitations(status);
