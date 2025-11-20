'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  Brain, 
  Target, 
  Zap, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Lightbulb,
  BarChart3,
  Star,
  AlertCircle,
  Settings,
  Download,
  Rocket,
  Database,
  Cpu,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AITechniqueAssessmentProps {
  service: any;
}

export default function AITechniqueAssessment({ service }: AITechniqueAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [problemDomain, setProblemDomain] = useState<string>('');
  const [requirements, setRequirements] = useState({
    problemDescription: '',
    dataType: '',
    dataSize: '',
    accuracy: '',
    performance: '',
    interpretability: '',
    budget: '',
    timeline: '',
    experience: ''
  });
  const [constraints, setConstraints] = useState<string[]>([]);
  const [newConstraint, setNewConstraint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [assessment, setAssessment] = useState<any>(null);

  const problemDomains = [
    {
      id: 'computer-vision',
      name: 'Computer Vision',
      description: 'Image and video analysis, object detection, facial recognition',
      icon: '👁️',
      commonTechniques: ['CNN', 'YOLO', 'ResNet', 'Vision Transformers'],
      typicalAccuracy: '85-95%',
      complexity: 'High'
    },
    {
      id: 'nlp',
      name: 'Natural Language Processing',
      description: 'Text analysis, sentiment analysis, chatbots, language translation',
      icon: '💬',
      commonTechniques: ['BERT', 'GPT', 'Transformers', 'LSTM'],
      typicalAccuracy: '80-92%',
      complexity: 'High'
    },
    {
      id: 'predictive-analytics',
      name: 'Predictive Analytics',
      description: 'Forecasting, trend analysis, risk assessment',
      icon: '📈',
      commonTechniques: ['Random Forest', 'XGBoost', 'ARIMA', 'Prophet'],
      typicalAccuracy: '70-88%',
      complexity: 'Medium'
    },
    {
      id: 'recommendation',
      name: 'Recommendation Systems',
      description: 'Product recommendations, content filtering, personalization',
      icon: '🎯',
      commonTechniques: ['Collaborative Filtering', 'Matrix Factorization', 'Deep Learning'],
      typicalAccuracy: '65-85%',
      complexity: 'Medium'
    },
    {
      id: 'anomaly-detection',
      name: 'Anomaly Detection',
      description: 'Fraud detection, system monitoring, quality control',
      icon: '🚨',
      commonTechniques: ['Isolation Forest', 'Autoencoders', 'One-Class SVM'],
      typicalAccuracy: '75-90%',
      complexity: 'Medium'
    },
    {
      id: 'classification',
      name: 'Classification',
      description: 'Data categorization, spam detection, medical diagnosis',
      icon: '📊',
      commonTechniques: ['SVM', 'Random Forest', 'Neural Networks', 'Logistic Regression'],
      typicalAccuracy: '80-95%',
      complexity: 'Low-Medium'
    }
  ];

  const dataTypes = [
    { id: 'structured', name: 'Structured Data (Tables, CSV)', complexity: 1.0 },
    { id: 'text', name: 'Text Data', complexity: 1.5 },
    { id: 'images', name: 'Images', complexity: 2.0 },
    { id: 'audio', name: 'Audio/Speech', complexity: 1.8 },
    { id: 'video', name: 'Video', complexity: 2.5 },
    { id: 'time-series', name: 'Time Series', complexity: 1.3 },
    { id: 'mixed', name: 'Mixed/Multimodal', complexity: 2.2 }
  ];

  const dataSizes = [
    { id: 'small', name: 'Small (< 10K records)', difficulty: 'Easy', recommendation: 'Simple algorithms work well' },
    { id: 'medium', name: 'Medium (10K - 1M records)', difficulty: 'Medium', recommendation: 'Most algorithms suitable' },
    { id: 'large', name: 'Large (1M - 100M records)', difficulty: 'Hard', recommendation: 'Scalable algorithms needed' },
    { id: 'very-large', name: 'Very Large (> 100M records)', difficulty: 'Very Hard', recommendation: 'Distributed computing required' }
  ];

  const addConstraint = () => {
    if (newConstraint.trim() && !constraints.includes(newConstraint.trim())) {
      setConstraints([...constraints, newConstraint.trim()]);
      setNewConstraint('');
    }
  };

  const removeConstraint = (constraint: string) => {
    setConstraints(constraints.filter(c => c !== constraint));
  };

  const startAssessment = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep(3);

    // Simulate AI assessment process
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + Math.random() * 8;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Generate comprehensive AI technique assessment
          const aiAssessment = generateAssessment();
          setAssessment(aiAssessment);
          setIsAnalyzing(false);
          setCurrentStep(4);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const generateAssessment = () => {
    const domain = problemDomains.find(d => d.id === problemDomain);
    const dataType = dataTypes.find(dt => dt.id === requirements.dataType);
    const dataSize = dataSizes.find(ds => ds.id === requirements.dataSize);

    // Generate technique recommendations based on requirements
    const techniques = generateTechniqueRecommendations();
    
    // Generate implementation roadmap
    const roadmap = generateImplementationRoadmap();
    
    // Generate risk assessment
    const risks = generateRiskAssessment();

    // Generate resource requirements
    const resources = generateResourceRequirements();

    // Generate success metrics
    const metrics = generateSuccessMetrics();

    return {
      domainInfo: {
        name: domain?.name,
        complexity: domain?.complexity,
        typicalAccuracy: domain?.typicalAccuracy
      },
      requirements: {
        dataType: dataType?.name,
        dataSize: dataSize?.name,
        accuracy: requirements.accuracy,
        performance: requirements.performance,
        interpretability: requirements.interpretability,
        budget: requirements.budget,
        timeline: requirements.timeline,
        experience: requirements.experience
      },
      techniques,
      roadmap,
      risks,
      resources,
      metrics,
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      overallRecommendation: techniques[0]?.name || 'Custom Solution Required'
    };
  };

  const generateTechniqueRecommendations = () => {
    const baseRecommendations = {
      'computer-vision': [
        { 
          name: 'Convolutional Neural Networks (CNN)', 
          suitability: 95, 
          complexity: 'High',
          accuracy: '90-95%',
          trainingTime: '2-10 days',
          pros: ['Excellent for image recognition', 'State-of-the-art accuracy', 'Well-established'],
          cons: ['Requires large datasets', 'High computational cost', 'Black box model'],
          frameworks: ['TensorFlow', 'PyTorch', 'Keras'],
          estimatedCost: '€15,000 - €50,000'
        },
        { 
          name: 'Vision Transformers (ViT)', 
          suitability: 88, 
          complexity: 'Very High',
          accuracy: '92-97%',
          trainingTime: '5-15 days',
          pros: ['Cutting-edge performance', 'Good with large datasets', 'Transfer learning'],
          cons: ['Very complex', 'Requires massive datasets', 'High resource needs'],
          frameworks: ['Hugging Face', 'PyTorch', 'JAX'],
          estimatedCost: '€25,000 - €80,000'
        },
        { 
          name: 'Transfer Learning (Pre-trained Models)', 
          suitability: 85, 
          complexity: 'Medium',
          accuracy: '85-92%',
          trainingTime: '1-3 days',
          pros: ['Fast implementation', 'Lower data requirements', 'Cost-effective'],
          cons: ['Limited customization', 'Domain dependency', 'Model size'],
          frameworks: ['TensorFlow Hub', 'PyTorch Hub', 'OpenCV'],
          estimatedCost: '€5,000 - €20,000'
        }
      ],
      'nlp': [
        { 
          name: 'BERT (Bidirectional Encoder Representations)', 
          suitability: 92, 
          complexity: 'High',
          accuracy: '88-94%',
          trainingTime: '3-8 days',
          pros: ['Excellent text understanding', 'Context-aware', 'Pre-trained models available'],
          cons: ['Large model size', 'Slow inference', 'Memory intensive'],
          frameworks: ['Hugging Face', 'TensorFlow', 'PyTorch'],
          estimatedCost: '€20,000 - €60,000'
        },
        { 
          name: 'GPT-based Models', 
          suitability: 90, 
          complexity: 'High',
          accuracy: '85-92%',
          trainingTime: '2-6 days',
          pros: ['Great for text generation', 'Versatile', 'Strong performance'],
          cons: ['Can be expensive', 'Hallucination issues', 'Fine-tuning complexity'],
          frameworks: ['OpenAI API', 'Hugging Face', 'Azure OpenAI'],
          estimatedCost: '€10,000 - €40,000'
        },
        { 
          name: 'Traditional ML + Feature Engineering', 
          suitability: 75, 
          complexity: 'Medium',
          accuracy: '75-88%',
          trainingTime: '1-3 days',
          pros: ['Interpretable', 'Fast training', 'Lower resource needs'],
          cons: ['Manual feature work', 'Lower accuracy', 'Domain expertise needed'],
          frameworks: ['Scikit-learn', 'spaCy', 'NLTK'],
          estimatedCost: '€5,000 - €15,000'
        }
      ],
      'predictive-analytics': [
        { 
          name: 'XGBoost/LightGBM', 
          suitability: 95, 
          complexity: 'Medium',
          accuracy: '82-92%',
          trainingTime: '2-6 hours',
          pros: ['Excellent performance', 'Fast training', 'Good interpretability'],
          cons: ['Hyperparameter tuning', 'Overfitting risk', 'Feature engineering needed'],
          frameworks: ['XGBoost', 'LightGBM', 'CatBoost'],
          estimatedCost: '€8,000 - €25,000'
        },
        { 
          name: 'Random Forest', 
          suitability: 88, 
          complexity: 'Low',
          accuracy: '78-88%',
          trainingTime: '30min - 2 hours',
          pros: ['Easy to use', 'Good interpretability', 'Handles missing data'],
          cons: ['Can overfit', 'Large model size', 'Less accurate than boosting'],
          frameworks: ['Scikit-learn', 'R', 'H2O'],
          estimatedCost: '€3,000 - €12,000'
        },
        { 
          name: 'Neural Networks', 
          suitability: 82, 
          complexity: 'High',
          accuracy: '80-90%',
          trainingTime: '4-12 hours',
          pros: ['Can capture complex patterns', 'Scalable', 'Flexible architecture'],
          cons: ['Black box', 'Hyperparameter sensitive', 'Overfitting risk'],
          frameworks: ['TensorFlow', 'PyTorch', 'Keras'],
          estimatedCost: '€15,000 - €40,000'
        }
      ]
    };

    return baseRecommendations[problemDomain as keyof typeof baseRecommendations] || baseRecommendations['predictive-analytics'];
  };

  const generateImplementationRoadmap = () => {
    const baseTimeWeeks = {
      'small': 8,
      'medium': 12,
      'large': 18,
      'very-large': 24
    }[requirements.dataSize] || 12;

    return [
      {
        phase: 'Data Collection & Preparation',
        duration: Math.round(baseTimeWeeks * 0.3),
        tasks: [
          'Data gathering and validation',
          'Data cleaning and preprocessing', 
          'Feature engineering',
          'Train/validation/test split'
        ],
        deliverables: ['Clean dataset', 'Data quality report', 'Feature documentation']
      },
      {
        phase: 'Model Development',
        duration: Math.round(baseTimeWeeks * 0.4),
        tasks: [
          'Algorithm selection and implementation',
          'Hyperparameter tuning',
          'Model training and validation',
          'Performance optimization'
        ],
        deliverables: ['Trained models', 'Performance metrics', 'Model comparison report']
      },
      {
        phase: 'Testing & Validation',
        duration: Math.round(baseTimeWeeks * 0.2),
        tasks: [
          'Model testing on unseen data',
          'Performance validation',
          'Bias and fairness testing',
          'Error analysis'
        ],
        deliverables: ['Test results', 'Validation report', 'Model documentation']
      },
      {
        phase: 'Deployment & Monitoring',
        duration: Math.round(baseTimeWeeks * 0.1),
        tasks: [
          'Production deployment',
          'Monitoring setup',
          'Documentation and training',
          'Maintenance planning'
        ],
        deliverables: ['Production system', 'Monitoring dashboard', 'User documentation']
      }
    ];
  };

  const generateRiskAssessment = () => {
    return [
      {
        risk: 'Data Quality Issues',
        probability: requirements.dataSize === 'small' ? 'High' : 'Medium',
        impact: 'High',
        mitigation: 'Implement robust data validation and cleaning processes',
        severity: requirements.dataSize === 'small' ? 8 : 6
      },
      {
        risk: 'Model Overfitting',
        probability: requirements.experience === 'beginner' ? 'High' : 'Medium',
        impact: 'Medium',
        mitigation: 'Use cross-validation, regularization, and proper train/test splits',
        severity: requirements.experience === 'beginner' ? 7 : 5
      },
      {
        risk: 'Performance Requirements Not Met',
        probability: requirements.performance === 'real-time' ? 'Medium' : 'Low',
        impact: 'High',
        mitigation: 'Early performance testing and model optimization',
        severity: requirements.performance === 'real-time' ? 7 : 4
      },
      {
        risk: 'Budget Overrun',
        probability: requirements.budget === 'low' ? 'High' : 'Medium',
        impact: 'Medium',
        mitigation: 'Agile development with regular budget reviews',
        severity: requirements.budget === 'low' ? 6 : 4
      }
    ];
  };

  const generateResourceRequirements = () => {
    const complexityMultiplier = {
      'Low': 1.0,
      'Medium': 1.5,
      'High': 2.0,
      'Very High': 3.0
    };

    const baseHours = 400;
    const domain = problemDomains.find(d => d.id === problemDomain);
    const multiplier = complexityMultiplier[domain?.complexity as keyof typeof complexityMultiplier] || 1.5;
    
    return {
      team: [
        { role: 'Data Scientist', count: 1, hourlyRate: 85, totalHours: Math.round(baseHours * multiplier * 0.6) },
        { role: 'ML Engineer', count: 1, hourlyRate: 75, totalHours: Math.round(baseHours * multiplier * 0.3) },
        { role: 'Data Engineer', count: 1, hourlyRate: 70, totalHours: Math.round(baseHours * multiplier * 0.2) },
        { role: 'Project Manager', count: 0.5, hourlyRate: 90, totalHours: Math.round(baseHours * multiplier * 0.1) }
      ],
      infrastructure: [
        { item: 'Cloud Computing (GPU)', cost: 2000, recurring: 'Monthly' },
        { item: 'Data Storage', cost: 500, recurring: 'Monthly' },
        { item: 'ML Platform License', cost: 1500, recurring: 'Monthly' },
        { item: 'Development Tools', cost: 800, recurring: 'One-time' }
      ],
      totalBudget: Math.round(baseHours * multiplier * 78) // Average hourly rate
    };
  };

  const generateSuccessMetrics = () => {
    const accuracyTarget = {
      'high': '> 90%',
      'medium': '> 80%',
      'low': '> 70%'
    }[requirements.accuracy] || '> 80%';

    return [
      { metric: 'Model Accuracy', target: accuracyTarget, measurement: 'Test set evaluation' },
      { metric: 'Response Time', target: requirements.performance === 'real-time' ? '< 100ms' : '< 1s', measurement: 'API response time' },
      { metric: 'Data Processing Speed', target: '> 1000 records/min', measurement: 'Batch processing throughput' },
      { metric: 'Model Interpretability', target: requirements.interpretability === 'high' ? 'SHAP values available' : 'Feature importance', measurement: 'Explanation quality' },
      { metric: 'System Uptime', target: '> 99.5%', measurement: 'Production monitoring' },
      { metric: 'User Adoption', target: '> 80% user satisfaction', measurement: 'User feedback surveys' }
    ];
  };

  const resetAssessment = () => {
    setCurrentStep(1);
    setProblemDomain('');
    setRequirements({
      problemDescription: '',
      dataType: '',
      dataSize: '',
      accuracy: '',
      performance: '',
      interpretability: '',
      budget: '',
      timeline: '',
      experience: ''
    });
    setConstraints([]);
    setNewConstraint('');
    setAssessment(null);
    setAnalysisProgress(0);
  };

  const exportAssessment = (format: string) => {
    alert(`Exporting AI technique assessment in ${format} format...`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Problem Domain Selection</h3>
            <p className="text-slate-400 mb-6">Choose the AI problem domain that best matches your requirements.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problemDomains.map((domain) => (
                <Card
                  key={domain.id}
                  className={`p-4 cursor-pointer transition-all ${
                    problemDomain === domain.id 
                      ? 'border-2 border-blue-500 bg-blue-500/10' 
                      : 'border-2 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setProblemDomain(domain.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{domain.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{domain.name}</h4>
                      <Badge variant="secondary" className="text-xs">{domain.complexity}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{domain.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Typical Accuracy:</span>
                      <span className="text-green-400">{domain.typicalAccuracy}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Common Techniques:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {domain.commonTechniques.slice(0, 2).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                        {domain.commonTechniques.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{domain.commonTechniques.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!problemDomain}
                className={`flex items-center gap-2 ${
                  problemDomain ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                Next: Requirements <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 2: Requirements & Constraints</h3>
            
            <div className="space-y-6">
              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Problem Description</label>
                <Textarea
                  placeholder="Describe your AI problem in detail..."
                  value={requirements.problemDescription}
                  onChange={(e) => setRequirements({...requirements, problemDescription: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Data Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Data Type</label>
                  <Select value={requirements.dataType} onValueChange={(value) => setRequirements({...requirements, dataType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Data Size</label>
                  <Select value={requirements.dataSize} onValueChange={(value) => setRequirements({...requirements, dataSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data size" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name} - {size.difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Performance Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Accuracy Requirements</label>
                  <Select value={requirements.accuracy} onValueChange={(value) => setRequirements({...requirements, accuracy: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select accuracy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (&gt; 70%)</SelectItem>
                      <SelectItem value="medium">Medium (&gt; 80%)</SelectItem>
                      <SelectItem value="high">High (&gt; 90%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Performance Needs</label>
                  <Select value={requirements.performance} onValueChange={(value) => setRequirements({...requirements, performance: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="batch">Batch Processing</SelectItem>
                      <SelectItem value="near-realtime">Near Real-time</SelectItem>
                      <SelectItem value="real-time">Real-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Interpretability</label>
                  <Select value={requirements.interpretability} onValueChange={(value) => setRequirements({...requirements, interpretability: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interpretability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Black box OK)</SelectItem>
                      <SelectItem value="medium">Medium (Some explanation)</SelectItem>
                      <SelectItem value="high">High (Full explainability)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project Constraints */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Budget Range</label>
                  <Select value={requirements.budget} onValueChange={(value) => setRequirements({...requirements, budget: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (&lt; €20K)</SelectItem>
                      <SelectItem value="medium">Medium (€20K - €100K)</SelectItem>
                      <SelectItem value="high">High (&gt; €100K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Timeline</label>
                  <Select value={requirements.timeline} onValueChange={(value) => setRequirements({...requirements, timeline: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (&lt; 3 months)</SelectItem>
                      <SelectItem value="normal">Normal (3-6 months)</SelectItem>
                      <SelectItem value="flexible">Flexible (&gt; 6 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Team Experience</label>
                  <Select value={requirements.experience} onValueChange={(value) => setRequirements({...requirements, experience: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Constraints */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Additional Constraints</label>
                <Card className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add constraint (e.g., GDPR compliance, on-premise only)..."
                      value={newConstraint}
                      onChange={(e) => setNewConstraint(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addConstraint} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {constraints.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {constraints.map((constraint, index) => (
                        <button 
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-600 rounded-full cursor-pointer hover:bg-red-500/20 text-gray-300"
                          onClick={() => removeConstraint(constraint)}
                        >
                          {constraint}
                          <span className="ml-1 text-red-400">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={startAssessment}
                disabled={!requirements.problemDescription || !requirements.dataType || !requirements.dataSize}
                className={`flex items-center gap-2 ${
                  requirements.problemDescription && requirements.dataType && requirements.dataSize
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                <Brain className="w-4 h-4" />
                Start AI Assessment
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Analyzing Requirements...</h3>
            <p className="text-slate-400 mb-6">
              Our AI is evaluating your requirements and recommending the best techniques
            </p>
            
            <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Assessment Progress</span>
                <span className="text-white">{analysisProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Current Task</div>
                <div className="text-white font-medium">
                  {analysisProgress < 25 ? 'Domain Analysis' :
                   analysisProgress < 50 ? 'Technique Matching' :
                   analysisProgress < 75 ? 'Risk Assessment' : 'Generating Roadmap'}
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Techniques Evaluated</div>
                <div className="text-purple-400 font-medium">{Math.floor(analysisProgress / 8)}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Confidence</div>
                <div className="text-green-400 font-medium">{Math.min(98, analysisProgress * 0.98).toFixed(0)}%</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">ETA</div>
                <div className="text-white font-medium">{Math.max(0, Math.ceil((100 - analysisProgress) * 0.15))}s</div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Assessment Summary */}
            <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">AI Technique Assessment Complete</h3>
                  <p className="text-purple-200">Recommended Solution: {assessment?.overallRecommendation}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {assessment?.confidence}% Confidence
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{assessment?.domainInfo.name}</div>
                  <div className="text-sm text-slate-400">Problem Domain</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{assessment?.domainInfo.complexity}</div>
                  <div className="text-sm text-slate-400">Complexity</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{assessment?.domainInfo.typicalAccuracy}</div>
                  <div className="text-sm text-slate-400">Expected Accuracy</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Rocket className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{assessment?.techniques?.length || 0}</div>
                  <div className="text-sm text-slate-400">Techniques Evaluated</div>
                </Card>
              </div>
            </Card>

            {/* Technique Recommendations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recommended AI Techniques</h3>
              <div className="space-y-4">
                {assessment?.techniques?.map((technique: any, index: number) => (
                  <Card key={index} className={`p-4 ${index === 0 ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20' : 'bg-slate-700 border-slate-600'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-500'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{technique.name}</h4>
                          <Badge variant="secondary" className="text-xs">{technique.complexity} Complexity</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">{technique.suitability}%</div>
                        <div className="text-xs text-slate-400">Suitability</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-slate-400 text-sm">Expected Accuracy:</span>
                        <span className="text-white ml-2 font-medium">{technique.accuracy}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Training Time:</span>
                        <span className="text-white ml-2 font-medium">{technique.trainingTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Estimated Cost:</span>
                        <span className="text-green-400 ml-2 font-medium">{technique.estimatedCost}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-green-400 font-medium mb-2">Pros:</h5>
                        <ul className="text-sm text-slate-300 space-y-1">
                          {technique.pros.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-red-400 font-medium mb-2">Cons:</h5>
                        <ul className="text-sm text-slate-300 space-y-1">
                          {technique.cons.map((con: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <span className="text-slate-400 text-sm">Frameworks: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {technique.frameworks.map((framework: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{framework}</Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Implementation Roadmap */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Implementation Roadmap</h3>
              <div className="space-y-4">
                {assessment?.roadmap?.map((phase: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700 border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{phase.phase}</h4>
                      <Badge variant="secondary">{phase.duration} weeks</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-slate-400 text-sm mb-2">Tasks:</h5>
                        <ul className="text-sm text-slate-300 space-y-1">
                          {phase.tasks.map((task: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-slate-400 text-sm mb-2">Deliverables:</h5>
                        <ul className="text-sm text-slate-300 space-y-1">
                          {phase.deliverables.map((deliverable: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Resource Requirements */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Resource Requirements</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Team Requirements</h4>
                  <div className="space-y-3">
                    {assessment?.resources?.team.map((member: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{member.role}</div>
                          <div className="text-slate-400 text-sm">{member.totalHours}h @ €{member.hourlyRate}/hr</div>
                        </div>
                        <div className="text-green-400 font-medium">
                          €{(member.totalHours * member.hourlyRate).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Infrastructure Costs</h4>
                  <div className="space-y-3">
                    {assessment?.resources?.infrastructure.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{item.item}</div>
                          <Badge variant="secondary" className="text-xs">{item.recurring}</Badge>
                        </div>
                        <div className="text-blue-400 font-medium">€{item.cost.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">€{assessment?.resources?.totalBudget.toLocaleString()}</div>
                  <div className="text-green-200">Estimated Total Budget</div>
                </div>
              </div>
            </Card>

            {/* Risk Assessment */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Risk Assessment</h3>
              <div className="space-y-3">
                {assessment?.risks?.map((risk: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700 border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{risk.risk}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={risk.probability === 'High' ? 'red' : risk.probability === 'Medium' ? 'yellow' : 'green'}>
                          {risk.probability}
                        </Badge>
                        <Badge variant={risk.impact === 'High' ? 'red' : risk.impact === 'Medium' ? 'yellow' : 'green'}>
                          {risk.impact} Impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{risk.mitigation}</p>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Success Metrics */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Success Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment?.metrics?.map((metric: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700 border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{metric.metric}</h4>
                      <Badge variant="secondary">{metric.target}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{metric.measurement}</p>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Export Options */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Export Assessment</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['PDF Report', 'Technical Specification', 'Project Proposal', 'Implementation Guide'].map((format) => (
                  <Button 
                    key={format}
                    onClick={() => exportAssessment(format)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {format}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={resetAssessment} className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                New Assessment
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Start Implementation
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
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-purple-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Get AI-powered recommendations for the best machine learning techniques based on your specific 
          requirements, data characteristics, and constraints. Perfect for project planning and technology selection.
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
          <span>Problem Domain</span>
          <span>Requirements</span>
          <span>AI Analysis</span>
          <span>Recommendations</span>
        </div>
      </Card>

      {/* Main Content */}
      {renderStep()}
    </div>
  );
}
