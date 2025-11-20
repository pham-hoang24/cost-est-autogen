'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Calculator, 
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
  LineChart,
  Info,
  BookOpen,
  Building,
  Users,
  Globe,
  Lock,
  Unlock,
  TrendingDown,
  Percent,
  Euro,
  CreditCard,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  Code
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

interface ProfessionalCostEstimationServiceProps {
  service: any;
}

export default function ProfessionalCostEstimationService({ service }: ProfessionalCostEstimationServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethodology, setSelectedMethodology] = useState<string[]>([]);
  const [projectDetails, setProjectDetails] = useState({
    projectType: '',
    complexity: '',
    duration: '',
    teamSize: '',
    technology: '',
    region: '',
    compliance: ''
  });
  const [estimationConfig, setEstimationConfig] = useState({
    includeRisk: true,
    includeContingency: true,
    includeOverhead: true,
    includeProfit: true,
    currency: 'EUR',
    accuracy: 'high'
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimationResults, setEstimationResults] = useState<any>(null);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [currentCalculation, setCurrentCalculation] = useState('');

  // Industry-Standard Cost Estimation Methodologies
  const costEstimationMethodologies = [
    {
      id: 'cocomo',
      name: 'COCOMO II (Constructive Cost Model)',
      description: 'Industry-standard software cost estimation model developed by Barry Boehm',
      category: 'Software Development',
      icon: <Code className="w-6 h-6" />,
      standards: ['IEEE 16326', 'ISO/IEC 14143', 'ISO/IEC 25010'],
      accuracy: '85-95%',
      complexity: 'High',
      useCases: ['Software Development', 'IT Projects', 'System Integration'],
      features: ['Effort Estimation', 'Schedule Prediction', 'Cost Breakdown', 'Risk Analysis'],
      formula: 'Effort = a × (Size)^b × EAF',
      parameters: ['Size (SLOC)', 'Effort Adjustment Factor', 'Scale Factors'],
      cost: '$0.25/estimation',
      documentation: 'Boehm, B. (2000). Software Cost Estimation with COCOMO II'
    },
    {
      id: 'function-points',
      name: 'Function Point Analysis (FPA)',
      description: 'ISO/IEC 14143 standard for measuring software functional size',
      category: 'Software Metrics',
      icon: <Target className="w-6 h-6" />,
      standards: ['ISO/IEC 14143', 'ISO/IEC 25010', 'IFPUG Standards'],
      accuracy: '80-90%',
      complexity: 'Medium',
      useCases: ['Application Development', 'Maintenance Projects', 'Legacy Systems'],
      features: ['Functional Size Measurement', 'Productivity Analysis', 'Quality Metrics'],
      formula: 'FP = Σ(Count × Weight)',
      parameters: ['Data Functions', 'Transaction Functions', 'Complexity Factors'],
      cost: '$0.20/estimation',
      documentation: 'IFPUG (2017). Function Point Counting Practices Manual'
    },
    {
      id: 'story-points',
      name: 'Story Points & Velocity',
      description: 'Agile methodology for estimating user stories and sprint planning',
      category: 'Agile Development',
      icon: <Users className="w-6 h-6" />,
      standards: ['Scrum Guide', 'SAFe Framework', 'Agile Manifesto'],
      accuracy: '70-85%',
      complexity: 'Low',
      useCases: ['Agile Projects', 'Sprint Planning', 'Scrum Teams'],
      features: ['Story Estimation', 'Velocity Tracking', 'Sprint Planning'],
      formula: 'Effort = Story Points / Velocity',
      parameters: ['Story Points', 'Team Velocity', 'Sprint Duration'],
      cost: '$0.15/estimation',
      documentation: 'Schwaber, K. & Sutherland, J. (2020). The Scrum Guide'
    },
    {
      id: 'parametric',
      name: 'Parametric Cost Estimation',
      description: 'Statistical models based on historical data and regression analysis',
      category: 'Statistical Analysis',
      icon: <BarChart3 className="w-6 h-6" />,
      standards: ['IEEE 16326', 'ISO/IEC 25010', 'PMI Standards'],
      accuracy: '75-90%',
      complexity: 'Medium',
      useCases: ['Large Projects', 'Historical Data', 'Benchmarking'],
      features: ['Regression Analysis', 'Historical Data', 'Statistical Models'],
      formula: 'Cost = f(Size, Complexity, Technology)',
      parameters: ['Project Size', 'Complexity Factors', 'Technology Stack'],
      cost: '$0.30/estimation',
      documentation: 'PMI (2017). A Guide to the Project Management Body of Knowledge'
    },
    {
      id: 'bottom-up',
      name: 'Bottom-Up Estimation',
      description: 'Detailed estimation by breaking down work into smallest components',
      category: 'Detailed Planning',
      icon: <Layers className="w-6 h-6" />,
      standards: ['PMI Standards', 'ISO 21500', 'PRINCE2'],
      accuracy: '90-95%',
      complexity: 'Very High',
      useCases: ['Detailed Planning', 'Fixed-Price Contracts', 'Critical Projects'],
      features: ['Work Breakdown', 'Resource Planning', 'Detailed Scheduling'],
      formula: 'Total Cost = Σ(Component Costs)',
      parameters: ['Work Packages', 'Resource Rates', 'Time Estimates'],
      cost: '$0.40/estimation',
      documentation: 'PMI (2017). Practice Standard for Project Estimating'
    },
    {
      id: 'analogous',
      name: 'Analogous Estimation',
      description: 'Cost estimation based on similar past projects and expert judgment',
      category: 'Expert Judgment',
      icon: <Brain className="w-6 h-6" />,
      standards: ['PMI Standards', 'ISO 21500', 'Expert Judgment Guidelines'],
      accuracy: '60-80%',
      complexity: 'Low',
      useCases: ['Early Planning', 'Feasibility Studies', 'Quick Estimates'],
      features: ['Historical Comparison', 'Expert Judgment', 'Rapid Estimation'],
      formula: 'Cost = Historical Cost × Adjustment Factor',
      parameters: ['Historical Data', 'Adjustment Factors', 'Expert Judgment'],
      cost: '$0.10/estimation',
      documentation: 'PMI (2017). Practice Standard for Project Estimating'
    }
  ];

  // Industry Standards and Frameworks
  const industryStandards = [
    {
      id: 'iso-21500',
      name: 'ISO 21500:2012',
      title: 'Guidance on Project Management',
      description: 'International standard providing guidance on project management concepts and processes',
      scope: 'Project Management',
      applicability: 'Global',
      keyAreas: ['Project Planning', 'Cost Management', 'Risk Management', 'Quality Management'],
      costEstimation: 'Provides framework for project cost estimation and control',
      compliance: 'Required for government projects in many countries'
    },
    {
      id: 'pmi-pmbok',
      name: 'PMI PMBOK Guide',
      title: 'Project Management Body of Knowledge',
      description: 'Comprehensive guide to project management practices and standards',
      scope: 'Project Management',
      applicability: 'Global',
      keyAreas: ['Cost Management', 'Time Management', 'Scope Management', 'Risk Management'],
      costEstimation: 'Detailed cost estimation processes and techniques',
      compliance: 'Industry standard for project management certification'
    },
    {
      id: 'ieee-16326',
      name: 'IEEE 16326',
      title: 'Software and Systems Engineering - Life Cycle Processes',
      description: 'Standard for software and systems engineering life cycle processes',
      scope: 'Software Engineering',
      applicability: 'Global',
      keyAreas: ['Software Life Cycle', 'Cost Estimation', 'Quality Assurance', 'Risk Management'],
      costEstimation: 'Software cost estimation models and techniques',
      compliance: 'Required for software development projects'
    },
    {
      id: 'iso-25010',
      name: 'ISO/IEC 25010',
      title: 'Systems and Software Quality Requirements and Evaluation',
      description: 'Standard for software quality models and evaluation',
      scope: 'Software Quality',
      applicability: 'Global',
      keyAreas: ['Quality Models', 'Quality Metrics', 'Quality Evaluation', 'Cost-Benefit Analysis'],
      costEstimation: 'Quality-based cost estimation and trade-off analysis',
      compliance: 'Required for software quality assurance'
    },
    {
      id: 'cmmi',
      name: 'CMMI-DEV',
      title: 'Capability Maturity Model Integration for Development',
      description: 'Framework for improving development processes and capabilities',
      scope: 'Process Improvement',
      applicability: 'Global',
      keyAreas: ['Process Management', 'Project Management', 'Cost Management', 'Risk Management'],
      costEstimation: 'Process-based cost estimation and improvement',
      compliance: 'Required for high-maturity organizations'
    }
  ];

  // Cost Estimation Templates
  const costTemplates = [
    {
      id: 'software-development',
      name: 'Software Development Project',
      description: 'Comprehensive cost estimation for software development projects',
      methodology: 'COCOMO II + Function Points',
      components: ['Development Effort', 'Testing & QA', 'Project Management', 'Infrastructure'],
      duration: '3-12 months',
      teamSize: '5-50 people',
      costRange: '€50K - €2M',
      accuracy: '85-95%'
    },
    {
      id: 'ai-ml-project',
      name: 'AI/ML Project',
      description: 'Cost estimation for artificial intelligence and machine learning projects',
      methodology: 'Parametric + Bottom-Up',
      components: ['Data Preparation', 'Model Development', 'Training & Validation', 'Deployment'],
      duration: '6-18 months',
      teamSize: '3-20 people',
      costRange: '€100K - €5M',
      accuracy: '80-90%'
    },
    {
      id: 'system-integration',
      name: 'System Integration',
      description: 'Cost estimation for system integration and migration projects',
      methodology: 'Bottom-Up + Analogous',
      components: ['Integration Planning', 'Data Migration', 'Testing', 'Go-Live Support'],
      duration: '6-24 months',
      teamSize: '10-100 people',
      costRange: '€200K - €10M',
      accuracy: '90-95%'
    },
    {
      id: 'cloud-migration',
      name: 'Cloud Migration',
      description: 'Cost estimation for cloud migration and modernization projects',
      methodology: 'Parametric + Function Points',
      components: ['Assessment', 'Migration Planning', 'Data Migration', 'Optimization'],
      duration: '3-18 months',
      teamSize: '5-30 people',
      costRange: '€50K - €3M',
      accuracy: '85-90%'
    }
  ];

  const startEstimation = () => {
    if (selectedMethodology.length === 0) {
      alert('Please select at least one estimation methodology');
      return;
    }

    setIsCalculating(true);
    setCurrentStep(3);
    setCalculationProgress(0);
    setCurrentCalculation('Initializing cost estimation...');

    const calculationSteps = [
      'Analyzing project requirements and complexity...',
      'Applying selected estimation methodologies...',
      'Calculating effort and resource requirements...',
      'Performing risk and contingency analysis...',
      'Generating cost breakdown and timeline...',
      'Validating estimates against industry benchmarks...',
      'Preparing comprehensive cost report...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setCalculationProgress(prev => {
        const newProgress = prev + Math.random() * 12;
        if (newProgress >= 100) {
          clearInterval(interval);
          generateResults();
          return 100;
        }
        return newProgress;
      });

      if (stepIndex < calculationSteps.length) {
        setCurrentCalculation(calculationSteps[stepIndex]);
        stepIndex++;
      }
    }, 1500);
  };

  const generateResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      duration: '2m 30s',
      methodologies: selectedMethodology,
      projectDetails,
      config: estimationConfig,
      estimates: selectedMethodology.map(methodologyId => {
        const methodology = costEstimationMethodologies.find(m => m.id === methodologyId);
        return {
          methodology: methodology?.name,
          category: methodology?.category,
          accuracy: methodology?.accuracy,
          totalCost: Math.random() * 500000 + 100000,
          breakdown: {
            development: Math.random() * 200000 + 50000,
            testing: Math.random() * 100000 + 25000,
            management: Math.random() * 80000 + 20000,
            infrastructure: Math.random() * 60000 + 15000,
            contingency: Math.random() * 50000 + 10000
          },
          timeline: {
            duration: Math.floor(Math.random() * 12) + 3,
            phases: [
              { phase: 'Planning', duration: 1, cost: Math.random() * 20000 + 10000 },
              { phase: 'Development', duration: Math.floor(Math.random() * 8) + 4, cost: Math.random() * 200000 + 100000 },
              { phase: 'Testing', duration: Math.floor(Math.random() * 3) + 2, cost: Math.random() * 80000 + 40000 },
              { phase: 'Deployment', duration: 1, cost: Math.random() * 30000 + 15000 }
            ]
          },
          risks: [
            { risk: 'Technical Complexity', probability: 'Medium', impact: 'High', mitigation: 'Expert team allocation' },
            { risk: 'Scope Creep', probability: 'High', impact: 'Medium', mitigation: 'Change control process' },
            { risk: 'Resource Availability', probability: 'Low', impact: 'High', mitigation: 'Resource planning' }
          ],
          recommendations: [
            'Consider agile methodology for better cost control',
            'Implement continuous monitoring and adjustment',
            'Plan for 15-20% contingency buffer',
            'Regular stakeholder communication and approval'
          ]
        };
      }),
      summary: {
        averageCost: Math.random() * 400000 + 150000,
        costRange: {
          low: Math.random() * 200000 + 100000,
          high: Math.random() * 600000 + 300000
        },
        confidence: Math.random() * 20 + 75,
        riskLevel: Math.random() > 0.5 ? 'Medium' : 'High',
        roi: Math.random() * 300 + 150
      },
      charts: {
        costBreakdown: [
          { category: 'Development', value: Math.random() * 200000 + 100000, color: '#3B82F6' },
          { category: 'Testing', value: Math.random() * 80000 + 40000, color: '#10B981' },
          { category: 'Management', value: Math.random() * 60000 + 30000, color: '#F59E0B' },
          { category: 'Infrastructure', value: Math.random() * 40000 + 20000, color: '#EF4444' },
          { category: 'Contingency', value: Math.random() * 50000 + 25000, color: '#8B5CF6' }
        ],
        timeline: [
          { month: 'Month 1', cost: Math.random() * 50000 + 25000 },
          { month: 'Month 2', cost: Math.random() * 80000 + 40000 },
          { month: 'Month 3', cost: Math.random() * 100000 + 50000 },
          { month: 'Month 4', cost: Math.random() * 120000 + 60000 },
          { month: 'Month 5', cost: Math.random() * 90000 + 45000 },
          { month: 'Month 6', cost: Math.random() * 60000 + 30000 }
        ]
      }
    };

    setEstimationResults(results);
    setIsCalculating(false);
    setCurrentStep(4);
  };

  const toggleMethodology = (methodologyId: string) => {
    setSelectedMethodology(prev => 
      prev.includes(methodologyId) 
        ? prev.filter(id => id !== methodologyId)
        : [...prev, methodologyId]
    );
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Methodology Selection';
      case 2: return 'Project Configuration';
      case 3: return 'Cost Calculation';
      case 4: return 'Results & Analysis';
      default: return 'Cost Estimation';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Choose from industry-standard cost estimation methodologies';
      case 2: return 'Configure project details and estimation parameters';
      case 3: return 'AI-powered cost calculation in progress';
      case 4: return 'Comprehensive cost analysis and recommendations';
      default: return 'Professional cost estimation system';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-blue-500" />
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

      {/* Step 1: Methodology Selection */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Industry-Standard Cost Estimation Methodologies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costEstimationMethodologies.map((methodology) => (
              <div
                key={methodology.id}
                onClick={() => toggleMethodology(methodology.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethodology.includes(methodology.id)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {methodology.icon}
                    <h4 className="font-semibold text-white">{methodology.name}</h4>
                  </div>
                  <Badge variant="accent">{methodology.category}</Badge>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{methodology.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-green-400 font-medium">{methodology.accuracy}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Complexity:</span>
                    <span className="text-white">{methodology.complexity}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">{methodology.cost}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Standards:</div>
                  <div className="flex flex-wrap gap-1">
                    {methodology.standards.slice(0, 2).map((standard) => (
                      <Badge key={standard} variant="gray" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                    {methodology.standards.length > 2 && (
                      <Badge variant="gray" className="text-xs">
                        +{methodology.standards.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div>Formula: {methodology.formula}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-4">
              Selected: {selectedMethodology.length} methodology{selectedMethodology.length !== 1 ? 'ies' : ''}
            </p>
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={selectedMethodology.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Configure Project
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Project Configuration */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Project Details */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Project Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Type</label>
                <select
                  value={projectDetails.projectType}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, projectType: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select project type...</option>
                  <option value="software-development">Software Development</option>
                  <option value="ai-ml">AI/ML Project</option>
                  <option value="system-integration">System Integration</option>
                  <option value="cloud-migration">Cloud Migration</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="web-application">Web Application</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Complexity Level</label>
                <select
                  value={projectDetails.complexity}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, complexity: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select complexity...</option>
                  <option value="low">Low (Simple)</option>
                  <option value="medium">Medium (Moderate)</option>
                  <option value="high">High (Complex)</option>
                  <option value="very-high">Very High (Highly Complex)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Duration</label>
                <select
                  value={projectDetails.duration}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select duration...</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="12-24-months">12-24 months</option>
                  <option value="24+months">24+ months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Team Size</label>
                <select
                  value={projectDetails.teamSize}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, teamSize: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select team size...</option>
                  <option value="1-5">1-5 people</option>
                  <option value="5-10">5-10 people</option>
                  <option value="10-20">10-20 people</option>
                  <option value="20-50">20-50 people</option>
                  <option value="50+">50+ people</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Technology Stack</label>
                <select
                  value={projectDetails.technology}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, technology: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select technology...</option>
                  <option value="web">Web Technologies</option>
                  <option value="mobile">Mobile Development</option>
                  <option value="ai-ml">AI/ML Technologies</option>
                  <option value="cloud">Cloud Technologies</option>
                  <option value="enterprise">Enterprise Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Region</label>
                <select
                  value={projectDetails.region}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select region...</option>
                  <option value="north-america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia-pacific">Asia Pacific</option>
                  <option value="latin-america">Latin America</option>
                  <option value="middle-east-africa">Middle East & Africa</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Estimation Configuration */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Estimation Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Currency</label>
                <select
                  value={estimationConfig.currency}
                  onChange={(e) => setEstimationConfig(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="SEK">Swedish Krona (kr)</option>
                  <option value="NOK">Norwegian Krone (kr)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Accuracy Level</label>
                <select
                  value={estimationConfig.accuracy}
                  onChange={(e) => setEstimationConfig(prev => ({ ...prev, accuracy: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="standard">Standard (±20%)</option>
                  <option value="high">High (±10%)</option>
                  <option value="premium">Premium (±5%)</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-3">Estimation Options</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={estimationConfig.includeRisk}
                    onChange={(e) => setEstimationConfig(prev => ({ ...prev, includeRisk: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Include Risk Analysis</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={estimationConfig.includeContingency}
                    onChange={(e) => setEstimationConfig(prev => ({ ...prev, includeContingency: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Include Contingency</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={estimationConfig.includeOverhead}
                    onChange={(e) => setEstimationConfig(prev => ({ ...prev, includeOverhead: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Include Overhead</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={estimationConfig.includeProfit}
                    onChange={(e) => setEstimationConfig(prev => ({ ...prev, includeProfit: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white text-sm">Include Profit Margin</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setCurrentStep(1)}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Methodologies
            </Button>
            <Button 
              onClick={startEstimation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Cost
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Cost Calculation */}
      {currentStep === 3 && (
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Calculating Cost Estimates</h3>
            <p className="text-gray-400 mb-6">AI-powered cost analysis in progress</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${calculationProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mb-6">{Math.round(calculationProgress)}% Complete</p>
            
            {/* Current Calculation */}
            {currentCalculation && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-white">{currentCalculation}</p>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Methodologies</div>
                <div className="text-white font-semibold">{selectedMethodology.length}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Project Type</div>
                <div className="text-white font-semibold">{projectDetails.projectType || 'Not specified'}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-400">Complexity</div>
                <div className="text-white font-semibold">{projectDetails.complexity || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Results & Analysis */}
      {currentStep === 4 && estimationResults && (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Cost Estimation Results</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button onClick={() => setCurrentStep(1)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Calculator className="w-4 h-4 mr-2" />
                  New Estimation
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Average Cost</div>
                <div className="text-white font-semibold text-xl">
                  {estimationConfig.currency} {Math.round(estimationResults.summary.averageCost).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Confidence Level</div>
                <div className="text-green-400 font-semibold text-xl">{estimationResults.summary.confidence.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Risk Level</div>
                <div className="text-yellow-400 font-semibold text-xl">{estimationResults.summary.riskLevel}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Expected ROI</div>
                <div className="text-blue-400 font-semibold text-xl">{estimationResults.summary.roi.toFixed(0)}%</div>
              </div>
            </div>
          </Card>

          {/* Cost Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={estimationResults.charts.costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {estimationResults.charts.costBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Cost Timeline</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={estimationResults.charts.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Methodology Results */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Methodology Comparison</h4>
            <div className="space-y-4">
              {estimationResults.estimates.map((estimate: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-white font-medium">{estimate.methodology}</h5>
                      <p className="text-gray-400 text-sm">{estimate.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold text-xl">
                        {estimationConfig.currency} {Math.round(estimate.totalCost).toLocaleString()}
                      </div>
                      <div className="text-green-400 text-sm">Accuracy: {estimate.accuracy}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Development</div>
                      <div className="text-white">{Math.round(estimate.breakdown.development).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Testing</div>
                      <div className="text-white">{Math.round(estimate.breakdown.testing).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Management</div>
                      <div className="text-white">{Math.round(estimate.breakdown.management).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Infrastructure</div>
                      <div className="text-white">{Math.round(estimate.breakdown.infrastructure).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Contingency</div>
                      <div className="text-white">{Math.round(estimate.breakdown.contingency).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Industry Standards Information */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Industry Standards & Compliance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryStandards.slice(0, 4).map((standard) => (
                <div key={standard.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h5 className="text-white font-medium">{standard.name}</h5>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{standard.title}</p>
                  <p className="text-gray-300 text-xs">{standard.description}</p>
                  <div className="mt-2">
                    <div className="text-xs text-gray-400">Scope: {standard.scope}</div>
                    <div className="text-xs text-gray-400">Applicability: {standard.applicability}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Demo Notice */}
      <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-yellow-400 font-medium">Demo Version</span>
        </div>
        <p className="text-yellow-300 text-sm mt-1">
          This is a demonstration of our professional cost estimation system. In production, this would connect to real cost databases and industry benchmarks.
        </p>
      </Card>
    </div>
  );
}
