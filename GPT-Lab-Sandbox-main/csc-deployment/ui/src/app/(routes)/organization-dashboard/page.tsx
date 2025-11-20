"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Building2, Users, FolderOpen, BarChart3, CreditCard, Settings, UserPlus, Shield, TrendingUp, Clock } from 'lucide-react';

export default function OrganizationDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['org_owner', 'org_admin', 'org_manager'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading your organization dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !['org_owner', 'org_admin', 'org_manager'].includes(user.role)) {
    return null;
  }

  const orgStats = {
    totalMembers: 45,
    activeProjects: 12,
    totalProjects: 28,
    monthlyUsage: 85,
    storageUsed: '2.3TB',
    budgetUsed: 75
  };

  const recentMembers = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Senior Researcher', joinDate: '2024-01-15', status: 'active' },
    { id: 2, name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Data Scientist', joinDate: '2024-01-12', status: 'active' },
    { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', role: 'ML Engineer', joinDate: '2024-01-10', status: 'pending' },
    { id: 4, name: 'David Kim', email: 'david.kim@company.com', role: 'Research Assistant', joinDate: '2024-01-08', status: 'active' }
  ];

  const activeProjects = [
    { id: 1, name: 'AI Model Optimization', status: 'active', progress: 75, members: 8, deadline: '2024-02-15' },
    { id: 2, name: 'Data Pipeline Development', status: 'active', progress: 45, members: 5, deadline: '2024-02-20' },
    { id: 3, name: 'Research Collaboration', status: 'planning', progress: 20, members: 12, deadline: '2024-03-01' },
    { id: 4, name: 'Model Deployment', status: 'active', progress: 90, members: 6, deadline: '2024-01-30' }
  ];

  const managementActions = [
    { name: 'Invite Members', description: 'Add new team members', icon: UserPlus, href: '/organization/members' },
    { name: 'Create Project', description: 'Start a new project', icon: FolderOpen, href: '/organization/projects' },
    { name: 'View Analytics', description: 'Organization insights', icon: BarChart3, href: '/organization/analytics' },
    { name: 'Manage Billing', description: 'Subscription and payments', icon: CreditCard, href: '/organization/billing' },
    { name: 'Organization Settings', description: 'Configure organization', icon: Settings, href: '/organization/settings' },
    { name: 'Security Center', description: 'Security and compliance', icon: Shield, href: '/organization/security' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Organization Dashboard</h1>
              <p className="text-text-muted">Welcome back, {user.email}! Manage your organization effectively.</p>
            </div>
          </div>
        </div>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Total Members</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{orgStats.totalMembers}</p>
            <p className="text-sm text-text-muted">Active team members</p>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Active Projects</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{orgStats.activeProjects}</p>
            <p className="text-sm text-text-muted">Out of {orgStats.totalProjects} total</p>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Monthly Usage</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{orgStats.monthlyUsage}%</p>
            <p className="text-sm text-text-muted">Of allocated resources</p>
          </div>

          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Budget Used</h3>
            </div>
            <p className="text-2xl font-bold text-text-primary">{orgStats.budgetUsed}%</p>
            <p className="text-sm text-text-muted">Of monthly budget</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Members */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Recent Members</h2>
            </div>
            
            <div className="space-y-4">
              {recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{member.name}</h3>
                    <p className="text-sm text-text-muted">{member.role}</p>
                    <p className="text-xs text-text-muted">Joined: {member.joinDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Active Projects</h2>
            </div>
            
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-text-primary">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted mb-2">
                    <span>{project.members} members</span>
                    <span>Due: {project.deadline}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="mt-8 bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Management Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementActions.map((action, index) => (
              <button 
                key={index}
                className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:bg-gray-50 transition-colors"
                onClick={() => router.push(action.href)}
              >
                <action.icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="font-medium text-text-primary">{action.name}</span>
                  <p className="text-sm text-text-muted">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
