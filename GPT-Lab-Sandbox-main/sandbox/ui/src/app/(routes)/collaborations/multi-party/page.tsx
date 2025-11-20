'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Euro, 
  Target,
  Building2,
  GraduationCap,
  User,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Handshake,
  Settings,
  MessageCircle,
  FileText,
  BarChart3
} from 'lucide-react';

interface MultiPartyCollaboration {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  leadOrganization: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    role: string;
    status: string;
    joinedAt: string | null;
  }>;
  budget: string;
  timeline: string;
  objectives: string[];
  governance: {
    decisionMaking: string;
    conflictResolution: string;
    ipOwnership: string;
    dataSharing: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function MultiPartyCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<MultiPartyCollaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch multi-party collaborations
  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          status: statusFilter === 'all' ? '' : statusFilter,
          category: categoryFilter === 'all' ? '' : categoryFilter
        });

        const response = await fetch(`http://localhost:8080/api/collaborations/multi-party?${params}`);
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
  }, [statusFilter, categoryFilter]);

  const filteredCollaborations = collaborations.filter(collab =>
    collab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.leadOrganization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'forming':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
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
      case 'government':
        return Shield;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-surface/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading multi-party collaborations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Multi-Party Collaborations</h1>
              <p className="text-text-secondary">Manage complex multi-stakeholder collaboration projects</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Collaboration
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search collaborations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <option value="all">All Status</option>
                <option value="forming">Forming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <option value="all">All Categories</option>
                <option value="Healthcare & AI">Healthcare & AI</option>
                <option value="Manufacturing & IoT">Manufacturing & IoT</option>
                <option value="Blockchain & Supply Chain">Blockchain & Supply Chain</option>
                <option value="Cybersecurity & AI">Cybersecurity & AI</option>
                <option value="Quantum Computing">Quantum Computing</option>
              </Select>
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
        {filteredCollaborations.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Multi-Party Collaborations</h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No collaborations match your current filters.'
                : 'Create your first multi-party collaboration to get started.'
              }
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Collaboration
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCollaborations.map((collaboration) => (
              <Card key={collaboration.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {collaboration.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                      {collaboration.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(collaboration.status)}>
                        {collaboration.status}
                      </Badge>
                      <span className="text-sm text-text-secondary">
                        {collaboration.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lead Organization */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>Lead Organization</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {collaboration.leadOrganization}
                  </p>
                </div>

                {/* Participants */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Users className="w-4 h-4" />
                      <span>Participants ({collaboration.participants.length})</span>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {collaboration.participants.filter(p => p.status === 'approved').length} approved
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {collaboration.participants.slice(0, 3).map((participant) => {
                      const TypeIcon = getTypeIcon(participant.type);
                      return (
                        <div key={participant.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                          <TypeIcon className="w-3 h-3 text-gray-600" />
                          <span className="text-text-secondary">{participant.name}</span>
                          <Badge className={getParticipantStatusColor(participant.status)}>
                            {participant.status}
                          </Badge>
                        </div>
                      );
                    })}
                    {collaboration.participants.length > 3 && (
                      <div className="px-2 py-1 bg-gray-100 rounded-full text-xs text-text-secondary">
                        +{collaboration.participants.length - 3} more
                      </div>
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

                {/* Objectives */}
                {collaboration.objectives.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Target className="w-4 h-4" />
                      <span>Objectives</span>
                    </div>
                    <div className="space-y-1">
                      {collaboration.objectives.slice(0, 2).map((objective, index) => (
                        <p key={index} className="text-xs text-text-secondary line-clamp-1">
                          • {objective}
                        </p>
                      ))}
                      {collaboration.objectives.length > 2 && (
                        <p className="text-xs text-text-secondary">
                          +{collaboration.objectives.length - 2} more objectives
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Governance */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <Settings className="w-4 h-4" />
                    <span>Governance</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">Decision Making:</span>
                      <p className="font-medium text-text-primary capitalize">
                        {collaboration.governance.decisionMaking}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-secondary">IP Ownership:</span>
                      <p className="font-medium text-text-primary capitalize">
                        {collaboration.governance.ipOwnership}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex items-center gap-2 flex-1">
                    <MessageCircle className="w-4 h-4" />
                    Messages
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 flex-1">
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                  <Button className="flex items-center gap-2 flex-1">
                    <Settings className="w-4 h-4" />
                    Manage
                  </Button>
                </div>

                {/* Created Date */}
                <div className="mt-4 text-xs text-text-secondary text-center">
                  Created {formatDate(collaboration.createdAt)}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Collaboration Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Create Multi-Party Collaboration</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    ×
                  </Button>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Collaboration Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., AI-Powered Healthcare Consortium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Description *
                    </label>
                    <Textarea
                      placeholder="Describe the collaboration objectives, scope, and expected outcomes..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Category *
                      </label>
                      <Select>
                        <option value="">Select category</option>
                        <option value="Healthcare & AI">Healthcare & AI</option>
                        <option value="Manufacturing & IoT">Manufacturing & IoT</option>
                        <option value="Blockchain & Supply Chain">Blockchain & Supply Chain</option>
                        <option value="Cybersecurity & AI">Cybersecurity & AI</option>
                        <option value="Quantum Computing">Quantum Computing</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Lead Organization *
                      </label>
                      <Input
                        type="text"
                        placeholder="Your organization name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Budget
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., €500K - €1M"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Timeline
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., 18-24 months"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Collaboration
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
