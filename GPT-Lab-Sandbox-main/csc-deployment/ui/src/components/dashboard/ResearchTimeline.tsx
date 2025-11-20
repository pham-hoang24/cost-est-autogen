'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  Eye
} from 'lucide-react';

interface ResearchTimelineProps {
  data: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
    collaborators: number;
    milestones: Array<{
      title: string;
      completed: boolean;
      date: string;
    }>;
  }>;
  expanded?: boolean;
}

export default function ResearchTimeline({ data, expanded = false }: ResearchTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'planning':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'completed':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      case 'on_hold':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Target className="w-4 h-4" />;
      case 'planning':
        return <Calendar className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'on_hold':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Research Timeline</h3>
            <p className="text-sm text-text-secondary">Your active research projects</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((project, index) => (
          <div key={project.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-text-primary">{project.title}</h4>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.collaborators} collaborators
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">Progress</span>
                <span className="text-sm font-medium text-text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Milestones */}
            {expanded && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-text-secondary">Milestones</h5>
                <div className="space-y-2">
                  {project.milestones.map((milestone, milestoneIndex) => (
                    <div key={milestoneIndex} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        milestone.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-surface border border-border'
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${
                          milestone.completed ? 'text-text-primary' : 'text-text-secondary'
                        }`}>
                          {milestone.title}
                        </span>
                        <span className="text-xs text-text-muted ml-2">
                          {formatDate(milestone.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h4 className="text-lg font-medium text-text-secondary mb-2">No active projects</h4>
          <p className="text-text-muted mb-4">Start a new research project to see it here</p>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </div>
      )}
    </Card>
  );
}
