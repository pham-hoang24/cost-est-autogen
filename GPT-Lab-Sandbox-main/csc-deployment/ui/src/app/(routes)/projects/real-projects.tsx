'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
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
  Boxes
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  owner_email: string;
  owner_first_name: string;
  owner_last_name: string;
  organization_id: string;
  data_residency: string;
  access_control: string;
  gdpr_compliant: number;
  eu_ai_act_compliant: number;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  gpu_enabled: number;
  estimated_cost: number;
  created_at: string;
  updated_at: string;
  collaborators: Array<{
    userId: string;
    role: string;
    permissions: string[];
    addedAt: string;
    user: {
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function RealProjectsPage() {
  const { user, getAuthHeaders } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      });
      
      const response = await fetch(`/api/projects?${params}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Projects fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, selectedStatus, selectedCategory]);

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.owner_first_name && project.owner_first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.owner_email && project.owner_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-900/30 text-green-400 border-green-500/30', icon: CheckCircle },
      running: { color: 'bg-blue-900/30 text-blue-400 border-blue-500/30', icon: Play },
      paused: { color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30', icon: Clock },
      completed: { color: 'bg-purple-900/30 text-purple-400 border-purple-500/30', icon: CheckCircle },
      failed: { color: 'bg-red-900/30 text-red-400 border-red-500/30', icon: XCircle },
      suspended: { color: 'bg-gray-900/30 text-gray-400 border-gray-500/30', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      research: 'bg-blue-900/20 text-blue-300',
      industry: 'bg-green-900/20 text-green-300',
      academic: 'bg-purple-900/20 text-purple-300',
      pilot: 'bg-orange-900/20 text-orange-300'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[category as keyof typeof categoryColors] || categoryColors.research}`}>
        {category}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCost = (cost: number) => {
    return `€${cost.toFixed(2)}`;
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
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Projects</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchProjects} className="btn-primary">
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
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-slate-400">Manage and monitor your research projects</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="research">Research</option>
            <option value="industry">Industry</option>
            <option value="academic">Academic</option>
            <option value="pilot">Pilot</option>
          </select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Boxes className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first project'}
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                    <p className="text-slate-400 text-sm mb-2">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    {getCategoryBadge(project.category)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Users className="w-4 h-4" />
                    <span>{project.collaborators.length} collaborator{project.collaborators.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <TrendingUp className="w-4 h-4" />
                    <span>{formatCost(project.estimated_cost)} estimated</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Cpu className="w-4 h-4" />
                    <span>{project.cpu_cores} CPU</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <HardDrive className="w-4 h-4" />
                    <span>{project.memory_gb}GB RAM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Database className="w-4 h-4" />
                    <span>{project.storage_gb}GB Storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Zap className="w-4 h-4" />
                    <span>{project.gpu_enabled ? 'GPU Enabled' : 'CPU Only'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.gdpr_compliant ? (
                      <Shield className="w-4 h-4 text-green-400" />
                    ) : null}
                    {project.eu_ai_act_compliant ? (
                      <Target className="w-4 h-4 text-blue-400" />
                    ) : null}
                    <span className="text-xs text-slate-400">{project.data_residency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-slate-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-slate-400 hover:text-white">
                      <Edit className="w-4 h-4" />
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

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
              <p className="text-slate-400 mb-6">Project creation form will be implemented here</p>
              <div className="flex gap-3 justify-end">
                <Button 
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button className="btn-primary">
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
