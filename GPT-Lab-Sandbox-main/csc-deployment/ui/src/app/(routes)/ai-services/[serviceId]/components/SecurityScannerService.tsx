'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Progress } from '@/components/Progress';
import {
  Shield,
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
  Plus,
  Bug,
  Wrench,
  ShieldCheck,
  AlertOctagon,
  Search,
  Code,
  Server,
  Network,
  Key,
  LockIcon,
  EyeOff,
  FileText,
  GitBranch,
  Layers,
  Workflow,
  Timer,
  Flame,
  Package,
  Sparkles as SparklesIcon
} from 'lucide-react';

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: string;
  layer: string;
  category: string;
  file_path?: string;
  line_number?: number;
  cve_id?: string;
  cvss_score: number;
  exploitability: string;
  impact: string;
  remediation: string;
  auto_fixable: boolean;
  fix_code?: string;
  fix_instructions: string[];
  references: string[];
  discovered_at: string;
  status: string;
}

interface SecurityScan {
  scan_id: string;
  target: string;
  scan_type: string;
  started_at: string;
  completed_at?: string;
  total_vulnerabilities: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  security_score: number;
  risk_level: string;
  auto_fixes_applied: number;
  manual_fixes_required: number;
  vulnerabilities: Vulnerability[];
}

interface SecurityAnalytics {
  security_score_trend: number[];
  vulnerability_trends: {
    total: number[];
    critical: number[];
    high: number[];
    medium: number[];
  };
  improvement_rate: number;
  compliance_metrics: {
    owasp_top_10: number;
    nist_framework: number;
    iso27001: number;
    soc2: number;
  };
  risk_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  auto_fix_success_rate: number;
  average_fix_time: number;
}

export default function SecurityScannerService() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState({
    currentStep: 0,
    totalSteps: 6,
    stepName: 'Ready to start',
    progress: 0,
    isRunning: false,
    completedSteps: [] as string[]
  });
  const [showDemo, setShowDemo] = useState(false);
  const [expandedVulns, setExpandedVulns] = useState<Set<string>>(new Set());
  const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [scanningAnimation, setScanningAnimation] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalScans: 12,
    activeScans: 2,
    criticalAlerts: 3,
    securityScore: 78
  });

  const scanSteps = [
    { name: 'Code Analysis', description: 'Scanning source code for vulnerabilities', icon: Code },
    { name: 'Dependency Check', description: 'Analyzing third-party packages and libraries', icon: Package },
    { name: 'Infrastructure Scan', description: 'Checking server and network configurations', icon: Server },
    { name: 'Runtime Analysis', description: 'Monitoring application behavior and security', icon: Activity },
    { name: 'Data Protection', description: 'Verifying data encryption and privacy measures', icon: Shield },
    { name: 'Compliance Check', description: 'Validating security standards and regulations', icon: FileCheck }
  ];

  const demoTargets = [
    {
      id: 'web_app',
      name: 'E-commerce Web Application',
      description: 'React-based online store with payment processing',
      riskLevel: 'high',
      securityScore: 45,
      vulnerabilities: 23,
      lastScan: '2024-01-15'
    },
    {
      id: 'api_service',
      name: 'Microservices API',
      description: 'Node.js backend with multiple endpoints',
      riskLevel: 'critical',
      securityScore: 25,
      vulnerabilities: 18,
      lastScan: '2024-01-14'
    },
    {
      id: 'mobile_app',
      name: 'Mobile Banking App',
      description: 'React Native mobile application',
      riskLevel: 'medium',
      securityScore: 75,
      vulnerabilities: 8,
      lastScan: '2024-01-16'
    }
  ];

  useEffect(() => {
    loadDemoData();
    
    // Only start live updates after component is mounted (client-side only)
    const timer = setTimeout(() => {
      // Live updates simulation
      const liveUpdateInterval = setInterval(() => {
        const updates = [
          "🔍 Scanning code for security vulnerabilities...",
          "🛡️ Analyzing dependency security...",
          "⚡ Checking infrastructure configurations...",
          "🔐 Validating encryption implementations...",
          "📊 Updating security metrics...",
          "🔔 New critical vulnerability detected...",
          "✅ Security fix applied successfully...",
          "📈 Security score improved..."
        ];
        
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        setLiveUpdates(prev => [randomUpdate, ...prev.slice(0, 4)]);
        
        // Update real-time stats with smaller increments to avoid hydration issues
        setRealTimeStats(prev => ({
          totalScans: prev.totalScans + (Math.random() > 0.7 ? 1 : 0),
          activeScans: Math.floor(Math.random() * 3) + 1,
          criticalAlerts: Math.floor(Math.random() * 5),
          securityScore: Math.floor(Math.random() * 10) + 75
        }));
      }, 4000);

      // Pulse animation for critical alerts
      const pulseInterval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 3000);

      // Store intervals for cleanup
      (window as any).securityScannerIntervals = { liveUpdateInterval, pulseInterval };
    }, 100);

    return () => {
      if ((window as any).securityScannerIntervals) {
        clearInterval((window as any).securityScannerIntervals.liveUpdateInterval);
        clearInterval((window as any).securityScannerIntervals.pulseInterval);
      }
      clearTimeout(timer);
    };
  }, []);

  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load demo scans
      const demoScans: SecurityScan[] = [
        {
          scan_id: 'scan_001',
          target: 'E-commerce Web Application',
          scan_type: 'comprehensive',
          started_at: '2024-01-15T10:00:00Z',
          completed_at: '2024-01-15T10:45:00Z',
          total_vulnerabilities: 23,
          critical_count: 3,
          high_count: 8,
          medium_count: 7,
          low_count: 4,
          info_count: 1,
          security_score: 45,
          risk_level: 'HIGH',
          auto_fixes_applied: 5,
          manual_fixes_required: 18,
          vulnerabilities: []
        },
        {
          scan_id: 'scan_002',
          target: 'Microservices API',
          scan_type: 'quick',
          started_at: '2024-01-14T14:30:00Z',
          completed_at: '2024-01-14T14:50:00Z',
          total_vulnerabilities: 18,
          critical_count: 5,
          high_count: 6,
          medium_count: 4,
          low_count: 2,
          info_count: 1,
          security_score: 25,
          risk_level: 'CRITICAL',
          auto_fixes_applied: 2,
          manual_fixes_required: 16,
          vulnerabilities: []
        }
      ];
      
      setScans(demoScans);
      
      // Load demo analytics
      const demoAnalytics: SecurityAnalytics = {
        security_score_trend: [30, 35, 40, 45, 50, 55, 60],
        vulnerability_trends: {
          total: [45, 40, 35, 30, 25, 20, 15],
          critical: [8, 7, 6, 5, 4, 3, 2],
          high: [15, 12, 10, 8, 6, 4, 3],
          medium: [12, 10, 8, 6, 4, 3, 2]
        },
        improvement_rate: 25.5,
        compliance_metrics: {
          owasp_top_10: 85,
          nist_framework: 78,
          iso27001: 72,
          soc2: 88
        },
        risk_distribution: {
          critical: 5,
          high: 12,
          medium: 8,
          low: 3
        },
        auto_fix_success_rate: 92,
        average_fix_time: 4.5
      };
      
      setAnalytics(demoAnalytics);
      
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSecurityScan = async () => {
    setShowDemo(true);
    setScanningAnimation(true);
    setScanProgress({
      currentStep: 0,
      totalSteps: 6,
      stepName: 'Starting security scan...',
      progress: 0,
      isRunning: true,
      completedSteps: []
    });

    // Add live update
    setLiveUpdates(prev => ["🚀 Starting comprehensive security scan...", ...prev.slice(0, 4)]);

    for (let step = 0; step < scanSteps.length; step++) {
      // Update progress
      setScanProgress(prev => ({
        ...prev,
        currentStep: step + 1,
        stepName: scanSteps[step].name,
        progress: ((step + 1) / scanSteps.length) * 100,
        completedSteps: [...prev.completedSteps, scanSteps[step].name]
      }));

      // Add live update for each step
      setLiveUpdates(prev => [`⚡ ${scanSteps[step].name} in progress...`, ...prev.slice(0, 4)]);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Show vulnerabilities found during the process
      if (step === 2) {
        setLiveUpdates(prev => ["🔍 Found 3 critical vulnerabilities in infrastructure...", ...prev.slice(0, 4)]);
      } else if (step === 4) {
        setLiveUpdates(prev => ["🛡️ Discovered 5 data protection issues...", ...prev.slice(0, 4)]);
      }
    }

    setScanningAnimation(false);
    // Complete the scan
    setScanProgress(prev => ({
      ...prev,
      isRunning: false,
      stepName: 'Security scan completed!',
      progress: 100
    }));
    
    setLiveUpdates(prev => ["✅ Security scan completed successfully!", ...prev.slice(0, 4)]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'code': return <Code className="w-4 h-4" />;
      case 'infrastructure': return <Server className="w-4 h-4" />;
      case 'dependencies': return <Package className="w-4 h-4" />;
      case 'runtime': return <Activity className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">AI-Powered Security Scanner</h1>
              <p className="text-text-muted">Comprehensive vulnerability detection and automated remediation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={startSecurityScan} disabled={scanProgress.isRunning}>
              {scanProgress.isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {scanProgress.isRunning ? 'Scanning...' : 'Start Security Scan'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-surface p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'scanner', label: 'Security Scanner', icon: Search },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Bug },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={`p-6 transition-all duration-300 ${pulseAnimation ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Security Scans</p>
                    <p className="text-2xl font-bold text-text-primary">{realTimeStats.totalScans}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      +{Math.floor(Math.random() * 2) + 1} today
                    </p>
                  </div>
                  <div className="relative">
                    <Shield className="w-8 h-8 text-primary" />
                    {scanningAnimation && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Active Scans</p>
                    <p className="text-2xl font-bold text-blue-600">{realTimeStats.activeScans}</p>
                    <p className="text-xs text-blue-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Running now
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-8 h-8 text-blue-600" />
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
                      <AlertOctagon className="w-3 h-3" />
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
                    <p className="text-sm text-text-muted">Security Score</p>
                    <p className="text-2xl font-bold text-green-600">{realTimeStats.securityScore}%</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{Math.floor(Math.random() * 8) + 2}% this week
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
                  Live Security Activity
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

            {/* Recent Scans */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Recent Security Scans</h2>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </div>
              <div className="space-y-4">
                {scans.map((scan) => (
                  <div key={scan.scan_id} className="p-4 border border-border rounded-lg hover:bg-surface transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <h3 className="font-semibold text-text-primary">{scan.target}</h3>
                          <p className="text-sm text-text-muted">
                            {new Date(scan.started_at).toLocaleDateString()} • {scan.scan_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={scan.risk_level === 'CRITICAL' ? 'red' : scan.risk_level === 'HIGH' ? 'yellow' : 'green'}>
                          {scan.risk_level}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-text-muted">Security Score</p>
                        <p className="font-semibold text-text-primary">{scan.security_score}%</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Total Issues</p>
                        <p className="font-semibold text-text-primary">{scan.total_vulnerabilities}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Auto-Fixable</p>
                        <p className="font-semibold text-green-600">{scan.auto_fixes_applied}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Manual Fix</p>
                        <p className="font-semibold text-yellow-600">{scan.manual_fixes_required}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Security Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Interactive Security Scanner
                </h2>
                <Badge variant="green" className="px-3 py-1">
                  <Activity className="w-4 h-4 mr-1" />
                  Live Scanner
                </Badge>
              </div>
              
              <p className="text-text-muted mb-6">
                Experience real-time security vulnerability detection. Watch as our AI system scans 
                your application for security issues across multiple layers and provides automated fixes.
              </p>

              {/* Demo Controls */}
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  onClick={startSecurityScan} 
                  disabled={scanProgress.isRunning}
                  className="flex items-center gap-2"
                >
                  {scanProgress.isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {scanProgress.isRunning ? 'Scanning...' : 'Start Security Scan'}
                </Button>
                
                {scanProgress.isRunning && (
                  <Button 
                    variant="outline" 
                    onClick={() => setScanProgress(prev => ({ ...prev, isRunning: false }))}
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
                      {scanProgress.isRunning && (
                        <div className="relative">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          {scanningAnimation && (
                            <div className="absolute inset-0 w-5 h-5 border-2 border-primary/30 rounded-full animate-ping"></div>
                          )}
                        </div>
                      )}
                      Security Scan Progress
                    </h3>
                    <span className="text-sm text-text-muted flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Step {scanProgress.currentStep} of {scanProgress.totalSteps}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={scanProgress.progress} className="h-3" />
                    {scanProgress.isRunning && (
                      <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-text-muted mt-2 flex items-center gap-2">
                    {scanProgress.isRunning && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    {scanProgress.stepName}
                  </p>
                </div>

                {/* Scan Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scanSteps.map((step, index) => {
                    const isCompleted = scanProgress.completedSteps.includes(step.name);
                    const isCurrent = scanProgress.currentStep === index + 1;
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
                        {isCurrent && scanProgress.isRunning && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Vulnerabilities Tab */}
        {activeTab === 'vulnerabilities' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                  <Bug className="w-6 h-6 text-primary" />
                  Security Vulnerabilities
                </h2>
                <div className="flex items-center gap-3">
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

              {/* Vulnerability Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-text-muted">Critical</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">8</div>
                  <div className="text-sm text-text-muted">High</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">12</div>
                  <div className="text-sm text-text-muted">Medium</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-text-muted">Low</div>
                </Card>
              </div>

              {/* Vulnerability List */}
              <div className="space-y-4">
                {[
                  {
                    id: 'vuln-001',
                    title: 'SQL Injection in User Authentication',
                    description: 'User input directly concatenated into SQL query without sanitization',
                    severity: 'critical',
                    layer: 'code',
                    category: 'Injection',
                    file_path: 'src/auth/login.js',
                    line_number: 45,
                    cve_id: 'CVE-2024-1234',
                    cvss_score: 9.2,
                    auto_fixable: true,
                    discovered_at: '2024-01-15T10:30:00Z'
                  },
                  {
                    id: 'vuln-002',
                    title: 'Hardcoded API Keys in Configuration',
                    description: 'Sensitive API keys found in configuration files',
                    severity: 'critical',
                    layer: 'code',
                    category: 'Secrets',
                    file_path: 'config/api.js',
                    line_number: 12,
                    cve_id: null,
                    cvss_score: 8.8,
                    auto_fixable: false,
                    discovered_at: '2024-01-15T10:25:00Z'
                  },
                  {
                    id: 'vuln-003',
                    title: 'Cross-Site Scripting (XSS) Vulnerability',
                    description: 'User input reflected in HTML without proper encoding',
                    severity: 'high',
                    layer: 'code',
                    category: 'XSS',
                    file_path: 'src/components/UserProfile.tsx',
                    line_number: 78,
                    cve_id: 'CVE-2024-1235',
                    cvss_score: 7.5,
                    auto_fixable: true,
                    discovered_at: '2024-01-15T10:20:00Z'
                  },
                  {
                    id: 'vuln-004',
                    title: 'Exposed Database Port',
                    description: 'Database port 5432 exposed to public internet',
                    severity: 'high',
                    layer: 'infrastructure',
                    category: 'Network',
                    file_path: null,
                    line_number: null,
                    cve_id: null,
                    cvss_score: 7.8,
                    auto_fixable: true,
                    discovered_at: '2024-01-15T10:15:00Z'
                  },
                  {
                    id: 'vuln-005',
                    title: 'Outdated Dependencies with Known CVEs',
                    description: 'Multiple packages with known security vulnerabilities',
                    severity: 'medium',
                    layer: 'dependencies',
                    category: 'Dependencies',
                    file_path: 'package.json',
                    line_number: null,
                    cve_id: 'CVE-2024-1236',
                    cvss_score: 6.2,
                    auto_fixable: true,
                    discovered_at: '2024-01-15T10:10:00Z'
                  }
                ].map((vuln) => (
                  <Card key={vuln.id} className="p-4 border border-border hover:bg-surface transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={vuln.severity === 'critical' ? 'red' : vuln.severity === 'high' ? 'yellow' : 'gray'}>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-text-muted">CVSS: {vuln.cvss_score}</span>
                          {vuln.cve_id && (
                            <span className="text-sm text-blue-600 font-mono">{vuln.cve_id}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-text-primary mb-1">{vuln.title}</h3>
                        <p className="text-text-muted text-sm mb-2">{vuln.description}</p>
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            {getLayerIcon(vuln.layer)}
                            {vuln.layer}
                          </span>
                          <span>{vuln.category}</span>
                          {vuln.file_path && (
                            <span className="font-mono">{vuln.file_path}:{vuln.line_number}</span>
                          )}
                          <span>{new Date(vuln.discovered_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {vuln.auto_fixable ? (
                          <Button size="sm" variant="outline">
                            <Wrench className="w-4 h-4 mr-1" />
                            Auto-Fix
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Manual Fix
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                Security Analytics Dashboard
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Score Trend */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Security Score Trend</h3>
                  <div className="h-64 flex items-center justify-center bg-surface rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-text-muted">Security score improving over time</p>
                      <p className="text-2xl font-bold text-green-600 mt-2">+{analytics.improvement_rate}%</p>
                    </div>
                  </div>
                </Card>

                {/* Vulnerability Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Vulnerability Distribution</h3>
                  <div className="h-64 flex items-center justify-center bg-surface rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-text-muted">Risk level distribution</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-red-600 font-bold">{analytics.risk_distribution.critical}</p>
                          <p className="text-sm text-text-muted">Critical</p>
                        </div>
                        <div className="text-center">
                          <p className="text-orange-600 font-bold">{analytics.risk_distribution.high}</p>
                          <p className="text-sm text-text-muted">High</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Compliance Metrics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Metrics</h3>
                  <div className="space-y-4">
                    {Object.entries(analytics.compliance_metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-text-muted capitalize">{key.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{width: `${value}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Auto-Fix Success Rate */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Auto-Fix Performance</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{analytics.auto_fix_success_rate}%</div>
                    <p className="text-text-muted mb-4">Success Rate</p>
                    <div className="text-sm text-text-muted">
                      Average fix time: {analytics.average_fix_time} hours
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Security Compliance Dashboard
              </h2>
              
              {/* Compliance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                  <div className="text-text-muted">Overall Compliance</div>
                  <div className="text-sm text-green-600 mt-1">+5% this month</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                  <div className="text-text-muted">Standards Met</div>
                  <div className="text-sm text-blue-600 mt-1">Out of 15 total</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                  <div className="text-text-muted">Pending Reviews</div>
                  <div className="text-sm text-orange-600 mt-1">Due this week</div>
                </Card>
              </div>

              {/* Compliance Standards */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-text-primary">Compliance Standards</h3>
                
                {[
                  {
                    name: 'OWASP Top 10',
                    description: 'Web application security risks',
                    compliance: 90,
                    status: 'compliant',
                    lastAudit: '2024-01-10',
                    nextAudit: '2024-04-10',
                    issues: 2
                  },
                  {
                    name: 'NIST Cybersecurity Framework',
                    description: 'Comprehensive security controls',
                    compliance: 78,
                    status: 'partial',
                    lastAudit: '2024-01-05',
                    nextAudit: '2024-03-05',
                    issues: 5
                  },
                  {
                    name: 'ISO 27001',
                    description: 'Information security management',
                    compliance: 72,
                    status: 'partial',
                    lastAudit: '2024-01-01',
                    nextAudit: '2024-02-01',
                    issues: 8
                  },
                  {
                    name: 'SOC 2 Type II',
                    description: 'Service organization controls',
                    compliance: 88,
                    status: 'compliant',
                    lastAudit: '2024-01-15',
                    nextAudit: '2024-07-15',
                    issues: 1
                  },
                  {
                    name: 'GDPR Compliance',
                    description: 'Data protection regulation',
                    compliance: 95,
                    status: 'compliant',
                    lastAudit: '2024-01-12',
                    nextAudit: '2024-04-12',
                    issues: 0
                  },
                  {
                    name: 'EU AI Act',
                    description: 'AI system compliance',
                    compliance: 65,
                    status: 'non-compliant',
                    lastAudit: '2024-01-08',
                    nextAudit: '2024-02-08',
                    issues: 12
                  }
                ].map((standard) => (
                  <Card key={standard.name} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary">{standard.name}</h4>
                        <p className="text-text-muted text-sm">{standard.description}</p>
                      </div>
                      <Badge variant={
                        standard.status === 'compliant' ? 'green' : 
                        standard.status === 'partial' ? 'yellow' : 'red'
                      }>
                        {standard.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-text-primary">{standard.compliance}%</div>
                        <div className="text-sm text-text-muted">Compliance Score</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-text-primary">{standard.issues}</div>
                        <div className="text-sm text-text-muted">Open Issues</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          {new Date(standard.lastAudit).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-text-muted">Last Audit</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          {new Date(standard.nextAudit).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-text-muted">Next Audit</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full ${
                          standard.compliance >= 90 ? 'bg-green-500' :
                          standard.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{width: `${standard.compliance}%`}}
                      ></div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        Generate Report
                      </Button>
                      {standard.issues > 0 && (
                        <Button size="sm" variant="outline">
                          <Wrench className="w-4 h-4 mr-1" />
                          Fix Issues
                        </Button>
                      )}
                    </div>
                  </Card>
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
            onClick={startSecurityScan}
            disabled={scanProgress.isRunning}
            className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
              scanProgress.isRunning 
                ? 'bg-primary/80 hover:bg-primary/90' 
                : 'bg-primary hover:bg-primary/90 hover:scale-110'
            }`}
          >
            {scanProgress.isRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </Button>
          
          {/* Live Status Indicator */}
          <div className="bg-surface border border-border rounded-full p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                scanProgress.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs text-text-muted">
                {scanProgress.isRunning ? 'Scanning' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      {scanProgress.isRunning && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-blue-500/5 rounded-full animate-pulse delay-2000"></div>
        </div>
      )}
    </div>
  );
}
