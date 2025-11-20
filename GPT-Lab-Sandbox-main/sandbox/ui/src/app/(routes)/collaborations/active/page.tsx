'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Progress } from '@/components/Progress';
import { 
  Users, 
  Calendar, 
  Target, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowRight,
  Building2,
  GraduationCap,
  Handshake,
  User
} from 'lucide-react';

interface Collaboration {
  id: string;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    role: string;
  }>;
  status: string;
  startDate: string;
  endDate: string;
  budget: string;
  timeline: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: string;
    completedAt?: string;
  }>;
  progress: number;
  createdAt: string;
}

export default function ActiveCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch active collaborations
  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          participantId: 'user-123', // This would come from auth context
          status: selectedStatus === 'all' ? '' : selectedStatus
        });

        const response = await fetch(`http://localhost:8080/api/collaborations/active?${params}`);
        const data = await response.json();

        if (data.success) {
          setCollaborations(data.collaborations);
        } else {
          setError('Failed to fetch collaborations');
        }
      } catch (err) {
        setError('Error fetching collaborations');
        console.error('Error fetching collaborations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborations();
  }, [selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return Building2;
      case 'academic':
        return GraduationCap;
      case 'individual':
        return User;
      default:
        return Handshake;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading collaborations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Active Collaborations</h1>
          <p className="text-text-secondary">Manage your ongoing collaboration projects</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-text-primary">Filter by status:</span>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'primary' : 'outline'}
                  onClick={() => setSelectedStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-8 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Collaborations Grid */}
        {collaborations.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Active Collaborations</h3>
            <p className="text-text-secondary mb-6">
              You don't have any active collaborations yet. Start by exploring opportunities or creating your own.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/collaborations/discovery'}>
                Explore Opportunities
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/collaborations/create'}>
                Create Opportunity
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collaborations.map((collaboration) => (
              <Card key={collaboration.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {collaboration.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(collaboration.status)}>
                        {collaboration.status}
                      </Badge>
                      <span className="text-sm text-text-secondary">
                        Started {formatDate(collaboration.startDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Participants</h4>
                  <div className="flex flex-wrap gap-2">
                    {collaboration.participants.map((participant) => {
                      const TypeIcon = getTypeIcon(participant.type);
                      return (
                        <div key={participant.id} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                          <TypeIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-text-secondary">{participant.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">Progress</span>
                    <span className="text-sm text-text-secondary">{collaboration.progress}%</span>
                  </div>
                  <Progress value={collaboration.progress} className="h-2" />
                </div>

                {/* Milestones */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Recent Milestones</h4>
                  <div className="space-y-2">
                    {collaboration.milestones.slice(0, 3).map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${
                            milestone.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                          }`} />
                          <span className="text-sm text-text-secondary">{milestone.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMilestoneStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                          {isOverdue(milestone.dueDate) && milestone.status !== 'completed' && (
                            <Clock className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    {collaboration.milestones.length > 3 && (
                      <p className="text-xs text-text-secondary text-center">
                        +{collaboration.milestones.length - 3} more milestones
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Budget:</span>
                    <p className="font-medium text-text-primary">{collaboration.budget}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Timeline:</span>
                    <p className="font-medium text-text-primary">{collaboration.timeline}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex items-center gap-2 flex-1">
                    <MessageCircle className="w-4 h-4" />
                    Messages
                  </Button>
                  <Button className="flex items-center gap-2 flex-1">
                    <Target className="w-4 h-4" />
                    Manage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-start h-auto p-4"
              onClick={() => window.location.href = '/collaborations/discovery'}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Explore Opportunities</p>
                <p className="text-sm text-text-secondary">Find new collaboration opportunities</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-start h-auto p-4"
              onClick={() => window.location.href = '/collaborations/create'}
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Create Opportunity</p>
                <p className="text-sm text-text-secondary">Post your own collaboration opportunity</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-start h-auto p-4"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">My Proposals</p>
                <p className="text-sm text-text-secondary">View your submitted proposals</p>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
