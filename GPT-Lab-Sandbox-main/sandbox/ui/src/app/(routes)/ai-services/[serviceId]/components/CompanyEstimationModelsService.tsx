'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  TrendingUp, 
  Upload, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Download,
  Settings,
  Target,
  Zap,
  Brain,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CompanyEstimationModelsServiceProps {
  service: any;
}

export default function CompanyEstimationModelsService({ service }: CompanyEstimationModelsServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState<File | null>(null);
  const [modelType, setModelType] = useState('');
  const [trainingConfig, setTrainingConfig] = useState({
    dataRange: '2-years',
    features: [] as string[],
    accuracy: 'high'
  });
  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState<any>(null);

  const modelTypes = [
    {
      id: 'pricing-predictor',
      name: 'Pricing Predictor Model',
      description: 'Predict project costs based on historical data',
      accuracy: '88-94%',
      features: ['project_type', 'team_size', 'duration', 'complexity']
    },
    {
      id: 'resource-estimator',
      name: 'Resource Estimation Model',
      description: 'Estimate required resources and timeline',
      accuracy: '82-89%',
      features: ['requirements', 'technology_stack', 'team_experience', 'deadlines']
    },
    {
      id: 'risk-assessor',
      name: 'Project Risk Assessment',
      description: 'Evaluate project risk factors and mitigation',
      accuracy: '76-84%',
      features: ['client_type', 'project_scope', 'technology_risk', 'team_availability']
    },
    {
      id: 'market-analyzer',
      name: 'Market-Based Pricing',
      description: 'Compare with market rates and competitor pricing',
      accuracy: '85-92%',
      features: ['industry', 'company_size', 'geographic_location', 'service_type']
    }
  ];

  const availableFeatures = [
    'project_type', 'team_size', 'duration', 'complexity', 'technology_stack',
    'client_budget', 'deadlines', 'requirements_clarity', 'team_experience',
    'geographic_location', 'industry_sector', 'project_urgency', 'change_frequency'
  ];

  const handleDataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyData(file);
    }
  };

  const toggleFeature = (feature: string) => {
    setTrainingConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const startTraining = () => {
    setIsTraining(true);
    setCurrentStep(3);
    
    setTimeout(() => {
      setResults(generateModelResults());
      setIsTraining(false);
      setCurrentStep(4);
    }, 5000);
  };

  const generateModelResults = () => {
    const selectedModel = modelTypes.find(m => m.id === modelType);
    
    return {
      model_performance: {
        accuracy: 0.91,
        precision: 0.89,
        recall: 0.87,
        f1_score: 0.88,
        mean_absolute_error: 0.12,
        r_squared: 0.84
      },
      training_data: {
        total_projects: 1247,
        date_range: '2022-01-01 to 2024-12-31',
        features_used: trainingConfig.features.length,
        data_quality: 0.93
      },
      model_insights: {
        top_cost_drivers: [
          { factor: 'Team Size', impact: 0.34, trend: 'High correlation with cost' },
          { factor: 'Project Complexity', impact: 0.28, trend: 'Exponential cost increase' },
          { factor: 'Technology Stack', impact: 0.22, trend: 'Modern tech = higher cost' },
          { factor: 'Timeline Pressure', impact: 0.16, trend: 'Rush jobs cost 40% more' }
        ],
        pricing_patterns: [
          { pattern: 'Q4 Premium', description: 'Projects in Q4 cost 15% more on average' },
          { pattern: 'Team Experience', description: 'Senior teams deliver 25% faster but cost 30% more' },
          { pattern: 'Client Type', description: 'Enterprise clients budget 2x more than SMEs' },
          { pattern: 'Change Frequency', description: 'High-change projects cost 60% more than planned' }
        ]
      },
      predictions: [
        { project_type: 'Web Application', estimated_cost: 45000, confidence: 0.89, range: [38000, 52000] },
        { project_type: 'Mobile App', estimated_cost: 78000, confidence: 0.85, range: [65000, 91000] },
        { project_type: 'AI/ML Project', estimated_cost: 125000, confidence: 0.82, range: [98000, 152000] },
        { project_type: 'Enterprise System', estimated_cost: 280000, confidence: 0.87, range: [225000, 335000] }
      ],
      validation_results: [
        { month: 'Jan 2024', predicted: 45000, actual: 47000, error: 0.04 },
        { month: 'Feb 2024', predicted: 62000, actual: 58000, error: 0.06 },
        { month: 'Mar 2024', predicted: 89000, actual: 92000, error: 0.03 },
        { month: 'Apr 2024', predicted: 156000, actual: 149000, error: 0.04 },
        { month: 'May 2024', predicted: 73000, actual: 76000, error: 0.04 }
      ],
      business_impact: {
        accuracy_improvement: '+23%',
        estimation_time_saved: '75%',
        win_rate_increase: '+18%',
        profit_margin_improvement: '+12%'
      }
    };
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setCompanyData(null);
    setModelType('');
    setTrainingConfig({ dataRange: '2-years', features: [], accuracy: 'high' });
    setResults(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Upload Historical Data</h3>
            <p className="text-slate-400 mb-6">
              Upload your company's historical project data to train a custom estimation model.
            </p>
            
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Upload Project History</h4>
              <p className="text-slate-400 mb-4">
                CSV, Excel, or JSON files with project data (costs, timelines, features)
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={handleDataUpload}
                className="hidden"
                id="data-upload"
              />
              <label htmlFor="data-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>

            {companyData && (
              <Card className="p-4 bg-slate-700 mt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">{companyData.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(companyData.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              </Card>
            )}

            <Card className="p-4 bg-blue-500/10 border-blue-500/20 mt-6">
              <h4 className="text-blue-300 font-medium mb-2">💡 Required Data Fields</h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Project costs and actual vs estimated</li>
                <li>• Timeline data (planned vs actual duration)</li>
                <li>• Project characteristics (type, complexity, team size)</li>
                <li>• Client information (industry, budget, requirements)</li>
              </ul>
            </Card>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!companyData}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                Next: Configure Model <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 2: Model Configuration</h3>
            
            <div className="space-y-6">
              {/* Model Type Selection */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Select Model Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modelTypes.map((model) => (
                    <Card
                      key={model.id}
                      className={`p-4 cursor-pointer transition-all ${
                        modelType === model.id
                          ? 'border-2 border-blue-500 bg-blue-500/10'
                          : 'border-2 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => setModelType(model.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="w-6 h-6 text-blue-400" />
                        <div>
                          <h5 className="text-white font-medium">{model.name}</h5>
                          <Badge variant="secondary" className="text-xs">{model.accuracy}</Badge>
                        </div>
                        {modelType === model.id && (
                          <CheckCircle className="w-5 h-5 text-blue-400 ml-auto" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{model.description}</p>
                      <div className="text-xs text-slate-500">
                        Key features: {model.features.slice(0, 2).join(', ')}
                        {model.features.length > 2 && ` +${model.features.length - 2} more`}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Training Configuration */}
              {modelType && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Training Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Data Range</label>
                      <Select value={trainingConfig.dataRange} onValueChange={(value) => 
                        setTrainingConfig(prev => ({ ...prev, dataRange: value }))
                      }>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="1-year">Last 1 Year</SelectItem>
                          <SelectItem value="2-years">Last 2 Years</SelectItem>
                          <SelectItem value="3-years">Last 3 Years</SelectItem>
                          <SelectItem value="all">All Available Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Model Accuracy</label>
                      <Select value={trainingConfig.accuracy} onValueChange={(value) => 
                        setTrainingConfig(prev => ({ ...prev, accuracy: value }))
                      }>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="high">High Accuracy</SelectItem>
                          <SelectItem value="fast">Fast Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Features Selected</label>
                      <div className="bg-slate-800 border border-slate-700 rounded p-2 text-white">
                        {trainingConfig.features.length} / {availableFeatures.length} selected
                      </div>
                    </div>
                  </div>

                  {/* Feature Selection */}
                  <div>
                    <h5 className="text-white font-medium mb-2">Select Features for Training</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {availableFeatures.map((feature) => (
                        <div
                          key={feature}
                          className={`p-2 rounded cursor-pointer text-sm transition-all ${
                            trainingConfig.features.includes(feature)
                              ? 'bg-blue-500/20 border border-blue-500 text-blue-300'
                              : 'bg-slate-700 border border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                          onClick={() => toggleFeature(feature)}
                        >
                          {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={startTraining}
                disabled={!modelType || trainingConfig.features.length === 0}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Start Training Model ({trainingConfig.features.length} features)
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 3: Training Custom Model...</h3>
            <p className="text-slate-400 mb-6">
              Training {modelTypes.find(m => m.id === modelType)?.name} on your company's data
            </p>
            
            <div className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Data Points</div>
                <div className="text-white font-medium">1,247</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Features</div>
                <div className="text-blue-400 font-medium">{trainingConfig.features.length}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Epochs</div>
                <div className="text-green-400 font-medium">47/100</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Accuracy</div>
                <div className="text-purple-400 font-medium">91.2%</div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Results Summary */}
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <div className="flex items-center gap-4 mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-2xl font-semibold text-white">Custom Model Training Complete!</h3>
                  <p className="text-green-200">
                    {results?.model_performance.accuracy * 100}% accuracy achieved on {results?.training_data.total_projects} projects
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{(results?.model_performance.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">Model Accuracy</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.business_impact.accuracy_improvement}</div>
                  <div className="text-sm text-slate-400">Improvement</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.business_impact.estimation_time_saved}</div>
                  <div className="text-sm text-slate-400">Time Saved</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{results?.business_impact.win_rate_increase}</div>
                  <div className="text-sm text-slate-400">Win Rate ↑</div>
                </Card>
              </div>
            </Card>

            {/* Model Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Model Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(results?.model_performance || {}).map(([metric, value]) => (
                  <Card key={metric} className="p-3 bg-slate-700 text-center">
                    <div className="text-lg font-bold text-blue-400">{(value as number).toFixed(3)}</div>
                    <div className="text-xs text-slate-400 uppercase">{metric.replace('_', ' ')}</div>
                  </Card>
                ))}
              </div>

              {/* Validation Results Chart */}
              <h4 className="text-white font-medium mb-3">Prediction vs Actual (Recent Projects)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={results?.validation_results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} name="Predicted" />
                  <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Cost Drivers */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Key Cost Drivers Identified</h3>
              <div className="space-y-3">
                {results?.model_insights.top_cost_drivers.map((driver: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-white font-medium">{driver.factor}</h5>
                      <Badge variant="secondary">{(driver.impact * 100).toFixed(0)}% impact</Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{driver.trend}</p>
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${driver.impact * 100}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Sample Predictions */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Sample Cost Predictions</h3>
              <div className="space-y-3">
                {results?.predictions.map((pred: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-white font-medium">{pred.project_type}</h5>
                        <p className="text-slate-400 text-sm">
                          Range: €{pred.range[0].toLocaleString()} - €{pred.range[1].toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">€{pred.estimated_cost.toLocaleString()}</div>
                        <Badge variant="secondary" className="text-xs">
                          {(pred.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={resetWorkflow} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Train New Model
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Model
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Deploy to Production
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-purple-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Train custom AI models on your company's historical project data to improve cost estimation accuracy 
          and learn from past pricing patterns for better future predictions.
        </p>
      </Card>

      {/* Progress Steps */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-purple-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Upload Data</span>
          <span>Configure</span>
          <span>Training</span>
          <span>Results</span>
        </div>
      </Card>

      {/* Main Content */}
      {renderStep()}
    </div>
  );
}
