'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Activity, 
  Play, 
  Pause, 
  Square, 
  Eye,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search,
  RefreshCw,
  Calendar,
  Users,
  Cpu,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Timer,
  Zap,
  Settings
} from 'lucide-react';

interface ExperimentTrackingServiceProps {
  service: any;
}

export default function ExperimentTrackingService({ service }: ExperimentTrackingServiceProps) {
  const [currentView, setCurrentView] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackingData, setTrackingData] = useState<any>(null);

  // Simulate real-time experiment tracking
  useEffect(() => {
    const updateTrackingData = () => {
      setTrackingData({
        activeExperiments: [
          {
            id: 'exp-run-001',
            name: 'BERT Fine-tuning for Legal Documents',
            type: 'fine-tuning',
            status: 'running',
            progress: 67,
            startTime: '2025-09-21T10:15:00Z',
            estimatedCompletion: '2025-09-21T12:30:00Z',
            currentEpoch: 2,
            totalEpochs: 3,
            currentAccuracy: 0.892,
            gpuUsage: 94.2,
            cost: 15.30,
            user: 'Dr. Sarah Chen',
            project: 'Legal AI Assistant'
          },
          {
            id: 'exp-run-002',
            name: 'Hyperparameter Optimization - Sentiment Model',
            type: 'optimization',
            status: 'running',
            progress: 34,
            startTime: '2025-09-21T09:45:00Z',
            estimatedCompletion: '2025-09-21T14:20:00Z',
            currentTrial: 12,
            totalTrials: 50,
            bestAccuracy: 0.934,
            gpuUsage: 78.5,
            cost: 23.45,
            user: 'Mike Johnson',
            project: 'Customer Feedback AI'
          },
          {
            id: 'exp-run-003',
            name: 'Data Preprocessing - Manufacturing Dataset',
            type: 'preprocessing',
            status: 'running',
            progress: 89,
            startTime: '2025-09-21T11:00:00Z',
            estimatedCompletion: '2025-09-21T11:25:00Z',
            currentStep: 'Feature engineering',
            totalSteps: 6,
            recordsProcessed: 89000,
            gpuUsage: 23.1,
            cost: 2.10,
            user: 'Lisa Wang',
            project: 'Predictive Maintenance'
          }
        ],
        queuedExperiments: [
          {
            id: 'exp-queue-001',
            name: 'RAG System Deployment Test',
            type: 'deployment',
            status: 'queued',
            queuePosition: 1,
            estimatedStart: '2025-09-21T12:35:00Z',
            estimatedDuration: '25 minutes',
            requiredGPUs: 1,
            estimatedCost: 8.50,
            user: 'Alex Kumar',
            project: 'Document Q&A System'
          },
          {
            id: 'exp-queue-002',
            name: 'Model Benchmarking - Vision Models',
            type: 'benchmarking',
            status: 'queued',
            queuePosition: 2,
            estimatedStart: '2025-09-21T13:00:00Z',
            estimatedDuration: '45 minutes',
            requiredGPUs: 2,
            estimatedCost: 18.20,
            user: 'Emma Thompson',
            project: 'Medical Image Analysis'
          }
        ],
        historicalExperiments: [
          {
            id: 'exp-hist-001',
            name: 'GPT-3.5 Fine-tuning for Customer Support',
            type: 'fine-tuning',
            status: 'completed',
            startTime: '2025-09-20T14:30:00Z',
            endTime: '2025-09-20T16:45:00Z',
            duration: '2h 15m',
            finalAccuracy: 0.947,
            cost: 34.50,
            user: 'Dr. Sarah Chen',
            project: 'Customer AI Assistant'
          },
          {
            id: 'exp-hist-002',
            name: 'Image Classification Model Training',
            type: 'training',
            status: 'completed',
            startTime: '2025-09-20T09:00:00Z',
            endTime: '2025-09-20T11:30:00Z',
            duration: '2h 30m',
            finalAccuracy: 0.923,
            cost: 28.70,
            user: 'Mike Johnson',
            project: 'Quality Control AI'
          },
          {
            id: 'exp-hist-003',
            name: 'Time Series Forecasting Experiment',
            type: 'forecasting',
            status: 'failed',
            startTime: '2025-09-19T16:00:00Z',
            endTime: '2025-09-19T16:15:00Z',
            duration: '15m',
            errorMessage: 'Data format incompatible with model input',
            cost: 1.20,
            user: 'Lisa Wang',
            project: 'Financial Prediction AI'
          }
        ],
        summary: {
          totalExperiments: 47,
          runningExperiments: 3,
          queuedExperiments: 2,
          completedToday: 5,
          totalGpuHours: 156.7,
          totalCost: 1247.50,
          avgSuccessRate: 87.2
        }
      });
    };

    updateTrackingData();
    const interval = setInterval(updateTrackingData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'queued': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return 'secondary';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'queued': return 'yellow';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fine-tuning': return <Target className="w-4 h-4" />;
      case 'training': return <Play className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'preprocessing': return <BarChart3 className="w-4 h-4" />;
      case 'deployment': return <Zap className="w-4 h-4" />;
      case 'benchmarking': return <Activity className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const controlExperiment = (experimentId: string, action: string) => {
    alert(`${action.toUpperCase()} experiment ${experimentId}`);
    // In real implementation, this would send API calls to control experiments
  };

  if (!trackingData) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-400">Loading experiment tracking data...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Experiment Tracking System</h2>
            <p className="text-cyan-200">Monitor active experiments and track historical performance</p>
          </div>
        </div>
        <p className="text-slate-300">
          Real-time monitoring of all AI experiments with detailed progress tracking, 
          resource utilization, and historical analysis.
        </p>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{trackingData.summary.runningExperiments}</div>
          <div className="text-sm text-blue-300">Running Now</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-500">Live</span>
          </div>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{trackingData.summary.queuedExperiments}</div>
          <div className="text-sm text-yellow-300">In Queue</div>
          <div className="text-xs text-yellow-500 mt-1">Waiting for resources</div>
        </div>
        <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{trackingData.summary.completedToday}</div>
          <div className="text-sm text-green-300">Completed Today</div>
          <div className="text-xs text-green-500 mt-1">{trackingData.summary.avgSuccessRate}% success rate</div>
        </div>
        <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">{trackingData.summary.totalGpuHours}h</div>
          <div className="text-sm text-purple-300">GPU Hours</div>
          <div className="text-xs text-purple-500 mt-1">Total consumed</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setCurrentView('active')}
          variant={currentView === 'active' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Active ({trackingData.summary.runningExperiments})
        </Button>
        <Button 
          onClick={() => setCurrentView('queued')}
          variant={currentView === 'queued' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Timer className="w-4 h-4" />
          Queued ({trackingData.summary.queuedExperiments})
        </Button>
        <Button 
          onClick={() => setCurrentView('history')}
          variant={currentView === 'history' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          History
        </Button>
      </div>

      {/* Active Experiments Tab */}
      {currentView === 'active' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Active Experiments</h3>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {trackingData.activeExperiments.map((exp: any) => (
                <Card key={exp.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        {getTypeIcon(exp.type)}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{exp.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary">{exp.type}</Badge>
                          <span className="text-slate-400">by {exp.user}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => controlExperiment(exp.id, 'pause')}>
                        <Pause className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => controlExperiment(exp.id, 'stop')}>
                        <Square className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">{exp.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${exp.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Experiment Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Started:</span>
                      <span className="text-white ml-1">{new Date(exp.startTime).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">ETA:</span>
                      <span className="text-white ml-1">{new Date(exp.estimatedCompletion).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">GPU Usage:</span>
                      <span className="text-green-400 ml-1">{exp.gpuUsage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-yellow-400 ml-1">${exp.cost}</span>
                    </div>
                  </div>

                  {/* Type-specific metrics */}
                  {exp.type === 'fine-tuning' && (
                    <div className="mt-3 p-3 bg-slate-600 rounded text-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400">Epoch:</span>
                          <span className="text-white ml-1">{exp.currentEpoch}/{exp.totalEpochs}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Accuracy:</span>
                          <span className="text-green-400 ml-1">{exp.currentAccuracy}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Project:</span>
                          <span className="text-white ml-1">{exp.project}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {exp.type === 'optimization' && (
                    <div className="mt-3 p-3 bg-slate-600 rounded text-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400">Trial:</span>
                          <span className="text-white ml-1">{exp.currentTrial}/{exp.totalTrials}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Best Accuracy:</span>
                          <span className="text-green-400 ml-1">{exp.bestAccuracy}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Project:</span>
                          <span className="text-white ml-1">{exp.project}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {exp.type === 'preprocessing' && (
                    <div className="mt-3 p-3 bg-slate-600 rounded text-sm">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-slate-400">Step:</span>
                          <span className="text-white ml-1">{exp.currentStep}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Records:</span>
                          <span className="text-white ml-1">{exp.recordsProcessed.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Project:</span>
                          <span className="text-white ml-1">{exp.project}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Queued Experiments Tab */}
      {currentView === 'queued' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Experiment Queue</h3>
            
            <div className="space-y-4">
              {trackingData.queuedExperiments.map((exp: any) => (
                <Card key={exp.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-400 font-bold text-sm">#{exp.queuePosition}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{exp.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="yellow">Queued</Badge>
                          <Badge variant="secondary">{exp.type}</Badge>
                          <span className="text-slate-400">by {exp.user}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-400 border-red-400">
                      Cancel
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Est. Start:</span>
                      <span className="text-white ml-1">{new Date(exp.estimatedStart).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white ml-1">{exp.estimatedDuration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">GPUs:</span>
                      <span className="text-white ml-1">{exp.requiredGPUs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Est. Cost:</span>
                      <span className="text-yellow-400 ml-1">${exp.estimatedCost}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Historical Experiments Tab */}
      {currentView === 'history' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search experiments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Experiment History</h3>
            
            <div className="space-y-4">
              {trackingData.historicalExperiments.map((exp: any) => (
                <Card key={exp.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        exp.status === 'completed' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {exp.status === 'completed' ? 
                          <CheckCircle className="w-4 h-4 text-green-400" /> : 
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{exp.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={getStatusBadge(exp.status)}>{exp.status}</Badge>
                          <Badge variant="secondary">{exp.type}</Badge>
                          <span className="text-slate-400">by {exp.user}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white ml-1">{exp.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-white ml-1">${exp.cost}</span>
                    </div>
                    {exp.finalAccuracy && (
                      <div>
                        <span className="text-slate-400">Accuracy:</span>
                        <span className="text-green-400 ml-1">{exp.finalAccuracy}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Project:</span>
                      <span className="text-white ml-1">{exp.project}</span>
                    </div>
                  </div>

                  {exp.errorMessage && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm">
                      <span className="text-red-400 font-medium">Error: </span>
                      <span className="text-red-300">{exp.errorMessage}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(exp.startTime).toLocaleString()} - {new Date(exp.endTime).toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Action Panel */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Experiment Management</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="btn-primary flex items-center gap-2 justify-center">
            <Play className="w-4 h-4" />
            Start New Experiment
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Download className="w-4 h-4" />
            Export Results
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Settings className="w-4 h-4" />
            Configure Alerts
          </Button>
        </div>
      </Card>
    </div>
  );
}
