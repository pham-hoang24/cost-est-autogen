'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Activity,
  DollarSign,
  Zap,
  Calendar,
  User,
  Folder,
  Server,
  Filter,
  BarChart3
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/Dialog';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Label } from '@/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { toast } from 'react-toastify';
import NewHardwareRequestModal from './components/NewHardwareRequestModal';
import AdminHardwareManagement from './components/AdminHardwareManagement';

interface HardwareResource {
  id: string;
  type: 'GPU' | 'CPU' | 'Memory' | 'Storage' | 'Network';
  name: string;
  cluster: string;
  location: string;
  cores?: number;
  memory?: string;
  specifications: {
    cores?: number;
    memory?: string;
    storage?: string;
    bandwidth?: string;
    gpu_memory?: string;
    architecture?: string;
    cuda_cores?: number;
    tensor_cores?: number;
    memory_bandwidth?: string;
    base_clock?: string;
    boost_clock?: string;
    cache?: string;
    capacity?: string;
    iops?: string;
    protocol?: string;
    redundancy?: string;
    tiers?: string;
    qubits?: string;
    frameworks?: string;
    logic_cells?: string;
    dsp_slices?: string;
    memory_blocks?: string;
    nodes?: string;
    kubernetes_version?: string;
    cloud_providers?: string;
  };
  status: 'available' | 'busy' | 'maintenance' | 'reserved';
  utilization: number;
  cost_per_hour: number;
  energy_efficiency: number;
}

interface HardwareRequest {
  id: string;
  project_id: string;
  resource_id: string;
  project_name: string;
  resource_type: string;
  specifications: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  justification: string;
  expected_usage: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'completed';
  admin_notes: string;
  estimated_cost: number;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
}

export default function HardwareRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [resources, setResources] = useState<HardwareResource[]>([]);
  const [requests, setRequests] = useState<HardwareRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request Creation Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Partial<HardwareRequest>>({});
  
  // Admin Management
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);
  
  // Direct request functionality
  const [selectedResource, setSelectedResource] = useState<HardwareResource | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for comprehensive hardware resources similar to CSC infrastructure
      const mockResources: HardwareResource[] = [
        // High-Performance Computing (HPC) Resources
        {
          id: 'hpc-1',
          name: 'NVIDIA A100 80GB HPC Cluster',
          type: 'GPU',
          cluster: 'Mahti',
          location: 'CSC Kajaani',
          cores: 128,
          memory: '1TB DDR4',
          specifications: {
            cores: 128,
            memory: '1TB DDR4',
            gpu_memory: '80GB HBM2e',
            architecture: 'Ampere',
            cuda_cores: 6912,
            tensor_cores: 432,
            memory_bandwidth: '2039 GB/s'
          },
          status: 'available',
          utilization: 45,
          cost_per_hour: 15.50,
          energy_efficiency: 85
        },
        {
          id: 'hpc-2',
          name: 'NVIDIA H100 80GB AI Workstation',
          type: 'GPU',
          cluster: 'Puhti',
          location: 'CSC Espoo',
          specifications: {
            cores: 64,
            memory: '512GB DDR5',
            gpu_memory: '80GB HBM3',
            architecture: 'Hopper',
            cuda_cores: 16896,
            tensor_cores: 528,
            memory_bandwidth: '3350 GB/s'
          },
          status: 'busy',
          utilization: 78,
          cost_per_hour: 25.00,
          energy_efficiency: 92
        },
        {
          id: 'hpc-3',
          name: 'AMD EPYC 7763 CPU Cluster',
          type: 'CPU',
          cluster: 'Mahti',
          location: 'CSC Kajaani',
          specifications: {
            cores: 128,
            memory: '2TB DDR4',
            architecture: 'Zen 3',
            base_clock: '2.45 GHz',
            boost_clock: '3.5 GHz',
            cache: '256MB L3'
          },
          status: 'available',
          utilization: 32,
          cost_per_hour: 8.75,
          energy_efficiency: 88
        },
        // Storage Resources
        {
          id: 'storage-1',
          name: 'High-Performance Parallel File System',
          type: 'Storage',
          cluster: 'Lustre',
          location: 'CSC Kajaani',
          specifications: {
            capacity: '10PB',
            bandwidth: '100 GB/s',
            iops: '1000000',
            protocol: 'Lustre',
            redundancy: '3x'
          },
          status: 'available',
          utilization: 65,
          cost_per_hour: 2.50,
          energy_efficiency: 75
        },
        {
          id: 'storage-2',
          name: 'Object Storage Archive',
          type: 'Storage',
          cluster: 'Allas',
          location: 'CSC Kajaani',
          specifications: {
            capacity: '100PB',
            bandwidth: '10 GB/s',
            protocol: 'S3',
            redundancy: '3x',
            tiers: 'Hot, Warm, Cold'
          },
          status: 'available',
          utilization: 28,
          cost_per_hour: 0.15,
          energy_efficiency: 90
        },
        // Specialized Resources
        {
          id: 'specialized-1',
          name: 'Quantum Computing Simulator',
          type: 'GPU',
          cluster: 'Quantum',
          location: 'CSC Espoo',
          specifications: {
            cores: 256,
            memory: '4TB DDR4',
            qubits: '40',
            architecture: 'Quantum Simulation',
            frameworks: 'Qiskit, Cirq, PennyLane'
          },
          status: 'busy',
          utilization: 85,
          cost_per_hour: 45.00,
          energy_efficiency: 70
        },
        {
          id: 'specialized-2',
          name: 'FPGA Development Platform',
          type: 'GPU',
          cluster: 'FPGA',
          location: 'CSC Espoo',
          specifications: {
            cores: 32,
            memory: '128GB DDR4',
            architecture: 'Xilinx UltraScale+',
            logic_cells: '2.5M',
            dsp_slices: '6840',
            memory_blocks: '1080'
          },
          status: 'available',
          utilization: 15,
          cost_per_hour: 12.00,
          energy_efficiency: 82
        },
        // Cloud Resources
        {
          id: 'cloud-1',
          name: 'Multi-Cloud Kubernetes Cluster',
          type: 'CPU',
          cluster: 'Kubernetes',
          location: 'Multi-Region',
          specifications: {
            cores: 64,
            memory: '256GB DDR4',
            storage: '10TB SSD',
            nodes: '8',
            kubernetes_version: '1.28',
            cloud_providers: 'AWS, Azure, GCP'
          },
          status: 'available',
          utilization: 42,
          cost_per_hour: 5.25,
          energy_efficiency: 95
        }
      ];

      const mockRequests: HardwareRequest[] = [
        {
          id: 'req-1',
          project_id: 'proj-1',
          resource_id: 'gpu-1',
          project_name: 'Large Language Model Training',
          resource_type: 'GPU',
          specifications: {
            gpu_memory: '80GB',
            cuda_cores: '6912',
            duration_hours: 72
          },
          priority: 'high',
          justification: 'Training a Finnish language model for research purposes. This requires significant GPU memory and compute power for transformer model training.',
          expected_usage: 'Will use PyTorch with distributed training across multiple GPUs. Expected to process 100GB of Finnish text data.',
          start_date: '2024-01-15',
          end_date: '2024-01-18',
          duration_hours: 72,
          status: 'approved',
          admin_notes: 'Approved for high-priority research project. Resource allocation confirmed.',
          estimated_cost: 1116.00,
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: 'req-2',
          project_id: 'proj-2',
          resource_id: 'gpu-2',
          project_name: 'Computer Vision Research',
          resource_type: 'GPU',
          specifications: {
            gpu_memory: '80GB',
            cuda_cores: '16896',
            duration_hours: 48
          },
          priority: 'normal',
          justification: 'Developing new computer vision algorithms for autonomous systems. Need latest GPU architecture for optimal performance.',
          expected_usage: 'Will use TensorFlow and OpenCV for real-time image processing and neural network training.',
          start_date: '2024-01-20',
          end_date: '2024-01-22',
          duration_hours: 48,
          status: 'pending',
          admin_notes: 'Under review - checking resource availability and project priority.',
          estimated_cost: 1200.00,
          created_at: '2024-01-18T09:15:00Z'
        },
        {
          id: 'req-3',
          project_id: 'proj-3',
          resource_id: 'quantum-1',
          project_name: 'Quantum Algorithm Development',
          resource_type: 'GPU',
          specifications: {
            qubits: '40',
            duration_hours: 24,
            frameworks: 'Qiskit'
          },
          priority: 'critical',
          justification: 'Urgent quantum computing research for EU project deadline. Need specialized quantum simulator.',
          expected_usage: 'Will use Qiskit for quantum circuit simulation and algorithm development.',
          start_date: '2024-01-25',
          end_date: '2024-01-26',
          duration_hours: 24,
          status: 'running',
          admin_notes: 'Approved and allocated. High priority due to EU project deadline.',
          estimated_cost: 1080.00,
          created_at: '2024-01-20T16:45:00Z'
        }
      ];

      const mockProjects: Project[] = [
        {
          id: 'proj-1',
          name: 'Large Language Model Training',
          description: 'Training Finnish language models for research and development',
          status: 'active'
        },
        {
          id: 'proj-2',
          name: 'Computer Vision Research',
          description: 'Developing autonomous systems and computer vision algorithms',
          status: 'active'
        },
        {
          id: 'proj-3',
          name: 'Quantum Algorithm Development',
          description: 'Research and development of quantum computing algorithms',
          status: 'active'
        },
        {
          id: 'proj-4',
          name: 'Data Science Platform',
          description: 'Building scalable data science and machine learning platform',
          status: 'active'
        }
      ];

      setResources(mockResources);
      setRequests(mockRequests);
      setProjects(mockProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setCurrentRequest({
      resource_type: 'GPU',
      priority: 'normal',
      justification: '',
      expected_usage: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specifications: {}
    });
    setShowRequestModal(true);
  };

  const handleEditRequest = (request: HardwareRequest) => {
    setCurrentRequest(request);
    setShowRequestModal(true);
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hardware request?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hardware/requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete hardware request.');
      toast.success('Hardware request deleted successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(`Error deleting hardware request: ${err.message}`);
    }
  };

  const submitRequest = async () => {
    if (!currentRequest.project_id || !currentRequest.justification || !currentRequest.expected_usage) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = currentRequest.id ? 'PUT' : 'POST';
      const url = currentRequest.id ? `/api/hardware/requests/${currentRequest.id}` : '/api/hardware/requests';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(currentRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save hardware request.');
      }

      toast.success(`Hardware request ${currentRequest.id ? 'updated' : 'created'} successfully!`);
      setShowRequestModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(`Error saving hardware request: ${err.message}`);
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
      draft: 'gray',
      submitted: 'accent',
      under_review: 'yellow',
      approved: 'green',
      rejected: 'red',
      allocated: 'green',
      running: 'green',
      completed: 'green',
      cancelled: 'gray'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'gray',
      normal: 'accent',
      high: 'yellow',
      critical: 'red'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>{priority}</Badge>;
  };

  const calculateEstimatedCost = () => {
    if (!currentRequest.resource_type || !currentRequest.start_date || !currentRequest.end_date) return 0;
    
    const startDate = new Date(currentRequest.start_date);
    const endDate = new Date(currentRequest.end_date);
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    
    const resource = resources.find(r => r.type === currentRequest.resource_type);
    if (!resource) return 0;
    
    return Math.round(hours * resource.cost_per_hour * 100) / 100;
  };

  // Admin functionality handlers
  const handleApproveRequest = async (requestId: string, notes?: string) => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const, admin_notes: notes || '' }
          : req
      );
      setRequests(updatedRequests);
      toast.success('Request approved successfully!');
    } catch (err: any) {
      toast.error(`Error approving request: ${err.message}`);
    }
  };

  const handleRejectRequest = async (requestId: string, notes?: string) => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const, admin_notes: notes || '' }
          : req
      );
      setRequests(updatedRequests);
      toast.success('Request rejected successfully!');
    } catch (err: any) {
      toast.error(`Error rejecting request: ${err.message}`);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status: status as any }
          : req
      );
      setRequests(updatedRequests);
      toast.success('Request status updated successfully!');
    } catch (err: any) {
      toast.error(`Error updating request status: ${err.message}`);
    }
  };

  const handleNewRequest = (request: any) => {
    const newRequest = {
      ...request,
      id: `req_${Date.now()}`,
      user_name: user?.firstName || user?.email || 'Demo User',
      project_name: projects.find(p => p.id === request.project_id)?.name || 'Unknown Project',
      resource_name: resources.find(r => r.id === request.resource_id)?.name || 'Unknown Resource',
      created_at: new Date().toISOString()
    };
    setRequests(prev => [newRequest, ...prev]);
    toast.success('Hardware request submitted successfully!');
  };

  const handleDirectRequest = (resource: HardwareResource) => {
    // Set the selected resource and open the modal
    setSelectedResource(resource);
    setShowRequestModal(true);
  };

  // Check if user is admin
  useEffect(() => {
    if (user?.email === 'admin@sw4e.org' || user?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-primary">Loading Hardware Requests...</p>
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
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Cpu className="w-8 h-8" /> {t('hardware.title')}
            </h1>
            <p className="text-text-muted mt-2">{t('hardware.subtitle')}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAdminView(!showAdminView)}
                variant={showAdminView ? "primary" : "outline"}
                className="flex items-center gap-2"
              >
                <Server className="w-4 h-4" />
                {showAdminView ? 'User View' : 'Admin View'}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {showAdminView ? (
          <AdminHardwareManagement
            requests={requests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onUpdateStatus={handleUpdateRequestStatus}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">My Hardware Requests</h2>
              <Button onClick={() => setShowRequestModal(true)} variant="primary" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Request
              </Button>
            </div>

        {requests.length === 0 ? (
          <Card className="p-8 text-center">
            <Cpu className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Hardware Requests</h3>
            <p className="text-text-secondary mb-4">You haven't made any hardware requests yet.</p>
            <Button onClick={handleCreateRequest} variant="primary">Create Your First Request</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="p-6 border border-border flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(request.resource_type)}
                    <h3 className="text-lg font-semibold text-text-primary">{request.resource_type} Request</h3>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Project:</span> {request.project_name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Priority:</span> {getPriorityBadge(request.priority)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Duration:</span> {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Estimated Cost:</span> €{request.estimated_cost}
                  </p>
                  {request.admin_notes && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-3 pt-4 border-t border-border-light">
                  {(request.status === 'pending') && (
                    <Button onClick={() => handleEditRequest(request)} variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                  )}
                  {(request.status === 'pending') && (
                    <Button onClick={() => handleDeleteRequest(request.id)} variant="outline" size="sm" className="flex items-center gap-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Resource Statistics Dashboard */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Resource Statistics Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total Resources</p>
                  <p className="text-2xl font-bold text-text-primary">{resources.length}</p>
                </div>
                <Server className="w-8 h-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Available Now</p>
                  <p className="text-2xl font-bold text-green-600">
                    {resources.filter(r => r.status === 'available').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Average Utilization</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(resources.reduce((acc, r) => acc + r.utilization, 0) / resources.length)}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Energy Efficiency</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(resources.reduce((acc, r) => acc + r.energy_efficiency, 0) / resources.length)}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>
        </div>

        {/* Available Resources Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-text-primary">Available Hardware Resources</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="p-6 border border-border flex flex-col hover:shadow-lg transition-all duration-200 hover:border-primary/20 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.type)}
                    <h3 className="text-lg font-semibold text-text-primary">{resource.name}</h3>
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
                    <span className="font-medium">Utilization:</span> 
                    <span className={`ml-1 ${resource.utilization > 80 ? 'text-red-500' : resource.utilization > 60 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {resource.utilization}%
                    </span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Cost:</span> €{resource.cost_per_hour}/hour
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Energy Efficiency:</span> 
                    <span className={`ml-1 ${resource.energy_efficiency > 85 ? 'text-green-500' : resource.energy_efficiency > 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {resource.energy_efficiency}%
                    </span>
                  </p>
                  
                  {/* Detailed Specifications */}
                  {resource.specifications.cores && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Cores:</span> {resource.specifications.cores}
                    </p>
                  )}
                  {resource.specifications.memory && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Memory:</span> {resource.specifications.memory}
                    </p>
                  )}
                  {resource.specifications.gpu_memory && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">GPU Memory:</span> {resource.specifications.gpu_memory}
                    </p>
                  )}
                  {resource.specifications.architecture && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Architecture:</span> {resource.specifications.architecture}
                    </p>
                  )}
                  {resource.specifications.cuda_cores && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">CUDA Cores:</span> {resource.specifications.cuda_cores.toLocaleString()}
                    </p>
                  )}
                  {resource.specifications.capacity && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Capacity:</span> {resource.specifications.capacity}
                    </p>
                  )}
                  {resource.specifications.bandwidth && (
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium">Bandwidth:</span> {resource.specifications.bandwidth}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-3 pt-4 border-t border-border-light">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Info className="w-4 h-4" /> View Details
                  </Button>
                  {resource.status === 'available' ? (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                      onClick={() => handleDirectRequest(resource)}
                    >
                      <Plus className="w-4 h-4" /> Request Now
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Clock className="w-4 h-4" /> {resource.status === 'busy' ? 'In Use' : 'Unavailable'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
          </>
        )}
      </main>

      {/* New Hardware Request Modal */}
      <NewHardwareRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedResource(null);
        }}
        resources={resources}
        projects={projects}
        onSubmit={handleNewRequest}
        preSelectedResource={selectedResource || undefined}
      />

      {/* Legacy Request Creation Modal */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[600px] bg-surface text-text-primary border border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">{currentRequest.id ? 'Edit Hardware Request' : 'Create Hardware Request'}</DialogTitle>
            <DialogDescription className="text-text-muted">
              {currentRequest.id ? 'Update your hardware request details.' : 'Fill in the details for your hardware request.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_id" className="text-right text-text-secondary">Project *</Label>
              <Select value={currentRequest.project_id || ''} onValueChange={(value) => setCurrentRequest({ ...currentRequest, project_id: value })}>
                <SelectTrigger className="col-span-3 bg-background text-text-primary border-border">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-surface text-text-primary border-border">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource_type" className="text-right text-text-secondary">Resource Type *</Label>
              <Select value={currentRequest.resource_type || 'GPU'} onValueChange={(value) => setCurrentRequest({ ...currentRequest, resource_type: value })}>
                <SelectTrigger className="col-span-3 bg-background text-text-primary border-border">
                  <SelectValue placeholder="Select resource type" />
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
              <Label htmlFor="priority" className="text-right text-text-secondary">Priority</Label>
              <Select value={currentRequest.priority || 'normal'} onValueChange={(value) => setCurrentRequest({ ...currentRequest, priority: value as any })}>
                <SelectTrigger className="col-span-3 bg-background text-text-primary border-border">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-surface text-text-primary border-border">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right text-text-secondary">Start Date *</Label>
              <Input id="start_date" type="date" value={currentRequest.start_date || ''} onChange={(e) => setCurrentRequest({ ...currentRequest, start_date: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right text-text-secondary">End Date *</Label>
              <Input id="end_date" type="date" value={currentRequest.end_date || ''} onChange={(e) => setCurrentRequest({ ...currentRequest, end_date: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="justification" className="text-right text-text-secondary">Justification *</Label>
              <Textarea id="justification" value={currentRequest.justification || ''} onChange={(e) => setCurrentRequest({ ...currentRequest, justification: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" placeholder="Why do you need this hardware resource?" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expected_usage" className="text-right text-text-secondary">Expected Usage *</Label>
              <Textarea id="expected_usage" value={currentRequest.expected_usage || ''} onChange={(e) => setCurrentRequest({ ...currentRequest, expected_usage: e.target.value })} className="col-span-3 bg-background text-text-primary border-border" placeholder="Describe how you plan to use this resource" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimated_cost" className="text-right text-text-secondary">Estimated Cost</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input id="estimated_cost" type="number" step="0.01" value={calculateEstimatedCost()} readOnly className="bg-background text-text-primary border-border" />
                <span className="text-sm text-text-muted">€</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitRequest}>Save Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="mt-8 text-center text-text-muted text-sm">
        <p>🖥️ Hardware Requests - Resource Management</p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            🎭 Demo Version - This is a demonstration of the hardware resource management system
          </p>
          <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
            All data is simulated for demonstration purposes
          </p>
        </div>
      </footer>
    </div>
  );
}
