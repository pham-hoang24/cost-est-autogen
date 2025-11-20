'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Building2,
  Handshake,
  Users,
  Target,
  Briefcase,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Lightbulb,
  Globe,
  MessageCircle,
  DollarSign,
  FileText,
  Microscope,
  AlertCircle
} from 'lucide-react';

const companyFeatures = [
  {
    id: 'onboarding',
    title: 'Company Registration',
    description: 'Complete your company profile and get verified for collaboration opportunities',
    icon: Building2,
    href: '/company-registration',
    color: 'from-blue-500/20 to-blue-600/20',
    iconColor: 'text-blue-500',
    primary: true,
    category: 'onboarding'
  },
  {
    id: 'collaborations',
    title: 'Find Collaborations',
    description: 'Discover research partnerships and academic collaboration opportunities',
    icon: Handshake,
    href: '/collaborations/discovery',
    color: 'from-green-500/20 to-green-600/20',
    iconColor: 'text-green-500',
    category: 'collaboration'
  },
  {
    id: 'resources',
    title: 'Resource Sharing',
    description: 'Contribute cloud credits, data access, and expertise to research projects',
    icon: Users,
    href: '/company-resources',
    color: 'from-purple-500/20 to-purple-600/20',
    iconColor: 'text-purple-500',
    category: 'collaboration'
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Manage your research collaborations and track project progress',
    icon: Briefcase,
    href: '/company-projects',
    color: 'from-orange-500/20 to-orange-600/20',
    iconColor: 'text-orange-500',
    category: 'management'
  },
  {
    id: 'compliance',
    title: 'Compliance & Legal',
    description: 'Ensure your collaborations meet regulatory requirements and IP standards',
    icon: Shield,
    href: '/company-compliance',
    color: 'from-indigo-500/20 to-indigo-600/20',
    iconColor: 'text-indigo-500',
    category: 'management'
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Track your collaboration ROI and research impact metrics',
    icon: Target,
    href: '/company-analytics',
    color: 'from-red-500/20 to-red-600/20',
    iconColor: 'text-red-500',
    category: 'management'
  }
];

const quickStats = [
  { label: 'Active Companies', value: '0', icon: Building2 },
  { label: 'Research Collaborations', value: '0', icon: Handshake },
  { label: 'Resources Contributed', value: '0', icon: Users },
  { label: 'Academic Partners', value: '0', icon: Microscope }
];

export default function CompanyOnboardingPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Building2 className="w-10 h-10 text-background" />
            </div>
            <h1 className="text-5xl font-bold text-text-primary mb-6">
              {t('company.title')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              {t('company.subtitle')}
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
              <Link href="/company-registration">
                <Button className="btn-primary btn-lg">
                  <Building2 className="w-5 h-5 mr-2" />
                  {t('company.getStarted')}
                </Button>
              </Link>
              <Link href="/collaborations/discovery">
                <Button className="btn-outline btn-lg">
                  <Handshake className="w-5 h-5 mr-2" />
                  {t('collaboration.title')}
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
            Join the Finnish Industry-Academic Network
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Connect with leading Finnish research institutions and access breakthrough technologies through strategic partnerships for mutual development.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {companyFeatures.filter(f => f.category === 'onboarding').map((feature) => {
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
                      {feature.primary ? 'Get Started' : 'Learn More'} 
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Collaboration Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Research Collaboration & Partnership
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Access comprehensive collaboration tools and resources designed for Finnish industry-academic partnerships.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyFeatures.filter(f => f.category === 'collaboration').map((feature) => {
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

        {/* Management Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-4">
            Project Management & Analytics
          </h2>
          <p className="text-lg text-text-secondary text-center mb-12 max-w-3xl mx-auto">
            Manage your research collaborations, ensure compliance, and track your innovation impact.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyFeatures.filter(f => f.category === 'management').map((feature) => {
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
                      Manage 
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
            Why Choose GPT-Lab’s Sandbox for Finnish Industry-Academic Collaboration?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Finnish Innovation Ecosystem</h3>
              <p className="text-text-secondary">
                Built specifically for Finnish industry-academic collaboration with tools, workflows, and compliance frameworks designed for corporate research partnerships in Finland.
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Leading Finnish Research Network</h3>
              <p className="text-text-secondary">
                Connect with leading Finnish academic institutions including Aalto University, University of Helsinki, and VTT Technical Research Centre for breakthrough research and mutual development.
              </p>
            </Card>
            
            <Card className="p-6 text-center bg-surface/50 border-primary/20">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">EU Compliance & Security</h3>
              <p className="text-text-secondary">
                Access cutting-edge AI tools with full EU AI Act compliance, GDPR protection, and enterprise-grade security for Finnish companies and international partners.
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
              Ready to Join the Finnish Innovation Network?
            </h2>
            <p className="text-text-secondary mb-6">
              Join leading Finnish companies who are already using GPT-Lab's to collaborate with top researchers, 
              access breakthrough technologies, and drive innovation through strategic partnerships for mutual development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/company-registration">
                <Button className="btn-primary">
                  <Building2 className="w-4 h-4 mr-2" />
                  Join as Company
                </Button>
              </Link>
              <Link href="/collaborations/discovery">
                <Button className="btn-outline">
                  <Handshake className="w-4 h-4 mr-2" />
                  Find Collaborations
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
            This is a demonstration version of the GPT-Lab’s Company Hub. 
            All data and interactions are for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
