'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Cpu, 
  Zap, 
  Clock, 
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings,
  Play,
  Pause,
  Square,
  TrendingUp,
  Activity,
  Server
} from 'lucide-react';

interface GPUAllocationServiceProps {
  service: any;
}

export default function GPUAllocationService({ service }: GPUAllocationServiceProps) {
  const [currentView, setCurrentView] = useState('overview');
  const [gpuClusters, setGpuClusters] = useState<any[]>([]);
  const [activeAllocations, setActiveAllocations] = useState<any[]>([]);
  const [allocationRequest, setAllocationRequest] = useState({
    gpuType: 'A100',
    quantity: 1,
    duration: 2,
    priority: 'medium',
    projectName: ''
  });

  // Initialize GPU cluster data
  useEffect(() => {
    setGpuClusters([
      {
        id: 'cluster-1',
        name: 'High-Performance Cluster',
        location: 'EU-West-1',
        gpuType: 'A100',
        totalGPUs: 32,
        availableGPUs: 18,
        utilizationRate: 56.3,
        costPerHour: 3.20,
        status: 'healthy'
      },
      {
        id: 'cluster-2',
        name: 'Training Cluster',
        location: 'EU-Central-1',
        gpuType: 'V100',
        totalGPUs: 64,
        availableGPUs: 42,
        utilizationRate: 34.4,
        costPerHour: 2.40,
        status: 'healthy'
      },
      {
        id: 'cluster-3',
        name: 'Inference Cluster',
        location: 'EU-West-2',
        gpuType: 'T4',
        totalGPUs: 128,
        availableGPUs: 95,
        utilizationRate: 25.8,
        costPerHour: 1.80,
        status: 'healthy'
      }
    ]);

    setActiveAllocations([
      {
        id: 'alloc-1',
        projectName: 'BERT Fine-tuning',
        gpuType: 'A100',
        quantity: 4,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        duration: 6,
        remainingTime: 2.5,
        status: 'running',
        cost: 76.80,
        utilization: 94.2
      },
      {
        id: 'alloc-2',
        projectName: 'Image Classification',
        gpuType: 'V100',
        quantity: 2,
        startTime: new Date(Date.now() - 1800000).toISOString(),
        duration: 4,
        remainingTime: 3.5,
        status: 'running',
        cost: 33.60,
        utilization: 87.6
      },
      {
        id: 'alloc-3',
        projectName: 'Data Preprocessing',
        gpuType: 'T4',
        quantity: 8,
        startTime: new Date(Date.now() - 900000).toISOString(),
        duration: 1,
        remainingTime: 0.75,
        status: 'running',
        cost: 14.40,
        utilization: 45.3
      }
    ]);
  }, []);

  const requestAllocation = () => {
    if (!allocationRequest.projectName) {
      alert('Please enter a project name');
      return;
    }

    const newAllocation = {
      id: `alloc-${Date.now()}`,
      ...allocationRequest,
      startTime: new Date().toISOString(),
      remainingTime: allocationRequest.duration,
      status: 'pending',
      cost: 0,
      utilization: 0
    };

    setActiveAllocations(prev => [...prev, newAllocation]);
    setAllocationRequest({
      gpuType: 'A100',
      quantity: 1,
      duration: 2,
      priority: 'medium',
      projectName: ''
    });
    alert('GPU allocation request submitted successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'running': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'running': return 'secondary';
      case 'pending': return 'yellow';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">GPU Resource Allocation</h2>
            <p className="text-blue-200">On-demand GPU clusters for AI training and inference</p>
          </div>
        </div>
        <p className="text-slate-300">
          Intelligent GPU resource allocation with automatic scaling, cost optimization, 
          and real-time monitoring across multiple data centers.
        </p>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant={currentView === 'overview' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Cluster Overview
        </Button>
        <Button 
          onClick={() => setCurrentView('allocations')}
          variant={currentView === 'allocations' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Active Allocations
        </Button>
        <Button 
          onClick={() => setCurrentView('request')}
          variant={currentView === 'request' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Request GPUs
        </Button>
      </div>

      {/* Cluster Overview */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">224</div>
              <div className="text-sm text-blue-300">Total GPUs</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">155</div>
              <div className="text-sm text-green-300">Available</div>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">30.8%</div>
              <div className="text-sm text-orange-300">Avg Utilization</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">$2.47</div>
              <div className="text-sm text-purple-300">Avg Cost/Hour</div>
            </div>
          </div>

          {/* Cluster Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gpuClusters.map((cluster) => (
              <Card key={cluster.id} className="p-6 bg-slate-800 border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{cluster.name}</h3>
                  <Badge variant={getStatusBadge(cluster.status)}>
                    {cluster.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 text-sm">{cluster.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">GPU Type:</span>
                      <span className="text-white ml-1">{cluster.gpuType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Available:</span>
                      <span className="text-white ml-1">{cluster.availableGPUs}/{cluster.totalGPUs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Utilization:</span>
                      <span className="text-white ml-1">{cluster.utilizationRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost/Hour:</span>
                      <span className="text-white ml-1">${cluster.costPerHour}</span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Utilization</span>
                      <span>{cluster.utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${cluster.utilizationRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Availability Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Availability</span>
                      <span>{Math.round((cluster.availableGPUs / cluster.totalGPUs) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(cluster.availableGPUs / cluster.totalGPUs) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4 btn-primary">
                  Allocate GPUs
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Allocations */}
      {currentView === 'allocations' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Active GPU Allocations</h3>
            
            <div className="space-y-4">
              {activeAllocations.map((allocation) => (
                <Card key={allocation.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Cpu className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{allocation.projectName}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={getStatusBadge(allocation.status)}>
                            {allocation.status}
                          </Badge>
                          <span className="text-slate-400">
                            {allocation.quantity}x {allocation.gpuType}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {allocation.status === 'running' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Pause className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Square className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Started:</span>
                      <span className="text-white ml-1">
                        {new Date(allocation.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white ml-1">{allocation.duration}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Remaining:</span>
                      <span className="text-white ml-1">{allocation.remainingTime}h</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-white ml-1">${allocation.cost}</span>
                    </div>
                  </div>

                  {allocation.status === 'running' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>GPU Utilization</span>
                        <span>{allocation.utilization}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${allocation.utilization}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Request GPUs */}
      {currentView === 'request' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Request GPU Allocation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g., BERT Fine-tuning Project"
                    value={allocationRequest.projectName}
                    onChange={(e) => setAllocationRequest({...allocationRequest, projectName: e.target.value})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">GPU Type</label>
                  <select 
                    value={allocationRequest.gpuType}
                    onChange={(e) => setAllocationRequest({...allocationRequest, gpuType: e.target.value})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="A100">NVIDIA A100 (80GB) - $3.20/hour</option>
                    <option value="V100">NVIDIA V100 (32GB) - $2.40/hour</option>
                    <option value="T4">NVIDIA T4 (16GB) - $1.80/hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Quantity</label>
                  <select 
                    value={allocationRequest.quantity}
                    onChange={(e) => setAllocationRequest({...allocationRequest, quantity: parseInt(e.target.value)})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value={1}>1 GPU</option>
                    <option value={2}>2 GPUs</option>
                    <option value={4}>4 GPUs</option>
                    <option value={8}>8 GPUs</option>
                    <option value={16}>16 GPUs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={allocationRequest.duration}
                    onChange={(e) => setAllocationRequest({...allocationRequest, duration: parseInt(e.target.value)})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Priority</label>
                  <select 
                    value={allocationRequest.priority}
                    onChange={(e) => setAllocationRequest({...allocationRequest, priority: e.target.value})}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="low">Low (Cheaper, may wait in queue)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Immediate allocation)</option>
                  </select>
                </div>

                {/* Cost Estimate */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Cost Estimate</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">GPU Type:</span>
                      <span className="text-white">{allocationRequest.gpuType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="text-white">{allocationRequest.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">{allocationRequest.duration}h</span>
                    </div>
                    <hr className="border-slate-600" />
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Total Cost:</span>
                      <span className="text-green-400">
                        ${(
                          (allocationRequest.gpuType === 'A100' ? 3.20 :
                           allocationRequest.gpuType === 'V100' ? 2.40 : 1.80) *
                          allocationRequest.quantity *
                          allocationRequest.duration
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={requestAllocation}
                disabled={!allocationRequest.projectName}
                className="btn-primary flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Request GPU Allocation
              </Button>
            </div>
          </Card>

          {/* Available Clusters */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Available Clusters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gpuClusters.map((cluster) => (
                <div key={cluster.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{cluster.gpuType}</span>
                    <Badge variant="green">Available</Badge>
                  </div>
                  <div className="text-sm text-slate-400 mb-2">{cluster.location}</div>
                  <div className="text-sm">
                    <span className="text-slate-400">Available:</span>
                    <span className="text-white ml-1">{cluster.availableGPUs}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
