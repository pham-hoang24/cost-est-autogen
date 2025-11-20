"""
SW4E Compliance Auditor Service
Comprehensive audit system for EU AI Act and GDPR compliance
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import pandas as pd
import numpy as np

class ComplianceStatus(Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIAL = "partial"
    UNKNOWN = "unknown"
    REQUIRES_ACTION = "requires_action"

class RiskLevel(Enum):
    MINIMAL = "minimal"
    LIMITED = "limited"
    MEDIUM = "medium"
    HIGH = "high"
    UNACCEPTABLE = "unacceptable"

@dataclass
class ComplianceFinding:
    id: str
    category: str
    regulation: str
    obligation: str
    status: ComplianceStatus
    risk_level: RiskLevel
    description: str
    evidence: List[str]
    recommendations: List[str]
    evidence_wishlist: List[str]
    timestamp: datetime

@dataclass
class AuditSummary:
    audit_id: str
    system_name: str
    audit_date: datetime
    overall_status: ComplianceStatus
    risk_assessment: RiskLevel
    total_findings: int
    compliant_findings: int
    non_compliant_findings: int
    unknown_findings: int
    critical_actions: List[str]
    evidence_gaps: List[str]
    next_review_date: datetime

class ComplianceAuditor:
    def __init__(self):
        self.eu_ai_act_obligations = self._load_eu_ai_act_obligations()
        self.gdpr_obligations = self._load_gdpr_obligations()
        self.audit_templates = self._load_audit_templates()
    
    def _load_eu_ai_act_obligations(self) -> Dict[str, Any]:
        """Load EU AI Act obligations and requirements"""
        return {
            "risk_assessment": {
                "minimal_risk": ["transparency", "user_information"],
                "limited_risk": ["transparency", "user_information", "human_oversight", "accuracy_robustness"],
                "high_risk": ["risk_management", "data_governance", "technical_documentation", 
                             "record_keeping", "transparency", "human_oversight", "accuracy_robustness"],
                "unacceptable_risk": ["prohibited_practices"]
            },
            "obligations": {
                "transparency": "Users must be informed they are interacting with an AI system",
                "user_information": "Clear information about AI system capabilities and limitations",
                "human_oversight": "Human oversight mechanisms for AI system decisions",
                "accuracy_robustness": "AI system accuracy, robustness, and cybersecurity",
                "risk_management": "Risk management system for high-risk AI systems",
                "data_governance": "Training, validation, and testing data governance",
                "technical_documentation": "Technical documentation for high-risk AI systems",
                "record_keeping": "Logging and record keeping for high-risk AI systems",
                "prohibited_practices": "Prohibition of certain AI practices"
            }
        }
    
    def _load_gdpr_obligations(self) -> Dict[str, Any]:
        """Load GDPR obligations and requirements"""
        return {
            "data_protection_principles": {
                "lawfulness": "Processing must be lawful, fair, and transparent",
                "purpose_limitation": "Data collected for specified, explicit, and legitimate purposes",
                "data_minimisation": "Data must be adequate, relevant, and limited to what is necessary",
                "accuracy": "Data must be accurate and kept up to date",
                "storage_limitation": "Data kept in identifiable form no longer than necessary",
                "integrity_confidentiality": "Data processed in a secure manner"
            },
            "data_subject_rights": {
                "right_to_information": "Right to be informed about data processing",
                "right_of_access": "Right to access personal data",
                "right_to_rectification": "Right to have inaccurate data corrected",
                "right_to_erasure": "Right to have data deleted",
                "right_to_restrict_processing": "Right to restrict data processing",
                "right_to_data_portability": "Right to data portability",
                "right_to_object": "Right to object to data processing"
            },
            "controller_obligations": {
                "data_protection_by_design": "Data protection by design and by default",
                "data_protection_impact_assessment": "DPIA for high-risk processing",
                "privacy_by_design": "Privacy considerations from the outset",
                "consent_management": "Valid consent mechanisms",
                "data_breach_notification": "Breach notification procedures",
                "data_protection_officer": "DPO appointment where required"
            }
        }
    
    def _load_audit_templates(self) -> Dict[str, Any]:
        """Load audit templates and checklists"""
        return {
            "system_analysis": {
                "architecture_review": ["system_design", "data_flows", "processing_locations", "third_party_integrations"],
                "purpose_assessment": ["intended_use", "user_categories", "decision_impact", "automation_level"],
                "risk_classification": ["ai_act_risk_level", "gdpr_risk_level", "data_categories", "processing_purposes"]
            },
            "data_governance": {
                "data_inventory": ["data_categories", "pii_types", "data_sources", "retention_periods"],
                "data_quality": ["accuracy", "completeness", "consistency", "timeliness"],
                "data_protection": ["encryption", "access_controls", "anonymization", "pseudonymization"]
            },
            "model_governance": {
                "model_documentation": ["model_card", "training_data", "evaluation_metrics", "bias_assessment"],
                "model_performance": ["accuracy_metrics", "robustness_testing", "adversarial_testing", "drift_monitoring"],
                "model_deployment": ["deployment_environment", "monitoring_systems", "rollback_procedures", "version_control"]
            }
        }
    
    def conduct_audit(self, system_description: Dict[str, Any], 
                     scan_outputs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Conduct comprehensive compliance audit"""
        audit_id = str(uuid.uuid4())
        audit_date = datetime.now()
        
        # Initialize audit findings
        findings = []
        
        # 1. System Analysis
        system_findings = self._analyze_system_compliance(system_description)
        findings.extend(system_findings)
        
        # 2. Data Governance Analysis
        if scan_outputs and 'data_scan' in scan_outputs:
            data_findings = self._analyze_data_compliance(scan_outputs['data_scan'])
            findings.extend(data_findings)
        
        # 3. Model Compliance Analysis
        if scan_outputs and 'model_info' in scan_outputs:
            model_findings = self._analyze_model_compliance(scan_outputs['model_info'])
            findings.extend(model_findings)
        
        # 4. Deployment Security Analysis
        if scan_outputs and 'deployment_info' in scan_outputs:
            deployment_findings = self._analyze_deployment_compliance(scan_outputs['deployment_info'])
            findings.extend(deployment_findings)
        
        # 5. Documentation Review
        if scan_outputs and 'compliance_docs' in scan_outputs:
            doc_findings = self._analyze_documentation_compliance(scan_outputs['compliance_docs'])
            findings.extend(doc_findings)
        
        # Generate audit summary
        summary = self._generate_audit_summary(audit_id, system_description.get('name', 'Unknown System'), 
                                             audit_date, findings)
        
        # Generate human-readable report
        human_report = self._generate_human_report(summary, findings)
        
        # Generate JSON report
        json_report = self._generate_json_report(summary, findings)
        
        return {
            "audit_id": audit_id,
            "audit_date": audit_date.isoformat(),
            "summary": {
                "audit_id": summary.audit_id,
                "system_name": summary.system_name,
                "audit_date": summary.audit_date.isoformat(),
                "overall_status": summary.overall_status.value,
                "risk_assessment": summary.risk_assessment.value,
                "total_findings": summary.total_findings,
                "compliant_findings": summary.compliant_findings,
                "non_compliant_findings": summary.non_compliant_findings,
                "unknown_findings": summary.unknown_findings,
                "critical_actions": summary.critical_actions,
                "evidence_gaps": summary.evidence_gaps,
                "next_review_date": summary.next_review_date.isoformat()
            },
            "findings": [{
                "id": f.id,
                "category": f.category,
                "regulation": f.regulation,
                "obligation": f.obligation,
                "status": f.status.value,
                "risk_level": f.risk_level.value,
                "description": f.description,
                "evidence": f.evidence,
                "recommendations": f.recommendations,
                "evidence_wishlist": f.evidence_wishlist,
                "timestamp": f.timestamp.isoformat()
            } for f in findings],
            "human_report": human_report,
            "json_report": json_report,
            "evidence_wishlist": self._generate_evidence_wishlist(findings)
        }
    
    def _analyze_system_compliance(self, system_description: Dict[str, Any]) -> List[ComplianceFinding]:
        """Analyze system-level compliance"""
        findings = []
        
        # EU AI Act Risk Assessment
        risk_level = self._assess_ai_act_risk_level(system_description)
        
        # Transparency obligations
        transparency_finding = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="transparency",
            regulation="EU AI Act",
            obligation="transparency",
            status=ComplianceStatus.UNKNOWN,
            risk_level=risk_level,
            description="System transparency and user information requirements",
            evidence=[],
            recommendations=["Implement user notification mechanisms", "Create clear AI system descriptions"],
            evidence_wishlist=["user_interface_screenshots", "ai_system_description", "transparency_notices"],
            timestamp=datetime.now()
        )
        findings.append(transparency_finding)
        
        # GDPR Lawfulness Assessment
        lawfulness_finding = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="lawfulness",
            regulation="GDPR",
            obligation="lawfulness",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.HIGH,
            description="Lawful basis for data processing",
            evidence=[],
            recommendations=["Document lawful basis for processing", "Implement consent mechanisms"],
            evidence_wishlist=["lawful_basis_documentation", "consent_forms", "privacy_policy"],
            timestamp=datetime.now()
        )
        findings.append(lawfulness_finding)
        
        return findings
    
    def _analyze_data_compliance(self, data_scan: Dict[str, Any]) -> List[ComplianceFinding]:
        """Analyze data governance compliance"""
        findings = []
        
        # Data minimization
        data_minimization = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="data_minimization",
            regulation="GDPR",
            obligation="data_minimisation",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.HIGH,
            description="Data minimization and purpose limitation",
            evidence=data_scan.get('evidence', []),
            recommendations=["Review data collection practices", "Implement data minimization controls"],
            evidence_wishlist=["data_inventory", "data_retention_policy", "purpose_specification"],
            timestamp=datetime.now()
        )
        findings.append(data_minimization)
        
        # Data accuracy
        data_accuracy = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="data_accuracy",
            regulation="GDPR",
            obligation="accuracy",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.LIMITED,
            description="Data accuracy and quality controls",
            evidence=data_scan.get('quality_evidence', []),
            recommendations=["Implement data quality checks", "Establish data correction procedures"],
            evidence_wishlist=["data_quality_reports", "accuracy_metrics", "correction_procedures"],
            timestamp=datetime.now()
        )
        findings.append(data_accuracy)
        
        return findings
    
    def _analyze_model_compliance(self, model_info: Dict[str, Any]) -> List[ComplianceFinding]:
        """Analyze model governance compliance"""
        findings = []
        
        # Model documentation
        model_docs = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="model_documentation",
            regulation="EU AI Act",
            obligation="technical_documentation",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.HIGH,
            description="Model documentation and technical specifications",
            evidence=model_info.get('documentation', []),
            recommendations=["Create comprehensive model card", "Document training data sources"],
            evidence_wishlist=["model_card", "training_data_documentation", "evaluation_reports"],
            timestamp=datetime.now()
        )
        findings.append(model_docs)
        
        # Model performance
        model_performance = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="model_performance",
            regulation="EU AI Act",
            obligation="accuracy_robustness",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.HIGH,
            description="Model accuracy and robustness requirements",
            evidence=model_info.get('performance_evidence', []),
            recommendations=["Implement performance monitoring", "Conduct robustness testing"],
            evidence_wishlist=["performance_metrics", "robustness_tests", "bias_assessments"],
            timestamp=datetime.now()
        )
        findings.append(model_performance)
        
        return findings
    
    def _analyze_deployment_compliance(self, deployment_info: Dict[str, Any]) -> List[ComplianceFinding]:
        """Analyze deployment security compliance"""
        findings = []
        
        # Security measures
        security = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="deployment_security",
            regulation="GDPR",
            obligation="integrity_confidentiality",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.HIGH,
            description="Deployment security and data protection measures",
            evidence=deployment_info.get('security_evidence', []),
            recommendations=["Implement encryption at rest and in transit", "Establish access controls"],
            evidence_wishlist=["security_configuration", "encryption_certificates", "access_logs"],
            timestamp=datetime.now()
        )
        findings.append(security)
        
        return findings
    
    def _analyze_documentation_compliance(self, compliance_docs: Dict[str, Any]) -> List[ComplianceFinding]:
        """Analyze existing compliance documentation"""
        findings = []
        
        # DPIA assessment
        dpia = ComplianceFinding(
            id=str(uuid.uuid4()),
            category="dpia",
            regulation="GDPR",
            obligation="data_protection_impact_assessment",
            status=ComplianceStatus.UNKNOWN,
            risk_level=RiskLevel.HIGH,
            description="Data Protection Impact Assessment",
            evidence=compliance_docs.get('dpia', []),
            recommendations=["Conduct comprehensive DPIA", "Update DPIA regularly"],
            evidence_wishlist=["dpia_document", "risk_assessment", "mitigation_measures"],
            timestamp=datetime.now()
        )
        findings.append(dpia)
        
        return findings
    
    def _assess_ai_act_risk_level(self, system_description: Dict[str, Any]) -> RiskLevel:
        """Assess AI Act risk level based on system description"""
        # Simplified risk assessment logic
        purpose = system_description.get('purpose', '').lower()
        users = system_description.get('users', [])
        
        if any(keyword in purpose for keyword in ['biometric', 'emotion', 'manipulation']):
            return RiskLevel.UNACCEPTABLE
        elif any(keyword in purpose for keyword in ['recruitment', 'credit', 'criminal', 'education']):
            return RiskLevel.HIGH
        elif any(keyword in purpose for keyword in ['recommendation', 'content']):
            return RiskLevel.LIMITED
        else:
            return RiskLevel.MINIMAL
    
    def _generate_audit_summary(self, audit_id: str, system_name: str, 
                              audit_date: datetime, findings: List[ComplianceFinding]) -> AuditSummary:
        """Generate audit summary"""
        total_findings = len(findings)
        compliant_findings = len([f for f in findings if f.status == ComplianceStatus.COMPLIANT])
        non_compliant_findings = len([f for f in findings if f.status == ComplianceStatus.NON_COMPLIANT])
        unknown_findings = len([f for f in findings if f.status == ComplianceStatus.UNKNOWN])
        
        # Determine overall status
        if non_compliant_findings > 0:
            overall_status = ComplianceStatus.NON_COMPLIANT
        elif unknown_findings > 0:
            overall_status = ComplianceStatus.REQUIRES_ACTION
        elif compliant_findings == total_findings:
            overall_status = ComplianceStatus.COMPLIANT
        else:
            overall_status = ComplianceStatus.PARTIAL
        
        # Determine risk assessment
        high_risk_findings = len([f for f in findings if f.risk_level == RiskLevel.HIGH])
        if high_risk_findings > 0:
            risk_assessment = RiskLevel.HIGH
        else:
            risk_assessment = RiskLevel.MINIMAL
        
        # Generate critical actions
        critical_actions = []
        for finding in findings:
            if finding.risk_level in [RiskLevel.HIGH, RiskLevel.UNACCEPTABLE]:
                critical_actions.extend(finding.recommendations)
        
        # Generate evidence gaps
        evidence_gaps = []
        for finding in findings:
            evidence_gaps.extend(finding.evidence_wishlist)
        
        return AuditSummary(
            audit_id=audit_id,
            system_name=system_name,
            audit_date=audit_date,
            overall_status=overall_status,
            risk_assessment=risk_assessment,
            total_findings=total_findings,
            compliant_findings=compliant_findings,
            non_compliant_findings=non_compliant_findings,
            unknown_findings=unknown_findings,
            critical_actions=list(set(critical_actions)),
            evidence_gaps=list(set(evidence_gaps)),
            next_review_date=audit_date + timedelta(days=90)
        )
    
    def _generate_human_report(self, summary: AuditSummary, findings: List[ComplianceFinding]) -> str:
        """Generate human-readable audit report"""
        report = f"""
# Compliance Audit Report

## Executive Summary
**System**: {summary.system_name}
**Audit Date**: {summary.audit_date.strftime('%Y-%m-%d %H:%M:%S')}
**Overall Status**: {summary.overall_status.value.upper()}
**Risk Assessment**: {summary.risk_assessment.value.upper()}

## Key Findings
- **Total Findings**: {summary.total_findings}
- **Compliant**: {summary.compliant_findings}
- **Non-Compliant**: {summary.non_compliant_findings}
- **Unknown/Requires Action**: {summary.unknown_findings}

## Critical Actions Required
"""
        for action in summary.critical_actions:
            report += f"- {action}\n"
        
        report += "\n## Detailed Findings\n"
        for finding in findings:
            report += f"""
### {finding.category.upper()} - {finding.regulation}
**Status**: {finding.status.value.upper()}
**Risk Level**: {finding.risk_level.value.upper()}
**Description**: {finding.description}

**Recommendations**:
"""
            for rec in finding.recommendations:
                report += f"- {rec}\n"
            
            if finding.evidence_wishlist:
                report += "\n**Required Evidence**:\n"
                for evidence in finding.evidence_wishlist:
                    report += f"- {evidence}\n"
        
        report += f"""
## Next Steps
- **Next Review Date**: {summary.next_review_date.strftime('%Y-%m-%d')}
- **Evidence Collection**: Focus on identified evidence gaps
- **Remediation**: Address non-compliant findings
- **Monitoring**: Implement ongoing compliance monitoring
"""
        
        return report
    
    def _generate_json_report(self, summary: AuditSummary, findings: List[ComplianceFinding]) -> Dict[str, Any]:
        """Generate structured JSON report for CI/CD integration"""
        return {
            "audit_metadata": {
                "audit_id": summary.audit_id,
                "system_name": summary.system_name,
                "audit_date": summary.audit_date.isoformat(),
                "next_review_date": summary.next_review_date.isoformat()
            },
            "compliance_status": {
                "overall_status": summary.overall_status.value,
                "risk_assessment": summary.risk_assessment.value,
                "total_findings": summary.total_findings,
                "compliant_findings": summary.compliant_findings,
                "non_compliant_findings": summary.non_compliant_findings,
                "unknown_findings": summary.unknown_findings
            },
            "findings": [
                {
                    "id": f.id,
                    "category": f.category,
                    "regulation": f.regulation,
                    "obligation": f.obligation,
                    "status": f.status.value,
                    "risk_level": f.risk_level.value,
                    "description": f.description,
                    "evidence": f.evidence,
                    "recommendations": f.recommendations,
                    "evidence_wishlist": f.evidence_wishlist,
                    "timestamp": f.timestamp.isoformat()
                }
                for f in findings
            ],
            "critical_actions": summary.critical_actions,
            "evidence_gaps": summary.evidence_gaps,
            "ci_cd_gates": {
                "deployment_blocked": summary.overall_status in [ComplianceStatus.NON_COMPLIANT, ComplianceStatus.REQUIRES_ACTION],
                "requires_approval": summary.risk_assessment == RiskLevel.HIGH,
                "evidence_required": len(summary.evidence_gaps) > 0
            }
        }
    
    def _generate_evidence_wishlist(self, findings: List[ComplianceFinding]) -> List[str]:
        """Generate comprehensive evidence wishlist"""
        evidence_wishlist = []
        for finding in findings:
            evidence_wishlist.extend(finding.evidence_wishlist)
        return list(set(evidence_wishlist))
