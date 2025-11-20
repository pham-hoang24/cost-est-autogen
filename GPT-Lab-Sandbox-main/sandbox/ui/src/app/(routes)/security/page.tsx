'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getSecurityAccessLevel, 
  getSecurityDashboardConfig, 
  filterSecurityData,
  canAccessSecurityFeature 
} from '@/lib/securityAccess';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Lock,
  Users,
  Activity,
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Target,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Server,
  Database,
  Network,
  Cpu,
  HardDrive,
  Wifi,
  MapPin,
  Timer,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface SecurityDashboard {
  recent_events: any[];
  active_alerts: any[];
  statistics: any;
  suspicious_ips: any[];
  compliance_status: any;
}

interface SecurityHealth {
  overall_score: number;
  checks: any;
  recommendations: string[];
}

// Mock data for industrial-standard visualizations
const generateMockSecurityData = () => {
  const now = new Date();
  const threatTrendData = Array.from({ length: 24 }, (_, i) => ({
    time: `${23 - i}:00`,
    threats: Math.floor(Math.random() * 50) + 10,
    blocked: Math.floor(Math.random() * 45) + 5,
    allowed: Math.floor(Math.random() * 5)
  }));

  const vulnerabilityData = [
    { name: 'Critical', value: 2, color: '#ef4444' },
    { name: 'High', value: 8, color: '#f97316' },
    { name: 'Medium', value: 15, color: '#eab308' },
    { name: 'Low', value: 23, color: '#22c55e' },
    { name: 'Info', value: 12, color: '#6b7280' }
  ];

  const attackVectorData = [
    { vector: 'Web Application', count: 45, percentage: 35 },
    { vector: 'Email/Phishing', count: 32, percentage: 25 },
    { vector: 'Network Intrusion', count: 25, percentage: 20 },
    { vector: 'Malware', count: 15, percentage: 12 },
    { vector: 'Insider Threat', count: 10, percentage: 8 }
  ];

  const geographicData = [
    { country: 'Russia', attacks: 234, lat: 55.7558, lng: 37.6176 },
    { country: 'China', attacks: 189, lat: 39.9042, lng: 116.4074 },
    { country: 'USA', attacks: 156, lat: 40.7128, lng: -74.0060 },
    { country: 'Brazil', attacks: 98, lat: -23.5505, lng: -46.6333 },
    { country: 'Unknown', attacks: 67, lat: 0, lng: 0 }
  ];

  const complianceScores = [
    { metric: 'GDPR', score: 95, target: 90 },
    { metric: 'EU AI Act', score: 88, target: 85 },
    { metric: 'ISO 27001', score: 92, target: 90 },
    { metric: 'SOC 2', score: 87, target: 85 },
    { metric: 'Data Residency', score: 100, target: 100 }
  ];

  return {
    threatTrendData,
    vulnerabilityData,
    attackVectorData,
    geographicData,
    complianceScores,
    realTimeMetrics: {
      securityScore: 87,
      threatsBlocked: 1247,
      incidentResponse: 2.3, // minutes
      uptime: 99.97,
      dataBreaches: 0,
      complianceStatus: 'COMPLIANT'
    }
  };
};

export default function SecurityPage() {
  const { user } = useAuth();
  
  // Get user's security access level first
  const accessLevel = getSecurityAccessLevel(user?.role || 'viewer');
  const dashboardConfig = getSecurityDashboardConfig(accessLevel);
  
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null);
  const [healthCheck, setHealthCheck] = useState<SecurityHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedView, setSelectedView] = useState(() => {
    // Auto-select appropriate default view based on role
    if (accessLevel.level === 'full_soc' || accessLevel.level === 'operational_soc') {
      return 'overview'; // SOC dashboard for admins
    } else if (accessLevel.level === 'compliance_only') {
      return 'compliance'; // Compliance dashboard
    } else {
      return 'personal'; // Personal security for researchers
    }
  });
  
  // Generate mock data for demonstration
  const mockData = generateMockSecurityData();
  
  // Filter data based on user's access level
  const filteredData = filterSecurityData(mockData, accessLevel, user?.id, user?.organization);

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true);
      
      const [dashboardResponse, healthResponse] = await Promise.all([
        fetch('/api/security/dashboard', { credentials: 'include' }),
        fetch('/api/security/health', { credentials: 'include' })
      ]);

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboard(dashboardData.data);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthCheck(healthData.data);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'success';
      default: return 'muted';
    }
  };

  // Check if user has access to security dashboard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Authentication Required</h2>
          <p className="text-text-secondary mb-4">Please log in to access the security dashboard</p>
          <Button className="btn-primary" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Check if user has any security access
  if (!canAccessSecurityFeature('personal_security', user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-4">You don't have permission to access security dashboards</p>
          <Button className="btn-outline" onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading Security Dashboard...</p>
          <p className="text-text-secondary text-sm mt-2">Access Level: {accessLevel.level}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Industrial Header with Status Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-text-primary">
                {accessLevel.level === 'full_soc' ? 'Security Operations Center' :
                 accessLevel.level === 'operational_soc' ? 'Security Operations Dashboard' :
                 accessLevel.level === 'org_specific' ? 'Organization Security' :
                 accessLevel.level === 'compliance_only' ? 'Compliance Dashboard' :
                 'Personal Security Center'}
                <span className="text-primary"> Dashboard</span>
              </h1>
              <p className="text-text-secondary mt-2">
                {accessLevel.level === 'full_soc' ? 'Complete Security Oversight & Strategic Management' :
                 accessLevel.level === 'operational_soc' ? 'Technical Security Operations & Threat Response' :
                 accessLevel.level === 'org_specific' ? 'Organization-Specific Security Monitoring' :
                 accessLevel.level === 'compliance_only' ? 'Regulatory Compliance & Audit Management' :
                 'Personal Account Security & Privacy Controls'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  Access Level: {accessLevel.level.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                <Badge variant="muted">
                  Role: {user.role?.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              
              {/* Role-specific welcome message */}
              <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-text-primary text-sm">
                  {accessLevel.level === 'full_soc' ? 
                    '🔴 Full Security Operations Center access - Monitor global threats, manage incidents, and oversee compliance across all organizations.' :
                   accessLevel.level === 'operational_soc' ? 
                    '🟠 Security Operations access - Focus on threat detection, incident response, and technical security operations.' :
                   accessLevel.level === 'org_specific' ? 
                    '🟡 Organization Security access - Monitor your organization\'s security status and manage your team\'s compliance.' :
                   accessLevel.level === 'compliance_only' ? 
                    '🔵 Compliance Dashboard access - Track regulatory compliance, audit trails, and generate compliance reports.' :
                    '🟢 Personal Security Center - Monitor your account security, privacy settings, and data access history.'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchSecurityData} 
                disabled={refreshing}
                className="btn-outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 mb-4">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <Button
                key={range}
                size="sm"
                variant={timeRange === range ? "primary" : "outline"}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Real-time Status Panel */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {mockData.realTimeMetrics.securityScore}%
            </div>
            <div className="text-sm text-text-secondary mb-2">Security Score</div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">PROTECTED</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Executive KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{mockData.realTimeMetrics.threatsBlocked.toLocaleString()}</div>
          <div className="text-xs text-text-secondary">Threats Blocked</div>
          <div className="text-xs text-green-400 mt-1">↑ 12% vs yesterday</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{mockData.realTimeMetrics.incidentResponse}m</div>
          <div className="text-xs text-text-secondary">Avg Response Time</div>
          <div className="text-xs text-green-400 mt-1">↓ 15% improvement</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{mockData.realTimeMetrics.uptime}%</div>
          <div className="text-xs text-text-secondary">System Uptime</div>
          <div className="text-xs text-green-400 mt-1">SLA: 99.9%</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{mockData.realTimeMetrics.dataBreaches}</div>
          <div className="text-xs text-text-secondary">Data Breaches</div>
          <div className="text-xs text-green-400 mt-1">30-day streak</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">3</div>
          <div className="text-xs text-text-secondary">Active Incidents</div>
          <div className="text-xs text-yellow-400 mt-1">2 under investigation</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">COMPLIANT</div>
          <div className="text-xs text-text-secondary">EU AI Act Status</div>
          <div className="text-xs text-green-400 mt-1">All requirements met</div>
        </Card>
      </div>

      {/* Smart Role-Based View Selector */}
      <div className="flex items-center gap-2">
        {(() => {
          const availableViews = [];
          
          // For Super Admins - Full SOC capabilities
          if (accessLevel.level === 'full_soc') {
            availableViews.push(
              { id: 'overview', label: 'SOC Overview', icon: Monitor, access: 'personal_security' },
              { id: 'threats', label: 'Threat Intelligence', icon: Target, access: 'threat_intelligence' },
              { id: 'incidents', label: 'Incident Management', icon: AlertTriangle, access: 'incident_management' },
              { id: 'compliance', label: 'Compliance Center', icon: Shield, access: 'compliance_reports' }
            );
          }
          // For Operational Security (Security Admins)
          else if (accessLevel.level === 'operational_soc') {
            availableViews.push(
              { id: 'overview', label: 'Security Operations', icon: Monitor, access: 'personal_security' },
              { id: 'threats', label: 'Threat Hunting', icon: Target, access: 'threat_intelligence' },
              { id: 'incidents', label: 'Incidents', icon: AlertTriangle, access: 'incident_management' }
            );
          }
          // For Organization Admins
          else if (accessLevel.level === 'org_specific') {
            availableViews.push(
              { id: 'overview', label: 'Organization Security', icon: Monitor, access: 'personal_security' },
              { id: 'compliance', label: 'Org Compliance', icon: Shield, access: 'compliance_reports' },
              { id: 'personal', label: 'My Account', icon: Users, access: 'personal_security' }
            );
          }
          // For Compliance Officers
          else if (accessLevel.level === 'compliance_only') {
            availableViews.push(
              { id: 'compliance', label: 'Compliance Dashboard', icon: Shield, access: 'compliance_reports' }
            );
          }
          // For Researchers (Personal only)
          else {
            availableViews.push(
              { id: 'personal', label: 'My Security', icon: Users, access: 'personal_security' }
            );
          }
          
          return availableViews
            .filter(view => canAccessSecurityFeature(view.access, user?.role || 'viewer'))
            .map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={selectedView === id ? "primary" : "outline"}
                onClick={() => setSelectedView(id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ));
        })()}
      </div>

      {/* Main Dashboard Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Threat Trend Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">🔥 Real-time Threat Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData.threatTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="blocked" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="Blocked"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="allowed" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                      name="Allowed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">🎯 Attack Vector Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={mockData.attackVectorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="vector" 
                      stroke="#9ca3af" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Vulnerability Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">🛡️ Vulnerability Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={mockData.vulnerabilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockData.vulnerabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">📊 Compliance Score Matrix</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={mockData.complianceScores}>
                    <RadialBar 
                      dataKey="score" 
                      cornerRadius={10} 
                      fill="#8884d8" 
                      background={{ fill: '#374151' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Threat Intelligence View */}
      {selectedView === 'threats' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">🌍 Global Threat Map</h3>
            <div className="h-96 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 relative overflow-hidden">
              {/* Simulated World Map with Attack Sources */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-24 h-24 text-blue-400 mx-auto mb-4 animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="text-text-primary font-semibold mb-2">Live Attack Sources</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {mockData.geographicData.map((location, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-text-secondary">{location.country}: {location.attacks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Animated Threat Indicators */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm font-medium">ACTIVE THREATS: 23</span>
                </div>
              </div>
            </div>
          </Card>

          {/* MITRE ATT&CK Framework Simulation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">⚔️ MITRE ATT&CK Tactics Detection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { tactic: 'Initial Access', detected: 5, color: 'red' },
                { tactic: 'Execution', detected: 2, color: 'orange' },
                { tactic: 'Persistence', detected: 1, color: 'yellow' },
                { tactic: 'Privilege Escalation', detected: 0, color: 'green' },
                { tactic: 'Defense Evasion', detected: 3, color: 'orange' },
                { tactic: 'Credential Access', detected: 1, color: 'yellow' },
                { tactic: 'Discovery', detected: 4, color: 'orange' },
                { tactic: 'Lateral Movement', detected: 0, color: 'green' },
                { tactic: 'Collection', detected: 0, color: 'green' },
                { tactic: 'Exfiltration', detected: 0, color: 'green' },
                { tactic: 'Impact', detected: 0, color: 'green' },
                { tactic: 'Command & Control', detected: 2, color: 'orange' }
              ].map((tactic, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  tactic.color === 'red' ? 'bg-red-500/10 border-red-500/20' :
                  tactic.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20' :
                  tactic.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-green-500/10 border-green-500/20'
                }`}>
                  <div className={`text-lg font-bold ${
                    tactic.color === 'red' ? 'text-red-400' :
                    tactic.color === 'orange' ? 'text-orange-400' :
                    tactic.color === 'yellow' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {tactic.detected}
                  </div>
                  <div className="text-xs text-text-secondary">{tactic.tactic}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Compliance View */}
      {selectedView === 'compliance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">🇪🇺 EU AI Act Compliance Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { article: 'Article 5', title: 'Prohibited Practices', status: 'compliant', score: 100 },
                { article: 'Article 9', title: 'Risk Assessment', status: 'compliant', score: 95 },
                { article: 'Article 10', title: 'Data Governance', status: 'compliant', score: 92 },
                { article: 'Article 13', title: 'Transparency', status: 'partial', score: 78 },
                { article: 'Article 14', title: 'Human Oversight', status: 'compliant', score: 90 },
                { article: 'Article 16', title: 'AI System Registry', status: 'compliant', score: 98 }
              ].map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  item.status === 'compliant' ? 'bg-green-500/10 border-green-500/20' :
                  item.status === 'partial' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-text-primary">{item.article}</div>
                    <div className={`text-lg font-bold ${
                      item.status === 'compliant' ? 'text-green-400' :
                      item.status === 'partial' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {item.score}%
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary mb-2">{item.title}</div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        item.status === 'compliant' ? 'bg-green-400' :
                        item.status === 'partial' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* GDPR Compliance Dashboard */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">🔒 GDPR Compliance Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { requirement: 'Data Processing Records', status: 'compliant', lastAudit: '2 days ago' },
                { requirement: 'Consent Management', status: 'compliant', lastAudit: '1 week ago' },
                { requirement: 'Data Subject Rights', status: 'compliant', lastAudit: '3 days ago' },
                { requirement: 'Breach Notification', status: 'compliant', lastAudit: 'N/A - No breaches' },
                { requirement: 'Data Minimization', status: 'compliant', lastAudit: '1 day ago' },
                { requirement: 'Privacy by Design', status: 'compliant', lastAudit: '1 week ago' },
                { requirement: 'DPO Designation', status: 'compliant', lastAudit: '2 weeks ago' },
                { requirement: 'Cross-border Transfers', status: 'n/a', lastAudit: 'EU-only policy' }
              ].map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-surface/50 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    {item.status === 'compliant' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : item.status === 'partial' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : item.status === 'n/a' ? (
                      <Eye className="w-4 h-4 text-blue-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-medium text-text-primary">{item.requirement}</span>
                  </div>
                  <div className="text-xs text-text-secondary">{item.lastAudit}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Incidents View */}
      {selectedView === 'incidents' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">🚨 Active Security Incidents</h3>
            <div className="space-y-3">
              {[
                {
                  id: 'INC-2024-001',
                  title: 'Suspicious Login Pattern Detected',
                  severity: 'medium',
                  status: 'investigating',
                  assignee: 'Security Team Alpha',
                  created: '2 hours ago',
                  source: 'Authentication System'
                },
                {
                  id: 'INC-2024-002',
                  title: 'Unusual Data Access Pattern',
                  severity: 'low',
                  status: 'monitoring',
                  assignee: 'SOC Analyst',
                  created: '4 hours ago',
                  source: 'Data Catalog'
                },
                {
                  id: 'INC-2024-003',
                  title: 'Rate Limit Threshold Exceeded',
                  severity: 'high',
                  status: 'resolved',
                  assignee: 'Network Security',
                  created: '6 hours ago',
                  source: 'API Gateway'
                }
              ].map((incident, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-surface/50 border border-border hover:bg-surface/70 transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    incident.severity === 'critical' ? 'bg-red-500/20' :
                    incident.severity === 'high' ? 'bg-orange-500/20' :
                    incident.severity === 'medium' ? 'bg-yellow-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${getSeverityColor(incident.severity)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-primary">{incident.id}</span>
                      <Badge variant={getSeverityBadge(incident.severity) as any}>{incident.severity}</Badge>
                      <Badge variant={incident.status === 'resolved' ? 'green' : incident.status === 'investigating' ? 'yellow' : 'secondary'}>
                        {incident.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-text-primary mb-1">{incident.title}</h4>
                    <div className="text-sm text-text-secondary">
                      {incident.source} • Assigned to {incident.assignee} • {incident.created}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {incident.status !== 'resolved' && (
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Personal Security View */}
      {selectedView === 'personal' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">🔐 Your Security Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400 mb-1">85%</div>
                <div className="text-sm text-text-secondary">Security Score</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">2</div>
                <div className="text-sm text-text-secondary">Active Sessions</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400 mb-1">3</div>
                <div className="text-sm text-text-secondary">Data Accesses Today</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400 mb-1">0</div>
                <div className="text-sm text-text-secondary">Security Alerts</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold text-text-primary mb-4">🔑 Account Security</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Password Strength</span>
                  <Badge variant="green">Strong</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Two-Factor Authentication</span>
                  <Badge variant="yellow">Not Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Last Password Change</span>
                  <span className="text-text-primary text-sm">2 weeks ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Account Status</span>
                  <Badge variant="green">Active</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Button className="btn-primary w-full">
                  Update Security Settings
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold text-text-primary mb-4">🔒 Privacy Controls</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Data Retention</span>
                  <span className="text-text-primary text-sm">1 year</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Analytics Opt-in</span>
                  <Badge variant="green">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Data Sharing</span>
                  <span className="text-text-primary text-sm">Organization only</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">EU Data Residency</span>
                  <Badge variant="green">Enforced</Badge>
                </div>
              </div>
              <div className="mt-4">
                <Button className="btn-outline w-full">
                  Privacy Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Industrial SOC Footer */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">🏭 Industrial Security Operations Center</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-lg font-bold text-green-400">24/7</div>
              <div className="text-sm text-text-secondary">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-blue-400">99.9%</div>
              <div className="text-sm text-text-secondary">Threat Detection</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Timer className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-purple-400">&lt;2min</div>
              <div className="text-sm text-text-secondary">Response Time</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-lg font-bold text-orange-400">100%</div>
              <div className="text-sm text-text-secondary">EU Compliant</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Security Report
            </Button>
            <Button className="btn-outline">
              <FileText className="w-4 h-4 mr-2" />
              Compliance Certificate
            </Button>
            <Button className="btn-outline">
              <Shield className="w-4 h-4 mr-2" />
              Security Audit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
