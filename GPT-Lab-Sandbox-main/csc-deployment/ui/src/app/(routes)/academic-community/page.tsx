'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Search,
  Filter,
  Star,
  Award,
  Globe,
  Building2,
  GraduationCap,
  Microscope,
  BookOpen,
  TrendingUp
} from 'lucide-react';

export default function AcademicCommunityPage() {
  const communities = [
    {
      id: 1,
      name: "AI Research Network",
      description: "Connecting AI researchers across European universities",
      members: 0,
      activeProjects: 0,
      location: "Europe-wide",
      category: "Artificial Intelligence",
      tags: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
      recentActivity: "2 hours ago",
      isVerified: true
    },
    {
      id: 2,
      name: "Data Science Collaboration Hub",
      description: "Cross-institutional data science projects and research",
      members: 0,
      activeProjects: 0,
      location: "Nordic Region",
      category: "Data Science",
      tags: ["Big Data", "Statistics", "Visualization", "Analytics"],
      recentActivity: "5 hours ago",
      isVerified: true
    },
    {
      id: 3,
      name: "Sustainable Technology Research",
      description: "Green tech and sustainability research collaboration",
      members: 0,
      activeProjects: 0,
      location: "Germany & Netherlands",
      category: "Sustainability",
      tags: ["Green Tech", "Climate", "Energy", "Environment"],
      recentActivity: "1 day ago",
      isVerified: false
    },
    {
      id: 4,
      name: "Cybersecurity Research Alliance",
      description: "Cybersecurity research and threat intelligence sharing",
      members: 0,
      activeProjects: 0,
      location: "UK & Ireland",
      category: "Cybersecurity",
      tags: ["Security", "Privacy", "Cryptography", "Threat Analysis"],
      recentActivity: "2 days ago",
      isVerified: true
    }
  ];

  const events = [
    {
      id: 1,
      title: "EU AI Act Compliance Workshop",
      date: "2024-01-15",
      time: "14:00 CET",
      location: "Virtual",
      attendees: 156,
      type: "Workshop"
    },
    {
      id: 2,
      title: "Research Data Sharing Best Practices",
      date: "2024-01-18",
      time: "10:00 CET",
      location: "Tampere University",
      attendees: 89,
      type: "Seminar"
    },
    {
      id: 3,
      title: "Cross-Border Collaboration Summit",
      date: "2024-01-22",
      time: "09:00 CET",
      location: "Brussels, Belgium",
      attendees: 234,
      type: "Conference"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Academic Community</h1>
              <p className="text-text-secondary">Connect with researchers across European institutions</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search communities, researchers, or topics..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Create Community
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Communities List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Research Communities</h2>
              <Badge variant="secondary">{communities.length} communities</Badge>
            </div>

            <div className="space-y-6">
              {communities.map((community) => (
                <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{community.name}</h3>
                          {community.isVerified && (
                            <Badge variant="green" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-text-secondary mb-3">{community.description}</p>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {community.members.toLocaleString()} members
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {community.activeProjects} active projects
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {community.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Join Community
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{community.category}</Badge>
                      <span className="text-sm text-text-secondary">Updated {community.recentActivity}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {community.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium text-text-primary">{event.title}</h4>
                    <div className="text-sm text-text-secondary mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendees} attendees
                      </div>
                    </div>
                    <Button size="sm" className="mt-2">
                      Register
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total Members</span>
                  <span className="font-bold text-primary">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Active Communities</span>
                  <span className="font-bold text-primary">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Research Projects</span>
                  <span className="font-bold text-primary">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Countries</span>
                  <span className="font-bold text-primary">0</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Find Collaborators
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Share Resources
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
