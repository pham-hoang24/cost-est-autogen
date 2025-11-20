'use client';

import { useState } from 'react';
import { 
  Microscope, 
  FlaskConical, 
  BarChart3, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  Award,
  TrendingUp,
  Database,
  Brain,
  Target,
  BookOpen,
  Share2,
  Download,
  Upload,
  MessageSquare,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';

export default function ResearchDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Demo research data
  const researchStats = {
    activeProjects: 4,
    publications: 12,
    citations: 156,
    hIndex: 8,
    collaborations: 7,
    funding: 125000,
    patents: 2,
    students: 3
  };

  const activeProjects = [
    {
      id: 1,
      title: "AI-Driven Drug Discovery for Alzheimer's",
      status: "active",
      progress: 75,
      startDate: "2023-09-01",
      endDate: "2024-08-31",
      funding: 50000,
      collaborators: 3,
      publications: 2,
      description: "Using machine learning to identify potential drug compounds for Alzheimer's treatment",
      tags: ["AI", "Drug Discovery", "Neuroscience", "Machine Learning"]
    },
    {
      id: 2,
      title: "Quantum Computing Applications in Cryptography",
      status: "active",
      progress: 45,
      startDate: "2024-01-15",
      endDate: "2025-01-15",
      funding: 35000,
      collaborators: 2,
      publications: 1,
      description: "Exploring quantum algorithms for enhanced cryptographic security",
      tags: ["Quantum Computing", "Cryptography", "Security"]
    },
    {
      id: 3,
      title: "Sustainable Energy Storage Solutions",
      status: "planning",
      progress: 15,
      startDate: "2024-03-01",
      endDate: "2025-12-31",
      funding: 40000,
      collaborators: 4,
      publications: 0,
      description: "Developing next-generation battery technologies for renewable energy",
      tags: ["Energy", "Sustainability", "Materials Science"]
    },
    {
      id: 4,
      title: "Computer Vision for Medical Diagnosis",
      status: "completed",
      progress: 100,
      startDate: "2023-06-01",
      endDate: "2024-01-31",
      funding: 25000,
      collaborators: 2,
      publications: 3,
      description: "AI-powered image analysis for early disease detection",
      tags: ["Computer Vision", "Medical AI", "Diagnosis"]
    }
  ];

  const recentPublications = [
    {
      id: 1,
      title: "Deep Learning Approaches to Protein Folding Prediction",
      authors: "Dr. Sarah Johnson, et al.",
      journal: "Nature Machine Intelligence",
      year: 2024,
      citations: 23,
      status: "published",
      doi: "10.1038/s42256-024-00123-4"
    },
    {
      id: 2,
      title: "Quantum Error Correction in Noisy Intermediate-Scale Quantum Devices",
      authors: "Dr. Sarah Johnson, Dr. Michael Chen",
      journal: "Physical Review Letters",
      year: 2024,
      citations: 15,
      status: "published",
      doi: "10.1103/PhysRevLett.132.123456"
    },
    {
      id: 3,
      title: "Sustainable Battery Materials: A Computational Approach",
      authors: "Dr. Sarah Johnson, et al.",
      journal: "Advanced Materials",
      year: 2023,
      citations: 42,
      status: "published",
      doi: "10.1002/adma.202301234"
    },
    {
      id: 4,
      title: "Medical Image Analysis Using Convolutional Neural Networks",
      authors: "Dr. Sarah Johnson, Dr. Emily Rodriguez",
      journal: "IEEE Transactions on Medical Imaging",
      year: 2023,
      citations: 38,
      status: "published",
      doi: "10.1109/TMI.2023.1234567"
    }
  ];

  const collaborations = [
    {
      id: 1,
      name: "MIT Computer Science",
      type: "University",
      contact: "Prof. David Wilson",
      status: "active",
      projects: 2,
      lastActivity: "2 weeks ago"
    },
    {
      id: 2,
      name: "Google DeepMind",
      type: "Industry",
      contact: "Dr. Lisa Anderson",
      status: "active",
      projects: 1,
      lastActivity: "1 week ago"
    },
    {
      id: 3,
      name: "Stanford Medicine",
      type: "University",
      contact: "Dr. Robert Kim",
      status: "planning",
      projects: 0,
      lastActivity: "1 month ago"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "AI in Healthcare Conference",
      date: "2024-03-15",
      type: "Conference",
      location: "San Francisco, CA",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Grant Proposal Deadline",
      date: "2024-03-20",
      type: "Deadline",
      location: "Online",
      status: "urgent"
    },
    {
      id: 3,
      title: "Research Team Meeting",
      date: "2024-03-08",
      type: "Meeting",
      location: "Lab 204",
      status: "scheduled"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'planning':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-purple-600 bg-purple-100';
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProjects = activeProjects.filter(project => {
    if (selectedFilter === 'all') return true;
    return project.status === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">🔬 Research Dashboard</h1>
          <p className="text-text-muted">Manage your research projects, publications, and collaborations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Microscope className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Active Projects</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.activeProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Publications</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.publications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Citations</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.citations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">H-Index</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.hIndex}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Collaborations</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.collaborations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Funding ($)</p>
                <p className="text-2xl font-bold text-text-primary">${researchStats.funding.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Patents</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.patents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-6 border border-border">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-muted">Students</p>
                <p className="text-2xl font-bold text-text-primary">{researchStats.students}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-surface rounded-lg p-1 border border-border">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'projects', label: 'Projects', icon: Microscope },
              { key: 'publications', label: 'Publications', icon: FileText },
              { key: 'collaborations', label: 'Collaborations', icon: Users },
              { key: 'events', label: 'Events', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab.key
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-background'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-surface rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">📈 Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-background rounded-lg border border-border">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">Published: "Deep Learning Approaches to Protein Folding Prediction"</p>
                    <p className="text-xs text-text-muted">2 days ago • Nature Machine Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-background rounded-lg border border-border">
                  <TrendingUp className="w-5 h-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">Project "AI-Driven Drug Discovery" reached 75% completion</p>
                    <p className="text-xs text-text-muted">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-background rounded-lg border border-border">
                  <Users className="w-5 h-5 text-purple-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">New collaboration established with Stanford Medicine</p>
                    <p className="text-xs text-text-muted">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">⚡ Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center p-4 bg-background rounded-lg border border-border hover:bg-border transition-colors">
                  <Plus className="w-5 h-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-text-primary">New Project</span>
                </button>
                <button className="flex items-center p-4 bg-background rounded-lg border border-border hover:bg-border transition-colors">
                  <Upload className="w-5 h-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-text-primary">Submit Paper</span>
                </button>
                <button className="flex items-center p-4 bg-background rounded-lg border border-border hover:bg-border transition-colors">
                  <Users className="w-5 h-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-text-primary">Find Collaborators</span>
                </button>
                <button className="flex items-center p-4 bg-background rounded-lg border border-border hover:bg-border transition-colors">
                  <Target className="w-5 h-5 text-primary mr-3" />
                  <span className="text-sm font-medium text-text-primary">Apply for Funding</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'projects' && (
          <div className="space-y-6">
            {/* Project Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Projects', count: activeProjects.length },
                { key: 'active', label: 'Active', count: activeProjects.filter(p => p.status === 'active').length },
                { key: 'planning', label: 'Planning', count: activeProjects.filter(p => p.status === 'planning').length },
                { key: 'completed', label: 'Completed', count: activeProjects.filter(p => p.status === 'completed').length }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-muted hover:bg-border border border-border'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Projects List */}
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Microscope className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          {project.title}
                        </h3>
                        <p className="text-text-muted text-sm mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-background text-xs text-text-muted rounded border border-border">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-text-muted">Progress</p>
                      <div className="flex items-center justify-center mt-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-text-primary">{project.progress}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-text-muted">Funding</p>
                      <p className="text-sm font-medium text-text-primary">${project.funding.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-text-muted">Collaborators</p>
                      <p className="text-sm font-medium text-text-primary">{project.collaborators}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-text-muted">Publications</p>
                      <p className="text-sm font-medium text-text-primary">{project.publications}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-3">
                      <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button className="flex items-center px-4 py-2 bg-surface text-text-primary rounded-lg text-sm font-medium hover:bg-border border border-border transition-colors">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </div>
                    <div className="text-sm text-text-muted">
                      {project.startDate} - {project.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'publications' && (
          <div className="space-y-6">
            {recentPublications.map((pub) => (
              <div key={pub.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {pub.title}
                    </h3>
                    <p className="text-text-muted text-sm mb-2">{pub.authors}</p>
                    <p className="text-text-muted text-sm mb-2">{pub.journal} • {pub.year}</p>
                    <p className="text-text-muted text-xs">DOI: {pub.doi}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-sm text-text-muted">Citations</p>
                      <p className="text-lg font-bold text-text-primary">{pub.citations}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pub.status)}`}>
                      {pub.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-surface text-text-primary rounded-lg text-sm font-medium hover:bg-border border border-border transition-colors">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                    <button className="flex items-center px-4 py-2 bg-surface text-text-primary rounded-lg text-sm font-medium hover:bg-border border border-border transition-colors">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Discuss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'collaborations' && (
          <div className="space-y-6">
            {collaborations.map((collab) => (
              <div key={collab.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{collab.name}</h3>
                      <p className="text-text-muted text-sm">{collab.type} • {collab.contact}</p>
                      <p className="text-text-muted text-xs">Last activity: {collab.lastActivity}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-sm text-text-muted">Projects</p>
                      <p className="text-lg font-bold text-text-primary">{collab.projects}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(collab.status)}`}>
                      {collab.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'events' && (
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{event.title}</h3>
                      <p className="text-text-muted text-sm">{event.type} • {event.location}</p>
                      <p className="text-text-muted text-xs">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a demonstration of the research dashboard interface. 
              All data shown is sample data for preview purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}