'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Building2, 
  Handshake, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Target,
  Briefcase,
  Globe,
  Star
} from 'lucide-react';

interface Collaboration {
  id: string;
  title: string;
  type: 'company-company' | 'company-academic' | 'academic-academic' | 'individual-individual';
  partner: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
}

interface CompanyStats {
  totalCollaborations: number;
  activeCollaborations: number;
  completedCollaborations: number;
  totalBudget: string;
  partners: number;
  successRate: number;
}

const mockCollaborations: Collaboration[] = [
  {
    id: '1',
    title: 'AI-Powered Healthcare Analytics',
    type: 'company-academic',
    partner: 'Tampere University Hospital',
    status: 'active',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    budget: '€150K',
    description: 'Developing AI platform for patient data analysis'
  },
  {
    id: '2',
    title: 'Sustainable Manufacturing IoT',
    type: 'company-company',
    partner: 'GreenTech Solutions',
    status: 'pending',
    progress: 0,
    startDate: '2024-03-01',
    endDate: '2024-11-01',
    budget: '€80K',
    description: 'IoT solutions for manufacturing optimization'
  },
  {
    id: '3',
    title: 'Blockchain Supply Chain Research',
    type: 'academic-academic',
    partner: 'Aalto University',
    status: 'completed',
    progress: 100,
    startDate: '2023-06-01',
    endDate: '2024-01-31',
    budget: '€200K',
    description: 'Research on blockchain-based supply chain transparency'
  }
];

const mockStats: CompanyStats = {
  totalCollaborations: 12,
  activeCollaborations: 3,
  completedCollaborations: 8,
  totalBudget: '€1.2M',
  partners: 15,
  successRate: 87
};

export default function CompanyDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCollaborations = mockCollaborations.filter(collab => {
    const matchesSearch = collab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collab.partner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || collab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company-company':
        return Building2;
      case 'company-academic':
        return Handshake;
      case 'academic-academic':
        return Users;
      case 'individual-individual':
        return Users;
      default:
        return Handshake;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Company Dashboard</h1>
          <p className="text-text-secondary">Manage your collaborations and track progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Collaborations</p>
                <p className="text-2xl font-bold text-text-primary">{mockStats.totalCollaborations}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Handshake className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Projects</p>
                <p className="text-2xl font-bold text-text-primary">{mockStats.activeCollaborations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Budget</p>
                <p className="text-2xl font-bold text-text-primary">{mockStats.totalBudget}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Success Rate</p>
                <p className="text-2xl font-bold text-text-primary">{mockStats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2 h-12">
              <Plus className="w-5 h-5" />
              Start New Collaboration
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <Search className="w-5 h-5" />
              Find Opportunities
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <Users className="w-5 h-5" />
              Manage Partners
            </Button>
          </div>
        </Card>

        {/* Collaborations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-primary">Your Collaborations</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search collaborations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCollaborations.map((collab) => {
              const TypeIcon = getTypeIcon(collab.type);
              return (
                <Card key={collab.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{collab.title}</h3>
                        <p className="text-sm text-text-secondary">{collab.partner}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(collab.status)}>
                      {collab.status}
                    </Badge>
                  </div>

                  <p className="text-text-secondary text-sm mb-4">{collab.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-medium text-text-primary">{collab.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${collab.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(collab.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Briefcase className="w-4 h-4" />
                      <span>{collab.budget}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-text-secondary">
                      Ends: {new Date(collab.endDate).toLocaleDateString()}
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredCollaborations.length === 0 && (
            <Card className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No collaborations found</h3>
              <p className="text-text-secondary mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start your first collaboration to see it here.'
                }
              </p>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Start New Collaboration
              </Button>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-text-primary">Collaboration completed</p>
                <p className="text-xs text-text-secondary">Blockchain Supply Chain Research - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-text-primary">New collaboration request</p>
                <p className="text-xs text-text-secondary">AI-Powered Healthcare Analytics - 1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-text-primary">Milestone reached</p>
                <p className="text-xs text-text-secondary">Sustainable Manufacturing IoT - 3 days ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
