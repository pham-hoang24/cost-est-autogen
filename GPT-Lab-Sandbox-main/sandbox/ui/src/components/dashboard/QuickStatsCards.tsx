'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { 
  FileText, 
  Users, 
  Database, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Target,
  Award
} from 'lucide-react';

interface QuickStatsCardsProps {
  data: {
    activeProjects: number;
    publications: number;
    collaborations: number;
    datasets: number;
  };
}

export default function QuickStatsCards({ data }: QuickStatsCardsProps) {
  const stats = [
    {
      title: 'Active Projects',
      value: data.activeProjects,
      icon: FileText,
      color: 'blue',
      change: '+12%',
      changeType: 'positive',
      description: 'Research projects in progress'
    },
    {
      title: 'Publications',
      value: data.publications,
      icon: Award,
      color: 'green',
      change: '+8%',
      changeType: 'positive',
      description: 'Papers published this year'
    },
    {
      title: 'Collaborations',
      value: data.collaborations,
      icon: Users,
      color: 'purple',
      change: '+15%',
      changeType: 'positive',
      description: 'Active research partnerships'
    },
    {
      title: 'Datasets',
      value: data.datasets,
      icon: Database,
      color: 'orange',
      change: '+5%',
      changeType: 'positive',
      description: 'Research datasets managed'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      green: 'text-green-500 bg-green-500/10 border-green-500/20',
      purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1">
                {stat.changeType === 'positive' ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-text-primary">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-text-secondary">
                {stat.title}
              </p>
              <p className="text-xs text-text-muted">
                {stat.description}
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Research
                </Badge>
                <span className="text-xs text-text-muted">
                  Last updated: 2h ago
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
