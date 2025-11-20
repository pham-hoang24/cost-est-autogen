'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Progress } from '@/components/Progress';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Database,
  Lock,
  FileCheck,
  AlertCircle,
  Info,
  ExternalLink,
  Zap,
  Target,
  Award,
  Star,
  Activity,
  PieChart,
  LineChart,
  Play,
  Pause,
  Square,
  Loader2,
  Sparkles,
  Globe,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Filter,
  Plus
} from 'lucide-react';

interface ComplianceFinding {
  id: string;
  category: string;
  regulation: string;
  obligation: string;
  status: string;
  risk_level: string;
  description: string;
  evidence: string[];
  recommendations: string[];
  evidence_wishlist: string[];
  timestamp: string;
}

interface AuditSummary {
  audit_id: string;
  system_name: string;
  audit_date: string;
  overall_status: string;
  risk_assessment: string;
  total_findings: number;
  compliant_findings: number;
  non_compliant_findings: number;
  unknown_findings: number;
  critical_actions: string[];
  evidence_gaps: string[];
  next_review_date: string;
}

interface DemoAudit {
  system_id: string;
  system_description: string;
  audit_summary: AuditSummary;
  key_findings: number;
  risk_level: string;
  compliance_status: string;
}

interface AuditProgress {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  progress: number;
  isRunning: boolean;
  completedSteps: string[];
  currentFinding?: ComplianceFinding;
}

export default function ComplianceAuditorService() {
  const [activeTab, setActiveTab] = useState('overview');
  const [audits, setAudits] = useState<DemoAudit[]>([]);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<DemoAudit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auditProgress, setAuditProgress] = useState<AuditProgress>({
    currentStep: 0,
    totalSteps: 6,
    stepName: 'Ready to start',
    progress: 0,
    isRunning: false,
    completedSteps: []
  });
  const [showDemo, setShowDemo] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [scanningAnimation, setScanningAnimation] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalScans: 0,
    activeAudits: 0,
    criticalAlerts: 0,
    complianceScore: 0
  });

  const auditSteps = [
    { name: 'System Analysis', description: 'Analyzing system architecture and data flows', icon: Database },
    { name: 'Data Assessment', description: 'Evaluating data types and sensitivity levels', icon: Shield },
    { name: 'Model Review', description: 'Assessing AI model compliance requirements', icon: Target },
    { name: 'Deployment Check', description: 'Reviewing deployment security and monitoring', icon: Settings },
    { name: 'Documentation Audit', description: 'Verifying compliance documentation', icon: FileText },
    { name: 'Risk Assessment', description: 'Calculating overall risk and compliance score', icon: AlertTriangle }
  ];

  const demoSystems = [
    {
      id: 'recruitment_ai',
      name: 'AI-Powered Recruitment System',
      description: 'Automated CV screening and candidate ranking using machine learning',
      riskLevel: 'high',
      complianceScore: 65,
      findings: 12,
      lastAudit: '2024-01-15'
    },
    {
      id: 'healthcare_diagnosis',
      name: 'Medical Diagnosis Assistant',
      description: 'AI system for preliminary medical diagnosis and treatment recommendations',
      riskLevel: 'unacceptable',
      complianceScore: 35,
      findings: 18,
      lastAudit: '2024-01-10'
    },
    {
      id: 'financial_fraud',
      name: 'Fraud Detection System',
      description: 'Real-time transaction monitoring and fraud prevention',
      riskLevel: 'limited',
      complianceScore: 85,
      findings: 6,
      lastAudit: '2024-01-20'
    }
  ];

  const demoFindings: ComplianceFinding[] = [
    {
      id: '1',
      category: 'data_protection',
      regulation: 'GDPR',
      obligation: 'lawfulness',
      status: 'non_compliant',
      risk_level: 'high',
      description: 'Missing legal basis for processing personal data in recruitment system',
      evidence: ['data_processing_agreement.pdf'],
      recommendations: ['Obtain explicit consent from candidates', 'Implement legitimate interest assessment'],
      evidence_wishlist: ['consent_forms', 'legitimate_interest_assessment'],
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      category: 'transparency',
      regulation: 'EU AI Act',
      obligation: 'transparency',
      status: 'compliant',
      risk_level: 'minimal',
      description: 'Clear information provided to users about AI decision-making',
      evidence: ['privacy_policy.pdf', 'ai_disclosure_document.pdf'],
      recommendations: ['Maintain current transparency measures'],
      evidence_wishlist: [],
      timestamp: '2024-01-15T10:35:00Z'
    },
    {
      id: '3',
      category: 'accuracy',
      regulation: 'GDPR',
      obligation: 'accuracy',
      status: 'partial',
      risk_level: 'limited',
      description: 'Data accuracy controls partially implemented',
      evidence: ['data_quality_report.pdf'],
      recommendations: ['Implement automated data validation', 'Establish data correction procedures'],
      evidence_wishlist: ['validation_rules', 'correction_procedures'],
      timestamp: '2024-01-15T10:40:00Z'
    }
  ];

  useEffect(() => {
    loadDemoData();
    
    // Live updates simulation
    const liveUpdateInterval = setInterval(() => {
      const updates = [
        "🔍 Scanning new AI system for compliance...",
        "📊 Updating risk assessment metrics...",
        "🛡️ Validating GDPR compliance requirements...",
        "⚡ Processing EU AI Act obligations...",
        "📋 Generating audit report...",
        "🔔 New compliance alert detected...",
        "✅ Audit completed successfully...",
        "📈 Compliance score updated..."
      ];
      
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      setLiveUpdates(prev => [randomUpdate, ...prev.slice(0, 4)]);
      
      // Update real-time stats
      setRealTimeStats(prev => ({
        totalScans: prev.totalScans + Math.floor(Math.random() * 3),
        activeAudits: Math.floor(Math.random() * 5) + 1,
        criticalAlerts: Math.floor(Math.random() * 3),
        complianceScore: Math.floor(Math.random() * 40) + 60
      }));
    }, 3000);

    // Pulse animation for critical alerts
    const pulseInterval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);

    return () => {
      clearInterval(liveUpdateInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoAudits: DemoAudit[] = demoSystems.map(system => ({
        system_id: system.id,
        system_description: system.description,
        audit_summary: {
          audit_id: `audit_${system.id}_${Date.now()}`,
          system_name: system.name,
          audit_date: system.lastAudit,
          overall_status: system.complianceScore > 70 ? 'compliant' : system.complianceScore > 40 ? 'partial' : 'non_compliant',
          risk_assessment: system.riskLevel,
          total_findings: system.findings,
          compliant_findings: Math.floor(system.findings * 0.3),
          non_compliant_findings: Math.floor(system.findings * 0.5),
          unknown_findings: Math.floor(system.findings * 0.2),
          critical_actions: ['Update privacy policy', 'Implement data retention controls'],
          evidence_gaps: ['Consent forms', 'DPIA documentation'],
          next_review_date: '2024-04-15'
        },
        key_findings: system.findings,
        risk_level: system.riskLevel,
        compliance_status: system.complianceScore > 70 ? 'compliant' : system.complianceScore > 40 ? 'partial' : 'non_compliant'
      }));

      setAudits(demoAudits);
      setFindings(demoFindings);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startInteractiveDemo = async () => {
    setShowDemo(true);
    setScanningAnimation(true);
    setAuditProgress({
      currentStep: 0,
      totalSteps: 6,
      stepName: 'Starting audit...',
      progress: 0,
      isRunning: true,
      completedSteps: []
    });

    // Add live update
    setLiveUpdates(prev => ["🚀 Starting comprehensive compliance audit...", ...prev.slice(0, 4)]);

    for (let step = 0; step < auditSteps.length; step++) {
      // Update progress
      setAuditProgress(prev => ({
        ...prev,
        currentStep: step + 1,
        stepName: auditSteps[step].name,
        progress: ((step + 1) / auditSteps.length) * 100,
        completedSteps: [...prev.completedSteps, auditSteps[step].name]
      }));

      // Add live update for each step
      setLiveUpdates(prev => [`⚡ ${auditSteps[step].name} in progress...`, ...prev.slice(0, 4)]);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show current finding if applicable
      if (step === 2 && demoFindings[0]) {
        setAuditProgress(prev => ({
          ...prev,
          currentFinding: demoFindings[0]
        }));
        setLiveUpdates(prev => ["🔍 Found compliance issues in data assessment...", ...prev.slice(0, 4)]);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setScanningAnimation(false);
    // Complete the audit
    setAuditProgress(prev => ({
      ...prev,
      isRunning: false,
      stepName: 'Audit completed!',
      progress: 100
    }));
    
    setLiveUpdates(prev => ["✅ Compliance audit completed successfully!", ...prev.slice(0, 4)]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'non_compliant': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'minimal': return 'text-green-600 bg-green-100';
      case 'limited': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'unacceptable': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleFindingExpansion = (findingId: string) => {
    const newExpanded = new Set(expandedFindings);
    if (newExpanded.has(findingId)) {
      newExpanded.delete(findingId);
    } else {
      newExpanded.add(findingId);
    }
    setExpandedFindings(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-surface p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview' 
                ? 'bg-primary text-white' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'demo' 
                ? 'bg-primary text-white' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Play className="w-4 h-4" />
            Interactive Demo
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'audits' 
                ? 'bg-primary text-white' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            Recent Audits
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'evidence' 
                ? 'bg-primary text-white' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Evidence
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Compliance Auditor
            </h1>
            <p className="text-text-muted mt-2">
              Comprehensive EU AI Act and GDPR compliance auditing system with interactive demos
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadDemoData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={startInteractiveDemo} disabled={auditProgress.isRunning}>
              <Play className="w-4 h-4 mr-2" />
              Start Demo
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={`p-6 transition-all duration-300 ${pulseAnimation ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Live Scans</p>
                    <p className="text-2xl font-bold text-text-primary">{realTimeStats.totalScans}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      +{Math.floor(Math.random() * 3) + 1} in last minute
                    </p>
                  </div>
                  <div className="relative">
                    <BarChart3 className="w-8 h-8 text-primary" />
                    {scanningAnimation && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Active Audits</p>
                    <p className="text-2xl font-bold text-blue-600">{realTimeStats.activeAudits}</p>
                    <p className="text-xs text-blue-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Running now
                    </p>
                  </div>
                  <div className="relative">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                </div>
              </Card>
              <Card className={`p-6 transition-all duration-300 ${pulseAnimation ? 'ring-2 ring-red-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Critical Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{realTimeStats.criticalAlerts}</p>
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Requires attention
                    </p>
                  </div>
                  <div className="relative">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    {pulseAnimation && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Compliance Score</p>
                    <p className="text-2xl font-bold text-green-600">{realTimeStats.complianceScore}%</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{Math.floor(Math.random() * 5) + 1}% this week
                    </p>
                  </div>
                  <div className="relative">
                    <Target className="w-8 h-8 text-green-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Live Activity Feed */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Activity Feed
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-500">Live</span>
                </div>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {liveUpdates.map((update, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg bg-surface border transition-all duration-500 ${
                      index === 0 ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-text-primary">{update}</span>
                    <span className="text-xs text-text-muted ml-auto">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Audits */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Recent Audits</h2>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {audits.slice(0, 3).map((audit) => (
                  <div key={audit.system_id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(audit.compliance_status)}
                      <div>
                        <h3 className="font-semibold text-text-primary">{audit.audit_summary.system_name}</h3>
                        <p className="text-sm text-text-muted">{audit.system_description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getRiskColor(audit.risk_level)}>
                        {audit.risk_level}
                      </Badge>
                      <span className="text-sm text-text-muted">{audit.key_findings} findings</span>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Compliance Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Status Distribution</h3>
                <div className="space-y-3">
                  {['compliant', 'partial', 'non_compliant'].map((status) => {
                    const count = audits.filter(a => a.compliance_status === status).length;
                    const percentage = audits.length > 0 ? (count / audits.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-text-muted capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500 ease-out" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Level Distribution</h3>
                <div className="space-y-3">
                  {['minimal', 'limited', 'high', 'unacceptable'].map((risk) => {
                    const count = audits.filter(a => a.risk_level === risk).length;
                    const percentage = audits.length > 0 ? (count / audits.length) * 100 : 0;
                    return (
                      <div key={risk} className="flex items-center justify-between">
                        <span className="text-text-muted capitalize">{risk}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ease-out ${
                                risk === 'minimal' ? 'bg-green-500' :
                                risk === 'limited' ? 'bg-blue-500' :
                                risk === 'high' ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Interactive Demo Tab */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Interactive Compliance Demo
                </h2>
                <Badge variant="green" className="px-3 py-1">
                  <Activity className="w-4 h-4 mr-1" />
                  Live Demo
                </Badge>
              </div>
              
              <p className="text-text-muted mb-6">
                Experience a real-time compliance audit process. Watch as our AI system analyzes 
                your AI application for EU AI Act and GDPR compliance requirements.
              </p>

              {/* Demo Controls */}
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  onClick={startInteractiveDemo} 
                  disabled={auditProgress.isRunning}
                  className="flex items-center gap-2"
                >
                  {auditProgress.isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {auditProgress.isRunning ? 'Running Audit...' : 'Start Interactive Demo'}
                </Button>
                
                {auditProgress.isRunning && (
                  <Button 
                    variant="outline" 
                    onClick={() => setAuditProgress(prev => ({ ...prev, isRunning: false }))}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>

              {/* Progress Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      {auditProgress.isRunning && (
                        <div className="relative">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          {scanningAnimation && (
                            <div className="absolute inset-0 w-5 h-5 border-2 border-primary/30 rounded-full animate-ping"></div>
                          )}
                        </div>
                      )}
                      Audit Progress
                    </h3>
                    <span className="text-sm text-text-muted flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Step {auditProgress.currentStep} of {auditProgress.totalSteps}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={auditProgress.progress} className="h-3" />
                    {auditProgress.isRunning && (
                      <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-text-muted mt-2 flex items-center gap-2">
                    {auditProgress.isRunning && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    {auditProgress.stepName}
                  </p>
                </div>

                {/* Audit Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auditSteps.map((step, index) => {
                    const isCompleted = auditProgress.completedSteps.includes(step.name);
                    const isCurrent = auditProgress.currentStep === index + 1;
                    const Icon = step.icon;
                    
                    return (
                      <div 
                        key={step.name}
                        className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                          isCompleted 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20' 
                            : isCurrent 
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                            : 'border-border bg-surface'
                        } ${isCurrent ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500 text-white shadow-lg' 
                              : isCurrent 
                              ? 'bg-primary text-white shadow-lg animate-pulse' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 animate-bounce" />
                            ) : isCurrent ? (
                              <div className="relative">
                                <Icon className="w-4 h-4" />
                                <div className="absolute inset-0 w-4 h-4 border-2 border-white/30 rounded-full animate-ping"></div>
                              </div>
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <h4 className="font-semibold text-text-primary">{step.name}</h4>
                        </div>
                        <p className="text-sm text-text-muted">{step.description}</p>
                        {isCurrent && auditProgress.isRunning && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 text-primary">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Processing...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current Finding Display */}
                {auditProgress.currentFinding && (
                  <Card className="p-6 border-l-4 border-l-primary">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold text-text-primary">Current Finding</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-text-primary">{auditProgress.currentFinding.description}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getRiskColor(auditProgress.currentFinding.risk_level)}>
                            {auditProgress.currentFinding.risk_level} risk
                          </Badge>
                          <Badge variant="outline">
                            {auditProgress.currentFinding.regulation}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-text-muted">
                        <p><strong>Recommendation:</strong> {auditProgress.currentFinding.recommendations[0]}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Demo Results */}
                {auditProgress.progress === 100 && !auditProgress.isRunning && (
                  <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Demo Completed!</h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      The interactive audit has completed successfully. You can now explore the detailed findings 
                      and compliance recommendations in the other tabs.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setActiveTab('audits')}>
                        <FileText className="w-4 h-4 mr-2" />
                        View All Audits
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('evidence')}>
                        <FileCheck className="w-4 h-4 mr-2" />
                        Review Evidence
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Recent Audits Tab */}
        {activeTab === 'audits' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Audit History</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Audit
                </Button>
              </div>
              <div className="space-y-4">
                {audits.map((audit) => (
                  <div key={audit.system_id} className="border border-border rounded-lg p-6 hover:bg-surface/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(audit.compliance_status)}
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">{audit.audit_summary.system_name}</h3>
                          <p className="text-text-muted">{audit.system_description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-text-muted">
                              Last audit: {new Date(audit.audit_summary.audit_date).toLocaleDateString()}
                            </span>
                            <Badge className={getRiskColor(audit.risk_level)}>
                              {audit.risk_level} risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-text-primary">{audit.key_findings}</div>
                        <div className="text-sm text-text-muted">findings</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-600">{audit.audit_summary.compliant_findings}</div>
                        <div className="text-sm text-text-muted">Compliant</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-yellow-600">{audit.audit_summary.unknown_findings}</div>
                        <div className="text-sm text-text-muted">Unknown</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">{audit.audit_summary.non_compliant_findings}</div>
                        <div className="text-sm text-text-muted">Non-compliant</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Compliance Findings</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div key={finding.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-text-primary">{finding.description}</h3>
                          <Badge className={getRiskColor(finding.risk_level)}>
                            {finding.risk_level}
                          </Badge>
                          <Badge variant="outline">
                            {finding.regulation}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-muted mb-3">
                          <strong>Obligation:</strong> {finding.obligation} | 
                          <strong> Category:</strong> {finding.category}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-text-muted">
                            Evidence: {finding.evidence.length} files
                          </span>
                          <span className="text-text-muted">
                            Recommendations: {finding.recommendations.length} items
                          </span>
                          <span className="text-text-muted">
                            {new Date(finding.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleFindingExpansion(finding.id)}
                          className="flex items-center gap-2 mt-3 text-primary hover:text-primary-600 transition-colors"
                        >
                          {expandedFindings.has(finding.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {expandedFindings.has(finding.id) ? 'Hide Details' : 'Show Details'}
                        </button>

                        {expandedFindings.has(finding.id) && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <h4 className="font-medium text-text-primary mb-2">Evidence Files</h4>
                              <div className="flex flex-wrap gap-2">
                                {finding.evidence.map((file, index) => (
                                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {file}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-text-primary mb-2">Recommendations</h4>
                              <ul className="space-y-1">
                                {finding.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-text-muted flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {finding.evidence_wishlist.length > 0 && (
                              <div>
                                <h4 className="font-medium text-text-primary mb-2">Missing Evidence</h4>
                                <div className="flex flex-wrap gap-2">
                                  {finding.evidence_wishlist.map((item, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {getStatusIcon(finding.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
          {/* Quick Start Button */}
          <Button
            onClick={startInteractiveDemo}
            disabled={auditProgress.isRunning}
            className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
              auditProgress.isRunning 
                ? 'bg-primary/80 hover:bg-primary/90' 
                : 'bg-primary hover:bg-primary/90 hover:scale-110'
            }`}
          >
            {auditProgress.isRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          
          {/* Live Status Indicator */}
          <div className="bg-surface border border-border rounded-full p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                auditProgress.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs text-text-muted">
                {auditProgress.isRunning ? 'Live' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      {auditProgress.isRunning && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-blue-500/5 rounded-full animate-pulse delay-2000"></div>
        </div>
      )}
    </div>
  );
}