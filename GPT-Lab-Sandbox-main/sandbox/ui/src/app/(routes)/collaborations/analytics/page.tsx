'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Progress } from '@/components/Progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  Euro, 
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Award,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  totalCollaborations: number;
  activeCollaborations: number;
  completedCollaborations: number;
  successRate: number;
  averageDuration: number;
  totalValue: number;
  participantStats: {
    companies: number;
    academic: number;
    individuals: number;
    government: number;
  };
  categoryStats: Record<string, number>;
  monthlyStats: Array<{
    month: string;
    collaborations: number;
    completed: number;
    active: number;
  }>;
  lastUpdated: string;
}

interface PerformanceMetrics {
  averageProgress: number;
  onTimeDelivery: number;
  budgetAdherence: number;
  participantSatisfaction: number;
  collaborationEfficiency: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function CollaborationAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('12m');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        const [analyticsResponse, performanceResponse] = await Promise.all([
          fetch('http://localhost:8080/api/collaborations/analytics'),
          fetch('http://localhost:8080/api/collaborations/analytics/performance')
        ]);

        const analyticsData = await analyticsResponse.json();
        const performanceData = await performanceResponse.json();

        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics);
        } else {
          setError('Failed to fetch analytics');
        }

        if (performanceData.success) {
          setPerformance(performanceData.performance);
        }
      } catch (err) {
        setError('Error fetching analytics');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}K`;
    }
    return `€${value}`;
  };

  const formatDuration = (days: number) => {
    if (days >= 365) {
      return `${Math.round(days / 365)} years`;
    } else if (days >= 30) {
      return `${Math.round(days / 30)} months`;
    }
    return `${Math.round(days)} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Error</h2>
          <p className="text-text-secondary mb-6">{error || 'Analytics data not available'}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const participantData = [
    { name: 'Companies', value: analytics.participantStats.companies, color: COLORS[0] },
    { name: 'Academic', value: analytics.participantStats.academic, color: COLORS[1] },
    { name: 'Individuals', value: analytics.participantStats.individuals, color: COLORS[2] },
    { name: 'Government', value: analytics.participantStats.government, color: COLORS[3] }
  ];

  const categoryData = Object.entries(analytics.categoryStats).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  const monthlyData = analytics.monthlyStats.map(stat => ({
    ...stat,
    month: new Date(stat.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Collaboration Analytics</h1>
          <p className="text-text-secondary">Comprehensive insights into collaboration performance and trends</p>
        </div>

        {/* Time Range Selector */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-text-primary">Time Range:</span>
              <div className="flex gap-2">
                {['3m', '6m', '12m', '24m'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'primary' : 'outline'}
                    onClick={() => setTimeRange(range)}
                    className="text-sm"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-sm text-text-secondary">
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Collaborations</p>
                <p className="text-3xl font-bold text-text-primary">{analytics.totalCollaborations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Collaborations</p>
                <p className="text-3xl font-bold text-text-primary">{analytics.activeCollaborations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Running smoothly</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Success Rate</p>
                <p className="text-3xl font-bold text-text-primary">{analytics.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={analytics.successRate} className="h-2" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Value</p>
                <p className="text-3xl font-bold text-text-primary">{formatCurrency(analytics.totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% from last month</span>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        {performance && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-text-secondary">Avg Progress</p>
                <p className="text-2xl font-bold text-text-primary">{performance.averageProgress}%</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-text-secondary">On-Time Delivery</p>
                <p className="text-2xl font-bold text-text-primary">{performance.onTimeDelivery}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Euro className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-text-secondary">Budget Adherence</p>
                <p className="text-2xl font-bold text-text-primary">{performance.budgetAdherence}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-text-secondary">Satisfaction</p>
                <p className="text-2xl font-bold text-text-primary">{Math.round(performance.participantSatisfaction)}%</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm font-medium text-text-secondary">Efficiency</p>
                <p className="text-2xl font-bold text-text-primary">{performance.collaborationEfficiency}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Monthly Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="collaborations" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Participant Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Participant Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participantData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {participantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Collaboration Categories</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-text-primary">Average Duration</h4>
            </div>
            <p className="text-3xl font-bold text-text-primary mb-2">
              {formatDuration(analytics.averageDuration)}
            </p>
            <p className="text-sm text-text-secondary">
              From start to completion
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-semibold text-text-primary">Total Participants</h4>
            </div>
            <p className="text-3xl font-bold text-text-primary mb-2">
              {Object.values(analytics.participantStats).reduce((sum, count) => sum + count, 0)}
            </p>
            <p className="text-sm text-text-secondary">
              Across all collaborations
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
              <h4 className="text-lg font-semibold text-text-primary">Completed Projects</h4>
            </div>
            <p className="text-3xl font-bold text-text-primary mb-2">
              {analytics.completedCollaborations}
            </p>
            <p className="text-sm text-text-secondary">
              Successfully delivered
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
