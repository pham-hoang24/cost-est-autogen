'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Building2, 
  Handshake, 
  Search,
  Filter,
  Star,
  Award,
  MessageCircle,
  Calendar,
  MapPin,
  Globe,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export default function AcademicPartnershipsPage() {
  const partnerships = [
    {
      id: 1,
      name: "TechCorp Research Alliance",
      company: "TechCorp Solutions",
      type: "Industry Partnership",
      status: "Active",
      duration: "2 years",
      value: "€500K",
      focus: "AI Ethics & Compliance",
      description: "Collaborative research on AI ethics frameworks for European markets",
      participants: 12,
      institutions: ["Tampere University", "Technical University of Munich"],
      deliverables: ["Research Papers", "Open Source Tools", "Best Practices Guide"],
      contact: "Dr. Sarah Chen",
      isVerified: true
    },
    {
      id: 2,
      name: "DataFlow Academic Program",
      company: "DataFlow Technologies",
      type: "Research Grant",
      status: "Active",
      duration: "18 months",
      value: "€300K",
      focus: "Data Privacy & GDPR",
      description: "Developing privacy-preserving data analysis techniques",
      participants: 8,
      institutions: ["University of Barcelona", "KU Leuven"],
      deliverables: ["Prototype System", "Technical Documentation", "Workshop Series"],
      contact: "Prof. Michael Schmidt",
      isVerified: true
    },
    {
      id: 3,
      name: "GreenTech Innovation Hub",
      company: "GreenTech Industries",
      type: "Joint Venture",
      status: "Proposal",
      duration: "3 years",
      value: "€0",
      focus: "Sustainable Technology",
      description: "Research and development of sustainable AI technologies",
      participants: 20,
      institutions: ["Multiple EU Universities"],
      deliverables: ["Patent Applications", "Commercial Products", "Training Programs"],
      contact: "Dr. Elena Rodriguez",
      isVerified: false
    }
  ];

  const opportunities = [
    {
      id: 1,
      title: "AI Research Collaboration",
      company: "InnovateTech",
      type: "Research Partnership",
      deadline: "2024-02-15",
      value: "€250K",
      description: "Seeking academic partners for AI research in healthcare applications",
      requirements: ["PhD in AI/ML", "Healthcare experience", "EU institution"],
      isUrgent: true
    },
    {
      id: 2,
      title: "Data Science Internship Program",
      company: "DataVault",
      type: "Student Program",
      deadline: "2024-03-01",
      value: "€15K",
      description: "Summer internship program for data science students",
      requirements: ["Master's student", "Python/R skills", "EU citizenship"],
      isUrgent: false
    },
    {
      id: 3,
      title: "Cybersecurity Research Grant",
      company: "SecureNet",
      type: "Research Grant",
      deadline: "2024-01-30",
      value: "€400K",
      description: "Multi-year research grant for cybersecurity innovation",
      requirements: ["Research team", "Cybersecurity focus", "EU compliance"],
      isUrgent: true
    }
  ];

  const successStories = [
    {
      id: 1,
      title: "AI Ethics Framework",
      partners: "Tampere University & TechCorp",
      outcome: "Published in Nature AI, 0 citations",
      impact: "Adopted by 0 companies",
      year: "2023"
    },
    {
      id: 2,
      title: "Privacy-Preserving Analytics",
      partners: "KU Leuven & DataFlow",
      outcome: "Open source toolkit, 1000+ downloads",
      impact: "Used in 3 EU research projects",
      year: "2023"
    },
    {
      id: 3,
      title: "Sustainable AI Lab",
      partners: "Multiple Universities & GreenTech",
      outcome: "€0 funding secured",
      impact: "Created 0 research positions",
      year: "2022"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Industry Partnerships</h1>
              <p className="text-text-secondary">Connect academic research with industry innovation across Europe</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Handshake className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">47</div>
            <div className="text-text-secondary">Active Partnerships</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">€0</div>
            <div className="text-text-secondary">Total Value</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">156</div>
            <div className="text-text-secondary">Researchers Involved</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">23</div>
            <div className="text-text-secondary">Success Stories</div>
          </Card>
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
                    placeholder="Search partnerships, companies, or research areas..."
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
                  <Handshake className="w-4 h-4" />
                  Propose Partnership
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partnerships List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Active Partnerships</h2>
              <Badge variant="secondary">{partnerships.length} partnerships</Badge>
            </div>

            <div className="space-y-6">
              {partnerships.map((partnership) => (
                <Card key={partnership.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{partnership.name}</h3>
                          {partnership.isVerified && (
                            <Badge variant="green" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={partnership.status === 'Active' ? 'green' : 'yellow'}>
                            {partnership.status}
                          </Badge>
                        </div>
                        <p className="text-text-secondary font-medium mb-1">{partnership.company}</p>
                        <p className="text-text-secondary mb-3">{partnership.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text-secondary mb-4">
                          <div>
                            <div className="font-medium text-text-primary">Type</div>
                            <div>{partnership.type}</div>
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">Duration</div>
                            <div>{partnership.duration}</div>
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">Value</div>
                            <div className="text-green-600 font-bold">{partnership.value}</div>
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">Participants</div>
                            <div>{partnership.participants}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium text-text-primary mb-2">Focus Area:</div>
                          <Badge variant="outline">{partnership.focus}</Badge>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium text-text-primary mb-2">Institutions:</div>
                          <div className="text-sm text-text-secondary">{partnership.institutions.join(', ')}</div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium text-text-primary mb-2">Deliverables:</div>
                          <div className="flex flex-wrap gap-2">
                            {partnership.deliverables.map((deliverable) => (
                              <Badge key={deliverable} variant="secondary" className="text-xs">
                                {deliverable}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-text-secondary">
                          <span className="font-medium">Contact:</span> {partnership.contact}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Open Opportunities */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Open Opportunities</h3>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-text-primary">{opportunity.title}</h4>
                      {opportunity.isUrgent && (
                        <Badge variant="red" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{opportunity.company} • {opportunity.type}</p>
                    <p className="text-sm text-text-secondary mb-3">{opportunity.description}</p>
                    <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
                      <span>Value: <span className="font-bold text-green-600">{opportunity.value}</span></span>
                      <span>Deadline: {opportunity.deadline}</span>
                    </div>
                    <div className="mb-3">
                      <div className="text-xs font-medium text-text-primary mb-1">Requirements:</div>
                      <div className="text-xs text-text-secondary">{opportunity.requirements.join(', ')}</div>
                    </div>
                    <Button size="sm" className="w-full">
                      Apply Now
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Success Stories */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Success Stories</h3>
              <div className="space-y-4">
                {successStories.map((story) => (
                  <div key={story.id} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-text-primary mb-1">{story.title}</h4>
                    <p className="text-sm text-text-secondary mb-2">{story.partners}</p>
                    <p className="text-sm text-text-secondary mb-1">{story.outcome}</p>
                    <p className="text-xs text-text-secondary">Impact: {story.impact}</p>
                    <div className="text-xs text-text-secondary mt-1">{story.year}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Handshake className="w-4 h-4 mr-2" />
                  Propose Partnership
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Opportunities
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Industry
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
