'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Mail
} from 'lucide-react';

interface AccountStatusCardProps {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    status?: string;
    created_at?: string;
    approved_at?: string;
    organization?: string;
  };
  onRefresh?: () => void;
}

export default function AccountStatusCard({ user, onRefresh }: AccountStatusCardProps) {
  const [loading, setLoading] = useState(false);

  const fetchUserStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return null; // Don't show anything for approved users
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          text: 'Pending Approval',
          description: 'Your account is waiting for administrator approval'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          text: 'Account Rejected',
          description: 'Your account has been rejected'
        };
      case 'suspended':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          text: 'Account Suspended',
          description: 'Your account has been suspended'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          text: 'Unknown Status',
          description: 'Account status is unknown'
        };
    }
  };

  const status = user?.status || 'pending';
  const statusInfo = getStatusInfo(status);

  // Don't show the card if user is approved or no status info
  if (!statusInfo) {
    return null;
  }

  const StatusIcon = statusInfo.icon;

  return (
    <div className={`mb-4 p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              <Badge className={`${statusInfo.color} ${statusInfo.bgColor} ${statusInfo.borderColor} border text-xs`}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">{statusInfo.description}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchUserStatus}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-2 py-1 h-6"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {status === 'pending' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
          <Mail className="w-3 h-3" />
          You'll receive an email notification once approved.
        </div>
      )}
    </div>
  );
}