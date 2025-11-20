'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Database, 
  Download, 
  Play, 
  Eye, 
  Clock,
  Users,
  FileText,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';

interface PreloadedDatasetsServiceProps {
  service: any;
}

export default function PreloadedDatasetsService({ service }: PreloadedDatasetsServiceProps) {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [workflowResults, setWorkflowResults] = useState<any>(null);

  const preloadedDatasets = [
    {
      id: 'dataset-1',
      name: 'Finnish Legal Documents',
      description: 'Comprehensive collection of Finnish legal documents for NLP analysis',
      category: 'Legal',
      size: '2.3GB',
      records: '15,420',
      language: 'Finnish',
      format: 'PDF, DOCX',
      compliance: 'GDPR Compliant',
      useCases: ['Document Analysis', 'Legal Research', 'Compliance Checking'],
      downloadUrl: '/datasets/finnish-legal-docs.zip',
      preview: 'Sample document preview available'
    },
    {
      id: 'dataset-2',
      name: 'Customer Sentiment Analysis',
      description: 'Multi-language customer feedback dataset for sentiment analysis',
      category: 'Business',
      size: '850MB',
      records: '45,230',
      language: 'Multi-language',
      format: 'CSV, JSON',
      compliance: 'Anonymized',
      useCases: ['Sentiment Analysis', 'Customer Insights', 'Market Research'],
      downloadUrl: '/datasets/customer-sentiment.csv',
      preview: 'Sample records available'
    },
    {
      id: 'dataset-3',
      name: 'Medical Imaging Dataset',
      description: 'X-ray and MRI images for computer vision applications',
      category: 'Healthcare',
      size: '5.7GB',
      records: '8,920',
      language: 'N/A',
      format: 'DICOM, PNG',
      compliance: 'HIPAA Compliant',
      useCases: ['Medical Diagnosis', 'Image Classification', 'Research'],
      downloadUrl: '/datasets/medical-imaging.zip',
      preview: 'Sample images available'
    },
    {
      id: 'dataset-4',
      name: 'Financial Time Series',
      description: 'Stock market and economic data for time series analysis',
      category: 'Finance',
      size: '1.2GB',
      records: '125,000',
      language: 'N/A',
      format: 'CSV, Parquet',
      compliance: 'Public Data',
      useCases: ['Predictive Analytics', 'Risk Assessment', 'Trading Algorithms'],
      downloadUrl: '/datasets/financial-timeseries.parquet',
      preview: 'Sample time series available'
    },
    {
      id: 'dataset-5',
      name: 'IoT Sensor Data',
      description: 'Industrial IoT sensor readings for predictive maintenance',
      category: 'Manufacturing',
      size: '3.1GB',
      records: '2.1M',
      language: 'N/A',
      format: 'JSON, CSV',
      compliance: 'Anonymized',
      useCases: ['Predictive Maintenance', 'Anomaly Detection', 'Optimization'],
      downloadUrl: '/datasets/iot-sensors.json',
      preview: 'Sample sensor data available'
    }
  ];

  const demoWorkflows = [
    {
      id: 'workflow-1',
      name: 'Complete RAG System Setup',
      description: 'End-to-end RAG implementation with document upload, embedding, and query interface',
      category: 'rag',
      duration: '15 minutes',
      difficulty: 'Beginner',
      datasets: ['Finnish Legal Documents'],
      steps: [
        'Upload legal documents',
        'Generate embeddings with OpenAI',
        'Build vector database',
        'Configure query interface',
        'Test with sample questions'
      ],
      expectedResults: 'Working RAG system with 90%+ accuracy'
    },
    {
      id: 'workflow-2',
      name: 'Sentiment Analysis Pipeline',
      description: 'Complete sentiment analysis workflow with model training and evaluation',
      category: 'nlp',
      duration: '30 minutes',
      difficulty: 'Intermediate',
      datasets: ['Customer Sentiment Analysis'],
      steps: [
        'Load sentiment dataset',
        'Preprocess and clean data',
        'Train BERT model',
        'Evaluate performance',
        'Deploy for inference'
      ],
      expectedResults: 'Custom sentiment model with 95%+ accuracy'
    },
    {
      id: 'workflow-3',
      name: 'Medical Image Classification',
      description: 'Computer vision workflow for medical image analysis',
      category: 'computer_vision',
      duration: '45 minutes',
      difficulty: 'Advanced',
      datasets: ['Medical Imaging Dataset'],
      steps: [
        'Load medical images',
        'Preprocess and augment data',
        'Train ResNet model',
        'Validate on test set',
        'Generate diagnostic reports'
      ],
      expectedResults: 'Medical diagnosis model with 92%+ accuracy'
    },
    {
      id: 'workflow-4',
      name: 'Time Series Forecasting',
      description: 'Financial time series analysis and prediction',
      category: 'time_series',
      duration: '25 minutes',
      difficulty: 'Intermediate',
      datasets: ['Financial Time Series'],
      steps: [
        'Load financial data',
        'Feature engineering',
        'Train LSTM model',
        'Backtest predictions',
        'Generate forecasts'
      ],
      expectedResults: 'Financial forecasting model with 85%+ accuracy'
    }
  ];

  const runWorkflow = async (workflowId: string) => {
    setIsRunning(true);
    setSelectedWorkflow(workflowId);
    
    // Simulate workflow execution
    setTimeout(() => {
      const workflow = demoWorkflows.find(w => w.id === workflowId);
      setWorkflowResults({
        workflowId,
        status: 'completed',
        duration: workflow?.duration,
        accuracy: Math.floor(Math.random() * 10) + 85,
        cost: (Math.random() * 5 + 2).toFixed(2),
        resources: {
          cpu: '2.3 cores',
          memory: '4.1 GB',
          gpu: '1x NVIDIA A100'
        },
        outputs: [
          'Trained model saved',
          'Performance metrics generated',
          'Inference endpoint deployed',
          'Documentation created'
        ],
        nextSteps: [
          'Deploy model to production',
          'Set up monitoring',
          'Configure auto-scaling',
          'Schedule retraining'
        ]
      });
      setIsRunning(false);
    }, 3000);
  };

  const downloadDataset = (datasetId: string) => {
    const dataset = preloadedDatasets.find(d => d.id === datasetId);
    if (dataset) {
      // Simulate download
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`Sample data from ${dataset.name}\n\nThis is a demo download. In production, this would be the actual dataset file.`)}`;
      link.download = `${dataset.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
      link.click();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Legal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Business': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Healthcare': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Finance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Manufacturing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Preloaded Demo Datasets</h2>
          <p className="text-gray-400">Ready-to-use datasets with complete workflow examples</p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="w-6 h-6 text-blue-500" />
          <span className="text-white font-semibold">{preloadedDatasets.length} Datasets Available</span>
        </div>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preloadedDatasets.map((dataset) => (
          <Card key={dataset.id} className="p-6 hover:bg-gray-700/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{dataset.name}</h3>
                  <Badge className={getCategoryColor(dataset.category)}>
                    {dataset.category}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => downloadDataset(dataset.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>

            <p className="text-gray-300 text-sm mb-4">{dataset.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Size:</span>
                <span className="text-white">{dataset.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Records:</span>
                <span className="text-white">{dataset.records}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Format:</span>
                <span className="text-white">{dataset.format}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Compliance:</span>
                <Badge variant="green" className="text-xs">{dataset.compliance}</Badge>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Use Cases:</h4>
              <div className="flex flex-wrap gap-1">
                {dataset.useCases.map((useCase, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setSelectedDataset(dataset.id)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Demo Workflows */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Ready-to-Use Workflows</h3>
        <p className="text-gray-400 mb-6">Complete end-to-end workflows using our preloaded datasets</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoWorkflows.map((workflow) => (
            <Card key={workflow.id} className="p-4 bg-gray-700/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{workflow.name}</h4>
                  <p className="text-gray-300 text-sm">{workflow.description}</p>
                </div>
                <Badge className={getDifficultyColor(workflow.difficulty)}>
                  {workflow.difficulty}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 mb-3 text-sm text-gray-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {workflow.duration}
                </div>
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  {workflow.datasets.join(', ')}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Steps:</h5>
                <ol className="text-sm text-gray-400 space-y-1">
                  {workflow.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-1">Expected Results:</h5>
                <p className="text-sm text-green-400">{workflow.expectedResults}</p>
              </div>

              <Button
                onClick={() => runWorkflow(workflow.id)}
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRunning && selectedWorkflow === workflow.id ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Running Workflow...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Workflow
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Workflow Results */}
      {workflowResults && (
        <Card className="p-6 bg-green-900/20 border border-green-500/30">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">Workflow Completed Successfully!</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Accuracy</p>
              <p className="text-2xl font-bold text-white">{workflowResults.accuracy}%</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-2xl font-bold text-white">{workflowResults.duration}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Cost</p>
              <p className="text-2xl font-bold text-white">€{workflowResults.cost}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-2xl font-bold text-green-400">Completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Generated Outputs</h4>
              <ul className="space-y-2">
                {workflowResults.outputs.map((output: string, index: number) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    {output}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Next Steps</h4>
              <ul className="space-y-2">
                {workflowResults.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Target className="w-4 h-4 text-blue-400 mr-2" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              onClick={() => setWorkflowResults(null)}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              Close
            </Button>
          </div>
        </Card>
      )}

      {/* Demo Notice */}
      <Card className="p-4 bg-yellow-900/20 border border-yellow-500/30">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
          <p className="text-yellow-300 font-medium">Demo Version</p>
        </div>
        <p className="text-yellow-200 text-sm mt-1">
          These are demonstration datasets and workflows. In a production environment, 
          you would have access to real datasets and full workflow execution capabilities.
        </p>
      </Card>
    </div>
  );
}