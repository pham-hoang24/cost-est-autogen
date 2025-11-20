'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  Users, 
  Calendar, 
  Zap,
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  BarChart3,
  Download,
  PieChart,
  AlertTriangle,
  Target,
  Clock,
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

interface CostEstimationServiceProps {
  service: any;
}

export default function CostEstimationService({ service }: CostEstimationServiceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectType, setProjectType] = useState<string>('');
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    description: '',
    complexity: '',
    duration: '',
    teamSize: '',
    technology: '',
    region: ''
  });
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [estimation, setEstimation] = useState<any>(null);

  const projectTypes = [
    {
      id: 'web-app',
      name: 'Web Application',
      description: 'Full-stack web development project',
      icon: '🌐',
      baseComplexity: 'Medium',
      typicalDuration: '3-6 months',
      avgCost: '€25,000 - €75,000'
    },
    {
      id: 'mobile-app',
      name: 'Mobile Application',
      description: 'iOS/Android native or cross-platform app',
      icon: '📱',
      baseComplexity: 'Medium-High',
      typicalDuration: '4-8 months',
      avgCost: '€30,000 - €100,000'
    },
    {
      id: 'ai-ml',
      name: 'AI/ML Project',
      description: 'Machine learning model development and deployment',
      icon: '🧠',
      baseComplexity: 'High',
      typicalDuration: '6-12 months',
      avgCost: '€50,000 - €200,000'
    },
    {
      id: 'enterprise',
      name: 'Enterprise System',
      description: 'Large-scale enterprise software solution',
      icon: '🏢',
      baseComplexity: 'Very High',
      typicalDuration: '12-24 months',
      avgCost: '€100,000 - €500,000'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Platform',
      description: 'Online store with payment and inventory management',
      icon: '🛒',
      baseComplexity: 'Medium-High',
      typicalDuration: '4-8 months',
      avgCost: '€35,000 - €120,000'
    },
    {
      id: 'saas',
      name: 'SaaS Platform',
      description: 'Multi-tenant software-as-a-service platform',
      icon: '☁️',
      baseComplexity: 'High',
      typicalDuration: '8-15 months',
      avgCost: '€75,000 - €300,000'
    }
  ];

  const complexityLevels = [
    { id: 'simple', name: 'Simple', multiplier: 0.7, description: 'Basic functionality, standard features' },
    { id: 'medium', name: 'Medium', multiplier: 1.0, description: 'Moderate complexity, some custom features' },
    { id: 'complex', name: 'Complex', multiplier: 1.5, description: 'Advanced features, custom integrations' },
    { id: 'very-complex', name: 'Very Complex', multiplier: 2.2, description: 'Cutting-edge tech, high customization' }
  ];

  const technologies = [
    { id: 'react-node', name: 'React + Node.js', costMultiplier: 1.0 },
    { id: 'vue-laravel', name: 'Vue.js + Laravel', costMultiplier: 1.1 },
    { id: 'angular-dotnet', name: 'Angular + .NET', costMultiplier: 1.2 },
    { id: 'react-native', name: 'React Native', costMultiplier: 1.1 },
    { id: 'flutter', name: 'Flutter', costMultiplier: 1.0 },
    { id: 'python-django', name: 'Python + Django', costMultiplier: 1.1 },
    { id: 'ai-tensorflow', name: 'AI/ML (TensorFlow)', costMultiplier: 1.8 },
    { id: 'blockchain', name: 'Blockchain', costMultiplier: 2.0 }
  ];

  const regions = [
    { id: 'western-europe', name: 'Western Europe', hourlyRate: 75 },
    { id: 'eastern-europe', name: 'Eastern Europe', hourlyRate: 45 },
    { id: 'north-america', name: 'North America', hourlyRate: 85 },
    { id: 'asia-pacific', name: 'Asia Pacific', hourlyRate: 35 },
    { id: 'latin-america', name: 'Latin America', hourlyRate: 40 }
  ];

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep(3);

    // Simulate AI-powered cost analysis
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Generate comprehensive cost estimation
          const costEstimation = generateCostEstimation();
          setEstimation(costEstimation);
          setIsAnalyzing(false);
          setCurrentStep(4);
          return 100;
        }
        return newProgress;
      });
    }, 250);
  };

  const generateCostEstimation = () => {
    const selectedType = projectTypes.find(t => t.id === projectType);
    const complexity = complexityLevels.find(c => c.id === projectDetails.complexity);
    const tech = technologies.find(t => t.id === projectDetails.technology);
    const region = regions.find(r => r.id === projectDetails.region);

    // Base cost calculation
    const baseHours = {
      'web-app': 800,
      'mobile-app': 1000,
      'ai-ml': 1500,
      'enterprise': 3000,
      'ecommerce': 1200,
      'saas': 2000
    }[projectType] || 1000;

    const totalHours = Math.round(
      baseHours * 
      (complexity?.multiplier || 1.0) * 
      (tech?.costMultiplier || 1.0) * 
      (1 + requirements.length * 0.1) // Each requirement adds 10%
    );

    const hourlyRate = region?.hourlyRate || 75;
    const totalCost = totalHours * hourlyRate;

    // Generate timeline
    const baseWeeks = Math.round(totalHours / (parseInt(projectDetails.teamSize) || 3) / 40);
    const timeline = [
      { phase: 'Planning & Design', weeks: Math.round(baseWeeks * 0.2), cost: Math.round(totalCost * 0.2) },
      { phase: 'Development', weeks: Math.round(baseWeeks * 0.6), cost: Math.round(totalCost * 0.6) },
      { phase: 'Testing & QA', weeks: Math.round(baseWeeks * 0.15), cost: Math.round(totalCost * 0.15) },
      { phase: 'Deployment & Support', weeks: Math.round(baseWeeks * 0.05), cost: Math.round(totalCost * 0.05) }
    ];

    // Cost breakdown
    const costBreakdown = [
      { name: 'Development', value: Math.round(totalCost * 0.65), color: '#3B82F6' },
      { name: 'Design & UX', value: Math.round(totalCost * 0.15), color: '#8B5CF6' },
      { name: 'Testing & QA', value: Math.round(totalCost * 0.12), color: '#10B981' },
      { name: 'Project Management', value: Math.round(totalCost * 0.08), color: '#F59E0B' }
    ];

    // Risk factors
    const riskFactors = [
      { 
        factor: 'Technical Complexity', 
        level: complexity?.id === 'very-complex' ? 'High' : complexity?.id === 'complex' ? 'Medium' : 'Low',
        impact: complexity?.id === 'very-complex' ? '+25%' : complexity?.id === 'complex' ? '+15%' : '+5%'
      },
      { 
        factor: 'Team Experience', 
        level: 'Medium', 
        impact: '+10%' 
      },
      { 
        factor: 'Requirements Clarity', 
        level: requirements.length > 10 ? 'High' : requirements.length > 5 ? 'Medium' : 'Low',
        impact: requirements.length > 10 ? '+5%' : requirements.length > 5 ? '+10%' : '+15%'
      }
    ];

    // Monthly cost projection
    const monthlyCosts = [];
    let cumulativeCost = 0;
    for (let i = 0; i < Math.min(12, Math.ceil(baseWeeks / 4)); i++) {
      const monthCost = totalCost / Math.ceil(baseWeeks / 4);
      cumulativeCost += monthCost;
      monthlyCosts.push({
        month: `Month ${i + 1}`,
        cost: Math.round(monthCost),
        cumulative: Math.round(cumulativeCost)
      });
    }

    return {
      projectInfo: {
        name: projectDetails.name,
        type: selectedType?.name,
        complexity: complexity?.name,
        technology: tech?.name,
        region: region?.name,
        teamSize: projectDetails.teamSize,
        requirements: requirements.length
      },
      costs: {
        totalCost,
        totalHours,
        hourlyRate,
        costRange: {
          min: Math.round(totalCost * 0.8),
          max: Math.round(totalCost * 1.3)
        }
      },
      timeline: {
        totalWeeks: baseWeeks,
        phases: timeline
      },
      breakdown: costBreakdown,
      riskFactors,
      monthlyCosts,
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      recommendations: [
        'Consider starting with an MVP to reduce initial costs by 40%',
        'Implement CI/CD pipeline early to reduce testing costs',
        'Use proven technologies to minimize development risks',
        'Plan for 20% buffer in timeline and budget for unexpected changes'
      ]
    };
  };

  const resetEstimation = () => {
    setCurrentStep(1);
    setProjectType('');
    setProjectDetails({
      name: '',
      description: '',
      complexity: '',
      duration: '',
      teamSize: '',
      technology: '',
      region: ''
    });
    setRequirements([]);
    setNewRequirement('');
    setEstimation(null);
    setAnalysisProgress(0);
  };

  const exportEstimation = (format: string) => {
    alert(`Exporting cost estimation in ${format} format...`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 1: Select Project Type</h3>
            <p className="text-slate-400 mb-6">Choose the type of project you want to estimate costs for.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`p-4 cursor-pointer transition-all ${
                    projectType === type.id 
                      ? 'border-2 border-green-500 bg-green-500/10' 
                      : 'border-2 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setProjectType(type.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{type.name}</h4>
                      <Badge variant="secondary" className="text-xs">{type.baseComplexity}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{type.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="text-slate-300">{type.typicalDuration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Typical Cost:</span>
                      <span className="text-green-400 font-medium">{type.avgCost}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!projectType}
                className={`flex items-center gap-2 ${
                  projectType ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                Next: Project Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Step 2: Project Configuration</h3>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Name</label>
                  <Input
                    placeholder="Enter project name..."
                    value={projectDetails.name}
                    onChange={(e) => setProjectDetails({...projectDetails, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Team Size</label>
                  <Select value={projectDetails.teamSize} onValueChange={(value) => setProjectDetails({...projectDetails, teamSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 developers</SelectItem>
                      <SelectItem value="3-5">3-5 developers</SelectItem>
                      <SelectItem value="6-10">6-10 developers</SelectItem>
                      <SelectItem value="10+">10+ developers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Project Description</label>
                <Textarea
                  placeholder="Describe your project requirements and goals..."
                  value={projectDetails.description}
                  onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Complexity Level</label>
                  <Select value={projectDetails.complexity} onValueChange={(value) => setProjectDetails({...projectDetails, complexity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      {complexityLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name} - {level.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Technology Stack</label>
                  <Select value={projectDetails.technology} onValueChange={(value) => setProjectDetails({...projectDetails, technology: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technology" />
                    </SelectTrigger>
                    <SelectContent>
                      {technologies.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Development Region</label>
                  <Select value={projectDetails.region} onValueChange={(value) => setProjectDetails({...projectDetails, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name} (€{region.hourlyRate}/hr)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Specific Requirements</label>
                <Card className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add specific requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addRequirement} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {requirements.map((req, index) => (
                        <button 
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-600 rounded-full cursor-pointer hover:bg-red-500/20 text-gray-300"
                          onClick={() => removeRequirement(req)}
                        >
                          {req}
                          <span className="ml-1 text-red-400">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Each requirement adds approximately 10% to the base cost
                  </p>
                </Card>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={startAnalysis}
                disabled={!projectDetails.name || !projectDetails.complexity || !projectDetails.technology || !projectDetails.region}
                className={`flex items-center gap-2 ${
                  projectDetails.name && projectDetails.complexity && projectDetails.technology && projectDetails.region
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Generate AI Cost Estimation
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Analyzing Project Costs...</h3>
            <p className="text-slate-400 mb-6">
              Our AI is analyzing your project requirements and generating a comprehensive cost estimation
            </p>
            
            <div className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Analysis Progress</span>
                <span className="text-white">{analysisProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Current Task</div>
                <div className="text-white font-medium">
                  {analysisProgress < 25 ? 'Requirements Analysis' :
                   analysisProgress < 50 ? 'Cost Calculation' :
                   analysisProgress < 75 ? 'Risk Assessment' : 'Generating Report'}
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Accuracy</div>
                <div className="text-green-400 font-medium">{Math.min(95, analysisProgress * 0.95).toFixed(0)}%</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">Factors Analyzed</div>
                <div className="text-blue-400 font-medium">{Math.floor(analysisProgress / 8)}</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-slate-400">ETA</div>
                <div className="text-white font-medium">{Math.max(0, Math.ceil((100 - analysisProgress) * 0.2))}s</div>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Cost Summary */}
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{estimation?.projectInfo.name}</h3>
                  <p className="text-green-200">AI-Powered Cost Estimation Complete</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {estimation?.confidence}% Confidence
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-700/50 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">€{estimation?.costs.totalCost.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Total Cost</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{estimation?.timeline.totalWeeks}</div>
                  <div className="text-sm text-slate-400">Weeks</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{estimation?.costs.totalHours.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Total Hours</div>
                </Card>
                <Card className="p-4 bg-slate-700/50 text-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">€{estimation?.costs.hourlyRate}</div>
                  <div className="text-sm text-slate-400">Hourly Rate</div>
                </Card>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Cost Range: €{estimation?.costs.costRange.min.toLocaleString()} - €{estimation?.costs.costRange.max.toLocaleString()}</span>
                </div>
                <p className="text-yellow-300 text-sm mt-1">
                  Actual costs may vary ±20% based on changing requirements and unforeseen challenges.
                </p>
              </div>
            </Card>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h3>
                <div className="space-y-3">
                  {estimation?.breakdown.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">€{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Timeline Phases</h3>
                <div className="space-y-3">
                  {estimation?.timeline.phases.map((phase: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{phase.phase}</div>
                        <div className="text-slate-400 text-sm">{phase.weeks} weeks</div>
                      </div>
                      <div className="text-green-400 font-medium">€{phase.cost.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Monthly Cost Projection */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Monthly Cost Projection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={estimation?.monthlyCosts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="cost" stroke="#10B981" strokeWidth={2} name="Monthly Cost" />
                  <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={2} name="Cumulative Cost" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Risk Factors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {estimation?.riskFactors.map((risk: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-700 border-slate-600">
                    <h4 className="font-medium text-white mb-2">{risk.factor}</h4>
                    <div className="flex items-center justify-between">
                      <Badge variant={risk.level === 'High' ? 'red' : risk.level === 'Medium' ? 'yellow' : 'green'}>
                        {risk.level} Risk
                      </Badge>
                      <span className="text-slate-300 text-sm">{risk.impact}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {estimation?.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Export Options */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Export Estimation</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['PDF Report', 'Excel Spreadsheet', 'JSON Data', 'PowerPoint'].map((format) => (
                  <Button 
                    key={format}
                    onClick={() => exportEstimation(format)}
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
              <Button onClick={resetEstimation} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                New Estimation
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Create Proposal
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
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{service.name}</h2>
            <p className="text-green-200 text-lg">{service.description}</p>
          </div>
        </div>
        <p className="text-slate-300">
          Get accurate project cost estimations powered by AI analysis of your requirements, 
          technology stack, team size, and complexity. Perfect for project planning and budgeting.
        </p>
      </Card>

      {/* Progress Steps */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-green-500' : 'bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Project Type</span>
          <span>Configuration</span>
          <span>AI Analysis</span>
          <span>Results</span>
        </div>
      </Card>

      {/* Main Content */}
      {renderStep()}
    </div>
  );
}