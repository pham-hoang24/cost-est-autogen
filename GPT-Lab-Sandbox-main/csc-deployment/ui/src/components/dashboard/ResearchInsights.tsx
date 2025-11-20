'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { 
  Brain,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  Target,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ResearchInsightsProps {
  data: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
  }>;
}

export default function ResearchInsights({ data }: ResearchInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trending_topic':
        return <TrendingUp className="w-4 h-4" />;
      case 'deadline':
        return <Calendar className="w-4 h-4" />;
      case 'funding':
        return <DollarSign className="w-4 h-4" />;
      case 'collaboration':
        return <Users className="w-4 h-4" />;
      case 'publication':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trending_topic':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'deadline':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'funding':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'collaboration':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'publication':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getInsightPriority = (type: string) => {
    switch (type) {
      case 'deadline':
        return { icon: AlertCircle, text: 'High Priority', color: 'text-red-500' };
      case 'funding':
        return { icon: Clock, text: 'Time Sensitive', color: 'text-yellow-500' };
      case 'trending_topic':
        return { icon: TrendingUp, text: 'Trending', color: 'text-purple-500' };
      default:
        return { icon: CheckCircle, text: 'Normal', color: 'text-green-500' };
    }
  };

  const getInsightTypeText = (type: string) => {
    switch (type) {
      case 'trending_topic':
        return 'Trending Topic';
      case 'deadline':
        return 'Deadline Alert';
      case 'funding':
        return 'Funding Opportunity';
      case 'collaboration':
        return 'Collaboration';
      case 'publication':
        return 'Publication';
      default:
        return 'Insight';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Research Insights</h3>
            <p className="text-sm text-text-secondary">AI-powered recommendations for your research</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          More Insights
        </Button>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {data.map((insight, index) => {
          const priority = getInsightPriority(insight.type);
          const PriorityIcon = priority.icon;
          
          return (
            <div key={index} className="border border-border rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getInsightColor(insight.type)}`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-text-primary">{insight.title}</h4>
                      <Badge className={getInsightColor(insight.type)}>
                        {getInsightTypeText(insight.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={priority.color}>
                        <PriorityIcon className="w-3 h-3 mr-1" />
                        {priority.text}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {insight.type === 'deadline' ? 'Due in 15 days' : 'Updated 2h ago'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  {insight.action}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {/* Action-specific content */}
              {insight.type === 'deadline' && (
                <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-500">Deadline Alert</span>
                  </div>
                  <p className="text-xs text-red-400">
                    This is a high-priority deadline. Consider starting your submission process now.
                  </p>
                </div>
              )}

              {insight.type === 'funding' && (
                <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Funding Opportunity</span>
                  </div>
                  <p className="text-xs text-green-400">
                    This funding opportunity matches your research profile. Application deadline is approaching.
                  </p>
                </div>
              )}

              {insight.type === 'trending_topic' && (
                <div className="mt-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-500">Trending Topic</span>
                  </div>
                  <p className="text-xs text-purple-400">
                    This topic is gaining traction in your research community. Consider exploring collaboration opportunities.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h4 className="text-lg font-medium text-text-secondary mb-2">No insights available</h4>
          <p className="text-text-muted mb-4">Complete more research activities to get personalized insights</p>
          <Button className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Start Research
          </Button>
        </div>
      )}

      {/* AI Insights Footer */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Insights</span>
        </div>
        <p className="text-xs text-text-secondary">
          These insights are generated using AI analysis of your research patterns, 
          collaboration network, and current trends in your field.
        </p>
      </div>
    </Card>
  );
}
