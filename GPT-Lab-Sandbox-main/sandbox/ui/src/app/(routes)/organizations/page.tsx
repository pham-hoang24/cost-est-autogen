'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import CreateOrganizationModal from './components/CreateOrganizationModal';
import { Building2, Users, Settings, BarChart3, Shield, Plus, Search, Filter, MoreVertical } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  member_count: number;
  max_members: number;
  status: 'active' | 'suspended' | 'archived';
  compliance_mode: 'strict' | 'moderate' | 'relaxed';
  created_at: string;
  settings: {
    analytics_enabled: boolean;
    compliance_mode: string;
    data_retention_days: number;
    auto_approve_members: boolean;
    require_admin_approval: boolean;
    max_concurrent_projects: number;
    default_project_quota: {
      cpu_hours: number;
      gpu_hours: number;
      storage_gb: number;
    };
  };
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer' | 'guest';
  permissions: string[];
  joined_at: string;
  invited_by: string;
  status: 'active' | 'pending' | 'suspended';
  email: string;
  first_name: string;
  last_name: string;
  user_role: string;
  user_status: string;
}

interface OrganizationPermission {
  id: string;
  organization_id: string;
  permission_name: string;
  permission_description: string;
  allowed_roles: string[];
  resource_type: 'project' | 'dataset' | 'service' | 'user' | 'analytics';
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'view';
  conditions: Record<string, any>;
  created_at: string;
}

export default function OrganizationsPage() {
  const { user, getAuthHeaders } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [permissions, setPermissions] = useState<OrganizationPermission[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'permissions' | 'analytics' | 'settings'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setOrganizations(data.data);
        } else {
          console.log('Organizations API returned:', data);
          setOrganizations([]); // Fallback to empty array
        }
      } else {
        setOrganizations([]); // Fallback on error
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Fetch organization details
  const fetchOrganizationDetails = async (orgId: string) => {
    try {
      const [orgResponse, membersResponse, permissionsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/organizations/${orgId}`, { headers: getAuthHeaders() }),
        fetch(`/api/organizations/${orgId}/members`, { headers: getAuthHeaders() }),
        fetch(`/api/organizations/${orgId}/permissions`, { headers: getAuthHeaders() }),
        fetch(`/api/organizations/${orgId}/analytics?period=month`, { headers: getAuthHeaders() })
      ]);

      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setSelectedOrg(orgData.data);
      }

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.data || []);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData.data || []);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.data);
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchOrganizationDetails(selectedOrg.id);
    }
  }, [selectedOrg]);

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.admin_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getComplianceColor = (mode: string) => {
    switch (mode) {
      case 'strict': return 'red';
      case 'moderate': return 'yellow';
      case 'relaxed': return 'green';
      default: return 'gray';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'member': return 'secondary';
      case 'viewer': return 'green';
      case 'guest': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Organizations</h1>
            <p className="text-gray-400">Manage organizations, members, permissions, and analytics</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organizations List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">All Organizations</h2>
                <Badge variant="accent">{organizations.length}</Badge>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Organizations List */}
              <div className="space-y-3">
                {filteredOrganizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedOrg?.id === org.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <h3 className="font-medium text-white">{org.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{org.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{org.member_count}/{org.max_members} members</span>
                          <Badge variant={getStatusColor(org.status) as any}>
                            {org.status}
                          </Badge>
                        </div>
                      </div>
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="lg:col-span-2">
            {selectedOrg ? (
              <div className="bg-gray-800 rounded-lg p-6">
                {/* Organization Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedOrg.name}</h2>
                    <p className="text-gray-400">{selectedOrg.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(selectedOrg.status) as any}>
                      {selectedOrg.status}
                    </Badge>
                    <Badge variant={getComplianceColor(selectedOrg.compliance_mode) as any}>
                      {selectedOrg.compliance_mode} compliance
                    </Badge>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: Building2 },
                    { id: 'members', label: 'Members', icon: Users },
                    { id: 'permissions', label: 'Permissions', icon: Shield },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Members</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{selectedOrg.member_count}</div>
                        <div className="text-xs text-gray-500">of {selectedOrg.max_members} max</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-400">Compliance</span>
                        </div>
                        <div className="text-2xl font-bold text-white capitalize">{selectedOrg.compliance_mode}</div>
                        <div className="text-xs text-gray-500">mode</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-gray-400">Analytics</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {selectedOrg.settings?.analytics_enabled ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-xs text-gray-500">tracking</div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Organization Admin</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {selectedOrg.admin_first_name?.[0]}{selectedOrg.admin_last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {selectedOrg.admin_first_name} {selectedOrg.admin_last_name}
                          </div>
                          <div className="text-sm text-gray-400">{selectedOrg.admin_email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Resource Quotas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Default CPU Hours</div>
                          <div className="text-xl font-bold text-white">
                            {selectedOrg.settings?.default_project_quota?.cpu_hours || 100}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Default GPU Hours</div>
                          <div className="text-xl font-bold text-white">
                            {selectedOrg.settings?.default_project_quota?.gpu_hours || 10}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Default Storage (GB)</div>
                          <div className="text-xl font-bold text-white">
                            {selectedOrg.settings?.default_project_quota?.storage_gb || 50}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Organization Members</h3>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left py-3 text-gray-400">Name</th>
                            <th className="text-left py-3 text-gray-400">Email</th>
                            <th className="text-left py-3 text-gray-400">Role</th>
                            <th className="text-left py-3 text-gray-400">Status</th>
                            <th className="text-left py-3 text-gray-400">Joined</th>
                            <th className="text-left py-3 text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr key={member.id} className="border-b border-gray-700">
                              <td className="py-3 text-white">
                                {member.first_name} {member.last_name}
                              </td>
                              <td className="py-3 text-gray-400">{member.email}</td>
                              <td className="py-3">
                                <Badge variant={getRoleColor(member.role) as any}>
                                  {member.role}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <Badge variant={getStatusColor(member.status) as any}>
                                  {member.status}
                                </Badge>
                              </td>
                              <td className="py-3 text-gray-400">
                                {new Date(member.joined_at).toLocaleDateString()}
                              </td>
                              <td className="py-3">
                                <button className="text-blue-400 hover:text-blue-300">
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Organization Permissions</h3>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Permission
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{permission.permission_name}</h4>
                            <Badge variant="accent">{permission.action}</Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{permission.permission_description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Resource:</span>
                            <Badge variant="gray">{permission.resource_type}</Badge>
                            <span className="text-xs text-gray-500 ml-4">Roles:</span>
                            {permission.allowed_roles.map((role) => (
                              <Badge key={role} variant={getRoleColor(role) as any}>
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Organization Analytics</h3>
                    
                    {analytics ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-400">Total Metrics</div>
                            <div className="text-2xl font-bold text-white">{analytics.summary?.total_metrics || 0}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-400">Usage Metrics</div>
                            <div className="text-2xl font-bold text-white">{analytics.summary?.usage_metrics || 0}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-400">Performance</div>
                            <div className="text-2xl font-bold text-white">{analytics.summary?.performance_metrics || 0}</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-400">Compliance</div>
                            <div className="text-2xl font-bold text-white">{analytics.summary?.compliance_metrics || 0}</div>
                          </div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-white mb-4">Recent Analytics</h4>
                          <div className="text-sm text-gray-400">
                            Period: {analytics.period} ({new Date(analytics.start_date).toLocaleDateString()} - {new Date(analytics.end_date).toLocaleDateString()})
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700 rounded-lg p-8 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-white mb-2">No Analytics Data</h4>
                        <p className="text-gray-400">Analytics data will appear here once the organization starts using the platform.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Organization Settings</h3>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-white mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white">Analytics Enabled</div>
                            <div className="text-sm text-gray-400">Track usage and performance metrics</div>
                          </div>
                          <Badge variant={selectedOrg.settings?.analytics_enabled ? 'green' : 'red'}>
                            {selectedOrg.settings?.analytics_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white">Auto Approve Members</div>
                            <div className="text-sm text-gray-400">Automatically approve new member requests</div>
                          </div>
                          <Badge variant={selectedOrg.settings?.auto_approve_members ? 'green' : 'red'}>
                            {selectedOrg.settings?.auto_approve_members ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white">Require Admin Approval</div>
                            <div className="text-sm text-gray-400">Require admin approval for sensitive operations</div>
                          </div>
                          <Badge variant={selectedOrg.settings?.require_admin_approval ? 'green' : 'red'}>
                            {selectedOrg.settings?.require_admin_approval ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-white mb-4">Resource Limits</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Max Concurrent Projects</div>
                          <div className="text-xl font-bold text-white">
                            {selectedOrg.settings?.max_concurrent_projects || 10}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Data Retention (Days)</div>
                          <div className="text-xl font-bold text-white">
                            {selectedOrg.settings?.data_retention_days || 365}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Edit Settings
                      </Button>
                      <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                        Export Configuration
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select an Organization</h3>
                <p className="text-gray-400">Choose an organization from the list to view its details, manage members, and configure settings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Organization Modal */}
        <CreateOrganizationModal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchOrganizations();
            setShowCreateForm(false);
          }}
          getAuthHeaders={() => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' })}
        />
      </div>
    </div>
  );
}