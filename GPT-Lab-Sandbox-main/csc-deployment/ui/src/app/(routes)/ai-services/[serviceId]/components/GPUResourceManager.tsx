'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Cpu, 
  Monitor, 
  BarChart3, 
  Zap, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Activity
} from 'lucide-react';

interface GPUResourceManagerProps {
  service: any;
}

export default function GPUResourceManager({ service }: GPUResourceManagerProps) {
  const [currentView, setCurrentView] = useState('overview');
  const [selectedCluster, setSelectedCluster] = useState('production');
  const [gpuMetrics, setGpuMetrics] = useState<any>(null);
  const [reservationConfig, setReservationConfig] = useState({
    gpuType: 'A100',
    quantity: 2,
    duration: 4,
    priority: 'normal'
  });

  // Simulate real-time GPU metrics
  useEffect(() => {
    const updateMetrics = () => {
      setGpuMetrics({
        totalGPUs: 24,
        availableGPUs: 8,
        utilizationRate: 67 + Math.random() * 10,
        queuedJobs: 3,
        runningJobs: 5,
        avgWaitTime: 12,
        totalCost24h: 1247.50,
        energyEfficiency: 92.3,
        clusters: [
          {
            name: 'production',
            location: 'EU-Central-1',
            gpus: [
              { id: 'gpu-001', type: 'A100', status: 'busy', utilization: 94, job: 'model-training-bert-001', user: 'research-team-1' },
              { id: 'gpu-002', type: 'A100', status: 'busy', utilization: 87, job: 'fine-tuning-gpt-002', user: 'ai-team-2' },
              { id: 'gpu-003', type: 'A100', status: 'available', utilization: 0, job: null, user: null },
              { id: 'gpu-004', type: 'A100', status: 'available', utilization: 0, job: null, user: null },
              { id: 'gpu-005', type: 'V100', status: 'busy', utilization: 76, job: 'inference-service-001', user: 'prod-team' },
              { id: 'gpu-006', type: 'V100', status: 'maintenance', utilization: 0, job: null, user: null },
              { id: 'gpu-007', type: 'T4', status: 'busy', utilization: 45, job: 'data-preprocessing-003', user: 'data-team' },
              { id: 'gpu-008', type: 'T4', status: 'available', utilization: 0, job: null, user: null }
            ]
          },
          {
            name: 'development',
            location: 'EU-West-1',
            gpus: [
              { id: 'gpu-dev-001', type: 'T4', status: 'available', utilization: 0, job: null, user: null },
              { id: 'gpu-dev-002', type: 'T4', status: 'busy', utilization: 23, job: 'model-testing-001', user: 'dev-team' },
              { id: 'gpu-dev-003', type: 'V100', status: 'available', utilization: 0, job: null, user: null },
              { id: 'gpu-dev-004', type: 'V100', status: 'busy', utilization: 56, job: 'experiment-run-042', user: 'research-intern' }
            ]
          }
        ]
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'maintenance': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'busy': return 'yellow';
      case 'maintenance': return 'red';
      default: return 'gray';
    }
  };

  const calculateReservationCost = () => {
    const hourlyRates = { A100: 3.20, V100: 2.40, T4: 1.80 };
    const baseRate = hourlyRates[reservationConfig.gpuType as keyof typeof hourlyRates];
    const priorityMultiplier = 
      reservationConfig.priority === 'urgent' ? 2.0 :
      reservationConfig.priority === 'high' ? 1.5 :
      reservationConfig.priority === 'low' ? 0.5 : 1.0;
    return (baseRate * reservationConfig.quantity * reservationConfig.duration * priorityMultiplier).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">GPU Resource Manager</h2>
            <p className="text-orange-200">Enterprise GPU cluster management and allocation</p>
          </div>
        </div>
        <p className="text-slate-300">
          Professional GPU resource management with real-time monitoring, 
          intelligent allocation, and cost optimization for AI workloads.
        </p>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant={currentView === 'overview' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Monitor className="w-4 h-4" />
          Overview
        </Button>
        <Button 
          onClick={() => setCurrentView('allocation')}
          variant={currentView === 'allocation' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Allocation
        </Button>
        <Button 
          onClick={() => setCurrentView('monitoring')}
          variant={currentView === 'monitoring' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Monitoring
        </Button>
        <Button 
          onClick={() => setCurrentView('costs')}
          variant={currentView === 'costs' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Costs
        </Button>
      </div>

      {/* Overview Tab */}
      {currentView === 'overview' && gpuMetrics && (
        <div className="space-y-6">
          {/* Cluster Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{gpuMetrics.availableGPUs}</div>
              <div className="text-sm text-green-300">Available GPUs</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{gpuMetrics.utilizationRate.toFixed(1)}%</div>
              <div className="text-sm text-blue-300">Utilization</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{gpuMetrics.runningJobs}</div>
              <div className="text-sm text-purple-300">Running Jobs</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{gpuMetrics.avgWaitTime}m</div>
              <div className="text-sm text-yellow-300">Avg Wait Time</div>
            </div>
          </div>

          {/* Cluster Selection */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">GPU Clusters</h3>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {gpuMetrics.clusters.map((cluster: any) => (
                <Card 
                  key={cluster.name}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedCluster === cluster.name 
                      ? 'border-2 border-primary bg-primary/5' 
                      : 'border-2 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedCluster(cluster.name)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white capitalize">{cluster.name} Cluster</h4>
                      <p className="text-slate-400 text-sm">{cluster.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {cluster.gpus.filter((g: any) => g.status === 'available').length}/{cluster.gpus.length} Available
                      </div>
                      <div className="text-slate-400 text-sm">
                        {cluster.gpus.filter((g: any) => g.status === 'busy').length} Busy, 
                        {cluster.gpus.filter((g: any) => g.status === 'maintenance').length} Maintenance
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {cluster.gpus.map((gpu: any) => (
                      <div 
                        key={gpu.id}
                        className={`p-2 rounded text-center text-xs ${
                          gpu.status === 'available' ? 'bg-green-500/20 border border-green-500/30' :
                          gpu.status === 'busy' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                          'bg-red-500/20 border border-red-500/30'
                        }`}
                      >
                        <div className={`font-medium ${getStatusColor(gpu.status)}`}>
                          {gpu.type}
                        </div>
                        <div className="text-slate-400">{gpu.utilization}%</div>
                        {gpu.job && (
                          <div className="text-slate-500 truncate">{gpu.job}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Allocation Tab */}
      {currentView === 'allocation' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Reserve GPU Resources</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">GPU Type</label>
                <select 
                  value={reservationConfig.gpuType}
                  onChange={(e) => setReservationConfig({...reservationConfig, gpuType: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="A100">NVIDIA A100 (80GB) - $3.20/hr</option>
                  <option value="V100">NVIDIA V100 (32GB) - $2.40/hr</option>
                  <option value="T4">NVIDIA T4 (16GB) - $1.80/hr</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Quantity</label>
                <select 
                  value={reservationConfig.quantity}
                  onChange={(e) => setReservationConfig({...reservationConfig, quantity: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={1}>1 GPU</option>
                  <option value={2}>2 GPUs</option>
                  <option value={4}>4 GPUs</option>
                  <option value={8}>8 GPUs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Duration (hours)</label>
                <select 
                  value={reservationConfig.duration}
                  onChange={(e) => setReservationConfig({...reservationConfig, duration: parseInt(e.target.value)})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value={1}>1 hour</option>
                  <option value={4}>4 hours</option>
                  <option value={8}>8 hours</option>
                  <option value={24}>24 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Priority</label>
                <select 
                  value={reservationConfig.priority}
                  onChange={(e) => setReservationConfig({...reservationConfig, priority: e.target.value})}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  <option value="low">Low Priority (50% discount)</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority (+50% cost)</option>
                  <option value="urgent">Urgent (+100% cost)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {/* Cost Calculation */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Reservation Cost</span>
                </div>
                <div className="text-3xl font-bold text-white">${calculateReservationCost()}</div>
                <div className="text-sm text-blue-300">
                  {reservationConfig.quantity}x {reservationConfig.gpuType} × {reservationConfig.duration}h
                </div>
              </div>

              {/* Availability */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Availability</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {Math.max(0, gpuMetrics?.availableGPUs - reservationConfig.quantity + 1)} GPUs Available
                </div>
                <div className="text-sm text-green-300">
                  Est. wait time: {reservationConfig.priority === 'urgent' ? '< 5m' : '12-15m'}
                </div>
              </div>

              {/* Resource Allocation */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Resource Allocation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total VRAM:</span>
                    <span className="text-white">{reservationConfig.gpuType === 'A100' ? reservationConfig.quantity * 80 : reservationConfig.gpuType === 'V100' ? reservationConfig.quantity * 32 : reservationConfig.quantity * 16} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Compute Units:</span>
                    <span className="text-white">{reservationConfig.quantity * (reservationConfig.gpuType === 'A100' ? 312 : reservationConfig.gpuType === 'V100' ? 250 : 130)} TFLOPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Network:</span>
                    <span className="text-white">InfiniBand (200 Gbps)</span>
                  </div>
                </div>
              </div>

              <Button className="w-full btn-primary flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Reserve Resources
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Monitoring Tab */}
      {currentView === 'monitoring' && gpuMetrics && (
        <div className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Cluster Health</span>
              </div>
              <div className="text-2xl font-bold text-white">{gpuMetrics.energyEfficiency}%</div>
              <div className="text-sm text-green-300">Energy Efficiency</div>
            </Card>

            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Utilization</span>
              </div>
              <div className="text-2xl font-bold text-white">{gpuMetrics.utilizationRate.toFixed(1)}%</div>
              <div className="text-sm text-blue-300">Average GPU Usage</div>
            </Card>

            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Queue Status</span>
              </div>
              <div className="text-2xl font-bold text-white">{gpuMetrics.queuedJobs}</div>
              <div className="text-sm text-purple-300">Jobs in Queue</div>
            </Card>
          </div>

          {/* GPU Status Grid */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">GPU Status ({selectedCluster} cluster)</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSelectedCluster('production')}
                  variant={selectedCluster === 'production' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Production
                </Button>
                <Button 
                  onClick={() => setSelectedCluster('development')}
                  variant={selectedCluster === 'development' ? 'primary' : 'outline'}
                  size="sm"
                >
                  Development
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {gpuMetrics.clusters.find((c: any) => c.name === selectedCluster)?.gpus.map((gpu: any) => (
                <Card key={gpu.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{gpu.type}</span>
                    </div>
                    <Badge variant={getStatusBadge(gpu.status)}>
                      {gpu.status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-2">{gpu.id}</div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Utilization</span>
                      <span className="text-white">{gpu.utilization}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          gpu.utilization > 80 ? 'bg-red-500' :
                          gpu.utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${gpu.utilization}%` }}
                      />
                    </div>
                  </div>

                  {gpu.job && (
                    <div className="text-xs">
                      <div className="text-slate-400">Running:</div>
                      <div className="text-white truncate">{gpu.job}</div>
                      <div className="text-slate-500">User: {gpu.user}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Costs Tab */}
      {currentView === 'costs' && gpuMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">24h Cost</span>
              </div>
              <div className="text-2xl font-bold text-white">${gpuMetrics.totalCost24h.toFixed(2)}</div>
              <div className="text-sm text-yellow-300">Last 24 hours</div>
            </Card>

            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-white">87.3%</div>
              <div className="text-sm text-green-300">Cost Efficiency</div>
            </Card>

            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Savings</span>
              </div>
              <div className="text-2xl font-bold text-white">$234.50</div>
              <div className="text-sm text-blue-300">This month</div>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Cost Breakdown by GPU Type</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white">NVIDIA A100 (6 units)</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$768.00</div>
                  <div className="text-slate-400 text-sm">61.6% of total</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white">NVIDIA V100 (4 units)</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$345.60</div>
                  <div className="text-slate-400 text-sm">27.7% of total</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-white">NVIDIA T4 (8 units)</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$133.90</div>
                  <div className="text-slate-400 text-sm">10.7% of total</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
