'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import UserAvatar from './UserAvatar';
import { 
  X, 
  Trash2, 
  RotateCcw,
  Search,
  User,
  Mail,
  Building2,
  Clock,
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react';

interface DeletedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeletedUser {
  id: string;
  original_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization: string;
  role: string;
  status: string;
  signup_reason: string;
  research_area: string;
  created_at: string;
  deleted_at: string;
  deleted_by_email: string;
  deletion_reason: string;
  can_restore: boolean;
}

export default function DeletedUsersModal({ isOpen, onClose }: DeletedUsersModalProps) {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDeletedUsers();
    }
  }, [isOpen]);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/governance/users/deleted', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setDeletedUsers(result.data || []);
      } else {
        console.error('Failed to fetch deleted users');
        setDeletedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching deleted users:', error);
      setDeletedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (user: DeletedUser) => {
    if (!confirm(`Are you sure you want to restore ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    setRestoring(user.original_user_id);
    try {
      const response = await fetch(`/api/governance/users/${user.original_user_id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('User restored successfully!');
        await fetchDeletedUsers(); // Refresh the list
      } else {
        const result = await response.json();
        alert(`Failed to restore user: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      alert(`Failed to restore user: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'}`);
    } finally {
      setRestoring(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'red';
      case 'research_admin': return 'yellow';
      case 'researcher': return 'green';
      case 'viewer': return 'secondary';
      default: return 'gray';
    }
  };

  const filteredUsers = deletedUsers.filter(user => 
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Deleted Users</h2>
              <p className="text-sm text-text-secondary">Manage deleted user accounts</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-border bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search deleted users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDeletedUsers}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-text-secondary">Loading deleted users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchQuery ? 'No Matching Users' : 'No Deleted Users'}
              </h3>
              <p className="text-text-secondary">
                {searchQuery 
                  ? 'No deleted users match your search criteria.'
                  : 'No users have been deleted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-border rounded-lg p-4 bg-white">
                  <div className="flex items-start space-x-4">
                    <UserAvatar 
                      user={{ 
                        first_name: user.first_name, 
                        last_name: user.last_name,
                        role: user.role
                      }} 
                      size="lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-text-primary">
                          {user.first_name} {user.last_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          {user.can_restore && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(user)}
                              disabled={restoring === user.original_user_id}
                              className="flex items-center space-x-2 text-green-600 border-green-600 hover:bg-green-50"
                            >
                              {restoring === user.original_user_id ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span>Restoring...</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Restore</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-text-secondary" />
                            <span className="text-text-secondary">{user.email}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-text-secondary" />
                            <span className="text-text-secondary">{user.organization || 'No organization'}</span>
                          </div>
                          
                          {user.research_area && (
                            <div className="text-text-secondary">
                              <span className="font-medium">Research Area:</span> {user.research_area}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-text-secondary" />
                            <span className="text-text-secondary">
                              Created: {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span className="text-text-secondary">
                              Deleted: {new Date(user.deleted_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="text-text-secondary">
                            <span className="font-medium">Deleted by:</span> {user.deleted_by_email}
                          </div>
                          
                          {user.deletion_reason && (
                            <div className="text-text-secondary">
                              <span className="font-medium">Reason:</span> {user.deletion_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-gray-50">
          <div className="text-sm text-text-secondary">
            {filteredUsers.length} deleted users found
          </div>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
