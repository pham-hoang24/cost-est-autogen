'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Database, 
  Cpu, 
  HardDrive,
  Activity,
  Clock,
  Zap,
  Shield,
  Building,
  FlaskConical,
  Brain,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
  userActivity: Array<{
    date: string;
    logins: number;
    projects: number;
    services: number;
  }>;
  serviceUsage: Array<{
    service: string;
    usage: number;
    users: number;
  }>;
  resourceMetrics: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
    storage: number;
  }>;
  topUsers: Array<{
    name: string;
    email: string;
    role: string;
    activity: number;
  }>;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchAnalyticsData();
    }
  }, [user, authLoading, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock data - in production, this would come from the analytics API
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 156,
          activeUsers: 89,
          totalProjects: 234,
          resourceUsage: {
            cpu: 67,
            memory: 45,
            storage: 78
          }
        },
        userActivity: [
          { date: '2024-01-01', logins: 45, projects: 12, services: 23 },
          { date: '2024-01-02', logins: 52, projects: 15, services: 28 },
          { date: '2024-01-03', logins: 38, projects: 8, services: 19 },
          { date: '2024-01-04', logins: 61, projects: 18, services: 31 },
          { date: '2024-01-05', logins: 47, projects: 14, services: 25 },
          { date: '2024-01-06', logins: 55, projects: 16, services: 29 },
          { date: '2024-01-07', logins: 43, projects: 11, services: 22 }
        ],
        serviceUsage: [
          { service: 'Data Catalog', usage: 89, users: 45 },
          { service: 'AI Chatbot', usage: 76, users: 38 },
          { service: 'Experiment Management', usage: 65, users: 32 },
          { service: 'LLM Management', usage: 54, users: 28 },
          { service: 'Governance', usage: 42, users: 15 }
        ],
        resourceMetrics: [
          { timestamp: '00:00', cpu: 45, memory: 32, storage: 65 },
          { timestamp: '04:00', cpu: 38, memory: 28, storage: 62 },
          { timestamp: '08:00', cpu: 67, memory: 45, storage: 78 },
          { timestamp: '12:00', cpu: 72, memory: 52, storage: 82 },
          { timestamp: '16:00', cpu: 68, memory: 48, storage: 79 },
          { timestamp: '20:00', cpu: 55, memory: 38, storage: 71 }
        ],
        topUsers: [
          { name: 'Dr. Sarah Johnson', email: 'sarah@university.edu', role: 'research_admin', activity: 95 },
          { name: 'Prof. Michael Chen', email: 'michael@research.org', role: 'researcher', activity: 87 },
          { name: 'Dr. Emily Rodriguez', email: 'emily@institute.edu', role: 'researcher', activity: 82 },
          { name: 'Admin User', email: 'admin@sw4e.org', role: 'super_admin', activity: 78 },
          { name: 'Dr. James Wilson', email: 'james@university.edu', role: 'researcher', activity: 74 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Please log in to view analytics</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400">Platform usage and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-outline"
          >
            {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button onClick={fetchAnalyticsData} className="btn-outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">{analyticsData.overview.totalUsers}</p>
              <p className="text-blue-400 text-xs">+12% from last month</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-white">{analyticsData.overview.activeUsers}</p>
              <p className="text-green-400 text-xs">+8% from last week</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Total Projects</p>
              <p className="text-3xl font-bold text-white">{analyticsData.overview.totalProjects}</p>
              <p className="text-purple-400 text-xs">+23% from last month</p>
            </div>
            <FlaskConical className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">System Health</p>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-yellow-400 text-xs">All systems operational</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>CPU Usage</span>
                <span>{analyticsData.overview.resourceUsage.cpu}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analyticsData.overview.resourceUsage.cpu}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Memory Usage</span>
                <span>{analyticsData.overview.resourceUsage.memory}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analyticsData.overview.resourceUsage.memory}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Storage Usage</span>
                <span>{analyticsData.overview.resourceUsage.storage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analyticsData.overview.resourceUsage.storage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Service Usage</h3>
          <div className="space-y-3">
            {analyticsData.serviceUsage.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white text-sm">{service.service}</span>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">{service.usage}%</div>
                  <div className="text-slate-400 text-xs">{service.users} users</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Active Users</h3>
            <div className="space-y-3">
              {analyticsData.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{user.name}</div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-medium">{user.activity}%</div>
                    <div className="text-slate-400 text-xs">{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {analyticsData.userActivity.slice(-5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">{activity.date}</div>
                    <div className="text-slate-400 text-xs">
                      {activity.logins} logins, {activity.projects} projects, {activity.services} services
                    </div>
                  </div>
                  <div className="text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Export Options */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Export Data</h3>
            <p className="text-slate-400 text-sm">Download analytics data in various formats</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="btn-outline">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button className="btn-outline">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button className="btn-outline">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
