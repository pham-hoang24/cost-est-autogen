'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Users, Building2, BarChart3, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  plan_type: string;
  storage_limit_gb: number;
  member_limit: number;
  status: string;
  admin_email: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  totalProjects: number;
  resourceUtilization: {
    cpu: number;
    gpu: number;
    storage: number;
  };
}

export default function SimpleGovernancePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    description: '',
    plan_type: 'research_team',
    storage_limit_gb: 100,
    member_limit: 10,
    admin_email: 'admin@sw4e.org'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching governance data...');
      
      const [usersRes, orgsRes, statsRes] = await Promise.all([
        fetch('/api/simple-governance/users'),
        fetch('/api/simple-governance/organizations'),
        fetch('/api/simple-governance/dashboard')
      ]);

      console.log('🔍 API Responses:', {
        users: usersRes.status,
        orgs: orgsRes.status,
        stats: statsRes.status
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('🔍 Users data:', usersData);
        setUsers(usersData.users || []);
      } else {
        console.error('❌ Users API error:', usersRes.status, await usersRes.text());
      }

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        console.log('🔍 Organizations data:', orgsData);
        setOrganizations(orgsData.organizations || []);
      } else {
        console.error('❌ Organizations API error:', orgsRes.status, await orgsRes.text());
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('🔍 Stats data:', statsData);
        setStats(statsData.data);
      } else {
        console.error('❌ Stats API error:', statsRes.status, await statsRes.text());
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    try {
      const response = await fetch('/api/simple-governance/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrg),
      });

      if (response.ok) {
        setShowCreateOrg(false);
        setNewOrg({
          name: '',
          description: '',
          plan_type: 'research_team',
          storage_limit_gb: 100,
          member_limit: 10,
          admin_email: 'admin@sw4e.org'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="green">Active</Badge>;
      case 'pending':
        return <Badge variant="yellow">Pending</Badge>;
      case 'suspended':
        return <Badge variant="red">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="red">Super Admin</Badge>;
      case 'research_admin':
        return <Badge variant="yellow">Research Admin</Badge>;
      case 'researcher':
        return <Badge variant="green">Researcher</Badge>;
      case 'viewer':
        return <Badge variant="secondary">Viewer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-xl">Loading governance data...</p>
          <p className="text-slate-400 text-sm mt-2">Check browser console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            SW4E Governance Dashboard
          </h1>
          <p className="text-xl text-slate-300">
            Manage users, organizations, and system resources
          </p>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
            <p className="text-slate-400 text-sm">
              Debug: Users: {users.length}, Orgs: {organizations.length}, Stats: {stats ? 'Loaded' : 'Not loaded'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Users</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingUsers}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Organizations</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </Card>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
            <p className="text-slate-300 text-center">No stats data available</p>
          </div>
        )}

        {/* Users Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Users</h2>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300">Email</th>
                    <th className="text-left py-3 px-4 text-slate-300">Role</th>
                    <th className="text-left py-3 px-4 text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300">Created</th>
                    <th className="text-left py-3 px-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700/50">
                      <td className="py-3 px-4 text-white">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{user.email}</td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" className="btn-outline">
                            Edit
                          </Button>
                          {user.status === 'pending' && (
                            <>
                              <Button size="sm" className="btn-primary">
                                Approve
                              </Button>
                              <Button size="sm" className="btn-danger">
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Organizations Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Organizations</h2>
              <Button 
                className="btn-primary"
                onClick={() => setShowCreateOrg(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Card key={org.id} className="bg-slate-700/50 border-slate-600">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                      <Badge variant="green">{org.status}</Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{org.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Plan:</span>
                        <span className="text-white capitalize">{org.plan_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Storage:</span>
                        <span className="text-white">{org.storage_limit_gb} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Members:</span>
                        <span className="text-white">{org.member_limit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Admin:</span>
                        <span className="text-white">{org.admin_email}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" className="btn-outline">
                        Edit
                      </Button>
                      <Button size="sm" className="btn-outline">
                        Members
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Create Organization</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={newOrg.name}
                      onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newOrg.description}
                      onChange={(e) => setNewOrg({...newOrg, description: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Enter organization description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Storage Limit (GB)
                      </label>
                      <input
                        type="number"
                        value={newOrg.storage_limit_gb}
                        onChange={(e) => setNewOrg({...newOrg, storage_limit_gb: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Member Limit
                      </label>
                      <input
                        type="number"
                        value={newOrg.member_limit}
                        onChange={(e) => setNewOrg({...newOrg, member_limit: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    className="btn-outline"
                    onClick={() => setShowCreateOrg(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="btn-primary"
                    onClick={createOrganization}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
