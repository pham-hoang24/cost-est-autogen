'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface PublicationPipelineProps {
  data: Array<{
    title: string;
    status: string;
    journal: string;
    progress: number;
  }>;
}

export default function PublicationPipeline({ data }: PublicationPipelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'under_review':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'draft':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'under_review':
        return 'Under Review';
      case 'draft':
        return 'Draft';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Publication Pipeline</h3>
            <p className="text-sm text-text-secondary">Your research publications</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          New Paper
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {data.filter(p => p.status === 'accepted').length}
          </div>
          <div className="text-xs text-text-muted">Accepted</div>
        </div>
        <div className="bg-surface/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {data.filter(p => p.status === 'under_review').length}
          </div>
          <div className="text-xs text-text-muted">Under Review</div>
        </div>
        <div className="bg-surface/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {data.filter(p => p.status === 'draft').length}
          </div>
          <div className="text-xs text-text-muted">Drafts</div>
        </div>
        <div className="bg-surface/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {data.filter(p => p.status === 'rejected').length}
          </div>
          <div className="text-xs text-text-muted">Rejected</div>
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {data.map((publication, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-text-primary">{publication.title}</h4>
                  <Badge className={getStatusColor(publication.status)}>
                    {getStatusIcon(publication.status)}
                    <span className="ml-1">{getStatusText(publication.status)}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {publication.journal}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">Progress</span>
                <span className="text-sm font-medium text-text-primary">{publication.progress}%</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(publication.progress)}`}
                  style={{ width: `${publication.progress}%` }}
                />
              </div>
            </div>

            {/* Status-specific actions */}
            {publication.status === 'draft' && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-1" />
                  Continue Writing
                </Button>
                <Button size="sm" variant="outline">
                  <Target className="w-4 h-4 mr-1" />
                  Submit
                </Button>
              </div>
            )}
            
            {publication.status === 'under_review' && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Clock className="w-4 h-4 mr-1" />
                  Check Status
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="w-4 h-4 mr-1" />
                  Set Reminder
                </Button>
              </div>
            )}
            
            {publication.status === 'accepted' && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  View Published
                </Button>
                <Button size="sm" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Track Citations
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h4 className="text-lg font-medium text-text-secondary mb-2">No publications yet</h4>
          <p className="text-text-muted mb-4">Start writing your first research paper</p>
          <Button className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Start Writing
          </Button>
        </div>
      )}
    </Card>
  );
}
