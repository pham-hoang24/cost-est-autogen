'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Workflow,
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
  Zap,
  Filter,
  Search
} from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  type: 'data_ingestion' | 'data_cleaning' | 'data_transformation' | 'data_validation' | 'data_anonymization' | 'data_export';
  status: 'pending' | 'running' | 'completed' | 'error';
  inputSchema?: any;
  outputSchema?: any;
  parameters?: any;
  executionTime?: number;
  errorMessage?: string;
  description?: string;
  dependencies?: string[];
}

interface ComplianceCheck {
  id: string;
  name: string;
  type: 'privacy' | 'security' | 'quality' | 'regulatory';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  description: string;
  details?: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  trend?: 'up' | 'down' | 'stable';
}

interface ProcessingPipeline {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  steps: PipelineStep[];
  inputData: any[];
  outputData: any[];
  complianceChecks: ComplianceCheck[];
  qualityMetrics: QualityMetric[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionTime?: number;
  errorMessage?: string;
  tags?: string[];
  category?: string;
  version?: string;
}

interface ProcessingPipelineProps {
  pipelines: ProcessingPipeline[];
  onCreatePipeline: () => void;
  onEditPipeline: (pipeline: ProcessingPipeline) => void;
  onDeletePipeline: (pipelineId: string) => void;
  onExecutePipeline: (pipelineId: string) => void;
  onStopPipeline: (pipelineId: string) => void;
}

export default function ProcessingPipeline({
  pipelines,
  onCreatePipeline,
  onEditPipeline,
  onDeletePipeline,
  onExecutePipeline,
  onStopPipeline
}: ProcessingPipelineProps) {
  const [selectedPipeline, setSelectedPipeline] = useState<ProcessingPipeline | null>(null);
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'workflow'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pipeline.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pipeline.tags && pipeline.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus = filterStatus === 'all' || pipeline.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'error': return 'red';
      case 'paused': return 'yellow';
      case 'idle': return 'gray';
      default: return 'gray';
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'data_ingestion': return Upload;
      case 'data_cleaning': return Filter;
      case 'data_transformation': return Zap;
      case 'data_validation': return CheckCircle;
      case 'data_anonymization': return Shield;
      case 'data_export': return Download;
      default: return Workflow;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return Loader2;
      case 'error': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getComplianceTypeIcon = (type: string) => {
    switch (type) {
      case 'privacy': return Shield;
      case 'security': return Lock;
      case 'quality': return CheckCircle;
      case 'regulatory': return FileCheck;
      default: return Info;
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green';
      case 'failed': return 'red';
      case 'warning': return 'yellow';
      case 'pending': return 'gray';
      default: return 'gray';
    }
  };

  const getQualityStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const handleExecutePipeline = async (pipelineId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onExecutePipeline(pipelineId);
    } finally {
      setLoading(false);
    }
  };

  const handleStopPipeline = async (pipelineId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onStopPipeline(pipelineId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Processing Pipelines</h3>
          <p className="text-gray-400 text-sm">Create and manage data processing workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'workflow' : 'list')}
          >
            {viewMode === 'list' ? <Workflow className="w-4 h-4 mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
            {viewMode === 'list' ? 'Workflow View' : 'List View'}
          </Button>
          <Button onClick={onCreatePipeline}>
            <Plus className="w-4 h-4 mr-2" />
            Create Pipeline
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
                placeholder="Search pipelines..."
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
              <option value="idle">Idle</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="error">Error</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Showing {filteredPipelines.length} of {pipelines.length} pipelines
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </Card>

      {/* Pipelines List */}
      <div className="space-y-4">
        {filteredPipelines.map((pipeline) => {
          const isExpanded = expandedPipeline === pipeline.id;
          const runningSteps = pipeline.steps.filter(step => step.status === 'running').length;
          const completedSteps = pipeline.steps.filter(step => step.status === 'completed').length;
          const errorSteps = pipeline.steps.filter(step => step.status === 'error').length;
          const progressPercentage = pipeline.steps.length > 0 ? (completedSteps / pipeline.steps.length) * 100 : 0;
          
          return (
            <Card key={pipeline.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Workflow className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-semibold text-white">{pipeline.name}</h4>
                      <Badge variant={getStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                      {pipeline.version && (
                        <Badge variant="gray">v{pipeline.version}</Badge>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{pipeline.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{pipeline.steps.length} steps</span>
                      <span>•</span>
                      <span>Created: {pipeline.createdAt.toLocaleDateString()}</span>
                      {pipeline.executionTime && (
                        <>
                          <span>•</span>
                          <span>Duration: {pipeline.executionTime}s</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {pipeline.status === 'idle' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecutePipeline(pipeline.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  {pipeline.status === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopPipeline(pipeline.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPipeline(pipeline)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedPipeline(isExpanded ? null : pipeline.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm text-white">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{completedSteps} completed</span>
                  {runningSteps > 0 && <span>{runningSteps} running</span>}
                  {errorSteps > 0 && <span className="text-red-400">{errorSteps} errors</span>}
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pipeline Steps */}
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-4">Pipeline Steps</h5>
                      <div className="space-y-3">
                        {pipeline.steps.map((step, index) => {
                          const StepTypeIcon = getStepTypeIcon(step.type);
                          const StepStatusIcon = getStepStatusIcon(step.status);
                          
                          return (
                            <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  step.status === 'completed' ? 'bg-green-600' :
                                  step.status === 'running' ? 'bg-blue-600' :
                                  step.status === 'error' ? 'bg-red-600' : 'bg-gray-600'
                                }`}>
                                  {step.status === 'running' ? (
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                  ) : (
                                    <StepStatusIcon className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <StepTypeIcon className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm">{step.name}</p>
                                <p className="text-gray-400 text-xs">{step.type.replace('_', ' ')}</p>
                              </div>
                              {step.executionTime && (
                                <span className="text-gray-400 text-xs">{step.executionTime}s</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Compliance Checks */}
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-4">Compliance Checks</h5>
                      <div className="space-y-3">
                        {pipeline.complianceChecks.length > 0 ? (
                          pipeline.complianceChecks.map((check) => {
                            const ComplianceIcon = getComplianceTypeIcon(check.type);
                            
                            return (
                              <div key={check.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  check.status === 'passed' ? 'bg-green-600' :
                                  check.status === 'failed' ? 'bg-red-600' :
                                  check.status === 'warning' ? 'bg-yellow-600' : 'bg-gray-600'
                                }`}>
                                  <ComplianceIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm">{check.name}</p>
                                  <p className="text-gray-400 text-xs">{check.description}</p>
                                </div>
                                <Badge variant={getComplianceStatusColor(check.status)}>
                                  {check.status}
                                </Badge>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-sm">No compliance checks configured</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quality Metrics */}
                  {pipeline.qualityMetrics.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-sm font-semibold text-white mb-4">Quality Metrics</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pipeline.qualityMetrics.map((metric) => (
                          <div key={metric.id} className="p-4 bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-sm font-medium">{metric.name}</span>
                              <Badge variant={getQualityStatusColor(metric.status)}>
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
                                {metric.trend && (
                                  <TrendingUp className={`w-3 h-3 ${
                                    metric.trend === 'up' ? 'text-green-500' :
                                    metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                                  }`} />
                                )}
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
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {pipeline.errorMessage && (
                    <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-red-500 font-medium">Error</span>
                      </div>
                      <p className="text-red-300 text-sm">{pipeline.errorMessage}</p>
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
                      Export Results
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDeletePipeline(pipeline.id)}
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
      
      {filteredPipelines.length === 0 && (
        <Card className="p-12 text-center">
          <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Pipelines Found</h3>
          <p className="text-gray-400 mb-4">
            Create your first processing pipeline to get started with data workflows.
          </p>
          <Button onClick={onCreatePipeline}>
            <Plus className="w-4 h-4 mr-2" />
            Create Pipeline
          </Button>
        </Card>
      )}
    </div>
  );
}
