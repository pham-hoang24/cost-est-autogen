'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import Link from 'next/link';
import { 
  Users,
  MessageCircle,
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Building2,
  GraduationCap,
  Briefcase,
  Target,
  ArrowRight,
  CheckCircle,
  Globe,
  TrendingUp
} from 'lucide-react';

export default function NetworkingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'researchers', label: 'Researchers', icon: GraduationCap },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'institutions', label: 'Institutions', icon: Globe },
    { id: 'students', label: 'Students', icon: Target }
  ];

  const networkMembers = [
    {
      id: 1,
      name: 'Dr. Anna Virtanen',
      role: 'Senior Researcher',
      organization: 'University of Helsinki',
      location: 'Helsinki, Finland',
      expertise: ['Machine Learning', 'Computer Vision', 'AI Ethics'],
      interests: ['Sustainable AI', 'Healthcare AI', 'Collaborative Research'],
      avatar: 'AV',
      verified: true,
      online: true
    },
    {
      id: 2,
      name: 'TechCorp Finland',
      role: 'R&D Director',
      organization: 'TechCorp Finland',
      location: 'Espoo, Finland',
      expertise: ['Industrial AI', 'IoT', 'Digital Transformation'],
      interests: ['Industry 4.0', 'Smart Manufacturing', 'Research Partnerships'],
      avatar: 'TC',
      verified: true,
      online: false
    },
    {
      id: 3,
      name: 'Mika Koskinen',
      role: 'PhD Student',
      organization: 'Aalto University',
      location: 'Espoo, Finland',
      expertise: ['Natural Language Processing', 'Deep Learning'],
      interests: ['Academic Research', 'Open Source', 'Mentorship'],
      avatar: 'MK',
      verified: false,
      online: true
    },
    {
      id: 4,
      name: 'VTT Technical Research Centre',
      role: 'Research Institute',
      organization: 'VTT Technical Research Centre',
      location: 'Espoo, Finland',
      expertise: ['Applied Research', 'Technology Transfer', 'Innovation'],
      interests: ['Industry Collaboration', 'Technology Development', 'Research Services'],
      avatar: 'VTT',
      verified: true,
      online: true
    }
  ];

  const filteredMembers = networkMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'researchers' && member.role.includes('Researcher')) ||
                           (selectedCategory === 'companies' && member.organization.includes('Corp')) ||
                           (selectedCategory === 'institutions' && member.organization.includes('University')) ||
                           (selectedCategory === 'students' && member.role.includes('Student'));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Header */}
      <div className="bg-surface/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Finnish Research Network
              </h1>
              <p className="text-text-secondary">
                Connect with researchers, companies, and institutions across Finland
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="accent">
                {networkMembers.length} Active Members
              </Badge>
              <Link href="/collaborations/create">
                <Button className="btn-primary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, organization, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'primary' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    className="whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Network Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{member.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">{member.name}</h3>
                      {member.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{member.role}</p>
                    <p className="text-sm text-text-muted">{member.organization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${member.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-text-muted">
                    {member.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-text-muted" />
                  <span className="text-sm text-text-muted">{member.location}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {member.expertise.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="muted" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.expertise.length > 3 && (
                    <Badge variant="muted" className="text-xs">
                      +{member.expertise.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {member.interests.slice(0, 2).map((interest, index) => (
                    <Badge key={index} variant="accent" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {member.interests.length > 2 && (
                    <Badge variant="accent" className="text-xs">
                      +{member.interests.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="primary" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No members found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Ready to Expand Your Network?
              </h2>
              <p className="text-text-secondary mb-6">
                Join the Finnish research community and connect with like-minded professionals 
                to advance your research and career.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/collaborations/create">
                  <Button className="btn-primary">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start a Collaboration
                  </Button>
                </Link>
                <Link href="/collaborations/search">
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Search Projects
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
