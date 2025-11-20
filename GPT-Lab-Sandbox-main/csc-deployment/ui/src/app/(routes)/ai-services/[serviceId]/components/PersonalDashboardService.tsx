'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  User, 
  BarChart3, 
  Clock, 
  Target,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  Eye,
  Settings,
  Bell,
  Share,
  Download,
  Play,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  Brain
} from 'lucide-react';

interface PersonalDashboardServiceProps {
  service: any;
}

export default function PersonalDashboardService({ service }: PersonalDashboardServiceProps) {
  const [currentView, setCurrentView] = useState('overview');
  const [userStats, setUserStats] = useState<any>(null);

  // Simulate user-specific dashboard data
  useEffect(() => {
    const updateUserStats = () => {
      setUserStats({
        profile: {
          name: 'Dr. Sarah Chen',
          role: 'AI Research Lead',
          organization: 'TechCorp Solutions',
          joinDate: '2025-08-15',
          subscription: 'Professional',
          creditsUsed: 1247,
          creditsRemaining: 753
        },
        currentMonth: {
          experimentsRun: 23,
          successfulExperiments: 20,
          totalCost: 234.50,
          avgAccuracy: 0.892,
          gpuHoursUsed: 45.7,
          modelsDeployed: 3,
          datasetsProcessed: 12
        },
        recentActivity: [
          {
            id: 'activity-001',
            type: 'experiment',
            title: 'BERT fine-tuning completed',
            timestamp: '2025-09-21T10:30:00Z',
            status: 'success',
            details: 'Accuracy: 94.7%, Cost: $23.45'
          },
          {
            id: 'activity-002',
            type: 'deployment',
            title: 'Model deployed to production API',
            timestamp: '2025-09-21T09:15:00Z',
            status: 'success',
            details: 'Endpoint: /api/v1/sentiment-analysis'
          },
          {
            id: 'activity-003',
            type: 'dataset',
            title: 'Customer feedback dataset uploaded',
            timestamp: '2025-09-21T08:45:00Z',
            status: 'success',
            details: '15,000 samples processed'
          },
          {
            id: 'activity-004',
            type: 'experiment',
            title: 'Hyperparameter optimization failed',
            timestamp: '2025-09-20T16:20:00Z',
            status: 'error',
            details: 'GPU memory exceeded, try smaller batch size'
          },
          {
            id: 'activity-005',
            type: 'collaboration',
            title: 'Invited to TechStart AI project',
            timestamp: '2025-09-20T14:10:00Z',
            status: 'info',
            details: 'Role: Reviewer, Project: Customer AI Assistant'
          }
        ],
        myProjects: [
          {
            id: 'proj-001',
            name: 'Customer Sentiment AI',
            description: 'Real-time sentiment analysis for customer feedback',
            status: 'active',
            progress: 85,
            lastActivity: '2025-09-21T10:30:00Z',
            team: ['Dr. Sarah Chen', 'Mike Johnson', 'Lisa Wang'],
            experiments: 8,
            bestAccuracy: 0.947
          },
          {
            id: 'proj-002',
            name: 'Predictive Maintenance System',
            description: 'IoT sensor data analysis for equipment monitoring',
            status: 'planning',
            progress: 25,
            lastActivity: '2025-09-20T15:45:00Z',
            team: ['Dr. Sarah Chen', 'Alex Kumar'],
            experiments: 2,
            bestAccuracy: 0.823
          },
          {
            id: 'proj-003',
            name: 'Legal Document Classifier',
            description: 'Automated legal document categorization and compliance',
            status: 'completed',
            progress: 100,
            lastActivity: '2025-09-18T11:20:00Z',
            team: ['Dr. Sarah Chen', 'Emma Thompson', 'David Lee', 'Anna Martinez'],
            experiments: 15,
            bestAccuracy: 0.912
          }
        ],
        achievements: [
          { id: 'ach-001', title: 'First Successful Deployment', icon: '🚀', earned: '2025-08-20' },
          { id: 'ach-002', title: 'Cost Optimizer', icon: '💰', earned: '2025-09-05' },
          { id: 'ach-003', title: 'Accuracy Master', icon: '🎯', earned: '2025-09-15' },
          { id: 'ach-004', title: 'Team Collaborator', icon: '👥', earned: '2025-09-18' }
        ],
        recommendations: [
          'Consider using DistilBERT for faster inference in your sentiment analysis project',
          'Your GPU utilization is optimal - great resource management!',
          'Try the new Hyperparameter Optimization service for better model performance',
          'Your models show consistent accuracy - ready for production deployment'
        ]
      });
    };

    updateUserStats();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'experiment': return <Brain className="w-4 h-4" />;
      case 'deployment': return <Zap className="w-4 h-4" />;
      case 'dataset': return <FileText className="w-4 h-4" />;
      case 'collaboration': return <User className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'planning': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  if (!userStats) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-400">Loading your personal dashboard...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Personal AI Dashboard</h2>
            <p className="text-indigo-200">Your personalized AI experiment tracking and insights</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-slate-300">
            Welcome back, {userStats.profile.name}! Track your AI projects, experiments, and achievements.
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{userStats.profile.subscription}</Badge>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant={currentView === 'overview' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Overview
        </Button>
        <Button 
          onClick={() => setCurrentView('projects')}
          variant={currentView === 'projects' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          My Projects
        </Button>
        <Button 
          onClick={() => setCurrentView('activity')}
          variant={currentView === 'activity' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Recent Activity
        </Button>
        <Button 
          onClick={() => setCurrentView('achievements')}
          variant={currentView === 'achievements' ? 'primary' : 'outline'}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Achievements
        </Button>
      </div>

      {/* Overview Tab */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Current Month Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{userStats.currentMonth.experimentsRun}</div>
              <div className="text-sm text-green-300">Experiments</div>
              <div className="text-xs text-green-500">This month</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{userStats.currentMonth.avgAccuracy}</div>
              <div className="text-sm text-blue-300">Avg Accuracy</div>
              <div className="text-xs text-blue-500">All models</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">${userStats.currentMonth.totalCost}</div>
              <div className="text-sm text-purple-300">Total Cost</div>
              <div className="text-xs text-purple-500">This month</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{userStats.currentMonth.gpuHoursUsed}h</div>
              <div className="text-sm text-yellow-300">GPU Hours</div>
              <div className="text-xs text-yellow-500">Consumed</div>
            </div>
          </div>

          {/* Credit Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Credit Usage</h3>
              <Badge variant="secondary">{userStats.profile.subscription} Plan</Badge>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Credits Used</span>
                  <span className="text-white">{userStats.profile.creditsUsed} / {userStats.profile.creditsUsed + userStats.profile.creditsRemaining}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    style={{ width: `${(userStats.profile.creditsUsed / (userStats.profile.creditsUsed + userStats.profile.creditsRemaining)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Remaining Credits:</span>
                <span className="text-green-400 font-medium">{userStats.profile.creditsRemaining}</span>
              </div>
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Recommendations</h3>
            <div className="space-y-3">
              {userStats.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm">{rec}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-blue-400">
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Projects Tab */}
      {currentView === 'projects' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">My AI Projects</h3>
              <Button className="btn-primary flex items-center gap-2">
                <Play className="w-4 h-4" />
                New Project
              </Button>
            </div>

            <div className="space-y-4">
              {userStats.myProjects.map((project: any) => (
                <Card key={project.id} className="p-4 bg-slate-700 border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-white">{project.name}</h4>
                        <Badge variant={project.status === 'active' ? 'green' : project.status === 'completed' ? 'secondary' : 'yellow'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{project.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-slate-400">Progress:</span>
                          <span className="text-white ml-1">{project.progress}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Experiments:</span>
                          <span className="text-white ml-1">{project.experiments}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Best Accuracy:</span>
                          <span className="text-green-400 ml-1">{project.bestAccuracy}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Team Size:</span>
                          <span className="text-white ml-1">{project.team.length}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Project Progress</span>
                          <span className="text-white">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.status === 'completed' ? 'bg-blue-500' :
                              project.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-slate-500">
                        Last activity: {new Date(project.lastActivity).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="btn-primary flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Share className="w-3 h-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {currentView === 'activity' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {userStats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-green-500/20' :
                    activity.status === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{activity.title}</h4>
                      {activity.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {activity.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-slate-400 text-sm mb-1">{activity.details}</p>
                    <div className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Achievements Tab */}
      {currentView === 'achievements' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Achievements & Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStats.achievements.map((achievement: any) => (
                <div key={achievement.id} className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{achievement.title}</h4>
                    <div className="text-slate-400 text-sm">
                      Earned: {new Date(achievement.earned).toLocaleDateString()}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="btn-primary flex items-center gap-2 justify-center">
            <Play className="w-4 h-4" />
            Start Experiment
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Bell className="w-4 h-4" />
            Set Alerts
          </Button>
          <Button className="btn-secondary flex items-center gap-2 justify-center">
            <Calendar className="w-4 h-4" />
            Schedule Report
          </Button>
        </div>
      </Card>
    </div>
  );
}
