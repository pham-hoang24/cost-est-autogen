'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  Database,
  Search,
  Filter,
  Download,
  Eye,
  Lock,
  Globe,
  FileText,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  Shield,
  Key,
  BookOpen,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  ChevronRight,
  ChevronDown,
  Loader2,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Zap,
  BarChart3,
  Activity,
  Server,
  Cloud,
  Archive,
  Link,
  Target,
  Layers,
  Workflow,
  Cpu,
  HardDrive,
  Network,
  UserCheck,
  FileCheck,
  AlertCircle,
  CheckSquare,
  XCircle,
  Plus,
  Minus
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

interface DataSourceExplorerProps {
  dataSources: DataSource[];
  onDataSourceSelect: (source: DataSource) => void;
  onAccessRequest: (source: DataSource) => void;
}

export default function DataSourceExplorer({ 
  dataSources, 
  onDataSourceSelect, 
  onAccessRequest 
}: DataSourceExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccessibility, setFilterAccessibility] = useState<string>('all');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const getAccessibilityIcon = (accessibility: string) => {
    switch (accessibility) {
      case 'open': return Globe;
      case 'restricted': return Lock;
      case 'sensitive': return Shield;
      default: return Database;
    }
  };

  const handleAccessRequest = async (source: DataSource) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAccessRequest(source);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewData = async (source: DataSource) => {
    setLoading(true);
    try {
      // Simulate data preview
      await new Promise(resolve => setTimeout(resolve, 500));
      onDataSourceSelect(source);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search data sources by name, description, or tags..."
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
              <option value="open">Open Access</option>
              <option value="restricted">Restricted Access</option>
              <option value="sensitive">Sensitive Data</option>
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
            
            <div className="flex border border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Showing {filteredDataSources.length} of {dataSources.length} data sources
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </Card>

      {/* Data Sources Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDataSources.map((source) => {
            const AccessibilityIcon = getAccessibilityIcon(source.accessibility);
            return (
              <Card key={source.id} className="p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <AccessibilityIcon className="w-5 h-5 text-white" />
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
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${source.qualityScore}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{source.qualityScore}%</span>
                    </div>
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
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Update Frequency</span>
                    <span className="text-white text-sm">{source.updateFrequency}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewData(source)}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccessRequest(source)}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Access
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Last updated: {source.lastUpdated.toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{source.popularityScore}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDataSources.map((source) => {
            const AccessibilityIcon = getAccessibilityIcon(source.accessibility);
            const isExpanded = expandedSource === source.id;
            
            return (
              <Card key={source.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <AccessibilityIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-semibold text-white">{source.name}</h4>
                        <Badge variant={getAccessibilityColor(source.accessibility)}>
                          {source.accessibility}
                        </Badge>
                        <Badge variant={getComplianceColor(source.complianceLevel)}>
                          {source.complianceLevel}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{source.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{source.domain}</span>
                        <span>•</span>
                        <span>{source.dataSize}</span>
                        <span>•</span>
                        <span>Quality: {source.qualityScore}%</span>
                        <span>•</span>
                        <span>Updated: {source.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewData(source)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAccessRequest(source)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedSource(isExpanded ? null : source.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-3">Data Types</h5>
                        <div className="flex flex-wrap gap-1">
                          {source.dataTypes.map((type) => (
                            <Badge key={type} variant="gray" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-3">Use Cases</h5>
                        <div className="space-y-1">
                          {source.useCases.slice(0, 3).map((useCase) => (
                            <p key={useCase} className="text-gray-300 text-xs">{useCase}</p>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-3">Languages</h5>
                        <div className="flex flex-wrap gap-1">
                          {source.languages.map((lang) => (
                            <Badge key={lang} variant="blue" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {source.accessRequirements && source.accessRequirements.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-white mb-3">Access Requirements</h5>
                        <div className="space-y-2">
                          {source.accessRequirements.map((requirement) => (
                            <div key={requirement} className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-300 text-sm">{requirement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex items-center gap-4">
                      {source.documentation && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={source.documentation} target="_blank" rel="noopener noreferrer">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Documentation
                          </a>
                        </Button>
                      )}
                      
                      {source.apiEndpoint && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={source.apiEndpoint} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            API Endpoint
                          </a>
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      {filteredDataSources.length === 0 && (
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Data Sources Found</h3>
          <p className="text-gray-400 mb-4">
            Try adjusting your search criteria or filters to find data sources.
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setFilterAccessibility('all');
            setFilterDomain('all');
          }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}

// Helper component for list view
function List({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}
