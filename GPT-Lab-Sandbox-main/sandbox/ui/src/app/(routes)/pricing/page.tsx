'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { getServicesForTier, serviceCategories } from '@/lib/serviceConfig';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Check, 
  Crown, 
  Shield, 
  Zap, 
  Users, 
  Database, 
  Brain, 
  Globe, 
  Lock,
  Star,
  ArrowRight,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Starter',
      description: 'Essential research collaboration for individual researchers',
      icon: Zap,
      color: 'blue',
      price: { monthly: 'Contact Sales', annual: 'Custom Quote' },
      popular: false,
      services: getServicesForTier('basic').filter(s => s.category === 'core' || s.category === 'collaboration'),
      features: [
        'Research project management',
        'Secure team collaboration',
        'EU-compliant data storage',
        'Basic document management',
        'GDPR compliance tools',
        'Email support',
        'Community access'
      ],
      limitations: [
        'EU-only data processing',
        'No AI model access',
        'Standard support response'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced AI and analytics for research institutions',
      icon: Shield,
      color: 'primary',
      price: { monthly: 'Contact Sales', annual: 'Custom Quote' },
      popular: true,
      services: getServicesForTier('professional').filter(s => s.category === 'ai' || s.category === 'data'),
      features: [
        'AI model development platform',
        'Advanced data catalog & discovery',
        'Cross-border data processing',
        'EU AI Act compliance suite',
        'Advanced analytics & reporting',
        'Priority support (24h response)',
        'API integrations & webhooks',
        'Multi-jurisdiction compliance',
        'Advanced security features',
        'Custom workflow automation'
      ],
      limitations: [
        'Standard compliance frameworks',
        'Shared infrastructure'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete custom solution for large institutions',
      icon: Crown,
      color: 'purple',
      price: { monthly: 'Custom Quote', annual: 'Enterprise Agreement' },
      popular: false,
      services: getServicesForTier('enterprise'),
      features: [
        'Custom AI infrastructure deployment',
        'Tailored compliance frameworks',
        'Enterprise system integration',
        'Dedicated account management',
        'White-label platform options',
        'On-premises deployment',
        'Global data processing',
        'Custom legal agreement templates',
        'Priority engineering support',
        'Custom feature development',
        'Regulatory consultation services',
        'Advanced security configurations'
      ],
      limitations: []
    }
  ];

  const handleSelectPlan = (planId: string) => {
    router.push(`/register?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              EU AI Act Compliant Platform
            </div>
            <h1 className="text-5xl font-bold text-text-primary mb-6">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              {t('pricing.subtitle')}
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'annual' ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'annual' ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                {t('pricing.annually')}
              </span>
              {billingCycle === 'annual' && (
                <Badge variant="green" className="ml-2">Save 17%</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const price = plan.price[billingCycle];
            // No savings calculation for contact-based pricing
            
            return (
              <Card 
                key={plan.id} 
                className={`relative p-8 ${plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : 'hover:shadow-glow'} transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary" className="px-4 py-1 text-sm font-medium">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    plan.color === 'blue' ? 'bg-blue-500/20' :
                    plan.color === 'primary' ? 'bg-primary/20' :
                    'bg-purple-500/20'
                  }`}>
                    <IconComponent className={`w-8 h-8 ${
                      plan.color === 'blue' ? 'text-blue-500' :
                      plan.color === 'primary' ? 'text-primary' :
                      'text-purple-500'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                  <p className="text-text-secondary mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-text-primary">{price}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {plan.id === 'basic' ? 'Free trial available' :
                       plan.id === 'professional' ? 'Custom institutional pricing' :
                       'Enterprise licensing available'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-medium text-text-primary">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <h5 className="text-sm font-medium text-text-secondary mb-2">Limitations:</h5>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-text-muted">• {limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button 
                  className={`w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular ? (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>
                
                {plan.id === 'basic' && (
                  <p className="text-xs text-center text-text-muted mt-3">
                    14-day free trial • No credit card required
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Enterprise Contact */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-purple-500/5 to-primary/5">
            <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-text-primary mb-4">Need Something Custom?</h3>
            <p className="text-text-secondary mb-6">
              For large institutions, government agencies, or custom requirements, 
              we offer tailored solutions with dedicated support and custom compliance frameworks.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
              <Button className="btn-primary">
                <Shield className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>

        {/* Compliance Badges */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Trusted & Compliant</h3>
            <p className="text-text-secondary">All plans include comprehensive compliance with European regulations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="font-medium text-text-primary">GDPR Compliant</h4>
              <p className="text-sm text-text-secondary">Full data protection compliance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
              <h4 className="font-medium text-text-primary">EU AI Act</h4>
              <p className="text-sm text-text-secondary">AI system compliance built-in</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="font-medium text-text-primary">ISO 27001</h4>
              <p className="text-sm text-text-secondary">Information security certified</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-orange-500" />
              </div>
              <h4 className="font-medium text-text-primary">SOC 2 Type II</h4>
              <p className="text-sm text-text-secondary">Security controls verified</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Frequently Asked Questions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-text-primary mb-2">Can I change plans later?</h4>
              <p className="text-text-secondary text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with pro-rated billing.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">Is my data secure?</h4>
              <p className="text-text-secondary text-sm">Absolutely. We use enterprise-grade encryption, comply with GDPR and EU AI Act, and undergo regular security audits.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">Do you offer academic discounts?</h4>
              <p className="text-text-secondary text-sm">Yes! Educational institutions receive up to 50% discount on Professional and Enterprise plans. Contact us for details.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">What about GDPR compliance?</h4>
              <p className="text-text-secondary text-sm">All plans include full GDPR compliance, data subject rights management, and automated compliance reporting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
