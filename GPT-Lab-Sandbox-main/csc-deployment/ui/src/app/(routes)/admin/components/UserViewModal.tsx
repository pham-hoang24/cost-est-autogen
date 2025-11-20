'use client';

import React from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import UserAvatar from './UserAvatar';
import { 
  X, 
  Edit, 
  Mail, 
  Calendar, 
  Building2,
  Shield,
  Activity,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Phone,
  MapPin,
  Settings
} from 'lucide-react';

interface UserViewModalProps {
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
    department?: string;
    position?: string;
    phone?: string;
    created_at?: string;
    last_login?: string;
    approved_at?: string;
    approved_by?: string;
    signup_reason?: string;
    research_area?: string;
  };
  onEdit?: () => void;
}

export default function UserViewModal({ isOpen, onClose, user, onEdit }: UserViewModalProps) {
  if (!isOpen) return null;

  const userName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.email?.split('@')[0] || 'Unknown User';
  const userRole = user.role_type || user.role || 'viewer';
  const userStatus = user.status || 'pending';
  const email = user.email || '';

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
      return formatDate(dateString);
    } catch {
      return 'Unknown';
    }
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'green', icon: UserCheck, text: 'Active' };
      case 'pending':
        return { color: 'yellow', icon: Clock, text: 'Pending' };
      case 'rejected':
        return { color: 'red', icon: UserX, text: 'Rejected' };
      case 'suspended':
        return { color: 'gray', icon: AlertTriangle, text: 'Suspended' };
      default:
        return { color: 'gray', icon: Clock, text: 'Unknown' };
    }
  };

  // Get role info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { icon: Shield, text: 'Super Administrator', color: 'red' };
      case 'research_admin':
        return { icon: Building2, text: 'Research Administrator', color: 'orange' };
      case 'researcher':
        return { icon: Activity, text: 'Researcher', color: 'blue' };
      case 'viewer':
        return { icon: Eye, text: 'Viewer', color: 'green' };
      default:
        return { icon: Activity, text: 'Unknown', color: 'gray' };
    }
  };

  const statusInfo = getStatusInfo(userStatus);
  const roleInfo = getRoleInfo(userRole);
  const StatusIcon = statusInfo.icon;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="xl" />
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">{userName}</h2>
              <p className="text-text-secondary">{email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusInfo.color as any}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.text}
                </Badge>
                <Badge variant={roleInfo.color as any}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {roleInfo.text}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary">Email Address</p>
                      <p className="text-text-primary">{email}</p>
                    </div>
                  </div>

                  {user.organization && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-text-secondary">Organization</p>
                        <p className="text-text-primary">{user.organization}</p>
                      </div>
                    </div>
                  )}

                  {user.department && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-text-secondary">Department</p>
                        <p className="text-text-primary">{user.department}</p>
                      </div>
                    </div>
                  )}

                  {user.position && (
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-text-secondary">Position</p>
                        <p className="text-text-primary">{user.position}</p>
                      </div>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-text-secondary">Phone Number</p>
                        <p className="text-text-primary">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Research Information */}
              {(user.signup_reason || user.research_area) && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Research Information</h3>
                  <div className="space-y-4">
                    {user.signup_reason && (
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Signup Reason</p>
                        <p className="text-text-primary">{user.signup_reason}</p>
                      </div>
                    )}
                    {user.research_area && (
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Research Area</p>
                        <p className="text-text-primary">{user.research_area}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Account Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary">Account Created</p>
                      <p className="text-text-primary">{formatDate(user.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary">Last Login</p>
                      <p className="text-text-primary">{formatRelativeTime(user.last_login)}</p>
                      <p className="text-xs text-text-secondary">{formatDate(user.last_login)}</p>
                    </div>
                  </div>

                  {user.approved_at && (
                    <div className="flex items-start gap-3">
                      <UserCheck className="w-5 h-5 text-text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-text-secondary">Account Approved</p>
                        <p className="text-text-primary">{formatDate(user.approved_at)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Key className="w-5 h-5 text-text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm text-text-secondary">User ID</p>
                      <p className="text-text-primary font-mono text-sm">{user.id || user.user_id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Security & Access</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">Account Status</span>
                    </div>
                    <Badge variant={statusInfo.color as any}>
                      {statusInfo.text}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">Role Level</span>
                    </div>
                    <Badge variant={roleInfo.color as any}>
                      {roleInfo.text}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm text-text-secondary">Login Activity</span>
                    </div>
                    <span className="text-sm text-text-primary">
                      {user.last_login ? 'Active' : 'Never logged in'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-surface/50">
          <div className="text-sm text-text-secondary">
            User ID: {user.id || user.user_id}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit} className="btn-primary">
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
