'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  HelpCircle, 
  Mail, 
  Clock, 
  MessageCircle,
  Book,
  Video,
  Users,
  Shield,
  CreditCard,
  Code,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Globe
} from 'lucide-react';

export default function Help() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      category: "Account & Access",
      questions: [
        {
          q: "How long does account approval take?",
          a: "Most accounts are approved within 24 hours during business days (Monday-Friday, 9 AM - 6 PM CET)."
        },
        {
          q: "Can I invite team members?",
          a: "Yes, organization admins can invite and manage team members with different role permissions."
        },
        {
          q: "What if I forget my password?",
          a: "Use the 'Forgot Password' link on the login page to reset your password via email."
        }
      ]
    },
    {
      category: "Usage & Billing",
      questions: [
        {
          q: "How are resources billed?",
          a: "We use a fair usage model with transparent pricing per compute hour. Academic users get generous free quotas."
        },
        {
          q: "Can I monitor my usage?",
          a: "Yes, real-time usage tracking is available in your dashboard with detailed breakdowns."
        },
        {
          q: "Are there free tiers available?",
          a: "Academic users get generous free quotas for research purposes. Commercial users have pay-as-you-go pricing."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "Which programming languages are supported?",
          a: "Python, R, JavaScript, and more through our comprehensive API and SDK support."
        },
        {
          q: "Can I use my own models?",
          a: "Yes, you can upload and deploy custom models using our model management system."
        },
        {
          q: "Is there API documentation?",
          a: "Comprehensive API docs are available in the Documentation section with code examples."
        }
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <h1 className="text-5xl font-bold text-text-primary">
          Help & <span className="text-primary">Support</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          We're Here to Help You Succeed
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Email Support</h3>
          <p className="text-text-secondary text-sm mb-4">Get help via email</p>
          <Button size="sm" className="btn-primary" onClick={() => window.location.href = 'mailto:support@sw4e.org'}>
            Email Us
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Book className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Documentation</h3>
          <p className="text-text-secondary text-sm mb-4">Browse our guides</p>
          <Button size="sm" variant="outline" onClick={() => window.location.href = '/documentation'}>
            View Docs
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Community</h3>
          <p className="text-text-secondary text-sm mb-4">Join the discussion</p>
          <Button size="sm" variant="outline" onClick={() => window.open('https://community.sw4e.org', '_blank')}>
            Join Forum
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">🎯 Frequently Asked Questions</h2>
        </div>
        
        {faqs.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">{category.category}</h3>
            <div className="space-y-3">
              {category.questions.map((faq, questionIndex) => {
                const faqId = categoryIndex * 100 + questionIndex;
                return (
                  <div key={questionIndex} className="border border-border rounded-lg">
                    <button
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-surface/50 transition-colors"
                      onClick={() => setOpenFAQ(openFAQ === faqId ? null : faqId)}
                    >
                      <span className="font-medium text-text-primary">{faq.q}</span>
                      {openFAQ === faqId ? (
                        <ChevronUp className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      )}
                    </button>
                    {openFAQ === faqId && (
                      <div className="p-4 pt-0 text-text-secondary text-sm">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-text-primary mb-4">📞 Contact Support</h2>
          <p className="text-text-secondary">Multiple ways to get the help you need</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <p className="font-medium text-text-primary">Email</p>
            <p className="text-text-secondary text-sm">support@sw4e.org</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <p className="font-medium text-text-primary">Response Time</p>
            <p className="text-text-secondary text-sm">24 hours</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <p className="font-medium text-text-primary">Hours</p>
            <p className="text-text-secondary text-sm">Mon-Fri, 9 AM - 6 PM CET</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <p className="font-medium text-text-primary">Emergency</p>
            <p className="text-text-secondary text-sm">Critical issues 24/7</p>
          </div>
        </div>

        {/* Community Links */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text-primary mb-4">💬 Community</h3>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/community/forum'}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Forum
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/community/discord'}>
              <Users className="w-4 h-4 mr-2" />
              Discord
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/community/newsletter'}>
              <Mail className="w-4 h-4 mr-2" />
              Newsletter
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/community/blog'}>
              <Globe className="w-4 h-4 mr-2" />
              Blog
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}



