'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import UserAvatar from './UserAvatar';
import { 
  X, 
  History, 
  User,
  Mail,
  Clock,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  RotateCcw,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface UserHistoryModalProps {
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
  };
}

interface HistoryEntry {
  id: string;
  user_id: string;
  action_type: string;
  actor_id: string;
  actor_email: string;
  old_values: string;
  new_values: string;
  action_description: string;
  ip_address: string;
  created_at: string;
}

export default function UserHistoryModal({ isOpen, onClose, user }: UserHistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && user && user.id) {
      fetchUserHistory();
    }
  }, [isOpen, user?.id]);

  const fetchUserHistory = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/governance/users/${user.id}/history`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setHistory(result.data || []);
      } else {
        console.error('Failed to fetch user history');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'created': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'updated': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'restored': return <RotateCcw className="w-4 h-4 text-green-600" />;
      case 'status_changed': return <UserCheck className="w-4 h-4 text-yellow-600" />;
      case 'role_changed': return <User className="w-4 h-4 text-purple-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'created': return 'green';
      case 'updated': return 'secondary';
      case 'deleted': return 'red';
      case 'restored': return 'green';
      case 'status_changed': return 'yellow';
      case 'role_changed': return 'secondary';
      default: return 'gray';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValues = (values: string) => {
    try {
      const parsed = JSON.parse(values);
      return Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="flex justify-between text-sm">
          <span className="font-medium text-text-secondary">{key}:</span>
          <span className="text-text-primary">{String(value)}</span>
        </div>
      ));
    } catch {
      return <span className="text-text-secondary">{values}</span>;
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">User History</h2>
              <p className="text-sm text-text-secondary">
                Activity log for {user.first_name} {user.last_name}
              </p>
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

        {/* User Info */}
        <div className="px-6 py-4 border-b border-border bg-gray-50">
          <div className="flex items-center space-x-4">
            <UserAvatar 
              user={{ 
                first_name: user.first_name || '', 
                last_name: user.last_name || '',
                role: user.role_type || user.role || 'viewer'
              }} 
              size="md"
            />
            <div>
              <h3 className="font-medium text-text-primary">
                {user.first_name} {user.last_name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-text-secondary">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No History Found</h3>
              <p className="text-text-secondary">No activity history available for this user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpanded(entry.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {expandedItems.has(entry.id) ? (
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
                      )}
                      {getActionIcon(entry.action_type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text-primary">
                            {formatActionType(entry.action_type)}
                          </span>
                          <Badge variant={getActionColor(entry.action_type)}>
                            {entry.action_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">{entry.action_description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm text-text-secondary">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(entry.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-text-tertiary">
                        by {entry.actor_email}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems.has(entry.id) && (
                    <div className="border-t border-border p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entry.old_values && entry.old_values !== '{}' && (
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">Previous Values</h4>
                            <div className="bg-white border border-border rounded p-3 space-y-1">
                              {formatValues(entry.old_values)}
                            </div>
                          </div>
                        )}
                        
                        {entry.new_values && entry.new_values !== '{}' && (
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">New Values</h4>
                            <div className="bg-white border border-border rounded p-3 space-y-1">
                              {formatValues(entry.new_values)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {entry.ip_address && (
                        <div className="mt-4 text-sm text-text-secondary">
                          <span className="font-medium">IP Address:</span> {entry.ip_address}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-gray-50">
          <div className="text-sm text-text-secondary">
            {history.length} history entries found
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
