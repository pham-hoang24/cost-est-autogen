'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  LayoutDashboard,
  Users, 
  FileText, 
  Brain,
  Database,
  TrendingUp,
  Calendar,
  Activity,
  Crown,
  Shield,
  Zap,
  ArrowRight,
  Plus,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Network,
  Clock,
  Award,
  BookOpen,
  Globe,
  Filter,
  RefreshCw,
  Target,
  Microscope,
  Server,
  CreditCard,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AccountStatusCard from './components/AccountStatusCard';

// Import dashboard components
import QuickStatsCards from '@/components/dashboard/QuickStatsCards';
import ResearchTimeline from '@/components/dashboard/ResearchTimeline';
import AIServicesAnalytics from '@/components/dashboard/AIServicesAnalytics';
import PublicationPipeline from '@/components/dashboard/PublicationPipeline';
import ResourceAnalytics from '@/components/dashboard/ResourceAnalytics';
import ResearchInsights from '@/components/dashboard/ResearchInsights';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    // General dashboard data
    projects: [] as any[],
    invitations: [] as any[],
    recentActivity: [] as any[],
    stats: {
      totalProjects: 0,
      activeCollaborations: 0,
      pendingInvitations: 0,
      dataShared: 0
    },
    // Researcher-specific data
    quickStats: {
      activeProjects: 0,
      publications: 0,
      collaborations: 0,
      datasets: 0
    },
    researchTimeline: [] as any[],
    collaborationNetwork: [] as any[],
    aiServicesUsage: [] as any[],
    publicationPipeline: [] as any[],
    resourceUsage: {} as any,
    researchInsights: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedTimeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        // General data
        projects: getMockProjects(),
        invitations: getMockInvitations(),
        recentActivity: getMockRecentActivity(),
        stats: {
          totalProjects: 8,
          activeCollaborations: 15,
          pendingInvitations: 3,
          dataShared: 23
        },
        // Researcher-specific data
        quickStats: {
          activeProjects: 8,
          publications: 12,
          collaborations: 15,
          datasets: 23
        },
        researchTimeline: getMockResearchTimeline(),
        collaborationNetwork: getMockCollaborationNetwork(),
        aiServicesUsage: getMockAIServicesUsage(),
        publicationPipeline: getMockPublicationPipeline(),
        resourceUsage: getMockResourceUsage(),
        researchInsights: getMockResearchInsights()
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data functions
  const getMockProjects = () => [
    {
      id: '1',
      name: 'AI Climate Modeling',
      status: 'active',
      progress: 75,
      collaborators: 4,
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Quantum ML Research',
      status: 'planning',
      progress: 25,
      collaborators: 6,
      lastActivity: '1 day ago'
    }
  ];

  const getMockInvitations = () => [
    {
      id: '1',
      projectName: 'Neural Network Optimization',
      inviterName: 'Dr. Sarah Chen',
      role: 'Collaborator',
      status: 'pending'
    },
    {
      id: '2',
      projectName: 'Data Privacy Research',
      inviterName: 'Prof. Michael Rodriguez',
      role: 'Reviewer',
      status: 'pending'
    }
  ];

  const getMockRecentActivity = () => [
    {
      id: '1',
      type: 'project_update',
      message: 'AI Climate Modeling project updated',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'collaboration',
      message: 'New collaboration request from Dr. Emma Thompson',
      timestamp: '4 hours ago'
    }
  ];

  const getMockResearchTimeline = () => [
    {
      id: '1',
      title: 'AI-Powered Climate Modeling',
      status: 'active',
      progress: 75,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      collaborators: 4,
      milestones: [
        { title: 'Data Collection', completed: true, date: '2024-02-15' },
        { title: 'Model Development', completed: true, date: '2024-04-10' },
        { title: 'Validation', completed: false, date: '2024-05-20' },
        { title: 'Publication', completed: false, date: '2024-06-30' }
      ]
    }
  ];

  const getMockCollaborationNetwork = () => [
    { id: '1', name: 'Dr. Sarah Chen', institution: 'MIT', field: 'AI/ML', strength: 'strong', projects: 3 },
    { id: '2', name: 'Prof. Michael Rodriguez', institution: 'Stanford', field: 'Climate Science', strength: 'medium', projects: 2 }
  ];

  const getMockAIServicesUsage = () => [
    { service: 'Anomaly Detection', usage: 45, cost: 120, success: 94 },
    { service: 'Data Preprocessing', usage: 32, cost: 85, success: 98 }
  ];

  const getMockPublicationPipeline = () => [
    { title: 'Climate AI Models', status: 'under_review', journal: 'Nature Climate Change', progress: 80 },
    { title: 'Quantum ML Algorithms', status: 'draft', journal: 'Physical Review Letters', progress: 60 }
  ];

  const getMockResourceUsage = () => ({
    cpu: { used: 450, limit: 1000, unit: 'hours' },
    gpu: { used: 120, limit: 500, unit: 'hours' },
    storage: { used: 2.3, limit: 10, unit: 'TB' },
    memory: { used: 8, limit: 32, unit: 'GB' }
  });

  const getMockResearchInsights = () => [
    {
      type: 'trending_topic',
      title: 'Federated Learning',
      description: 'Hot topic in your network - 5 collaborators working on this',
      action: 'Explore collaboration opportunities'
    },
    {
      type: 'deadline',
      title: 'ICML 2024 Submission',
      description: 'Deadline in 15 days - 2 papers ready for submission',
      action: 'Review and submit'
    }
  ];

  // Role-based content rendering
  const isResearcher = user?.role === 'researcher' || user?.role === 'university_faculty' || user?.role === 'university_researcher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'research_admin';

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-text-primary mb-2">
                  {isResearcher ? 'Research Dashboard' : isStudent ? 'Learning Dashboard' : 'Dashboard'}
                </h1>
                <p className="text-xl text-text-secondary">
                  {t('dashboard.welcome')}, {user?.firstName || user?.email}! 
                  {isResearcher && ' Track your research progress and collaborations.'}
                  {isStudent && ' Monitor your learning progress and assignments.'}
                  {!isResearcher && !isStudent && ' Manage your projects and collaborations.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isResearcher && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedTimeRange(selectedTimeRange === '6m' ? '1y' : '6m')}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      {selectedTimeRange === '6m' ? '6 Months' : '1 Year'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={fetchDashboardData}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => router.push('/projects')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isStudent ? 'New Assignment' : 'New Project'}
                </Button>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          {user && <AccountStatusCard user={user} />}

          {/* Role-based Content */}
          {isResearcher ? (
            <>
              {/* Quick Stats */}
              <QuickStatsCards data={dashboardData.quickStats} />

              {/* Main Content Tabs */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-surface rounded-lg p-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'timeline', label: 'Timeline', icon: Calendar },
                    { id: 'collaborations', label: 'Collaborations', icon: Network },
                    { id: 'analytics', label: 'Analytics', icon: PieChart },
                    { id: 'insights', label: 'Insights', icon: Brain }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                          selectedTab === tab.id
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {selectedTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResearchTimeline data={dashboardData.researchTimeline} />
                    <AIServicesAnalytics data={dashboardData.aiServicesUsage} />
                    <PublicationPipeline data={dashboardData.publicationPipeline} />
                    <ResourceAnalytics data={dashboardData.resourceUsage} />
                  </div>
                )}

                {selectedTab === 'timeline' && (
                  <div className="space-y-6">
                    <ResearchTimeline data={dashboardData.researchTimeline} expanded={true} />
                  </div>
                )}

                {selectedTab === 'collaborations' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Network className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-text-primary">Collaboration Network</h3>
                            <p className="text-sm text-text-secondary">Your research partnerships</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center py-8">
                        <Network className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-text-secondary mb-2">Collaboration Network</h4>
                        <p className="text-text-muted mb-4">View your research partnerships and collaborations</p>
                        <Button className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          View Collaborations
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {selectedTab === 'analytics' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AIServicesAnalytics data={dashboardData.aiServicesUsage} />
                    <ResourceAnalytics data={dashboardData.resourceUsage} />
                  </div>
                )}

                {selectedTab === 'insights' && (
                  <div className="space-y-6">
                    <ResearchInsights data={dashboardData.researchInsights} />
                  </div>
                )}
              </div>
            </>
          ) : isStudent ? (
            /* Student Dashboard */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Active Courses</h3>
                    <p className="text-sm text-text-secondary">3 courses</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">3</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Assignments</h3>
                    <p className="text-sm text-text-secondary">Due this week</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">5</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Progress</h3>
                    <p className="text-sm text-text-secondary">Overall completion</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">78%</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Achievements</h3>
                    <p className="text-sm text-text-secondary">Badges earned</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">12</div>
              </Card>
            </div>
          ) : (
            /* General Dashboard */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Projects</h3>
                    <p className="text-sm text-text-secondary">Total projects</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">{dashboardData.stats.totalProjects}</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Collaborations</h3>
                    <p className="text-sm text-text-secondary">Active partnerships</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">{dashboardData.stats.activeCollaborations}</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Data Shared</h3>
                    <p className="text-sm text-text-secondary">Datasets shared</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">{dashboardData.stats.dataShared}</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Activity</h3>
                    <p className="text-sm text-text-secondary">Recent updates</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-text-primary">{dashboardData.recentActivity.length}</div>
              </Card>
            </div>
          )}

          {/* Recent Activity Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">Recent Activity</h3>
                  <p className="text-sm text-text-secondary">Your latest updates</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{activity.message}</p>
                    <p className="text-xs text-text-muted">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}