'use client';

import { useState, useEffect } from 'react';

export default function GovernancePage() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      
      console.log('🔍 Starting fetch...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const [dashboardRes, usersRes, orgsRes] = await Promise.all([
        fetch('/api/governance/dashboard', { signal: controller.signal }),
        fetch('/api/governance/users', { 
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }),
        fetch('/api/governance/organizations', { signal: controller.signal })
      ]);
      
      clearTimeout(timeoutId);
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setData(dashboardData);
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }
      
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData.organizations || []);
      }
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/governance/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ 
          approved_by: 'admin@sw4e.org',
          approval_notes: 'User approved via governance dashboard'
        })
      });
      
      if (response.ok) {
        fetchData(); // Refresh data
        alert('User approved successfully!');
      } else {
        alert('Failed to approve user');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Error approving user');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/governance/users/${userId}/reject`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ 
          rejected_by: 'admin@sw4e.org',
          rejection_notes: 'User rejected via governance dashboard'
        })
      });
      
      if (response.ok) {
        fetchData(); // Refresh data
        alert('User rejected');
      } else {
        alert('Failed to reject user');
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Error rejecting user');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Active</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">Pending</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">Suspended</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 text-gray-300 rounded-full text-xs">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">Super Admin</span>;
      case 'research_admin':
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs">Research Admin</span>;
      case 'researcher':
        return <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Researcher</span>;
      case 'viewer':
        return <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">Viewer</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 text-gray-300 rounded-full text-xs">{role}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading governance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-red-500 text-2xl mb-4">Error Loading Data</h1>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          SW4E Governance Dashboard
        </h1>
        
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-slate-400 text-sm mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-white">{(data as any)?.data?.totalUsers || 0}</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-slate-400 text-sm mb-2">Pending Users</h3>
              <p className="text-3xl font-bold text-yellow-400">{(data as any)?.data?.pendingUsers || 0}</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-slate-400 text-sm mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-green-400">{(data as any)?.data?.activeUsers || 0}</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-slate-400 text-sm mb-2">Organizations</h3>
              <p className="text-3xl font-bold text-blue-400">{(data as any)?.data?.totalOrganizations || 0}</p>
            </div>
          </div>
        )}


        {/* User Management Section */}
        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
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
                  <tr key={user.user_id || user.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-white">
                      {user.first_name && user.last_name ? 
                        `${user.first_name} ${user.last_name}` : 
                        user.email.split('@')[0]
                      }
                    </td>
                    <td className="py-3 px-4 text-slate-300">{user.email}</td>
                    <td className="py-3 px-4">{getRoleBadge(user.role_type || user.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {user.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => approveUser(user.user_id || user.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => rejectUser(user.user_id || user.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Organization Management Section */}
        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Organizations</h2>
            <button 
              onClick={() => setShowCreateOrg(true)}
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 font-semibold"
            >
              + Create Organization
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                  <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">
                    {org.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-3">{org.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Admin:</span>
                    <span className="text-white">{org.admin_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Storage:</span>
                    <span className="text-white">{org.total_storage_limit} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Members:</span>
                    <span className="text-white">{org.member_count}/{org.max_members}</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Edit
                  </button>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                    Members
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={fetchData}
            className="bg-green-500 text-black px-6 py-3 rounded hover:bg-green-600 font-semibold"
          >
            Refresh Data
          </button>
        </div>

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
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
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    onClick={() => setShowCreateOrg(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={createOrganization}
                    className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600 font-semibold"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}