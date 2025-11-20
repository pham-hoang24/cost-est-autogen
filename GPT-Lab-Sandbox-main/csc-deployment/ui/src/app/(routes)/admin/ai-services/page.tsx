'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, Plus, Edit, Trash2, Users, Clock, CheckCircle, XCircle, 
  AlertCircle, Search, Filter, ExternalLink, Shield, BookOpen, 
  Zap, Database, Eye, EyeOff, Settings, Unlock, Lock
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

interface AIService {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: string;
  access_level: string;
  requires_approval: boolean;
  max_users: number;
  current_users: number;
  status: string;
  documentation: string;
  api_endpoint?: string;
  cost_per_request?: number;
  gdpr_compliant: boolean;
  created_at: string;
  updated_at: string;
}

interface AccessRequest {
  id: string;
  user_id: string;
  service_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  admin_notes?: string;
  user_name: string;
  user_email: string;
  user_role: string;
  service_name: string;
  service_description: string;
}

export default function AdminAIServicesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
  const [services, setServices] = useState<AIService[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AIService | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const categories = ['all', 'Machine Learning', 'Language Models', 'Computer Vision', 'NLP', 'Data Science', 'Evaluation'];

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchAccessRequests();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/ai-services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/ai-service-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccessRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ai-service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        setShowRequestModal(false);
        setSelectedRequest(null);
        setAdminNotes('');
        fetchAccessRequests();
        alert('Request approved successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ai-service-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        setShowRequestModal(false);
        setSelectedRequest(null);
        setAdminNotes('');
        fetchAccessRequests();
        alert('Request rejected successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/ai-services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchServices();
        alert('Service deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'public': return <Unlock className="w-4 h-4 text-green-500" />;
      case 'restricted': return <Lock className="w-4 h-4 text-yellow-500" />;
      default: return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'restricted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRequests = accessRequests.filter(request => {
    const matchesSearch = request.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Brain className="w-8 h-8" /> AI Services Management
          </h1>
          <p className="text-text-muted mt-2">
            Manage AI services and approve access requests.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'services' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'requests' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Access Requests ({accessRequests.filter(r => r.status === 'pending').length} pending)
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder={activeTab === 'services' ? 'Search services...' : 'Search requests...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {activeTab === 'services' && (
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Service
              </Button>
            </div>
          )}
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id} className="p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold text-text-primary">{service.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAccessLevelIcon(service.access_level)}
                      <Badge className={getAccessLevelColor(service.access_level)}>
                        {service.access_level}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-text-secondary text-sm mb-4">{service.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-muted">Category:</span>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-text-muted" />
                      <span className="text-text-muted">
                        {service.current_users}/{service.max_users} users
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-muted">Status:</span>
                      <Badge variant={service.status === 'active' ? 'green' : 'yellow'}>
                        {service.status}
                      </Badge>
                    </div>
                    {service.gdpr_compliant && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Shield className="w-4 h-4" />
                        <span>GDPR Compliant</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{request.service_name}</h3>
                      <p className="text-text-secondary text-sm">{request.service_description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge variant={
                        request.status === 'approved' ? 'green' :
                        request.status === 'pending' ? 'yellow' : 'red'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-text-muted">Requested by</p>
                      <p className="font-medium text-text-primary">{request.user_name}</p>
                      <p className="text-sm text-text-secondary">{request.user_email}</p>
                      <Badge variant="outline" className="mt-1">{request.user_role}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Requested on</p>
                      <p className="text-text-primary">{new Date(request.requested_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Status</p>
                      <p className="text-text-primary">
                        {request.status === 'approved' ? 'Approved' :
                         request.status === 'pending' ? 'Pending Review' : 'Rejected'}
                      </p>
                    </div>
                  </div>

                  {request.admin_notes && (
                    <div className="mb-4 p-3 bg-background-secondary rounded-lg border border-border">
                      <p className="text-sm text-text-muted mb-1">Admin Notes:</p>
                      <p className="text-sm text-text-primary">{request.admin_notes}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRequestModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Review Request
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}

            {filteredRequests.length === 0 && !loading && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">No requests found</h3>
                <p className="text-text-secondary">No access requests match your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Request Review Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 w-full max-w-2xl mx-4 border border-border">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Review Access Request
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Service: {selectedRequest.service_name}</h4>
                  <p className="text-text-secondary text-sm">{selectedRequest.service_description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Requested by: {selectedRequest.user_name}</h4>
                  <p className="text-text-secondary text-sm">{selectedRequest.user_email} ({selectedRequest.user_role})</p>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary mb-2">Request Details</h4>
                  <div className="p-3 bg-background-secondary rounded-lg border border-border">
                    <p className="text-sm text-text-primary">{selectedRequest.admin_notes}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="w-full p-3 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
