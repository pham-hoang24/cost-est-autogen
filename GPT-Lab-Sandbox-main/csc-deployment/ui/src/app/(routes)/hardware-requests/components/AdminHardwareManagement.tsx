'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Server,
  HardDrive,
  Zap
} from 'lucide-react';

interface HardwareRequest {
  id: string;
  project_id: string;
  resource_id: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  duration_hours: number;
  justification: string;
  expected_usage: string;
  estimated_cost: number;
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'completed';
  created_at: string;
  admin_notes?: string;
  user_name?: string;
  project_name?: string;
  resource_name?: string;
}

interface AdminHardwareManagementProps {
  requests: HardwareRequest[];
  onApprove: (requestId: string, notes?: string) => void;
  onReject: (requestId: string, notes?: string) => void;
  onUpdateStatus: (requestId: string, status: string) => void;
}

export default function AdminHardwareManagement({ 
  requests, 
  onApprove, 
  onReject, 
  onUpdateStatus 
}: AdminHardwareManagementProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<HardwareRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.resource_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (requestId: string) => {
    setIsProcessing(requestId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onApprove(requestId, adminNotes);
    setSelectedRequest(null);
    setAdminNotes('');
    setIsProcessing(null);
  };

  const handleReject = async (requestId: string) => {
    setIsProcessing(requestId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onReject(requestId, adminNotes);
    setSelectedRequest(null);
    setAdminNotes('');
    setIsProcessing(null);
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setIsProcessing(requestId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdateStatus(requestId, newStatus);
    setIsProcessing(null);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    running: requests.filter(r => r.status === 'running').length,
    totalCost: requests.reduce((sum, r) => sum + r.estimated_cost, 0)
  };

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
              <div className="text-sm text-text-muted">Total Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.pending}</div>
              <div className="text-sm text-text-muted">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.approved}</div>
              <div className="text-sm text-text-muted">Approved</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">€{stats.totalCost.toLocaleString()}</div>
              <div className="text-sm text-text-muted">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-elevated border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-surface/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {request.user_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-text-muted">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">{request.project_name || 'Unknown Project'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">{request.resource_name || 'Unknown Resource'}</div>
                    <div className="text-sm text-text-muted">{request.duration_hours}h duration</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">€{request.estimated_cost}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary hover:text-primary-500 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing === request.id}
                            className="text-green-600 hover:text-green-500 transition-colors disabled:opacity-50"
                            title="Approve Request"
                          >
                            {isProcessing === request.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing === request.id}
                            className="text-red-600 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Reject Request"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {request.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'running')}
                          disabled={isProcessing === request.id}
                          className="text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
                          title="Start Resource"
                        >
                          {isProcessing === request.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      {request.status === 'running' && (
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'completed')}
                          disabled={isProcessing === request.id}
                          className="text-gray-600 hover:text-gray-500 transition-colors disabled:opacity-50"
                          title="Mark Complete"
                        >
                          {isProcessing === request.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-muted">User</label>
                  <div className="text-text-primary">{selectedRequest.user_name || 'Unknown'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Project</label>
                  <div className="text-text-primary">{selectedRequest.project_name || 'Unknown'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Resource</label>
                  <div className="text-text-primary">{selectedRequest.resource_name || 'Unknown'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Priority</label>
                  <div className="text-text-primary capitalize">{selectedRequest.priority}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Duration</label>
                  <div className="text-text-primary">{selectedRequest.duration_hours} hours</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted">Estimated Cost</label>
                  <div className="text-text-primary font-medium">€{selectedRequest.estimated_cost}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-muted">Justification</label>
                <div className="text-text-primary bg-surface p-3 rounded-lg mt-1">
                  {selectedRequest.justification}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-muted">Expected Usage</label>
                <div className="text-text-primary bg-surface p-3 rounded-lg mt-1">
                  {selectedRequest.expected_usage}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-muted">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  rows={3}
                  className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface/50">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={isProcessing === selectedRequest.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing === selectedRequest.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={isProcessing === selectedRequest.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing === selectedRequest.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
