/**
 * EU AI Act Compliance Service
 * Implements requirements for AI system classification, risk assessment, and governance
 */

import { db } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import { securityConfig, isHighRiskAISystem } from '../config/security.js';

export interface AISystemRegistration {
  id?: string;
  system_name: string;
  system_description: string;
  provider_organization_id: string;
  deployer_organization_id?: string;
  risk_category: 'unacceptable_risk' | 'high_risk' | 'limited_risk' | 'minimal_risk';
  system_type: 'general_purpose' | 'specific_purpose';
  intended_purpose: string;
  high_risk_category?: string;
  created_by: string;
}

export interface RiskAssessment {
  id?: string;
  ai_system_id: string;
  assessment_version: string;
  identified_risks: string; // JSON
  risk_likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  risk_severity: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  mitigation_measures: string; // JSON
  residual_risk_level: 'low' | 'medium' | 'high' | 'critical';
  assessment_methodology: string;
  assessor_id: string;
}

export interface DataProcessingImpactAssessment {
  id?: string;
  ai_system_id: string;
  processing_purpose: string;
  data_categories: string; // JSON
  data_subjects_categories: string; // JSON
  processing_operations: string; // JSON
  automated_decision_making: boolean;
  profiling_activities: boolean;
  biometric_data_processing: boolean;
  special_category_data: boolean;
  privacy_risks_identified: string; // JSON
  privacy_safeguards: string; // JSON
  data_minimization_measures: string; // JSON
  legal_basis_gdpr: string;
  legal_basis_ai_act?: string;
  assessor_id: string;
}

export class EUAIActComplianceService {
  
  /**
   * Register a new AI system with EU AI Act compliance
   */
  async registerAISystem(systemData: AISystemRegistration): Promise<{ success: boolean; systemId?: string; message?: string }> {
    try {
      const systemId = uuidv4();
      const now = new Date().toISOString();
      
      // Auto-classify risk category based on intended purpose
      const autoRiskCategory = this.classifyRiskCategory(systemData.intended_purpose, systemData.system_type);
      const finalRiskCategory = systemData.risk_category || autoRiskCategory;
      
      // Determine high-risk category if applicable
      const highRiskCategory = finalRiskCategory === 'high_risk' 
        ? this.determineHighRiskCategory(systemData.intended_purpose)
        : null;
      
      const insertQuery = `
        INSERT INTO ai_system_registry (
          id, system_name, system_description, provider_organization_id, deployer_organization_id,
          risk_category, system_type, intended_purpose, high_risk_category,
          compliance_status, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'under_review', ?, ?, ?)
      `;
      
      await db.run(insertQuery, [
        systemId,
        systemData.system_name,
        systemData.system_description,
        systemData.provider_organization_id,
        systemData.deployer_organization_id,
        finalRiskCategory,
        systemData.system_type,
        systemData.intended_purpose,
        highRiskCategory,
        now,
        now,
        systemData.created_by
      ]);
      
      // If high-risk system, create mandatory assessments
      if (finalRiskCategory === 'high_risk' && securityConfig.aiActCompliance.riskAssessmentRequired) {
        await this.createMandatoryAssessments(systemId, systemData.created_by);
      }
      
      return {
        success: true,
        systemId,
        message: `AI system registered with risk category: ${finalRiskCategory}`
      };
      
    } catch (error) {
      console.error('Error registering AI system:', error);
      return {
        success: false,
        message: 'Failed to register AI system'
      };
    }
  }
  
  /**
   * Create risk assessment for AI system
   */
  async createRiskAssessment(assessmentData: RiskAssessment): Promise<{ success: boolean; assessmentId?: string; message?: string }> {
    try {
      const assessmentId = uuidv4();
      const now = new Date().toISOString();
      
      const insertQuery = `
        INSERT INTO ai_risk_assessments (
          id, ai_system_id, assessment_version, identified_risks, risk_likelihood,
          risk_severity, overall_risk_level, mitigation_measures, residual_risk_level,
          assessment_methodology, assessment_date, assessor_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.run(insertQuery, [
        assessmentId,
        assessmentData.ai_system_id,
        assessmentData.assessment_version,
        assessmentData.identified_risks,
        assessmentData.risk_likelihood,
        assessmentData.risk_severity,
        assessmentData.overall_risk_level,
        assessmentData.mitigation_measures,
        assessmentData.residual_risk_level,
        assessmentData.assessment_methodology,
        now,
        assessmentData.assessor_id,
        now,
        now
      ]);
      
      // Update AI system compliance status
      await this.updateComplianceStatus(assessmentData.ai_system_id);
      
      return {
        success: true,
        assessmentId,
        message: 'Risk assessment created successfully'
      };
      
    } catch (error) {
      console.error('Error creating risk assessment:', error);
      return {
        success: false,
        message: 'Failed to create risk assessment'
      };
    }
  }
  
  /**
   * Create Data Processing Impact Assessment (DPIA)
   */
  async createDPIA(dpiaData: DataProcessingImpactAssessment): Promise<{ success: boolean; dpiaId?: string; message?: string }> {
    try {
      const dpiaId = uuidv4();
      const now = new Date().toISOString();
      
      const insertQuery = `
        INSERT INTO data_processing_impact_assessments (
          id, ai_system_id, processing_purpose, data_categories, data_subjects_categories,
          processing_operations, automated_decision_making, profiling_activities,
          biometric_data_processing, special_category_data, privacy_risks_identified,
          privacy_safeguards, data_minimization_measures, legal_basis_gdpr,
          legal_basis_ai_act, assessment_date, assessor_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await db.run(insertQuery, [
        dpiaId,
        dpiaData.ai_system_id,
        dpiaData.processing_purpose,
        dpiaData.data_categories,
        dpiaData.data_subjects_categories,
        dpiaData.processing_operations,
        dpiaData.automated_decision_making ? 1 : 0,
        dpiaData.profiling_activities ? 1 : 0,
        dpiaData.biometric_data_processing ? 1 : 0,
        dpiaData.special_category_data ? 1 : 0,
        dpiaData.privacy_risks_identified,
        dpiaData.privacy_safeguards,
        dpiaData.data_minimization_measures,
        dpiaData.legal_basis_gdpr,
        dpiaData.legal_basis_ai_act,
        now,
        dpiaData.assessor_id,
        now,
        now
      ]);
      
      return {
        success: true,
        dpiaId,
        message: 'DPIA created successfully'
      };
      
    } catch (error) {
      console.error('Error creating DPIA:', error);
      return {
        success: false,
        message: 'Failed to create DPIA'
      };
    }
  }
  
  /**
   * Get compliance status for AI system
   */
  async getComplianceStatus(systemId: string): Promise<any> {
    try {
      const system = await db.get(`
        SELECT 
          asr.*,
          COUNT(ara.id) as risk_assessments_count,
          COUNT(dpia.id) as dpia_count,
          COUNT(atr.id) as transparency_reports_count
        FROM ai_system_registry asr
        LEFT JOIN ai_risk_assessments ara ON asr.id = ara.ai_system_id
        LEFT JOIN data_processing_impact_assessments dpia ON asr.id = dpia.ai_system_id
        LEFT JOIN algorithmic_transparency_reports atr ON asr.id = atr.ai_system_id
        WHERE asr.id = ?
        GROUP BY asr.id
      `, [systemId]);
      
      if (!system) {
        return null;
      }
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(system);
      
      return {
        ...system,
        compliance_score: complianceScore,
        compliance_requirements: this.getComplianceRequirements(system.risk_category),
        next_actions: this.getNextActions(system)
      };
      
    } catch (error) {
      console.error('Error getting compliance status:', error);
      return null;
    }
  }
  
  /**
   * Get all AI systems with compliance status
   */
  async getAllAISystemsWithCompliance(): Promise<any[]> {
    try {
      const systems = await db.all(`
        SELECT 
          asr.*,
          o.name as provider_organization_name,
          COUNT(ara.id) as risk_assessments_count,
          COUNT(dpia.id) as dpia_count,
          COUNT(asm.id) as monitoring_records_count
        FROM ai_system_registry asr
        LEFT JOIN organizations o ON asr.provider_organization_id = o.id
        LEFT JOIN ai_risk_assessments ara ON asr.id = ara.ai_system_id
        LEFT JOIN data_processing_impact_assessments dpia ON asr.id = dpia.ai_system_id
        LEFT JOIN ai_system_monitoring asm ON asr.id = asm.ai_system_id
        GROUP BY asr.id
        ORDER BY asr.created_at DESC
      `);
      
      return systems.map(system => ({
        ...system,
        compliance_score: this.calculateComplianceScore(system),
        compliance_requirements: this.getComplianceRequirements(system.risk_category)
      }));
      
    } catch (error) {
      console.error('Error getting AI systems:', error);
      return [];
    }
  }
  
  /**
   * Private helper methods
   */
  private classifyRiskCategory(intendedPurpose: string, systemType: string): 'unacceptable_risk' | 'high_risk' | 'limited_risk' | 'minimal_risk' {
    const purpose = intendedPurpose.toLowerCase();
    
    // Unacceptable risk systems (Article 5)
    const unacceptableRiskKeywords = [
      'social scoring', 'subliminal techniques', 'exploit vulnerabilities',
      'real-time biometric identification', 'cognitive behavioral manipulation'
    ];
    
    if (unacceptableRiskKeywords.some(keyword => purpose.includes(keyword))) {
      return 'unacceptable_risk';
    }
    
    // High-risk systems (Annex III)
    if (isHighRiskAISystem(systemType, intendedPurpose)) {
      return 'high_risk';
    }
    
    // Limited risk systems
    const limitedRiskKeywords = [
      'chatbot', 'deepfake', 'emotion recognition', 'biometric categorization'
    ];
    
    if (limitedRiskKeywords.some(keyword => purpose.includes(keyword))) {
      return 'limited_risk';
    }
    
    return 'minimal_risk';
  }
  
  private determineHighRiskCategory(intendedPurpose: string): string | null {
    const purpose = intendedPurpose.toLowerCase();
    
    const categoryMapping = {
      'biometric_identification': ['biometric', 'identification', 'face recognition', 'fingerprint'],
      'critical_infrastructure': ['infrastructure', 'transport', 'energy', 'water'],
      'education_training': ['education', 'training', 'assessment', 'exam'],
      'employment': ['employment', 'recruitment', 'hiring', 'cv screening'],
      'essential_services': ['credit', 'insurance', 'benefits', 'emergency'],
      'law_enforcement': ['law enforcement', 'police', 'crime', 'investigation'],
      'migration_asylum': ['migration', 'asylum', 'visa', 'border'],
      'administration_justice': ['justice', 'court', 'legal', 'judicial']
    };
    
    for (const [category, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some(keyword => purpose.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  }
  
  private async createMandatoryAssessments(systemId: string, userId: string): Promise<void> {
    // Create placeholder risk assessment
    const riskAssessment: RiskAssessment = {
      ai_system_id: systemId,
      assessment_version: '1.0',
      identified_risks: JSON.stringify(['Data privacy risks', 'Algorithmic bias', 'Security vulnerabilities']),
      risk_likelihood: 'medium',
      risk_severity: 'moderate',
      overall_risk_level: 'medium',
      mitigation_measures: JSON.stringify(['Regular auditing', 'Bias testing', 'Security measures']),
      residual_risk_level: 'low',
      assessment_methodology: 'EU AI Act compliant risk assessment methodology',
      assessor_id: userId
    };
    
    await this.createRiskAssessment(riskAssessment);
    
    // Create placeholder DPIA
    const dpia: DataProcessingImpactAssessment = {
      ai_system_id: systemId,
      processing_purpose: 'AI system data processing',
      data_categories: JSON.stringify(['Personal data', 'Usage data']),
      data_subjects_categories: JSON.stringify(['Users', 'Customers']),
      processing_operations: JSON.stringify(['Collection', 'Analysis', 'Storage']),
      automated_decision_making: true,
      profiling_activities: false,
      biometric_data_processing: false,
      special_category_data: false,
      privacy_risks_identified: JSON.stringify(['Unauthorized access', 'Data minimization']),
      privacy_safeguards: JSON.stringify(['Encryption', 'Access controls']),
      data_minimization_measures: JSON.stringify(['Purpose limitation', 'Storage limitation']),
      legal_basis_gdpr: 'Legitimate interest',
      legal_basis_ai_act: 'High-risk AI system deployment',
      assessor_id: userId
    };
    
    await this.createDPIA(dpia);
  }
  
  private calculateComplianceScore(system: any): number {
    let score = 0;
    const maxScore = 100;
    
    // Basic registration (20 points)
    if (system.system_name && system.system_description) score += 20;
    
    // Risk assessment (30 points for high-risk systems, 20 for others)
    const riskAssessmentWeight = system.risk_category === 'high_risk' ? 30 : 20;
    if (system.risk_assessments_count > 0) score += riskAssessmentWeight;
    
    // DPIA (25 points for high-risk systems, 15 for others)
    const dpiaWeight = system.risk_category === 'high_risk' ? 25 : 15;
    if (system.dpia_count > 0) score += dpiaWeight;
    
    // Transparency reports (15 points for high-risk systems, 10 for others)
    const transparencyWeight = system.risk_category === 'high_risk' ? 15 : 10;
    if (system.transparency_reports_count > 0) score += transparencyWeight;
    
    // Monitoring (10 points)
    if (system.monitoring_records_count > 0) score += 10;
    
    return Math.min(score, maxScore);
  }
  
  private getComplianceRequirements(riskCategory: string): string[] {
    const baseRequirements = ['System registration', 'Basic documentation'];
    
    switch (riskCategory) {
      case 'high_risk':
        return [
          ...baseRequirements,
          'Risk assessment',
          'Data Processing Impact Assessment (DPIA)',
          'Conformity assessment',
          'CE marking',
          'Technical documentation',
          'Transparency obligations',
          'Human oversight measures',
          'Quality management system',
          'Continuous monitoring'
        ];
      case 'limited_risk':
        return [
          ...baseRequirements,
          'Transparency obligations',
          'User information requirements'
        ];
      case 'minimal_risk':
        return baseRequirements;
      case 'unacceptable_risk':
        return ['System prohibited - immediate discontinuation required'];
      default:
        return baseRequirements;
    }
  }
  
  private getNextActions(system: any): string[] {
    const actions: string[] = [];
    
    if (system.risk_category === 'high_risk') {
      if (system.risk_assessments_count === 0) {
        actions.push('Complete risk assessment');
      }
      if (system.dpia_count === 0) {
        actions.push('Complete Data Processing Impact Assessment');
      }
      if (system.transparency_reports_count === 0) {
        actions.push('Create transparency report');
      }
      if (!system.conformity_assessment_completed) {
        actions.push('Complete conformity assessment');
      }
    }
    
    if (system.compliance_status === 'under_review') {
      actions.push('Submit for compliance review');
    }
    
    return actions;
  }
  
  private async updateComplianceStatus(systemId: string): Promise<void> {
    const system = await this.getComplianceStatus(systemId);
    if (!system) return;
    
    let newStatus = 'under_review';
    
    if (system.compliance_score >= 90) {
      newStatus = 'compliant';
    } else if (system.compliance_score < 50) {
      newStatus = 'non_compliant';
    }
    
    await db.run(
      'UPDATE ai_system_registry SET compliance_status = ?, updated_at = ? WHERE id = ?',
      [newStatus, new Date().toISOString(), systemId]
    );
  }
}

export const euAiActComplianceService = new EUAIActComplianceService();
