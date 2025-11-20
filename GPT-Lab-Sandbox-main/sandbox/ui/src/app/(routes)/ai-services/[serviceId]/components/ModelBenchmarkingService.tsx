'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  BarChart3, 
  Play, 
  Download, 
  Settings, 
  Target,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Activity,
  Database,
  Cpu,
  DollarSign,
  Award,
  ArrowLeft
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface ModelBenchmarkingServiceProps {
  service: any;
}

export default function ModelBenchmarkingService({ service }: ModelBenchmarkingServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [benchmarkConfig, setBenchmarkConfig] = useState({
    testSize: 0.2,
    iterations: 3,
    timeout: 300,
    batchSize: 32
  });
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState('');

  const availableModels = [
    {
      id: 'bert-base',
      name: 'BERT-base-uncased',
      provider: 'Hugging Face',
      type: 'NLP',
      size: '440MB',
      parameters: '110M',
      costPerRequest: 0.02,
      description: 'General-purpose BERT model for various NLP tasks'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      type: 'LLM',
      size: 'N/A',
      parameters: '175B',
      costPerRequest: 0.05,
      description: 'Large language model for text generation and completion'
    },
    {
      id: 'resnet-50',
      name: 'ResNet-50',
      provider: 'Hugging Face',
      type: 'Computer Vision',
      size: '98MB',
      parameters: '25M',
      costPerRequest: 0.03,
      description: 'Image classification model with high accuracy'
    },
    {
      id: 'distilbert',
      name: 'DistilBERT',
      provider: 'Hugging Face',
      type: 'NLP',
      size: '250MB',
      parameters: '66M',
      costPerRequest: 0.015,
      description: 'Lightweight BERT variant with faster inference'
    },
    {
      id: 'yolo-v8',
      name: 'YOLO-v8',
      provider: 'Hugging Face',
      type: 'Computer Vision',
      size: '50MB',
      parameters: '11M',
      costPerRequest: 0.025,
      description: 'Real-time object detection model'
    },
    {
      id: 'roberta-base',
      name: 'RoBERTa-base',
      provider: 'Hugging Face',
      type: 'NLP',
      size: '500MB',
      parameters: '125M',
      costPerRequest: 0.03,
      description: 'Optimized BERT variant with improved performance'
    }
  ];

  const benchmarkDatasets = [
    { 
      id: 'glue', 
      name: 'GLUE Benchmark', 
      description: 'General Language Understanding Evaluation - 9 tasks',
      tasks: ['CoLA', 'SST-2', 'MRPC', 'STS-B', 'QQP', 'MNLI', 'QNLI', 'RTE', 'WNLI'],
      size: '1.2M samples',
      language: 'English',
      difficulty: 'Advanced'
    },
    { 
      id: 'superglue', 
      name: 'SuperGLUE Benchmark', 
      description: 'More challenging language understanding tasks',
      tasks: ['BoolQ', 'CB', 'COPA', 'MultiRC', 'ReCoRD', 'RTE', 'WiC', 'WSC'],
      size: '850K samples',
      language: 'English',
      difficulty: 'Expert'
    },
    { 
      id: 'squad', 
      name: 'SQuAD 2.0', 
      description: 'Stanford Question Answering Dataset with unanswerable questions',
      tasks: ['Question Answering', 'Reading Comprehension'],
      size: '150K questions',
      language: 'English',
      difficulty: 'Intermediate'
    },
    { 
      id: 'imdb', 
      name: 'IMDB Sentiment', 
      description: 'Movie review sentiment analysis dataset',
      tasks: ['Sentiment Analysis', 'Binary Classification'],
      size: '50K reviews',
      language: 'English',
      difficulty: 'Beginner'
    },
    { 
      id: 'cifar10', 
      name: 'CIFAR-10', 
      description: '10-class image classification dataset',
      tasks: ['Image Classification', 'Object Recognition'],
      size: '60K images',
      language: 'N/A',
      difficulty: 'Intermediate'
    },
    { 
      id: 'finnish-legal', 
      name: 'Finnish Legal Documents', 
      description: 'Finnish legal text analysis and classification',
      tasks: ['Document Classification', 'Legal Text Analysis', 'Compliance Checking'],
      size: '25K documents',
      language: 'Finnish',
      difficulty: 'Advanced'
    }
  ];

  const evaluationBenchmarks = [
    {
      id: 'accuracy',
      name: 'Accuracy',
      description: 'Overall correctness of predictions',
      metrics: ['Accuracy', 'F1-Score', 'Precision', 'Recall'],
      importance: 'High'
    },
    {
      id: 'speed',
      name: 'Inference Speed',
      description: 'Time taken for model predictions',
      metrics: ['Latency (ms)', 'Throughput (req/s)', 'Memory Usage'],
      importance: 'High'
    },
    {
      id: 'efficiency',
      name: 'Computational Efficiency',
      description: 'Resource utilization and efficiency',
      metrics: ['FLOPs', 'GPU Utilization', 'CPU Usage', 'Memory Efficiency'],
      importance: 'Medium'
    },
    {
      id: 'robustness',
      name: 'Robustness',
      description: 'Performance under adversarial conditions',
      metrics: ['Adversarial Accuracy', 'Noise Robustness', 'OOD Performance'],
      importance: 'High'
    },
    {
      id: 'fairness',
      name: 'Fairness & Bias',
      description: 'Bias detection and fairness metrics',
      metrics: ['Demographic Parity', 'Equalized Odds', 'Bias Score'],
      importance: 'Critical'
    },
    {
      id: 'interpretability',
      name: 'Interpretability',
      description: 'Model explainability and interpretability',
      metrics: ['SHAP Values', 'Attention Weights', 'Feature Importance'],
      importance: 'Medium'
    }
  ];

  const performanceData = [
    { model: 'BERT-base', accuracy: 94.2, speed: 120, cost: 0.02, efficiency: 78.5 },
    { model: 'GPT-3.5', accuracy: 91.8, speed: 85, cost: 0.05, efficiency: 65.2 },
    { model: 'ResNet-50', accuracy: 89.5, speed: 95, cost: 0.03, efficiency: 82.1 },
    { model: 'DistilBERT', accuracy: 92.1, speed: 60, cost: 0.015, efficiency: 91.3 },
    { model: 'YOLO-v8', accuracy: 88.7, speed: 45, cost: 0.025, efficiency: 85.7 },
    { model: 'RoBERTa', accuracy: 95.3, speed: 140, cost: 0.03, efficiency: 72.1 }
  ];

  const costAnalysisData = [
    { model: 'BERT-base', requests: 1000, cost: 20, accuracy: 94.2 },
    { model: 'GPT-3.5', requests: 1000, cost: 50, accuracy: 91.8 },
    { model: 'ResNet-50', requests: 1000, cost: 30, accuracy: 89.5 },
    { model: 'DistilBERT', requests: 1000, cost: 15, accuracy: 92.1 },
    { model: 'YOLO-v8', requests: 1000, cost: 25, accuracy: 88.7 },
    { model: 'RoBERTa', requests: 1000, cost: 30, accuracy: 95.3 }
  ];

  const runBenchmark = async () => {
    if (selectedModels.length === 0) {
      alert('Please select at least one model to benchmark');
      return;
    }
    if (selectedBenchmarks.length === 0) {
      alert('Please select at least one evaluation benchmark');
      return;
    }
    if (!selectedDataset) {
      alert('Please select a dataset for evaluation');
      return;
    }

    setIsRunning(true);
    setCurrentStep(3);
    setEvaluationProgress(0);
    setBenchmarkResults(null);
    
    // Simulate comprehensive benchmark execution with progress tracking
    const totalSteps = selectedModels.length * selectedBenchmarks.length;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      setEvaluationProgress(progress);
      
      // Update current evaluation status
      const modelIndex = Math.floor((currentStep - 1) / selectedBenchmarks.length);
      const benchmarkIndex = (currentStep - 1) % selectedBenchmarks.length;
      const model = availableModels.find(m => m.id === selectedModels[modelIndex]);
      const benchmark = evaluationBenchmarks.find(b => b.id === selectedBenchmarks[benchmarkIndex]);
      setCurrentEvaluation(`${model?.name} - ${benchmark?.name}`);
      
      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        generateResults();
      }
    }, 2000);

    const generateResults = () => {
      const results = {
        timestamp: new Date().toISOString(),
        duration: `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
        models: selectedModels,
        benchmarks: selectedBenchmarks,
        dataset: selectedDataset,
        datasetInfo: benchmarkDatasets.find(d => d.id === selectedDataset),
        results: selectedModels.map(modelId => {
          const model = availableModels.find(m => m.id === modelId);
          const benchmarkResults = selectedBenchmarks.map(benchmarkId => {
            const benchmark = evaluationBenchmarks.find(b => b.id === benchmarkId);
            return {
              benchmark: benchmark?.name,
              metrics: benchmark?.metrics.map(metric => ({
                name: metric,
                value: Math.floor(Math.random() * 20) + 80,
                unit: metric.includes('ms') ? 'ms' : metric.includes('%') ? '%' : '',
                status: Math.random() > 0.2 ? 'good' : 'warning'
              }))
            };
          });
          
          return {
            model: model?.name || modelId,
            provider: model?.provider,
            type: model?.type,
            accuracy: Math.floor(Math.random() * 10) + 85,
            speed: Math.floor(Math.random() * 100) + 50,
            cost: model?.costPerRequest || 0.02,
            efficiency: Math.floor(Math.random() * 30) + 70,
            memory: Math.floor(Math.random() * 4) + 2,
            gpu_utilization: Math.floor(Math.random() * 40) + 60,
            benchmarkResults
          };
        }),
        summary: {
          bestModel: selectedModels[Math.floor(Math.random() * selectedModels.length)],
          bestAccuracy: Math.floor(Math.random() * 10) + 90,
          fastestModel: selectedModels[Math.floor(Math.random() * selectedModels.length)],
          mostEfficient: selectedModels[Math.floor(Math.random() * selectedModels.length)],
          costSavings: Math.floor(Math.random() * 30) + 15,
          performanceGain: Math.floor(Math.random() * 25) + 10
        },
        recommendations: [
          'DistilBERT shows best cost-efficiency ratio for production use',
          'RoBERTa provides highest accuracy for critical NLP tasks',
          'Consider model quantization for 15-20% speed improvement',
          'Implement caching for frequently used models to reduce latency',
          'Use BERT-base for balanced performance and cost',
          'Monitor GPU utilization to optimize resource allocation'
        ],
        charts: {
          accuracyComparison: selectedModels.map(modelId => {
            const model = availableModels.find(m => m.id === modelId);
            return {
              model: model?.name || modelId,
              accuracy: Math.floor(Math.random() * 10) + 85,
              speed: Math.floor(Math.random() * 100) + 50,
              cost: model?.costPerRequest || 0.02,
              efficiency: Math.floor(Math.random() * 30) + 70
            };
          }),
          benchmarkScores: selectedBenchmarks.map(benchmarkId => {
            const benchmark = evaluationBenchmarks.find(b => b.id === benchmarkId);
            return {
              benchmark: benchmark?.name,
              scores: selectedModels.map(modelId => {
                const model = availableModels.find(m => m.id === modelId);
                return {
                  model: model?.name || modelId,
                  score: Math.floor(Math.random() * 20) + 80
                };
              })
            };
          })
        }
      };
      
      setBenchmarkResults(results);
      setIsRunning(false);
      setCurrentStep(4);
    };
  };

  const exportResults = () => {
    if (!benchmarkResults) return;

    const reportContent = `
SW4E Model Benchmarking Report
=============================

Generated: ${benchmarkResults.timestamp}
Duration: ${benchmarkResults.duration}
Dataset: ${benchmarkResults.dataset}

BENCHMARK RESULTS
================
${benchmarkResults.results.map((result: any, index: number) => `
${index + 1}. ${result.model}
   Accuracy: ${result.accuracy}%
   Speed: ${result.speed}ms
   Cost: €${result.cost}/request
   Efficiency: ${result.efficiency}%
   Memory: ${result.memory}GB
   GPU Utilization: ${result.gpu_utilization}%
`).join('')}

RECOMMENDATIONS
===============
${benchmarkResults.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

COST ANALYSIS
=============
Total Cost Savings: ${benchmarkResults.costSavings}%
Performance Gain: ${benchmarkResults.performanceGain}%

---
Generated by SW4E Sandbox Model Benchmarking Service
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `model-benchmark-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const toggleBenchmark = (benchmarkId: string) => {
    setSelectedBenchmarks(prev => 
      prev.includes(benchmarkId) 
        ? prev.filter(b => b !== benchmarkId)
        : [...prev, benchmarkId]
    );
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Select Models';
      case 2: return 'Choose Benchmarks';
      case 3: return 'Running Evaluation';
      case 4: return 'Results & Analysis';
      default: return 'Model Benchmarking';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Choose the AI models you want to evaluate and compare';
      case 2: return 'Select evaluation benchmarks and datasets for comprehensive testing';
      case 3: return 'Running detailed evaluation across all selected models and benchmarks';
      case 4: return 'Review detailed results, charts, and AI-powered recommendations';
      default: return 'Comprehensive model comparison with industry standards';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{getStepTitle(currentStep)}</h2>
          <p className="text-gray-400">{getStepDescription(currentStep)}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="text-white font-semibold">{availableModels.length} Models Available</span>
          </div>
        </div>
      </div>

      {/* Step 1: Model Selection */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select AI Models for Evaluation</h3>
          <p className="text-gray-400 mb-6">Choose the models you want to compare. You can select multiple models to run comprehensive benchmarks.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {availableModels.map(model => (
              <div 
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedModels.includes(model.id)
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/50'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-lg">{model.name}</h5>
                  <Badge variant="accent">{model.provider}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-3">{model.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-white">{model.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="text-white">{model.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Parameters:</span>
                    <span className="text-white">{model.parameters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost:</span>
                    <span className="text-white">€{model.costPerRequest}/req</span>
                  </div>
                </div>
                {selectedModels.includes(model.id) && (
                  <div className="mt-3 flex items-center text-blue-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
            </div>
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={selectedModels.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next: Choose Benchmarks
              <Target className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Benchmark Selection */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Evaluation Benchmarks</h3>
          <p className="text-gray-400 mb-6">Select the benchmarks and datasets you want to use for evaluation. Each benchmark tests different aspects of model performance.</p>
          
          {/* Dataset Selection */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-white mb-3">Select Dataset</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benchmarkDatasets.map(dataset => (
                <div 
                  key={dataset.id}
                  onClick={() => setSelectedDataset(dataset.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedDataset === dataset.id
                      ? 'bg-green-600/20 border-green-500 text-green-300 ring-2 ring-green-500/50'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{dataset.name}</h5>
                    <Badge variant={dataset.difficulty === 'Expert' ? 'red' : dataset.difficulty === 'Advanced' ? 'yellow' : 'green'}>
                      {dataset.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{dataset.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{dataset.size}</span>
                    <span>{dataset.language}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">Tasks: {dataset.tasks.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark Selection */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-white mb-3">Select Evaluation Benchmarks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {evaluationBenchmarks.map(benchmark => (
                <div 
                  key={benchmark.id}
                  onClick={() => toggleBenchmark(benchmark.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedBenchmarks.includes(benchmark.id)
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/50'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{benchmark.name}</h5>
                    <Badge variant={benchmark.importance === 'Critical' ? 'red' : benchmark.importance === 'High' ? 'yellow' : 'green'}>
                      {benchmark.importance}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{benchmark.description}</p>
                  <div className="space-y-1">
                    {benchmark.metrics.map((metric, index) => (
                      <div key={index} className="text-xs text-gray-500">• {metric}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setCurrentStep(1)}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Models
            </Button>
            <Button 
              onClick={runBenchmark}
              disabled={selectedBenchmarks.length === 0 || !selectedDataset}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Evaluation
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Running Evaluation */}
      {currentStep === 3 && (
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Running Model Evaluation</h3>
            <p className="text-gray-400 mb-6">Comprehensive evaluation in progress across all selected models and benchmarks</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${evaluationProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mb-6">{Math.round(evaluationProgress)}% Complete</p>
            
            {/* Current Evaluation */}
            {currentEvaluation && (
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-white font-medium">Currently evaluating: {currentEvaluation}</span>
                </div>
              </div>
            )}
            
            {/* Evaluation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-gray-400">Models</div>
                <div className="text-white font-semibold">{selectedModels.length}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-gray-400">Benchmarks</div>
                <div className="text-white font-semibold">{selectedBenchmarks.length}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-gray-400">Dataset</div>
                <div className="text-white font-semibold">{benchmarkDatasets.find(d => d.id === selectedDataset)?.name}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Results & Analysis */}
      {currentStep === 4 && benchmarkResults && (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card className="p-6 bg-green-900/20 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Evaluation Completed Successfully!</h3>
              </div>
              <div className="flex space-x-2">
                <Button onClick={exportResults} className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedModels([]);
                    setSelectedBenchmarks([]);
                    setSelectedDataset('');
                    setBenchmarkResults(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  New Evaluation
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-xl font-bold text-white">{benchmarkResults.duration}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Models Tested</p>
                <p className="text-xl font-bold text-white">{benchmarkResults.models.length}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Dataset</p>
                <p className="text-xl font-bold text-white">{benchmarkResults.datasetInfo?.name}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Benchmarks</p>
                <p className="text-xl font-bold text-white">{benchmarkResults.benchmarks.length}</p>
              </div>
            </div>
          </Card>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Model Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarkResults.charts.accuracyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="model" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="accuracy" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cost vs Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={benchmarkResults.charts.accuracyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="model" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Benchmark Scores */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Benchmark Scores by Model</h3>
            <div className="space-y-4">
              {benchmarkResults.charts.benchmarkScores.map((benchmark: any, index: number) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">{benchmark.benchmark}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={benchmark.scores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="model" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="score" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Results Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Model</th>
                    <th className="text-left py-3 px-4 text-gray-300">Provider</th>
                    <th className="text-left py-3 px-4 text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-gray-300">Accuracy</th>
                    <th className="text-left py-3 px-4 text-gray-300">Speed (ms)</th>
                    <th className="text-left py-3 px-4 text-gray-300">Cost</th>
                    <th className="text-left py-3 px-4 text-gray-300">Efficiency</th>
                    <th className="text-left py-3 px-4 text-gray-300">Memory</th>
                    <th className="text-left py-3 px-4 text-gray-300">GPU Util</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.results.map((result: any, index: number) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-3 px-4 text-white font-medium">{result.model}</td>
                      <td className="py-3 px-4 text-white">{result.provider}</td>
                      <td className="py-3 px-4 text-white">{result.type}</td>
                      <td className="py-3 px-4 text-white">{result.accuracy}%</td>
                      <td className="py-3 px-4 text-white">{result.speed}ms</td>
                      <td className="py-3 px-4 text-white">€{result.cost}</td>
                      <td className="py-3 px-4 text-white">{result.efficiency}%</td>
                      <td className="py-3 px-4 text-white">{result.memory}GB</td>
                      <td className="py-3 px-4 text-white">{result.gpu_utilization}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Benchmark Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Benchmark Details by Model</h3>
            <div className="space-y-6">
              {benchmarkResults.results.map((result: any, index: number) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">{result.model} - {result.provider}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.benchmarkResults.map((benchmark: any, bIndex: number) => (
                      <div key={bIndex} className="bg-gray-600/50 rounded-lg p-3">
                        <h5 className="font-medium text-white mb-2">{benchmark.benchmark}</h5>
                        <div className="space-y-1">
                          {benchmark.metrics.map((metric: any, mIndex: number) => (
                            <div key={mIndex} className="flex justify-between text-sm">
                              <span className="text-gray-400">{metric.name}:</span>
                              <span className={`text-white ${
                                metric.status === 'good' ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {metric.value}{metric.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Evaluation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Overall Model:</span>
                  <span className="text-white font-medium">{benchmarkResults.summary.bestModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Highest Accuracy:</span>
                  <span className="text-green-400 font-medium">{benchmarkResults.summary.bestAccuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fastest Model:</span>
                  <span className="text-blue-400 font-medium">{benchmarkResults.summary.fastestModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Efficient:</span>
                  <span className="text-purple-400 font-medium">{benchmarkResults.summary.mostEfficient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost Savings:</span>
                  <span className="text-green-400 font-medium">{benchmarkResults.summary.costSavings}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance Gain:</span>
                  <span className="text-blue-400 font-medium">{benchmarkResults.summary.performanceGain}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Recommendations</h3>
              <div className="space-y-3">
                {benchmarkResults.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <Card className="p-4 bg-yellow-900/20 border border-yellow-500/30">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
          <p className="text-yellow-300 font-medium">Demo Version</p>
        </div>
        <p className="text-yellow-200 text-sm mt-1">
          This benchmarking service uses simulated data for demonstration. In production, 
          this would run actual model benchmarks with real performance metrics.
        </p>
      </Card>
    </div>
  );
}