'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Mail,
  Shield,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Crown,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  email: string;
  role_type: 'super_admin' | 'research_admin' | 'researcher' | 'viewer';
  organization_id?: string;
  organization_name?: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  cpu_hours_limit?: number;
  gpu_hours_limit?: number;
  storage_gb_limit?: number;
  used_cpu_hours?: number;
  used_gpu_hours?: number;
  used_storage_gb?: number;
}

interface UserManagementProps {
  onUserAction?: (action: string, userId: string) => void;
}

function UserManagement({ onUserAction }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      
      const response = await fetch(`/api/governance/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Failed to load users');
      
      // Mock data for development
      setUsers([
        {
          id: '1',
          user_id: 'user-001',
          email: 'dr.smith@university.edu',
          role_type: 'researcher',
          organization_name: 'AI Research Lab',
          status: 'pending',
          created_at: new Date().toISOString(),
          cpu_hours_limit: 100,
          gpu_hours_limit: 10,
          storage_gb_limit: 50,
          used_cpu_hours: 0,
          used_gpu_hours: 0,
          used_storage_gb: 0
        },
        {
          id: '2',
          user_id: 'user-002',
          email: 'research.lead@tech.corp',
          role_type: 'research_admin',
          organization_name: 'Tech Corp Research',
          status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          approved_at: new Date(Date.now() - 3600000).toISOString(),
          approved_by: 'admin@sw4e.org',
          cpu_hours_limit: 500,
          gpu_hours_limit: 50,
          storage_gb_limit: 200,
          used_cpu_hours: 120,
          used_gpu_hours: 15,
          used_storage_gb: 45
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/governance/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          approved_by: 'admin@sw4e.org',
          approval_notes: 'User approved via governance dashboard'
        })
      });
      
      if (response.ok) {
        await fetchUsers();
        onUserAction?.('approved', userId);
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (err) {
      console.error('Approve user error:', err);
      alert('Failed to approve user. Please try again.');
    }
  };

  const handleRejectUser = async (userId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/governance/users/${userId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rejected_by: 'admin@sw4e.org',
          rejection_reason: reason
        })
      });
      
      if (response.ok) {
        await fetchUsers();
        onUserAction?.('rejected', userId);
      } else {
        throw new Error('Failed to reject user');
      }
    } catch (err) {
      console.error('Reject user error:', err);
      alert('Failed to reject user. Please try again.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4 text-secondary" />;
      case 'research_admin': return <Shield className="w-4 h-4 text-primary" />;
      case 'researcher': return <Users className="w-4 h-4 text-primary" />;
      case 'viewer': return <Eye className="w-4 h-4 text-text-muted" />;
      default: return <Users className="w-4 h-4 text-text-muted" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'research_admin': return 'text-primary bg-primary/10 border-primary/20';
      case 'researcher': return 'text-primary bg-primary/10 border-primary/20';
      case 'viewer': return 'text-text-muted bg-surface border-border';
      default: return 'text-text-muted bg-surface border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'pending': return <Clock className="w-4 h-4 text-secondary" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-primary bg-primary/10 border-primary/20';
      case 'pending': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'suspended': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-text-muted bg-surface border-border';
    }
  };

  const getResourceUsagePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400 bg-red-400/20';
    if (percentage >= 75) return 'text-orange-400 bg-orange-400/20';
    if (percentage >= 50) return 'text-secondary bg-secondary/20';
    return 'text-primary bg-primary/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header & Controls */}
      <div className="bg-gradient-to-r from-surface to-surface/50 rounded-2xl p-6 border border-primary/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
              <p className="text-text-secondary">Manage user registrations, roles, and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchUsers} className="btn-outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="research_admin">Research Admin</option>
            <option value="researcher">Researcher</option>
            <option value="viewer">Viewer</option>
          </select>
          
          <Button className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-sm font-semibold text-red-400">Error Loading Users</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
          <Card key={user.user_id} className="p-6 hover:shadow-glow transition-all duration-300 border-primary/20 hover:border-primary/40">
            <div className="space-y-4">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    {getRoleIcon(user.role_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-text-primary">{user.email}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getRoleColor(user.role_type)}`}>
                        {user.role_type.replace('_', ' ')}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      {user.organization_name && (
                        <span>📁 {user.organization_name}</span>
                      )}
                      <span>📅 Registered {new Date(user.created_at).toLocaleDateString()}</span>
                      {user.approved_at && (
                        <span>✅ Approved {new Date(user.approved_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {user.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApproveUser(user.user_id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectUser(user.user_id)}
                        className="btn-outline text-sm px-4 py-2 text-red-400 border-red-400/20 hover:bg-red-400/10"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}
                    className="btn-outline text-sm px-3 py-2"
                  >
                    {expandedUser === user.user_id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedUser === user.user_id && (
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Resource Usage */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">Resource Usage</h4>
                      
                      {/* CPU Usage */}
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-text-secondary">CPU Hours</span>
                          <span className="text-xs text-text-muted">
                            {user.used_cpu_hours || 0} / {user.cpu_hours_limit || 0}
                          </span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(getResourceUsagePercentage(user.used_cpu_hours || 0, user.cpu_hours_limit || 0))}`}
                            style={{ width: `${getResourceUsagePercentage(user.used_cpu_hours || 0, user.cpu_hours_limit || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* GPU Usage */}
                      <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-text-secondary">GPU Hours</span>
                          <span className="text-xs text-text-muted">
                            {user.used_gpu_hours || 0} / {user.gpu_hours_limit || 0}
                          </span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(getResourceUsagePercentage(user.used_gpu_hours || 0, user.gpu_hours_limit || 0))}`}
                            style={{ width: `${getResourceUsagePercentage(user.used_gpu_hours || 0, user.gpu_hours_limit || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Storage Usage */}
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-text-secondary">Storage (GB)</span>
                          <span className="text-xs text-text-muted">
                            {user.used_storage_gb || 0} / {user.storage_gb_limit || 0}
                          </span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(getResourceUsagePercentage(user.used_storage_gb || 0, user.storage_gb_limit || 0))}`}
                            style={{ width: `${getResourceUsagePercentage(user.used_storage_gb || 0, user.storage_gb_limit || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">User Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">User ID:</span>
                          <span className="text-text-primary font-mono text-xs">{user.user_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Email:</span>
                          <span className="text-text-primary">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Role:</span>
                          <span className="text-text-primary capitalize">{user.role_type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Status:</span>
                          <span className="text-text-primary capitalize">{user.status}</span>
                        </div>
                        {user.organization_name && (
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Organization:</span>
                            <span className="text-text-primary">{user.organization_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">Actions</h4>
                      <div className="space-y-2">
                        <Button className="btn-outline w-full text-sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </Button>
                        <Button className="btn-outline w-full text-sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Quotas
                        </Button>
                        <Button className="btn-outline w-full text-sm">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        <Button className="btn-outline w-full text-sm text-red-400 border-red-400/20 hover:bg-red-400/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Suspend User
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Users Found</h3>
            <p className="text-text-secondary">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                ? 'No users match your current filters.' 
                : 'No users have been registered yet.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className="btn-outline mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-outline text-sm px-3 py-2"
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-outline text-sm px-3 py-2"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
