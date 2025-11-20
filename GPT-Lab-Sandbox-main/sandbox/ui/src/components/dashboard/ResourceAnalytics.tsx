'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings
} from 'lucide-react';

interface ResourceAnalyticsProps {
  data: {
    cpu: { used: number; limit: number; unit: string };
    gpu: { used: number; limit: number; unit: string };
    storage: { used: number; limit: number; unit: string };
    memory: { used: number; limit: number; unit: string };
  };
}

export default function ResourceAnalytics({ data }: ResourceAnalyticsProps) {
  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'cpu':
        return <Cpu className="w-4 h-4" />;
      case 'gpu':
        return <Zap className="w-4 h-4" />;
      case 'storage':
        return <HardDrive className="w-4 h-4" />;
      case 'memory':
        return <MemoryStick className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'cpu':
        return 'text-blue-500 bg-blue-500/10';
      case 'gpu':
        return 'text-purple-500 bg-purple-500/10';
      case 'storage':
        return 'text-green-500 bg-green-500/10';
      case 'memory':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    if (percentage >= 50) return 'text-blue-500';
    return 'text-green-500';
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { icon: AlertTriangle, text: 'Critical', color: 'text-red-500' };
    if (percentage >= 75) return { icon: AlertTriangle, text: 'High', color: 'text-yellow-500' };
    if (percentage >= 50) return { icon: TrendingUp, text: 'Moderate', color: 'text-blue-500' };
    return { icon: CheckCircle, text: 'Low', color: 'text-green-500' };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const resources = [
    { key: 'cpu', label: 'CPU Hours', data: data.cpu },
    { key: 'gpu', label: 'GPU Hours', data: data.gpu },
    { key: 'storage', label: 'Storage', data: data.storage },
    { key: 'memory', label: 'Memory', data: data.memory }
  ];

  const totalUsage = resources.reduce((sum, resource) => sum + resource.data.used, 0);
  const totalLimit = resources.reduce((sum, resource) => sum + resource.data.limit, 0);
  const overallUsage = (totalUsage / totalLimit) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Resource Analytics</h3>
            <p className="text-sm text-text-secondary">Your computational resource usage</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Manage
        </Button>
      </div>

      {/* Overall Usage */}
      <div className="bg-surface/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">Overall Usage</span>
          <span className={`text-sm font-medium ${getUsageColor(overallUsage)}`}>
            {overallUsage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(overallUsage)}`}
            style={{ width: `${overallUsage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{totalUsage.toFixed(1)} / {totalLimit.toFixed(1)} total units</span>
          <span>{getUsageStatus(overallUsage).text} usage</span>
        </div>
      </div>

      {/* Individual Resources */}
      <div className="space-y-4">
        {resources.map((resource, index) => {
          const percentage = (resource.data.used / resource.data.limit) * 100;
          const status = getUsageStatus(percentage);
          const StatusIcon = status.icon;
          
          return (
            <div key={resource.key} className="border border-border rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getResourceColor(resource.key)}`}>
                    {getResourceIcon(resource.key)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-text-primary">{resource.label}</h4>
                    <p className="text-sm text-text-secondary">
                      {resource.data.used} / {resource.data.limit} {resource.data.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={status.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.text}
                  </Badge>
                  <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Usage Details */}
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Usage: {resource.data.used} {resource.data.unit}</span>
                <span>Limit: {resource.data.limit} {resource.data.unit}</span>
              </div>

              {/* Recommendations */}
              {percentage >= 90 && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">High usage detected</span>
                  </div>
                  <p className="text-xs text-red-400 mt-1">
                    Consider upgrading your plan or optimizing resource usage
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
