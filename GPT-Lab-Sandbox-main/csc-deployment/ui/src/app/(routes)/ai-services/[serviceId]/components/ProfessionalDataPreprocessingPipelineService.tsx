'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Progress } from '@/components/Progress';
import {
  Database,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Target,
  Shield,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Search,
  Layers,
  Activity,
  BarChart,
  LineChart,
  Calendar,
  Users,
  DollarSign,
  Heart,
  Cpu,
  Wifi,
  Thermometer,
  Gauge,
  Battery,
  Volume2,
  Lightbulb,
  Star,
  Award,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  X,
  Check,
  Info,
  AlertTriangle,
  RefreshCw,
  Save,
  Share2,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Grid,
  List,
  Table,
  Columns,
  Rows,
  Hash,
  Type,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Tag,
  Tag as Label,
  Bookmark,
  Flag,
  Pin,
  Map,
  Navigation,
  Compass,
  Globe,
  Wifi as WifiIcon,
  Signal,
  Battery as BatteryIcon,
  Power,
  Zap as ZapIcon,
  Zap as Flash,
  Zap as Thunder,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Flame,
  Snowflake,
  Sparkles,
  Rainbow,
  Palette,
  Paintbrush,
  Brush,
  Eraser,
  Scissors,
  Scissors as Cut,
  Copy as CopyIcon,
  Clipboard as Paste,
  Undo,
  Redo,
  History,
  Archive,
  Folder,
  FolderOpen,
  File,
  FileText as FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  File as FilePdf,
  File as FileWord,
  File as FileExcel,
  File as FilePowerpoint,
  File as FileZip,
  File as FileArchive,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  Download as FileDownload,
  Upload as FileUpload,
  Share as FileShare,
  Lock as FileLock,
  Unlock as FileUnlock,
  Heart as FileHeart,
  Star as FileStar,
  Award as FileAward,
  Badge as FileBadge,
  File as FileCertificate,
  File as FileContract,
  File as FileInvoice,
  File as FileReceipt,
  File as FileReport,
  FileCode as FileScript,
  Settings as FileSettings,
  Sliders as FileSliders,
  Terminal as FileTerminal,
  File as FileType,
  FileVideo as FileVideo2,
  Volume2 as FileVolume2,
  Wrench as FileWrench,
  FileX as FileX2,
  File as FileY,
  File as FileZ,
  File as File1,
  File as File2,
  File as File3,
  File as File4,
  File as File5,
  File as File6,
  File as File7,
  File as File8,
  File as File9,
  File as File0
} from 'lucide-react';

interface DataPreprocessingPipelineServiceProps {
  service: any;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  size: string;
  records: number;
  features: number;
  quality_score: number;
  data_types: string[];
  use_cases: string[];
  sample_preview: any[];
}

interface ProcessingStep {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  processing_time?: string;
  records_processed?: number;
}

interface QualityMetrics {
  completeness: number;
  uniqueness: number;
  validity: number;
  consistency: number;
  accuracy: number;
  overall_score: number;
}

interface ProcessingSummary {
  timestamp: string;
  original_shape: [number, number];
  processed_shape: [number, number];
  processing_steps: ProcessingStep[];
  quality_metrics: QualityMetrics;
  outliers_detected: number;
  features_processed: number;
  memory_usage_mb: number;
  processing_time: string;
  recommendations: string[];
}

const ProfessionalDataPreprocessingPipelineService: React.FC<DataPreprocessingPipelineServiceProps> = ({ service }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [processingSummary, setProcessingSummary] = useState<ProcessingSummary | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [visualizations, setVisualizations] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  // Demo datasets
  const demoDatasets: Dataset[] = [
    {
      id: 'ecommerce-customers',
      name: 'E-commerce Customer Data',
      description: 'Customer transaction and behavior data for recommendation systems',
      size: '2.4 MB',
      records: 15000,
      features: 12,
      quality_score: 87,
      data_types: ['numeric', 'categorical', 'datetime'],
      use_cases: ['Customer Segmentation', 'Recommendation Systems', 'Churn Prediction'],
      sample_preview: [
        { customer_id: 'CUST_001', age: 28, purchase_amount: 125.50, category: 'Electronics' },
        { customer_id: 'CUST_002', age: 35, purchase_amount: 89.99, category: 'Clothing' },
        { customer_id: 'CUST_003', age: 42, purchase_amount: 234.75, category: 'Home & Garden' }
      ]
    },
    {
      id: 'financial-transactions',
      name: 'Financial Transaction Data',
      description: 'Banking transaction data for fraud detection and risk analysis',
      size: '5.8 MB',
      records: 25000,
      features: 15,
      quality_score: 92,
      data_types: ['numeric', 'categorical', 'datetime'],
      use_cases: ['Fraud Detection', 'Risk Assessment', 'Transaction Analysis'],
      sample_preview: [
        { transaction_id: 'TXN_001', amount: 150.00, type: 'debit', merchant: 'Amazon' },
        { transaction_id: 'TXN_002', amount: 75.50, type: 'credit', merchant: 'Salary' },
        { transaction_id: 'TXN_003', amount: 25.99, type: 'debit', merchant: 'Starbucks' }
      ]
    },
    {
      id: 'medical-records',
      name: 'Medical Records Dataset',
      description: 'Anonymized patient medical records for healthcare analytics',
      size: '3.2 MB',
      records: 8000,
      features: 18,
      quality_score: 89,
      data_types: ['numeric', 'categorical', 'text'],
      use_cases: ['Disease Prediction', 'Treatment Optimization', 'Patient Risk Assessment'],
      sample_preview: [
        { patient_id: 'P_001', age: 45, blood_pressure: 120, diagnosis: 'Hypertension' },
        { patient_id: 'P_002', age: 32, blood_pressure: 110, diagnosis: 'Normal' },
        { patient_id: 'P_003', age: 58, blood_pressure: 140, diagnosis: 'High Risk' }
      ]
    },
    {
      id: 'iot-sensor-data',
      name: 'IoT Sensor Data',
      description: 'Industrial sensor data for predictive maintenance and monitoring',
      size: '7.1 MB',
      records: 50000,
      features: 8,
      quality_score: 94,
      data_types: ['numeric', 'datetime'],
      use_cases: ['Predictive Maintenance', 'Anomaly Detection', 'Performance Monitoring'],
      sample_preview: [
        { sensor_id: 'SENSOR_001', temperature: 72.5, pressure: 15.2, vibration: 0.8 },
        { sensor_id: 'SENSOR_002', temperature: 68.3, pressure: 14.8, vibration: 0.6 },
        { sensor_id: 'SENSOR_003', temperature: 75.1, pressure: 16.1, vibration: 1.2 }
      ]
    }
  ];

  useEffect(() => {
    setDatasets(demoDatasets);
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8086/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.log('Using demo analytics data');
      setAnalytics({
        total_processed_datasets: 127,
        average_processing_time: '3m 45s',
        average_quality_score: 89.2,
        most_common_issues: [
          { issue: 'Missing Values', frequency: 45, percentage: 35.4 },
          { issue: 'Outliers', frequency: 32, percentage: 25.2 },
          { issue: 'Data Type Mismatch', frequency: 28, percentage: 22.0 },
          { issue: 'Duplicate Records', frequency: 22, percentage: 17.3 }
        ],
        processing_trends: [
          { date: '2024-01-01', datasets_processed: 12, avg_quality: 87.5 },
          { date: '2024-01-02', datasets_processed: 15, avg_quality: 89.2 },
          { date: '2024-01-03', datasets_processed: 18, avg_quality: 91.1 },
          { date: '2024-01-04', datasets_processed: 22, avg_quality: 88.7 },
          { date: '2024-01-05', datasets_processed: 19, avg_quality: 92.3 }
        ]
      });
    }
  };

  const startProcessing = async () => {
    if (!selectedDataset) {
      alert('Please select a dataset first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentStep(0);

    // Initialize processing steps
    const steps: ProcessingStep[] = [
      {
        name: 'Data Loading',
        description: 'Loading dataset and performing initial profiling',
        status: 'running',
        progress: 0
      },
      {
        name: 'Missing Value Analysis',
        description: 'Analyzing and handling missing values',
        status: 'pending',
        progress: 0
      },
      {
        name: 'Outlier Detection',
        description: 'Detecting and handling outliers',
        status: 'pending',
        progress: 0
      },
      {
        name: 'Feature Encoding',
        description: 'Encoding categorical variables',
        status: 'pending',
        progress: 0
      },
      {
        name: 'Feature Scaling',
        description: 'Scaling numerical features',
        status: 'pending',
        progress: 0
      },
      {
        name: 'Quality Validation',
        description: 'Validating data quality and generating reports',
        status: 'pending',
        progress: 0
      }
    ];

    setProcessingSteps(steps);

    // Simulate processing
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update current step to running
      setProcessingSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' as const } : step
      ));

      // Simulate processing time
      for (let progress = 0; progress <= 100; progress += 10) {
        setProcessingProgress(progress);
        setProcessingSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, progress } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mark step as completed
      setProcessingSteps(prev => prev.map((step, index) => 
        index === i ? { 
          ...step, 
          status: 'completed' as const, 
          progress: 100,
          processing_time: `${Math.random() * 30 + 10}s`,
          records_processed: selectedDataset.records
        } : step
      ));
    }

    // Generate processing summary
    const summary: ProcessingSummary = {
      timestamp: new Date().toISOString(),
      original_shape: [selectedDataset.records, selectedDataset.features],
      processed_shape: [Math.floor(selectedDataset.records * 0.99), selectedDataset.features + 3],
      processing_steps: steps.map(step => ({ ...step, status: 'completed' as const, progress: 100 })),
      quality_metrics: {
        completeness: 94.2,
        uniqueness: 98.7,
        validity: 91.5,
        consistency: 89.3,
        accuracy: 87.8,
        overall_score: 92.3
      },
      outliers_detected: Math.floor(selectedDataset.records * 0.01),
      features_processed: selectedDataset.features + 3,
      memory_usage_mb: parseFloat(selectedDataset.size),
      processing_time: '2m 34s',
      recommendations: [
        'Consider additional feature engineering for better model performance',
        'Dataset shows good quality with minimal cleaning needed',
        'Recommended train/validation/test split: 70/15/15',
        'Consider dimensionality reduction for high-dimensional data'
      ]
    };

    setProcessingSummary(summary);
    setIsProcessing(false);
    setActiveTab('results');
    
    // Generate visualizations after processing
    generateVisualizations(selectedDataset.id);
  };

  const generateVisualizations = async (datasetType: string) => {
    setIsLoadingCharts(true);
    try {
      const response = await fetch('http://localhost:8086/api/visualizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset_type: datasetType })
      });

      if (response.ok) {
        const data = await response.json();
        setVisualizations(data.visualizations);
      } else {
        console.error('Failed to generate visualizations');
      }
    } catch (error) {
      console.error('Visualization generation error:', error);
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const generatePDFReport = async () => {
    if (!processingSummary) {
      alert('No processing results available');
      return;
    }

    setIsGeneratingReport(true);
    
    try {
      const response = await fetch('http://localhost:8086/api/report/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processingSummary)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create download link
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.pdf_data}`;
        link.download = data.filename;
        link.click();
      } else {
        alert('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF generation failed');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Data Preprocessing Pipeline
          </h1>
          <p className="text-text-muted mt-2">
            Professional-grade data cleaning, transformation, and analysis with comprehensive reporting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {processingSummary && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={generatePDFReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGeneratingReport ? 'Generating...' : 'Download Report'}
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-surface p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'datasets', label: 'Datasets', icon: Database },
          { id: 'processing', label: 'Processing', icon: Settings },
          { id: 'results', label: 'Results', icon: CheckCircle },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'visualizations', label: 'Charts', icon: PieChart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-surface'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Total Datasets</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {analytics?.total_processed_datasets || 127}
                  </p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Avg Processing Time</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {analytics?.average_processing_time || '3m 45s'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {analytics?.average_quality_score || 89.2}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Success Rate</p>
                  <p className="text-2xl font-bold text-text-primary">98.5%</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>
          </div>

          {/* Processing Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Processing Trends
            </h3>
            <div className="h-64 flex items-center justify-center bg-surface rounded-lg">
              <div className="text-center">
                <BarChart className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-text-muted">Processing trends over time</p>
                <p className="text-sm text-text-muted mt-1">
                  {analytics?.processing_trends?.length || 5} data points available
                </p>
              </div>
            </div>
          </Card>

          {/* Common Issues */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Most Common Data Issues
            </h3>
            <div className="space-y-3">
              {analytics?.most_common_issues?.map((issue: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-text-primary">{issue.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">{issue.frequency} cases</span>
                    <Badge variant="outline">{issue.percentage}%</Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center text-text-muted py-8">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No analytics data available</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Datasets Tab */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">Available Datasets</h2>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Custom Dataset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {datasets.map((dataset) => (
              <Card 
                key={dataset.id} 
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedDataset?.id === dataset.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDataset(dataset)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{dataset.name}</h3>
                    <p className="text-text-muted text-sm mt-1">{dataset.description}</p>
                  </div>
                  <Badge variant={getQualityBadge(dataset.quality_score)}>
                    {dataset.quality_score}% Quality
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-text-muted">Records</p>
                    <p className="font-semibold text-text-primary">{dataset.records.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Features</p>
                    <p className="font-semibold text-text-primary">{dataset.features}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Size</p>
                    <p className="font-semibold text-text-primary">{dataset.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Types</p>
                    <p className="font-semibold text-text-primary">{dataset.data_types.length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-text-muted">Use Cases:</p>
                  <div className="flex flex-wrap gap-1">
                    {dataset.use_cases.map((useCase, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedDataset?.id === dataset.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={startProcessing}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {isProcessing ? 'Processing...' : 'Start Processing'}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processing Tab */}
      {activeTab === 'processing' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Processing Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Data Cleaning</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Missing Value Strategy</span>
                    <Badge variant="outline">Auto</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Outlier Detection</span>
                    <Badge variant="outline">IQR Method</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Duplicate Handling</span>
                    <Badge variant="outline">Remove</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Feature Engineering</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Encoding Method</span>
                    <Badge variant="outline">Auto</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Scaling Method</span>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Feature Selection</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Processing Steps */}
          {processingSteps.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Processing Steps
              </h3>
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : step.status === 'running' ? (
                        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                      ) : (
                        <Clock className="w-6 h-6 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">{step.name}</h4>
                      <p className="text-sm text-text-muted">{step.description}</p>
                      {step.processing_time && (
                        <p className="text-xs text-text-muted mt-1">
                          Processing time: {step.processing_time}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-24">
                        <Progress value={step.progress} className="mb-1" />
                        <p className="text-xs text-text-muted text-center">{step.progress}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {processingSummary ? (
            <>
              {/* Processing Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Processing Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">
                      {processingSummary.original_shape[0].toLocaleString()}
                    </p>
                    <p className="text-sm text-text-muted">Original Records</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">
                      {processingSummary.processed_shape[0].toLocaleString()}
                    </p>
                    <p className="text-sm text-text-muted">Processed Records</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">
                      {processingSummary.processing_time}
                    </p>
                    <p className="text-sm text-text-muted">Processing Time</p>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Data Quality Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(processingSummary.quality_metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <span className="text-text-primary capitalize">{key.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{width: `${value}%`}}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getQualityColor(value)}`}>
                            {value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {processingSummary.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-text-primary">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Database className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Processing Results</h3>
              <p className="text-text-muted mb-4">
                Start processing a dataset to see results here
              </p>
              <Button variant="outline" onClick={() => setActiveTab('datasets')}>
                <Database className="w-4 h-4 mr-2" />
                Select Dataset
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Processing Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Total Datasets Processed</span>
                    <Badge variant="accent">{analytics?.total_processed_datasets || 127}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Average Processing Time</span>
                    <Badge variant="outline">{analytics?.average_processing_time || '3m 45s'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Average Quality Score</span>
                    <Badge variant="green">{analytics?.average_quality_score || 89.2}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Success Rate</span>
                    <Badge variant="green">98.5%</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Common Issues</h3>
                <div className="space-y-2">
                  {analytics?.most_common_issues?.map((issue: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-text-primary">{issue.issue}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{width: `${issue.percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-text-muted">{issue.percentage}%</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-text-muted">No analytics data available</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Visualizations Tab */}
      {activeTab === 'visualizations' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Data Visualizations
              </h2>
              {selectedDataset && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateVisualizations(selectedDataset.id)}
                  disabled={isLoadingCharts}
                >
                  {isLoadingCharts ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isLoadingCharts ? 'Generating...' : 'Refresh Charts'}
                </Button>
              )}
            </div>

            {isLoadingCharts ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-text-muted">Generating visualizations...</p>
                </div>
              </div>
            ) : Object.keys(visualizations).length > 0 ? (
              <div className="space-y-8">
                {/* Data Distributions */}
                {visualizations.data_distributions && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <BarChart className="w-5 h-5" />
                      Data Distribution Analysis
                    </h3>
                    <div className="bg-surface rounded-lg p-4">
                      <img 
                        src={visualizations.data_distributions} 
                        alt="Data Distribution Analysis"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Quality Metrics */}
                {visualizations.quality_metrics && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Data Quality Metrics
                    </h3>
                    <div className="bg-surface rounded-lg p-4">
                      <img 
                        src={visualizations.quality_metrics} 
                        alt="Quality Metrics"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Processing Trends */}
                {visualizations.processing_trends && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Processing Trends
                    </h3>
                    <div className="bg-surface rounded-lg p-4">
                      <img 
                        src={visualizations.processing_trends} 
                        alt="Processing Trends"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Correlation Matrix */}
                {visualizations.correlation_matrix && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <BarChart className="w-5 h-5" />
                      Feature Correlation Matrix
                    </h3>
                    <div className="bg-surface rounded-lg p-4">
                      <img 
                        src={visualizations.correlation_matrix} 
                        alt="Correlation Matrix"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Outlier Analysis */}
                {visualizations.outlier_analysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Outlier Analysis & Data Quality Issues
                    </h3>
                    <div className="bg-surface rounded-lg p-4">
                      <img 
                        src={visualizations.outlier_analysis} 
                        alt="Outlier Analysis"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {visualizations.performance_metrics && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Processing Performance Analysis
                    </h3>
                    <div className="bg-surface rounded-lg p-4">
                      <img 
                        src={visualizations.performance_metrics} 
                        alt="Performance Metrics"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No Visualizations Available</h3>
                  <p className="text-text-muted mb-4">
                    Process a dataset to generate comprehensive visualizations
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('datasets')}>
                    <Database className="w-4 h-4 mr-2" />
                    Select Dataset
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDataPreprocessingPipelineService;