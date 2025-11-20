import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  TestTube, 
  Play, 
  Download, 
  Target,
  Activity,
  Award,
  ArrowLeft,
  Shield,
  BarChart,
  RefreshCw,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

interface ProfessionalControlledExperimentExecutionServiceProps {
  service: any;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  type: 'A/B Test' | 'Multivariate' | 'Sequential' | 'Bayesian';
  status: 'draft' | 'running' | 'completed' | 'paused' | 'failed';
  startDate: string;
  endDate: string;
  participants: number;
  conversionRate: number;
  confidence: number;
  significance: number;
  pValue: number;
  effectSize: number;
  power: number;
  metrics: string[];
  segments: string[];
  hypothesis: string;
  successCriteria: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedDuration: number;
  actualDuration: number;
  cost: number;
  roi: number;
  tags: string[];
  owner: string;
  team: string[];
  stakeholders: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  compliance: string[];
  dataRetention: number;
  privacyLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  blinding: boolean;
  controlGroup: boolean;
  sampleSize: number;
  powerAnalysis: number;
}

interface ExperimentConfig {
  name: string;
  description: string;
  hypothesis: string;
  successCriteria: string;
  metrics: string[];
  segments: string[];
  duration: number;
  sampleSize: number;
  significance: number;
  power: number;
  blinding: boolean;
  controlGroup: boolean;
  powerAnalysis: number;
}

const ProfessionalControlledExperimentExecutionService: React.FC<ProfessionalControlledExperimentExecutionServiceProps> = ({ service }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [experimentConfig, setExperimentConfig] = useState<ExperimentConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState('');
  const [results, setResults] = useState<any>(null);

  // Mock experiments
  const experiments: Experiment[] = [
    {
      id: 'exp-1',
      name: 'A/B Test: Landing Page Conversion',
      description: 'Test different landing page designs to improve conversion rates',
      type: 'A/B Test',
      status: 'draft',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      participants: 0,
      conversionRate: 0,
      confidence: 0,
      significance: 0,
      pValue: 0,
      effectSize: 0,
      power: 0,
      metrics: ['conversion_rate', 'click_through_rate', 'bounce_rate'],
      segments: ['new_users', 'returning_users'],
      hypothesis: 'The new landing page design will increase conversion rates by 15%',
      successCriteria: 'Conversion rate improvement of at least 10% with 95% confidence',
      riskLevel: 'low',
      expectedDuration: 30,
      actualDuration: 0,
      cost: 0,
      roi: 0,
      tags: ['conversion', 'landing_page', 'ui_ux'],
      owner: 'Product Team',
      team: ['Product Manager', 'UX Designer', 'Data Analyst'],
      stakeholders: ['Marketing', 'Engineering'],
      approvalStatus: 'pending',
      compliance: ['GDPR', 'CCPA'],
      dataRetention: 90,
      privacyLevel: 'internal',
      blinding: true,
      controlGroup: true,
      sampleSize: 10000,
      powerAnalysis: 0.8
    },
    {
      id: 'exp-2',
      name: 'Multivariate: Email Campaign Optimization',
      description: 'Test multiple email elements simultaneously to find the best combination',
      type: 'Multivariate',
      status: 'draft',
      startDate: '2024-01-25',
      endDate: '2024-03-25',
      participants: 0,
      conversionRate: 0,
      confidence: 0,
      significance: 0,
      pValue: 0,
      effectSize: 0,
      power: 0,
      metrics: ['open_rate', 'click_rate', 'conversion_rate'],
      segments: ['subscribers', 'non_subscribers'],
      hypothesis: 'Personalized subject lines and send times will improve email engagement',
      successCriteria: 'Open rate improvement of at least 20% with 90% confidence',
      riskLevel: 'medium',
      expectedDuration: 60,
      actualDuration: 0,
      cost: 0,
      roi: 0,
      tags: ['email', 'marketing', 'personalization'],
      owner: 'Marketing Team',
      team: ['Marketing Manager', 'Email Specialist', 'Data Scientist'],
      stakeholders: ['Product', 'Sales'],
      approvalStatus: 'pending',
      compliance: ['GDPR', 'CAN-SPAM'],
      dataRetention: 180,
      privacyLevel: 'internal',
      blinding: false,
      controlGroup: true,
      sampleSize: 50000,
      powerAnalysis: 0.85
    },
    {
      id: 'exp-3',
      name: 'Sequential: Pricing Strategy Test',
      description: 'Test different pricing strategies with sequential analysis',
      type: 'Sequential',
      status: 'draft',
      startDate: '2024-02-01',
      endDate: '2024-04-01',
      participants: 0,
      conversionRate: 0,
      confidence: 0,
      significance: 0,
      pValue: 0,
      effectSize: 0,
      power: 0,
      metrics: ['revenue', 'conversion_rate', 'customer_lifetime_value'],
      segments: ['enterprise', 'smb', 'startup'],
      hypothesis: 'Dynamic pricing will increase revenue by 25% without affecting conversion',
      successCriteria: 'Revenue increase of at least 20% with 95% confidence',
      riskLevel: 'high',
      expectedDuration: 60,
      actualDuration: 0,
      cost: 0,
      roi: 0,
      tags: ['pricing', 'revenue', 'strategy'],
      owner: 'Business Team',
      team: ['Business Analyst', 'Pricing Manager', 'Data Scientist'],
      stakeholders: ['Sales', 'Finance', 'Product'],
      approvalStatus: 'pending',
      compliance: ['GDPR', 'SOX'],
      dataRetention: 365,
      privacyLevel: 'confidential',
      blinding: true,
      controlGroup: true,
      sampleSize: 25000,
      powerAnalysis: 0.9
    }
  ];

  const startExperiment = () => {
    if (!selectedExperiment) {
      alert('Please select an experiment');
      return;
    }

    setIsRunning(true);
    setCurrentStep(2);
    setExecutionProgress(0);
    setCurrentProcess('Initializing experiment execution...');

    // Simulate experiment execution
    const experimentInterval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 100) {
          clearInterval(experimentInterval);
          completeExperiment();
          return 100;
        }
        return prev + 3;
      });
    }, 200);

    // Update process messages
    const processMessages = [
      'Initializing experiment execution...',
      'Setting up control and treatment groups...',
      'Implementing randomization and blinding...',
      'Collecting baseline metrics...',
      'Running experiment and collecting data...',
      'Performing statistical analysis...',
      'Generating results and recommendations...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < processMessages.length - 1) {
        messageIndex++;
        setCurrentProcess(processMessages[messageIndex]);
      }
    }, 500);
  };

  const completeExperiment = () => {
    // Simulate experiment results
    const mockResults = {
      experiment: selectedExperiment?.name,
      duration: Math.floor(Math.random() * 20) + 10,
      participants: Math.floor(Math.random() * 5000) + 1000,
      conversionRate: Math.random() * 0.3 + 0.1,
      confidence: Math.random() * 0.1 + 0.9,
      significance: Math.random() * 0.05,
      pValue: Math.random() * 0.05,
      effectSize: Math.random() * 0.5 + 0.1,
      power: Math.random() * 0.2 + 0.8,
      metrics: {
        conversionRate: Math.random() * 0.3 + 0.1,
        clickThroughRate: Math.random() * 0.2 + 0.05,
        bounceRate: Math.random() * 0.4 + 0.2,
        revenue: Math.random() * 10000 + 5000,
        customerSatisfaction: Math.random() * 20 + 70
      },
      segments: {
        newUsers: Math.random() * 0.3 + 0.1,
        returningUsers: Math.random() * 0.4 + 0.2,
        enterprise: Math.random() * 0.2 + 0.05,
        smb: Math.random() * 0.3 + 0.1
      },
      statisticalSignificance: Math.random() > 0.3,
      practicalSignificance: Math.random() > 0.4,
      recommendations: [
        'Implement the winning variant across all traffic',
        'Consider additional testing for edge cases',
        'Monitor performance for 2 weeks post-implementation',
        'Document learnings for future experiments'
      ],
      nextSteps: [
        'Deploy winning variant to production',
        'Set up monitoring and alerting',
        'Schedule follow-up analysis',
        'Share results with stakeholders'
      ]
    };

    setResults(mockResults);
    setIsRunning(false);
    setCurrentStep(3);
  };

  const resetExperiment = () => {
    setCurrentStep(1);
    setSelectedExperiment(null);
    setExperimentConfig(null);
    setResults(null);
    setExecutionProgress(0);
    setCurrentProcess('');
  };

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      experiment: selectedExperiment,
      results: results,
      config: experimentConfig
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': return 'text-blue-500';
      case 'paused': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-8 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TestTube className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Controlled Experiment Execution</h1>
                <p className="text-text-secondary mt-1">Professional A/B testing, multivariate analysis, and statistical validation system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-surface text-text-primary border-border hover:bg-surface-elevated transition-colors">
                <Shield className="w-4 h-4 mr-2" />
                GDPR Compliant
              </Badge>
              <Badge variant="secondary" className="bg-surface text-text-primary border-border hover:bg-surface-elevated transition-colors">
                <Award className="w-4 h-4 mr-2" />
                Statistical Rigor
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-background-secondary text-text-muted'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep >= step ? 'text-primary' : 'text-text-muted'
                }`}>
                  {step === 1 ? 'Setup' : step === 2 ? 'Execution' : 'Results'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 ml-4 ${
                    currentStep > step ? 'bg-primary' : 'bg-background-secondary'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Experiment Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-text-primary">
                <TestTube className="w-6 h-6 mr-3 text-primary" />
                Select Experiment
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiments.map((experiment) => (
                  <div 
                    key={experiment.id} 
                    className={`border rounded-lg p-6 cursor-pointer transition-all bg-surface ${
                      selectedExperiment?.id === experiment.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedExperiment(experiment)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <TestTube className="w-6 h-6 text-primary" />
                        <div>
                          <h3 className="font-semibold text-text-primary">{experiment.name}</h3>
                          <p className="text-sm text-text-secondary">{experiment.type}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        experiment.status === 'completed' ? 'bg-green-500' : 
                        experiment.status === 'running' ? 'bg-blue-500' : 
                        experiment.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-4">{experiment.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Duration:</span>
                        <span className="text-text-primary">{experiment.expectedDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Sample Size:</span>
                        <span className="text-text-primary">{experiment.sampleSize.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Risk Level:</span>
                        <span className={`font-medium ${
                          experiment.riskLevel === 'low' ? 'text-green-500' :
                          experiment.riskLevel === 'medium' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {experiment.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Power Analysis:</span>
                        <span className="text-text-primary">{(experiment.powerAnalysis * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {experiment.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-background-secondary text-xs rounded text-text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedExperiment && (
                <div className="mt-8 p-6 bg-background-secondary rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">Experiment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Hypothesis</h4>
                      <p className="text-sm text-text-secondary">{selectedExperiment.hypothesis}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Success Criteria</h4>
                      <p className="text-sm text-text-secondary">{selectedExperiment.successCriteria}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Metrics</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExperiment.metrics.map((metric, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/10 text-xs rounded text-primary">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">Segments</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExperiment.segments.map((segment, index) => (
                          <span key={index} className="px-2 py-1 bg-secondary/10 text-xs rounded text-secondary">
                            {segment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={startExperiment}
                  disabled={!selectedExperiment}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Experiment
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Experiment Execution */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-text-primary">
                <Activity className="w-6 h-6 mr-3 text-primary" />
                Experiment Execution
              </h2>
              
              <div className="text-center mb-8">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="w-full h-full rounded-full border-8 border-background-secondary"></div>
                  <div 
                    className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-primary border-t-transparent"
                    style={{
                      transform: `rotate(${executionProgress * 3.6}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{executionProgress}%</span>
                  </div>
                </div>
                
                <p className="text-lg text-text-secondary mb-4">{currentProcess}</p>
                
                <div className="w-full bg-background-secondary rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4 bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">Setup Control & Treatment Groups</h4>
                        <p className="text-sm text-text-secondary">Randomizing participants and implementing blinding</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-secondary">Step 1</span>
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-4 bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">Data Collection & Monitoring</h4>
                        <p className="text-sm text-text-secondary">Collecting metrics and monitoring experiment health</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-secondary">Step 2</span>
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-4 bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">Statistical Analysis</h4>
                        <p className="text-sm text-text-secondary">Performing significance tests and effect size calculations</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-secondary">Step 3</span>
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && results && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center text-text-primary">
                <BarChart className="w-6 h-6 mr-3 text-primary" />
                Experiment Results
              </h2>
              <div className="flex space-x-4">
                <Button
                  onClick={exportResults}
                  variant="outline"
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button
                  onClick={resetExperiment}
                  variant="outline"
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Experiment
                </Button>
              </div>
            </div>

            {/* Summary Statistics */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center text-text-primary">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Experiment Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {results.participants.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-secondary">Participants</div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {(results.conversionRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-text-secondary">Conversion Rate</div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {(results.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-text-secondary">Confidence</div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {results.duration}
                  </div>
                  <div className="text-sm text-text-secondary">Days</div>
                </div>
              </div>
            </Card>

            {/* Statistical Significance */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center text-text-primary">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Statistical Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {results.significance.toFixed(3)}
                  </div>
                  <div className="text-sm text-text-secondary">P-Value</div>
                  <div className={`text-xs mt-1 ${
                    results.statisticalSignificance ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {results.statisticalSignificance ? 'Significant' : 'Not Significant'}
                  </div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {results.effectSize.toFixed(3)}
                  </div>
                  <div className="text-sm text-text-secondary">Effect Size</div>
                  <div className={`text-xs mt-1 ${
                    results.practicalSignificance ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {results.practicalSignificance ? 'Practical' : 'Not Practical'}
                  </div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {(results.power * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-text-secondary">Power</div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {results.duration}
                  </div>
                  <div className="text-sm text-text-secondary">Duration (Days)</div>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center text-text-primary">
                <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                Recommendations & Next Steps
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Next Steps</h4>
                  <ul className="space-y-2">
                    {results.nextSteps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                        <ArrowLeft className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalControlledExperimentExecutionService;
