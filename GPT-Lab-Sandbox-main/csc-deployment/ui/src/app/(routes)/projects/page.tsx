'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Plus, 
  Users, 
  Calendar,
  Settings, 
  Share2, 
  Lock, 
  Globe, 
  Building2,
  Brain,
  Database,
  Code,
  FileText,
  MoreVertical,
  UserPlus,
  Eye,
  Edit3,
  Trash2,
  Activity,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  Award,
  AlertCircle,
  Info,
  Play,
  Pause,
  Square,
  ChevronRight,
  Download,
  Upload,
  GitBranch,
  Layers,
  Workflow,
  LockIcon,
  Unlock,
  EyeOff,
  Key,
  FileCheck,
  FileX,
  Timer,
  Flame,
  Sparkles
} from 'lucide-react';

// Project interfaces for TypeScript
interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: 'research' | 'ai_development' | 'data_analysis' | 'model_training';
  visibility: 'private' | 'organization' | 'public';
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'research_exemption';
  status: 'active' | 'paused' | 'completed' | 'archived';
  owner_id: string;
  member_count?: number;
  max_collaborators?: number;
  requires_dpia: boolean;
  cross_border_transfers: boolean;
  data_retention_days?: number;
  created_at: string;
  updated_at: string;
}

interface SubscriptionFeatures {
  subscription_tier: string;
  max_projects: number;
  max_collaborators_per_project: number;
  max_storage_gb: number;
  external_collaboration: boolean;
  cross_border_data_sharing: boolean;
  advanced_ai_features: boolean;
  custom_legal_agreements: boolean;
}

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [subscriptionFeatures, setSubscriptionFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'contributor',
    message: ''
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'research',
    visibility: 'private',
    legal_basis: 'research_exemption',
    data_retention_days: 365,
    cross_border_transfers: false,
    max_collaborators: 10,
    research_area: '',
    funding_source: '',
    expected_duration: '12',
    data_types: [],
    target_institutions: [],
    ethical_approval: false,
    data_protection_officer: '',
    research_questions: ''
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects();
      fetchSubscriptionFeatures();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showMembersModal) setShowMembersModal(false);
        if (showInviteModal) setShowInviteModal(false);
        if (selectedProject) setSelectedProject(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showCreateModal, showMembersModal, showInviteModal, selectedProject]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/collaboration/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Projects loaded from backend:', result.data?.projects || []);
        setProjects(result.data?.projects || []);
      } else {
        console.error('Failed to fetch projects:', response.status);
        // Show demo data when API fails
        setProjects(getDemoProjects());
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Show demo data on error
      setProjects(getDemoProjects());
    }
    setLoading(false);
  };

  const getDemoProjects = () => [
    {
      id: 'demo-1',
      name: 'Finnish Language AI Models',
      description: 'Developing advanced NLP models for Finnish language processing, including sentiment analysis and text generation for academic and commercial applications.',
      project_type: 'ai_development',
      visibility: 'organization',
      legal_basis: 'research_exemption',
    status: 'active',
      owner_id: 'admin',
      member_count: 8,
      max_collaborators: 12,
      requires_dpia: true,
      cross_border_transfers: false,
      data_sharing_agreements: ['University of Helsinki', 'Aalto University'],
      compliance_status: 'compliant',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['NLP', 'Finnish', 'AI', 'Research'],
      collaborators: [
        { id: '1', name: 'Dr. Anna Virtanen', role: 'Lead Researcher', organization: 'University of Helsinki' },
        { id: '2', name: 'Prof. Mika Laine', role: 'Co-PI', organization: 'Aalto University' },
        { id: '3', name: 'Sofia Koskinen', role: 'PhD Student', organization: 'University of Helsinki' }
      ],
      // Enhanced visual data
      progress: 75,
      priority: 'high',
      sensitivity_level: 'confidential',
      data_volume: '2.3TB',
      last_activity: '2 hours ago',
      milestones_completed: 6,
      total_milestones: 8,
      risk_level: 'medium',
      budget_used: 65,
      budget_total: 100000,
      compliance_score: 92,
      data_retention_days: 1095,
      ethical_approval: true,
      funding_source: 'Academy of Finland',
      research_phase: 'development',
      ai_model_count: 3,
      dataset_count: 12,
      publication_count: 2,
      patent_count: 1,
      collaboration_requests: 3,
      security_incidents: 0,
      data_breaches: 0,
      audit_score: 88,
      user_role: 'owner',
      resource_count: 15,
      recent_activity: 'Model training completed for Phase 2'
    },
    {
      id: 'demo-2',
      name: 'Healthcare AI for Finnish Hospitals',
      description: 'Collaborative project between Finnish hospitals and universities to develop AI-powered diagnostic tools for early disease detection using medical imaging and patient data.',
      project_type: 'research',
      visibility: 'private',
      legal_basis: 'consent',
      status: 'active',
      owner_id: 'admin',
      member_count: 15,
      max_collaborators: 20,
      requires_dpia: true,
      cross_border_transfers: true,
      data_sharing_agreements: ['HUS Helsinki', 'Tampere University Hospital', 'VTT'],
      compliance_status: 'under_review',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Healthcare', 'Medical AI', 'Diagnostics', 'Hospitals'],
      collaborators: [
        { id: '4', name: 'Dr. Pekka Nieminen', role: 'Medical Director', organization: 'HUS Helsinki' },
        { id: '5', name: 'Prof. Liisa Hakkarainen', role: 'Research Lead', organization: 'Tampere University' }
      ]
    },
    {
      id: 'demo-3',
      name: 'Climate Data Analysis with ML',
      description: 'Using machine learning to analyze Finnish climate data and predict environmental changes. Collaboration between Finnish Meteorological Institute and universities.',
      project_type: 'data_analysis',
      visibility: 'public',
      legal_basis: 'legitimate_interest',
      status: 'active',
      owner_id: 'admin',
      member_count: 6,
      max_collaborators: 10,
      requires_dpia: false,
      cross_border_transfers: false,
      data_sharing_agreements: ['Finnish Meteorological Institute', 'University of Oulu'],
      compliance_status: 'compliant',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Climate', 'ML', 'Environment', 'Data Science'],
      collaborators: [
        { id: '6', name: 'Dr. Jukka Rantanen', role: 'Climate Scientist', organization: 'Finnish Meteorological Institute' },
        { id: '7', name: 'Prof. Marja-Liisa Rantala', role: 'ML Expert', organization: 'University of Oulu' }
      ]
    },
    {
      id: 'demo-4',
      name: 'Autonomous Vehicle Research',
      description: 'Developing AI algorithms for autonomous vehicles in Finnish winter conditions. Partnership between automotive industry and academic institutions.',
      project_type: 'model_training',
      visibility: 'organization',
      legal_basis: 'contract',
      status: 'paused',
      owner_id: 'admin',
      member_count: 12,
      max_collaborators: 15,
      requires_dpia: true,
      cross_border_transfers: true,
      data_sharing_agreements: ['VTT', 'LUT University', 'Nokia'],
      compliance_status: 'pending',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['Autonomous Vehicles', 'Winter Conditions', 'AI', 'Automotive'],
      collaborators: [
        { id: '8', name: 'Dr. Timo Kärkkäinen', role: 'Project Lead', organization: 'VTT' },
        { id: '9', name: 'Prof. Sanna Rantala', role: 'AI Researcher', organization: 'LUT University' }
      ]
    },
    {
      id: 'demo-5',
      name: 'Finnish Education Technology',
      description: 'Creating AI-powered educational tools for Finnish schools and universities. Focus on personalized learning and accessibility.',
      project_type: 'research',
      visibility: 'public',
      legal_basis: 'consent',
      status: 'completed',
      owner_id: 'admin',
      member_count: 10,
      max_collaborators: 12,
      requires_dpia: true,
      cross_border_transfers: false,
      data_sharing_agreements: ['Ministry of Education', 'University of Jyväskylä'],
      compliance_status: 'compliant',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['EdTech', 'Education', 'AI', 'Accessibility'],
      collaborators: [
        { id: '10', name: 'Dr. Kaisa Vainio', role: 'Education Expert', organization: 'University of Jyväskylä' },
        { id: '11', name: 'Prof. Antti Lehtinen', role: 'Technology Lead', organization: 'University of Helsinki' }
      ]
    }
  ];

  const fetchSubscriptionFeatures = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/collaboration/subscription/features', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSubscriptionFeatures(result.data);
      } else {
        console.error('Failed to fetch subscription features');
        setSubscriptionFeatures(null);
      }
    } catch (error) {
      console.error('Error fetching subscription features:', error);
      setSubscriptionFeatures(null);
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_development': return <Brain className="w-4 h-4" />;
      case 'data_analysis': return <Database className="w-4 h-4" />;
      case 'research': return <FileText className="w-4 h-4" />;
      case 'model_training': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Lock className="w-4 h-4 text-red-400" />;
      case 'organization': return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'public': return <Globe className="w-4 h-4 text-green-400" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'success';
      case 'admin': return 'primary';
      case 'contributor': return 'secondary';
      case 'viewer': return 'muted';
      default: return 'muted';
    }
  };

  // Enhanced visualization helpers
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getSensitivityIcon = (level: string) => {
    switch (level) {
      case 'public': return <Globe className="w-4 h-4 text-green-500" />;
      case 'internal': return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'confidential': return <Lock className="w-4 h-4 text-orange-500" />;
      case 'restricted': return <LockIcon className="w-4 h-4 text-red-500" />;
      default: return <EyeOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'public': return 'text-green-600 bg-green-50 border-green-200';
      case 'internal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confidential': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'restricted': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDataVolume = (volume: string) => {
    return volume;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'archived': return <Square className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesRole = filterRole === 'all' || project.user_role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const canCreateProject = () => {
    // For demo purposes, always allow project creation
    return true;
    // if (!subscriptionFeatures) return false;
    // const maxProjects = subscriptionFeatures.features.max_projects;
    // return maxProjects === -1 || subscriptionFeatures.current_usage.projects < maxProjects;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Form name value:', formData.name);
    console.log('Form name trimmed:', formData.name.trim());
    
    if (!formData.name || formData.name.trim() === '') {
      setCreateError('Project name is required');
      return;
    }
    
    setCreateLoading(true);
    setCreateError('');

    try {
      console.log('Creating project with data:', formData);
      
      const response = await fetch('http://localhost:8080/api/collaboration/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('API response:', result);

      if (response.ok && result.success) {
        console.log('Project created successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          project_type: 'research',
          visibility: 'private',
          legal_basis: 'research_exemption',
          data_retention_days: 365,
          cross_border_transfers: false,
          max_collaborators: 10,
          research_area: '',
          funding_source: '',
          expected_duration: '12',
          data_types: [],
          target_institutions: [],
          ethical_approval: false,
          data_protection_officer: '',
          research_questions: ''
        });
        
        // Refresh projects list
        fetchProjects();
      } else {
        setCreateError(result.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setCreateError('Network error. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchProjectMembers = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/collaboration/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setProjectMembers(result.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/collaboration/invitations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setInvitations(result.data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');

    try {
      console.log('Sending invitation with data:', inviteFormData);
      console.log('Project ID:', selectedProject.id);
      
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const response = await fetch(`http://localhost:8080/api/collaboration/projects/${selectedProject.id}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteFormData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        console.log('Invitation sent successfully!');
        setShowInviteModal(false);
        setInviteFormData({ email: '', role: 'contributor', message: '' });
        // Refresh project members
        if (selectedProject) {
          fetchProjectMembers(selectedProject.id);
        }
      } else {
        console.error('Invitation failed:', result);
        setInviteError(result.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setInviteError(`Network error: ${error instanceof Error ? error.message : String(error) || 'Please try again.'}`);
    }

    setInviteLoading(false);
  };

  const openMembersModal = (project: any) => {
    setSelectedProject(project);
    setShowMembersModal(true);
    fetchProjectMembers(project.id);
  };

  const openInviteModal = (project: any) => {
    setSelectedProject(project);
    setShowInviteModal(true);
  };

  if (authLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading Projects...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Authentication Required</h2>
          <p className="text-text-secondary mb-4">Please log in to access your projects</p>
          <Button className="btn-primary" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </Card>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading Projects...</p>
              </div>
              </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">
            {t('projects.research')} <span className="text-primary">{t('projects.projects')}</span>
          </h1>
          <p className="text-text-secondary mt-2">
            {t('projects.subtitle')}
          </p>
          {subscriptionFeatures && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {subscriptionFeatures.subscription_tier.toUpperCase()} Plan
              </Badge>
              <Badge variant="muted">
                {subscriptionFeatures.current_usage.projects}/{subscriptionFeatures.features.max_projects === -1 ? '∞' : subscriptionFeatures.features.max_projects} Projects
              </Badge>
        </div>
          )}
              </div>
        <Button 
          className="btn-primary flex items-center gap-2"
          onClick={() => {
            console.log('New Project button clicked');
            // Reset form data when opening modal
            setFormData({
              name: '',
              description: '',
              project_type: 'research',
              visibility: 'private',
              legal_basis: 'research_exemption',
              data_retention_days: 365,
              cross_border_transfers: false,
              max_collaborators: 10,
              research_area: '',
              funding_source: '',
              expected_duration: '12',
              data_types: [],
              target_institutions: [],
              ethical_approval: false,
              data_protection_officer: '',
              research_questions: ''
            });
            setCreateError('');
            setShowCreateModal(true);
          }}
          disabled={!canCreateProject()}
        >
          <Plus className="w-4 h-4" />
          New Project
          </Button>
        </div>

      {/* Subscription Limits Warning */}
      {subscriptionFeatures && !canCreateProject() && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Project limit reached</span>
      </div>
          <p className="text-yellow-700 text-sm mt-1">
            You've reached your maximum of {subscriptionFeatures.features.max_projects} projects. 
            <a href="/billing" className="underline ml-1">Upgrade your plan</a> to create more projects.
          </p>
        </Card>
      )}

      {/* Project Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
            <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            <div>
              <p className="text-sm text-text-muted">Total Projects</p>
              <p className="text-2xl font-bold text-text-primary">{projects.length}</p>
              <p className="text-xs text-green-600">+2 this month</p>
              </div>
            </div>
        </Card>

        <Card className="p-6">
            <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            <div>
              <p className="text-sm text-text-muted">{t('projects.activeProjects')}</p>
              <p className="text-2xl font-bold text-text-primary">
                {projects.filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-text-muted">
                {Math.round((projects.filter(p => p.status === 'active').length / projects.length) * 100)}% of total
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Avg Compliance</p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(projects.reduce((acc, p) => acc + (p.compliance_score || 0), 0) / projects.length)}%
              </p>
              <p className="text-xs text-green-600">GDPR Ready</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t('projects.totalMembers')}</p>
              <p className="text-2xl font-bold text-text-primary">
                {projects.reduce((acc, p) => acc + (p.member_count || 0), 0)}
              </p>
              <p className="text-xs text-text-muted">{t('projects.acrossAllProjects')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('projects.all')} {t('projects.status')}</option>
              <option value="active">{t('projects.active')}</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('projects.all')} Roles</option>
              <option value="owner">{t('projects.owner')}</option>
              <option value="admin">Admin</option>
              <option value="contributor">Contributor</option>
              <option value="viewer">Viewer</option>
            </select>
            </div>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
            {/* Project Header with Priority & Sensitivity */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getProjectTypeIcon(project.project_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-lg">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(project.status)}
                    <span className="text-sm text-text-muted capitalize">{project.status}</span>
                    {project.priority && (
                      <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                        {project.priority.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSensitivityIcon(project.sensitivity_level || 'internal')}
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Project Description */}
            <p className="text-text-secondary text-sm mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Progress Bar */}
            {project.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                {project.milestones_completed && project.total_milestones && (
                  <div className="text-xs text-text-muted mt-1">
                    {project.milestones_completed}/{project.total_milestones} milestones completed
            </div>
                )}
          </div>
            )}

            {/* Enhanced Project Metadata */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-surface/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-text-primary">Team</span>
        </div>
                <div className="text-lg font-bold text-text-primary">{project.member_count}</div>
                <div className="text-xs text-text-muted">members</div>
      </div>

              <div className="bg-surface/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-text-primary">Data</span>
                </div>
                <div className="text-lg font-bold text-text-primary">{project.data_volume || '0GB'}</div>
                <div className="text-xs text-text-muted">volume</div>
              </div>
              
              <div className="bg-surface/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-text-primary">Compliance</span>
                </div>
                <div className={`text-lg font-bold px-2 py-1 rounded ${getComplianceScoreColor(project.compliance_score || 0)}`}>
                  {project.compliance_score || 0}%
                </div>
                <div className="text-xs text-text-muted">score</div>
              </div>
              
              <div className="bg-surface/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-text-primary">Risk</span>
                </div>
                <div className={`text-lg font-bold ${getRiskColor(project.risk_level || 'low')}`}>
                  {project.risk_level || 'low'}
                </div>
                <div className="text-xs text-text-muted">level</div>
              </div>
            </div>

            {/* Enhanced Compliance & Security Indicators */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.requires_dpia && (
                <Badge variant="yellow" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  DPIA Required
                </Badge>
              )}
              {project.cross_border_transfers && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Cross-Border
                </Badge>
              )}
              {project.ethical_approval && (
                <Badge variant="green" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ethical Approval
                </Badge>
              )}
              {project.sensitivity_level === 'restricted' && (
                <Badge variant="red" className="text-xs">
                  <LockIcon className="w-3 h-3 mr-1" />
                  Restricted Access
                </Badge>
              )}
              {project.security_incidents === 0 && (
                <Badge variant="green" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  No Incidents
                </Badge>
                      )}
                    </div>

            {/* Project Statistics */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              {project.ai_model_count && (
                <div className="bg-surface/30 p-2 rounded">
                  <div className="text-lg font-bold text-primary">{project.ai_model_count}</div>
                  <div className="text-xs text-text-muted">AI Models</div>
                  </div>
              )}
              {project.dataset_count && (
                <div className="bg-surface/30 p-2 rounded">
                  <div className="text-lg font-bold text-primary">{project.dataset_count}</div>
                  <div className="text-xs text-text-muted">Datasets</div>
                </div>
              )}
              {project.publication_count && (
                <div className="bg-surface/30 p-2 rounded">
                  <div className="text-lg font-bold text-primary">{project.publication_count}</div>
                  <div className="text-xs text-text-muted">Publications</div>
                </div>
              )}
              </div>

            {/* Recent Activity with Visual Indicator */}
            <div className="flex items-center gap-2 text-xs text-text-muted mb-4 p-2 bg-surface/30 rounded">
              <Activity className="w-3 h-3" />
              <span className="flex-1">{project.recent_activity || 'No recent activity'}</span>
              <span className="text-text-muted">{project.last_activity || '2 hours ago'}</span>
                  </div>
                
            {/* Enhanced Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setSelectedProject(project)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Open
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openMembersModal(project)}
                title="View Members"
              >
                <Users className="w-4 h-4" />
              </Button>
              {(project.user_role === 'owner' || project.user_role === 'admin') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openInviteModal(project)}
                  title="Invite Member"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                title="Project Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
                </div>

            {/* Enhanced Project Status Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Calendar className="w-3 h-3" />
                <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                <Badge variant={getRoleColor(project.user_role) as any} className="text-xs">
                  {project.user_role}
                </Badge>
                {project.funding_source && (
                  <Badge variant="outline" className="text-xs">
                    {project.funding_source}
                  </Badge>
                )}
                  </div>
                </div>
          </Card>
        ))}
              </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            {searchTerm || filterStatus !== 'all' || filterRole !== 'all' ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || filterStatus !== 'all' || filterRole !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first research project to start collaborating'}
          </p>
          {(!searchTerm && filterStatus === 'all' && filterRole === 'all') && canCreateProject() && (
            <Button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
          </Button>
          )}
        </Card>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProject(null)}
        >
          <Card 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 bg-background border border-border shadow-2xl"
            onClick={() => {}}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-text-primary">{selectedProject.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  {getProjectTypeIcon(selectedProject.project_type)}
                  <Badge variant="secondary">
                    {selectedProject.project_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getRoleColor(selectedProject.user_role) as any}>
                    Your Role: {selectedProject.user_role}
                  </Badge>
                    </div>
                    </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProject(null)}
                className="bg-background border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
              >
                <XCircle className="w-5 h-5 mr-1" />
                Close
              </Button>
                  </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Information */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Project Description</h3>
                  <p className="text-text-secondary bg-surface p-4 rounded-lg">
                    {selectedProject.description || 'No description provided'}
                  </p>
                    </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Project Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getProjectTypeIcon(selectedProject.project_type)}
                        <span className="font-medium text-text-primary">Type</span>
                    </div>
                      <p className="text-text-secondary capitalize">{selectedProject.project_type.replace('_', ' ')}</p>
                  </div>
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getVisibilityIcon(selectedProject.visibility)}
                        <span className="font-medium text-text-primary">Visibility</span>
                </div>
                      <p className="text-text-secondary capitalize">{selectedProject.visibility}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium text-text-primary">Legal Basis</span>
                  </div>
                      <p className="text-text-secondary">{selectedProject.legal_basis.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-text-primary">Created</span>
                    </div>
                      <p className="text-text-secondary">
                        {new Date(selectedProject.created_at).toLocaleDateString()}
                      </p>
                  </div>
                </div>
                    </div>

                {/* Enhanced Compliance & Sensitive Workflow Information */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compliance & Sensitive Workflow
                  </h3>
                  
                  {/* Compliance Score */}
                  <div className="mb-4 p-4 bg-surface rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">Overall Compliance Score</span>
                      <span className={`text-2xl font-bold px-3 py-1 rounded ${getComplianceScoreColor(selectedProject.compliance_score || 0)}`}>
                        {selectedProject.compliance_score || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(selectedProject.compliance_score || 0)}`}
                        style={{ width: `${selectedProject.compliance_score || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Sensitive Data Workflow */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-text-primary flex items-center gap-2">
                      <LockIcon className="w-4 h-4" />
                      Sensitive Data Workflow
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border ${getSensitivityColor(selectedProject.sensitivity_level || 'internal')}`}>
                    <div className="flex items-center gap-2 mb-1">
                          {getSensitivityIcon(selectedProject.sensitivity_level || 'internal')}
                          <span className="font-medium">Data Sensitivity</span>
                    </div>
                        <p className="text-sm capitalize">{selectedProject.sensitivity_level || 'internal'}</p>
                  </div>
                      
                      <div className="p-3 bg-surface rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                          <Key className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Access Level</span>
                    </div>
                        <p className="text-sm">{selectedProject.user_role} permissions</p>
                  </div>
                    </div>

                    {/* Data Protection Measures */}
                    <div className="space-y-2">
                      {selectedProject.requires_dpia && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-800 font-medium">DPIA Required</span>
                          <Badge variant="yellow">Compliance</Badge>
                        </div>
                      )}
                      {selectedProject.cross_border_transfers && (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <Globe className="w-4 h-4 text-orange-600" />
                          <span className="text-orange-800 font-medium">Cross-border Transfers Enabled</span>
                          <Badge variant="yellow">International</Badge>
                        </div>
                      )}
                      {selectedProject.ethical_approval && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-800 font-medium">Ethical Approval Obtained</span>
                          <Badge variant="green">Approved</Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 font-medium">GDPR Compliant</span>
                        <Badge variant="green">Legal</Badge>
                </div>
              </div>

                    {/* Security Metrics */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 bg-surface rounded-lg border text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedProject.security_incidents || 0}</div>
                        <div className="text-sm text-text-muted">Security Incidents</div>
                      </div>
                      <div className="p-3 bg-surface rounded-lg border text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedProject.data_breaches || 0}</div>
                        <div className="text-sm text-text-muted">Data Breaches</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Statistics & Actions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Project Stats</h3>
                  <div className="space-y-3">
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{selectedProject.member_count}</div>
                      <div className="text-sm text-text-secondary">{t('projects.activeMembers')}</div>
                    </div>
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">{selectedProject.resource_count}</div>
                      <div className="text-sm text-text-secondary">Shared Resources</div>
                    </div>
                    <div className="bg-surface p-4 rounded-lg">
                      <div className="text-sm text-text-secondary">Last Activity</div>
                      <div className="text-text-primary">{selectedProject.recent_activity || 'No recent activity'}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      className="btn-primary w-full"
                      onClick={() => openMembersModal(selectedProject)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Members
                  </Button>
                    {(selectedProject.user_role === 'owner' || selectedProject.user_role === 'admin') && (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setSelectedProject(null);
                            openInviteModal(selectedProject);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Collaborator
                  </Button>
                        <Button variant="outline" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Project Settings
                        </Button>
                      </>
                    )}
                    {selectedProject.user_role === 'contributor' && (
                      <Button variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Resources
                      </Button>
                    )}
                  </div>
                </div>

                {/* Your Permissions */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Your Permissions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-text-primary">View project data</span>
                    </div>
                    {(selectedProject.user_role === 'owner' || selectedProject.user_role === 'admin' || selectedProject.user_role === 'contributor') && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-text-primary">Upload and modify resources</span>
                      </div>
                    )}
                    {(selectedProject.user_role === 'owner' || selectedProject.user_role === 'admin') && (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-text-primary">Invite new members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-text-primary">Manage project settings</span>
                        </div>
                      </>
                    )}
                    {selectedProject.user_role === 'owner' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-text-primary">Full project control</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
      </div>
      )}

      {/* Create Project Modal - Legal Compliant */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Only close if clicking on the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-background border border-border shadow-2xl rounded-lg"
            onClick={(e: React.MouseEvent) => {
              // Prevent event bubbling to parent
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Create New Research Project</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="bg-background border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Close
          </Button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              {/* Error Display */}
              {createError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{createError}</span>
        </div>
      )}

              {/* Form Validation Status */}
              <div className="text-xs text-text-muted mb-2">
                Form Status: {formData.name && formData.name.trim() !== '' ? '✅ Valid' : '❌ Project name required'}
        </div>
        
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Project Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                    Project Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter project name"
                  />
              </div>
        
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your research project..."
                  />
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="project_type" className="block text-sm font-medium text-text-primary mb-2">
                      Project Type *
                    </label>
                    <select
                      id="project_type"
                      value={formData.project_type}
                      onChange={(e) => handleFormChange('project_type', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="research">Research</option>
                      <option value="ai_development">AI Development</option>
                      <option value="data_analysis">Data Analysis</option>
                      <option value="model_training">Model Training</option>
                    </select>
              </div>

                  <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-text-primary mb-2">
                      Visibility *
                    </label>
                    <select
                      id="visibility"
                      value={formData.visibility}
                      onChange={(e) => handleFormChange('visibility', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="private">Private</option>
                      <option value="organization">Organization</option>
                      <option value="public">Public</option>
                    </select>
              </div>
            </div>
            </div>

              {/* Legal Compliance */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Legal Compliance
                </h3>

                <div>
                  <label htmlFor="legal_basis" className="block text-sm font-medium text-text-primary mb-2">
                    Legal Basis for Data Processing *
                  </label>
                  <select
                    id="legal_basis"
                    value={formData.legal_basis}
                    onChange={(e) => handleFormChange('legal_basis', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="research_exemption">Research Exemption (GDPR Art. 89)</option>
                    <option value="consent">Explicit Consent</option>
                    <option value="legitimate_interest">Legitimate Interest</option>
                    <option value="contract">Contractual Necessity</option>
                  </select>
                  <p className="text-xs text-text-muted mt-1">
                    Research exemption provides special protections for scientific research under GDPR
                  </p>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="data_retention_days" className="block text-sm font-medium text-text-primary mb-2">
                      Data Retention (Days)
                    </label>
                    <input
                      id="data_retention_days"
                      type="number"
                      min="30"
                      max="2555"
                      value={formData.data_retention_days}
                      onChange={(e) => handleFormChange('data_retention_days', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
              </div>

                  <div>
                    <label htmlFor="max_collaborators" className="block text-sm font-medium text-text-primary mb-2">
                      Max Collaborators
                    </label>
                    <input
                      id="max_collaborators"
                      type="number"
                      min="1"
                      max={subscriptionFeatures?.features.max_collaborators_per_project || 50}
                      value={formData.max_collaborators}
                      onChange={(e) => handleFormChange('max_collaborators', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
            </div>
                </div>

                {/* Cross-border Transfer Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="cross_border_transfers"
                    type="checkbox"
                    checked={formData.cross_border_transfers}
                    onChange={(e) => handleFormChange('cross_border_transfers', e.target.checked)}
                    disabled={!subscriptionFeatures?.features.cross_border_data_sharing}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <div>
                    <label htmlFor="cross_border_transfers" className="text-sm font-medium text-text-primary">
                      Enable Cross-border Data Transfers
                      {!subscriptionFeatures?.features.cross_border_data_sharing && (
                        <Badge variant="yellow" className="ml-2">Upgrade Required</Badge>
                      )}
                    </label>
                    <p className="text-xs text-text-muted">
                      Allows collaboration with researchers outside the EU. Requires additional safeguards.
                    </p>
              </div>
              </div>

                {/* DPIA Warning */}
                {(formData.cross_border_transfers || formData.project_type === 'ai_development') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Data Protection Impact Assessment (DPIA) Required</span>
            </div>
                    <p className="text-blue-700 text-sm">
                      This project configuration requires a DPIA under GDPR Article 35. 
                      The system will automatically generate compliance documentation.
                    </p>
                  </div>
                )}
        </div>

              {/* Research Details */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Research Details
                </h3>

                <div>
                  <label htmlFor="research_area" className="block text-sm font-medium text-text-primary mb-2">
                    Research Area *
                  </label>
                  <select
                    id="research_area"
                    value={formData.research_area}
                    onChange={(e) => handleFormChange('research_area', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select research area</option>
                    <option value="artificial_intelligence">Artificial Intelligence</option>
                    <option value="machine_learning">Machine Learning</option>
                    <option value="natural_language_processing">Natural Language Processing</option>
                    <option value="computer_vision">Computer Vision</option>
                    <option value="robotics">Robotics</option>
                    <option value="data_science">Data Science</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="healthcare_ai">Healthcare AI</option>
                    <option value="climate_tech">Climate Technology</option>
                    <option value="education_technology">Education Technology</option>
                    <option value="autonomous_systems">Autonomous Systems</option>
                  </select>
            </div>

                <div>
                  <label htmlFor="research_questions" className="block text-sm font-medium text-text-primary mb-2">
                    Research Questions
                  </label>
                  <textarea
                    id="research_questions"
                    rows={3}
                    value={formData.research_questions}
                    onChange={(e) => handleFormChange('research_questions', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="What are the main research questions this project aims to answer?"
                  />
          </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="funding_source" className="block text-sm font-medium text-text-primary mb-2">
                      Funding Source
                    </label>
                    <select
                      id="funding_source"
                      value={formData.funding_source}
                      onChange={(e) => handleFormChange('funding_source', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select funding source</option>
                      <option value="academy_of_finland">Academy of Finland</option>
                      <option value="business_finland">Business Finland</option>
                      <option value="horizon_europe">Horizon Europe</option>
                      <option value="university_funding">University Internal Funding</option>
                      <option value="industry_partnership">Industry Partnership</option>
                      <option value="foundation_grant">Foundation Grant</option>
                      <option value="other">Other</option>
                    </select>
            </div>

                  <div>
                    <label htmlFor="expected_duration" className="block text-sm font-medium text-text-primary mb-2">
                      Expected Duration (Months)
                    </label>
                    <input
                      id="expected_duration"
                      type="number"
                      min="1"
                      max="60"
                      value={formData.expected_duration}
                      onChange={(e) => handleFormChange('expected_duration', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
          </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target Institutions
                  </label>
                  <div className="space-y-2">
                    {[
                      'University of Helsinki',
                      'Aalto University',
                      'University of Turku',
                      'Tampere University',
                      'University of Oulu',
                      'LUT University',
                      'VTT Technical Research Centre',
                      'Finnish Meteorological Institute'
                    ].map((institution) => (
                      <label key={institution} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(formData.target_institutions as any[]).includes(institution)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFormChange('target_institutions', [...formData.target_institutions, institution]);
                            } else {
                              handleFormChange('target_institutions', formData.target_institutions.filter(inst => inst !== institution));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <span className="text-sm text-text-primary">{institution}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Data Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Personal Data',
                      'Health Data',
                      'Biometric Data',
                      'Location Data',
                      'Behavioral Data',
                      'Research Data',
                      'Public Data',
                      'Synthetic Data'
                    ].map((dataType) => (
                      <label key={dataType} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(formData.data_types as any[]).includes(dataType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFormChange('data_types', [...formData.data_types, dataType]);
                            } else {
                              handleFormChange('data_types', formData.data_types.filter(type => type !== dataType));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <span className="text-sm text-text-primary">{dataType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="ethical_approval"
                    type="checkbox"
                    checked={formData.ethical_approval}
                    onChange={(e) => handleFormChange('ethical_approval', e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <div>
                    <label htmlFor="ethical_approval" className="text-sm font-medium text-text-primary">
                      Ethical Approval Obtained
                    </label>
                    <p className="text-xs text-text-muted">
                      Check if your project has received ethical approval from the relevant ethics committee
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="data_protection_officer" className="block text-sm font-medium text-text-primary mb-2">
                    Data Protection Officer Contact
                  </label>
                  <input
                    id="data_protection_officer"
                    type="email"
                    value={formData.data_protection_officer}
                    onChange={(e) => handleFormChange('data_protection_officer', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="dpo@university.fi"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Contact information for your institution's Data Protection Officer
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createLoading || !formData.name || formData.name.trim() === ''}
                >
                  {createLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('projects.createProject')}
                    </>
                  )}
                </Button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMembersModal(false);
            }
          }}
        >
          <div 
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 bg-background border border-border shadow-2xl rounded-lg"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Project Members</h2>
                <p className="text-text-secondary">{selectedProject.name}</p>
            </div>
              <div className="flex gap-2">
                {(selectedProject.user_role === 'owner' || selectedProject.user_role === 'admin') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowMembersModal(false);
                      openInviteModal(selectedProject);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Invite
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowMembersModal(false)}
                  className="bg-background border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Close
                </Button>
          </div>
            </div>

            <div className="space-y-4">
              {projectMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-background font-medium">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </span>
            </div>
                    <div>
                      <div className="font-medium text-text-primary">{member.full_name}</div>
                      <div className="text-sm text-text-secondary">{member.email}</div>
                      <div className="text-xs text-text-muted">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
          </div>
        </div>
      </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleColor(member.role) as any}>
                      {member.role}
                    </Badge>
                    {member.consent_provided && (
                      <Badge variant="green">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Consented
                      </Badge>
                    )}
                    {(selectedProject.user_role === 'owner' && member.role !== 'owner') && (
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    )}
    </div>
      </div>
              ))}
              
              {projectMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                  <p className="text-text-secondary">No members found</p>
    </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInviteModal(false);
            }
          }}
        >
          <div 
            className="max-w-lg w-full p-6 bg-background border border-border shadow-2xl rounded-lg"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Invite Collaborator</h2>
                <p className="text-text-secondary">{selectedProject.name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowInviteModal(false)}
                className="bg-background border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-6">
              {/* Error Display */}
              {inviteError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  <AlertTriangle size={16} />
                  <span className="text-sm">{inviteError}</span>
                </div>
              )}

              <div>
                <label htmlFor="invite_email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address *
                </label>
                <input
                  id="invite_email"
                  type="email"
                  required
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="colleague@university.edu"
                />
          </div>

              <div>
                <label htmlFor="invite_role" className="block text-sm font-medium text-text-primary mb-2">
                  Role *
                </label>
                <select
                  id="invite_role"
                  value={inviteFormData.role}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="contributor">Contributor</option>
                  <option value="viewer">Viewer</option>
                  <option value="reviewer">Reviewer</option>
                  {selectedProject.user_role === 'owner' && (
                    <option value="admin">Admin</option>
                  )}
                </select>
                <div className="text-xs text-text-muted mt-1">
                  <strong>Contributor:</strong> Can read, write, and share data<br/>
                  <strong>Viewer:</strong> Read-only access<br/>
                  <strong>Reviewer:</strong> Can review and comment<br/>
                  <strong>Admin:</strong> Can manage members and settings
            </div>
          </div>

              <div>
                <label htmlFor="invite_message" className="block text-sm font-medium text-text-primary mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  id="invite_message"
                  rows={3}
                  value={inviteFormData.message}
                  onChange={(e) => setInviteFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a personal message to the invitation..."
                />
              </div>

              {/* Legal Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Legal Compliance Notice</span>
                </div>
                <p className="text-blue-700 text-sm">
                  The invited user will be asked to provide explicit consent for data sharing and processing 
                  in accordance with GDPR and EU AI Act requirements. They will receive detailed information 
                  about data processing activities and their rights.
                </p>
            </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviteLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={inviteLoading || !inviteFormData.email.trim()}
                >
                  {inviteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
          </div>
            </form>
          </div>
        </div>
      )}

      {/* Demo Version Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-yellow-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Demo Version</span>
        </div>
        <p className="text-center text-yellow-700 text-sm mt-2">
          This is a demonstration version of the Research Projects page. 
          All projects and data are for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}