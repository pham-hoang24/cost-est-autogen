'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  GraduationCap, 
  Play, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Users,
  Target,
  Zap,
  Brain,
  Database,
  Settings,
  HelpCircle,
  Star,
  Clock,
  Award
} from 'lucide-react';

interface UserOnboardingServiceProps {
  service: any;
}

export default function UserOnboardingService({ service }: UserOnboardingServiceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('');

  const onboardingTracks = [
    {
      id: 'beginner',
      name: 'AI Beginner Track',
      description: 'Perfect for first-time AI users and business stakeholders',
      duration: '30 minutes',
      difficulty: 'Beginner',
      steps: 6,
      audience: 'Business users, project managers, AI newcomers'
    },
    {
      id: 'technical',
      name: 'Technical Professional Track',
      description: 'For developers and data scientists familiar with AI concepts',
      duration: '45 minutes',
      difficulty: 'Intermediate',
      steps: 8,
      audience: 'Developers, data scientists, technical leads'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Decision Maker Track',
      description: 'Focused on ROI, compliance, and strategic AI implementation',
      duration: '25 minutes',
      difficulty: 'Executive',
      steps: 5,
      audience: 'CTOs, VPs, enterprise architects, compliance officers'
    }
  ];

  const onboardingSteps = {
    beginner: [
      {
        title: 'Welcome to GPT-Lab’s AI Sandbox',
        description: 'Learn what the platform can do for your business',
        content: 'Interactive tour of key features and capabilities',
        type: 'introduction',
        duration: '5 min'
      },
      {
        title: 'Understanding AI Services',
        description: 'Explore different types of AI services available',
        content: 'Guided walkthrough of Templates, Experiments, and AI Services',
        type: 'exploration',
        duration: '8 min'
      },
      {
        title: 'Your First AI Experiment',
        description: 'Run a simple sentiment analysis with real data',
        content: 'Hands-on tutorial using the AI Platform Bridge',
        type: 'hands-on',
        duration: '10 min'
      },
      {
        title: 'Understanding Results',
        description: 'Learn to interpret AI model outputs and metrics',
        content: 'Interactive guide to accuracy, precision, recall, and business impact',
        type: 'analysis',
        duration: '5 min'
      },
      {
        title: 'Cost Management',
        description: 'Learn about pricing, credits, and cost optimization',
        content: 'Tutorial on managing AI costs and choosing cost-effective models',
        type: 'business',
        duration: '3 min'
      },
      {
        title: 'Next Steps & Resources',
        description: 'Discover advanced features and get ongoing support',
        content: 'Roadmap for continued learning and contact information',
        type: 'conclusion',
        duration: '2 min'
      }
    ],
    technical: [
      {
        title: 'Platform Architecture Overview',
        description: 'Understand the technical architecture and integrations',
        content: 'Deep dive into Hugging Face, OpenAI, and infrastructure components',
        type: 'technical',
        duration: '8 min'
      },
      {
        title: 'Model Benchmarking Deep Dive',
        description: 'Advanced model evaluation and comparison techniques',
        content: 'Hands-on with real Hugging Face models and performance metrics',
        type: 'hands-on',
        duration: '12 min'
      },
      {
        title: 'Data Preprocessing Pipeline',
        description: 'Master data cleaning, transformation, and feature engineering',
        content: 'Complete data preprocessing workflow with quality assessment',
        type: 'hands-on',
        duration: '10 min'
      },
      {
        title: 'Model Training & Fine-tuning',
        description: 'Learn distributed training and model customization',
        content: 'GPU allocation, hyperparameter tuning, and monitoring',
        type: 'hands-on',
        duration: '15 min'
      },
      {
        title: 'RAG System Implementation',
        description: 'Build production-ready RAG systems',
        content: 'Document upload, embeddings, vector search, and deployment',
        type: 'hands-on',
        duration: '12 min'
      },
      {
        title: 'Model Deployment Pipeline',
        description: 'Deploy models as scalable APIs',
        content: 'Container deployment, API management, and monitoring',
        type: 'deployment',
        duration: '8 min'
      },
      {
        title: 'Security & Compliance',
        description: 'Implement EU AI Act and GDPR compliance',
        content: 'Security best practices, compliance monitoring, audit trails',
        type: 'compliance',
        duration: '6 min'
      },
      {
        title: 'Advanced Workflows & Integration',
        description: 'Custom workflows and enterprise integration patterns',
        content: 'API integration, custom pipelines, and scaling strategies',
        type: 'advanced',
        duration: '5 min'
      }
    ],
    enterprise: [
      {
        title: 'Strategic AI Platform Overview',
        description: 'Business value and competitive advantages of AI platform bridge',
        content: 'ROI analysis, market positioning, and strategic benefits',
        type: 'strategy',
        duration: '8 min'
      },
      {
        title: 'Cost-Benefit Analysis',
        description: 'Understanding AI investment returns and cost optimization',
        content: 'Real cost comparisons, savings analysis, and budget planning',
        type: 'financial',
        duration: '6 min'
      },
      {
        title: 'Compliance & Risk Management',
        description: 'EU AI Act compliance and risk mitigation strategies',
        content: 'Regulatory compliance, risk assessment, and audit preparation',
        type: 'compliance',
        duration: '8 min'
      },
      {
        title: 'Enterprise Integration',
        description: 'Integrating AI platform with existing enterprise systems',
        content: 'API integration, SSO, data governance, and security policies',
        type: 'integration',
        duration: '5 min'
      },
      {
        title: 'Scaling & Team Management',
        description: 'Managing AI initiatives across teams and departments',
        content: 'Resource allocation, team collaboration, and success metrics',
        type: 'management',
        duration: '3 min'
      }
    ]
  };

  const startOnboarding = (trackId: string) => {
    setSelectedTrack(trackId);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const completeStep = (stepIndex: number) => {
    setCompletedSteps(prev => [...prev, stepIndex]);
    if (stepIndex < onboardingSteps[selectedTrack as keyof typeof onboardingSteps].length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'introduction': return <GraduationCap className="w-5 h-5" />;
      case 'exploration': return <BookOpen className="w-5 h-5" />;
      case 'hands-on': return <Play className="w-5 h-5" />;
      case 'analysis': return <Target className="w-5 h-5" />;
      case 'business': return <Star className="w-5 h-5" />;
      case 'technical': return <Settings className="w-5 h-5" />;
      case 'deployment': return <Zap className="w-5 h-5" />;
      case 'compliance': return <FileText className="w-5 h-5" />;
      case 'strategy': return <Brain className="w-5 h-5" />;
      case 'financial': return <Target className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">User Onboarding & Training</h2>
            <p className="text-emerald-200">Guided learning paths for AI platform mastery</p>
          </div>
        </div>
        <p className="text-slate-300">
          Structured onboarding experience tailored to your role and experience level. 
          Get up to speed quickly with hands-on tutorials and real examples.
        </p>
      </Card>

      {/* Track Selection */}
      {!selectedTrack && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Choose Your Learning Path</h3>
            <p className="text-slate-400 mb-6">
              Select the onboarding track that best matches your role and experience level.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {onboardingTracks.map((track) => (
                <Card key={track.id} className="p-6 bg-slate-700 border-slate-600 hover:border-slate-500 transition-colors">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{track.name}</h4>
                    <p className="text-slate-400 text-sm mb-3">{track.description}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">{track.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Steps:</span>
                      <span className="text-white">{track.steps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Level:</span>
                      <Badge variant={track.difficulty === 'Beginner' ? 'green' : track.difficulty === 'Intermediate' ? 'yellow' : 'gray'}>
                        {track.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-slate-400 text-xs mb-1">Target Audience:</p>
                    <p className="text-slate-300 text-sm">{track.audience}</p>
                  </div>

                  <Button 
                    onClick={() => startOnboarding(track.id)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Learning Path
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Onboarding Progress */}
      {selectedTrack && (
        <div className="space-y-6">
          {/* Progress Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {onboardingTracks.find(t => t.id === selectedTrack)?.name}
                </h3>
                <p className="text-slate-400">
                  Step {currentStep + 1} of {onboardingSteps[selectedTrack as keyof typeof onboardingSteps].length}
                </p>
              </div>
              <Button 
                onClick={() => setSelectedTrack('')}
                variant="outline"
              >
                Change Track
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-white">{Math.round(((currentStep + 1) / onboardingSteps[selectedTrack as keyof typeof onboardingSteps].length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / onboardingSteps[selectedTrack as keyof typeof onboardingSteps].length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {onboardingSteps[selectedTrack as keyof typeof onboardingSteps].map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                    index === currentStep ? 'bg-primary/20 border border-primary/30' :
                    completedSteps.includes(index) ? 'bg-green-500/20 border border-green-500/30' :
                    'bg-slate-700 border border-slate-600'
                  }`}
                >
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      index === currentStep ? 'border-primary bg-primary/20' : 'border-slate-500'
                    }`}>
                      <span className="text-xs text-center block leading-3">{index + 1}</span>
                    </div>
                  )}
                  <span className={`text-sm ${
                    index === currentStep ? 'text-white font-medium' : 
                    completedSteps.includes(index) ? 'text-green-300' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Current Step Content */}
          <Card className="p-6">
            {(() => {
              const currentStepData = onboardingSteps[selectedTrack as keyof typeof onboardingSteps][currentStep];
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      {getStepIcon(currentStepData.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{currentStepData.title}</h3>
                      <p className="text-slate-400">{currentStepData.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500 text-sm">{currentStepData.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="bg-slate-700 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-3">What You'll Learn:</h4>
                    <p className="text-slate-300 mb-4">{currentStepData.content}</p>

                    {/* Interactive Elements Based on Step Type */}
                    {currentStepData.type === 'hands-on' && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="w-5 h-5 text-blue-400" />
                          <span className="text-blue-400 font-medium">Interactive Tutorial</span>
                        </div>
                        <p className="text-blue-300 text-sm mb-3">
                          This step includes hands-on practice with real AI models and data.
                        </p>
                        <Button className="btn-primary flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Start Interactive Tutorial
                        </Button>
                      </div>
                    )}

                    {currentStepData.type === 'introduction' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 bg-slate-600 rounded-lg">
                          <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <h5 className="text-white font-medium mb-1">25+ AI Services</h5>
                          <p className="text-slate-400 text-xs">Ready-to-use AI capabilities</p>
                        </div>
                        <div className="text-center p-4 bg-slate-600 rounded-lg">
                          <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <h5 className="text-white font-medium mb-1">Real AI Integration</h5>
                          <p className="text-slate-400 text-xs">Hugging Face + OpenAI</p>
                        </div>
                        <div className="text-center p-4 bg-slate-600 rounded-lg">
                          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <h5 className="text-white font-medium mb-1">Team Collaboration</h5>
                          <p className="text-slate-400 text-xs">Project sharing & management</p>
                        </div>
                      </div>
                    )}

                    {currentStepData.type === 'business' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                        <h5 className="text-green-400 font-medium mb-2">Cost Optimization Tips:</h5>
                        <ul className="text-green-300 text-sm space-y-1">
                          <li>• Use DistilBERT for faster, cheaper inference</li>
                          <li>• Choose appropriate GPU types for your workload</li>
                          <li>• Monitor and optimize training parameters</li>
                          <li>• Leverage platform recommendations for cost savings</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <Button 
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      variant="outline"
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-slate-400">
                      {completedSteps.length} of {onboardingSteps[selectedTrack as keyof typeof onboardingSteps].length} steps completed
                    </div>
                    <Button 
                      onClick={() => completeStep(currentStep)}
                      className="btn-primary flex items-center gap-2"
                    >
                      {currentStep === onboardingSteps[selectedTrack as keyof typeof onboardingSteps].length - 1 ? (
                        <>
                          <Award className="w-4 h-4" />
                          Complete Onboarding
                        </>
                      ) : (
                        <>
                          Next Step
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Help & Resources */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Additional Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                <Video className="w-6 h-6 text-blue-400" />
                <div>
                  <h4 className="text-white font-medium">Video Tutorials</h4>
                  <p className="text-slate-400 text-sm">Step-by-step video guides</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                <FileText className="w-6 h-6 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">Documentation</h4>
                  <p className="text-slate-400 text-sm">Comprehensive guides and APIs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
                <div>
                  <h4 className="text-white font-medium">Community Support</h4>
                  <p className="text-slate-400 text-sm">Get help from experts</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
