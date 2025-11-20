'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  Download,
  FileText,
  Lock,
  Key,
  UserCheck,
  FileCheck,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Database,
  Server,
  Cloud,
  Archive,
  Link,
  ExternalLink,
  Target,
  Layers,
  Cpu,
  HardDrive,
  Network,
  Globe,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Zap,
  Brain,
  Microscope,
  TestTube,
  FlaskConical,
  Beaker,
  Atom,
  CircuitBoard,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Router,
  Wifi,
  Bluetooth,
  Signal,
  Radio,
  Satellite,
  Radar,
  Telescope
} from 'lucide-react';

interface ComplianceCheck {
  id: string;
  name: string;
  type: 'privacy' | 'security' | 'quality' | 'regulatory';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  description: string;
  details?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  source: string;
  impact?: string;
  remediation?: string;
  evidence?: string[];
  auditor?: string;
  nextReview?: Date;
}

interface ComplianceReport {
  id: string;
  name: string;
  type: 'gdpr' | 'eu_ai_act' | 'data_quality' | 'security' | 'custom';
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  checks: ComplianceCheck[];
  overallScore: number;
  summary: string;
  recommendations: string[];
  attachments?: string[];
}

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
  lastUpdated: Date;
}

interface ComplianceDashboardProps {
  checks: ComplianceCheck[];
  reports: ComplianceReport[];
  metrics: ComplianceMetric[];
  onGenerateReport: () => void;
  onScheduleAudit: () => void;
  onViewDetails: (check: ComplianceCheck) => void;
  onRemediate: (check: ComplianceCheck) => void;
}

export default function ComplianceDashboard({
  checks,
  reports,
  metrics,
  onGenerateReport,
  onScheduleAudit,
  onViewDetails,
  onRemediate
}: ComplianceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checks' | 'reports' | 'metrics'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredChecks = checks.filter(check => {
    const matchesSearch = check.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         check.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         check.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || check.status === filterStatus;
    const matchesType = filterType === 'all' || check.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || check.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesType && matchesSeverity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green';
      case 'failed': return 'red';
      case 'warning': return 'yellow';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'privacy': return Shield;
      case 'security': return Lock;
      case 'quality': return CheckCircle;
      case 'regulatory': return FileCheck;
      default: return Info;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Activity;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'gdpr': return 'blue';
      case 'eu_ai_act': return 'purple';
      case 'data_quality': return 'green';
      case 'security': return 'red';
      case 'custom': return 'gray';
      default: return 'gray';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'in_review': return 'yellow';
      case 'rejected': return 'red';
      case 'draft': return 'gray';
      default: return 'gray';
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onGenerateReport();
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAudit = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onScheduleAudit();
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (check: ComplianceCheck) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onViewDetails(check);
    } finally {
      setLoading(false);
    }
  };

  const handleRemediate = async (check: ComplianceCheck) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRemediate(check);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overview statistics
  const totalChecks = checks.length;
  const passedChecks = checks.filter(check => check.status === 'passed').length;
  const failedChecks = checks.filter(check => check.status === 'failed').length;
  const warningChecks = checks.filter(check => check.status === 'warning').length;
  const pendingChecks = checks.filter(check => check.status === 'pending').length;
  const complianceRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Compliance Dashboard</h3>
          <p className="text-gray-400 text-sm">Monitor compliance status, generate reports, and manage audits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleScheduleAudit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            Schedule Audit
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'checks', label: 'Compliance Checks', icon: CheckCircle },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'metrics', label: 'Metrics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Compliance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{complianceRate}%</p>
                  <p className="text-sm text-gray-300">Compliance Rate</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{passedChecks}</p>
                  <p className="text-sm text-gray-300">Passed Checks</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{failedChecks}</p>
                  <p className="text-sm text-gray-300">Failed Checks</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{warningChecks}</p>
                  <p className="text-sm text-gray-300">Warnings</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Compliance by Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Compliance by Type</h4>
              <div className="space-y-4">
                {['privacy', 'security', 'quality', 'regulatory'].map((type) => {
                  const typeChecks = checks.filter(check => check.type === type);
                  const typePassed = typeChecks.filter(check => check.status === 'passed').length;
                  const typeRate = typeChecks.length > 0 ? Math.round((typePassed / typeChecks.length) * 100) : 0;
                  const TypeIcon = getTypeIcon(type);
                  
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-white capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${typeRate}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{typeRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Compliance Activity</h4>
              <div className="space-y-3">
                {checks.slice(0, 5).map((check) => {
                  const TypeIcon = getTypeIcon(check.type);
                  return (
                    <div key={check.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        check.status === 'passed' ? 'bg-green-600' :
                        check.status === 'failed' ? 'bg-red-600' :
                        check.status === 'warning' ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{check.name}</p>
                        <p className="text-gray-400 text-xs">{check.timestamp.toLocaleDateString()}</p>
                      </div>
                      <Badge variant={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Compliance Metrics */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Key Compliance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.slice(0, 6).map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend);
                return (
                  <div key={metric.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{metric.name}</span>
                      <Badge variant={getMetricStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                      <span className="text-gray-400 text-sm">{metric.unit}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Threshold: {metric.threshold}{metric.unit}</span>
                        <TrendIcon className={`w-3 h-3 ${getTrendColor(metric.trend)}`} />
                      </div>
                      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'checks' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search compliance checks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                  <option value="pending">Pending</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="privacy">Privacy</option>
                  <option value="security">Security</option>
                  <option value="quality">Quality</option>
                  <option value="regulatory">Regulatory</option>
                </select>
                
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Showing {filteredChecks.length} of {checks.length} compliance checks
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </Card>

          {/* Compliance Checks List */}
          <div className="space-y-4">
            {filteredChecks.map((check) => {
              const TypeIcon = getTypeIcon(check.type);
              const isExpanded = expandedCheck === check.id;
              
              return (
                <Card key={check.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        check.status === 'passed' ? 'bg-green-600' :
                        check.status === 'failed' ? 'bg-red-600' :
                        check.status === 'warning' ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}>
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-semibold text-white">{check.name}</h4>
                          <Badge variant={getStatusColor(check.status)}>
                            {check.status}
                          </Badge>
                          <Badge variant={getSeverityColor(check.severity)}>
                            {check.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{check.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{check.category}</span>
                          <span>•</span>
                          <span>{check.source}</span>
                          <span>•</span>
                          <span>{check.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(check)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {check.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemediate(check)}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Settings className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-4">Check Details</h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Type</span>
                              <span className="text-white text-sm capitalize">{check.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Category</span>
                              <span className="text-white text-sm">{check.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Source</span>
                              <span className="text-white text-sm">{check.source}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Severity</span>
                              <Badge variant={getSeverityColor(check.severity)}>
                                {check.severity}
                              </Badge>
                            </div>
                            {check.auditor && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Auditor</span>
                                <span className="text-white text-sm">{check.auditor}</span>
                              </div>
                            )}
                            {check.nextReview && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Next Review</span>
                                <span className="text-white text-sm">{check.nextReview.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-4">Additional Information</h5>
                          <div className="space-y-3">
                            {check.details && (
                              <div>
                                <span className="text-gray-400 text-sm">Details</span>
                                <p className="text-white text-sm mt-1">{check.details}</p>
                              </div>
                            )}
                            {check.impact && (
                              <div>
                                <span className="text-gray-400 text-sm">Impact</span>
                                <p className="text-white text-sm mt-1">{check.impact}</p>
                              </div>
                            )}
                            {check.remediation && (
                              <div>
                                <span className="text-gray-400 text-sm">Remediation</span>
                                <p className="text-white text-sm mt-1">{check.remediation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {check.evidence && check.evidence.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-sm font-semibold text-white mb-4">Evidence</h5>
                          <div className="space-y-2">
                            {check.evidence.map((evidence, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-white text-sm">{evidence}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Compliance Reports</h4>
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-white">{report.name}</h5>
                    <p className="text-gray-400 text-sm">{report.type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <Badge variant={getReportStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Overall Score</span>
                    <span className="text-white text-sm">{report.overallScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Checks</span>
                    <span className="text-white text-sm">{report.checks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Created</span>
                    <span className="text-white text-sm">{report.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">Compliance Metrics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => {
              const TrendIcon = getTrendIcon(metric.trend);
              return (
                <Card key={metric.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="text-lg font-semibold text-white">{metric.name}</h5>
                      <p className="text-gray-400 text-sm">{metric.category}</p>
                    </div>
                    <Badge variant={getMetricStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-white">{metric.value}</span>
                      <span className="text-gray-400 text-sm">{metric.unit}</span>
                      <TrendIcon className={`w-5 h-5 ${getTrendColor(metric.trend)}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Threshold: {metric.threshold}{metric.unit}</span>
                        <span>Last updated: {metric.lastUpdated.toLocaleDateString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm">{metric.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component
function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
