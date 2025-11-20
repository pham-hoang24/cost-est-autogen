'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Database,
  Download,
  Eye,
  Lock,
  Globe,
  Shield,
  Calendar,
  HardDrive,
  FileText,
  Image,
  Clock,
  TrendingUp,
  Tag,
  MoreVertical,
  Plus,
  AlertTriangle
} from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  data_type: string;
  size_gb: number;
  record_count: number;
  owner_email: string;
  owner_first_name: string;
  owner_last_name: string;
  organization_id: string;
  access_level: string;
  gdpr_compliant: boolean;
  data_residency: string;
  license_type: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function DataCatalogPage() {
  const { user, getAuthHeaders } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDataType, setSelectedDataType] = useState('all');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('all');

  // Fetch datasets from API
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedDataType !== 'all' && { data_type: selectedDataType }),
        ...(selectedAccessLevel !== 'all' && { access_level: selectedAccessLevel })
      });
      
      const response = await fetch(`http://localhost:8080/api/data-catalog/datasets?${params}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }
      
      const data = await response.json();
      console.log('Data Catalog API response:', data);
      setDatasets(data.data?.datasets || data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
      console.error('Datasets fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDatasets();
    }
  }, [user, selectedCategory, selectedDataType, selectedAccessLevel]);

  // Filter datasets based on search query
  const filteredDatasets = (datasets || []).filter(dataset =>
    (dataset.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dataset.tags || []).some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAccessLevelIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-400" />;
      case 'restricted':
        return <Lock className="w-4 h-4 text-yellow-400" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-400" />;
      default:
        return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'structured':
        return <Database className="w-4 h-4 text-blue-400" />;
      case 'unstructured':
        return <FileText className="w-4 h-4 text-orange-400" />;
      case 'time_series':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'images':
        return <Image className="w-4 h-4 text-green-400" />;
      case 'text':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      research: 'bg-blue-900/20 text-blue-300',
      industry: 'bg-green-900/20 text-green-300',
      public: 'bg-purple-900/20 text-purple-300',
      sensitive: 'bg-red-900/20 text-red-300'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[category as keyof typeof categoryColors] || categoryColors.research}`}>
        {category}
      </span>
    );
  };

  const formatSize = (sizeGb: number) => {
    const size = sizeGb || 0;
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)} TB`;
    }
    return `${size.toFixed(1)} GB`;
  };

  const formatCount = (count: number) => {
    const num = count || 0;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-lg p-6">
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data Catalog</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchDatasets} className="btn-primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Data Catalog</h1>
            <p className="text-slate-400">Browse and access research datasets</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {/* TODO: Implement dataset upload */}}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Dataset
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="research">Research</option>
            <option value="industry">Industry</option>
            <option value="public">Public</option>
            <option value="sensitive">Sensitive</option>
          </select>
          <select
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Data Types</option>
            <option value="structured">Structured</option>
            <option value="unstructured">Unstructured</option>
            <option value="time_series">Time Series</option>
            <option value="images">Images</option>
            <option value="text">Text</option>
          </select>
          <select
            value={selectedAccessLevel}
            onChange={(e) => setSelectedAccessLevel(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Access Levels</option>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Datasets Grid */}
        {filteredDatasets.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Datasets Found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'No datasets available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{dataset.name}</h3>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-2">{dataset.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAccessLevelIcon(dataset.access_level || 'private')}
                    {getCategoryBadge(dataset.category || 'research')}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {getDataTypeIcon(dataset.data_type || 'structured')}
                  <span className="text-sm text-slate-300 capitalize">{(dataset.data_type || 'unknown').replace('_', ' ')}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-4 h-4" />
                      Size
                    </span>
                    <span>{formatSize(dataset.size_gb)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Records
                    </span>
                    <span>{formatCount(dataset.record_count)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created
                    </span>
                    <span>{formatDate(dataset.created_at)}</span>
                  </div>
                </div>

                {/* Tags */}
                {(dataset.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(dataset.tags || []).slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {(dataset.tags || []).length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                        +{(dataset.tags || []).length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {dataset.gdpr_compliant && (
                      <Shield className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-xs text-slate-400">{dataset.data_residency || 'N/A'}</span>
                    <span className="text-xs text-slate-400">{dataset.license_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-slate-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-slate-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-slate-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}