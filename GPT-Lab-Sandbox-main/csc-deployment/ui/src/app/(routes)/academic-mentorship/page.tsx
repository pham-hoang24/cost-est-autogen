'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Microscope, 
  UserPlus, 
  Search,
  Filter,
  Star,
  Award,
  MessageCircle,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function AcademicMentorshipPage() {
  const mentors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      title: "Professor of Computer Science",
      institution: "Tampere University",
      expertise: ["Machine Learning", "AI Ethics", "Data Privacy"],
      experience: "15+ years",
      rating: 0,
      mentees: 0,
      availability: "Available",
      location: "Tampere, Finland",
      languages: ["English", "Finnish", "Chinese"],
      isVerified: true,
      bio: "Leading researcher in AI ethics and machine learning with extensive experience in EU research projects."
    },
    {
      id: 2,
      name: "Prof. Michael Schmidt",
      title: "Research Director",
      institution: "Technical University of Munich",
      expertise: ["Cybersecurity", "Privacy Engineering", "GDPR Compliance"],
      experience: "20+ years",
      rating: 0,
      mentees: 0,
      availability: "Limited",
      location: "Munich, Germany",
      languages: ["English", "German"],
      isVerified: true,
      bio: "Expert in cybersecurity and data protection with focus on European regulations and compliance."
    },
    {
      id: 3,
      name: "Dr. Elena Rodriguez",
      title: "Senior Research Fellow",
      institution: "University of Barcelona",
      expertise: ["Data Science", "Statistics", "Research Methods"],
      experience: "12+ years",
      rating: 0,
      mentees: 0,
      availability: "Available",
      location: "Barcelona, Spain",
      languages: ["English", "Spanish", "Catalan"],
      isVerified: true,
      bio: "Specialist in data science and statistical methods with extensive experience in cross-border research."
    }
  ];

  const mentees = [
    {
      id: 1,
      name: "Alex Johnson",
      level: "PhD Student",
      institution: "University of Helsinki",
      researchArea: "Natural Language Processing",
      goals: "Publishing first paper, career guidance",
      availability: "Flexible",
      location: "Helsinki, Finland",
      languages: ["English", "Finnish"]
    },
    {
      id: 2,
      name: "Maria Garcia",
      level: "Postdoc",
      institution: "KU Leuven",
      researchArea: "Computer Vision",
      goals: "Industry transition, research collaboration",
      availability: "Evenings",
      location: "Leuven, Belgium",
      languages: ["English", "Spanish", "Dutch"]
    }
  ];

  const mentorshipPrograms = [
    {
      id: 1,
      name: "EU Research Mentorship Program",
      description: "Connect with experienced researchers across European institutions",
      duration: "6 months",
      participants: 156,
      focus: "Cross-border collaboration",
      isActive: true
    },
    {
      id: 2,
      name: "Early Career Researcher Support",
      description: "Specialized support for PhD students and early career researchers",
      duration: "12 months",
      participants: 89,
      focus: "Career development",
      isActive: true
    },
    {
      id: 3,
      name: "Industry-Academia Bridge",
      description: "Connect academic researchers with industry mentors",
      duration: "3 months",
      participants: 67,
      focus: "Industry transition",
      isActive: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Microscope className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Academic Mentorship</h1>
              <p className="text-text-secondary">Connect with mentors and mentees across European research institutions</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">247</div>
            <div className="text-text-secondary">Active Mentors</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">156</div>
            <div className="text-text-secondary">Active Mentees</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">89</div>
            <div className="text-text-secondary">Active Matches</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary mb-1">4.8</div>
            <div className="text-text-secondary">Average Rating</div>
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
                    placeholder="Search mentors, mentees, or expertise areas..."
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
                  <UserPlus className="w-4 h-4" />
                  Find Mentor
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mentors List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Available Mentors</h2>
              <Badge variant="secondary">{mentors.length} mentors</Badge>
            </div>

            <div className="space-y-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{mentor.name}</h3>
                          {mentor.isVerified && (
                            <Badge variant="green" className="text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={mentor.availability === 'Available' ? 'green' : 'yellow'}>
                            {mentor.availability}
                          </Badge>
                        </div>
                        <p className="text-text-secondary font-medium mb-1">{mentor.title}</p>
                        <p className="text-text-secondary mb-3">{mentor.institution}</p>
                        <p className="text-sm text-text-secondary mb-3">{mentor.bio}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {mentor.rating} rating
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {mentor.mentees} mentees
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {mentor.experience}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {mentor.location}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm font-medium text-text-primary mb-2">Expertise Areas:</div>
                          <div className="flex flex-wrap gap-2">
                            {mentor.expertise.map((area) => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium text-text-primary mb-1">Languages:</div>
                          <div className="text-sm text-text-secondary">{mentor.languages.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm">
                        Request Mentorship
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mentorship Programs */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Mentorship Programs</h3>
              <div className="space-y-4">
                {mentorshipPrograms.map((program) => (
                  <div key={program.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-text-primary">{program.name}</h4>
                      <Badge variant={program.isActive ? 'green' : 'secondary'}>
                        {program.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">{program.description}</p>
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>{program.duration}</span>
                      <span>{program.participants} participants</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {program.focus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Become a Mentor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Find a Mentor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </Card>

            {/* Success Stories */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Success Stories</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-text-secondary mb-2">
                    "Dr. Chen helped me navigate the EU AI Act requirements for my research project. 
                    Her guidance was invaluable for my PhD defense."
                  </p>
                  <div className="text-xs text-text-secondary">- Maria, PhD Student</div>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-text-secondary mb-2">
                    "The mentorship program connected me with industry experts and opened doors 
                    for my postdoc research collaboration."
                  </p>
                  <div className="text-xs text-text-secondary">- Alex, Postdoc</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
