'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search,
  Filter,
  Users,
  Target,
  Briefcase,
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Globe,
  MessageCircle,
  Building2,
  Microscope,
  DollarSign,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  GraduationCap
} from 'lucide-react';

const collaborationFeatures = [
  {
    id: 'company-company',
    title: 'Company ↔ Company',
    description: 'Enable companies to discover partners, share opportunities, and launch joint projects for mutual business development',
    icon: Building2,
    href: '/collaborations/search?type=company-company',
    color: 'from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-500',
    primary: true
  },
  {
    id: 'university-university',
    title: 'University ↔ University',
    description: 'Allow universities to collaborate on research initiatives, joint funding applications, and academic exchanges',
    icon: Microscope,
    href: '/collaborations/search?type=university-university',
    color: 'from-green-500/20 to-green-600/20',
    iconColor: 'text-green-500'
  },
  {
    id: 'company-university',
    title: 'Company ↔ University',
    description: 'Support applied research collaborations, industry pilots, and innovation-driven partnerships',
    icon: Target,
    href: '/collaborations/search?type=company-university',
    color: 'from-purple-500/20 to-purple-600/20',
    iconColor: 'text-purple-500'
  },
  {
    id: 'individual-company',
    title: 'Individual ↔ Company',
    description: 'Provide experts, freelancers, and researchers with ways to contribute to company projects and initiatives',
    icon: Users,
    href: '/collaborations/search?type=individual-company',
    color: 'from-orange-500/20 to-orange-600/20',
    iconColor: 'text-orange-500'
  },
  {
    id: 'individual-university',
    title: 'Individual ↔ University',
    description: 'Facilitate individuals joining academic projects, publishing together, and accessing lab resources',
    icon: GraduationCap,
    href: '/collaborations/search?type=individual-university',
    color: 'from-indigo-500/20 to-indigo-600/20',
    iconColor: 'text-indigo-500'
  },
  {
    id: 'individual-individual',
    title: 'Individual ↔ Individual / Others',
    description: 'Enable independent researchers and professionals to connect, co-develop ideas, and apply for opportunities together',
    icon: MessageCircle,
    href: '/collaborations/search?type=individual-individual',
    color: 'from-red-500/20 to-red-600/20',
    iconColor: 'text-red-500'
  }
];

const quickStats = [
  { label: 'Active Opportunities', value: '0', icon: Target },
  { label: 'Research Projects', value: '0', icon: Microscope },
  { label: 'Partner Organizations', value: '0', icon: Building2 },
  { label: 'Successful Collaborations', value: '0', icon: Award }
];

const recentOpportunities = [
  {
    id: 1,
    title: 'AI-Powered Healthcare Analytics Platform',
    type: 'Research Partnership',
    organization: 'Tampere University',
    location: 'Tampere, Finland',
    duration: '12 months',
    budget: '€150K - €300K',
    status: 'Open',
    tags: ['AI/ML', 'Healthcare', 'Data Science'],
    posted: '2 days ago'
  },
  {
    id: 2,
    title: 'Quantum Computing Research Initiative',
    type: 'Joint Venture',
    organization: 'Aalto University',
    location: 'Espoo, Finland',
    duration: '24 months',
    budget: '€500K+',
    status: 'Open',
    tags: ['Quantum Computing', 'Physics', 'Advanced Research'],
    posted: '1 week ago'
  },
  {
    id: 3,
    title: 'Sustainable Energy Solutions',
    type: 'Technology Transfer',
    organization: 'VTT Technical Research Centre',
    location: 'Helsinki, Finland',
    duration: '18 months',
    budget: '€100K - €200K',
    status: 'Open',
    tags: ['Clean Energy', 'Sustainability', 'Engineering'],
    posted: '3 days ago'
  }
];

const collaborationTypes = [
  {
    title: 'Research Collaborations',
    description: 'Academic and industry research partnerships',
    icon: Microscope,
    count: '0',
    color: 'text-blue-500'
  },
  {
    title: 'Innovation Projects',
    description: 'Technology development and commercialization',
    icon: Lightbulb,
    count: '0',
    color: 'text-green-500'
  },
  {
    title: 'Knowledge Exchange',
    description: 'Expertise sharing and professional development',
    icon: Users,
    count: '0',
    color: 'text-purple-500'
  },
  {
    title: 'Resource Sharing',
    description: 'Access to facilities, data, and expertise',
    icon: Target,
    count: '0',
    color: 'text-orange-500'
  }
];

export default function FindCollaborationsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-background" />
            </div>
            <h1 className="text-5xl font-bold text-text-primary mb-6">
              {t('collaboration.title')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              {t('collaboration.subtitle')}
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
              <Link href="/collaborations/search">
                <Button className="btn-primary btn-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Start Searching
                </Button>
              </Link>
              <Link href="/collaborations/create">
                <Button className="btn-outline btn-lg">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Create Opportunity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Collaboration Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Collaboration Categories
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Discover how different stakeholders can connect and work together through our comprehensive collaboration platform designed for Finnish research and development.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborationFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className={`p-6 bg-gradient-to-br ${feature.color} border-primary/20 hover:border-primary/40 transition-all group ${feature.primary ? 'ring-2 ring-primary/20' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-surface to-surface/50 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    {feature.primary && (
                      <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded-full">
                        Get Started
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
                      {feature.primary ? 'Get Started' : 'Explore'} 
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Collaboration Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Core Collaboration Features
          </h2>
          <p className="text-lg text-text-secondary text-center mb-8 max-w-3xl mx-auto">
            Access powerful tools and features designed to facilitate meaningful collaborations across all stakeholder types
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                Smart Discovery
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                AI-powered matching system that connects stakeholders based on expertise, interests, and collaboration goals
              </p>
              <Button className="w-full btn-outline">
                Explore Features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                Project Management
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Comprehensive tools for managing collaborative projects, tracking progress, and ensuring successful outcomes
              </p>
              <Button className="w-full btn-outline">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                Network Building
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Connect with researchers, companies, and institutions to build lasting professional relationships
              </p>
              <Button className="w-full btn-outline">
                Join Network
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>

        {/* Collaboration Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            Collaboration Focus Areas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collaborationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.title} className="p-6 text-center bg-surface/50 border-primary/20 hover:border-primary/40 transition-all group">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                    <Icon className={`w-8 h-8 ${type.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{type.title}</h3>
                  <p className="text-text-secondary text-sm mb-3">{type.description}</p>
                  <div className="text-2xl font-bold text-primary">{type.count}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why Choose GPT-Lab's for Collaborations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            Why Choose GPT-Lab's for Your Collaborations?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Stakeholder-Focused</h3>
              <p className="text-text-secondary">
                Our platform is designed around different stakeholder types, ensuring each collaboration category has tailored tools and features for optimal outcomes.
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Finnish Research Network</h3>
              <p className="text-text-secondary">
                Connect with Finnish researchers, companies, and institutions to access diverse expertise and opportunities for mutual development and innovation.
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Flexible Collaboration</h3>
              <p className="text-text-secondary">
                Support for all types of collaborations - from formal research partnerships to informal knowledge sharing and everything in between.
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
              Ready to Start Collaborating?
            </h2>
            <p className="text-text-secondary mb-6">
              Join the Finnish research and development community to discover, connect, and collaborate 
              on projects that drive innovation and mutual development across all stakeholder types.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/collaborations/search">
                <Button className="btn-primary">
                  <Search className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </Link>
              <Link href="/collaborations/create">
                <Button className="btn-outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create Collaboration
                </Button>
              </Link>
              <Link href="/collaborations/networking">
                <Button className="btn-outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Network
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
