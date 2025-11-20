-- EU AI Act Compliance Tables
-- Implements requirements for AI system classification, risk assessment, and governance

-- AI System Registry (Article 16 - EU AI Act)
CREATE TABLE IF NOT EXISTS ai_system_registry (
  id TEXT PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_description TEXT NOT NULL,
  provider_organization_id TEXT NOT NULL,
  deployer_organization_id TEXT,
  
  -- AI Act Classification
  risk_category TEXT CHECK(risk_category IN ('unacceptable_risk', 'high_risk', 'limited_risk', 'minimal_risk')) NOT NULL,
  system_type TEXT CHECK(system_type IN ('general_purpose', 'specific_purpose')) DEFAULT 'specific_purpose',
  intended_purpose TEXT NOT NULL,
  
  -- High-Risk System Categories (Annex III)
  high_risk_category TEXT CHECK(high_risk_category IN (
    'biometric_identification',
    'critical_infrastructure',
    'education_training',
    'employment',
    'essential_services',
    'law_enforcement',
    'migration_asylum',
    'administration_justice'
  )),
  
  -- Technical Documentation (Article 11)
  technical_documentation_url TEXT,
  conformity_assessment_completed INTEGER DEFAULT 0,
  ce_marking_applied INTEGER DEFAULT 0,
  
  -- Data Governance (Article 10)
  training_data_governance_documented INTEGER DEFAULT 0,
  bias_monitoring_implemented INTEGER DEFAULT 0,
  data_quality_measures TEXT, -- JSON
  
  -- Transparency Requirements (Article 13)
  transparency_obligations_met INTEGER DEFAULT 0,
  user_instructions_provided INTEGER DEFAULT 0,
  human_oversight_measures TEXT, -- JSON
  
  -- Accuracy and Robustness (Article 15)
  accuracy_metrics TEXT, -- JSON
  robustness_testing_completed INTEGER DEFAULT 0,
  cybersecurity_measures TEXT, -- JSON
  
  -- Quality Management System (Article 17)
  quality_management_system_implemented INTEGER DEFAULT 0,
  risk_management_system_documented INTEGER DEFAULT 0,
  
  -- Compliance Status
  compliance_status TEXT CHECK(compliance_status IN ('compliant', 'non_compliant', 'under_review', 'exempted')) DEFAULT 'under_review',
  compliance_assessment_date DATETIME,
  compliance_assessor_id TEXT,
  next_review_date DATETIME,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  
  FOREIGN KEY (provider_organization_id) REFERENCES organizations (id),
  FOREIGN KEY (deployer_organization_id) REFERENCES organizations (id),
  FOREIGN KEY (compliance_assessor_id) REFERENCES users (id),
  FOREIGN KEY (created_by) REFERENCES users (id)
);

-- AI System Risk Assessment (Article 9)
CREATE TABLE IF NOT EXISTS ai_risk_assessments (
  id TEXT PRIMARY KEY,
  ai_system_id TEXT NOT NULL,
  assessment_version TEXT NOT NULL DEFAULT '1.0',
  
  -- Risk Identification
  identified_risks TEXT NOT NULL, -- JSON array of risks
  risk_likelihood TEXT CHECK(risk_likelihood IN ('very_low', 'low', 'medium', 'high', 'very_high')) NOT NULL,
  risk_severity TEXT CHECK(risk_severity IN ('negligible', 'minor', 'moderate', 'major', 'catastrophic')) NOT NULL,
  overall_risk_level TEXT CHECK(overall_risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  
  -- Mitigation Measures
  mitigation_measures TEXT NOT NULL, -- JSON array of measures
  residual_risk_level TEXT CHECK(residual_risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  
  -- Assessment Details
  assessment_methodology TEXT NOT NULL,
  assessment_date DATETIME NOT NULL,
  assessor_id TEXT NOT NULL,
  review_date DATETIME,
  
  -- Approval
  approved INTEGER DEFAULT 0,
  approved_by TEXT,
  approved_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ai_system_id) REFERENCES ai_system_registry (id) ON DELETE CASCADE,
  FOREIGN KEY (assessor_id) REFERENCES users (id),
  FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- Data Processing Impact Assessments (GDPR Article 35 + AI Act)
CREATE TABLE IF NOT EXISTS data_processing_impact_assessments (
  id TEXT PRIMARY KEY,
  ai_system_id TEXT NOT NULL,
  
  -- GDPR DPIA Requirements
  processing_purpose TEXT NOT NULL,
  data_categories TEXT NOT NULL, -- JSON array
  data_subjects_categories TEXT NOT NULL, -- JSON array
  processing_operations TEXT NOT NULL, -- JSON
  
  -- AI Act Specific Requirements
  automated_decision_making INTEGER DEFAULT 0,
  profiling_activities INTEGER DEFAULT 0,
  biometric_data_processing INTEGER DEFAULT 0,
  special_category_data INTEGER DEFAULT 0,
  
  -- Privacy Risks
  privacy_risks_identified TEXT NOT NULL, -- JSON array
  privacy_safeguards TEXT NOT NULL, -- JSON array
  data_minimization_measures TEXT NOT NULL, -- JSON
  
  -- Legal Basis
  legal_basis_gdpr TEXT NOT NULL,
  legal_basis_ai_act TEXT,
  
  -- Assessment
  assessment_date DATETIME NOT NULL,
  assessor_id TEXT NOT NULL,
  dpo_consulted INTEGER DEFAULT 0,
  supervisory_authority_consulted INTEGER DEFAULT 0,
  
  -- Approval
  approved INTEGER DEFAULT 0,
  approved_by TEXT,
  approved_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ai_system_id) REFERENCES ai_system_registry (id) ON DELETE CASCADE,
  FOREIGN KEY (assessor_id) REFERENCES users (id),
  FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- AI System Monitoring and Logging (Article 12)
CREATE TABLE IF NOT EXISTS ai_system_monitoring (
  id TEXT PRIMARY KEY,
  ai_system_id TEXT NOT NULL,
  
  -- Monitoring Data
  monitoring_date DATETIME NOT NULL,
  performance_metrics TEXT NOT NULL, -- JSON
  accuracy_metrics TEXT NOT NULL, -- JSON
  bias_metrics TEXT, -- JSON
  fairness_metrics TEXT, -- JSON
  
  -- Incident Tracking
  incidents_detected INTEGER DEFAULT 0,
  incident_details TEXT, -- JSON array
  corrective_actions TEXT, -- JSON array
  
  -- Human Oversight
  human_oversight_events TEXT, -- JSON array
  override_decisions TEXT, -- JSON array
  
  -- Compliance Monitoring
  compliance_violations INTEGER DEFAULT 0,
  violation_details TEXT, -- JSON array
  remediation_actions TEXT, -- JSON array
  
  -- Automated Monitoring
  automated_monitoring_active INTEGER DEFAULT 1,
  monitoring_frequency TEXT DEFAULT 'daily',
  alert_thresholds TEXT, -- JSON
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (ai_system_id) REFERENCES ai_system_registry (id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Algorithmic Transparency Reports (Article 13)
CREATE TABLE IF NOT EXISTS algorithmic_transparency_reports (
  id TEXT PRIMARY KEY,
  ai_system_id TEXT NOT NULL,
  report_version TEXT NOT NULL DEFAULT '1.0',
  
  -- System Information
  algorithm_description TEXT NOT NULL,
  decision_logic_explanation TEXT NOT NULL,
  input_data_types TEXT NOT NULL, -- JSON array
  output_interpretation TEXT NOT NULL,
  
  -- Performance Information
  accuracy_rates TEXT NOT NULL, -- JSON
  error_rates TEXT NOT NULL, -- JSON
  confidence_intervals TEXT, -- JSON
  performance_limitations TEXT NOT NULL,
  
  -- Bias and Fairness
  bias_testing_results TEXT, -- JSON
  fairness_metrics TEXT, -- JSON
  demographic_parity_analysis TEXT, -- JSON
  equalized_odds_analysis TEXT, -- JSON
  
  -- Explainability
  explainability_methods TEXT NOT NULL, -- JSON array
  feature_importance TEXT, -- JSON
  decision_boundaries TEXT, -- JSON
  counterfactual_explanations INTEGER DEFAULT 0,
  
  -- Data Information
  training_data_description TEXT NOT NULL,
  data_sources TEXT NOT NULL, -- JSON array
  data_quality_measures TEXT NOT NULL, -- JSON
  data_preprocessing_steps TEXT NOT NULL, -- JSON
  
  -- Publication
  published INTEGER DEFAULT 0,
  publication_date DATETIME,
  public_url TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at DATETIME,
  
  FOREIGN KEY (ai_system_id) REFERENCES ai_system_registry (id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users (id),
  FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- Compliance Audit Trail (Article 20)
CREATE TABLE IF NOT EXISTS ai_compliance_audit_trail (
  id TEXT PRIMARY KEY,
  ai_system_id TEXT NOT NULL,
  
  -- Audit Information
  audit_type TEXT CHECK(audit_type IN ('internal', 'external', 'regulatory', 'third_party')) NOT NULL,
  audit_date DATETIME NOT NULL,
  auditor_id TEXT,
  auditor_organization TEXT,
  
  -- Audit Scope
  audit_scope TEXT NOT NULL, -- JSON array
  standards_checked TEXT NOT NULL, -- JSON array
  compliance_areas TEXT NOT NULL, -- JSON array
  
  -- Findings
  compliance_score REAL, -- 0-100
  findings TEXT NOT NULL, -- JSON array
  non_compliance_issues TEXT, -- JSON array
  recommendations TEXT, -- JSON array
  
  -- Remediation
  remediation_plan TEXT, -- JSON
  remediation_deadline DATETIME,
  remediation_status TEXT CHECK(remediation_status IN ('pending', 'in_progress', 'completed', 'overdue')) DEFAULT 'pending',
  
  -- Follow-up
  follow_up_required INTEGER DEFAULT 0,
  follow_up_date DATETIME,
  next_audit_date DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (ai_system_id) REFERENCES ai_system_registry (id) ON DELETE CASCADE,
  FOREIGN KEY (auditor_id) REFERENCES users (id),
  FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_system_registry_risk_category ON ai_system_registry(risk_category);
CREATE INDEX IF NOT EXISTS idx_ai_system_registry_compliance_status ON ai_system_registry(compliance_status);
CREATE INDEX IF NOT EXISTS idx_ai_system_registry_provider ON ai_system_registry(provider_organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_risk_assessments_system ON ai_risk_assessments(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_ai_risk_assessments_risk_level ON ai_risk_assessments(overall_risk_level);
CREATE INDEX IF NOT EXISTS idx_dpia_system ON data_processing_impact_assessments(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_ai_monitoring_system ON ai_system_monitoring(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_ai_monitoring_date ON ai_system_monitoring(monitoring_date);
CREATE INDEX IF NOT EXISTS idx_transparency_reports_system ON algorithmic_transparency_reports(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_system ON ai_compliance_audit_trail(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_date ON ai_compliance_audit_trail(audit_date);
