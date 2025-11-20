'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  Microscope,
  Building2,
  UserPlus,
  ArrowRight,
  Star,
  CheckCircle,
  Target,
  Lightbulb,
  Globe,
  MessageCircle,
  User,
  Briefcase,
  AlertCircle
} from 'lucide-react';

const academicFeatures = [
  {
    id: 'individual-researcher',
    title: 'Individual Researcher',
    description: 'Join as an individual researcher, student, or academic professional',
    icon: User,
    href: '/academic-onboarding?type=individual',
    color: 'from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-500',
    primary: true,
    category: 'onboarding'
  },
  {
    id: 'university',
    title: 'University Onboarding',
    description: 'Institutional access for universities and colleges',
    icon: Building2,
    href: '/academic-onboarding?type=university',
    color: 'from-green-500/20 to-green-600/20',
    iconColor: 'text-green-500',
    category: 'onboarding'
  },
  {
    id: 'research-institute',
    title: 'Research Institute',
    description: 'Specialized access for research institutes and centers',
    icon: Microscope,
    href: '/academic-onboarding?type=institute',
    color: 'from-purple-500/20 to-purple-600/20',
    iconColor: 'text-purple-500',
    category: 'onboarding'
  },
  {
    id: 'resources',
    title: 'Resource Library',
    description: 'Access tutorials, papers, datasets, and research tools',
    icon: BookOpen,
    href: '/academic-resources',
    color: 'from-orange-500/20 to-orange-600/20',
    iconColor: 'text-orange-500',
    category: 'resources'
  },
  {
    id: 'templates',
    title: 'Project Templates',
    description: 'Ready-to-use templates for research and coursework',
    icon: FileText,
    href: '/academic-templates',
    color: 'from-indigo-500/20 to-indigo-600/20',
    iconColor: 'text-indigo-500',
    category: 'resources'
  },
  {
    id: 'community',
    title: 'Research Community',
    description: 'Connect with researchers worldwide',
    icon: Users,
    href: '/academic-community',
    color: 'from-red-500/20 to-red-600/20',
    iconColor: 'text-red-500',
    category: 'community'
  },
  {
    id: 'mentorship',
    title: 'Mentorship Program',
    description: 'Find mentors or offer guidance to others',
    icon: Target,
    href: '/academic-mentorship',
    color: 'from-cyan-500/20 to-cyan-600/20',
    iconColor: 'text-cyan-500',
    category: 'community'
  },
  {
    id: 'partnerships',
    title: 'Industry Partnerships',
    description: 'Collaborate with industry partners',
    icon: Briefcase,
    href: '/academic-partnerships',
    color: 'from-pink-500/20 to-pink-600/20',
    iconColor: 'text-pink-500',
    category: 'community'
  }
];

const quickStats = [
  { label: 'Active Researchers', value: '0', icon: Users },
  { label: 'Research Projects', value: '0', icon: Microscope },
  { label: 'Resources Available', value: '0', icon: BookOpen },
  { label: 'Institutions', value: '0', icon: Building2 }
];

export default function AcademicHubPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8">
              <GraduationCap className="w-10 h-10 text-background" />
            </div>
            <h1 className="text-5xl font-bold text-text-primary mb-6">
              {t('academic.title')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              {t('academic.subtitle')}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-4 bg-surface/50 border-primary/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
                    </div>
                    <div className="text-sm text-text-secondary">{stat.label}</div>
                  </Card>
                );
              })}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/academic-onboarding">
                <Button className="btn-primary btn-lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join as Researcher
                </Button>
              </Link>
              <Link href="/academic-resources">
                <Button className="btn-outline btn-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Onboarding Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Join the Finnish Research Community
          </h2>
            <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Choose your path to access GPT-Lab’s comprehensive research platform and collaboration tools.
            </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {academicFeatures.filter(f => f.category === 'onboarding').map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className={`p-6 bg-gradient-to-br ${feature.color} border-primary/20 hover:border-primary/40 transition-all group ${feature.primary ? 'ring-2 ring-primary/20' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-surface to-surface/50 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    {feature.primary && (
                      <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                    {feature.description}
                  </p>
                  
                  <Link href={feature.href}>
                    <Button className={`w-full ${feature.primary ? 'btn-primary' : 'btn-outline'}`}>
                      {feature.primary ? 'Get Started' : 'Learn More'} 
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Resources Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Research Resources & Tools
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Access comprehensive research tools, templates, and resources designed for academic excellence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicFeatures.filter(f => f.category === 'resources').map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className={`p-6 bg-gradient-to-br ${feature.color} border-primary/20 hover:border-primary/40 transition-all group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-surface to-surface/50 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                    {feature.description}
                  </p>
                  
                  <Link href={feature.href}>
                    <Button className="w-full btn-outline">
                      Explore 
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Community Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Research Community & Collaboration
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Connect with researchers, find mentors, and collaborate on breakthrough projects.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {academicFeatures.filter(f => f.category === 'community').map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className={`p-6 bg-gradient-to-br ${feature.color} border-primary/20 hover:border-primary/40 transition-all group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-surface to-surface/50 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                    {feature.description}
                  </p>
                  
                  <Link href={feature.href}>
                    <Button className="w-full btn-outline">
                      Join 
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why Choose GPT-Lab’s */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            Why Choose GPT-Lab’s Sandbox for Your Research?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Research-Focused</h3>
              <p className="text-text-secondary">
                Built specifically for academic research with tools, templates, and workflows designed by researchers for researchers.
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Finnish Research Community</h3>
              <p className="text-text-secondary">
                Connect with researchers from leading Finnish institutions and collaborate on breakthrough projects.
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Cutting-Edge Tools</h3>
              <p className="text-text-secondary">
                Access the latest AI and machine learning tools with enterprise-grade security and compliance.
              </p>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Ready to Advance Your Research?
            </h2>
            <p className="text-text-secondary mb-6">
              Join thousands of researchers who are already using GPT-Lab's to accelerate their work, 
              collaborate with peers, and make breakthrough discoveries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/academic-onboarding?type=individual">
                <Button className="btn-primary">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Get Started Today
                </Button>
              </Link>
              <Link href="/academic-community">
                <Button className="btn-outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Demo Version Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Demo Version</span>
          </div>
            <p className="text-center text-yellow-700 text-sm mt-2">
            This is a demonstration version of the GPT-Lab’s Academic Hub. 
            All data and interactions are for demonstration purposes only.
            </p>
        </div>
      </div>
    </div>
  );
}