'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  Brain,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';

interface AIServicesAnalyticsProps {
  data: Array<{
    service: string;
    usage: number;
    cost: number;
    success: number;
  }>;
}

export default function AIServicesAnalytics({ data }: AIServicesAnalyticsProps) {
  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'anomaly detection':
        return <Target className="w-4 h-4" />;
      case 'data preprocessing':
        return <BarChart3 className="w-4 h-4" />;
      case 'security scanner':
        return <AlertCircle className="w-4 h-4" />;
      case 'compliance auditor':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service.toLowerCase()) {
      case 'anomaly detection':
        return 'text-blue-500 bg-blue-500/10';
      case 'data preprocessing':
        return 'text-green-500 bg-green-500/10';
      case 'security scanner':
        return 'text-red-500 bg-red-500/10';
      case 'compliance auditor':
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSuccessColor = (success: number) => {
    if (success >= 95) return 'text-green-500';
    if (success >= 90) return 'text-blue-500';
    if (success >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const totalUsage = data.reduce((sum, service) => sum + service.usage, 0);
  const totalCost = data.reduce((sum, service) => sum + service.cost, 0);
  const avgSuccess = data.reduce((sum, service) => sum + service.success, 0) / data.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">AI Services Usage</h3>
            <p className="text-sm text-text-secondary">Your AI service consumption</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          View Details
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-text-secondary">Total Usage</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{totalUsage}</div>
          <div className="text-xs text-text-muted">API calls this month</div>
        </div>
        <div className="bg-surface/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-text-secondary">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">${totalCost}</div>
          <div className="text-xs text-text-muted">This month</div>
        </div>
        <div className="bg-surface/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-text-secondary">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{avgSuccess.toFixed(1)}%</div>
          <div className="text-xs text-text-muted">Average across services</div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {data.map((service, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getServiceColor(service.service)}`}>
                  {getServiceIcon(service.service)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary">{service.service}</h4>
                  <p className="text-sm text-text-secondary">AI Service</p>
                </div>
              </div>
              <Badge className={getSuccessColor(service.success)}>
                {service.success}% success
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{service.usage}</div>
                <div className="text-xs text-text-muted">Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">${service.cost}</div>
                <div className="text-xs text-text-muted">Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{service.success}%</div>
                <div className="text-xs text-text-muted">Success</div>
              </div>
            </div>

            {/* Usage Bar */}
            <div className="w-full bg-surface rounded-full h-2 mb-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                style={{ width: `${(service.usage / Math.max(...data.map(s => s.usage))) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Usage relative to other services</span>
              <span>{((service.usage / totalUsage) * 100).toFixed(1)}% of total</span>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h4 className="text-lg font-medium text-text-secondary mb-2">No AI services used yet</h4>
          <p className="text-text-muted mb-4">Start using AI services to see analytics here</p>
          <Button className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Explore Services
          </Button>
        </div>
      )}
    </Card>
  );
}
