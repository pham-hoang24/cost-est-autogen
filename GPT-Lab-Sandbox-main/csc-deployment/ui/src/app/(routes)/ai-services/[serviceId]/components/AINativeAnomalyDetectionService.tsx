'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Activity, 
  AlertTriangle, 
  Brain, 
  Database, 
  Download, 
  Eye, 
  FileText, 
  Image, 
  Network, 
  Play, 
  Settings, 
  TrendingUp, 
  Upload, 
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  PieChart,
  LineChart,
  TrendingDown,
  Target,
  Shield,
  AlertCircle,
  Star,
  Award
} from 'lucide-react';

interface AnomalyDetectionJob {
  job_id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  filename?: string;
  data_shape?: [number, number];
  columns?: string[];
  total_anomalies?: number;
  total_points?: number;
  anomaly_rate?: number;
  created_at: string;
  results?: any[];
}

interface DetectionModel {
  id: string;
  name: string;
  description: string;
  best_for: string[];
  parameters: Record<string, any>;
}

interface ModelPerformance {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_time: number;
  inference_time: number;
}

interface DemoScenario {
  title: string;
  description: string;
  data_types: string[];
  use_cases: string[];
  benefits: string[];
}

export default function AINativeAnomalyDetectionService() {
  const [jobs, setJobs] = useState<AnomalyDetectionJob[]>([]);
  const [models, setModels] = useState<Record<string, DetectionModel[]>>({});
  const [performance, setPerformance] = useState<Record<string, ModelPerformance>>({});
  const [scenarios, setScenarios] = useState<Record<string, DemoScenario>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('isolation_forest');
  const [modelParams, setModelParams] = useState<Record<string, any>>({});
  const [threshold, setThreshold] = useState(0.5);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [anomalyTrends, setAnomalyTrends] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  const API_BASE = 'http://localhost:8083/api';

  useEffect(() => {
    // Load demo data immediately
    loadDemoData();
    
    // Then try to fetch from API
    fetchModels();
    fetchPerformance();
    fetchScenarios();
    fetchJobs();
  }, []);

  const loadDemoData = () => {
    // Load demo models
    setModels({
      statistical: [
        {
          id: 'isolation_forest',
          name: 'Isolation Forest',
          description: 'Unsupervised learning for outlier detection',
          best_for: ['time_series', 'structured', 'network'],
          parameters: {
            contamination: { type: 'float', min: 0.01, max: 0.5, default: 0.1 },
            n_estimators: { type: 'int', min: 10, max: 1000, default: 100 }
          }
        }
      ],
      deep_learning: [
        {
          id: 'autoencoder',
          name: 'Autoencoder',
          description: 'Neural network for reconstruction-based anomaly detection',
          best_for: ['time_series', 'structured', 'image'],
          parameters: {
            encoding_dim: { type: 'int', min: 8, max: 128, default: 32 },
            epochs: { type: 'int', min: 10, max: 200, default: 50 }
          }
        }
      ],
      llm_powered: [
        {
          id: 'llm_analysis',
          name: 'LLM-Powered Analysis',
          description: 'Advanced anomaly detection using large language models',
          best_for: ['text', 'structured'],
          parameters: {
            model: { type: 'str', options: ['gpt-4', 'claude-3', 'llama-2'], default: 'gpt-4' },
            context_window: { type: 'int', min: 100, max: 4000, default: 1000 }
          }
        }
      ],
      ensemble: [
        {
          id: 'ensemble_model',
          name: 'Ensemble Model',
          description: 'Combines multiple algorithms for robust detection',
          best_for: ['time_series', 'structured', 'network', 'text'],
          parameters: {
            models: { type: 'list', options: ['isolation_forest', 'autoencoder', 'lstm'], default: ['isolation_forest', 'autoencoder'] },
            voting: { type: 'str', options: ['average', 'weighted', 'majority'], default: 'average' }
          }
        }
      ]
    });

    // Load demo performance
    setPerformance({
      "isolation_forest": {
        "model_name": "Isolation Forest",
        "accuracy": 0.94,
        "precision": 0.89,
        "recall": 0.92,
        "f1_score": 0.90,
        "training_time": 2.5,
        "inference_time": 0.05
      },
      "autoencoder": {
        "model_name": "Autoencoder",
        "accuracy": 0.91,
        "precision": 0.87,
        "recall": 0.89,
        "f1_score": 0.88,
        "training_time": 45.2,
        "inference_time": 0.12
      },
      "lstm": {
        "model_name": "LSTM Network",
        "accuracy": 0.93,
        "precision": 0.91,
        "recall": 0.90,
        "f1_score": 0.90,
        "training_time": 168.2,
        "inference_time": 0.15
      }
    });

    // Load demo scenarios
    setScenarios({
      "academic_research": {
        "title": "Academic Research Scenario",
        "description": "Detect unusual patterns in experimental data",
        "data_types": ["time_series", "structured"],
        "use_cases": [
          "Sensor data analysis",
          "Experimental result validation",
          "Data quality assessment"
        ],
        "benefits": [
          "Identify new research opportunities",
          "Ensure data integrity",
          "Publish findings"
        ]
      },
      "industry_monitoring": {
        "title": "Industry Monitoring",
        "description": "Monitor manufacturing and operational systems",
        "data_types": ["time_series", "network", "structured"],
        "use_cases": [
          "Predictive maintenance",
          "Quality control",
          "Process optimization"
        ],
        "benefits": [
          "Reduce downtime",
          "Improve efficiency",
          "Save costs"
        ]
      },
      "government_public": {
        "title": "Government & Public Sector",
        "description": "Ensure public safety and security",
        "data_types": ["network", "text", "structured"],
        "use_cases": [
          "Fraud detection",
          "Public sentiment analysis"
        ],
        "benefits": [
          "Ensure public safety",
          "Prevent fraud",
          "Improve services"
        ]
      }
    });

    // Load demo jobs
    loadDemoJobs();
    
    // Load demo chart data
    loadDemoChartData();
  };

  const loadDemoChartData = () => {
    // Anomaly trends over time
    setAnomalyTrends([
      { date: '2024-01-01', anomalies: 12, normal: 988 },
      { date: '2024-01-02', anomalies: 8, normal: 992 },
      { date: '2024-01-03', anomalies: 15, normal: 985 },
      { date: '2024-01-04', anomalies: 23, normal: 977 },
      { date: '2024-01-05', anomalies: 18, normal: 982 },
      { date: '2024-01-06', anomalies: 31, normal: 969 },
      { date: '2024-01-07', anomalies: 27, normal: 973 },
      { date: '2024-01-08', anomalies: 19, normal: 981 },
      { date: '2024-01-09', anomalies: 14, normal: 986 },
      { date: '2024-01-10', anomalies: 22, normal: 978 },
      { date: '2024-01-11', anomalies: 16, normal: 984 },
      { date: '2024-01-12', anomalies: 29, normal: 971 },
      { date: '2024-01-13', anomalies: 25, normal: 975 },
      { date: '2024-01-14', anomalies: 21, normal: 979 }
    ]);

    // Model performance data
    setModelPerformance([
      { model: 'Isolation Forest', accuracy: 94.2, precision: 89.1, recall: 92.3, f1: 90.7 },
      { model: 'Autoencoder', accuracy: 91.8, precision: 87.5, recall: 89.2, f1: 88.3 },
      { model: 'LSTM', accuracy: 93.5, precision: 91.2, recall: 90.1, f1: 90.6 },
      { model: 'One-Class SVM', accuracy: 89.7, precision: 85.3, recall: 87.8, f1: 86.5 },
      { model: 'Ensemble', accuracy: 95.1, precision: 92.8, recall: 93.4, f1: 93.1 }
    ]);

    // Real-time data simulation
    const generateRealTimeData = () => {
      const data = [];
      const now = new Date();
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now.getTime() - (49 - i) * 60000); // Last 50 minutes
        data.push({
          timestamp: timestamp.toISOString(),
          value: Math.random() * 100 + 50,
          isAnomaly: Math.random() < 0.1,
          confidence: Math.random() * 0.3 + 0.7
        });
      }
      return data;
    };
    setRealTimeData(generateRealTimeData());
  };

  const loadDemoJobs = () => {
    const demoJobs: AnomalyDetectionJob[] = [
      {
        job_id: 'demo-1',
        status: 'completed',
        filename: 'sensor_data.csv',
        data_shape: [1000, 5],
        columns: ['timestamp', 'temperature', 'pressure', 'humidity', 'vibration'],
        total_anomalies: 23,
        total_points: 1000,
        anomaly_rate: 0.023,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        job_id: 'demo-2',
        status: 'completed',
        filename: 'network_logs.json',
        data_shape: [500, 8],
        columns: ['timestamp', 'source_ip', 'dest_ip', 'protocol', 'bytes', 'duration', 'status', 'user_agent'],
        total_anomalies: 12,
        total_points: 500,
        anomaly_rate: 0.024,
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        job_id: 'demo-3',
        status: 'completed',
        filename: 'financial_data.csv',
        data_shape: [2000, 6],
        columns: ['date', 'amount', 'account', 'transaction_type', 'merchant', 'location'],
        total_anomalies: 0,
        total_points: 2000,
        anomaly_rate: 0.0,
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setJobs(demoJobs);
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/models`);
      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`${API_BASE}/performance`);
      if (response.ok) {
        const data = await response.json();
        setPerformance(data.performance);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/demo/scenarios`);
      if (response.ok) {
        const data = await response.json();
        setScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      } else {
        loadDemoJobs();
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      loadDemoJobs();
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    alert(message);
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['.csv', '.json', '.txt', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      showToast('Please upload a CSV, JSON, TXT, or Excel file', 'error');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      showToast('File size must be less than 50MB', 'error');
      return;
    }
    
    setSelectedFile(file);
    showToast(`File selected: ${file.name}`, 'success');
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        showToast('File uploaded successfully', 'success');
        setShowUploadModal(false);
        setSelectedFile(null);
        fetchJobs();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnomalyDetection = async (jobId: string) => {
    try {
      const request = {
        data_type: 'time_series',
        algorithm: selectedModel,
        parameters: modelParams,
        threshold: threshold,
        real_time: realTimeEnabled
      };

      const response = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const result = await response.json();
        showToast(`Anomaly detection completed. Found ${result.total_anomalies} anomalies.`, 'success');
        fetchJobs();
      } else {
        throw new Error('Detection failed');
      }
    } catch (error) {
      console.error('Detection error:', error);
      showToast('Failed to run anomaly detection', 'error');
    }
  };

  const handleRealTimeToggle = () => {
    if (realTimeEnabled) {
      setRealTimeEnabled(false);
    } else {
      setRealTimeEnabled(true);
      showToast('Real-time monitoring started', 'success');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'time_series':
        return <TrendingUp className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'network':
        return <Network className="h-4 w-4" />;
      case 'structured':
        return <Database className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
            <Brain className="h-8 w-8" />
            AI-Native Anomaly Detection System
          </h1>
          <p className="text-text-muted mt-2">
            Advanced anomaly detection using AI/ML models and LLM integration
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Data
          </Button>
          <Button
            onClick={handleRealTimeToggle}
            variant={realTimeEnabled ? "outline" : "primary"}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {realTimeEnabled ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Total Jobs</h3>
              <p className="text-2xl font-bold text-primary">{jobs.length}</p>
              <p className="text-xs text-text-muted">+2 from last week</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Models Available</h3>
              <p className="text-2xl font-bold text-primary">
                {Object.values(models).flat().length}
              </p>
              <p className="text-xs text-text-muted">AI/ML algorithms</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold">Anomalies Detected</h3>
              <p className="text-2xl font-bold text-primary">
                {jobs.reduce((sum, job) => sum + (job.total_anomalies || 0), 0)}
              </p>
              <p className="text-xs text-text-muted">Across all jobs</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Success Rate</h3>
              <p className="text-2xl font-bold text-primary">94.2%</p>
              <p className="text-xs text-text-muted">Detection accuracy</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: LineChart },
            { id: 'models', label: 'Models', icon: Brain },
            { id: 'workflow', label: 'End-to-End Process', icon: Settings },
            { id: 'scenarios', label: 'Demo Scenarios', icon: Play }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Detection Rate</p>
                    <p className="text-xl font-bold text-text-primary">94.2%</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">False Positives</p>
                    <p className="text-xl font-bold text-text-primary">2.1%</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Avg. Response</p>
                    <p className="text-xl font-bold text-text-primary">0.05s</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Model Score</p>
                    <p className="text-xl font-bold text-text-primary">A+</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Anomaly Trends Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-text-primary">Anomaly Detection Trends</h3>
                <div className="flex gap-2">
                  {['24h', '7d', '30d'].map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={selectedTimeRange === range ? 'primary' : 'outline'}
                      onClick={() => setSelectedTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="h-64 bg-surface rounded-lg p-4">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-text-muted mx-auto mb-2" />
                    <p className="text-text-muted">Interactive chart showing anomaly trends over time</p>
                    <p className="text-sm text-text-muted mt-1">
                      {anomalyTrends.length} data points • {anomalyTrends.reduce((sum, d) => sum + d.anomalies, 0)} total anomalies
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Insights */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Quick Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Alert</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Anomaly detection rate increased by 15% in the last 24 hours
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Trend</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Model accuracy improved to 94.2% with latest training data
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-900 dark:text-orange-100">Recommendation</span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Consider retraining models with recent anomaly patterns
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Jobs */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Recent Jobs</h3>
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.job_id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium text-text-primary">{job.filename}</p>
                        <p className="text-sm text-text-muted">
                          {job.data_shape ? `${job.data_shape[0]} rows, ${job.data_shape[1]} columns` : 'Processing...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {job.total_anomalies !== undefined && (
                        <Badge variant={job.total_anomalies > 0 ? 'red' : 'secondary'}>
                          {job.total_anomalies} anomalies
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleAnomalyDetection(job.job_id)}
                        disabled={job.status !== 'completed'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Model Performance Comparison */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Model Performance Comparison</h3>
              <div className="space-y-4">
                {modelPerformance.map((model, index) => (
                  <div key={model.model} className="p-4 bg-surface rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-text-primary">{model.model}</h4>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-text-muted">Score: {model.accuracy}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{model.accuracy}%</p>
                        <p className="text-xs text-text-muted">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{model.precision}%</p>
                        <p className="text-xs text-text-muted">Precision</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">{model.recall}%</p>
                        <p className="text-xs text-text-muted">Recall</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-500">{model.f1}%</p>
                        <p className="text-xs text-text-muted">F1 Score</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-text-muted mb-1">
                        <span>Performance</span>
                        <span>{model.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${model.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Real-time Monitoring */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-text-primary">Real-time Monitoring</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-text-muted">
                    {realTimeEnabled ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="h-64 bg-surface rounded-lg p-4">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-text-muted mx-auto mb-2" />
                    <p className="text-text-muted">Real-time anomaly detection stream</p>
                    <p className="text-sm text-text-muted mt-1">
                      {realTimeData.length} data points • {realTimeData.filter(d => d.isAnomaly).length} anomalies detected
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Anomaly Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Anomaly Types Distribution</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Statistical', count: 45, percentage: 35, color: 'bg-blue-500' },
                    { type: 'Temporal', count: 32, percentage: 25, color: 'bg-green-500' },
                    { type: 'Behavioral', count: 28, percentage: 22, color: 'bg-yellow-500' },
                    { type: 'Security', count: 23, percentage: 18, color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={item.type} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-primary">{item.type}</span>
                          <span className="text-text-muted">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className={`${item.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Detection Confidence</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">87.3%</div>
                    <p className="text-text-muted">Average Confidence</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { range: '90-100%', count: 23, color: 'bg-green-500' },
                      { range: '80-89%', count: 45, color: 'bg-blue-500' },
                      { range: '70-79%', count: 28, color: 'bg-yellow-500' },
                      { range: '60-69%', count: 12, color: 'bg-orange-500' },
                      { range: 'Below 60%', count: 8, color: 'bg-red-500' }
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-primary">{item.range}</span>
                            <span className="text-text-muted">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                            <div 
                              className={`${item.color} h-1 rounded-full transition-all duration-300`}
                              style={{ width: `${(item.count / 116) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6">
            {Object.entries(models).map(([category, modelList]) => (
              <Card key={category} className="p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-4 capitalize">
                  {category.replace('_', ' ')} Models
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modelList.map((model) => (
                    <div key={model.id} className="p-4 bg-surface rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">{model.name}</h4>
                      <p className="text-sm text-text-muted mb-3">{model.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {model.best_for.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {getDataTypeIcon(type)}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">End-to-End Anomaly Detection Process</h3>
              <p className="text-text-muted mb-6">
                Complete workflow from data ingestion to anomaly detection and analysis
              </p>
              
              <div className="space-y-6">
                {/* Step 1 */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Data Ingestion & Preprocessing</h3>
                      <p className="text-text-muted mb-4">
                        Upload and validate your data from multiple sources including CSV, JSON, time series, images, and text files.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Supported Formats</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• CSV files</li>
                            <li>• JSON data</li>
                            <li>• Time series</li>
                            <li>• Images (PNG, JPG)</li>
                            <li>• Text documents</li>
                          </ul>
                        </div>
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Data Validation</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Format checking</li>
                            <li>• Schema validation</li>
                            <li>• Quality assessment</li>
                            <li>• Missing value detection</li>
                          </ul>
                        </div>
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Preprocessing</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Normalization</li>
                            <li>• Feature engineering</li>
                            <li>• Dimensionality reduction</li>
                            <li>• Data cleaning</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Model Selection & Configuration</h3>
                      <p className="text-text-muted mb-4">
                        Choose from a variety of AI/ML models optimized for different data types and anomaly patterns.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Statistical Models</h4>
                          <div className="space-y-2">
                            <div className="bg-surface p-3 rounded">
                              <p className="text-sm text-text-primary font-medium">Isolation Forest</p>
                              <p className="text-xs text-text-muted">Unsupervised outlier detection</p>
                            </div>
                            <div className="bg-surface p-3 rounded">
                              <p className="text-sm text-text-primary font-medium">One-Class SVM</p>
                              <p className="text-xs text-text-muted">Support vector machine approach</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Deep Learning Models</h4>
                          <div className="space-y-2">
                            <div className="bg-surface p-3 rounded">
                              <p className="text-sm text-text-primary font-medium">Autoencoders</p>
                              <p className="text-xs text-text-muted">Reconstruction-based detection</p>
                            </div>
                            <div className="bg-surface p-3 rounded">
                              <p className="text-sm text-text-primary font-medium">LSTM Networks</p>
                              <p className="text-xs text-text-muted">Time series anomaly detection</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Real-time Detection & Monitoring</h3>
                      <p className="text-text-muted mb-4">
                        Monitor your data streams in real-time with configurable thresholds and alerting.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Real-time Features</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Live data streaming</li>
                            <li>• Instant anomaly alerts</li>
                            <li>• Configurable thresholds</li>
                            <li>• WebSocket integration</li>
                          </ul>
                        </div>
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Monitoring Dashboard</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Live anomaly visualization</li>
                            <li>• Performance metrics</li>
                            <li>• Alert management</li>
                            <li>• Historical analysis</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 4 */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Results Analysis & Reporting</h3>
                      <p className="text-text-muted mb-4">
                        Analyze detected anomalies with detailed reports, visualizations, and actionable insights.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Analysis Tools</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Anomaly scoring</li>
                            <li>• Pattern recognition</li>
                            <li>• Root cause analysis</li>
                            <li>• Trend analysis</li>
                          </ul>
                        </div>
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Reporting</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Automated reports</li>
                            <li>• Export capabilities</li>
                            <li>• Custom dashboards</li>
                            <li>• API integration</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 5 */}
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 font-bold text-lg">5</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Integration & Deployment</h3>
                      <p className="text-text-muted mb-4">
                        Seamlessly integrate anomaly detection into your existing systems and workflows.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Integration Options</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• REST API endpoints</li>
                            <li>• WebSocket connections</li>
                            <li>• Webhook notifications</li>
                            <li>• Database integration</li>
                          </ul>
                        </div>
                        <div className="bg-surface p-4 rounded-lg">
                          <h4 className="font-medium text-text-primary mb-2">Deployment</h4>
                          <ul className="text-sm text-text-muted space-y-1">
                            <li>• Cloud deployment</li>
                            <li>• On-premises setup</li>
                            <li>• Container support</li>
                            <li>• Scalable architecture</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Demo Workflow */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Try the Demo Workflow</h3>
              <p className="text-text-muted mb-4">
                Experience the complete anomaly detection process with our interactive demo.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Sample Data
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('scenarios')}>
                  <Play className="h-4 w-4 mr-2" />
                  View Demo Scenarios
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <Card key={key} className="p-6">
                <h3 className="text-xl font-semibold text-text-primary mb-2">{scenario.title}</h3>
                <p className="text-text-muted mb-4">{scenario.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Data Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {scenario.data_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getDataTypeIcon(type)}
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Use Cases</h4>
                    <ul className="text-sm text-text-muted space-y-1">
                      {scenario.use_cases.map((useCase, index) => (
                        <li key={index}>• {useCase}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Benefits</h4>
                    <ul className="text-sm text-text-muted space-y-1">
                      {scenario.benefits.map((benefit, index) => (
                        <li key={index}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Data File</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files.length > 0) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-muted mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.json,.txt,.xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Choose File
              </label>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-surface rounded-lg">
                <p className="text-sm text-text-primary">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}