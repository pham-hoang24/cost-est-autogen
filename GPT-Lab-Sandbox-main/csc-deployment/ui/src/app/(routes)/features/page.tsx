'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import ServiceCategoryCard from '@/components/ServiceCategoryCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Brain, 
  Database, 
  FlaskConical, 
  Shield, 
  FileText,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Service data organized by thematic categories
const serviceCategories = [
  {
    id: 'research-development',
    title: 'Research & Development',
    description: 'Comprehensive tools for scientific research and experimentation',
    icon: <FlaskConical className="w-8 h-8 text-white" />,
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-purple-500',
    borderColor: 'border-blue-500/20',
    hoverColor: 'group-hover:text-blue-400',
    services: [
      {
        id: 'controlled-experiment',
        name: 'Controlled Experiment Execution',
        description: 'Design and run controlled experiments with statistical significance testing',
        type: 'experiment',
        status: 'active' as const
      },
      {
        id: 'results-dashboard',
        name: 'Results Dashboard & Reports',
        description: 'Visualize experiment results with interactive dashboards and automated reporting',
        type: 'visualization',
        status: 'active' as const
      },
      {
        id: 'preloaded-datasets',
        name: 'Preloaded Demo Datasets',
        description: 'Access curated datasets for quick experimentation and model testing',
        type: 'dataset',
        status: 'active' as const
      },
      {
        id: 'experiment-tracking',
        name: 'Experiment Tracking System',
        description: 'Track experiment parameters, metrics, and results across multiple runs',
        type: 'tracking',
        status: 'active' as const
      },
      {
        id: 'model-benchmarking',
        name: 'Model Benchmarking',
        description: 'Compare model performance across different datasets and metrics',
        type: 'assessment',
        status: 'active' as const
      },
      {
        id: 'personal-dashboards',
        name: 'Personal User Dashboards',
        description: 'Customizable dashboards for tracking your research progress and metrics',
        type: 'dashboard',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'ai-machine-learning',
    title: 'AI & Machine Learning',
    description: 'Advanced AI capabilities and intelligent automation',
    icon: <Brain className="w-8 h-8 text-white" />,
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    borderColor: 'border-green-500/20',
    hoverColor: 'group-hover:text-green-400',
    services: [
      {
        id: 'text-analysis',
        name: 'Text Analysis AI',
        description: 'Natural language processing for sentiment analysis, classification, and extraction',
        type: 'nlp',
        status: 'active' as const
      },
      {
        id: 'computer-vision',
        name: 'Computer Vision Models',
        description: 'Image classification, object detection, and visual recognition capabilities',
        type: 'computer_vision',
        status: 'active' as const
      },
      {
        id: 'speech-processing',
        name: 'Speech Processing Suite',
        description: 'Speech-to-text, text-to-speech, and voice analysis with real-time processing',
        type: 'speech',
        status: 'active' as const
      },
      {
        id: 'recommendation-engine',
        name: 'Recommendation Engine',
        description: 'Personalized recommendation systems with collaborative and content-based filtering',
        type: 'recommendation',
        status: 'active' as const
      },
      {
        id: 'time-series-analysis',
        name: 'Time Series Analysis',
        description: 'Advanced forecasting and anomaly detection for temporal data',
        type: 'time_series',
        status: 'active' as const
      },
      {
        id: 'anomaly-detection',
        name: 'Anomaly Detection',
        description: 'Real-time anomaly detection for data streams and pattern recognition',
        type: 'anomaly_detection',
        status: 'active' as const
      },
      {
        id: 'rag-workflows',
        name: 'RAG Workflow Templates',
        description: 'Ready-to-use Retrieval-Augmented Generation templates for document Q&A',
        type: 'rag',
        status: 'active' as const
      },
      {
        id: 'fine-tuning',
        name: 'Fine-Tuning Workflows',
        description: 'Model fine-tuning pipelines with automated optimization and monitoring',
        type: 'fine_tuning',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'templates-workflows',
    title: 'Templates & Workflows',
    description: 'Ready-to-use templates and automated workflows',
    icon: <FileText className="w-8 h-8 text-white" />,
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    borderColor: 'border-purple-500/20',
    hoverColor: 'group-hover:text-purple-400',
    services: [
      {
        id: 'document-templates',
        name: 'Document Templates',
        description: 'Pre-built templates for research proposals, reports, and documentation',
        type: 'template',
        status: 'active' as const
      },
      {
        id: 'cost-estimation',
        name: 'Cost Estimation Models',
        description: 'Predict project costs and resource requirements with machine learning',
        type: 'estimation',
        status: 'active' as const
      },
      {
        id: 'ai-technique-assessment',
        name: 'AI Technique Assessment',
        description: 'Evaluate and compare different AI techniques for your specific use case',
        type: 'assessment',
        status: 'active' as const
      },
      {
        id: 'data-preprocessing',
        name: 'Data Preprocessing Pipeline',
        description: 'Automated data cleaning, transformation, and feature engineering',
        type: 'preprocessing',
        status: 'active' as const
      },
      {
        id: 'industry-workflows',
        name: 'Industry-Specific Workflows',
        description: 'Specialized workflows for healthcare, manufacturing, and finance sectors',
        type: 'workflow',
        status: 'active' as const
      },
      {
        id: 'company-estimation',
        name: 'Company Estimation Models',
        description: 'Learn from past pricing patterns to improve cost predictions',
        type: 'estimation',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance',
    description: 'Enterprise-grade security and regulatory compliance',
    icon: <Shield className="w-8 h-8 text-white" />,
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    borderColor: 'border-orange-500/20',
    hoverColor: 'group-hover:text-orange-400',
    services: [
      {
        id: 'security-dashboard',
        name: 'Security Compliance Dashboard',
        description: 'Monitor security posture and compliance status across all services',
        type: 'security',
        status: 'active' as const
      },
      {
        id: 'data-anonymization',
        name: 'Data Anonymization Service',
        description: 'Automated data anonymization with k-anonymity and differential privacy',
        type: 'data_governance',
        status: 'active' as const
      },
      {
        id: 'eu-ai-act',
        name: 'EU AI Act Compliance',
        description: 'Ensure compliance with EU AI Act regulations and requirements',
        type: 'compliance',
        status: 'active' as const
      },
      {
        id: 'gdpr-protection',
        name: 'GDPR Data Protection',
        description: 'Comprehensive GDPR compliance tools and data protection measures',
        type: 'compliance',
        status: 'active' as const
      },
      {
        id: 'vulnerability-scanner',
        name: 'Vulnerability Scanner',
        description: 'Automated security scanning and vulnerability assessment for AI models',
        type: 'security',
        status: 'active' as const
      },
      {
        id: 'legal-assistant',
        name: 'Legal AI Assistant',
        description: 'AI-powered legal document analysis and compliance checking',
        type: 'legal_ai',
        status: 'active' as const
      }
    ]
  },
  {
    id: 'infrastructure-resources',
    title: 'Infrastructure & Resources',
    description: 'Scalable infrastructure and resource management',
    icon: <Database className="w-8 h-8 text-white" />,
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-500',
    borderColor: 'border-cyan-500/20',
    hoverColor: 'group-hover:text-cyan-400',
    services: [
      {
        id: 'gpu-manager',
        name: 'GPU Resource Manager',
        description: 'Intelligent GPU allocation and management for AI training and inference',
        type: 'compute',
        status: 'active' as const
      },
      {
        id: 'secure-storage',
        name: 'Secure Data Storage',
        description: 'Enterprise-grade storage with encryption and backup capabilities',
        type: 'storage',
        status: 'active' as const
      },
      {
        id: 'user-onboarding',
        name: 'User Onboarding System',
        description: 'Comprehensive onboarding experience for new users and organizations',
        type: 'onboarding',
        status: 'active' as const
      },
      {
        id: 'ai-platform-bridge',
        name: 'AI Platform Bridge',
        description: 'Seamless integration with popular AI platforms and frameworks',
        type: 'platform',
        status: 'active' as const
      },
      {
        id: 'code-analysis',
        name: 'Code Analysis Tools',
        description: 'Automated code analysis and quality assessment for AI projects',
        type: 'code_analysis',
        status: 'beta' as const
      },
      {
        id: 'automated-testing',
        name: 'Automated Testing',
        description: 'Comprehensive testing suite for AI models and data pipelines',
        type: 'testing',
        status: 'beta' as const
      }
    ]
  },
  {
    id: 'collaboration-management',
    title: 'Collaboration & Management',
    description: 'Team collaboration and project management tools',
    icon: <Users className="w-8 h-8 text-white" />,
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-500',
    borderColor: 'border-indigo-500/20',
    hoverColor: 'group-hover:text-indigo-400',
    services: [
      {
        id: 'multi-party-projects',
        name: 'Multi-Party Projects',
        description: 'Collaborate across organizations with secure multi-party project management',
        type: 'collaboration',
        status: 'active' as const
      },
      {
        id: 'project-management',
        name: 'Project Management',
        description: 'Comprehensive project tracking and resource management tools',
        type: 'management',
        status: 'active' as const
      },
      {
        id: 'collaboration-analytics',
        name: 'Collaboration Analytics',
        description: 'Track collaboration metrics and measure project success',
        type: 'analytics',
        status: 'active' as const
      },
      {
        id: 'resource-sharing',
        name: 'Resource Sharing',
        description: 'Share computational resources, data, and expertise across teams',
        type: 'sharing',
        status: 'active' as const
      },
      {
        id: 'meeting-scheduling',
        name: 'Meeting Scheduling',
        description: 'Intelligent meeting scheduling and calendar management',
        type: 'scheduling',
        status: 'active' as const
      },
      {
        id: 'document-management',
        name: 'Document Management',
        description: 'Centralized document storage and collaboration platform',
        type: 'documentation',
        status: 'active' as const
      }
    ]
  }
];

export default function FeaturesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleServiceClick = (serviceId: string) => {
    router.push(`/ai-services/${serviceId}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-5xl font-bold text-text-primary">
          {t('features.title')}
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          {t('features.subtitle')}
        </p>
      </div>

      {/* Thematic Service Categories */}
      <div className="space-y-8">
        {serviceCategories.map((category) => (
          <ServiceCategoryCard
            key={category.id}
            title={category.title}
            description={category.description}
            icon={category.icon}
            services={category.services}
            isExpanded={expandedCategory === category.id}
            onToggle={() => handleCategoryToggle(category.id)}
            onServiceClick={handleServiceClick}
            gradientFrom={category.gradientFrom}
            gradientTo={category.gradientTo}
            borderColor={category.borderColor}
            hoverColor={category.hoverColor}
          />
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience These Features?</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Get started with SW4E Sandbox today and access all these powerful capabilities for Finnish research and development
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4"
            onClick={() => router.push('/register')}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Start Free Trial
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white/10 text-lg px-8 py-4"
            onClick={() => router.push('/ai-services')}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Explore All Services
          </Button>
        </div>
      </div>
    </div>
  );
}