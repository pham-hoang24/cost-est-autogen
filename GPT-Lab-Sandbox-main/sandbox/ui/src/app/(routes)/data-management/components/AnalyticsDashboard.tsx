'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
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
  Desktop,
  Router,
  Wifi,
  Bluetooth,
  Signal,
  Radio,
  Satellite,
  Radar,
  Telescope,
  Eye,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Shield,
  Lock,
  Key,
  UserCheck,
  FileCheck,
  AlertCircle,
  CheckSquare
} from 'lucide-react';

interface AnalyticsMetric {
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
  previousValue?: number;
  change?: number;
  changePercentage?: number;
}

interface UsageStatistic {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  category: string;
  lastUpdated: Date;
  historicalData?: { date: string; value: number }[];
}

interface PerformanceMetric {
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
  benchmark?: number;
  percentile?: number;
}

interface AnalyticsDashboardProps {
  metrics: AnalyticsMetric[];
  usageStats: UsageStatistic[];
  performanceMetrics: PerformanceMetric[];
  onRefreshData: () => void;
  onExportReport: () => void;
  onScheduleReport: () => void;
  onViewDetails: (metric: AnalyticsMetric) => void;
}

export default function AnalyticsDashboard({
  metrics,
  usageStats,
  performanceMetrics,
  onRefreshData,
  onExportReport,
  onScheduleReport,
  onViewDetails
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'performance' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('24h');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         metric.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         metric.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'data processing': return Database;
      case 'ai training': return Brain;
      case 'storage': return HardDrive;
      case 'network': return Network;
      case 'compliance': return Shield;
      case 'performance': return Cpu;
      case 'security': return Lock;
      case 'quality': return CheckCircle;
      default: return BarChart3;
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onRefreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onExportReport();
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onScheduleReport();
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (metric: AnalyticsMetric) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onViewDetails(metric);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overview statistics
  const totalMetrics = metrics.length;
  const goodMetrics = metrics.filter(metric => metric.status === 'good').length;
  const warningMetrics = metrics.filter(metric => metric.status === 'warning').length;
  const criticalMetrics = metrics.filter(metric => metric.status === 'critical').length;
  const healthScore = totalMetrics > 0 ? Math.round((goodMetrics / totalMetrics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
          <p className="text-gray-400 text-sm">Monitor system performance, usage patterns, and key metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleScheduleReport}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Schedule Report
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Report
          </Button>
          <Button
            onClick={handleRefreshData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Time Range and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="data processing">Data Processing</option>
              <option value="ai training">AI Training</option>
              <option value="storage">Storage</option>
              <option value="network">Network</option>
              <option value="compliance">Compliance</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="quality">Quality</option>
            </select>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'usage', label: 'Usage Analytics', icon: Activity },
          { id: 'performance', label: 'Performance', icon: Cpu },
          { id: 'trends', label: 'Trends', icon: TrendingUp }
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
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{healthScore}%</p>
                  <p className="text-sm text-gray-300">System Health</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalMetrics}</p>
                  <p className="text-sm text-gray-300">Total Metrics</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{warningMetrics}</p>
                  <p className="text-sm text-gray-300">Warnings</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{criticalMetrics}</p>
                  <p className="text-sm text-gray-300">Critical Issues</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.slice(0, 6).map((metric) => {
              const CategoryIcon = getCategoryIcon(metric.category);
              const TrendIcon = getTrendIcon(metric.trend);
              
              return (
                <Card key={metric.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{metric.name}</h4>
                        <p className="text-sm text-gray-400">{metric.category}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(metric.status)}>
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

          {/* Usage Statistics */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Usage Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {usageStats.slice(0, 4).map((stat) => {
                const TrendIcon = getTrendIcon(stat.trend);
                return (
                  <div key={stat.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{stat.name}</span>
                      <TrendIcon className={`w-4 h-4 ${getTrendColor(stat.trend)}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                      <span className="text-gray-400 text-sm">{stat.unit}</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{stat.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">Usage Analytics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usageStats.map((stat) => {
              const TrendIcon = getTrendIcon(stat.trend);
              const isExpanded = expandedMetric === stat.id;
              
              return (
                <Card key={stat.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-white">{stat.name}</h5>
                        <p className="text-gray-400 text-sm">{stat.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`w-5 h-5 ${getTrendColor(stat.trend)}`} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedMetric(isExpanded ? null : stat.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-white">{stat.value}</span>
                      <span className="text-gray-400 text-sm">{stat.unit}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">{stat.description}</p>
                  </div>
                  
                  {isExpanded && stat.historicalData && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h6 className="text-sm font-semibold text-white mb-3">Historical Data</h6>
                      <div className="space-y-2">
                        {stat.historicalData.slice(0, 5).map((dataPoint, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{dataPoint.date}</span>
                            <span className="text-white">{dataPoint.value} {stat.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">Performance Metrics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric) => {
              const CategoryIcon = getCategoryIcon(metric.category);
              const TrendIcon = getTrendIcon(metric.trend);
              const isExpanded = expandedMetric === metric.id;
              
              return (
                <Card key={metric.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-white">{metric.name}</h5>
                        <p className="text-gray-400 text-sm">{metric.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedMetric(isExpanded ? null : metric.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-white">{metric.value}</span>
                      <span className="text-gray-400 text-sm">{metric.unit}</span>
                      <TrendIcon className={`w-5 h-5 ${getTrendColor(metric.trend)}`} />
                    </div>
                    <p className="text-gray-300 text-sm mt-2">{metric.description}</p>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Threshold</span>
                          <span className="text-white text-sm">{metric.threshold} {metric.unit}</span>
                        </div>
                        {metric.benchmark && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Benchmark</span>
                            <span className="text-white text-sm">{metric.benchmark} {metric.unit}</span>
                          </div>
                        )}
                        {metric.percentile && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Percentile</span>
                            <span className="text-white text-sm">{metric.percentile}th</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Last Updated</span>
                          <span className="text-white text-sm">{metric.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">Trend Analysis</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h5 className="text-lg font-semibold text-white mb-4">Trending Up</h5>
              <div className="space-y-3">
                {metrics.filter(m => m.trend === 'up').slice(0, 5).map((metric) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendIcon className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-white text-sm">{metric.name}</p>
                          <p className="text-gray-400 text-xs">{metric.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white text-sm">{metric.value}{metric.unit}</span>
                        <p className="text-green-500 text-xs">↗ Trending up</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-6">
              <h5 className="text-lg font-semibold text-white mb-4">Trending Down</h5>
              <div className="space-y-3">
                {metrics.filter(m => m.trend === 'down').slice(0, 5).map((metric) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendIcon className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-white text-sm">{metric.name}</p>
                          <p className="text-gray-400 text-xs">{metric.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white text-sm">{metric.value}{metric.unit}</span>
                        <p className="text-red-500 text-xs">↘ Trending down</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
          
          <Card className="p-6">
            <h5 className="text-lg font-semibold text-white mb-4">Stable Metrics</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.filter(m => m.trend === 'stable').slice(0, 6).map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend);
                return (
                  <div key={metric.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm font-medium">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                      <span className="text-gray-400 text-sm">{metric.unit}</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{metric.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
