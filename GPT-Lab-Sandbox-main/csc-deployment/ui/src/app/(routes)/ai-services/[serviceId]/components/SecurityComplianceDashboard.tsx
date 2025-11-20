'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Lock, 
  Eye,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  Users,
  Database,
  Globe,
  Zap
} from 'lucide-react';

interface SecurityComplianceDashboardProps {
  service: any;
}

export default function SecurityComplianceDashboard({ service }: SecurityComplianceDashboardProps) {
  const [currentView, setCurrentView] = useState('overview');
  const [complianceData, setComplianceData] = useState<any>(null);
  const [selectedRegulation, setSelectedRegulation] = useState('eu_ai_act');

  // Simulate real-time compliance monitoring
  useEffect(() => {
    const updateComplianceData = () => {
      setComplianceData({
        overallScore: 94.7,
        lastAudit: '2025-09-20T10:30:00Z',
        nextAudit: '2025-12-20T10:30:00Z',
        activeAlerts: 2,
        resolvedIssues: 15,
        regulations: {
          eu_ai_act: {
            name: 'EU AI Act',
            status: 'compliant',
            score: 96.2,
            lastCheck: '2025-09-21T08:00:00Z',
            requirements: [
              { id: 'risk_assessment', name: 'AI Risk Assessment', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'transparency', name: 'Transparency Obligations', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'human_oversight', name: 'Human Oversight', status: 'compliant', lastCheck: '2025-09-19' },
              { id: 'data_governance', name: 'Data Governance', status: 'warning', lastCheck: '2025-09-18' },
              { id: 'accuracy_robustness', name: 'Accuracy & Robustness', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'record_keeping', name: 'Record Keeping', status: 'compliant', lastCheck: '2025-09-21' }
            ]
          },
          gdpr: {
            name: 'GDPR',
            status: 'compliant',
            score: 93.1,
            lastCheck: '2025-09-21T06:00:00Z',
            requirements: [
              { id: 'data_protection', name: 'Data Protection by Design', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'consent_management', name: 'Consent Management', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'data_portability', name: 'Data Portability', status: 'compliant', lastCheck: '2025-09-19' },
              { id: 'right_to_erasure', name: 'Right to Erasure', status: 'warning', lastCheck: '2025-09-18' },
              { id: 'breach_notification', name: 'Breach Notification', status: 'compliant', lastCheck: '2025-09-21' },
              { id: 'privacy_impact', name: 'Privacy Impact Assessment', status: 'compliant', lastCheck: '2025-09-20' }
            ]
          },
          iso27001: {
            name: 'ISO 27001',
            status: 'compliant',
            score: 94.8,
            lastCheck: '2025-09-20T14:00:00Z',
            requirements: [
              { id: 'access_control', name: 'Access Control', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'encryption', name: 'Encryption Standards', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'incident_management', name: 'Incident Management', status: 'compliant', lastCheck: '2025-09-19' },
              { id: 'risk_management', name: 'Risk Management', status: 'compliant', lastCheck: '2025-09-20' },
              { id: 'audit_logging', name: 'Audit Logging', status: 'compliant', lastCheck: '2025-09-21' }
            ]
          }
        },
        vulnerabilities: [
          { id: 'vuln-001', severity: 'medium', title: 'Outdated TensorFlow dependency', status: 'in_progress', discovered: '2025-09-19' },
          { id: 'vuln-002', severity: 'low', title: 'Missing rate limiting on API endpoint', status: 'new', discovered: '2025-09-21' }
        ],
        dataProcessing: {
          totalRecords: 2847593,
          anonymizedRecords: 2847593,
          encryptedAtRest: true,
          encryptedInTransit: true,
          dataResidency: 'EU-Central-1',
          retentionCompliance: 98.7
        },
        auditTrail: [
          { timestamp: '2025-09-21T08:15:00Z', event: 'Data anonymization completed', user: 'system', status: 'success' },
          { timestamp: '2025-09-21T07:30:00Z', event: 'Compliance check executed', user: 'compliance-bot', status: 'success' },
          { timestamp: '2025-09-20T16:45:00Z', event: 'Security scan initiated', user: 'admin@sw4e.org', status: 'success' },
          { timestamp: '2025-09-20T14:20:00Z', event: 'Data governance policy updated', user: 'admin@sw4e.org', status: 'success' }
        ]
      });
    };

    updateComplianceData();
    const interval = setInterval(updateComplianceData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  if (!complianceData) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-400">Loading compliance data...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Security Compliance Dashboard</h2>
            <p className="text-red-200">EU AI Act, GDPR, and ISO 27001 compliance monitoring</p>
          </div>
        </div>
        <p className="text-slate-300">
          Real-time compliance monitoring with automated checks, 
          vulnerability scanning, and regulatory reporting.
        </p>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant={currentView === 'overview' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Overview
        </Button>
        <Button 
          onClick={() => setCurrentView('regulations')}
          variant={currentView === 'regulations' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Regulations
        </Button>
        <Button 
          onClick={() => setCurrentView('vulnerabilities')}
          variant={currentView === 'vulnerabilities' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Vulnerabilities
        </Button>
        <Button 
          onClick={() => setCurrentView('data')}
          variant={currentView === 'data' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Data Protection
        </Button>
        <Button 
          onClick={() => setCurrentView('audit')}
          variant={currentView === 'audit' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Audit Trail
        </Button>
      </div>

      {/* Overview Tab */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Compliance Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-4xl font-bold text-green-400 mb-2">{complianceData.overallScore}%</div>
              <div className="text-sm text-green-300">Overall Compliance</div>
              <Badge variant="green" className="mt-2">Excellent</Badge>
            </div>
            <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-4xl font-bold text-blue-400 mb-2">{complianceData.activeAlerts}</div>
              <div className="text-sm text-blue-300">Active Alerts</div>
              <Badge variant="yellow" className="mt-2">Monitor</Badge>
            </div>
            <div className="text-center p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-4xl font-bold text-purple-400 mb-2">{complianceData.resolvedIssues}</div>
              <div className="text-sm text-purple-300">Resolved Issues</div>
              <Badge variant="green" className="mt-2">This Month</Badge>
            </div>
            <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-4xl font-bold text-yellow-400 mb-2">23</div>
              <div className="text-sm text-yellow-300">Days to Next Audit</div>
              <Badge variant="secondary" className="mt-2">Scheduled</Badge>
            </div>
          </div>

          {/* Regulation Status */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Regulation Compliance Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(complianceData.regulations).map(([key, reg]: [string, any]) => (
                <Card key={key} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">{reg.name}</h4>
                    <Badge variant={getStatusBadge(reg.status)}>
                      {reg.status}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2 text-center">
                    <span className={getStatusColor(reg.status)}>{reg.score}%</span>
                  </div>
                  <div className="text-sm text-slate-400 text-center">
                    Last check: {new Date(reg.lastCheck).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Regulations Tab */}
      {currentView === 'regulations' && (
        <div className="space-y-6">
          {/* Regulation Selector */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Regulation Details</h3>
              <select 
                value={selectedRegulation}
                onChange={(e) => setSelectedRegulation(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded text-white"
              >
                <option value="eu_ai_act">EU AI Act</option>
                <option value="gdpr">GDPR</option>
                <option value="iso27001">ISO 27001</option>
              </select>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {complianceData.regulations[selectedRegulation].name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(complianceData.regulations[selectedRegulation].status)}>
                      {complianceData.regulations[selectedRegulation].status}
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      Score: {complianceData.regulations[selectedRegulation].score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white mb-3">Compliance Requirements</h4>
              {complianceData.regulations[selectedRegulation].requirements.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {req.status === 'compliant' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <span className="text-white font-medium">{req.name}</span>
                      <div className="text-slate-400 text-sm">
                        Last checked: {req.lastCheck}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadge(req.status)}>
                      {req.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="text-slate-400">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Vulnerabilities Tab */}
      {currentView === 'vulnerabilities' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Security Vulnerabilities</h3>
              <Button className="btn-primary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Run Security Scan
              </Button>
            </div>

            {complianceData.vulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">No Active Vulnerabilities</h4>
                <p className="text-slate-400">All security issues have been resolved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complianceData.vulnerabilities.map((vuln: any) => (
                  <Card key={vuln.id} className="p-4 bg-slate-700 border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${getSeverityColor(vuln.severity)}`} />
                        <div>
                          <h4 className="text-white font-medium">{vuln.title}</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant={vuln.severity === 'critical' ? 'red' : vuln.severity === 'high' ? 'red' : vuln.severity === 'medium' ? 'yellow' : 'gray'}>
                              {vuln.severity}
                            </Badge>
                            <span className="text-slate-400">
                              Discovered: {vuln.discovered}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={vuln.status === 'new' ? 'red' : 'yellow'}>
                          {vuln.status.replace('_', ' ')}
                        </Badge>
                        <Button size="sm" className="btn-primary">
                          Fix
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Data Protection Tab */}
      {currentView === 'data' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Data Protection Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">Data Processing</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Total Records:</span>
                      <span className="text-white">{complianceData.dataProcessing.totalRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Anonymized:</span>
                      <span className="text-green-400">{complianceData.dataProcessing.anonymizedRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Retention Compliance:</span>
                      <span className="text-green-400">{complianceData.dataProcessing.retentionCompliance}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Encryption Status</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">At Rest:</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-400">AES-256</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">In Transit:</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-400">TLS 1.3</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Key Management:</span>
                      <span className="text-green-400">HSM-backed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-medium">Data Residency</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Primary Region:</span>
                      <span className="text-white">{complianceData.dataProcessing.dataResidency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Backup Region:</span>
                      <span className="text-white">EU-West-1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Cross-border:</span>
                      <span className="text-red-400">Prohibited</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Access Control</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Active Users:</span>
                      <span className="text-white">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Admin Users:</span>
                      <span className="text-white">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Failed Logins (24h):</span>
                      <span className="text-yellow-400">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Audit Trail Tab */}
      {currentView === 'audit' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Audit Trail</h3>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Logs
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {complianceData.auditTrail.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    entry.status === 'success' ? 'bg-green-500' : 
                    entry.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <span className="text-white font-medium">{entry.event}</span>
                    <div className="text-slate-400 text-sm">
                      by {entry.user} • {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge variant={entry.status === 'success' ? 'green' : entry.status === 'warning' ? 'yellow' : 'red'}>
                  {entry.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <Eye className="w-4 h-4" />
              View Full Audit Log
            </Button>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Compliance Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="btn-primary flex items-center gap-2 justify-center">
            <FileText className="w-4 h-4" />
            Generate Compliance Report
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Zap className="w-4 h-4" />
            Run Security Scan
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Settings className="w-4 h-4" />
            Configure Policies
          </Button>
        </div>
      </Card>
    </div>
  );
}
