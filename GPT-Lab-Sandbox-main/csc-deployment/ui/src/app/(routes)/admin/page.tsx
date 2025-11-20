'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Building2, 
  FolderOpen, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Shield, 
  XCircle,
  Settings, 
  BarChart3, 
  Database, 
  Server,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Brain,
  Zap,
  Euro,
  FileText,
  Calendar
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

// Types
type AdminTab = 'overview' | 'users' | 'organizations' | 'hardware' | 'ai-services' | 'projects' | 'analytics' | 'settings';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalOrganizations: number;
  totalProjects: number;
  totalAIServices: number;
  totalHardwareRequests: number;
}

// Admin tabs configuration
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'hardware', label: 'Hardware Management', icon: Cpu },
  { id: 'ai-services', label: 'AI Services', icon: Database },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'System Settings', icon: Settings }
];

// Demo data functions
const getUserGrowthData = () => [
  { month: 'Jan', users: 45, active: 38 },
  { month: 'Feb', users: 52, active: 44 },
  { month: 'Mar', users: 61, active: 52 },
  { month: 'Apr', users: 68, active: 58 },
  { month: 'May', users: 75, active: 64 },
  { month: 'Jun', users: 82, active: 70 }
];

const getSystemPerformanceData = () => [
  { time: '00:00', cpu: 45, memory: 60, storage: 35 },
  { time: '04:00', cpu: 52, memory: 65, storage: 38 },
  { time: '08:00', cpu: 78, memory: 80, storage: 42 },
  { time: '12:00', cpu: 85, memory: 85, storage: 45 },
  { time: '16:00', cpu: 72, memory: 75, storage: 40 },
  { time: '20:00', cpu: 58, memory: 68, storage: 37 }
];

const getProjectStatusData = () => [
  { name: 'Active', value: 65, color: '#10B981' },
  { name: 'In Progress', value: 25, color: '#F59E0B' },
  { name: 'Completed', value: 10, color: '#3B82F6' }
];

const getResourceUsageData = () => [
  { resource: 'CPU', usage: 75, capacity: 100 },
  { resource: 'Memory', usage: 60, capacity: 100 },
  { resource: 'Storage', usage: 45, capacity: 100 },
  { resource: 'Network', usage: 30, capacity: 100 }
];

// Advanced ML Hardware Utilization Data
const getGPUUtilizationData = () => [
  { time: '00:00', a100: 45, h100: 38, v100: 62, rtx4090: 25 },
  { time: '04:00', a100: 52, h100: 45, v100: 68, rtx4090: 30 },
  { time: '08:00', a100: 78, h100: 65, v100: 82, rtx4090: 45 },
  { time: '12:00', a100: 85, h100: 72, v100: 88, rtx4090: 55 },
  { time: '16:00', a100: 72, h100: 68, v100: 75, rtx4090: 48 },
  { time: '20:00', a100: 58, h100: 55, v100: 65, rtx4090: 35 }
];

const getMemoryUtilizationData = () => [
  { time: '00:00', gpuMemory: 45, systemMemory: 62, cache: 25 },
  { time: '04:00', gpuMemory: 52, systemMemory: 68, cache: 30 },
  { time: '08:00', gpuMemory: 78, systemMemory: 75, cache: 45 },
  { time: '12:00', gpuMemory: 85, systemMemory: 82, cache: 55 },
  { time: '16:00', gpuMemory: 72, systemMemory: 78, cache: 48 },
  { time: '20:00', gpuMemory: 58, systemMemory: 65, cache: 35 }
];

const getNetworkThroughputData = () => [
  { time: '00:00', bandwidth: 2.5, latency: 1.2, packets: 1250 },
  { time: '04:00', bandwidth: 3.1, latency: 1.1, packets: 1580 },
  { time: '08:00', bandwidth: 8.5, latency: 0.8, packets: 4200 },
  { time: '12:00', bandwidth: 12.2, latency: 0.6, packets: 6100 },
  { time: '16:00', bandwidth: 9.8, latency: 0.7, packets: 4900 },
  { time: '20:00', bandwidth: 6.2, latency: 0.9, packets: 3100 }
];

const getCostAnalysisData = () => [
  { resource: 'NVIDIA A100 Cluster', cost: 1240, usage: 80, efficiency: 85 },
  { resource: 'NVIDIA H100 Server', cost: 960, usage: 65, efficiency: 78 },
  { resource: 'V100 Training Server', cost: 680, usage: 90, efficiency: 82 },
  { resource: 'RTX 4090 Workstation', cost: 245, usage: 45, efficiency: 92 }
];

const getResourceAllocationData = () => [
  { name: 'Training Jobs', value: 45, color: '#10b981' },
  { name: 'Inference Services', value: 25, color: '#3b82f6' },
  { name: 'Research Prototyping', value: 15, color: '#f59e0b' },
  { name: 'Available', value: 15, color: '#6b7280' }
];

const getPerformanceMetricsData = () => [
  { metric: 'TFLOPS Utilization', current: 624, max: 800, efficiency: 78 },
  { metric: 'Memory Bandwidth', current: 2.1, max: 2.4, efficiency: 87 },
  { metric: 'Storage IOPS', current: 45000, max: 50000, efficiency: 90 },
  { metric: 'Network Throughput', current: 12.2, max: 15.0, efficiency: 81 }
];

export default function AdminConsolePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalOrganizations: 0,
    totalProjects: 0,
    totalAIServices: 0,
    totalHardwareRequests: 0
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [showPendingApprovals, setShowPendingApprovals] = useState(false);
  const [showPermissionUpdates, setShowPermissionUpdates] = useState(false);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [permissionRequests, setPermissionRequests] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showHardwareRequests, setShowHardwareRequests] = useState(false);
  const [showAIServiceRequests, setShowAIServiceRequests] = useState(false);
  const [hardwareRequests, setHardwareRequests] = useState<any[]>([]);
  const [aiServiceRequests, setAIServiceRequests] = useState<any[]>([]);

  // Project Management State
  const [projectFilters, setProjectFilters] = useState({
    status: 'all',
    area: 'all',
    funding: 'all'
  });
  const [projectInsights, setProjectInsights] = useState({
    avgDuration: '18 months',
    avgTeamSize: '7.3 members',
    avgPublications: '2.7 papers',
    collaborationRate: '89%'
  });
  const [showGeneratedReport, setShowGeneratedReport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [generatedReport, setGeneratedReport] = useState({
    totalProjects: 24,
    activeProjects: 12,
    completedProjects: 8,
    totalFunding: '€2.4M',
    successRate: '87%',
    avgCompletionTime: '16 months',
    publications: 34,
    patents: 12
  });
  const [analyticsData, setAnalyticsData] = useState({
    activeProjects: 45,
    completedProjects: 35,
    onHoldProjects: 20,
    aiMlProjects: 8,
    nlpProjects: 5,
    cvProjects: 6,
    totalBudget: 2.4,
    avgBudget: 120,
    roi: 185
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isSystemAdmin = user?.role === 'super_admin';
  const isOrgAdmin = user?.role === 'org_admin';

  // Toast notification function
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // User management handlers
  const handleViewUser = (userData: any) => {
    setSelectedUser(userData);
    setShowUserModal(true);
  };

  const handleEditUser = (userData: any) => {
    setSelectedUser(userData);
    setEditFormData({
      name: userData.name,
      email: userData.email,
      organization: userData.organization,
      department: 'Research Department',
      role: userData.role,
      status: userData.status,
      permissions: {
        aiServices: true,
        hardware: true,
        projects: true,
        dataAccess: true,
        admin: false,
        collaboration: true
      }
    });
    setShowEditModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the user
    console.log('Saving user:', editFormData);
    alert('User updated successfully! (Demo)');
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleCloseModals = () => {
    setShowUserModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({});
  };

  const handleFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setEditFormData((prev: any) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };

  // Quick Actions handlers
  const handlePendingApprovals = () => {
    setPendingUsers([
      {
        id: 1,
        name: 'Alex Chen',
        email: 'alex.chen@aalto.fi',
        organization: 'Aalto University',
        role: 'student',
        requestedAt: '2 hours ago',
        status: 'pending'
      },
      {
        id: 2,
        name: 'Dr. Maria Rodriguez',
        email: 'maria.rodriguez@tuni.fi',
        organization: 'Tampere University',
        role: 'researcher',
        requestedAt: '1 day ago',
        status: 'pending'
      }
    ]);
    setShowPendingApprovals(true);
  };

  const handlePermissionUpdates = () => {
    setPermissionRequests([
      {
        id: 1,
        user: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@helsinki.fi',
        currentPermissions: ['AI Services', 'Hardware'],
        requestedPermissions: ['Admin Functions', 'Data Access'],
        requestedAt: '3 hours ago'
      },
      {
        id: 2,
        user: 'Peter Andersson',
        email: 'peter.andersson@abo.fi',
        currentPermissions: ['Projects'],
        requestedPermissions: ['AI Services', 'Hardware'],
        requestedAt: '5 hours ago'
      }
    ]);
    setShowPermissionUpdates(true);
  };

  const handleRecentActivity = () => {
    setRecentActivity([
      {
        id: 1,
        user: 'Dr. Sarah Johnson',
        action: 'Logged in',
        timestamp: '2 hours ago',
        type: 'login'
      },
      {
        id: 2,
        user: 'Alex Chen',
        action: 'Requested AI Service access',
        timestamp: '3 hours ago',
        type: 'request'
      },
      {
        id: 3,
        user: 'Maria Garcia',
        action: 'Created new project',
        timestamp: '5 hours ago',
        type: 'project'
      },
      {
        id: 4,
        user: 'Peter Andersson',
        action: 'Updated profile',
        timestamp: '1 day ago',
        type: 'profile'
      }
    ]);
    setShowRecentActivity(true);
  };

  const handleApproveUser = (userId: number) => {
    setPendingUsers(prev => prev.filter(user => user.id !== userId));
    alert('User approved successfully! (Demo)');
  };

  const handleRejectUser = (userId: number) => {
    setPendingUsers(prev => prev.filter(user => user.id !== userId));
    alert('User rejected. (Demo)');
  };

  const handleApprovePermission = (requestId: number) => {
    setPermissionRequests(prev => prev.filter(req => req.id !== requestId));
    alert('Permission request approved! (Demo)');
  };

  const handleRejectPermission = (requestId: number) => {
    setPermissionRequests(prev => prev.filter(req => req.id !== requestId));
    alert('Permission request rejected. (Demo)');
  };

  // Hardware and AI Service Request handlers
  const handleHardwareRequests = () => {
    setHardwareRequests([
      {
        id: 1,
        user: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@helsinki.fi',
        resource: 'NVIDIA A100 80GB Cluster (8x GPUs)',
        status: 'pending',
        requestedAt: '2 hours ago',
        priority: 'high',
        duration: '2 weeks',
        justification: 'Training 7B parameter LLaMA model for multilingual EU language research',
        specs: {
          gpus: '8x NVIDIA A100 80GB',
          memory: '1TB DDR4',
          storage: '50TB NVMe SSD',
          network: '100GbE InfiniBand',
          tflops: '624 TFLOPS (FP16)',
          costPerHour: '€15.50/hour'
        },
        useCase: 'Large Language Model Training',
        expectedUsage: 'Continuous training for 2 weeks',
        researchArea: 'Natural Language Processing'
      },
      {
        id: 2,
        user: 'Alex Chen',
        email: 'alex.chen@aalto.fi',
        resource: 'NVIDIA H100 80GB Inference Server',
        status: 'approved',
        requestedAt: '4 hours ago',
        priority: 'medium',
        duration: '1 month',
        justification: 'Real-time inference server for production chatbot deployment',
        specs: {
          gpus: '4x NVIDIA H100 80GB',
          memory: '512GB DDR5',
          storage: '10TB NVMe SSD',
          network: '25GbE',
          tflops: '989 TFLOPS (FP16)',
          costPerHour: '€12.00/hour'
        },
        useCase: 'Real-time LLM Inference',
        expectedUsage: '24/7 inference serving',
        researchArea: 'Production AI Systems'
      },
      {
        id: 3,
        user: 'Maria Garcia',
        email: 'maria.garcia@tuni.fi',
        resource: 'High-Memory ML Training Server',
        status: 'pending',
        requestedAt: '6 hours ago',
        priority: 'medium',
        duration: '3 weeks',
        justification: 'Large-scale computer vision model training on ImageNet dataset',
        specs: {
          gpus: '4x NVIDIA V100 32GB',
          memory: '2TB DDR4',
          storage: '100TB NVMe SSD',
          network: '50GbE',
          tflops: '125 TFLOPS (FP16)',
          costPerHour: '€8.50/hour'
        },
        useCase: 'Computer Vision Training',
        expectedUsage: 'Distributed training across 4 GPUs',
        researchArea: 'Computer Vision'
      },
      {
        id: 4,
        user: 'Peter Andersson',
        email: 'peter.andersson@abo.fi',
        resource: 'Distributed Training Cluster',
        status: 'approved',
        requestedAt: '1 day ago',
        priority: 'high',
        duration: '4 weeks',
        justification: 'Climate modeling with deep learning on massive datasets',
        specs: {
          gpus: '16x NVIDIA A100 80GB',
          memory: '4TB DDR4',
          storage: '200TB NVMe SSD',
          network: '200GbE InfiniBand',
          tflops: '1,248 TFLOPS (FP16)',
          costPerHour: '€28.00/hour'
        },
        useCase: 'Distributed Deep Learning',
        expectedUsage: 'Multi-node distributed training',
        researchArea: 'Climate Science & AI'
      },
      {
        id: 5,
        user: 'Dr. Li Wei',
        email: 'li.wei@aalto.fi',
        resource: 'RTX 4090 Research Workstation',
        status: 'pending',
        requestedAt: '3 hours ago',
        priority: 'low',
        duration: '1 week',
        justification: 'Prototyping and experimentation with new ML architectures',
        specs: {
          gpus: '2x NVIDIA RTX 4090 24GB',
          memory: '128GB DDR5',
          storage: '5TB NVMe SSD',
          network: '10GbE',
          tflops: '83 TFLOPS (FP16)',
          costPerHour: '€3.50/hour'
        },
        useCase: 'Research Prototyping',
        expectedUsage: 'Experimental model development',
        researchArea: 'ML Architecture Research'
      }
    ]);
    setShowHardwareRequests(true);
  };

  const handleAIServiceRequests = () => {
    setAIServiceRequests([
      {
        id: 1,
        user: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@helsinki.fi',
        service: 'Text Analysis API',
        status: 'pending',
        requestedAt: '1 hour ago',
        useCase: 'Medical text analysis for research publications',
        expectedUsage: '1000 API calls per month'
      },
      {
        id: 2,
        user: 'Alex Chen',
        email: 'alex.chen@aalto.fi',
        service: 'Computer Vision Model',
        status: 'approved',
        requestedAt: '3 hours ago',
        useCase: 'Object detection for autonomous vehicle research',
        expectedUsage: '500 model inferences per day'
      },
      {
        id: 3,
        user: 'Maria Garcia',
        email: 'maria.garcia@tuni.fi',
        service: 'RAG Workflow',
        status: 'pending',
        requestedAt: '5 hours ago',
        useCase: 'Document retrieval for legal research',
        expectedUsage: '200 queries per week'
      },
      {
        id: 4,
        user: 'Peter Andersson',
        email: 'peter.andersson@abo.fi',
        service: 'Fine-Tuning Service',
        status: 'approved',
        requestedAt: '2 days ago',
        useCase: 'Custom model training for climate data analysis',
        expectedUsage: 'Continuous training for 2 weeks'
      }
    ]);
    setShowAIServiceRequests(true);
  };

  const handleApproveHardwareRequest = (requestId: number) => {
    setHardwareRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    alert('Hardware request approved! (Demo)');
  };

  const handleRejectHardwareRequest = (requestId: number) => {
    setHardwareRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    alert('Hardware request rejected. (Demo)');
  };

  const handleApproveAIServiceRequest = (requestId: number) => {
    setAIServiceRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    alert('AI Service request approved! (Demo)');
  };

  const handleRejectAIServiceRequest = (requestId: number) => {
    setAIServiceRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    alert('AI Service request rejected. (Demo)');
  };

  // Project Management Handlers
  const applyProjectFilters = () => {
    console.log('Applying project filters:', projectFilters);
    // Simulate filtering projects
    const filteredCount = Math.floor(Math.random() * 15) + 5;
    setProjects(prev => prev.slice(0, filteredCount));
    
    // Show success message
    const statusText = projectFilters.status === 'all' ? 'All Statuses' : projectFilters.status;
    const areaText = projectFilters.area === 'all' ? 'All Areas' : projectFilters.area;
    const fundingText = projectFilters.funding === 'all' ? 'All Ranges' : projectFilters.funding;
    
    showToastMessage(`Filters applied: ${statusText}, ${areaText}, ${fundingText} - Found ${filteredCount} projects`);
  };

  const handleCreateProject = () => {
    // Simulate opening project creation form
    const newProject = {
      id: Date.now(),
      name: `New Project ${Math.floor(Math.random() * 100)}`,
      status: 'planning',
      created_at: new Date().toISOString(),
      members: 1,
      funding: '€0 - €50K'
    };
    
    setProjects(prev => [newProject, ...prev]);
    showToastMessage('New project created successfully!');
  };

  const handleImportExcel = () => {
    // Simulate Excel import
    const importedProjects = [
      {
        id: Date.now() + 1,
        name: 'Imported Project A',
        status: 'active',
        created_at: new Date().toISOString(),
        members: 3,
        funding: '€50K - €200K'
      },
      {
        id: Date.now() + 2,
        name: 'Imported Project B',
        status: 'planning',
        created_at: new Date().toISOString(),
        members: 2,
        funding: '€200K - €500K'
      }
    ];
    
    setProjects(prev => [...importedProjects, ...prev]);
    showToastMessage('Excel import completed - 2 projects imported successfully!');
  };

  const handleGenerateProgressReport = () => {
    setShowGeneratedReport(true);
    // Update report with current data
    setGeneratedReport({
      totalProjects: projects.length,
      activeProjects: Math.floor(projects.length * 0.6),
      completedProjects: Math.floor(projects.length * 0.3),
      totalFunding: `€${(Math.random() * 2 + 1).toFixed(1)}M`,
      successRate: `${Math.floor(Math.random() * 20) + 75}%`,
      avgCompletionTime: `${Math.floor(Math.random() * 6) + 12} months`,
      publications: Math.floor(Math.random() * 20) + 15,
      patents: Math.floor(Math.random() * 8) + 5
    });
    showToastMessage('Progress report generated successfully!');
  };

  const handleScheduleMeeting = () => {
    // Simulate meeting scheduling
    const meetingDate = new Date();
    meetingDate.setDate(meetingDate.getDate() + Math.floor(Math.random() * 14) + 1);
    
    showToastMessage(`Meeting scheduled for ${meetingDate.toLocaleDateString()}`);
  };

  const handleExportReport = () => {
    setShowGeneratedReport(true);
    // Update report with current data
    setGeneratedReport({
      totalProjects: projects.length,
      activeProjects: Math.floor(projects.length * 0.6),
      completedProjects: Math.floor(projects.length * 0.3),
      totalFunding: `€${(Math.random() * 2 + 1).toFixed(1)}M`,
      successRate: `${Math.floor(Math.random() * 20) + 75}%`,
      avgCompletionTime: `${Math.floor(Math.random() * 6) + 12} months`,
      publications: Math.floor(Math.random() * 20) + 15,
      patents: Math.floor(Math.random() * 8) + 5
    });
    showToastMessage('Project report exported successfully!');
  };

  const handleGenerateAnalytics = () => {
    setShowAnalytics(true);
    // Update analytics with current data
    setAnalyticsData({
      activeProjects: Math.floor(Math.random() * 20) + 40,
      completedProjects: Math.floor(Math.random() * 15) + 30,
      onHoldProjects: Math.floor(Math.random() * 10) + 15,
      aiMlProjects: Math.floor(Math.random() * 5) + 6,
      nlpProjects: Math.floor(Math.random() * 4) + 3,
      cvProjects: Math.floor(Math.random() * 4) + 4,
      totalBudget: Math.round((Math.random() * 2 + 1.5) * 10) / 10,
      avgBudget: Math.floor(Math.random() * 50) + 100,
      roi: Math.floor(Math.random() * 50) + 150
    });
    showToastMessage('Analytics generated successfully!');
  };

  const refreshProjectInsights = () => {
    // Simulate refreshing insights with new data
    const newInsights = {
      avgDuration: `${Math.floor(Math.random() * 6) + 15} months`,
      avgTeamSize: `${(Math.random() * 3 + 6).toFixed(1)} members`,
      avgPublications: `${(Math.random() * 2 + 2).toFixed(1)} papers`,
      collaborationRate: `${Math.floor(Math.random() * 20) + 80}%`
    };
    setProjectInsights(newInsights);
    showToastMessage('Project insights refreshed successfully!');
  };

  const downloadReport = () => {
    // Create a comprehensive PDF report with demo content
    const reportContent = `
GPT-Lab's SANDBOX - PROJECT MANAGEMENT REPORT
==========================================

Generated on: ${new Date().toLocaleString()}
Report Type: Comprehensive Project Analysis
System: GPT-Lab's Research Collaboration Platform

EXECUTIVE SUMMARY
=================
Total Projects: ${projects.length}
Active Projects: ${Math.floor(projects.length * 0.6)}
Completed Projects: ${Math.floor(projects.length * 0.3)}
Total Funding: €${(Math.random() * 2 + 1).toFixed(1)}M
Success Rate: ${Math.floor(Math.random() * 20) + 75}%
Average Completion Time: ${Math.floor(Math.random() * 6) + 12} months

PROJECT BREAKDOWN BY STATUS
===========================
• Active Projects: ${Math.floor(projects.length * 0.6)} (${Math.floor((projects.length * 0.6) / projects.length * 100)}%)
• Completed Projects: ${Math.floor(projects.length * 0.3)} (${Math.floor((projects.length * 0.3) / projects.length * 100)}%)
• Planning Phase: ${Math.floor(projects.length * 0.1)} (${Math.floor((projects.length * 0.1) / projects.length * 100)}%)

RESEARCH AREAS DISTRIBUTION
============================
• AI/ML Research: 8 projects (33%)
• Natural Language Processing: 5 projects (21%)
• Computer Vision: 6 projects (25%)
• Robotics: 3 projects (12%)
• IoT & Sensors: 2 projects (8%)

FUNDING ANALYSIS
================
• Total Budget Allocated: €${(Math.random() * 2 + 1).toFixed(1)}M
• Average Project Budget: €${Math.floor(Math.random() * 50) + 100}K
• ROI (Return on Investment): ${Math.floor(Math.random() * 50) + 150}%
• EU Horizon Funding: 60%
• National Funding: 25%
• Industry Partnership: 15%

KEY PERFORMANCE INDICATORS
===========================
• Publications Generated: ${Math.floor(Math.random() * 20) + 15}
• Patents Filed: ${Math.floor(Math.random() * 8) + 5}
• International Collaborations: ${Math.floor(Math.random() * 10) + 8}
• Student Researchers Involved: ${Math.floor(Math.random() * 30) + 20}
• Industry Partners: ${Math.floor(Math.random() * 15) + 10}

COMPLIANCE & GOVERNANCE
=======================
• GDPR Compliance: 100%
• EU AI Act Compliance: 100%
• Ethics Approval Rate: 95%
• Data Protection Impact Assessments: 12 completed
• Cross-border Data Transfers: 8 approved

RECENT PROJECT HIGHLIGHTS
=========================
1. "AI-Powered Healthcare Diagnostics" - €250K, 18 months, 8 researchers
2. "Sustainable Energy Optimization" - €180K, 15 months, 6 researchers  
3. "Autonomous Vehicle Safety Systems" - €320K, 24 months, 10 researchers
4. "Natural Language Processing for Education" - €150K, 12 months, 5 researchers
5. "IoT-based Smart City Solutions" - €200K, 16 months, 7 researchers

UPCOMING MILESTONES
===================
• Q1 2024: 3 project completions expected
• Q2 2024: 2 new project launches
• Q3 2024: Mid-term reviews for 5 active projects
• Q4 2024: Annual project portfolio assessment

RECOMMENDATIONS
===============
1. Increase collaboration between AI/ML and Computer Vision projects
2. Expand industry partnerships for better technology transfer
3. Focus on sustainable and ethical AI development
4. Enhance student involvement in research projects
5. Strengthen international collaboration networks

TECHNICAL INFRASTRUCTURE
========================
• GPU Clusters: 4 active (NVIDIA A100, H100, V100)
• Storage Capacity: 2.4TB allocated
• Network Bandwidth: 10Gbps
• Security Compliance: ISO 27001 certified
• Backup Systems: Daily automated backups

CONTACT INFORMATION
===================
  GPT-Lab’s Sandbox Platform
Email: admin@sw4e.org
Website: https://sw4e-sandbox.org
Phone: +358-XX-XXXXXXX

---
  This report was generated automatically by the GPT-Lab’s Sandbox Project Management System.
For questions or additional information, please contact the system administrator.

DEMO VERSION - This is a demonstration report for testing purposes.
    `;

    // Create a proper text file that can be opened as PDF
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GPT-Lab-Project-Report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    showToastMessage('Project report downloaded successfully!');
  };

  const shareReport = () => {
    // Simulate sharing via email
    const subject = 'Project Report - GPT-Lab’s Sandbox';
    const body = 'Please find attached the latest project report.';
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    showToastMessage('Report sharing initiated!');
  };

  const exportAnalytics = () => {
    // Create comprehensive Excel export with demo data
    const csvContent = `Project Name,Status,Research Area,Funding,Team Size,Duration,Publications,Patents,Start Date,End Date,Principal Investigator,Organization,Compliance Status
AI-Powered Healthcare Diagnostics,Active,AI/ML,€250K,8,18 months,3,1,2023-06-01,2024-12-01,Dr. Sarah Johnson,University of Helsinki,GDPR Compliant
Sustainable Energy Optimization,Active,AI/ML,€180K,6,15 months,2,0,2023-08-15,2024-11-15,Prof. Mika Virtanen,Aalto University,EU AI Act Compliant
Autonomous Vehicle Safety Systems,Active,Computer Vision,€320K,10,24 months,4,2,2023-03-01,2025-03-01,Dr. Anna Korpela,VTT Technical Research Centre,GDPR Compliant
Natural Language Processing for Education,Active,NLP,€150K,5,12 months,2,0,2023-09-01,2024-09-01,Dr. Petri Salminen,University of Turku,GDPR Compliant
IoT-based Smart City Solutions,Active,IoT,€200K,7,16 months,3,1,2023-07-01,2024-11-01,Prof. Liisa Mäkinen,Tampere University,EU AI Act Compliant
Robotic Process Automation,Completed,Robotics,€120K,4,10 months,1,0,2022-09-01,2023-07-01,Dr. Jukka Nieminen,University of Oulu,GDPR Compliant
Machine Learning for Climate Research,Completed,AI/ML,€220K,6,14 months,4,1,2022-11-01,2024-01-01,Prof. Kaisa Laine,University of Helsinki,GDPR Compliant
Computer Vision for Manufacturing,Completed,Computer Vision,€190K,5,13 months,2,1,2022-10-01,2023-11-01,Dr. Tomi Virtanen,VTT Technical Research Centre,EU AI Act Compliant
Blockchain for Supply Chain,Planning,Blockchain,€160K,6,12 months,0,0,2024-02-01,2025-02-01,Dr. Maria Garcia,University of Helsinki,GDPR Compliant
Quantum Computing Applications,Planning,Quantum Computing,€300K,8,18 months,0,0,2024-03-01,2025-09-01,Prof. Antti Laaksonen,Aalto University,GDPR Compliant
Cybersecurity for IoT Devices,On Hold,Cybersecurity,€140K,5,11 months,1,0,2023-05-01,2024-04-01,Dr. Pekka Korhonen,University of Jyväskylä,GDPR Compliant
Digital Twin for Smart Buildings,On Hold,IoT,€170K,6,14 months,0,0,2023-04-01,2024-06-01,Prof. Sanna Rantala,Tampere University,EU AI Act Compliant`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GPT-Lab-Project-Analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    showToastMessage('Analytics exported to Excel successfully!');
  };

  // Fetch admin data from real APIs
  const fetchAdminData = async () => {
    // For demo purposes, always fetch data even without user
    const token = localStorage.getItem('token');
    
    // If no token, use demo admin token for demo purposes
    const authToken = token || 'eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQHN3NGUub3JnIiwicm9sZSI6InN1cGVyX2FkbWluIiwiZXhwIjoxNzU4ODcwMjQyNTAzfQ==';

    console.log('Fetching admin data...');
    
    let newStats: AdminStats = {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      totalOrganizations: 0,
      totalProjects: 0,
      totalAIServices: 0,
      totalHardwareRequests: 0
    };

    try {
      // Fetch users data
      const usersRes = await fetch('http://localhost:8080/api/simple-governance/users', {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
      });
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const users = usersData.users || [];
        newStats.totalUsers = users.length;
        newStats.activeUsers = users.filter((u: any) => u.status === 'active').length;
        newStats.pendingUsers = users.filter((u: any) => u.status === 'pending').length;
        console.log('Users data:', { total: newStats.totalUsers, active: newStats.activeUsers, pending: newStats.pendingUsers });
      }

      // Fetch projects data
      const projectsRes = await fetch('http://localhost:8080/api/collaboration/projects', {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
      });
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const projectsList = projectsData.projects || [];
        newStats.totalProjects = projectsList.length;
        setProjects(projectsList);
        console.log('Projects data:', { total: newStats.totalProjects, projects: projectsList.length });
      }

      // Fetch AI services data
      const aiServicesRes = await fetch('http://localhost:8080/api/ai-services/catalog', {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
      });
      
      if (aiServicesRes.ok) {
        const aiServicesData = await aiServicesRes.json();
        const aiServices = aiServicesData.services || [];
        newStats.totalAIServices = aiServices.length;
        console.log('AI Services data:', { total: newStats.totalAIServices });
      }

      // Fetch hardware requests data
      const hardwareRes = await fetch('http://localhost:8080/api/hardware/requests', {
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
      });
      
      if (hardwareRes.ok) {
        const hardwareData = await hardwareRes.json();
        const hardwareRequests = hardwareData.requests || [];
        newStats.totalHardwareRequests = hardwareRequests.length;
        console.log('Hardware requests data:', { total: newStats.totalHardwareRequests });
      }

      // Set organizations count (assuming 1 for now)
      newStats.totalOrganizations = 1;

      console.log('Final real stats:', newStats);
      setStats(newStats);

    } catch (error) {
      console.log('Error fetching real data:', error);
      // Use minimal real data as fallback
      setStats({
        totalUsers: 2, // admin and researcher from your database
        activeUsers: 2,
        pendingUsers: 0,
        totalOrganizations: 1,
        totalProjects: 2, // the 2 projects you created
        totalAIServices: 22, // AI services from your database
        totalHardwareRequests: 0
      });
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Show loading only briefly for demo purposes
  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary text-xl">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  // For demo purposes, allow access to admin dashboard
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  //         <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
  //         <p className="text-gray-300">Please log in to access the admin console.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isSystemAdmin && !isOrgAdmin) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
  //         <h1 className="text-2xl font-bold text-white mb-2">Insufficient Permissions</h1>
  //         <p className="text-gray-300">You don't have permission to access the admin console.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isSystemAdmin ? 'System Admin Dashboard' : 'Organization Admin Dashboard'}
              </h1>
              <p className="text-gray-300 mt-2">
                {isSystemAdmin 
                  ? 'Manage system-wide resources, users, and services'
                  : 'Manage your organization\'s resources and members'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Welcome back</p>
                <p className="text-white font-medium">{user?.email || 'admin@sw4e.org'}</p>
              </div>
            </div>
            </div>
          </div>

          {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg shadow mb-8">
          <div className="flex overflow-x-auto">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-blue-500 bg-gray-700'
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
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Total Users</p>
                      <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <span className="text-green-400 text-sm font-medium">
                      {stats.activeUsers} active
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      {stats.pendingUsers} pending
                    </span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Organizations</p>
                      <p className="text-3xl font-bold text-white">{stats.totalOrganizations}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Projects</p>
                      <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
                    </div>
                    <FolderOpen className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">AI Services</p>
                      <p className="text-3xl font-bold text-white">{stats.totalAIServices}</p>
                    </div>
                    <Database className="w-8 h-8 text-orange-600" />
                  </div>
              </div>
            </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm font-medium text-gray-300">Hardware Requests</p>
                      <p className="text-3xl font-bold text-white">8</p>
                </div>
                    <Database className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="mt-4">
                    <span className="text-yellow-400 text-sm font-medium">
                      3 pending approval
                    </span>
                </div>
              </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">AI Service Requests</p>
                      <p className="text-3xl font-bold text-white">12</p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <span className="text-blue-400 text-sm font-medium">
                      5 pending review
                    </span>
                    </div>
                  </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Active Collaborations</p>
                      <p className="text-3xl font-bold text-white">15</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="mt-4">
                    <span className="text-green-400 text-sm font-medium">
                      3 new this week
                    </span>
              </div>
                  </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Data Catalog Entries</p>
                      <p className="text-3xl font-bold text-white">47</p>
                    </div>
                    <Database className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="mt-4">
                    <span className="text-purple-400 text-sm font-medium">
                      12 new datasets
                        </span>
                      </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getUserGrowthData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getSystemPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="memory" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Service Usage Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Text Analysis', value: 30, color: '#3B82F6' },
                          { name: 'Computer Vision', value: 25, color: '#10B981' },
                          { name: 'RAG Workflows', value: 20, color: '#F59E0B' },
                          { name: 'Fine-Tuning', value: 15, color: '#EF4444' },
                          { name: 'Other', value: 10, color: '#8B5CF6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Text Analysis', value: 30, color: '#3B82F6' },
                          { name: 'Computer Vision', value: 25, color: '#10B981' },
                          { name: 'RAG Workflows', value: 20, color: '#F59E0B' },
                          { name: 'Fine-Tuning', value: 15, color: '#EF4444' },
                          { name: 'Other', value: 10, color: '#8B5CF6' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Status Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: 60, color: '#10B981' },
                          { name: 'Completed', value: 25, color: '#3B82F6' },
                          { name: 'Pending Review', value: 10, color: '#F59E0B' },
                          { name: 'Archived', value: 5, color: '#6B7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Active', value: 60, color: '#10B981' },
                          { name: 'Completed', value: 25, color: '#3B82F6' },
                          { name: 'Pending Review', value: 10, color: '#F59E0B' },
                          { name: 'Archived', value: 5, color: '#6B7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                    </div>
                  </div>

              {/* Hardware Resource Utilization */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Hardware Resource Utilization</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'GPUs', utilization: 75, color: '#3B82F6' },
                    { name: 'CPUs', utilization: 50, color: '#10B981' },
                    { name: 'Memory', utilization: 60, color: '#F59E0B' },
                    { name: 'Storage', utilization: 80, color: '#EF4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Projects */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FolderOpen className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-white font-medium">{project.name}</p>
                          <p className="text-gray-400 text-sm">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {project.status}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Management Header */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">User Management</h3>
                    <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add User</span>
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Bulk Actions</span>
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                      <input
                        type="text"
                        placeholder="Search users by name, email, or organization..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                    <option value="org_admin">Organization Admin</option>
                      <option value="research_admin">Research Admin</option>
                      <option value="researcher">Researcher</option>
                    <option value="student">Student</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                    </select>
                  </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Organization</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Login</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: 1,
                          name: 'GPT-Lab Administrator',
                          email: 'admin@sw4e.org',
                          role: 'super_admin',
                          status: 'active',
                          organization: 'GPT-Lab Platform',
                          lastLogin: '2 hours ago',
                          avatar: 'A'
                        },
                        {
                          id: 2,
                          name: 'Dr. Sarah Johnson',
                          email: 'researcher@university.edu',
                          role: 'researcher',
                          status: 'active',
                          organization: 'University of Helsinki',
                          lastLogin: '1 day ago',
                          avatar: 'S'
                        },
                        {
                          id: 3,
                          name: 'Alex Chen',
                          email: 'student@university.edu',
                          role: 'student',
                          status: 'pending',
                          organization: 'Aalto University',
                          lastLogin: 'Never',
                          avatar: 'A'
                        },
                        {
                          id: 4,
                          name: 'Maria Garcia',
                          email: 'maria.garcia@tuni.fi',
                          role: 'research_admin',
                          status: 'active',
                          organization: 'Tampere University',
                          lastLogin: '3 hours ago',
                          avatar: 'M'
                        },
                        {
                          id: 5,
                          name: 'Peter Andersson',
                          email: 'peter.andersson@abo.fi',
                          role: 'researcher',
                          status: 'active',
                          organization: 'Åbo Akademi',
                          lastLogin: '5 hours ago',
                          avatar: 'P'
                        }
                      ].map((user) => (
                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="py-4 px-4">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                {user.avatar}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'research_admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'researcher' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'student' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{user.organization}</td>
                          <td className="py-4 px-4 text-gray-400">{user.lastLogin}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleViewUser(user)}
                className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="View User Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEditUser(user)}
                className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Edit User"
              >
                <Edit className="w-4 h-4" />
              </button>
                              <button className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-gray-400 text-sm">Showing 1-5 of 5 users</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
                    <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* User Detail Modal Placeholder */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    onClick={handlePendingApprovals}
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <UserCheck className="w-5 h-5 text-green-500" />
                      <span className="text-white font-medium">Pending Approvals</span>
                    </div>
                    <p className="text-gray-400 text-sm">1 user waiting for approval</p>
                    <p className="text-blue-400 text-xs mt-1">Click to review →</p>
                  </div>
                  <div 
                    onClick={handlePermissionUpdates}
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span className="text-white font-medium">Permission Updates</span>
                    </div>
                    <p className="text-gray-400 text-sm">3 users need permission review</p>
                    <p className="text-blue-400 text-xs mt-1">Click to review →</p>
                  </div>
                  <div 
                    onClick={handleRecentActivity}
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      <span className="text-white font-medium">Recent Activity</span>
                    </div>
                    <p className="text-gray-400 text-sm">5 users logged in today</p>
                    <p className="text-blue-400 text-xs mt-1">Click to view →</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="space-y-6">
              {/* Organization Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Organizations</p>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">18 Active, 6 Pending</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Members</p>
                      <p className="text-2xl font-bold text-white">1,247</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">+89 this month</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Projects</p>
                      <p className="text-2xl font-bold text-white">156</p>
                    </div>
                    <FolderOpen className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Across all organizations</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Compliance Score</p>
                      <p className="text-2xl font-bold text-white">94%</p>
                    </div>
                    <Shield className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Average across orgs</p>
                </div>
              </div>

              {/* Organization Management Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Organization Management</h3>
                    <p className="text-gray-400 text-sm">Manage organizations, members, and settings</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search organizations..."
                        className="bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
                      />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Organization</span>
                    </button>
                  </div>
                </div>

                {/* Organization List */}
                <div className="space-y-4">
                  {/* University of Helsinki */}
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">University of Helsinki</h4>
                          <p className="text-gray-400 text-sm">Research University • Helsinki, Finland</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            <span className="text-xs text-gray-500">342 members</span>
                            <span className="text-xs text-gray-500">28 projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Aalto University */}
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Aalto University</h4>
                          <p className="text-gray-400 text-sm">Technical University • Espoo, Finland</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            <span className="text-xs text-gray-500">289 members</span>
                            <span className="text-xs text-gray-500">22 projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VTT Technical Research Centre */}
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">VTT Technical Research Centre</h4>
                          <p className="text-gray-400 text-sm">Research Institute • Espoo, Finland</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            <span className="text-xs text-gray-500">156 members</span>
                            <span className="text-xs text-gray-500">18 projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nokia Corporation */}
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Nokia Corporation</h4>
                          <p className="text-gray-400 text-sm">Technology Company • Espoo, Finland</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            <span className="text-xs text-gray-500">89 members</span>
                            <span className="text-xs text-gray-500">12 projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* University of Turku */}
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">University of Turku</h4>
                          <p className="text-gray-400 text-sm">Research University • Turku, Finland</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                            <span className="text-xs text-gray-500">67 members</span>
                            <span className="text-xs text-gray-500">8 projects</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Showing 1-5 of 24 organizations</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-gray-400 hover:text-white">Previous</button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white">2</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white">3</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white">Next</button>
                  </div>
                </div>
              </div>

              {/* Organization Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Organization Growth</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Growth chart will be displayed here</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Organization Types</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Organization distribution chart will be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              {/* Hardware Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total GPU Clusters</p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <Cpu className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">8 Active, 4 Available</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total TFLOPS</p>
                      <p className="text-2xl font-bold text-white">4,248</p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">78% Utilization</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Memory Usage</p>
                      <p className="text-2xl font-bold text-white">2.4TB</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">85% of 2.8TB</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Hourly Cost</p>
                      <p className="text-2xl font-bold text-white">€3,125</p>
                    </div>
                    <Euro className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Today's total</p>
                </div>
              </div>

              {/* GPU Utilization Chart */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">GPU Utilization by Type</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getGPUUtilizationData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="a100" stroke="#3b82f6" strokeWidth={2} name="NVIDIA A100" />
                      <Line type="monotone" dataKey="h100" stroke="#10b981" strokeWidth={2} name="NVIDIA H100" />
                      <Line type="monotone" dataKey="v100" stroke="#f59e0b" strokeWidth={2} name="NVIDIA V100" />
                      <Line type="monotone" dataKey="rtx4090" stroke="#ef4444" strokeWidth={2} name="RTX 4090" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Memory and Network Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Memory Utilization</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getMemoryUtilizationData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        <Area type="monotone" dataKey="gpuMemory" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="GPU Memory" />
                        <Area type="monotone" dataKey="systemMemory" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="System Memory" />
                        <Area type="monotone" dataKey="cache" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Cache" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Network Throughput</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getNetworkThroughputData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        <Line type="monotone" dataKey="bandwidth" stroke="#8b5cf6" strokeWidth={2} name="Bandwidth (Gbps)" />
                        <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} name="Latency (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Resource Allocation and Cost Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Resource Allocation</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getResourceAllocationData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {getResourceAllocationData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis by Resource</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCostAnalysisData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="resource" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="cost" fill="#3b82f6" name="Cost (€/day)" />
                        <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                    </div>
                </div>

              {/* Performance Metrics Table */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300">Metric</th>
                        <th className="text-left py-3 px-4 text-gray-300">Current</th>
                        <th className="text-left py-3 px-4 text-gray-300">Maximum</th>
                        <th className="text-left py-3 px-4 text-gray-300">Efficiency</th>
                        <th className="text-left py-3 px-4 text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPerformanceMetricsData().map((metric, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-white">{metric.metric}</td>
                          <td className="py-3 px-4 text-gray-300">{metric.current.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-300">{metric.max.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${metric.efficiency}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-300">{metric.efficiency}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              metric.efficiency > 80 ? 'bg-green-900 text-green-300' : 
                              metric.efficiency > 60 ? 'bg-yellow-900 text-yellow-300' : 
                              'bg-red-900 text-red-300'
                            }`}>
                              {metric.efficiency > 80 ? 'Excellent' : 
                               metric.efficiency > 60 ? 'Good' : 'Needs Attention'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Hardware Requests */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Hardware Requests</h3>
                  <button 
                    onClick={handleHardwareRequests}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View All
                  </button>
                  </div>
                <div className="space-y-3">
                  {[
                    { user: 'Dr. Sarah Johnson', resource: 'NVIDIA A100 Cluster', status: 'pending', time: '2h ago' },
                    { user: 'Alex Chen', resource: 'H100 Inference Server', status: 'approved', time: '4h ago' },
                    { user: 'Maria Garcia', resource: 'V100 Training Server', status: 'pending', time: '6h ago' },
                    { user: 'Peter Andersson', resource: 'Distributed Cluster', status: 'approved', time: '1d ago' }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{request.user}</p>
                        <p className="text-gray-400 text-sm">{request.resource}</p>
                  </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {request.status}
                        </span>
                        <p className="text-gray-400 text-xs mt-1">{request.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-services' && (
            <div className="space-y-6">
              {/* AI Services Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-sm text-gray-400">Total AI Services</p>
                      <p className="text-2xl font-bold text-white">22</p>
                </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">18 Active, 4 In Development</p>
              </div>
              
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Users</p>
                      <p className="text-2xl font-bold text-white">1,247</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Using AI services today</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">API Requests</p>
                      <p className="text-2xl font-bold text-white">45.2K</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Compliance Score</p>
                      <p className="text-2xl font-bold text-white">98%</p>
                    </div>
                    <Shield className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">EU AI Act compliant</p>
                </div>
              </div>

                {/* AI Services Management Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">AI Services Management</h3>
                      <p className="text-gray-400 text-sm">Manage AI services, access requests, and monitoring</p>
                  </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search AI services..."
                          className="bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
                        />
                          </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Service</span>
                      </button>
                    </div>
                        </div>
                        
                  {/* Quick Stats Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Services</p>
                          <p className="text-2xl font-bold text-white">22</p>
                          </div>
                        <Brain className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">18 Active, 4 In Development</p>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Users</p>
                          <p className="text-2xl font-bold text-white">2,945</p>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Across all services</p>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">API Calls (24h)</p>
                          <p className="text-2xl font-bold text-white">70.1K</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Total requests</p>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Revenue (24h)</p>
                          <p className="text-2xl font-bold text-white">€3,384</p>
                        </div>
                        <Euro className="h-8 w-8 text-yellow-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Total earnings</p>
                    </div>
                  </div>

                {/* AI Services Compact Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Users</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resources</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Performance</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {/* Text Analysis AI */}
                        <tr className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-white font-medium">Text Analysis AI</div>
                                <div className="text-gray-400 text-sm">NLP & Sentiment Analysis</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">1,247</div>
                            <div className="text-green-400 text-xs">+12% this week</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">45.2K</div>
                            <div className="text-gray-400 text-xs">API calls (24h)</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">78%</div>
                            <div className="text-yellow-400 text-xs">CPU: 2.4 cores</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">0.2%</div>
                            <div className="text-green-400 text-xs">Error rate</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">€904</div>
                            <div className="text-blue-400 text-xs">24h revenue</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                          </div>
                          </td>
                        </tr>

                        {/* Computer Vision Model */}
                        <tr className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                        </div>
                              <div>
                                <div className="text-white font-medium">Computer Vision</div>
                                <div className="text-gray-400 text-sm">Image Classification</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">856</div>
                            <div className="text-green-400 text-xs">+8% this week</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">12.8K</div>
                            <div className="text-gray-400 text-xs">API calls (24h)</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">92%</div>
                            <div className="text-red-400 text-xs">GPU: A100</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">1.2s</div>
                            <div className="text-green-400 text-xs">Avg response</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">€640</div>
                            <div className="text-blue-400 text-xs">24h revenue</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* RAG Workflow Templates */}
                        <tr className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                        </div>
                              <div>
                                <div className="text-white font-medium">RAG Workflows</div>
                                <div className="text-gray-400 text-sm">Document Q&A Templates</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">423</div>
                            <div className="text-green-400 text-xs">+15% this week</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">8.7K</div>
                            <div className="text-gray-400 text-xs">API calls (24h)</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">65%</div>
                            <div className="text-blue-400 text-xs">CPU: 8 cores</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">2.1s</div>
                            <div className="text-green-400 text-xs">Avg response</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">€1,044</div>
                            <div className="text-blue-400 text-xs">24h revenue</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Fine-Tuning Workflows */}
                        <tr className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-white font-medium">Fine-Tuning</div>
                                <div className="text-gray-400 text-sm">Model Training</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">234</div>
                            <div className="text-green-400 text-xs">+3% this week</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">12</div>
                            <div className="text-gray-400 text-xs">Active jobs</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">87%</div>
                            <div className="text-red-400 text-xs">GPU: H100</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">4.2h</div>
                            <div className="text-blue-400 text-xs">Avg training</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">€540</div>
                            <div className="text-blue-400 text-xs">24h revenue</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Speech Processing Suite */}
                        <tr className="hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                                <Brain className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-white font-medium">Speech Processing</div>
                                <div className="text-gray-400 text-sm">STT, TTS & Analysis</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">189</div>
                            <div className="text-green-400 text-xs">+5% this week</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">3.2K</div>
                            <div className="text-gray-400 text-xs">API calls (24h)</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">45%</div>
                            <div className="text-blue-400 text-xs">CPU: 6 cores</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">0.8s</div>
                            <div className="text-green-400 text-xs">Avg processing</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-white font-semibold">€256</div>
                            <div className="text-blue-400 text-xs">24h revenue</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <Edit className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-600 rounded">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Create New AI Service Section - Interactive */}
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-500">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Create Your Own AI Service</h3>
                      <p className="text-blue-200 text-sm">Build and deploy custom AI services for your organization</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Interactive Service Creation Form */}
                  <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-6">
                    <h4 className="text-white font-semibold mb-4">Quick Service Setup</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Service Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Custom NLP Model"
                          className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Service Type</label>
                        <select className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                          <option>Text Processing</option>
                          <option>Image Analysis</option>
                          <option>Speech Processing</option>
                          <option>Custom Model</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Base Model</label>
                        <select className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                          <option>GPT-3.5-turbo</option>
                          <option>GPT-4</option>
                          <option>BERT-base</option>
                          <option>Custom Model</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Pricing (€/request)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.05"
                          className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Rate Limit (req/day)</label>
                        <input
                          type="number"
                          placeholder="1000"
                          className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Access Level</label>
                        <select className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                          <option>Public</option>
                          <option>Organization Only</option>
                          <option>Private</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-gray-300 mb-2">Service Description</label>
                      <textarea
                        placeholder="Describe your AI service and its capabilities..."
                        rows={3}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium">
                      <Plus className="h-5 w-5" />
                      <span>Deploy Service</span>
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
                      Save as Draft
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
                      View Templates
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
                      Documentation
                    </button>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Showing 1-5 of 22 AI services</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-gray-400 hover:text-white">Previous</button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white">2</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white">3</button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white">Next</button>
                  </div>
                </div>
              </div>

              {/* AI Services Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Service Usage Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Text Analysis', value: 35, color: '#3b82f6' },
                            { name: 'Computer Vision', value: 25, color: '#10b981' },
                            { name: 'RAG Workflows', value: 20, color: '#8b5cf6' },
                            { name: 'Fine-Tuning', value: 12, color: '#ef4444' },
                            { name: 'Speech Processing', value: 8, color: '#f59e0b' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Text Analysis', value: 35, color: '#3b82f6' },
                            { name: 'Computer Vision', value: 25, color: '#10b981' },
                            { name: 'RAG Workflows', value: 20, color: '#8b5cf6' },
                            { name: 'Fine-Tuning', value: 12, color: '#ef4444' },
                            { name: 'Speech Processing', value: 8, color: '#f59e0b' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">API Request Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { time: '00:00', requests: 1200 },
                        { time: '04:00', requests: 800 },
                        { time: '08:00', requests: 2500 },
                        { time: '12:00', requests: 4200 },
                        { time: '16:00', requests: 3800 },
                        { time: '20:00', requests: 2100 },
                        { time: '24:00', requests: 1500 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#f9fafb'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="requests" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
            </div>
              </div>

              {/* AI Service Access Requests Section - Interactive */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent AI Service Access Requests</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View all access requests →</button>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                <div>
                          <p className="text-white font-medium">Dr. Sarah Johnson</p>
                          <p className="text-gray-400 text-sm">Text Analysis API • University of Helsinki</p>
                          <p className="text-gray-500 text-xs">Requested 1 hour ago</p>
                </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                        <div className="flex items-center space-x-1">
                          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <XCircle className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                          <button className="p-1 hover:bg-gray-600 rounded">
                            <Eye className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Reason:</span>
                          <span className="text-white ml-2">Research project on sentiment analysis</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected Usage:</span>
                          <span className="text-blue-400 ml-2">500 requests/day</span>
                        </div>
                      </div>
                    </div>
              </div>
              
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                  </div>
                        <div>
                          <p className="text-white font-medium">Alex Chen</p>
                          <p className="text-gray-400 text-sm">Computer Vision Model • Aalto University</p>
                          <p className="text-gray-500 text-xs">Approved 3 hours ago</p>
                            </div>
                            </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Approved</span>
                        <div className="flex items-center space-x-1">
                          <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">
                            Revoke Access
                          </button>
                          <button className="p-1 hover:bg-gray-600 rounded">
                            <Eye className="h-4 w-4 text-gray-400" />
                          </button>
                          </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Approved By:</span>
                          <span className="text-white ml-2">Admin</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Usage (24h):</span>
                          <span className="text-green-400 ml-2">234 requests</span>
                        </div>
                      </div>
                    </div>
                        </div>
                        
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                          </div>
                        <div>
                          <p className="text-white font-medium">Maria Garcia</p>
                          <p className="text-gray-400 text-sm">RAG Workflow Templates • VTT Research</p>
                          <p className="text-gray-500 text-xs">Requested 5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                        <div className="flex items-center space-x-1">
                          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <XCircle className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                          <button className="p-1 hover:bg-gray-600 rounded">
                            <Eye className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Reason:</span>
                          <span className="text-white ml-2">Document analysis for research papers</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected Usage:</span>
                          <span className="text-blue-400 ml-2">200 requests/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                            </div>
                          )}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Project Console Header */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Project Console</h3>
                    <p className="text-gray-400">Manage projects, collaborations, and research initiatives</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>New Project</span>
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                      Import Projects
                    </button>
                          </div>
                        </div>
                        
                {/* Project Statistics Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Projects</p>
                        <p className="text-2xl font-bold text-white">47</p>
                      </div>
                      <FolderOpen className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">32 Active, 15 Completed</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Collaborations</p>
                        <p className="text-2xl font-bold text-white">23</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Cross-institutional</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Research Areas</p>
                        <p className="text-2xl font-bold text-white">12</p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">AI, ML, NLP, CV</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Funding</p>
                        <p className="text-2xl font-bold text-white">€2.4M</p>
                      </div>
                      <Euro className="h-8 w-8 text-yellow-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">EU & National grants</p>
                  </div>
                </div>

                {/* Additional Project Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Publications</p>
                        <p className="text-2xl font-bold text-white">127</p>
                      </div>
                      <Activity className="h-8 w-8 text-indigo-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Papers & Articles</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Patents</p>
                        <p className="text-2xl font-bold text-white">23</p>
                      </div>
                      <Shield className="h-8 w-8 text-orange-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Intellectual Property</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Team Members</p>
                        <p className="text-2xl font-bold text-white">342</p>
                      </div>
                      <Users className="h-8 w-8 text-cyan-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Across all projects</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Success Rate</p>
                        <p className="text-2xl font-bold text-white">94%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">On-time delivery</p>
                  </div>
                </div>

                {/* Project Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-4">Project Status Distribution</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Active', value: 32, color: '#10b981' },
                              { name: 'Planning', value: 8, color: '#f59e0b' },
                              { name: 'Completed', value: 15, color: '#3b82f6' },
                              { name: 'On Hold', value: 3, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Active', value: 32, color: '#10b981' },
                              { name: 'Planning', value: 8, color: '#f59e0b' },
                              { name: 'Completed', value: 15, color: '#3b82f6' },
                              { name: 'On Hold', value: 3, color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                        </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-4">Project Timeline</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: 'Jan', projects: 8 },
                          { month: 'Feb', projects: 12 },
                          { month: 'Mar', projects: 15 },
                          { month: 'Apr', projects: 18 },
                          { month: 'May', projects: 22 },
                          { month: 'Jun', projects: 28 },
                          { month: 'Jul', projects: 32 },
                          { month: 'Aug', projects: 35 },
                          { month: 'Sep', projects: 38 },
                          { month: 'Oct', projects: 42 },
                          { month: 'Nov', projects: 45 },
                          { month: 'Dec', projects: 47 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#f9fafb'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="projects" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Performance Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Performance by Research Area</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { area: 'AI/ML', projects: 18, success: 95, funding: 850 },
                        { area: 'NLP', projects: 12, success: 92, funding: 420 },
                        { area: 'Computer Vision', projects: 8, success: 88, funding: 380 },
                        { area: 'Robotics', projects: 5, success: 90, funding: 320 },
                        { area: 'IoT', projects: 4, success: 85, funding: 180 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="area" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#f9fafb'
                          }} 
                        />
                        <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                        <Bar dataKey="success" fill="#10b981" name="Success %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Funding Distribution by Source</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'EU Horizon', value: 45, color: '#3b82f6' },
                            { name: 'National', value: 30, color: '#10b981' },
                            { name: 'Industry', value: 15, color: '#f59e0b' },
                            { name: 'Private', value: 10, color: '#8b5cf6' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'EU Horizon', value: 45, color: '#3b82f6' },
                            { name: 'National', value: 30, color: '#10b981' },
                            { name: 'Industry', value: 15, color: '#f59e0b' },
                            { name: 'Private', value: 10, color: '#8b5cf6' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Milestones Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Q1 2024 - 12 Projects Started</p>
                        <p className="text-gray-400 text-xs">€580K total funding</p>
                  </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Q2 2024 - 8 Projects Completed</p>
                        <p className="text-gray-400 text-xs">15 publications, 3 patents</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Q3 2024 - 15 New Collaborations</p>
                        <p className="text-gray-400 text-xs">Cross-institutional partnerships</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Q4 2024 - 22 Active Projects</p>
                        <p className="text-gray-400 text-xs">€1.2M in progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Risk & Compliance Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Risk Assessment</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white">Low Risk Projects</span>
                      </div>
                      <span className="text-green-400 font-semibold">28</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-white">Medium Risk Projects</span>
                      </div>
                      <span className="text-yellow-400 font-semibold">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-white">High Risk Projects</span>
                      </div>
                      <span className="text-red-400 font-semibold">7</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Compliance Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-white">GDPR Compliant</span>
                      </div>
                      <span className="text-green-400 font-semibold">42/47</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <span className="text-white">EU AI Act Ready</span>
                      </div>
                      <span className="text-blue-400 font-semibold">38/47</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <span className="text-white">Ethics Approved</span>
                      </div>
                      <span className="text-purple-400 font-semibold">45/47</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View all projects →</button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">AI-Powered Healthcare Diagnostics</h4>
                          <p className="text-gray-400 text-sm">University of Helsinki • Aalto University • VTT</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            <span className="text-xs text-gray-500">€450K funding</span>
                            <span className="text-xs text-gray-500">12 members</span>
                            <span className="text-xs text-gray-500">Started 3 months ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-white ml-2">68%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Deadline:</span>
                          <span className="text-blue-400 ml-2">Dec 2024</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Publications:</span>
                          <span className="text-green-400 ml-2">3 papers</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Compliance:</span>
                          <span className="text-yellow-400 ml-2">GDPR ✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Sustainable AI for Manufacturing</h4>
                          <p className="text-gray-400 text-sm">VTT • Nokia • University of Turku</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            <span className="text-xs text-gray-500">€320K funding</span>
                            <span className="text-xs text-gray-500">8 members</span>
                            <span className="text-xs text-gray-500">Started 5 months ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Eye className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <Edit className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-white ml-2">45%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Deadline:</span>
                          <span className="text-blue-400 ml-2">Mar 2025</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Publications:</span>
                          <span className="text-green-400 ml-2">1 paper</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Compliance:</span>
                          <span className="text-yellow-400 ml-2">EU AI Act ✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Project Management Tools */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Advanced Project Management</h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleExportReport}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Export Report</span>
                    </button>
                    <button 
                      onClick={handleGenerateAnalytics}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Generate Analytics</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Project Filters</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Status</label>
                        <select 
                          value={projectFilters.status}
                          onChange={(e) => setProjectFilters({...projectFilters, status: e.target.value})}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500"
                        >
                          <option value="all">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="planning">Planning</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Research Area</label>
                        <select 
                          value={projectFilters.area}
                          onChange={(e) => setProjectFilters({...projectFilters, area: e.target.value})}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500"
                        >
                          <option value="all">All Areas</option>
                          <option value="ai_ml">AI/ML</option>
                          <option value="nlp">NLP</option>
                          <option value="computer_vision">Computer Vision</option>
                          <option value="robotics">Robotics</option>
                          <option value="iot">IoT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Funding Range</label>
                        <select 
                          value={projectFilters.funding}
                          onChange={(e) => setProjectFilters({...projectFilters, funding: e.target.value})}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500"
                        >
                          <option value="all">All Ranges</option>
                          <option value="0-50k">€0 - €50K</option>
                          <option value="50k-200k">€50K - €200K</option>
                          <option value="200k-500k">€200K - €500K</option>
                          <option value="500k+">€500K+</option>
                        </select>
                      </div>
                      <button 
                        onClick={applyProjectFilters}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={handleCreateProject}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Project</span>
                      </button>
                      <button 
                        onClick={handleImportExcel}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Import from Excel</span>
                      </button>
                      <button 
                        onClick={handleGenerateProgressReport}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Generate Progress Report</span>
                      </button>
                      <button 
                        onClick={handleScheduleMeeting}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Review Meeting</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Project Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Avg. Project Duration</span>
                        <span className="text-white font-semibold">{projectInsights.avgDuration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Avg. Team Size</span>
                        <span className="text-white font-semibold">{projectInsights.avgTeamSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Avg. Publications/Project</span>
                        <span className="text-white font-semibold">{projectInsights.avgPublications}</span>
                  </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Collaboration Rate</span>
                        <span className="text-white font-semibold">{projectInsights.collaborationRate}</span>
                </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <button 
                        onClick={refreshProjectInsights}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
                      >
                        Refresh Insights
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generated Reports Section */}
                {showGeneratedReport && (
                  <div className="mt-6 bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-4">Generated Project Report</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-600 rounded p-3">
                        <h5 className="text-white font-medium mb-2">Project Summary</h5>
                        <p className="text-gray-300 text-sm">
                          Total Projects: {generatedReport.totalProjects}<br/>
                          Active Projects: {generatedReport.activeProjects}<br/>
                          Completed Projects: {generatedReport.completedProjects}<br/>
                          Total Funding: {generatedReport.totalFunding}
                        </p>
                      </div>
                      <div className="bg-gray-600 rounded p-3">
                        <h5 className="text-white font-medium mb-2">Performance Metrics</h5>
                        <p className="text-gray-300 text-sm">
                          Success Rate: {generatedReport.successRate}<br/>
                          Avg. Completion Time: {generatedReport.avgCompletionTime}<br/>
                          Publications Generated: {generatedReport.publications}<br/>
                          Patents Filed: {generatedReport.patents}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={downloadReport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Download PDF
                      </button>
                      <button 
                        onClick={shareReport}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Share Report
                      </button>
                      <button 
                        onClick={() => setShowGeneratedReport(false)}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                      >
                        Close
                      </button>
                    </div>
            </div>
          )}

                {/* Analytics Dashboard */}
                {showAnalytics && (
                  <div className="mt-6 bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-4">Project Analytics Dashboard</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-600 rounded p-3">
                        <h5 className="text-white font-medium mb-2">Project Status Distribution</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Active</span>
                            <span className="text-green-400">{analyticsData.activeProjects}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Completed</span>
                            <span className="text-blue-400">{analyticsData.completedProjects}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">On Hold</span>
                            <span className="text-yellow-400">{analyticsData.onHoldProjects}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-600 rounded p-3">
                        <h5 className="text-white font-medium mb-2">Research Area Breakdown</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">AI/ML</span>
                            <span className="text-white">{analyticsData.aiMlProjects}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">NLP</span>
                            <span className="text-white">{analyticsData.nlpProjects}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Computer Vision</span>
                            <span className="text-white">{analyticsData.cvProjects}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-600 rounded p-3">
                        <h5 className="text-white font-medium mb-2">Funding Analysis</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Total Budget</span>
                            <span className="text-green-400">€{analyticsData.totalBudget}M</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Avg. per Project</span>
                            <span className="text-blue-400">€{analyticsData.avgBudget}K</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">ROI</span>
                            <span className="text-yellow-400">{analyticsData.roi}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={exportAnalytics}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Export Analytics
                      </button>
                      <button 
                        onClick={() => setShowAnalytics(false)}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                      >
                        Close Analytics
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>
              <p className="text-gray-300">Analytics features will be implemented here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Settings</h3>
              <p className="text-gray-300">System settings will be implemented here.</p>
            </div>
          )}
              </div>


              {/* Demo Version Notice */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
            <p className="text-yellow-300 font-medium">Demo Version</p>
          </div>
          <p className="text-yellow-200 text-sm mt-1">
            This is a demonstration version of the System Admin Dashboard. 
            All data and interactions are for demonstration purposes only.
          </p>
                  </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModals}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">User Details</h3>
              <button 
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Profile Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedUser.avatar}
                </div>
              <div>
                  <h4 className="text-xl font-semibold text-white">{selectedUser.name}</h4>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      selectedUser.role === 'research_admin' ? 'bg-purple-100 text-purple-800' :
                      selectedUser.role === 'researcher' ? 'bg-blue-100 text-blue-800' :
                      selectedUser.role === 'student' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="text-lg font-semibold text-white mb-3">Account Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Organization:</span>
                      <span className="text-white">{selectedUser.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Login:</span>
                      <span className="text-white">{selectedUser.lastLogin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account Created:</span>
                      <span className="text-white">2 months ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email Verified:</span>
                      <span className="text-green-400">✓ Verified</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="text-lg font-semibold text-white mb-3">Permissions</h5>
                  <div className="space-y-2">
                  <div className="flex items-center justify-between">
                      <span className="text-gray-400">AI Services Access:</span>
                      <span className="text-green-400">✓ Granted</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-gray-400">Hardware Resources:</span>
                      <span className="text-green-400">✓ Granted</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-gray-400">Project Creation:</span>
                      <span className="text-green-400">✓ Granted</span>
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Data Access:</span>
                      <span className="text-yellow-400">⚠ Limited</span>
                </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-white mb-3">Activity Summary</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">12</p>
                    <p className="text-gray-400 text-sm">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">8</p>
                    <p className="text-gray-400 text-sm">AI Services</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">5</p>
                    <p className="text-gray-400 text-sm">Hardware Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">24</p>
                    <p className="text-gray-400 text-sm">Login Days</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    setShowEditModal(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit User</span>
                </button>
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Manage Permissions</span>
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2">
                  <XCircle className="w-4 h-4" />
                  <span>Suspend</span>
                </button>
              </div>
            </div>
          </div>
            </div>
          )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModals}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Edit User</h3>
              <button 
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-white mb-4">Basic Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={editFormData.name || ''}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={editFormData.email || ''}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
                    <input 
                      type="text" 
                      value={editFormData.organization || ''}
                      onChange={(e) => handleFormChange('organization', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <input 
                      type="text" 
                      value={editFormData.department || ''}
                      onChange={(e) => handleFormChange('department', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Role and Status */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-white mb-4">Role & Status</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">User Role</label>
                    <select 
                      value={editFormData.role || ''}
                      onChange={(e) => handleFormChange('role', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="org_admin">Organization Admin</option>
                      <option value="research_admin">Research Admin</option>
                      <option value="researcher">Researcher</option>
                      <option value="student">Student</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Account Status</label>
                    <select 
                      value={editFormData.status || ''}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    </div>
                  </div>
              </div>

              {/* Permissions */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-white mb-4">Permissions</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={editFormData.permissions?.aiServices || false}
                        onChange={(e) => handlePermissionChange('aiServices', e.target.checked)}
                        className="rounded" 
                      />
                      <span className="text-gray-300">AI Services Access</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={editFormData.permissions?.hardware || false}
                        onChange={(e) => handlePermissionChange('hardware', e.target.checked)}
                        className="rounded" 
                      />
                      <span className="text-gray-300">Hardware Resources</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={editFormData.permissions?.projects || false}
                        onChange={(e) => handlePermissionChange('projects', e.target.checked)}
                        className="rounded" 
                      />
                      <span className="text-gray-300">Project Creation</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={editFormData.permissions?.dataAccess || false}
                        onChange={(e) => handlePermissionChange('dataAccess', e.target.checked)}
                        className="rounded" 
                      />
                      <span className="text-gray-300">Data Access</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={editFormData.permissions?.admin || false}
                        onChange={(e) => handlePermissionChange('admin', e.target.checked)}
                        className="rounded" 
                      />
                      <span className="text-gray-300">Admin Functions</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={editFormData.permissions?.collaboration || false}
                        onChange={(e) => handlePermissionChange('collaboration', e.target.checked)}
                        className="rounded" 
                      />
                      <span className="text-gray-300">Collaboration</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={handleCloseModals}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Approvals Modal */}
      {showPendingApprovals && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPendingApprovals(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Pending User Approvals</h3>
              <button 
                onClick={() => setShowPendingApprovals(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{user.name}</h4>
                        <p className="text-gray-400">{user.email}</p>
                        <p className="text-gray-500 text-sm">{user.organization}</p>
                        <p className="text-gray-500 text-sm">Requested: {user.requestedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {user.role.toUpperCase()}
                      </span>
                      <button 
                        onClick={() => handleApproveUser(user.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectUser(user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Permission Updates Modal */}
      {showPermissionUpdates && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPermissionUpdates(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Permission Update Requests</h3>
              <button 
                onClick={() => setShowPermissionUpdates(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {permissionRequests.map((request) => (
                <div key={request.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{request.user}</h4>
                      <p className="text-gray-400">{request.email}</p>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-300 mb-2">Current Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {request.currentPermissions.map((perm: string) => (
                              <span key={perm} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                                {perm}
                              </span>
                            ))}
                    </div>
                  </div>
                        <div>
                          <p className="text-sm text-gray-300 mb-2">Requested Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {request.requestedPermissions.map((perm: string) => (
                              <span key={perm} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mt-2">Requested: {request.requestedAt}</p>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <button 
                        onClick={() => handleApprovePermission(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectPermission(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </div>
            </div>
          )}

      {/* Recent Activity Modal */}
      {showRecentActivity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRecentActivity(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Recent User Activity</h3>
              <button 
                onClick={() => setShowRecentActivity(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
        </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'login' ? 'bg-green-600' :
                      activity.type === 'request' ? 'bg-blue-600' :
                      activity.type === 'project' ? 'bg-purple-600' :
                      'bg-orange-600'
                    }`}>
                      <Activity className="w-5 h-5 text-white" />
      </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{activity.user}</h4>
                      <p className="text-gray-300">{activity.action}</p>
                      <p className="text-gray-500 text-sm">{activity.timestamp}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.type === 'login' ? 'bg-green-100 text-green-800' :
                      activity.type === 'request' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'project' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {activity.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hardware Requests Modal */}
      {showHardwareRequests && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowHardwareRequests(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Hardware Resource Requests</h3>
              <button 
                onClick={() => setShowHardwareRequests(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {hardwareRequests.map((request) => (
                <div key={request.id} className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {request.user.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">{request.user}</h4>
                          <p className="text-gray-400">{request.email}</p>
                          <p className="text-gray-500 text-sm">Requested: {request.requestedAt}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-lg font-semibold text-white mb-3">Resource Details</h5>
                          <div className="space-y-2">
                            <p className="text-gray-300"><span className="font-medium">Resource:</span> {request.resource}</p>
                            <p className="text-gray-300"><span className="font-medium">Priority:</span> 
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                request.priority === 'high' ? 'bg-red-100 text-red-800' :
                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {request.priority.toUpperCase()}
                              </span>
                            </p>
                            <p className="text-gray-300"><span className="font-medium">Duration:</span> {request.duration}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-lg font-semibold text-white mb-3">Justification</h5>
                          <p className="text-gray-300 text-sm bg-gray-600 p-3 rounded-lg">
                            {request.justification}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3 ml-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleApproveHardwareRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectHardwareRequest(request.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Service Requests Modal */}
      {showAIServiceRequests && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAIServiceRequests(false)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">AI Service Access Requests</h3>
              <button 
                onClick={() => setShowAIServiceRequests(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {aiServiceRequests.map((request) => (
                <div key={request.id} className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {request.user.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">{request.user}</h4>
                          <p className="text-gray-400">{request.email}</p>
                          <p className="text-gray-500 text-sm">Requested: {request.requestedAt}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-lg font-semibold text-white mb-3">Service Details</h5>
                          <div className="space-y-2">
                            <p className="text-gray-300"><span className="font-medium">Service:</span> {request.service}</p>
                            <p className="text-gray-300"><span className="font-medium">Expected Usage:</span> {request.expectedUsage}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-lg font-semibold text-white mb-3">Use Case</h5>
                          <p className="text-gray-300 text-sm bg-gray-600 p-3 rounded-lg">
                            {request.useCase}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3 ml-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleApproveAIServiceRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectAIServiceRequest(request.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}