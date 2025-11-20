'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import UserAvatar from './UserAvatar';
import { 
  CheckCircle, 
  Eye, 
  Edit, 
  Shield, 
  Clock, 
  Building2,
  Mail,
  Calendar,
  Activity,
  MoreVertical,
  UserCheck,
  UserX,
  Key,
  AlertTriangle,
  Trash2,
  History
} from 'lucide-react';

interface UserCardProps {
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
    approved_at?: string;
    approved_by?: string;
  };
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  onView?: (userId: string) => void;
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onHistory?: (userId: string) => void;
  onSelect?: (userId: string, selected: boolean) => void;
  isSelected?: boolean;
  showSelection?: boolean;
  className?: string;
}

export default function UserCard({ user, onApprove, onReject, onView, onEdit, onDelete, onHistory, onSelect, isSelected = false, showSelection = false, className = '' }: UserCardProps) {
  const userId = user.id || user.user_id || '';
  const userName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.email?.split('@')[0] || 'Unknown User';
  const userRole = user.role_type || user.role || 'viewer';
  const userStatus = user.status || 'pending';
  const organization = user.organization || 'No Organization';
  const email = user.email || '';

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return formatDate(dateString);
    } catch {
      return 'Unknown';
    }
  };

  // Get status color and icon
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

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return Shield;
      case 'research_admin':
        return Building2;
      case 'researcher':
        return Activity;
      case 'viewer':
        return Eye;
      default:
        return Activity;
    }
  };

  const statusInfo = getStatusInfo(userStatus);
  const RoleIcon = getRoleIcon(userRole);

  return (
    <Card className={`p-6 hover:shadow-glow transition-all duration-300 group ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {showSelection && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(userId, e.target.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
          </div>
        )}
        <UserAvatar user={user} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h5 className="text-lg font-semibold text-text-primary mb-1 truncate">
                {userName}
              </h5>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-text-secondary" />
                <p className="text-sm text-text-secondary truncate">{email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-text-secondary" />
                <p className="text-sm text-text-secondary truncate">{organization}</p>
              </div>
            </div>
            <Badge variant={statusInfo.color as any}>
              <statusInfo.icon className="w-3 h-3 mr-1" />
              {statusInfo.text}
            </Badge>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="space-y-3 mb-4">
        {/* Role */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RoleIcon className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">Role:</span>
          </div>
          <span className="text-sm font-medium text-text-primary capitalize">
            {userRole.replace('_', ' ')}
          </span>
        </div>

        {/* Created Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">Created:</span>
          </div>
          <span className="text-sm text-text-primary">
            {formatDate(user.created_at)}
          </span>
        </div>

        {/* Last Login */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">Last Login:</span>
          </div>
          <span className="text-sm text-text-primary">
            {formatRelativeTime(user.last_login)}
          </span>
        </div>

        {/* Approval Info (for pending users) */}
        {userStatus === 'pending' && user.approved_at && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Approved:</span>
            </div>
            <span className="text-sm text-text-primary">
              {formatDate(user.approved_at)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Primary Action */}
        {userStatus === 'pending' ? (
          <Button 
            className="btn-primary flex-1 btn-sm" 
            onClick={() => onApprove?.(userId)}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
        ) : (
          <Button 
            className="btn-outline flex-1 btn-sm" 
            onClick={() => onView?.(userId)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        )}

        {/* Secondary Actions */}
        <div className="flex items-center gap-1">
          {userStatus !== 'pending' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit?.(userId)}
              className="text-text-secondary hover:text-text-primary"
              title="Edit User"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          
          {userStatus !== 'pending' && onHistory && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onHistory?.(userId)}
              className="text-text-secondary hover:text-blue-400"
              title="View History"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          
          {userStatus !== 'pending' && onDelete && userRole !== 'super_admin' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete?.(userId)}
              className="text-text-secondary hover:text-red-400"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          {userStatus === 'pending' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onReject?.(userId)}
              className="text-text-secondary hover:text-red-400"
              title="Reject User"
            >
              <UserX className="w-4 h-4" />
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="text-text-secondary hover:text-text-primary"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Activity Indicator */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>User ID: {userId.slice(0, 8)}...</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              user.last_login ? 'bg-green-400' : 'bg-gray-400'
            }`} />
            <span>{user.last_login ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
