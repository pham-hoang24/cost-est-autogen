'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import UserAvatar from './UserAvatar';
import { 
  X, 
  Trash2, 
  AlertTriangle,
  User,
  Mail,
  Building2,
  Shield,
  Clock,
  AlertCircle,
  Loader
} from 'lucide-react';

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    role_type?: string;
    status?: string;
    organization?: string;
    created_at?: string;
    last_login?: string;
  };
  onDelete: (reason: string, permanent: boolean) => Promise<void>;
}

export default function UserDeleteModal({ isOpen, onClose, user, onDelete }: UserDeleteModalProps) {
  const [reason, setReason] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    setDeleting(true);
    try {
      await onDelete(reason, permanent);
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'}`);
    } finally {
      setDeleting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      case 'suspended': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Delete User</h2>
              <p className="text-sm text-text-secondary">Remove user from the system</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleting}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Warning: User Deletion</h4>
                <p className="text-sm text-red-700 mt-1">
                  This action will {permanent ? 'permanently remove' : 'remove'} the user from the system.
                  {!permanent && ' The user can be restored later if needed.'}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-text-primary mb-4">User Information</h3>
            <div className="flex items-start space-x-4">
              <UserAvatar 
                user={{ 
                  first_name: user.first_name || '', 
                  last_name: user.last_name || '',
                  role: user.role_type || user.role || 'viewer'
                }} 
                size="lg"
              />
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-text-secondary" />
                  <span className="font-medium text-text-primary">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">{user.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">{user.organization || 'No organization'}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-text-secondary" />
                    <Badge variant={getRoleColor(user.role_type || user.role || 'viewer')}>
                      {user.role_type || user.role || 'viewer'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(user.status || 'pending')}>
                      {user.status || 'pending'}
                    </Badge>
                  </div>
                </div>
                
                {user.created_at && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deletion Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Reason for Deletion *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for deleting this user..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={deleting}
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="permanent"
                checked={permanent}
                onChange={(e) => setPermanent(e.target.checked)}
                disabled={deleting}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="permanent" className="text-sm text-text-secondary">
                <span className="font-medium">Permanent Deletion</span>
                <span className="block text-xs text-text-tertiary">
                  Check this box to permanently delete the user (cannot be restored)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <AlertCircle className="w-4 h-4" />
            <span>This action cannot be undone {permanent ? '' : 'for permanent deletions'}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleting}
              className="text-text-secondary hover:text-text-primary"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {permanent ? 'Permanently Delete' : 'Delete User'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
