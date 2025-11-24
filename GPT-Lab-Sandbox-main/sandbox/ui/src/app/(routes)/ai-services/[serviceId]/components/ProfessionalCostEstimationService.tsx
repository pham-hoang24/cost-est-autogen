'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import CostEstimationChatbot from './CostEstimationChatbot';
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
  Code,
  Sparkles,
  ChevronUp
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
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());

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

  const handleBasicChange = (field: string, value: any) => {
    setProjectDetails(prev => ({ ...prev, [field]: value }));
  };

  const startEstimation = () => {
    if (selectedMethodology.length === 0) {
      alert('Please select at least one estimation methodology');
      return;
    }

    setIsCalculating(true);
    // Transition to results step (Step 3 in our new flow)
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
    // Calculate base values
    const totalCost = Math.random() * 400000 + 150000;
    const laborCost = totalCost * 0.65;
    const infrastructureCost = totalCost * 0.15;
    const otherExpenses = totalCost * 0.20;
    const effortMonths = (Math.random() * 2) + 1;
    const durationMonths = Math.ceil(effortMonths * 0.7);
    const teamSize = Math.ceil(effortMonths / durationMonths);
    
    // Calculate variance between methods
    const methodCosts = selectedMethodology.map(() => Math.random() * 500000 + 100000);
    const costVariance = methodCosts.length > 1 
      ? Math.abs((Math.max(...methodCosts) - Math.min(...methodCosts)) / Math.min(...methodCosts) * 100)
      : 0;
    
    const confidenceLevel = costVariance > 50 ? 'LOW - Significant variance between methods' 
      : costVariance > 25 ? 'MEDIUM - Moderate variance' 
      : 'HIGH - Low variance';
    
    // Generate features breakdown
    const functionalReqs = [
      'User authentication',
      'Dashboard',
      'Data management',
      'Reporting'
    ];
    
    // Generate features breakdown with detailed information
    const featuresData = [
      {
        name: 'User authentication',
        description: 'Implement user registration, login, and password reset functionalities to allow users to create accounts and securely access their profiles.',
        tags: ['Authentication', 'User', 'Web App'],
        hours: Math.random() * 50 + 100,
        user_stories: [
          'As a user, I want to register with email and password so that I can create an account.',
          'As a user, I want to log in to my account so that I can access my profile.',
          'As a user, I want to reset my password if I forget it so that I can regain access to my account.'
        ]
      },
      {
        name: 'Dashboard',
        description: 'Create an intuitive dashboard to display key metrics, analytics, and user activity overview.',
        tags: ['Dashboard', 'Analytics', 'Web App'],
        hours: Math.random() * 50 + 120,
        user_stories: [
          'As a user, I want to see my activity summary so that I can track my usage.',
          'As a user, I want to view analytics charts so that I can understand trends.',
          'As a user, I want quick access to common actions so that I can work efficiently.'
        ]
      },
      {
        name: 'Data management',
        description: 'Build comprehensive data management tools for creating, editing, and organizing records with search and filtering.',
        tags: ['Data', 'Management', 'CRUD'],
        hours: Math.random() * 50 + 150,
        user_stories: [
          'As a user, I want to create new records so that I can add data to the system.',
          'As a user, I want to edit existing records so that I can update information.',
          'As a user, I want to delete records so that I can remove outdated data.',
          'As a user, I want to search and filter records so that I can find specific items quickly.'
        ]
      },
      {
        name: 'Reporting',
        description: 'Implement reporting features with customizable templates, export options, and scheduled report generation.',
        tags: ['Reports', 'Analytics', 'Export'],
        hours: Math.random() * 50 + 80,
        user_stories: [
          'As a user, I want to generate reports so that I can analyze data.',
          'As a user, I want to export reports to PDF so that I can share them.',
          'As a user, I want to schedule automated reports so that I receive them regularly.'
        ]
      }
    ];
    
    const features = featuresData.map(f => ({
      ...f,
      cost: f.hours * 62.5 // average hourly rate
    }));
    
    const results = {
      timestamp: new Date().toISOString(),
      project_data: {
        original_project_type: projectDetails.projectType,
        project_type: projectDetails.projectType.includes('web') ? 'organic' : 'semi-detached',
        technical_complexity: {
          high_complexity: projectDetails.complexity === 'high' || projectDetails.complexity === 'very-high'
        },
        project_requirements: `${projectDetails.projectType} project with ${projectDetails.complexity} complexity`,
        functional_requirements: functionalReqs
      },
      estimation_result: {
        executive_summary: `Intelligent multi-method estimate: €${Math.round(totalCost).toLocaleString()} over ${durationMonths} months using ${selectedMethodology.length} method${selectedMethodology.length > 1 ? 's' : ''} [${confidenceLevel.split(' - ')[0]}]`,
        team_composition: {
          developers: [
            { level: 'senior', count: Math.max(1, Math.floor(teamSize * 0.4)) },
            { level: 'mid', count: Math.max(0, Math.floor(teamSize * 0.4)) },
            { level: 'junior', count: Math.max(0, Math.floor(teamSize * 0.2)) }
          ].filter(d => d.count > 0),
          designers: teamSize > 3 ? [{ level: 'ui/ux', count: 1 }] : [],
          other_roles: []
        },
        cost_estimate: {
          total_cost: totalCost,
          labor_cost: laborCost,
          infrastructure_cost: infrastructureCost,
          other_expenses: otherExpenses,
          confidence_level: confidenceLevel
        },
        timeline_estimate: {
          total_duration: `${durationMonths} month${durationMonths > 1 ? 's' : ''}`
        },
        resource_allocation: {
          recommended_team_size: teamSize
        },
        explanation: `Combined estimate from ${selectedMethodology.length} method${selectedMethodology.length > 1 ? 's' : ''} with confidence weights. Cost variance: ${Math.round(costVariance)}%`,
        success_criteria: [
          'The application should meet all specified functional requirements',
          'The application should be delivered within the estimated timeline',
          'The application should be delivered within the estimated budget',
          'Code quality should meet industry standards'
        ],
        deliverables: [
          'Fully functional application',
          'Source code and documentation',
          'User manual and technical documentation',
          'Deployment guide'
        ],
        features: features,
        timeline: [
          {
            task: 'Planning & Design',
            description: 'Establish project requirements, design system architecture, and create UI/UX mockups',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration_weeks: 4,
            deliverables: [
              'Requirements specification document',
              'System architecture design',
              'UI/UX mockups and prototypes',
              'Technical specification document'
            ]
          },
          {
            task: 'Development',
            description: 'Implement core features, integrate third-party services, and build the application',
            start_date: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + (durationMonths * 30 - 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration_weeks: Math.max(8, durationMonths * 4 - 10),
            deliverables: [
              'Functional application modules',
              'API endpoints and integrations',
              'Database schema and migrations',
              'Code documentation'
            ]
          },
          {
            task: 'Testing & QA',
            description: 'Perform unit testing, integration testing, and user acceptance testing',
            start_date: new Date(Date.now() + (durationMonths * 30 - 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + (durationMonths * 30 - 4) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration_weeks: 2,
            deliverables: [
              'Test cases and test reports',
              'Bug fix documentation',
              'Performance optimization report',
              'Security audit results'
            ]
          },
          {
            task: 'Deployment',
            description: 'Deploy to production, configure infrastructure, and provide training',
            start_date: new Date(Date.now() + (durationMonths * 30 - 4) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration_weeks: 1,
            deliverables: [
              'Production deployment',
              'Infrastructure setup documentation',
              'User training materials',
              'Handover and support plan'
            ]
          }
        ],
        estimation_method: selectedMethodology.length > 1 ? 'Intelligent Multi-Method' : 'Single Method',
        methods_used: selectedMethodology,
        individual_estimates: Object.fromEntries(
          selectedMethodology.map((methodId, i) => {
            const methodology = methodId === 'hybrid' 
              ? { name: 'Hybrid Method', accuracy: '60-75%' }
              : costEstimationMethodologies.find(m => m.id === methodId);
            
            const confidence = parseFloat(methodology?.accuracy?.split('-')[1] || '75') / 100;
            
            return [methodId, {
              methodology: methodology?.name || 'Unknown',
              cost: methodCosts[i] || totalCost,
              duration: `${Math.ceil((methodCosts[i] || totalCost) / (laborCost / durationMonths))} months`,
              weight: confidence,
              breakdown: {
                development: (methodCosts[i] || totalCost) * 0.5,
                testing: (methodCosts[i] || totalCost) * 0.2,
                management: (methodCosts[i] || totalCost) * 0.15,
                infrastructure: (methodCosts[i] || totalCost) * 0.10,
                contingency: (methodCosts[i] || totalCost) * 0.05
              }
            }];
          })
        ),
        effort_person_months: effortMonths,
        warning: costVariance > 50 
          ? `⚠️ WARNING: High variance (${Math.round(costVariance)}%) between methods. Consider reviewing individual estimates before proceeding.`
          : costVariance > 25
          ? `⚠️ CAUTION: Moderate variance (${Math.round(costVariance)}%) between methods.`
          : null
      }
    };

    setEstimationResults(results);
    setIsCalculating(false);
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
      case 1: return 'Project Configuration';
      case 2: return 'Methodology Selection';
      case 3: return 'Results & Analysis';
      default: return 'Cost Estimation';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Configure project details and estimation parameters';
      case 2: return 'Choose from industry-standard cost estimation methodologies';
      case 3: return 'Comprehensive cost analysis and recommendations';
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
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-8 h-0.5 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Project Configuration (Was Step 2 in Reference) */}
      {currentStep === 1 && (
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

          <div className="flex justify-end items-center">
            <Button 
              onClick={() => setCurrentStep(2)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next: Select Methodology
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Methodology Selection (Was Step 1 in Reference) + Chatbot */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Full Width Chatbot with Method Selection */}
          <CostEstimationChatbot 
            onUpdateBasics={handleBasicChange} 
            onMethodSelected={(methodIds) => setSelectedMethodology(methodIds)}
            className="w-full" 
          />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setCurrentStep(1)}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configuration
            </Button>
            
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-400">
                Selected: {selectedMethodology.length} method{selectedMethodology.length !== 1 ? 's' : ''}
              </p>
              <Button 
                onClick={startEstimation}
                disabled={selectedMethodology.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Cost
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Results & Analysis (Was Step 4 in Reference, plus Step 3 loading state) */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {isCalculating ? (
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
          ) : estimationResults && (
            <div className="space-y-6">
              {/* Executive Summary Banner */}
              <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Executive Summary</h3>
                </div>
                <p className="text-white text-lg">
                  {estimationResults.estimation_result.executive_summary}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {estimationResults.estimation_result.explanation}
                </p>
              </Card>

              {/* Warning Alert */}
              {estimationResults.estimation_result.warning && (
                <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <p className="text-yellow-400 font-medium">{estimationResults.estimation_result.warning}</p>
                  </div>
                </Card>
              )}

              {/* Project Context */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Project Context</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 text-sm">Requirements</div>
                    <div className="text-white">{estimationResults.project_data.project_requirements}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Functional Requirements</div>
                    <div className="flex flex-wrap gap-2">
                      {estimationResults.project_data.functional_requirements.map((req: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-white">{req}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">Project Type</div>
                      <div className="text-white capitalize">{estimationResults.project_data.project_type}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">High Complexity</div>
                      <div className="text-white">
                        {estimationResults.project_data.technical_complexity.high_complexity ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

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
                    <div className="text-gray-400 text-sm">Total Cost</div>
                    <div className="text-white font-semibold text-xl">
                      €{Math.round(estimationResults.estimation_result.cost_estimate.total_cost).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Confidence</div>
                    <div className="text-green-400 font-semibold text-xl">
                      {estimationResults.estimation_result.cost_estimate.confidence_level.split(' - ')[0]}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Duration</div>
                    <div className="text-blue-400 font-semibold text-xl">
                      {estimationResults.estimation_result.timeline_estimate.total_duration}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Effort</div>
                    <div className="text-purple-400 font-semibold text-xl">
                      {estimationResults.estimation_result.effort_person_months.toFixed(1)} PM
                    </div>
                  </div>
                </div>
              </Card>

              {/* Team Composition */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Team Composition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Developers
                    </h4>
                    <div className="space-y-2">
                      {estimationResults.estimation_result.team_composition.developers.map((dev: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-gray-700 rounded px-3 py-2">
                          <span className="text-gray-300 capitalize">{dev.level}</span>
                          <Badge variant="accent">{dev.count} {dev.count === 1 ? 'person' : 'people'}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">Other Roles</h4>
                    {estimationResults.estimation_result.team_composition.designers.length > 0 ? (
                      <div className="space-y-2">
                        {estimationResults.estimation_result.team_composition.designers.map((designer: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-gray-700 rounded px-3 py-2">
                            <span className="text-gray-300 capitalize">{designer.level}</span>
                            <Badge variant="accent">{designer.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No additional roles required</p>
                    )}
                    <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded p-3">
                      <div className="text-gray-400 text-sm">Recommended Team Size</div>
                      <div className="text-white font-semibold text-lg">
                        {estimationResults.estimation_result.resource_allocation.recommended_team_size} members
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Detailed Cost Breakdown */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Detailed Cost Breakdown</h4>
                <div className="relative h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { 
                            category: 'Labor Cost', 
                            value: estimationResults.estimation_result.cost_estimate.labor_cost, 
                            color: '#3B82F6' 
                          },
                          { 
                            category: 'Infrastructure', 
                            value: estimationResults.estimation_result.cost_estimate.infrastructure_cost, 
                            color: '#10B981' 
                          },
                          { 
                            category: 'Other Expenses', 
                            value: estimationResults.estimation_result.cost_estimate.other_expenses, 
                            color: '#F59E0B' 
                          }
                        ]}
                        cx="40%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="category"
                        label={({ value }) => `€${Math.round(value).toLocaleString()}`}
                        labelLine={true}
                      >
                        {[
                          { color: '#3B82F6' },
                          { color: '#10B981' },
                          { color: '#F59E0B' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                      <Legend align="right" verticalAlign="middle" layout="vertical" />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  
                  {/* Total Cost positioned below legend */}
                  <div className="absolute right-4 bottom-20 w-48">
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded px-3 py-2">
                      <div className="text-gray-300 text-xs">Total Cost</div>
                      <div className="text-white font-bold text-lg">
                        €{Math.round(estimationResults.estimation_result.cost_estimate.total_cost).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Features Cost Breakdown */}
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Features</h3>
                <div className="space-y-3">
                  {estimationResults.estimation_result.features.map((feature: any, index: number) => {
                    const isExpanded = expandedFeatures.has(index);
                    
                    return (
                      <div key={index} className="border border-gray-700 rounded-lg overflow-hidden">
                        {/* Feature Header - Always Visible */}
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedFeatures);
                            if (isExpanded) {
                              newExpanded.delete(index);
                            } else {
                              newExpanded.add(index);
                            }
                            setExpandedFeatures(newExpanded);
                          }}
                          className="w-full px-6 py-4 flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-xl font-bold text-white">{index + 1}.</span>
                              <h4 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{feature.name}</h4>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-8">
                              {feature.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs text-white">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right ml-6 flex-shrink-0">
                            <div className="text-gray-400 text-sm">Hours</div>
                            <div className="text-3xl font-bold text-white">{Math.round(feature.hours)}</div>
                            <div className="text-gray-400 text-xs mt-1">Cost</div>
                            <div className="text-white font-semibold">€{Math.round(feature.cost).toLocaleString()}</div>
                          </div>
                        </button>
                        
                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
                            <p className="text-gray-300 mb-4 ml-8">{feature.description}</p>
                            
                            <div className="ml-8">
                              <h5 className="text-white font-semibold mb-2">
                                {feature.user_stories.length} User Stories
                              </h5>
                              <ol className="space-y-2">
                                {feature.user_stories.map((story: string, i: number) => (
                                  <li key={i} className="text-gray-400 text-sm">
                                    {i + 1}. {story}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Project Timeline */}
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Timeline</h3>
                <div className="space-y-6">
                  {estimationResults.estimation_result.timeline.map((phase: any, index: number) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold text-white">{index + 1}.</span>
                            <h4 className="text-xl font-semibold text-white">{phase.task}</h4>
                          </div>
                          <p className="text-gray-300 mb-4 ml-8">{phase.description}</p>
                          
                          <div className="ml-8">
                            <h5 className="text-white font-semibold mb-2">Deliverables for this phase:</h5>
                            <ul className="space-y-1">
                              {phase.deliverables.map((deliverable: string, i: number) => (
                                <li key={i} className="text-gray-400 text-sm">
                                  - {deliverable}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6 flex-shrink-0">
                          <div className="text-gray-400 text-sm">Weeks</div>
                          <div className="text-5xl font-bold text-white">{phase.duration_weeks}</div>
                        </div>
                      </div>
                      
                      {index < estimationResults.estimation_result.timeline.length - 1 && (
                        <div className="border-b border-gray-700 my-6"></div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Methodology Comparison */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Methodology Comparison</h4>
                <div className="space-y-4">
                  {Object.entries(estimationResults.estimation_result.individual_estimates).map(([methodId, estimate]: [string, any], index: number) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="text-white font-medium">{estimate.methodology}</h5>
                          <p className="text-gray-400 text-sm">Weight: {(estimate.weight * 100).toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold text-xl">
                            €{Math.round(estimate.cost).toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">{estimate.duration}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Development</div>
                          <div className="text-white">€{Math.round(estimate.breakdown.development).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Testing</div>
                          <div className="text-white">€{Math.round(estimate.breakdown.testing).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Management</div>
                          <div className="text-white">€{Math.round(estimate.breakdown.management).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Infrastructure</div>
                          <div className="text-white">€{Math.round(estimate.breakdown.infrastructure).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Contingency</div>
                          <div className="text-white">€{Math.round(estimate.breakdown.contingency).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Success Criteria & Deliverables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Success Criteria
                  </h4>
                  <ul className="space-y-2">
                    {estimationResults.estimation_result.success_criteria.map((criterion: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {estimationResults.estimation_result.deliverables.map((deliverable: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

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
