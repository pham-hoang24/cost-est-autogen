'use client';

import { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Target,
  TrendingUp
} from 'lucide-react';

export default function ExperimentsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Demo experiment data
  const experiments = [
    {
      id: 1,
      name: "Protein Folding Prediction - Run 1",
      status: "running",
      progress: 65,
      startTime: "2024-03-01T09:00:00Z",
      duration: "2h 15m",
      dataset: "AlphaFold2 Dataset",
      model: "Transformer-3B",
      metrics: {
        accuracy: 0.87,
        loss: 0.23,
        f1Score: 0.85
      }
    },
    {
      id: 2,
      name: "Quantum Error Correction - Experiment A",
      status: "completed",
      progress: 100,
      startTime: "2024-02-28T14:30:00Z",
      duration: "2h 15m",
      dataset: "IBM Quantum Dataset",
      model: "Quantum Neural Network",
      metrics: {
        fidelity: 0.94,
        errorRate: 0.06,
        successRate: 0.88
      }
    },
    {
      id: 3,
      name: "Battery Material Analysis - Test 3",
      status: "failed",
      progress: 45,
      startTime: "2024-03-02T10:15:00Z",
      duration: "1h 15m",
      dataset: "Materials Project Database",
      model: "Graph Neural Network",
      error: "Memory allocation failed at epoch 23"
    },
    {
      id: 4,
      name: "Medical Image Classification - Validation",
      status: "scheduled",
      progress: 0,
      startTime: "2024-03-05T08:00:00Z",
      duration: "3h 00m",
      dataset: "Medical Images Dataset",
      model: "ResNet-50"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredExperiments = experiments.filter(exp => {
    if (selectedFilter === 'all') return true;
    return exp.status === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">🧪 Experiments</h1>
          <p className="text-text-muted">Manage and monitor your research experiments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Running</p>
                <p className="text-2xl font-bold text-text-primary">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Completed</p>
                <p className="text-2xl font-bold text-text-primary">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Failed</p>
                <p className="text-2xl font-bold text-text-primary">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Scheduled</p>
                <p className="text-2xl font-bold text-text-primary">1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Experiments', count: experiments.length },
            { key: 'running', label: 'Running', count: experiments.filter(e => e.status === 'running').length },
            { key: 'completed', label: 'Completed', count: experiments.filter(e => e.status === 'completed').length },
            { key: 'failed', label: 'Failed', count: experiments.filter(e => e.status === 'failed').length },
            { key: 'scheduled', label: 'Scheduled', count: experiments.filter(e => e.status === 'scheduled').length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted hover:bg-border border border-border'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Experiments List */}
        <div className="space-y-6">
          {filteredExperiments.map((experiment) => (
            <div key={experiment.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(experiment.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      {experiment.name}
                    </h3>
                    <p className="text-text-muted text-sm mb-2">
                      {experiment.dataset} • {experiment.model}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-text-muted">
                      <span>Started: {new Date(experiment.startTime).toLocaleString()}</span>
                      <span>Duration: {experiment.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(experiment.status)}`}>
                    {experiment.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {experiment.status === 'running' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">Progress</span>
                    <span className="text-sm text-text-muted">{experiment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${experiment.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Metrics */}
              {experiment.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {Object.entries(experiment.metrics).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-background rounded-lg border border-border">
                      <p className="text-sm text-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-lg font-bold text-text-primary">{typeof value === 'number' ? value.toFixed(3) : value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Message */}
              {experiment.error && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {experiment.error}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Results
                  </button>
                  <button className="flex items-center px-4 py-2 bg-surface text-text-primary rounded-lg text-sm font-medium hover:bg-border border border-border transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
                <div className="text-sm text-text-muted">
                  {experiment.status === 'running' && 'Running...'}
                  {experiment.status === 'completed' && 'Completed'}
                  {experiment.status === 'failed' && 'Failed'}
                  {experiment.status === 'scheduled' && 'Scheduled'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration of the experiments interface. 
              All data shown is sample data for preview purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}