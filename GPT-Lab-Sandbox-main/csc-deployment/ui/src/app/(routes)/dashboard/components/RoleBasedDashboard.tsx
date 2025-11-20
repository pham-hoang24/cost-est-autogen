'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  Database, 
  FlaskConical,
  Brain,
  Zap,
  Lock,
  Crown,
  Building,
  UserCheck,
  TrendingUp
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'research_admin' | 'researcher' | 'viewer';
  organization?: string;
  subscription?: string;
}

interface RoleBasedDashboardProps {
  user: User;
}

export default function RoleBasedDashboard({ user }: RoleBasedDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    organizations: 0,
    resourceUsage: 0,
    pendingUsers: 0
  });

  useEffect(() => {
    // Fetch user-specific stats
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Use the real governance API
      const response = await fetch('/api/governance/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.data?.totalUsers || 0,
          activeProjects: data.data?.totalProjects || 0,
          organizations: 1, // TODO: Get from organizations API
          resourceUsage: data.data?.resourceUtilization?.cpu || 0,
          pendingUsers: data.data?.pendingUsers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'research_admin': return 'Research Administrator';
      case 'researcher': return 'Researcher';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-5 h-5" />;
      case 'research_admin': return <Building className="w-5 h-5" />;
      case 'researcher': return <FlaskConical className="w-5 h-5" />;
      case 'viewer': return <UserCheck className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-900 text-red-300';
      case 'research_admin': return 'bg-yellow-900 text-yellow-300';
      case 'researcher': return 'bg-green-900 text-green-300';
      case 'viewer': return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  // Super Admin Dashboard
  if (user.role === 'super_admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.email}!</h1>
            <h2 className="text-2xl font-semibold text-slate-300 mt-1">System Administration</h2>
            <p className="text-slate-400 mt-2">
              As a Super Administrator, you have complete access to all platform features including:
              <br />• User management and approval • Organization oversight • System settings • Full governance controls
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>

        {/* Pending Users Alert */}
        {stats.pendingUsers > 0 && (
          <Card className="p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300">
                    {stats.pendingUsers} User{stats.pendingUsers > 1 ? 's' : ''} Awaiting Approval
                  </h3>
                  <p className="text-yellow-200 text-sm">
                    Review and approve pending user registrations
                  </p>
                </div>
              </div>
              <Button 
                className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                onClick={() => router.push('/governance')}
              >
                Review Users
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-red-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Organizations</p>
                <p className="text-2xl font-bold text-white">{stats.organizations}</p>
              </div>
              <Building className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">System Health</p>
                <p className="text-2xl font-bold text-white">98%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-900/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Governance</h3>
                <p className="text-slate-400 text-sm">Manage users and organizations</p>
              </div>
            </div>
            <Button 
              className="w-full btn-primary"
              onClick={() => router.push('/governance')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Open Governance
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">System Settings</h3>
                <p className="text-slate-400 text-sm">Configure platform settings</p>
              </div>
            </div>
            <Button className="w-full btn-outline">
              <Settings className="w-4 h-4 mr-2" />
              Manage Settings
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Analytics</h3>
                <p className="text-slate-400 text-sm">View system analytics</p>
              </div>
            </div>
            <Button className="w-full btn-outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Research Admin Dashboard
  if (user.role === 'research_admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.email}!</h1>
            <h2 className="text-2xl font-semibold text-slate-300 mt-1">Organization Management</h2>
            <p className="text-slate-400 mt-2">
              As a Research Administrator, you can manage your organization including:
              <br />• Team member management • Project oversight • Resource allocation • Organization settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Team Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Resources Used</p>
                <p className="text-2xl font-bold text-white">{stats.resourceUsage}%</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-white">45GB</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Team Management</h3>
                <p className="text-slate-400 text-sm">Manage organization members</p>
              </div>
            </div>
            <Button className="w-full btn-primary">
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Projects</h3>
                <p className="text-slate-400 text-sm">Manage research projects</p>
              </div>
            </div>
            <Button className="w-full btn-outline">
              <FlaskConical className="w-4 h-4 mr-2" />
              View Projects
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Resources</h3>
                <p className="text-slate-400 text-sm">Manage resource allocation</p>
              </div>
            </div>
            <Button className="w-full btn-outline">
              <Settings className="w-4 h-4 mr-2" />
              Manage Resources
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Researcher Dashboard
  if (user.role === 'researcher') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.email}!</h1>
            <h2 className="text-2xl font-semibold text-slate-300 mt-1">Research Dashboard</h2>
            <p className="text-slate-400 mt-2">
              As a Researcher, you have access to research tools and resources including:
              <br />• Project creation and management • Data catalog access • AI services • Experiment tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">My Projects</p>
                <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Experiments</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Data Sets</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <Database className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Storage Used</p>
                <p className="text-2xl font-bold text-white">15GB</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">New Project</h3>
                <p className="text-slate-400 text-sm">Start a new research project</p>
              </div>
            </div>
            <Button className="w-full btn-primary">
              <FlaskConical className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Data Catalog</h3>
                <p className="text-slate-400 text-sm">Access research data</p>
              </div>
            </div>
            <Button className="w-full btn-outline">
              <Database className="w-4 h-4 mr-2" />
              Browse Data
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Services</h3>
                <p className="text-slate-400 text-sm">Use AI tools and models</p>
              </div>
            </div>
            <Button className="w-full btn-outline">
              <Brain className="w-4 h-4 mr-2" />
              AI Tools
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Viewer Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.email}!</h1>
          <h2 className="text-2xl font-semibold text-slate-300 mt-1">Viewer Dashboard</h2>
          <p className="text-slate-400 mt-2">
            As a Viewer, you have read-only access to assigned resources including:
            <br />• View assigned projects • Browse available data • Access reports and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getRoleIcon(user.role)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Assigned Projects</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <FlaskConical className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Data Access</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <Database className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Reports</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Last Access</p>
              <p className="text-2xl font-bold text-white">2h</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">View Projects</h3>
              <p className="text-slate-400 text-sm">Browse assigned projects</p>
            </div>
          </div>
          <Button className="w-full btn-outline">
            <FlaskConical className="w-4 h-4 mr-2" />
            View Projects
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Data Access</h3>
              <p className="text-slate-400 text-sm">View available data</p>
            </div>
          </div>
          <Button className="w-full btn-outline">
            <Database className="w-4 h-4 mr-2" />
            Browse Data
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Reports</h3>
              <p className="text-slate-400 text-sm">View research reports</p>
            </div>
          </div>
          <Button className="w-full btn-outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </Card>
      </div>
    </div>
  );
}
