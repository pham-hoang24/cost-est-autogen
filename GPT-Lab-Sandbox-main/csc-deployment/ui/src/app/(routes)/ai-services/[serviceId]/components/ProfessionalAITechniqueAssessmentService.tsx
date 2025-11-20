import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Brain, 
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
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Lightbulb,
  TestTube,
  Microscope,
  GitBranch,
  Workflow,
  Network,
  Layers3,
  Sparkles,
  Target as TargetIcon,
  CheckSquare,
  XCircle,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon2,
  LineChart as LineChartIcon2,
  Activity as ActivityIcon,
  Database as DatabaseIcon,
  Cpu as CpuIcon,
  Brain as BrainIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Users as UsersIcon,
  Building as BuildingIcon,
  Globe as GlobeIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  TrendingDown as TrendingDownIcon,
  Percent as PercentIcon,
  Euro as EuroIcon,
  CreditCard as CreditCardIcon,
  Code as CodeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  RefreshCw as RefreshCwIcon,
  Lightbulb as LightbulbIcon,
  TestTube as TestTubeIcon,
  Microscope as MicroscopeIcon,
  GitBranch as GitBranchIcon,
  Workflow as WorkflowIcon,
  Network as NetworkIcon,
  Layers3 as Layers3Icon,
  Sparkles as SparklesIcon,
  Target as TargetIcon2,
  CheckSquare as CheckSquareIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

interface ProfessionalAITechniqueAssessmentServiceProps {
  service: any;
}

interface AITechnique {
  id: string;
  name: string;
  category: string;
  description: string;
  useCases: string[];
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
  accuracy: string;
  performance: string;
  cost: string;
  requirements: string[];
  pros: string[];
  cons: string[];
  references: string[];
  standards: string[];
  icon: React.ReactNode;
  suitability: number; // 0-100
  confidence: number; // 0-100
}

interface AssessmentResult {
  technique: AITechnique;
  score: number;
  reasoning: string;
  recommendations: string[];
  alternatives: AITechnique[];
}

const ProfessionalAITechniqueAssessmentService: React.FC<ProfessionalAITechniqueAssessmentServiceProps> = ({ service }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState('');

  // AI Techniques Database
  const aiTechniques: AITechnique[] = [
    {
      id: 'ml-supervised',
      name: 'Supervised Learning',
      category: 'Machine Learning',
      description: 'Learning with labeled training data to make predictions on new, unseen data.',
      useCases: ['Classification', 'Regression', 'Pattern Recognition', 'Predictive Analytics'],
      complexity: 'Medium',
      accuracy: '85-95%',
      performance: 'High',
      cost: 'Medium',
      requirements: ['Labeled training data', 'Feature engineering', 'Model validation'],
      pros: ['High accuracy', 'Well-established', 'Interpretable results'],
      cons: ['Requires labeled data', 'Feature engineering needed', 'Overfitting risk'],
      references: ['Hastie, T., Tibshirani, R., & Friedman, J. (2009). The Elements of Statistical Learning', 'Bishop, C. M. (2006). Pattern Recognition and Machine Learning'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022', 'NIST AI Risk Management Framework'],
      icon: <Brain className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'ml-unsupervised',
      name: 'Unsupervised Learning',
      category: 'Machine Learning',
      description: 'Finding hidden patterns in data without labeled examples.',
      useCases: ['Clustering', 'Dimensionality Reduction', 'Anomaly Detection', 'Data Exploration'],
      complexity: 'Medium',
      accuracy: '70-85%',
      performance: 'Medium',
      cost: 'Low',
      requirements: ['Unlabeled data', 'Domain expertise', 'Validation methods'],
      pros: ['No labels needed', 'Discovery of hidden patterns', 'Data exploration'],
      cons: ['Lower accuracy', 'Harder to validate', 'Less interpretable'],
      references: ['Jain, A. K. (2010). Data clustering: 50 years beyond K-means', 'Van der Maaten, L., & Hinton, G. (2008). Visualizing data using t-SNE'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022'],
      icon: <Network className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'deep-learning',
      name: 'Deep Learning',
      category: 'Neural Networks',
      description: 'Multi-layer neural networks that can learn complex patterns in data.',
      useCases: ['Image Recognition', 'Natural Language Processing', 'Speech Recognition', 'Computer Vision'],
      complexity: 'High',
      accuracy: '90-98%',
      performance: 'High',
      cost: 'High',
      requirements: ['Large datasets', 'GPU computing', 'Expert knowledge', 'Long training times'],
      pros: ['State-of-the-art accuracy', 'Automatic feature learning', 'Versatile applications'],
      cons: ['High computational cost', 'Black box models', 'Requires large data'],
      references: ['LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning', 'Goodfellow, I., et al. (2016). Deep Learning'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022', 'EU AI Act Compliance'],
      icon: <Layers3 className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'nlp-transformers',
      name: 'Transformer Models',
      category: 'Natural Language Processing',
      description: 'Attention-based neural networks for understanding and generating human language.',
      useCases: ['Text Generation', 'Language Translation', 'Question Answering', 'Summarization'],
      complexity: 'High',
      accuracy: '90-98%',
      performance: 'High',
      cost: 'Very High',
      requirements: ['Massive datasets', 'Extensive computing', 'Specialized hardware'],
      pros: ['Exceptional language understanding', 'Transfer learning', 'State-of-the-art results'],
      cons: ['Extremely expensive', 'Environmental impact', 'Complex deployment'],
      references: ['Vaswani, A., et al. (2017). Attention is all you need', 'Brown, T., et al. (2020). Language models are few-shot learners'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022', 'EU AI Act Compliance', 'GDPR Compliance'],
      icon: <Sparkles className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'computer-vision',
      name: 'Computer Vision',
      category: 'Image Processing',
      description: 'AI techniques for interpreting and understanding visual information.',
      useCases: ['Object Detection', 'Image Classification', 'Facial Recognition', 'Medical Imaging'],
      complexity: 'High',
      accuracy: '85-98%',
      performance: 'High',
      cost: 'High',
      requirements: ['Image datasets', 'GPU computing', 'Domain expertise'],
      pros: ['High accuracy', 'Real-time processing', 'Wide applications'],
      cons: ['Computational intensive', 'Privacy concerns', 'Bias in training data'],
      references: ['Redmon, J., et al. (2016). You only look once', 'He, K., et al. (2016). Deep residual learning for image recognition'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022', 'EU AI Act Compliance'],
      icon: <Eye className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'reinforcement-learning',
      name: 'Reinforcement Learning',
      category: 'Learning Algorithms',
      description: 'Learning through interaction with environment using rewards and penalties.',
      useCases: ['Game Playing', 'Robotics', 'Autonomous Systems', 'Resource Optimization'],
      complexity: 'Very High',
      accuracy: 'Variable',
      performance: 'High',
      cost: 'Very High',
      requirements: ['Environment simulation', 'Reward design', 'Extensive training'],
      pros: ['Adaptive behavior', 'No labeled data needed', 'Continuous learning'],
      cons: ['Very complex', 'Unpredictable results', 'High computational cost'],
      references: ['Sutton, R. S., & Barto, A. G. (2018). Reinforcement learning', 'Mnih, V., et al. (2015). Human-level control through deep reinforcement learning'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022'],
      icon: <Target className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'ensemble-methods',
      name: 'Ensemble Methods',
      category: 'Machine Learning',
      description: 'Combining multiple models to improve prediction accuracy and robustness.',
      useCases: ['Predictive Analytics', 'Risk Assessment', 'Quality Control', 'Financial Modeling'],
      complexity: 'Medium',
      accuracy: '90-95%',
      performance: 'High',
      cost: 'Medium',
      requirements: ['Multiple models', 'Diverse algorithms', 'Validation strategies'],
      pros: ['Higher accuracy', 'Reduced overfitting', 'Robust predictions'],
      cons: ['Increased complexity', 'Higher computational cost', 'Model interpretation'],
      references: ['Breiman, L. (2001). Random forests', 'Freund, Y., & Schapire, R. E. (1997). A decision-theoretic generalization'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022'],
      icon: <GitBranch className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    },
    {
      id: 'time-series',
      name: 'Time Series Analysis',
      category: 'Statistical Methods',
      description: 'Analyzing temporal data to identify patterns and make future predictions.',
      useCases: ['Forecasting', 'Trend Analysis', 'Anomaly Detection', 'Financial Modeling'],
      complexity: 'Medium',
      accuracy: '80-90%',
      performance: 'Medium',
      cost: 'Low',
      requirements: ['Historical data', 'Statistical knowledge', 'Domain expertise'],
      pros: ['Temporal understanding', 'Interpretable', 'Wide applicability'],
      cons: ['Stationarity assumptions', 'Limited to temporal data', 'Seasonality effects'],
      references: ['Box, G. E. P., et al. (2015). Time series analysis', 'Hyndman, R. J., & Athanasopoulos, G. (2018). Forecasting: principles and practice'],
      standards: ['IEEE 1855-2016', 'ISO/IEC 23053:2022'],
      icon: <TrendingUp className="w-6 h-6" />,
      suitability: 0,
      confidence: 0
    }
  ];

  const requirements = [
    'High Accuracy Required',
    'Real-time Processing',
    'Low Computational Cost',
    'Interpretable Results',
    'Scalable Solution',
    'Privacy Compliance',
    'Robust Performance',
    'Easy Deployment',
    'Minimal Training Data',
    'Cross-platform Support'
  ];

  const constraints = [
    'Budget Limitations',
    'Time Constraints',
    'Hardware Limitations',
    'Data Privacy Requirements',
    'Regulatory Compliance',
    'Performance Requirements',
    'Integration Complexity',
    'Maintenance Overhead',
    'Skill Requirements',
    'Environmental Impact'
  ];

  const domains = [
    'Healthcare & Medical',
    'Finance & Banking',
    'Manufacturing & Industry',
    'Retail & E-commerce',
    'Transportation & Logistics',
    'Education & Research',
    'Government & Public Sector',
    'Entertainment & Media',
    'Agriculture & Food',
    'Energy & Utilities'
  ];

  const startAssessment = () => {
    if (selectedRequirements.length === 0) {
      alert('Please select at least one requirement');
      return;
    }

    setIsAssessing(true);
    setCurrentStep(2);
    setAssessmentProgress(0);
    setCurrentProcess('Analyzing requirements and constraints...');

    // Simulate assessment process
    const assessmentInterval = setInterval(() => {
      setAssessmentProgress(prev => {
        if (prev >= 100) {
          clearInterval(assessmentInterval);
          completeAssessment();
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Update process messages
    const processMessages = [
      'Analyzing requirements and constraints...',
      'Evaluating AI techniques against criteria...',
      'Calculating suitability scores...',
      'Generating recommendations...',
      'Preparing detailed analysis...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < processMessages.length - 1) {
        messageIndex++;
        setCurrentProcess(processMessages[messageIndex]);
      }
    }, 400);
  };

  const completeAssessment = () => {
    // Simulate AI technique assessment
    const results: AssessmentResult[] = aiTechniques.map(technique => {
      let score = 0;
      let reasoning = '';
      const recommendations: string[] = [];
      const alternatives: AITechnique[] = [];

      // Calculate suitability based on requirements
      selectedRequirements.forEach(req => {
        switch (req) {
          case 'High Accuracy Required':
            if (technique.accuracy.includes('90') || technique.accuracy.includes('95') || technique.accuracy.includes('98')) {
              score += 20;
            }
            break;
          case 'Real-time Processing':
            if (technique.performance === 'High') {
              score += 15;
            }
            break;
          case 'Low Computational Cost':
            if (technique.cost === 'Low' || technique.cost === 'Medium') {
              score += 15;
            }
            break;
          case 'Interpretable Results':
            if (technique.pros.includes('Interpretable') || technique.pros.includes('Well-established')) {
              score += 15;
            }
            break;
          case 'Scalable Solution':
            if (technique.performance === 'High') {
              score += 10;
            }
            break;
          case 'Privacy Compliance':
            if (technique.standards.includes('GDPR Compliance') || technique.standards.includes('EU AI Act Compliance')) {
              score += 15;
            }
            break;
          case 'Robust Performance':
            if (technique.performance === 'High') {
              score += 10;
            }
            break;
        }
      });

      // Generate reasoning
      if (score >= 80) {
        reasoning = `Excellent match for your requirements. ${technique.name} provides ${technique.accuracy} accuracy with ${technique.performance} performance, making it ideal for your use case.`;
        recommendations.push('Proceed with implementation');
        recommendations.push('Consider pilot testing first');
        recommendations.push('Plan for proper validation');
      } else if (score >= 60) {
        reasoning = `Good match with some considerations. ${technique.name} offers ${technique.accuracy} accuracy but may require additional optimization for your specific needs.`;
        recommendations.push('Evaluate feasibility');
        recommendations.push('Consider hybrid approaches');
        recommendations.push('Plan for customization');
      } else {
        reasoning = `Limited suitability. ${technique.name} may not be the best choice given your requirements, but could work as part of a larger solution.`;
        recommendations.push('Consider alternatives');
        recommendations.push('Evaluate as secondary option');
        recommendations.push('Assess integration possibilities');
      }

      // Add domain-specific recommendations
      if (selectedDomain) {
        switch (selectedDomain) {
          case 'Healthcare & Medical':
            if (technique.standards.includes('EU AI Act Compliance')) {
              recommendations.push('Ensure medical device compliance');
              recommendations.push('Plan for clinical validation');
            }
            break;
          case 'Finance & Banking':
            if (technique.standards.includes('GDPR Compliance')) {
              recommendations.push('Implement financial regulations compliance');
              recommendations.push('Plan for audit trails');
            }
            break;
        }
      }

      // Find alternatives
      const alternativesList = aiTechniques
        .filter(t => t.id !== technique.id && t.category === technique.category)
        .slice(0, 2);

      return {
        technique,
        score: Math.min(score, 100),
        reasoning,
        recommendations,
        alternatives: alternativesList
      };
    });

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    setAssessmentResults(results);
    setIsAssessing(false);
    setCurrentStep(3);
  };

  const resetAssessment = () => {
    setCurrentStep(1);
    setSelectedRequirements([]);
    setSelectedConstraints([]);
    setSelectedDomain('');
    setAssessmentResults([]);
    setAssessmentProgress(0);
    setCurrentProcess('');
  };

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      requirements: selectedRequirements,
      constraints: selectedConstraints,
      domain: selectedDomain,
      results: assessmentResults.map(result => ({
        technique: result.technique.name,
        score: result.score,
        reasoning: result.reasoning,
        recommendations: result.recommendations
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-technique-assessment-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">AI Technique Assessment</h1>
                <p className="text-text-secondary mt-1">Professional AI technique evaluation and recommendation system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-surface text-text-primary border-border hover:bg-surface-elevated transition-colors">
                <Shield className="w-4 h-4 mr-2" />
                GDPR Compliant
              </Badge>
              <Badge variant="secondary" className="bg-surface text-text-primary border-border hover:bg-surface-elevated transition-colors">
                <Award className="w-4 h-4 mr-2" />
                Industry Standard
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
                  {step === 1 ? 'Requirements' : step === 2 ? 'Assessment' : 'Results'}
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

        {/* Step 1: Requirements Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-text-primary">
                <Target className="w-6 h-6 mr-3 text-primary" />
                Define Your Requirements
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-text-primary">
                    <CheckSquare className="w-5 h-5 mr-2 text-primary" />
                    Requirements
                  </h3>
                  <div className="space-y-3">
                    {requirements.map((req) => (
                      <label key={req} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRequirements.includes(req)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRequirements([...selectedRequirements, req]);
                            } else {
                              setSelectedRequirements(selectedRequirements.filter(r => r !== req));
                            }
                          }}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">{req}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-text-primary">
                    <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                    Constraints
                  </h3>
                  <div className="space-y-3">
                    {constraints.map((constraint) => (
                      <label key={constraint} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedConstraints.includes(constraint)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedConstraints([...selectedConstraints, constraint]);
                            } else {
                              setSelectedConstraints(selectedConstraints.filter(c => c !== constraint));
                            }
                          }}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">{constraint}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Domain */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-text-primary">
                    <Building className="w-5 h-5 mr-2 text-primary" />
                    Domain
                  </h3>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    className="w-full p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:bg-surface-elevated transition-colors"
                  >
                    <option value="">Select Domain</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={startAssessment}
                  disabled={selectedRequirements.length === 0}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Assessment Progress */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-text-primary">
                <Activity className="w-6 h-6 mr-3 text-primary" />
                AI Technique Assessment in Progress
              </h2>
              
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="w-full h-full rounded-full border-8 border-background-secondary"></div>
                  <div 
                    className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-primary border-t-transparent"
                    style={{
                      transform: `rotate(${assessmentProgress * 3.6}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{assessmentProgress}%</span>
                  </div>
                </div>
                
                <p className="text-lg text-text-secondary mb-4">{currentProcess}</p>
                
                <div className="w-full bg-background-secondary rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${assessmentProgress}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center text-text-primary">
                <BarChart className="w-6 h-6 mr-3 text-primary" />
                Assessment Results
              </h2>
              <div className="flex space-x-4">
                <Button
                  onClick={exportResults}
                  variant="outline"
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
                <Button
                  onClick={resetAssessment}
                  variant="outline"
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </div>
            </div>

            {/* Top Recommendations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-text-primary">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Top Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessmentResults.slice(0, 3).map((result, index) => (
                  <div key={result.technique.id} className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow bg-background-primary">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {result.technique.icon}
                        <div>
                          <h4 className="font-semibold text-text-primary">{result.technique.name}</h4>
                          <p className="text-sm text-text-secondary">{result.technique.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </span>
                        <span className="text-sm text-text-muted">/100</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-background-secondary rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${getScoreBgColor(result.score)}`}
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-3">{result.reasoning}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {result.technique.accuracy} accuracy
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {result.technique.performance} performance
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Detailed Results */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center text-text-primary">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Detailed Analysis
              </h3>
              
              <div className="space-y-6">
                {assessmentResults.map((result, index) => (
                  <div key={result.technique.id} className="border border-border rounded-lg p-6 bg-background-primary">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {result.technique.icon}
                        <div>
                          <h4 className="text-lg font-semibold text-text-primary">{result.technique.name}</h4>
                          <p className="text-text-secondary">{result.technique.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </div>
                        <div className="text-sm text-text-muted">Suitability Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold mb-2 flex items-center text-text-primary">
                          <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                          Reasoning
                        </h5>
                        <p className="text-sm text-text-secondary mb-4">{result.reasoning}</p>
                        
                        <h5 className="font-semibold mb-2 flex items-center text-text-primary">
                          <Target className="w-4 h-4 mr-2 text-primary" />
                          Recommendations
                        </h5>
                        <ul className="text-sm text-text-secondary space-y-1">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold mb-2 flex items-center text-text-primary">
                          <Activity className="w-4 h-4 mr-2 text-primary" />
                          Technical Details
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Accuracy:</span>
                            <span className="font-medium text-text-primary">{result.technique.accuracy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Performance:</span>
                            <span className="font-medium text-text-primary">{result.technique.performance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Cost:</span>
                            <span className="font-medium text-text-primary">{result.technique.cost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Complexity:</span>
                            <span className="font-medium text-text-primary">{result.technique.complexity}</span>
                          </div>
                        </div>
                        
                        <h5 className="font-semibold mb-2 mt-4 flex items-center text-text-primary">
                          <BookOpen className="w-4 h-4 mr-2 text-primary" />
                          References
                        </h5>
                        <ul className="text-xs text-text-secondary space-y-1">
                          {result.technique.references.slice(0, 2).map((ref, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              {ref}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalAITechniqueAssessmentService;
