'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Building2, 
  FlaskConical, 
  Rocket,
  UserPlus,
  Settings,
  Play,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Video,
  Lightbulb,
  Clock,
  MapPin,
  Mail,
  Globe,
  ExternalLink
} from 'lucide-react';

export default function GettingStartedPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Account Registration",
      description: "Create your SW4E Sandbox account",
      icon: UserPlus,
      color: "blue"
    },
    {
      id: 2,
      title: "Organization Setup",
      description: "Configure your workspace",
      icon: Building2,
      color: "green"
    },
    {
      id: 3,
      title: "First Experiment",
      description: "Run your first AI experiment",
      icon: FlaskConical,
      color: "purple"
    },
    {
      id: 4,
      title: "Advanced Features",
      description: "Explore advanced capabilities",
      icon: Rocket,
      color: "orange"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <h1 className="text-5xl font-bold text-text-primary">
          Getting Started with <span className="text-primary">SW4E Sandbox</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Your Journey to AI Excellence Starts Here
        </p>
      </div>

      {/* Prerequisites */}
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200/20">
        <h2 className="text-2xl font-bold text-text-primary mb-4">📋 Prerequisites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-400 mt-1" />
            <div>
              <p className="font-medium text-text-primary">EU Residency</p>
              <p className="text-text-secondary text-sm">Organization must be based in EU/EEA</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <p className="font-medium text-text-primary">Research Purpose</p>
              <p className="text-text-secondary text-sm">Academic or commercial AI research</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-green-400 mt-1" />
            <div>
              <p className="font-medium text-text-primary">Basic AI Knowledge</p>
              <p className="text-text-secondary text-sm">Familiarity with machine learning concepts</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-400 mt-1" />
            <div>
              <p className="font-medium text-text-primary">Account Approval</p>
              <p className="text-text-secondary text-sm">All accounts require admin approval for security</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Step Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {steps.map((step) => (
          <Button
            key={step.id}
            variant={currentStep === step.id ? "primary" : "outline"}
            onClick={() => setCurrentStep(step.id)}
            className="flex items-center gap-2"
          >
            <step.icon className="w-4 h-4" />
            Step {step.id}: {step.title}
          </Button>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-text-primary mb-4">🎯 Step 1: Account Registration</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-text-primary">Click "Register" on the homepage</p>
                    <p className="text-text-secondary text-sm">Navigate to the registration form</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-text-primary">Fill in your details</p>
                    <p className="text-text-secondary text-sm">Name, email, organization, research area</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-text-primary">Describe your research</p>
                    <p className="text-text-secondary text-sm">Help us understand your needs and use case</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium text-text-primary">Wait for approval</p>
                    <p className="text-text-secondary text-sm">Usually within 24 hours during business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">5</div>
                  <div>
                    <p className="font-medium text-text-primary">Receive welcome email</p>
                    <p className="text-text-secondary text-sm">With login credentials and next steps</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="btn-primary" onClick={() => window.location.href = '/register'}>
                  Start Registration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-text-primary mb-4">🏢 Step 2: Organization Setup</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-text-primary">Create your organization</p>
                    <p className="text-text-secondary text-sm">Or join an existing one if invited</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-text-primary">Set up team members</p>
                    <p className="text-text-secondary text-sm">Invite collaborators and assign roles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-text-primary">Configure permissions</p>
                    <p className="text-text-secondary text-sm">Define roles and access levels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium text-text-primary">Set resource quotas</p>
                    <p className="text-text-secondary text-sm">Establish usage limits and budgets</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="btn-primary" onClick={() => window.location.href = '/organizations'}>
                  Manage Organizations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-text-primary mb-4">🔬 Step 3: Your First Experiment</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-text-primary">Access AI Services</p>
                    <p className="text-text-secondary text-sm">Browse available models and tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-text-primary">Upload your data</p>
                    <p className="text-text-secondary text-sm">Secure and compliant data handling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-text-primary">Run experiments</p>
                    <p className="text-text-secondary text-sm">Use Jupyter notebooks or API calls</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium text-text-primary">Monitor progress</p>
                    <p className="text-text-secondary text-sm">Real-time tracking and logging</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background text-sm font-bold">5</div>
                  <div>
                    <p className="font-medium text-text-primary">Deploy models</p>
                    <p className="text-text-secondary text-sm">One-click deployment to production</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="btn-primary" onClick={() => window.location.href = '/ai-services'}>
                  Explore AI Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-text-primary mb-4">📚 Step 4: Advanced Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <p className="font-medium text-text-primary">Data Anonymization</p>
                      <p className="text-text-secondary text-sm">Protect sensitive information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium text-text-primary">Custom Models</p>
                      <p className="text-text-secondary text-sm">Train your own AI models</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <p className="font-medium text-text-primary">API Integration</p>
                      <p className="text-text-secondary text-sm">Connect with external systems</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                    <div>
                      <p className="font-medium text-text-primary">Collaboration</p>
                      <p className="text-text-secondary text-sm">Share projects with team members</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Help Resources */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">🆘 Need Help?</h2>
          <p className="text-lg text-text-secondary mb-8">We're here to support your journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Documentation</h3>
            <p className="text-text-secondary text-sm mb-4">Comprehensive guides and tutorials</p>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/documentation'}>
              Read Docs
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Community Forum</h3>
            <p className="text-text-secondary text-sm mb-4">Connect with other researchers</p>
            <Button size="sm" variant="outline" onClick={() => window.open('https://community.sw4e.org', '_blank')}>
              Join Forum
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Support Tickets</h3>
            <p className="text-text-secondary text-sm mb-4">Direct help from our team</p>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/help'}>
              Get Support
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Video Tutorials</h3>
            <p className="text-text-secondary text-sm mb-4">Step-by-step walkthroughs</p>
            <Button size="sm" variant="outline" onClick={() => window.open('https://youtube.com/sw4e', '_blank')}>
              Watch Videos
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Pro Tips */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-text-primary mb-4">💡 Pro Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                  <span>Start with small datasets to understand the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                  <span>Use the sandbox environment for testing</span>
                </li>
              </ul>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                  <span>Join our monthly webinars for best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                  <span>Follow our blog for latest features and updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Support */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Still Have Questions?</h2>
          <p className="text-text-secondary mb-6">Our support team is here to help</p>
          <div className="flex items-center justify-center gap-4">
            <Button className="btn-primary" onClick={() => window.location.href = '/help'}>
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button className="btn-outline" onClick={() => window.location.href = '/documentation'}>
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Documentation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
