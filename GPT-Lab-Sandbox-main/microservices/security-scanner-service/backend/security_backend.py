"""
Flask backend for AI-Powered Security Scanner & Auto-Remediation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from security_scanner import SecurityScanner, SecurityScan, VulnerabilitySeverity, SecurityLayer
import json
import datetime
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002"
], allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'], 
methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Initialize scanner
scanner = SecurityScanner()
scan_history = []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI-Powered Security Scanner",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/api/scan/start', methods=['POST'])
def start_scan():
    """Start a new security scan"""
    try:
        data = request.get_json()
        target = data.get('target', 'default-application')
        scan_type = data.get('scan_type', 'comprehensive')
        
        # Perform scan
        scan_result = scanner.scan_target(target, scan_type)
        scan_history.append(scan_result)
        
        # Convert to JSON-serializable format
        result = {
            "scan_id": scan_result.scan_id,
            "target": scan_result.target,
            "scan_type": scan_result.scan_type,
            "started_at": scan_result.started_at.isoformat(),
            "completed_at": scan_result.completed_at.isoformat() if scan_result.completed_at else None,
            "total_vulnerabilities": scan_result.total_vulnerabilities,
            "critical_count": scan_result.critical_count,
            "high_count": scan_result.high_count,
            "medium_count": scan_result.medium_count,
            "low_count": scan_result.low_count,
            "info_count": scan_result.info_count,
            "security_score": scan_result.security_score,
            "risk_level": scan_result.risk_level,
            "auto_fixes_applied": scan_result.auto_fixes_applied,
            "manual_fixes_required": scan_result.manual_fixes_required,
            "vulnerabilities": []
        }
        
        # Convert vulnerabilities
        for vuln in scan_result.vulnerabilities:
            vuln_data = {
                "id": vuln.id,
                "title": vuln.title,
                "description": vuln.description,
                "severity": vuln.severity.value,
                "layer": vuln.layer.value,
                "category": vuln.category,
                "file_path": vuln.file_path,
                "line_number": vuln.line_number,
                "cve_id": vuln.cve_id,
                "cvss_score": vuln.cvss_score,
                "exploitability": vuln.exploitability,
                "impact": vuln.impact,
                "remediation": vuln.remediation,
                "auto_fixable": vuln.auto_fixable,
                "fix_code": vuln.fix_code,
                "fix_instructions": vuln.fix_instructions,
                "references": vuln.references,
                "discovered_at": vuln.discovered_at.isoformat(),
                "status": vuln.status
            }
            result["vulnerabilities"].append(vuln_data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan/<scan_id>/vulnerabilities', methods=['GET'])
def get_vulnerabilities(scan_id):
    """Get vulnerabilities for a specific scan"""
    try:
        scan = next((s for s in scan_history if s.scan_id == scan_id), None)
        if not scan:
            return jsonify({"error": "Scan not found"}), 404
        
        vulnerabilities = []
        for vuln in scan.vulnerabilities:
            vuln_data = {
                "id": vuln.id,
                "title": vuln.title,
                "description": vuln.description,
                "severity": vuln.severity.value,
                "layer": vuln.layer.value,
                "category": vuln.category,
                "file_path": vuln.file_path,
                "line_number": vuln.line_number,
                "cve_id": vuln.cve_id,
                "cvss_score": vuln.cvss_score,
                "exploitability": vuln.exploitability,
                "impact": vuln.impact,
                "remediation": vuln.remediation,
                "auto_fixable": vuln.auto_fixable,
                "fix_code": vuln.fix_code,
                "fix_instructions": vuln.fix_instructions,
                "references": vuln.references,
                "discovered_at": vuln.discovered_at.isoformat(),
                "status": vuln.status
            }
            vulnerabilities.append(vuln_data)
        
        return jsonify({"vulnerabilities": vulnerabilities})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan/<scan_id>/fix/<vulnerability_id>', methods=['POST'])
def apply_fix(scan_id, vulnerability_id):
    """Apply automated fix for a vulnerability"""
    try:
        result = scanner.apply_auto_fix(vulnerability_id, scan_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get security analytics and trends"""
    try:
        analytics = scanner.get_security_analytics(scan_history)
        return jsonify(analytics)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scans', methods=['GET'])
def get_scan_history():
    """Get scan history"""
    try:
        scans = []
        for scan in scan_history:
            scan_data = {
                "scan_id": scan.scan_id,
                "target": scan.target,
                "scan_type": scan.scan_type,
                "started_at": scan.started_at.isoformat(),
                "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
                "total_vulnerabilities": scan.total_vulnerabilities,
                "critical_count": scan.critical_count,
                "high_count": scan.high_count,
                "medium_count": scan.medium_count,
                "low_count": scan.low_count,
                "info_count": scan.info_count,
                "security_score": scan.security_score,
                "risk_level": scan.risk_level,
                "auto_fixes_applied": scan.auto_fixes_applied,
                "manual_fixes_required": scan.manual_fixes_required
            }
            scans.append(scan_data)
        
        return jsonify({"scans": scans})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo/quick-scan', methods=['POST'])
def demo_quick_scan():
    """Demo endpoint for quick security scan"""
    try:
        # Generate a quick demo scan
        demo_scan = scanner.scan_target("demo-application", "quick")
        scan_history.append(demo_scan)
        
        # Return simplified results for demo
        return jsonify({
            "scan_id": demo_scan.scan_id,
            "security_score": demo_scan.security_score,
            "risk_level": demo_scan.risk_level,
            "total_vulnerabilities": demo_scan.total_vulnerabilities,
            "critical_count": demo_scan.critical_count,
            "high_count": demo_scan.high_count,
            "medium_count": demo_scan.medium_count,
            "low_count": demo_scan.low_count,
            "auto_fixable_count": len([v for v in demo_scan.vulnerabilities if v.auto_fixable]),
            "manual_fix_count": len([v for v in demo_scan.vulnerabilities if not v.auto_fixable])
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8085, debug=True)
