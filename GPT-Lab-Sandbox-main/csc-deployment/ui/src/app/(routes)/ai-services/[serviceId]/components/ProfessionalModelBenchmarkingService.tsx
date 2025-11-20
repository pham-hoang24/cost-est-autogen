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
  ArrowLeft,
  Star,
  Shield,
  Brain,
  Layers,
  FileText,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

interface ProfessionalModelBenchmarkingServiceProps {
  service: any;
}

export default function ProfessionalModelBenchmarkingService({ service }: ProfessionalModelBenchmarkingServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [benchmarkConfig, setBenchmarkConfig] = useState({
    batchSize: 32,
    maxEpochs: 3,
    learningRate: 2e-5,
    warmupSteps: 100,
    evaluationStrategy: 'steps',
    saveStrategy: 'steps',
    saveSteps: 500,
    loggingSteps: 100
  });
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState('');

  // Professional Model Catalog
  const professionalModels = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      type: 'Large Language Model',
      size: '1.7T',
      parameters: '1.7T',
      costPerHour: 0.30,
      description: 'Most capable GPT-4 model for complex reasoning tasks',
      capabilities: ['Text Generation', 'Code Generation', 'Mathematical Reasoning', 'Creative Writing'],
      performance: { accuracy: 95, speed: 85, efficiency: 80 },
      benchmarks: ['MMLU', 'HellaSwag', 'ARC', 'HumanEval', 'GSM8K'],
      category: 'LLM'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      type: 'Large Language Model',
      size: '175B',
      parameters: '175B',
      costPerHour: 0.20,
      description: 'Fast and efficient model for most language tasks',
      capabilities: ['Text Generation', 'Code Generation', 'Conversation', 'Summarization'],
      performance: { accuracy: 88, speed: 95, efficiency: 90 },
      benchmarks: ['MMLU', 'HellaSwag', 'ARC', 'HumanEval'],
      category: 'LLM'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      type: 'Large Language Model',
      size: 'Unknown',
      parameters: 'Unknown',
      costPerHour: 0.15,
      description: 'Anthropic\'s most powerful model for complex tasks',
      capabilities: ['Analysis', 'Creative Writing', 'Code Generation', 'Mathematical Reasoning'],
      performance: { accuracy: 92, speed: 88, efficiency: 85 },
      benchmarks: ['MMLU', 'HellaSwag', 'ARC', 'HumanEval', 'GSM8K'],
      category: 'LLM'
    },
    {
      id: 'llama-2-70b',
      name: 'Llama 2 70B',
      provider: 'Meta',
      type: 'Open Source LLM',
      size: '70B',
      parameters: '70B',
      costPerHour: 0.08,
      description: 'Open-source model with strong performance',
      capabilities: ['Text Generation', 'Code Generation', 'Reasoning', 'Creative Writing'],
      performance: { accuracy: 85, speed: 90, efficiency: 95 },
      benchmarks: ['MMLU', 'HellaSwag', 'ARC', 'HumanEval'],
      category: 'LLM'
    },
    {
      id: 'bert-large',
      name: 'BERT Large',
      provider: 'Google',
      type: 'Transformer',
      size: '340M',
      parameters: '340M',
      costPerHour: 0.05,
      description: 'Bidirectional encoder for understanding tasks',
      capabilities: ['Text Classification', 'Named Entity Recognition', 'Question Answering', 'Sentiment Analysis'],
      performance: { accuracy: 90, speed: 85, efficiency: 88 },
      benchmarks: ['GLUE', 'SQuAD', 'CoNLL-2003', 'IMDB'],
      category: 'NLP'
    },
    {
      id: 't5-large',
      name: 'T5 Large',
      provider: 'Google',
      type: 'Text-to-Text Transformer',
      size: '770M',
      parameters: '770M',
      costPerHour: 0.07,
      description: 'Text-to-text transfer transformer for various NLP tasks',
      capabilities: ['Text Summarization', 'Translation', 'Question Answering', 'Text Classification'],
      performance: { accuracy: 87, speed: 80, efficiency: 82 },
      benchmarks: ['GLUE', 'SuperGLUE', 'XSum', 'CNN/DailyMail'],
      category: 'NLP'
    }
  ];

  // Professional Benchmark Datasets
  const professionalBenchmarks = [
    {
      id: 'mmlu',
      name: 'MMLU (Massive Multitask Language Understanding)',
      description: 'Comprehensive evaluation across 57 academic subjects',
      tasks: ['STEM', 'Humanities', 'Social Sciences', 'Other'],
      size: '15,908 questions',
      language: 'English',
      difficulty: 'Expert',
      metrics: ['Accuracy', 'Perplexity', 'Confidence'],
      category: 'Knowledge'
    },
    {
      id: 'hellaswag',
      name: 'HellaSwag',
      description: 'Commonsense reasoning about physical situations',
      tasks: ['Commonsense Reasoning', 'Physical Understanding'],
      size: '10,000 examples',
      language: 'English',
      difficulty: 'Advanced',
      metrics: ['Accuracy', 'Confidence', 'Reasoning Quality'],
      category: 'Reasoning'
    },
    {
      id: 'arc',
      name: 'ARC (AI2 Reasoning Challenge)',
      description: 'Grade-school science questions requiring reasoning',
      tasks: ['Science Questions', 'Multiple Choice', 'Open-ended'],
      size: '7,787 questions',
      language: 'English',
      difficulty: 'Expert',
      metrics: ['Accuracy', 'Explanation Quality', 'Confidence'],
      category: 'Science'
    },
    {
      id: 'humaneval',
      name: 'HumanEval',
      description: 'Python programming problems for code generation',
      tasks: ['Code Generation', 'Function Completion', 'Bug Fixing'],
      size: '164 problems',
      language: 'Python',
      difficulty: 'Advanced',
      metrics: ['Pass Rate', 'Code Quality', 'Execution Time'],
      category: 'Code'
    },
    {
      id: 'gsm8k',
      name: 'GSM8K',
      description: 'Grade school math word problems',
      tasks: ['Arithmetic', 'Word Problems', 'Multi-step Reasoning'],
      size: '8,500 problems',
      language: 'English',
      difficulty: 'Intermediate',
      metrics: ['Accuracy', 'Step-by-step Reasoning', 'Confidence'],
      category: 'Math'
    },
    {
      id: 'glue',
      name: 'GLUE Benchmark',
      description: 'General Language Understanding Evaluation',
      tasks: ['CoLA', 'SST-2', 'MRPC', 'STS-B', 'QQP', 'MNLI', 'QNLI', 'RTE', 'WNLI'],
      size: '1.2M samples',
      language: 'English',
      difficulty: 'Advanced',
      metrics: ['Accuracy', 'F1 Score', 'Matthews Correlation'],
      category: 'NLP'
    }
  ];

  // Evaluation Metrics
  const evaluationMetrics = [
    {
      id: 'accuracy',
      name: 'Accuracy',
      description: 'Overall correctness of model predictions',
      weight: 0.3,
      category: 'Performance'
    },
    {
      id: 'speed',
      name: 'Inference Speed',
      description: 'Time taken for model inference',
      weight: 0.2,
      category: 'Efficiency'
    },
    {
      id: 'efficiency',
      name: 'Computational Efficiency',
      description: 'Resource usage and optimization',
      weight: 0.2,
      category: 'Efficiency'
    },
    {
      id: 'robustness',
      name: 'Robustness',
      description: 'Performance under adversarial conditions',
      weight: 0.15,
      category: 'Reliability'
    },
    {
      id: 'fairness',
      name: 'Fairness & Bias',
      description: 'Equitable performance across demographics',
      weight: 0.1,
      category: 'Ethics'
    },
    {
      id: 'interpretability',
      name: 'Interpretability',
      description: 'Explainability of model decisions',
      weight: 0.05,
      category: 'Transparency'
    }
  ];

  const runBenchmark = () => {
    if (selectedModels.length === 0 || selectedBenchmarks.length === 0 || !selectedDataset) {
      alert('Please select at least one model, one benchmark, and one dataset');
      return;
    }

    setIsRunning(true);
    setCurrentStep(3);
    setEvaluationProgress(0);
    setCurrentEvaluation('Initializing evaluation...');

    const evaluationSteps = [
      'Loading models...',
      'Preparing datasets...',
      'Running inference...',
      'Computing metrics...',
      'Generating reports...',
      'Finalizing results...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setEvaluationProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          generateResults();
          return 100;
        }
        return newProgress;
      });

      if (stepIndex < evaluationSteps.length) {
        setCurrentEvaluation(evaluationSteps[stepIndex]);
        stepIndex++;
      }
    }, 2000);
  };

  const generateResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      duration: '4m 32s',
      models: selectedModels,
      benchmarks: selectedBenchmarks,
      dataset: selectedDataset,
      config: benchmarkConfig,
      results: selectedModels.map(modelId => {
        const model = professionalModels.find(m => m.id === modelId);
        return {
          modelId,
          modelName: model?.name,
          provider: model?.provider,
          overallScore: Math.random() * 20 + 80,
          metrics: {
            accuracy: Math.random() * 10 + 85,
            speed: Math.random() * 10 + 80,
            efficiency: Math.random() * 10 + 75,
            robustness: Math.random() * 10 + 70,
            fairness: Math.random() * 10 + 85,
            interpretability: Math.random() * 10 + 75
          },
          benchmarkScores: selectedBenchmarks.map(benchmarkId => ({
            benchmark: benchmarkId,
            score: Math.random() * 20 + 70,
            rank: Math.floor(Math.random() * 3) + 1
          })),
          cost: model?.costPerHour || 0,
          recommendations: [
            'Consider fine-tuning for domain-specific tasks',
            'Optimize batch size for better throughput',
            'Implement caching for repeated queries'
          ]
        };
      }),
      summary: {
        bestModel: selectedModels[0],
        highestAccuracy: Math.max(...selectedModels.map(() => Math.random() * 10 + 85)),
        fastest: selectedModels[1] || selectedModels[0],
        mostEfficient: selectedModels[2] || selectedModels[0],
        costSavings: Math.random() * 30 + 20,
        performanceGain: Math.random() * 25 + 15
      },
      charts: {
        accuracyComparison: selectedModels.map(modelId => ({
          model: professionalModels.find(m => m.id === modelId)?.name || modelId,
          accuracy: Math.random() * 10 + 85,
          speed: Math.random() * 10 + 80,
          efficiency: Math.random() * 10 + 75
        })),
        benchmarkScores: selectedBenchmarks.map(benchmarkId => ({
          benchmark: benchmarkId,
          scores: selectedModels.map(modelId => ({
            model: professionalModels.find(m => m.id === modelId)?.name || modelId,
            score: Math.random() * 20 + 70
          }))
        }))
      }
    };

    setBenchmarkResults(results);
    setIsRunning(false);
    setCurrentStep(4);
  };

  const exportResults = () => {
    const report = `
# Model Benchmarking Report
Generated: ${new Date().toLocaleString()}

## Executive Summary
- Models Evaluated: ${selectedModels.length}
- Benchmarks Used: ${selectedBenchmarks.length}
- Dataset: ${selectedDataset}
- Duration: ${benchmarkResults?.duration}

## Results Overview
${benchmarkResults?.results.map((result: any) => `
### ${result.modelName} (${result.provider})
- Overall Score: ${result.overallScore.toFixed(1)}/100
- Accuracy: ${result.metrics.accuracy.toFixed(1)}%
- Speed: ${result.metrics.speed.toFixed(1)}/100
- Efficiency: ${result.metrics.efficiency.toFixed(1)}/100
- Cost: $${result.cost}/hour

#### Benchmark Performance
${result.benchmarkScores.map((benchmark: any) => `- ${benchmark.benchmark}: ${benchmark.score.toFixed(1)}/100 (Rank ${benchmark.rank})`).join('\n')}

#### Recommendations
${result.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
`).join('\n')}

## Summary
- Best Overall Model: ${benchmarkResults?.summary.bestModel}
- Highest Accuracy: ${benchmarkResults?.summary.highestAccuracy.toFixed(1)}%
- Fastest Model: ${benchmarkResults?.summary.fastest}
- Most Efficient: ${benchmarkResults?.summary.mostEfficient}
- Cost Savings: ${benchmarkResults?.summary.costSavings.toFixed(1)}%
- Performance Gain: ${benchmarkResults?.summary.performanceGain.toFixed(1)}%
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-benchmark-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        ? prev.filter(id => id !== benchmarkId)
        : [...prev, benchmarkId]
    );
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Model Selection';
      case 2: return 'Benchmark Configuration';
      case 3: return 'Running Evaluation';
      case 4: return 'Results & Analysis';
      default: return 'Model Benchmarking';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Select models to evaluate from our professional catalog';
      case 2: return 'Choose benchmarks and configure evaluation parameters';
      case 3: return 'Comprehensive evaluation in progress across all selected models and benchmarks';
      case 4: return 'Detailed analysis and recommendations for model selection';
      default: return 'Professional model evaluation and benchmarking system';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{getStepTitle(currentStep)}</h2>
        <p className="text-slate-400">{getStepDescription(currentStep)}</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-8 h-0.5 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Model Selection */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Professional Model Catalog</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionalModels.map((model) => (
              <div
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModels.includes(model.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{model.name}</h4>
                  <Badge variant="accent">{model.category}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">{model.provider}</p>
                <p className="text-xs text-gray-500 mb-3">{model.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Parameters:</span>
                    <span className="text-white">{model.parameters}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">${model.costPerHour}/hour</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-green-400">{model.performance.accuracy}%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-400 mb-1">Capabilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.slice(0, 2).map((capability) => (
                      <Badge key={capability} variant="gray" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {model.capabilities.length > 2 && (
                      <Badge variant="gray" className="text-xs">
                        +{model.capabilities.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-4">
              Selected: {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
            </p>
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={selectedModels.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Configure Benchmarks
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Benchmark Configuration */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Benchmark Selection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {professionalBenchmarks.map((benchmark) => (
              <div
                key={benchmark.id}
                onClick={() => toggleBenchmark(benchmark.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedBenchmarks.includes(benchmark.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{benchmark.name}</h4>
                  <Badge variant="accent">{benchmark.category}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">{benchmark.description}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>Size: {benchmark.size}</div>
                  <div>Difficulty: {benchmark.difficulty}</div>
                  <div>Language: {benchmark.language}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Dataset Selection</h4>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select a dataset...</option>
              <option value="custom">Custom Dataset (Upload)</option>
              <option value="standard">Standard Test Set</option>
              <option value="synthetic">Synthetic Data</option>
            </select>
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
            <h3 className="text-xl font-semibold text-white mb-2">Running Professional Evaluation</h3>
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
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-white">{currentEvaluation}</p>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Models</div>
                <div className="text-white font-semibold">{selectedModels.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Benchmarks</div>
                <div className="text-white font-semibold">{selectedBenchmarks.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Dataset</div>
                <div className="text-white font-semibold">{selectedDataset}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Results & Analysis */}
      {currentStep === 4 && benchmarkResults && (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Evaluation Results</h3>
              <div className="flex gap-2">
                <Button onClick={exportResults} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button onClick={() => setCurrentStep(1)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  New Evaluation
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Duration</div>
                <div className="text-white font-semibold">{benchmarkResults.duration}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Models Tested</div>
                <div className="text-white font-semibold">{benchmarkResults.models.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Benchmarks</div>
                <div className="text-white font-semibold">{benchmarkResults.benchmarks.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Dataset</div>
                <div className="text-white font-semibold">{benchmarkResults.dataset}</div>
              </div>
            </div>
          </Card>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Model Performance Comparison</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={benchmarkResults.charts.accuracyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="model" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy" />
                    <Bar dataKey="speed" fill="#10B981" name="Speed" />
                    <Bar dataKey="efficiency" fill="#F59E0B" name="Efficiency" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Cost vs Performance</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={benchmarkResults.charts.accuracyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="model" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Accuracy" />
                    <Line type="monotone" dataKey="speed" stroke="#10B981" strokeWidth={2} name="Speed" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Detailed Results</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 text-gray-400">Model</th>
                    <th className="text-left py-3 text-gray-400">Provider</th>
                    <th className="text-left py-3 text-gray-400">Overall Score</th>
                    <th className="text-left py-3 text-gray-400">Accuracy</th>
                    <th className="text-left py-3 text-gray-400">Speed</th>
                    <th className="text-left py-3 text-gray-400">Efficiency</th>
                    <th className="text-left py-3 text-gray-400">Cost/Hour</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.results.map((result: any, index: number) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-3 text-white font-medium">{result.modelName}</td>
                      <td className="py-3 text-gray-400">{result.provider}</td>
                      <td className="py-3 text-white">{result.overallScore.toFixed(1)}</td>
                      <td className="py-3 text-green-400">{result.metrics.accuracy.toFixed(1)}%</td>
                      <td className="py-3 text-blue-400">{result.metrics.speed.toFixed(1)}</td>
                      <td className="py-3 text-yellow-400">{result.metrics.efficiency.toFixed(1)}</td>
                      <td className="py-3 text-white">${result.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Summary & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Evaluation Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Model:</span>
                  <span className="text-white font-medium">{benchmarkResults.summary.bestModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Highest Accuracy:</span>
                  <span className="text-green-400 font-medium">{benchmarkResults.summary.highestAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fastest:</span>
                  <span className="text-blue-400 font-medium">{benchmarkResults.summary.fastest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Efficient:</span>
                  <span className="text-yellow-400 font-medium">{benchmarkResults.summary.mostEfficient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost Savings:</span>
                  <span className="text-green-400 font-medium">{benchmarkResults.summary.costSavings.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Performance Gain:</span>
                  <span className="text-blue-400 font-medium">{benchmarkResults.summary.performanceGain.toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">AI-Powered Recommendations</h4>
              <div className="space-y-3">
                {benchmarkResults.results[0]?.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-yellow-400 font-medium">Demo Version</span>
        </div>
        <p className="text-yellow-300 text-sm mt-1">
          This is a demonstration of our professional model evaluation system. In production, this would connect to real AI models and benchmarks.
        </p>
      </Card>
    </div>
  );
}
