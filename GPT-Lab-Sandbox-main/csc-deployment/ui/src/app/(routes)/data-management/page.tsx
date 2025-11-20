'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Database,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  BarChart3,
  Settings,
  Eye,
  Lock,
  Globe,
  Users,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  Server,
  Cloud,
  Archive,
  Link,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Info,
  HelpCircle,
  BookOpen,
  Target,
  Layers,
  Workflow,
  Cpu,
  HardDrive,
  Network,
  Key,
  UserCheck,
  FileCheck,
  AlertCircle,
  CheckSquare,
  XCircle,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Edit,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  domain: string;
  accessibility: 'open' | 'restricted' | 'sensitive';
  description: string;
  apiEndpoint?: string;
  accessRequirements?: string[];
  complianceLevel: 'basic' | 'enhanced' | 'strict';
  lastUpdated: Date;
  dataTypes: string[];
  useCases: string[];
  status: 'active' | 'maintenance' | 'deprecated';
  dataSize: string;
  updateFrequency: string;
  languages: string[];
  categories: string[];
  tags: string[];
  documentation?: string;
  license?: string;
  contact?: string;
  qualityScore: number;
  popularityScore: number;
  complianceScore: number;
}

interface ProcessingPipeline {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  steps: PipelineStep[];
  inputData: any[];
  outputData: any[];
  complianceChecks: ComplianceCheck[];
  qualityMetrics: QualityMetric[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionTime?: number;
  errorMessage?: string;
}

interface PipelineStep {
  id: string;
  name: string;
  type: 'data_ingestion' | 'data_cleaning' | 'data_transformation' | 'data_validation' | 'data_anonymization' | 'data_export';
  status: 'pending' | 'running' | 'completed' | 'error';
  inputSchema?: any;
  outputSchema?: any;
  parameters?: any;
  executionTime?: number;
  errorMessage?: string;
}

interface ComplianceCheck {
  id: string;
  name: string;
  type: 'privacy' | 'security' | 'quality' | 'regulatory';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  description: string;
  details?: string;
  timestamp: Date;
}

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface AIIntegration {
  id: string;
  dataSourceId: string;
  aiServiceId: string;
  modelType: string;
  trainingStatus: 'pending' | 'training' | 'completed' | 'failed';
  performanceMetrics: PerformanceMetric[];
  deploymentStatus: 'not_deployed' | 'deployed' | 'serving';
  createdAt: Date;
  updatedAt: Date;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export default function DataManagementPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'pipelines' | 'ai-integration' | 'compliance' | 'analytics'>('overview');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [pipelines, setPipelines] = useState<ProcessingPipeline[]>([]);
  const [aiIntegrations, setAiIntegrations] = useState<AIIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<ProcessingPipeline | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccessibility, setFilterAccessibility] = useState<string>('all');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  // Mock data for demonstration
  useEffect(() => {
    const mockDataSources: DataSource[] = [
      {
        id: 'avoindata-fi',
        name: 'Avoindata.fi',
        domain: 'Public Services',
        accessibility: 'open',
        description: 'Finland\'s Open Data Portal providing government and municipal datasets',
        apiEndpoint: 'https://www.avoindata.fi/api/3/action',
        complianceLevel: 'basic',
        lastUpdated: new Date('2024-01-15'),
        dataTypes: ['CSV', 'JSON', 'XML', 'PDF'],
        useCases: ['Public Service Innovation', 'Municipal Operations', 'Infrastructure Analysis'],
        status: 'active',
        dataSize: '2.5TB',
        updateFrequency: 'Daily',
        languages: ['Finnish', 'Swedish', 'English'],
        categories: ['Government', 'Municipal', 'Infrastructure'],
        tags: ['open-data', 'government', 'municipal', 'infrastructure'],
        documentation: 'https://www.avoindata.fi/fi/opendata/ohjeet',
        license: 'Creative Commons 4.0',
        contact: 'avoindata@vm.fi',
        qualityScore: 85,
        popularityScore: 92,
        complianceScore: 78
      },
      {
        id: 'statistics-finland',
        name: 'Statistics Finland',
        domain: 'Demographics',
        accessibility: 'open',
        description: 'Official statistics on population, economy, and social indicators',
        apiEndpoint: 'https://pxnet2.stat.fi/PXWeb/api/v1/en',
        complianceLevel: 'basic',
        lastUpdated: new Date('2024-01-20'),
        dataTypes: ['CSV', 'JSON', 'Excel'],
        useCases: ['Demographic Analysis', 'Economic Research', 'Social Indicators'],
        status: 'active',
        dataSize: '15.2TB',
        updateFrequency: 'Monthly',
        languages: ['Finnish', 'Swedish', 'English'],
        categories: ['Statistics', 'Demographics', 'Economy'],
        tags: ['statistics', 'demographics', 'economy', 'social'],
        documentation: 'https://www.stat.fi/tup/statfin/index_en.html',
        license: 'Creative Commons 4.0',
        contact: 'statistics@stat.fi',
        qualityScore: 95,
        popularityScore: 88,
        complianceScore: 92
      },
      {
        id: 'thl-sotkanet',
        name: 'THL Sotkanet',
        domain: 'Healthcare',
        accessibility: 'restricted',
        description: 'National health and welfare indicators from Finnish Institute for Health and Welfare',
        apiEndpoint: 'https://sotkanet.fi/api',
        accessRequirements: ['Research Agreement', 'Data Use Agreement'],
        complianceLevel: 'enhanced',
        lastUpdated: new Date('2024-01-18'),
        dataTypes: ['JSON', 'CSV', 'XML'],
        useCases: ['Health Research', 'Welfare Analysis', 'Public Health Monitoring'],
        status: 'active',
        dataSize: '8.7TB',
        updateFrequency: 'Weekly',
        languages: ['Finnish', 'English'],
        categories: ['Healthcare', 'Welfare', 'Public Health'],
        tags: ['health', 'welfare', 'indicators', 'research'],
        documentation: 'https://sotkanet.fi/en',
        license: 'Research Use License',
        contact: 'sotkanet@thl.fi',
        qualityScore: 90,
        popularityScore: 75,
        complianceScore: 88
      },
      {
        id: 'findata',
        name: 'Findata',
        domain: 'Healthcare',
        accessibility: 'sensitive',
        description: 'Controlled access to individual-level healthcare and social data',
        accessRequirements: ['Research Permit', 'Ethics Approval', 'Data Protection Impact Assessment'],
        complianceLevel: 'strict',
        lastUpdated: new Date('2024-01-22'),
        dataTypes: ['Secure Database', 'Encrypted Files'],
        useCases: ['Advanced Health Research', 'Individual-level Analysis', 'Longitudinal Studies'],
        status: 'active',
        dataSize: '45.3TB',
        updateFrequency: 'Real-time',
        languages: ['Finnish'],
        categories: ['Healthcare', 'Social Data', 'Individual Records'],
        tags: ['sensitive', 'healthcare', 'individual', 'longitudinal'],
        documentation: 'https://findata.fi/en',
        license: 'Permit-based Access',
        contact: 'info@findata.fi',
        qualityScore: 98,
        popularityScore: 45,
        complianceScore: 99
      },
      {
        id: 'fsd',
        name: 'Finnish Social Science Data Archive',
        domain: 'Social Research',
        accessibility: 'restricted',
        description: 'Curated datasets from surveys and social research studies',
        apiEndpoint: 'https://www.fsd.tuni.fi/api',
        accessRequirements: ['Research Agreement', 'Data Use Agreement'],
        complianceLevel: 'enhanced',
        lastUpdated: new Date('2024-01-16'),
        dataTypes: ['SPSS', 'Stata', 'R', 'CSV'],
        useCases: ['Social Research', 'Survey Analysis', 'Policy Research'],
        status: 'active',
        dataSize: '3.2TB',
        updateFrequency: 'Quarterly',
        languages: ['Finnish', 'English'],
        categories: ['Social Science', 'Surveys', 'Research Data'],
        tags: ['social', 'surveys', 'research', 'policy'],
        documentation: 'https://www.fsd.tuni.fi/en',
        license: 'Research Use License',
        contact: 'fsd@tuni.fi',
        qualityScore: 88,
        popularityScore: 82,
        complianceScore: 85
      },
      {
        id: 'eu-open-data',
        name: 'EU Open Data Portal',
        domain: 'Cross-domain',
        accessibility: 'open',
        description: 'European Union datasets across governance, economy, environment, and policy',
        apiEndpoint: 'https://data.europa.eu/api/hub/search',
        complianceLevel: 'basic',
        lastUpdated: new Date('2024-01-19'),
        dataTypes: ['CSV', 'JSON', 'XML', 'RDF'],
        useCases: ['Cross-border Analysis', 'Policy Research', 'Multilingual AI'],
        status: 'active',
        dataSize: '125.8TB',
        updateFrequency: 'Daily',
        languages: ['English', 'French', 'German', 'Spanish', 'Italian'],
        categories: ['EU Policy', 'Economy', 'Environment', 'Governance'],
        tags: ['european', 'policy', 'multilingual', 'cross-border'],
        documentation: 'https://data.europa.eu/en',
        license: 'Creative Commons 4.0',
        contact: 'opendata@ec.europa.eu',
        qualityScore: 82,
        popularityScore: 95,
        complianceScore: 80
      },
      {
        id: 'elixir-finland',
        name: 'ELIXIR Finland',
        domain: 'Life Sciences',
        accessibility: 'restricted',
        description: 'Biomedical datasets and bioinformatics resources for life sciences research',
        accessRequirements: ['Research Collaboration', 'Data Use Agreement'],
        complianceLevel: 'enhanced',
        lastUpdated: new Date('2024-01-21'),
        dataTypes: ['FASTA', 'VCF', 'BAM', 'JSON'],
        useCases: ['Biomedical Research', 'Genomics Analysis', 'Drug Discovery'],
        status: 'active',
        dataSize: '67.4TB',
        updateFrequency: 'Weekly',
        languages: ['English'],
        categories: ['Biomedical', 'Genomics', 'Bioinformatics'],
        tags: ['biomedical', 'genomics', 'bioinformatics', 'research'],
        documentation: 'https://www.elixir-finland.org',
        license: 'Research Collaboration License',
        contact: 'info@elixir-finland.org',
        qualityScore: 93,
        popularityScore: 68,
        complianceScore: 91
      }
    ];

    const mockPipelines: ProcessingPipeline[] = [
      {
        id: 'pipeline-1',
        name: 'Municipal Data Processing',
        description: 'Processes municipal service data for AI training',
        status: 'completed',
        steps: [
          {
            id: 'step-1',
            name: 'Data Ingestion',
            type: 'data_ingestion',
            status: 'completed',
            executionTime: 45
          },
          {
            id: 'step-2',
            name: 'Data Cleaning',
            type: 'data_cleaning',
            status: 'completed',
            executionTime: 120
          },
          {
            id: 'step-3',
            name: 'Data Anonymization',
            type: 'data_anonymization',
            status: 'completed',
            executionTime: 89
          }
        ],
        inputData: [],
        outputData: [],
        complianceChecks: [
          {
            id: 'check-1',
            name: 'GDPR Compliance',
            type: 'privacy',
            status: 'passed',
            description: 'Data anonymization meets GDPR requirements',
            timestamp: new Date()
          }
        ],
        qualityMetrics: [
          {
            id: 'metric-1',
            name: 'Data Quality Score',
            value: 92,
            unit: '%',
            threshold: 80,
            status: 'good',
            description: 'Overall data quality after processing'
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        createdBy: user?.id || 'user-1',
        executionTime: 254
      },
      {
        id: 'pipeline-2',
        name: 'Health Data Processing',
        description: 'Processes health indicators with compliance checks',
        status: 'running',
        steps: [
          {
            id: 'step-1',
            name: 'Data Ingestion',
            type: 'data_ingestion',
            status: 'completed',
            executionTime: 67
          },
          {
            id: 'step-2',
            name: 'Data Validation',
            type: 'data_validation',
            status: 'running',
            executionTime: 0
          }
        ],
        inputData: [],
        outputData: [],
        complianceChecks: [],
        qualityMetrics: [],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        createdBy: user?.id || 'user-1'
      }
    ];

    const mockAiIntegrations: AIIntegration[] = [
      {
        id: 'ai-1',
        dataSourceId: 'avoindata-fi',
        aiServiceId: 'model-benchmarking',
        modelType: 'Classification',
        trainingStatus: 'completed',
        performanceMetrics: [
          {
            name: 'Accuracy',
            value: 94.2,
            unit: '%',
            trend: 'up',
            description: 'Model classification accuracy'
          }
        ],
        deploymentStatus: 'deployed',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    setDataSources(mockDataSources);
    setPipelines(mockPipelines);
    setAiIntegrations(mockAiIntegrations);
    setLoading(false);
  }, [user]);

  const filteredDataSources = dataSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAccessibility = filterAccessibility === 'all' || source.accessibility === filterAccessibility;
    const matchesDomain = filterDomain === 'all' || source.domain.toLowerCase().includes(filterDomain.toLowerCase());
    
    return matchesSearch && matchesAccessibility && matchesDomain;
  });

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility) {
      case 'open': return 'green';
      case 'restricted': return 'yellow';
      case 'sensitive': return 'red';
      default: return 'gray';
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'basic': return 'blue';
      case 'enhanced': return 'orange';
      case 'strict': return 'red';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'maintenance': return 'yellow';
      case 'deprecated': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Data Management Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('dataManagement.title')}</h1>
              <p className="text-gray-300">{t('dataManagement.subtitle')}</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{dataSources.length}</p>
                  <p className="text-sm text-gray-300">Data Sources</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pipelines.length}</p>
                  <p className="text-sm text-gray-300">Processing Pipelines</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{aiIntegrations.length}</p>
                  <p className="text-sm text-gray-300">AI Integrations</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-sm text-gray-300">Compliance Rate</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sources', label: 'Data Sources', icon: Database },
              { id: 'pipelines', label: 'Processing', icon: Workflow },
              { id: 'ai-integration', label: 'AI Integration', icon: Zap },
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">Municipal Data Processing pipeline completed successfully</p>
                    <p className="text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">Health Data Processing pipeline started</p>
                    <p className="text-sm text-gray-400">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white">AI model training completed with 94.2% accuracy</p>
                    <p className="text-sm text-gray-400">1 day ago</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Data Source Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Public Services', 'Healthcare', 'Social Research', 'Life Sciences', 'Cross-domain', 'Demographics'].map((category) => {
                const categorySources = dataSources.filter(source => 
                  source.domain === category || source.categories.includes(category)
                );
                return (
                  <Card key={category} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{category}</h4>
                        <p className="text-sm text-gray-400">{categorySources.length} sources</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {categorySources.slice(0, 3).map((source) => (
                        <div key={source.id} className="flex items-center justify-between">
                          <span className="text-white text-sm">{source.name}</span>
                          <Badge variant={getAccessibilityColor(source.accessibility)}>
                            {source.accessibility}
                          </Badge>
                        </div>
                      ))}
                      {categorySources.length > 3 && (
                        <p className="text-gray-400 text-sm">+{categorySources.length - 3} more</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search data sources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterAccessibility}
                    onChange={(e) => setFilterAccessibility(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Access Levels</option>
                    <option value="open">Open</option>
                    <option value="restricted">Restricted</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                  
                  <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Domains</option>
                    <option value="public services">Public Services</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="social research">Social Research</option>
                    <option value="life sciences">Life Sciences</option>
                    <option value="demographics">Demographics</option>
                    <option value="cross-domain">Cross-domain</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="quality">Sort by Quality</option>
                    <option value="popularity">Sort by Popularity</option>
                    <option value="compliance">Sort by Compliance</option>
                    <option value="updated">Sort by Last Updated</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Data Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDataSources.map((source) => (
                <Card key={source.id} className="p-6 hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{source.name}</h4>
                        <p className="text-sm text-gray-400">{source.domain}</p>
                      </div>
                    </div>
                    <Badge variant={getAccessibilityColor(source.accessibility)}>
                      {source.accessibility}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{source.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Quality Score</span>
                      <span className="text-white text-sm">{source.qualityScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Compliance Level</span>
                      <Badge variant={getComplianceColor(source.complianceLevel)}>
                        {source.complianceLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Data Size</span>
                      <span className="text-white text-sm">{source.dataSize}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDataSource(source)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Access
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pipelines' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Processing Pipelines</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Pipeline
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {pipelines.map((pipeline) => (
                <Card key={pipeline.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{pipeline.name}</h4>
                      <p className="text-gray-300 text-sm">{pipeline.description}</p>
                    </div>
                    <Badge variant={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {pipeline.steps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-600' :
                          step.status === 'running' ? 'bg-blue-600' :
                          step.status === 'error' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : step.status === 'running' ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : step.status === 'error' ? (
                            <XCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{step.name}</p>
                          <p className="text-gray-400 text-xs">{step.type.replace('_', ' ')}</p>
                        </div>
                        {step.executionTime && (
                          <span className="text-gray-400 text-sm">{step.executionTime}s</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {pipeline.executionTime && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Total Execution Time</span>
                        <span className="text-white text-sm">{pipeline.executionTime}s</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-integration' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">AI Integrations</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Integration
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {aiIntegrations.map((integration) => {
                const dataSource = dataSources.find(ds => ds.id === integration.dataSourceId);
                return (
                  <Card key={integration.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{dataSource?.name} → AI Service</h4>
                        <p className="text-gray-300 text-sm">Model Type: {integration.modelType}</p>
                      </div>
                      <Badge variant={getStatusColor(integration.trainingStatus)}>
                        {integration.trainingStatus}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {integration.performanceMetrics.map((metric) => (
                        <div key={metric.name} className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">{metric.value}{metric.unit}</span>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Compliance Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">GDPR Compliance</h4>
                    <p className="text-sm text-gray-400">Data Protection</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Compliance Rate</span>
                    <span className="text-green-500 text-sm font-semibold">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Last Audit</span>
                    <span className="text-white text-sm">2 days ago</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">EU AI Act</h4>
                    <p className="text-sm text-gray-400">AI Regulation</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Compliance Rate</span>
                    <span className="text-blue-500 text-sm font-semibold">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Last Audit</span>
                    <span className="text-white text-sm">1 week ago</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Data Quality</h4>
                    <p className="text-sm text-gray-400">Quality Assurance</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Quality Score</span>
                    <span className="text-orange-500 text-sm font-semibold">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Last Check</span>
                    <span className="text-white text-sm">3 hours ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Data Usage Trends</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Total Data Processed</span>
                    <span className="text-white text-sm">2.4TB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Active Pipelines</span>
                    <span className="text-white text-sm">{pipelines.filter(p => p.status === 'running').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">AI Models Trained</span>
                    <span className="text-white text-sm">{aiIntegrations.length}</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Average Processing Time</span>
                    <span className="text-white text-sm">4.2 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Success Rate</span>
                    <span className="text-green-500 text-sm">96%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">System Uptime</span>
                    <span className="text-white text-sm">99.9%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
