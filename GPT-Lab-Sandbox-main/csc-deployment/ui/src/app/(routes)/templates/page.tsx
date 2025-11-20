'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Search, 
  Filter, 
  Play, 
  Settings, 
  Users, 
  Clock, 
  HardDrive,
  Cpu,
  Zap,
  ExternalLink,
  GitBranch,
  Calendar,
  BarChart3,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Shield,
  Database,
  Globe,
  Server,
  FlaskConical,
  BookOpen,
  Code,
  Brain,
  Lock,
  GraduationCap,
  Repeat
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  targetAudience: string[];
  keyFeatures: string[];
  dataAccess: string;
  collaboration: string;
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
    storage: string;
  };
}

const mockTemplates: Template[] = [
  {
    id: 'software-quality-ai',
    name: 'AI-Powered Software Quality Analysis',
    description: 'Analyze code quality, detect vulnerabilities, and predict technical debt using AI. Perfect for research teams studying software engineering practices.',
    category: 'Software Engineering Research',
    difficulty: 'Intermediate',
    estimatedTime: '3-5 minutes',
    targetAudience: ['Research Teams', 'PhD Students', 'Quality Engineers'],
    keyFeatures: ['Code Analysis Pipeline', 'Vulnerability Detection', 'Technical Debt Prediction', 'Research Data Export'],
    dataAccess: 'Access to 10K+ open-source projects, vulnerability databases, and quality metrics',
    collaboration: 'Shared research workspace with version control and experiment tracking',
    resources: { cpu: '2', memory: '4Gi', storage: '20GB' }
  },
  {
    id: 'mlops-collaboration',
    name: 'MLOps Collaboration Platform',
    description: 'Complete MLOps environment for joint academic-industry research. Includes experiment tracking, model versioning, and deployment pipelines.',
    category: 'MLOps & Collaboration',
    difficulty: 'Advanced',
    estimatedTime: '5-7 minutes',
    targetAudience: ['Research Teams', 'Industry Partners', 'ML Engineers'],
    keyFeatures: ['MLflow Integration', 'Model Registry', 'A/B Testing Framework', 'Collaborative Notebooks'],
    dataAccess: 'Shared datasets, pre-trained models, and industry benchmarks',
    collaboration: 'Multi-tenant workspace with role-based access and project sharing',
    resources: { cpu: '4', memory: '8Gi', gpu: '1', storage: '50GB' }
  },
  {
    id: 'secure-software-ai',
    name: 'Secure Software Development AI',
    description: 'Research environment for AI-assisted secure coding, vulnerability research, and security testing automation.',
    category: 'Security Research',
    difficulty: 'Advanced',
    estimatedTime: '4-6 minutes',
    targetAudience: ['Security Researchers', 'PhD Students', 'Security Engineers'],
    keyFeatures: ['Static Analysis Tools', 'Dynamic Testing Framework', 'Threat Modeling', 'Security Metrics Dashboard'],
    dataAccess: 'Security datasets, vulnerability reports, and threat intelligence feeds',
    collaboration: 'Isolated research environments with secure data sharing capabilities',
    resources: { cpu: '2', memory: '6Gi', storage: '30GB' }
  },
  {
    id: 'industry-benchmark',
    name: 'Industry Benchmark & Validation',
    description: 'Validate research findings against industry standards. Compare academic approaches with production systems.',
    category: 'Industry Validation',
    difficulty: 'Intermediate',
    estimatedTime: '3-4 minutes',
    targetAudience: ['Research Teams', 'Industry Partners', 'Validation Studies'],
    keyFeatures: ['Benchmark Suites', 'Performance Metrics', 'Industry Comparisons', 'Report Generation'],
    dataAccess: 'Industry benchmark datasets, performance baselines, and comparison frameworks',
    collaboration: 'Shared validation workspace with industry partner access',
    resources: { cpu: '2', memory: '4Gi', storage: '25GB' }
  },
  {
    id: 'student-thesis',
    name: 'Student Thesis & Research Platform',
    description: 'Complete research environment for thesis work, student projects, and academic research with industry relevance.',
    category: 'Academic Research',
    difficulty: 'Beginner',
    estimatedTime: '2-3 minutes',
    targetAudience: ['Students', 'Researchers', 'Academic Teams'],
    keyFeatures: ['Research Templates', 'Data Management', 'Collaboration Tools', 'Publication Support'],
    dataAccess: 'Academic datasets, research papers, and industry case studies',
    collaboration: 'Student workspace with supervisor access and peer collaboration',
    resources: { cpu: '1', memory: '2Gi', storage: '15GB' }
  },
  {
    id: 'replication-package',
    name: 'Research Replication Package',
    description: 'Create and share reproducible research environments. Perfect for publishing research with full reproducibility.',
    category: 'Research Reproducibility',
    difficulty: 'Intermediate',
    estimatedTime: '3-4 minutes',
    targetAudience: ['Researchers', 'Reviewers', 'Academic Community'],
    keyFeatures: ['Environment Snapshot', 'Dependency Management', 'Reproducibility Checks', 'Sharing Tools'],
    dataAccess: 'Research datasets, code repositories, and environment specifications',
    collaboration: 'Public sharing with citation tracking and community feedback',
    resources: { cpu: '1', memory: '3Gi', storage: '20GB' }
  }
];

const difficultyConfig = {
  Beginner: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: GraduationCap },
  Intermediate: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Target },
  Advanced: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: Brain }
};

const categoryIcons = {
  'Software Engineering Research': Code,
  'MLOps & Collaboration': Server,
  'Security Research': Shield,
  'Industry Validation': TrendingUp,
  'Academic Research': BookOpen,
  'Research Reproducibility': Repeat
};

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [launching, setLaunching] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🚀 Templates page loaded!');
    console.log('📋 Templates:', templates);
  }, [templates]);

  const handleLaunch = async (template: Template) => {
    console.log('🚀 Launching template:', template.name);
    setLaunching(template.id);
    setResult('🚀 Launching template...');
    
    try {
      console.log('📡 Making API call to /api/templates/launch...');
      const response = await fetch('/api/templates/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          projectName: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        })
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📋 Template launch response:', data);
      
      if (data.success) {
        setResult(`🎉 SUCCESS! Template launched!\n\nDeployment ID: ${data.data.deploymentId}\nNamespace: ${data.data.namespace}\nStatus: ${data.data.status}\n\nYour research environment will be ready in ${data.data.estimatedReadyTime}`);
      } else {
        setResult(`❌ ERROR: ${data.error}`);
      }
    } catch (error) {
      console.error('Template launch error:', error);
      setResult(`❌ ERROR: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'}`);
    } finally {
      setLaunching(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return matchesSearch && categoryMatch && difficultyMatch;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const difficulties = ['all', ...Array.from(new Set(templates.map(t => t.difficulty)))];

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Globe;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Research Templates</h1>
          <p className="text-text-secondary">Launch pre-configured AI research environments for software engineering innovation</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-surface border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-surface border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff === 'all' ? 'All Levels' : diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-64"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="w-4 h-4 space-y-1">
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const difficultyInfo = difficultyConfig[template.difficulty as keyof typeof difficultyConfig];
          const DifficultyIcon = difficultyInfo?.icon || Target;
          
          return (
            <Card key={template.id} className={`p-6 transition-all duration-300 hover:shadow-glow ${difficultyInfo?.border}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DifficultyIcon className={`w-4 h-4 ${difficultyInfo?.color}`} />
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyInfo?.bg} ${difficultyInfo?.color}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">{template.name}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{template.description}</p>
                </div>
                <button className="p-2 hover:bg-surface/50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              {/* Category and Time */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <span className="text-text-primary font-medium">{template.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">{template.estimatedTime}</span>
                </div>
              </div>

              {/* Resources */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Cpu className="w-4 h-4 text-text-muted" />
                  <span className="text-text-secondary">{template.resources.cpu} CPU</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-text-muted" />
                  <span className="text-text-secondary">{template.resources.memory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="w-4 h-4 text-text-muted" />
                  <span className="text-text-secondary">{template.resources.storage}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-text-muted" />
                  <span className="text-text-secondary">{template.resources.gpu || '0'} GPU</span>
                </div>
              </div>

              {/* Target Audience */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.targetAudience.slice(0, 3).map((audience, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20"
                  >
                    {audience}
                  </span>
                ))}
                {template.targetAudience.length > 3 && (
                  <span className="px-2 py-1 bg-surface text-text-muted text-xs rounded-md border border-border">
                    +{template.targetAudience.length - 3} more
                  </span>
                )}
              </div>

              {/* Key Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Key Features</h4>
                <ul className="text-xs text-text-secondary space-y-1">
                  {template.keyFeatures.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                  {template.keyFeatures.length > 3 && (
                    <li className="text-text-muted">+{template.keyFeatures.length - 3} more features</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <div className="flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    <span>Data Access</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Collaboration</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => handleLaunch(template)}
                    disabled={launching === template.id}
                  >
                    {launching === template.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                        Launching...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Launch
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No templates found</h3>
          <p className="text-text-secondary mb-4">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h3 className="font-bold text-lg mb-3 text-blue-900">🚀 Launch Result:</h3>
          <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded-lg border">{result}</pre>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{templates.length}</div>
          <div className="text-text-secondary text-sm">Total Templates</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {templates.filter(t => t.difficulty === 'Beginner').length}
          </div>
          <div className="text-text-secondary text-sm">Beginner Templates</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {templates.filter(t => t.difficulty === 'Intermediate').length}
          </div>
          <div className="text-text-secondary text-sm">Intermediate Templates</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {templates.filter(t => t.difficulty === 'Advanced').length}
          </div>
          <div className="text-text-secondary text-sm">Advanced Templates</div>
        </Card>
      </div>
    </div>
  );
}

export default TemplatesPage;