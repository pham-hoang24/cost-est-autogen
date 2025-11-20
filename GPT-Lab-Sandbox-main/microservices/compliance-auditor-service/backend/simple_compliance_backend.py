"""
SW4E Compliance Auditor Service - Flask Backend
Comprehensive audit system for EU AI Act and GDPR compliance
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import uuid
from datetime import datetime, timedelta
import os
from compliance_auditor import ComplianceAuditor, ComplianceStatus, RiskLevel

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
])

# Initialize compliance auditor
auditor = ComplianceAuditor()

# Demo data for testing
DEMO_SYSTEM_DESCRIPTIONS = {
    "recruitment_ai": {
        "name": "AI-Powered Recruitment System",
        "purpose": "Automated CV screening and candidate ranking for recruitment",
        "users": ["HR professionals", "recruitment managers"],
        "data_types": ["CV data", "job descriptions", "interview notes"],
        "processing_location": "EU",
        "decision_impact": "High - affects hiring decisions",
        "automation_level": "Fully automated screening"
    },
    "credit_scoring": {
        "name": "AI Credit Scoring System",
        "purpose": "Automated creditworthiness assessment for loan applications",
        "users": ["bank employees", "loan officers"],
        "data_types": ["financial data", "credit history", "employment records"],
        "processing_location": "EU",
        "decision_impact": "High - affects loan approval",
        "automation_level": "Fully automated decision making"
    },
    "content_recommendation": {
        "name": "Content Recommendation Engine",
        "purpose": "Personalized content recommendations for users",
        "users": ["end users", "content managers"],
        "data_types": ["user behavior", "content metadata", "preferences"],
        "processing_location": "EU",
        "decision_impact": "Medium - affects user experience",
        "automation_level": "Automated recommendations with human oversight"
    }
}

DEMO_SCAN_OUTPUTS = {
    "data_scan": {
        "pii_categories": ["names", "email_addresses", "phone_numbers", "addresses"],
        "data_locations": ["database_primary", "cache_redis", "logs_elasticsearch"],
        "retention_periods": {"user_data": "2 years", "logs": "1 year", "analytics": "5 years"},
        "encryption_status": "encrypted_at_rest_and_in_transit",
        "evidence": ["data_inventory.xlsx", "encryption_certificates.pdf", "retention_policy.pdf"]
    },
    "model_info": {
        "model_type": "Random Forest Classifier",
        "training_data_size": "100,000 records",
        "accuracy_metrics": {"precision": 0.85, "recall": 0.82, "f1_score": 0.83},
        "bias_assessment": "conducted",
        "documentation": ["model_card.pdf", "training_report.pdf", "bias_assessment.pdf"]
    },
    "deployment_info": {
        "infrastructure": "Kubernetes cluster",
        "encryption": "TLS 1.3, AES-256",
        "access_controls": "RBAC enabled",
        "monitoring": "Prometheus + Grafana",
        "security_evidence": ["security_scan.pdf", "penetration_test.pdf", "access_audit.pdf"]
    },
    "compliance_docs": {
        "dpia": ["dpia_v2.1.pdf"],
        "privacy_policy": ["privacy_policy_v3.0.pdf"],
        "model_card": ["model_card_v1.2.pdf"],
        "risk_assessment": ["risk_assessment_v1.0.pdf"]
    }
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "SW4E Compliance Auditor",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/audit/conduct', methods=['POST'])
def conduct_audit():
    """Conduct comprehensive compliance audit"""
    try:
        data = request.get_json()
        
        # Extract system description and scan outputs
        system_description = data.get('system_description', {})
        scan_outputs = data.get('scan_outputs', {})
        
        # Conduct audit
        audit_result = auditor.conduct_audit(system_description, scan_outputs)
        
        return jsonify({
            "success": True,
            "audit_result": audit_result,
            "message": "Audit completed successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Audit failed"
        }), 500

@app.route('/api/audit/demo', methods=['GET'])
def get_demo_audits():
    """Get demo audit scenarios"""
    demo_audits = []
    
    for system_id, system_desc in DEMO_SYSTEM_DESCRIPTIONS.items():
        # Conduct demo audit
        audit_result = auditor.conduct_audit(system_desc, DEMO_SCAN_OUTPUTS)
        
        demo_audits.append({
            "system_id": system_id,
            "system_description": system_desc,
            "audit_summary": {
                "audit_id": audit_result["summary"]["audit_id"],
                "system_name": audit_result["summary"]["system_name"],
                "audit_date": audit_result["summary"]["audit_date"],
                "overall_status": audit_result["summary"]["overall_status"],
                "risk_assessment": audit_result["summary"]["risk_assessment"],
                "total_findings": audit_result["summary"]["total_findings"],
                "compliant_findings": audit_result["summary"]["compliant_findings"],
                "non_compliant_findings": audit_result["summary"]["non_compliant_findings"],
                "unknown_findings": audit_result["summary"]["unknown_findings"],
                "critical_actions": audit_result["summary"]["critical_actions"],
                "evidence_gaps": audit_result["summary"]["evidence_gaps"],
                "next_review_date": audit_result["summary"]["next_review_date"]
            },
            "key_findings": len(audit_result["findings"]),
            "risk_level": audit_result["summary"]["risk_assessment"],
            "compliance_status": audit_result["summary"]["overall_status"]
        })
    
    return jsonify({
        "success": True,
        "demo_audits": demo_audits,
        "message": "Demo audits generated successfully"
    })

@app.route('/api/audit/templates', methods=['GET'])
def get_audit_templates():
    """Get audit templates and checklists"""
    return jsonify({
        "success": True,
        "templates": {
            "system_analysis": auditor.audit_templates["system_analysis"],
            "data_governance": auditor.audit_templates["data_governance"],
            "model_governance": auditor.audit_templates["model_governance"]
        },
        "regulations": {
            "eu_ai_act": auditor.eu_ai_act_obligations,
            "gdpr": auditor.gdpr_obligations
        }
    })

@app.route('/api/audit/evidence-wishlist', methods=['POST'])
def generate_evidence_wishlist():
    """Generate evidence wishlist for specific system"""
    try:
        data = request.get_json()
        system_description = data.get('system_description', {})
        
        # Generate evidence wishlist
        evidence_wishlist = [
            "system_architecture_diagram.pdf",
            "data_flow_diagram.pdf", 
            "privacy_policy.pdf",
            "data_protection_impact_assessment.pdf",
            "model_card.pdf",
            "training_data_documentation.pdf",
            "evaluation_metrics_report.pdf",
            "bias_assessment_report.pdf",
            "security_configuration.pdf",
            "access_control_policy.pdf",
            "incident_response_plan.pdf",
            "monitoring_dashboard_screenshots.pdf",
            "audit_logs_sample.pdf",
            "consent_forms.pdf",
            "data_retention_policy.pdf"
        ]
        
        return jsonify({
            "success": True,
            "evidence_wishlist": evidence_wishlist,
            "message": "Evidence wishlist generated successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to generate evidence wishlist"
        }), 500

@app.route('/api/audit/report/<audit_id>', methods=['GET'])
def get_audit_report(audit_id):
    """Get detailed audit report by ID"""
    try:
        # In a real implementation, this would fetch from database
        # For demo purposes, generate a new audit
        system_description = DEMO_SYSTEM_DESCRIPTIONS.get("recruitment_ai", {})
        audit_result = auditor.conduct_audit(system_description, DEMO_SCAN_OUTPUTS)
        
        return jsonify({
            "success": True,
            "audit_id": audit_id,
            "report": audit_result,
            "message": "Audit report retrieved successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve audit report"
        }), 500

@app.route('/api/audit/export/<audit_id>', methods=['GET'])
def export_audit_report(audit_id):
    """Export audit report in various formats"""
    try:
        format_type = request.args.get('format', 'json')
        
        # Generate audit report
        system_description = DEMO_SYSTEM_DESCRIPTIONS.get("recruitment_ai", {})
        audit_result = auditor.conduct_audit(system_description, DEMO_SCAN_OUTPUTS)
        
        if format_type == 'json':
            return jsonify(audit_result)
        elif format_type == 'pdf':
            # In a real implementation, generate PDF
            return jsonify({
                "success": True,
                "message": "PDF export not implemented in demo",
                "audit_id": audit_id
            })
        else:
            return jsonify({
                "success": False,
                "message": "Unsupported format"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to export audit report"
        }), 500

@app.route('/api/compliance/check', methods=['POST'])
def compliance_check():
    """Quick compliance check for CI/CD integration"""
    try:
        data = request.get_json()
        system_description = data.get('system_description', {})
        
        # Quick compliance check
        audit_result = auditor.conduct_audit(system_description, {})
        
        # Determine if deployment should be blocked
        overall_status = audit_result["summary"]["overall_status"]
        risk_assessment = audit_result["summary"]["risk_assessment"]
        
        deployment_blocked = overall_status in ["non_compliant", "requires_action"]
        requires_approval = risk_assessment == "high"
        
        return jsonify({
            "success": True,
            "compliance_check": {
                "deployment_blocked": deployment_blocked,
                "requires_approval": requires_approval,
                "overall_status": overall_status,
                "risk_level": risk_assessment,
                "critical_actions": audit_result["summary"]["critical_actions"],
                "evidence_required": len(audit_result["evidence_wishlist"]) > 0
            },
            "message": "Compliance check completed"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Compliance check failed"
        }), 500

@app.route('/api/regulations/eu-ai-act', methods=['GET'])
def get_eu_ai_act_info():
    """Get EU AI Act information and obligations"""
    return jsonify({
        "success": True,
        "regulation": "EU AI Act",
        "obligations": auditor.eu_ai_act_obligations,
        "message": "EU AI Act information retrieved successfully"
    })

@app.route('/api/regulations/gdpr', methods=['GET'])
def get_gdpr_info():
    """Get GDPR information and obligations"""
    return jsonify({
        "success": True,
        "regulation": "GDPR",
        "obligations": auditor.gdpr_obligations,
        "message": "GDPR information retrieved successfully"
    })

if __name__ == '__main__':
    print("🚀 Starting SW4E Compliance Auditor Service...")
    print("📍 Service will be available at: http://localhost:8084")
    print("🔍 Health check: http://localhost:8084/api/health")
    print("📊 Demo audits: http://localhost:8084/api/audit/demo")
    print("⚖️ Compliance check: http://localhost:8084/api/compliance/check")
    
    app.run(host='0.0.0.0', port=8084, debug=True)
