'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Zap,
  Play,
  Pause,
  Square,
  RefreshCw,
  Settings,
  Eye,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Loader2,
  BarChart3,
  Activity,
  TrendingUp,
  Database,
  Shield,
  Key,
  Lock,
  Globe,
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
  UserCheck,
  FileCheck,
  AlertCircle,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Filter,
  Search,
  Brain,
  Microscope,
  TestTube,
  FlaskConical,
  Beaker,
  Atom,
  CircuitBoard,
  CpuIcon,
  MemoryStick,
  HardDriveIcon,
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
  Telescope,
  MicroscopeIcon,
  TestTubeIcon,
  FlaskConicalIcon,
  BeakerIcon,
  AtomIcon
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  threshold?: number;
  status?: 'good' | 'warning' | 'critical';
}

interface AIIntegration {
  id: string;
  dataSourceId: string;
  aiServiceId: string;
  modelType: string;
  trainingStatus: 'pending' | 'training' | 'completed' | 'failed';
  performanceMetrics: PerformanceMetric[];
  deploymentStatus: 'not_deployed' | 'deployed' | 'serving';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  modelName?: string;
  modelVersion?: string;
  trainingDataSize?: string;
  trainingDuration?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  errorMessage?: string;
  tags?: string[];
  category?: string;
  description?: string;
}

interface DataSource {
  id: string;
  name: string;
  domain: string;
  accessibility: 'open' | 'restricted' | 'sensitive';
  description: string;
}

interface AIService {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AIIntegrationProps {
  integrations: AIIntegration[];
  dataSources: DataSource[];
  aiServices: AIService[];
  onCreateIntegration: () => void;
  onEditIntegration: (integration: AIIntegration) => void;
  onDeleteIntegration: (integrationId: string) => void;
  onTrainModel: (integrationId: string) => void;
  onStopTraining: (integrationId: string) => void;
  onDeployModel: (integrationId: string) => void;
  onUndeployModel: (integrationId: string) => void;
}

export default function AIIntegration({
  integrations,
  dataSources,
  aiServices,
  onCreateIntegration,
  onEditIntegration,
  onDeleteIntegration,
  onTrainModel,
  onStopTraining,
  onDeployModel,
  onUndeployModel
}: AIIntegrationProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<AIIntegration | null>(null);
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModelType, setFilterModelType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.modelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.modelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (integration.tags && integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus = filterStatus === 'all' || integration.trainingStatus === filterStatus;
    const matchesModelType = filterModelType === 'all' || integration.modelType.toLowerCase().includes(filterModelType.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesModelType;
  });

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'training': return 'blue';
      case 'failed': return 'red';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case 'serving': return 'green';
      case 'deployed': return 'blue';
      case 'not_deployed': return 'gray';
      default: return 'gray';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'classification': return Target;
      case 'regression': return TrendingUp;
      case 'clustering': return Layers;
      case 'nlp': return FileText;
      case 'computer vision': return Eye;
      case 'recommendation': return Star;
      case 'anomaly detection': return AlertTriangle;
      case 'time series': return Activity;
      default: return Brain;
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

  const getMetricStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const handleTrainModel = async (integrationId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onTrainModel(integrationId);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTraining = async (integrationId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onStopTraining(integrationId);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployModel = async (integrationId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onDeployModel(integrationId);
    } finally {
      setLoading(false);
    }
  };

  const handleUndeployModel = async (integrationId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onUndeployModel(integrationId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">AI Integrations</h3>
          <p className="text-gray-400 text-sm">Connect data sources with AI services for model training and deployment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? <BarChart3 className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
          <Button onClick={onCreateIntegration}>
            <Plus className="w-4 h-4 mr-2" />
            Create Integration
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search AI integrations..."
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
              <option value="pending">Pending</option>
              <option value="training">Training</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <select
              value={filterModelType}
              onChange={(e) => setFilterModelType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Model Types</option>
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
              <option value="clustering">Clustering</option>
              <option value="nlp">NLP</option>
              <option value="computer vision">Computer Vision</option>
              <option value="recommendation">Recommendation</option>
              <option value="anomaly detection">Anomaly Detection</option>
              <option value="time series">Time Series</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Showing {filteredIntegrations.length} of {integrations.length} AI integrations
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </Card>

      {/* Integrations Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => {
            const dataSource = dataSources.find(ds => ds.id === integration.dataSourceId);
            const aiService = aiServices.find(service => service.id === integration.aiServiceId);
            const ModelTypeIcon = getModelTypeIcon(integration.modelType);
            
            return (
              <Card key={integration.id} className="p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <ModelTypeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{integration.modelName || 'Unnamed Model'}</h4>
                      <p className="text-sm text-gray-400">{integration.modelType}</p>
                    </div>
                  </div>
                  <Badge variant={getTrainingStatusColor(integration.trainingStatus)}>
                    {integration.trainingStatus}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Data Source</span>
                    <span className="text-white text-sm">{dataSource?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">AI Service</span>
                    <span className="text-white text-sm">{aiService?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Deployment</span>
                    <Badge variant={getDeploymentStatusColor(integration.deploymentStatus)}>
                      {integration.deploymentStatus}
                    </Badge>
                  </div>
                  {integration.accuracy && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Accuracy</span>
                      <span className="text-white text-sm">{integration.accuracy}%</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {integration.trainingStatus === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrainModel(integration.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Train
                    </Button>
                  )}
                  
                  {integration.trainingStatus === 'training' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopTraining(integration.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Square className="w-4 h-4 mr-2" />
                      )}
                      Stop
                    </Button>
                  )}
                  
                  {integration.trainingStatus === 'completed' && integration.deploymentStatus === 'not_deployed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeployModel(integration.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Deploy
                    </Button>
                  )}
                  
                  {integration.deploymentStatus === 'deployed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndeployModel(integration.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Undeploy
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedIntegration(expandedIntegration === integration.id ? null : integration.id)}
                  >
                    {expandedIntegration === integration.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {expandedIntegration === integration.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="space-y-3">
                      {integration.performanceMetrics.map((metric) => {
                        const TrendIcon = getTrendIcon(metric.trend);
                        return (
                          <div key={metric.name} className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">{metric.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm">{metric.value}{metric.unit}</span>
                              <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIntegrations.map((integration) => {
            const dataSource = dataSources.find(ds => ds.id === integration.dataSourceId);
            const aiService = aiServices.find(service => service.id === integration.aiServiceId);
            const ModelTypeIcon = getModelTypeIcon(integration.modelType);
            const isExpanded = expandedIntegration === integration.id;
            
            return (
              <Card key={integration.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <ModelTypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-semibold text-white">{integration.modelName || 'Unnamed Model'}</h4>
                        <Badge variant={getTrainingStatusColor(integration.trainingStatus)}>
                          {integration.trainingStatus}
                        </Badge>
                        <Badge variant={getDeploymentStatusColor(integration.deploymentStatus)}>
                          {integration.deploymentStatus}
                        </Badge>
                        {integration.modelVersion && (
                          <Badge variant="gray">v{integration.modelVersion}</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{integration.description || 'No description available'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{integration.modelType}</span>
                        <span>•</span>
                        <span>{dataSource?.name || 'Unknown Data Source'}</span>
                        <span>•</span>
                        <span>{aiService?.name || 'Unknown AI Service'}</span>
                        <span>•</span>
                        <span>Created: {integration.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {integration.trainingStatus === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrainModel(integration.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {integration.trainingStatus === 'training' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopTraining(integration.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {integration.trainingStatus === 'completed' && integration.deploymentStatus === 'not_deployed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeployModel(integration.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditIntegration(integration)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedIntegration(isExpanded ? null : integration.id)}
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
                      {/* Performance Metrics */}
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-4">Performance Metrics</h5>
                        <div className="space-y-3">
                          {integration.performanceMetrics.map((metric) => {
                            const TrendIcon = getTrendIcon(metric.trend);
                            return (
                              <div key={metric.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                <div>
                                  <p className="text-white text-sm">{metric.name}</p>
                                  <p className="text-gray-400 text-xs">{metric.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm font-medium">{metric.value}{metric.unit}</span>
                                  <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Model Details */}
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-4">Model Details</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Model Type</span>
                            <span className="text-white text-sm">{integration.modelType}</span>
                          </div>
                          {integration.trainingDataSize && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Training Data Size</span>
                              <span className="text-white text-sm">{integration.trainingDataSize}</span>
                            </div>
                          )}
                          {integration.trainingDuration && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Training Duration</span>
                              <span className="text-white text-sm">{integration.trainingDuration} minutes</span>
                            </div>
                          )}
                          {integration.accuracy && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Accuracy</span>
                              <span className="text-white text-sm">{integration.accuracy}%</span>
                            </div>
                          )}
                          {integration.precision && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Precision</span>
                              <span className="text-white text-sm">{integration.precision}%</span>
                            </div>
                          )}
                          {integration.recall && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Recall</span>
                              <span className="text-white text-sm">{integration.recall}%</span>
                            </div>
                          )}
                          {integration.f1Score && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">F1 Score</span>
                              <span className="text-white text-sm">{integration.f1Score}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Error Message */}
                    {integration.errorMessage && (
                      <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="text-red-500 font-medium">Error</span>
                        </div>
                        <p className="text-red-300 text-sm">{integration.errorMessage}</p>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Model
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDeleteIntegration(integration.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      {filteredIntegrations.length === 0 && (
        <Card className="p-12 text-center">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No AI Integrations Found</h3>
          <p className="text-gray-400 mb-4">
            Create your first AI integration to connect data sources with AI services.
          </p>
          <Button onClick={onCreateIntegration}>
            <Plus className="w-4 h-4 mr-2" />
            Create Integration
          </Button>
        </Card>
      )}
    </div>
  );
}

// Helper components
function List({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );
}
