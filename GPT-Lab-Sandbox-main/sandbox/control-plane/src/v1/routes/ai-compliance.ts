/**
 * EU AI Act Compliance API Routes
 * Implements Article 16 (Registration), Article 9 (Risk Assessment), and other compliance requirements
 */

import { Router, Request, Response } from 'express';
import { euAiActComplianceService, AISystemRegistration, RiskAssessment, DataProcessingImpactAssessment } from '../../services/euAiActCompliance.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateInput, serviceCreationSchema } from '../../middleware/validation.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const aiSystemRegistrationSchema = z.object({
  system_name: z.string().min(1).max(200),
  system_description: z.string().min(10).max(2000),
  provider_organization_id: z.string().uuid(),
  deployer_organization_id: z.string().uuid().optional(),
  risk_category: z.enum(['unacceptable_risk', 'high_risk', 'limited_risk', 'minimal_risk']).optional(),
  system_type: z.enum(['general_purpose', 'specific_purpose']),
  intended_purpose: z.string().min(10).max(1000),
  high_risk_category: z.string().optional()
});

const riskAssessmentSchema = z.object({
  ai_system_id: z.string().uuid(),
  assessment_version: z.string().default('1.0'),
  identified_risks: z.string(), // JSON string
  risk_likelihood: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  risk_severity: z.enum(['negligible', 'minor', 'moderate', 'major', 'catastrophic']),
  overall_risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  mitigation_measures: z.string(), // JSON string
  residual_risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  assessment_methodology: z.string().min(10).max(1000)
});

const dpiaSchema = z.object({
  ai_system_id: z.string().uuid(),
  processing_purpose: z.string().min(10).max(1000),
  data_categories: z.string(), // JSON string
  data_subjects_categories: z.string(), // JSON string
  processing_operations: z.string(), // JSON string
  automated_decision_making: z.boolean(),
  profiling_activities: z.boolean(),
  biometric_data_processing: z.boolean(),
  special_category_data: z.boolean(),
  privacy_risks_identified: z.string(), // JSON string
  privacy_safeguards: z.string(), // JSON string
  data_minimization_measures: z.string(), // JSON string
  legal_basis_gdpr: z.string().min(1).max(500),
  legal_basis_ai_act: z.string().max(500).optional()
});

// ==============================================================================
// AI SYSTEM REGISTRATION (Article 16)
// ==============================================================================

// POST /api/ai-compliance/systems - Register new AI system
router.post('/systems', requireAuth, requireRole('super_admin', 'research_admin'), validateInput(aiSystemRegistrationSchema), async (req: Request, res: Response) => {
  try {
    const systemData: AISystemRegistration = {
      ...req.body,
      created_by: req.user!.id
    };
    
    const result = await euAiActComplianceService.registerAISystem(systemData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: { systemId: result.systemId }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error registering AI system:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/ai-compliance/systems - Get all AI systems
router.get('/systems', requireAuth, requireRole('super_admin', 'research_admin', 'researcher'), async (req: Request, res: Response) => {
  try {
    const systems = await euAiActComplianceService.getAllAISystemsWithCompliance();
    
    res.json({
      success: true,
      data: systems,
      count: systems.length
    });
  } catch (error) {
    console.error('Error getting AI systems:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/ai-compliance/systems/:id - Get specific AI system
router.get('/systems/:id', requireAuth, requireRole('super_admin', 'research_admin', 'researcher'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const system = await euAiActComplianceService.getComplianceStatus(id);
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'AI system not found'
      });
    }
    
    res.json({
      success: true,
      data: system
    });
  } catch (error) {
    console.error('Error getting AI system:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ==============================================================================
// RISK ASSESSMENTS (Article 9)
// ==============================================================================

// POST /api/ai-compliance/systems/:id/risk-assessment - Create risk assessment
router.post('/systems/:id/risk-assessment', requireAuth, requireRole('super_admin', 'research_admin'), validateInput(riskAssessmentSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessmentData: RiskAssessment = {
      ...req.body,
      ai_system_id: id,
      assessor_id: req.user!.id
    };
    
    const result = await euAiActComplianceService.createRiskAssessment(assessmentData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: { assessmentId: result.assessmentId }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating risk assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ==============================================================================
// DATA PROCESSING IMPACT ASSESSMENTS (GDPR Article 35 + AI Act)
// ==============================================================================

// POST /api/ai-compliance/systems/:id/dpia - Create DPIA
router.post('/systems/:id/dpia', requireAuth, requireRole('super_admin', 'research_admin'), validateInput(dpiaSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dpiaData: DataProcessingImpactAssessment = {
      ...req.body,
      ai_system_id: id,
      assessor_id: req.user!.id
    };
    
    const result = await euAiActComplianceService.createDPIA(dpiaData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: { dpiaId: result.dpiaId }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating DPIA:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ==============================================================================
// COMPLIANCE DASHBOARD
// ==============================================================================

// GET /api/ai-compliance/dashboard - Get compliance overview
router.get('/dashboard', requireAuth, requireRole('super_admin', 'research_admin'), async (req: Request, res: Response) => {
  try {
    const systems = await euAiActComplianceService.getAllAISystemsWithCompliance();
    
    // Calculate compliance statistics
    const stats = {
      total_systems: systems.length,
      high_risk_systems: systems.filter(s => s.risk_category === 'high_risk').length,
      compliant_systems: systems.filter(s => s.compliance_status === 'compliant').length,
      non_compliant_systems: systems.filter(s => s.compliance_status === 'non_compliant').length,
      under_review_systems: systems.filter(s => s.compliance_status === 'under_review').length,
      average_compliance_score: systems.length > 0 
        ? systems.reduce((sum, s) => sum + s.compliance_score, 0) / systems.length 
        : 0,
      systems_requiring_action: systems.filter(s => s.next_actions && s.next_actions.length > 0).length
    };
    
    res.json({
      success: true,
      data: {
        statistics: stats,
        systems: systems,
        compliance_requirements: {
          gdpr_enabled: true,
          ai_act_enabled: true,
          data_residency: 'EU-only',
          audit_logging: true
        }
      }
    });
  } catch (error) {
    console.error('Error getting compliance dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export { router as aiComplianceRouter };
