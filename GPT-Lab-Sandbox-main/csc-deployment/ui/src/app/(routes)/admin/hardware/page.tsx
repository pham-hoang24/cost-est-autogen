'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info, 
  Search, 
  Filter,
  Activity,
  DollarSign,
  Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/Dialog';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Label } from '@/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { toast } from 'react-toastify';

interface HardwareResource {
  id: string;
  type: 'GPU' | 'CPU' | 'Memory' | 'Storage' | 'Network';
  name: string;
  cluster: string;
  location: string;
  specifications: any;
  status: 'available' | 'busy' | 'maintenance' | 'reserved';
  utilization: number;
  cost_per_hour: number;
  energy_efficiency: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface HardwareRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  project_name: string;
  resource_type: string;
  specifications: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  justification: string;
  expected_usage: string;
  start_date: string;
  end_date: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'allocated' | 'running' | 'completed' | 'cancelled';
  admin_notes: string;
  estimated_cost: number;
  created_at: string;
}

type HardwareTab = 'resources' | 'requests';

export default function AdminHardwarePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<HardwareTab>('resources');
  const [resources, setResources] = useState<HardwareResource[]>([]);
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resource Management Modal
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const [currentResource, setCurrentResource] = useState<Partial<HardwareResource>>({});

  // Request Management Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<HardwareRequest | null>(null);
  const [requestAdminNotes, setRequestAdminNotes] = useState('');
  const [requestAction, setRequestAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        setError('Access Denied: You do not have permission to view this page.');
        setLoading(false);
        return;
      }
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resourcesRes, requestsRes] = await Promise.all([
        fetch('/api/admin/hardware/resources', { headers }),
        fetch('/api/admin/hardware/requests', { headers }),
      ]);

      if (!resourcesRes.ok) throw new Error(`HTTP error! status: ${resourcesRes.status} for resources`);
      if (!requestsRes.ok) throw new Error(`HTTP error! status: ${requestsRes.status} for requests`);

      const resourcesData = await resourcesRes.json();
      const requestsData = await requestsRes.json();

      setResources(resourcesData.data);
      setRequests(requestsData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      toast.error(`Error fetching data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Resource Management Handlers
  const handleAddResource = () => {
    setIsEditingResource(false);
    setCurrentResource({
      type: 'GPU',
      name: '',
      cluster: '',
      location: '',
      specifications: {},
      status: 'available',
      cost_per_hour: 0,
      energy_efficiency: 0
    });
    setShowResourceModal(true);
  };

  const handleEditResource = (resource: HardwareResource) => {
    setIsEditingResource(true);
    setCurrentResource(resource);
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hardware resource?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/hardware/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete hardware resource.');
      toast.success('Hardware resource deleted successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(`Error deleting hardware resource: ${err.message}`);
    }
  };

  const submitResource = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = isEditingResource ? 'PUT' : 'POST';
      const url = isEditingResource ? `/api/admin/hardware/resources/${currentResource.id}` : '/api/admin/hardware/resources';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(currentResource),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save hardware resource.');
      }

      toast.success(`Hardware resource ${isEditingResource ? 'updated' : 'created'} successfully!`);
      setShowResourceModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Error saving hardware resource: ${err.message}`);
    }
  };

  // Request Management Handlers
  const handleReviewRequest = (request: HardwareRequest) => {
    setCurrentRequest(request);
    setRequestAdminNotes(request.admin_notes || '');
    setRequestAction('approve');
    setShowRequestModal(true);
  };

  const submitRequestDecision = async () => {
    if (!currentRequest) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = requestAction === 'approve' 
        ? `/api/admin/hardware/requests/${currentRequest.id}/approve`
        : `/api/admin/hardware/requests/${currentRequest.id}/reject`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminNotes: requestAdminNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request.');
      }

      toast.success(`Request ${requestAction}d successfully!`);
      setShowRequestModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Error updating request: ${err.message}`);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'GPU': return <Activity className="w-5 h-5 text-purple-500" />;
      case 'CPU': return <Cpu className="w-5 h-5 text-blue-500" />;
      case 'Memory': return <MemoryStick className="w-5 h-5 text-green-500" />;
      case 'Storage': return <HardDrive className="w-5 h-5 text-orange-500" />;
      case 'Network': return <Network className="w-5 h-5 text-cyan-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'green',
      busy: 'yellow',
      maintenance: 'gray',
      reserved: 'secondary',
      submitted: 'gray',
      under_review: 'yellow',
      approved: 'green',
      rejected: 'red',
      allocated: 'green',
      running: 'green',
      completed: 'green',
      cancelled: 'secondary'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      normal: 'gray',
      high: 'yellow',
      critical: 'red'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>{priority}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-primary">Loading Admin Hardware Management...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Error</h1>
          <p className="text-text-secondary">{error}</p>
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Button onClick={fetchData} className="mt-4">Retry</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Cpu className="w-8 h-8" /> Admin Hardware Management
        </h1>
        <p className="text-text-muted mt-2">Manage hardware resources and user requests.</p>
      </header>

      <nav className="mb-8 border-b border-border">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'resources' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Hardware Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Hardware Requests ({requests.filter(r => r.status === 'submitted' || r.status === 'under_review').length})
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-text-primary">Hardware Resources</h2>
              <Button onClick={handleAddResource} variant="primary" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Hardware Resource
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="p-6 border border-border flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <h3 className="text-xl font-semibold text-text-primary">{resource.name}</h3>
                    </div>
                    {getStatusBadge(resource.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Type:</span> {resource.type}
                    </p>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Cluster:</span> {resource.cluster}
                    </p>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Location:</span> {resource.location}
                    </p>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Utilization:</span> {resource.utilization}%
                    </p>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Cost:</span> €{resource.cost_per_hour}/hour
                    </p>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Energy Efficiency:</span> {resource.energy_efficiency}%
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-4 border-t border-border-light">
                    <Button onClick={() => handleEditResource(resource)} variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                    <Button onClick={() => handleDeleteResource(resource.id)} variant="primary" size="sm" className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-text-primary">Hardware Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Project</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Resource</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary">
                        {request.user_name} ({request.user_email}) - {request.user_role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">{request.project_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">{request.resource_type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getPriorityBadge(request.priority)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">€{request.estimated_cost}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {(request.status === 'submitted' || request.status === 'under_review') && (
                          <Button onClick={() => handleReviewRequest(request)} variant="outline" size="sm">
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Resource Management Modal */}
      <Dialog open={showResourceModal} onOpenChange={setShowResourceModal}>
        <DialogContent className="sm:max-w-[600px] bg-surface text-text-primary border border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">{isEditingResource ? 'Edit Hardware Resource' : 'Add Hardware Resource'}</DialogTitle>
            <DialogDescription className="text-text-muted">
              {isEditingResource ? 'Update the details of this hardware resource.' : 'Fill in the details for the new hardware resource.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right text-text-secondary">Type</Label>
              <Select value={currentResource.type || 'GPU'} onValueChange={(value) => setCurrentResource({ ...currentResource, type: value as any })}>
                <SelectTrigger className="col-span-3 bg-background text-text-primary border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-surface text-text-primary border-border">
                  <SelectItem value="GPU">GPU</SelectItem>
                  <SelectItem value="CPU">CPU</SelectItem>
                  <SelectItem value="Memory">Memory</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                  <SelectItem value="Network">Network</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-text-secondary">Name</Label>
              <Input id="name" value={currentResource.name || ''} onChange={(e) => setCurrentResource({ ...currentResource, name: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cluster" className="text-right text-text-secondary">Cluster</Label>
              <Input id="cluster" value={currentResource.cluster || ''} onChange={(e) => setCurrentResource({ ...currentResource, cluster: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right text-text-secondary">Location</Label>
              <Input id="location" value={currentResource.location || ''} onChange={(e) => setCurrentResource({ ...currentResource, location: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-text-secondary">Status</Label>
              <Select value={currentResource.status || 'available'} onValueChange={(value) => setCurrentResource({ ...currentResource, status: value as any })}>
                <SelectTrigger className="col-span-3 bg-background text-text-primary border-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-surface text-text-primary border-border">
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost_per_hour" className="text-right text-text-secondary">Cost per Hour (€)</Label>
              <Input id="cost_per_hour" type="number" step="0.01" value={currentResource.cost_per_hour || 0} onChange={(e) => setCurrentResource({ ...currentResource, cost_per_hour: parseFloat(e.target.value) })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="energy_efficiency" className="text-right text-text-secondary">Energy Efficiency (%)</Label>
              <Input id="energy_efficiency" type="number" step="0.1" value={currentResource.energy_efficiency || 0} onChange={(e) => setCurrentResource({ ...currentResource, energy_efficiency: parseFloat(e.target.value) })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResourceModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitResource}>Save Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Review Modal */}
      {currentRequest && (
        <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
          <DialogContent className="sm:max-w-[500px] bg-surface text-text-primary border border-border">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Review Hardware Request</DialogTitle>
              <DialogDescription className="text-text-muted">
                Review the request from {currentRequest.user_name} for {currentRequest.resource_type}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-text-secondary">
                <span className="font-medium">User:</span> {currentRequest.user_name} ({currentRequest.user_email}) - {currentRequest.user_role}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Project:</span> {currentRequest.project_name}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Resource:</span> {currentRequest.resource_type}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Priority:</span> {currentRequest.priority}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Justification:</span> {currentRequest.justification}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Expected Usage:</span> {currentRequest.expected_usage}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Duration:</span> {new Date(currentRequest.start_date).toLocaleDateString()} - {new Date(currentRequest.end_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-text-secondary">
                <span className="font-medium">Estimated Cost:</span> €{currentRequest.estimated_cost}
              </p>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requestAction" className="text-right text-text-secondary">Action</Label>
                <Select value={requestAction} onValueChange={(value) => setRequestAction(value as 'approve' | 'reject')}>
                  <SelectTrigger className="col-span-3 bg-background text-text-primary border-border">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface text-text-primary border-border">
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adminNotes" className="text-right text-text-secondary">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={requestAdminNotes}
                  onChange={(e) => setRequestAdminNotes(e.target.value)}
                  className="col-span-3 bg-background text-text-primary border-border"
                  placeholder="Add notes for the user regarding the decision."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={submitRequestDecision}>Submit Decision</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <footer className="mt-8 text-center text-text-muted text-sm">
        <p>🖥️ Admin Hardware Management - Resource Control Center</p>
      </footer>
    </div>
  );
}
