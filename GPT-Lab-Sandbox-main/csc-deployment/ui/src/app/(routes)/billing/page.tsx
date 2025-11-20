'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Crown,
  Building,
  User,
  Users,
  Zap,
  Shield,
  Database,
  Brain,
  Settings,
  Calendar,
  HardDrive,
  Download,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    users: number;
    projects: number;
    storage: string;
    support: string;
  };
  popular?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Usage {
  users: number;
  projects: number;
  storage: number;
  apiCalls: number;
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (user && !authLoading) {
      fetchBillingData();
    }
  }, [user, authLoading, billingInterval]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Mock billing plans
      const mockPlans: BillingPlan[] = [
        {
          id: 'individual',
          name: 'Individual',
          description: 'Perfect for individual researchers and small projects',
          price: billingInterval === 'monthly' ? 29 : 290,
          interval: billingInterval,
          features: [
            'Basic data access',
            'Limited AI tools',
            'Personal projects',
            'Community support',
            '5GB storage',
            '100 API calls/month'
          ],
          limits: {
            users: 1,
            projects: 5,
            storage: '5GB',
            support: 'Community'
          }
        },
        {
          id: 'research_team',
          name: 'Research Team',
          description: 'Ideal for research teams and academic institutions',
          price: billingInterval === 'monthly' ? 99 : 990,
          interval: billingInterval,
          features: [
            'Full data access',
            'Advanced AI tools',
            'Team collaboration',
            'Experiment management',
            'Priority support',
            '100GB storage',
            '10,000 API calls/month',
            'Custom integrations'
          ],
          limits: {
            users: 10,
            projects: 50,
            storage: '100GB',
            support: 'Priority'
          },
          popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'Complete solution for large organizations',
          price: billingInterval === 'monthly' ? 299 : 2990,
          interval: billingInterval,
          features: [
            'Unlimited access',
            'All AI tools',
            'Organization management',
            'Custom integrations',
            'Dedicated support',
            'Unlimited storage',
            'Unlimited API calls',
            'SLA guarantee',
            'Custom training'
          ],
          limits: {
            users: -1, // Unlimited
            projects: -1, // Unlimited
            storage: 'Unlimited',
            support: 'Dedicated'
          }
        }
      ];

      // Mock subscription data
      const mockSubscription: Subscription = {
        id: 'sub_123456789',
        planId: 'research_team',
        status: 'active',
        currentPeriodStart: '2024-01-01',
        currentPeriodEnd: '2024-02-01',
        cancelAtPeriodEnd: false
      };

      // Mock usage data
      const mockUsage: Usage = {
        users: 7,
        projects: 23,
        storage: 45, // GB
        apiCalls: 7500
      };

      setPlans(mockPlans);
      setSubscription(mockSubscription);
      setUsage(mockUsage);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      console.log(`Upgrading to plan: ${planId}`);
      // In production, this would call the billing API
      alert(`Upgrading to ${planId} plan...`);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const handleCancel = async () => {
    try {
      console.log('Cancelling subscription...');
      // In production, this would call the billing API
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Please log in to view billing information</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans.find(plan => plan.id === subscription?.planId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-slate-400">Manage your subscription and billing settings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-green-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-green-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>
          <Button onClick={fetchBillingData} className="btn-outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Subscription */}
      {subscription && currentPlan && (
        <Card className="p-6 bg-gradient-to-r from-green-900/20 to-green-800/10 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Current Plan</h3>
              <p className="text-green-400 text-2xl font-bold">{currentPlan.name}</p>
              <p className="text-slate-400 text-sm">
                ${currentPlan.price}/{currentPlan.interval === 'monthly' ? 'month' : 'year'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-sm">Next billing date</div>
              <div className="text-white font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
              <div className="text-green-400 text-sm">
                {subscription.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Overview */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Users</p>
                <p className="text-2xl font-bold text-white">{usage.users}</p>
                <p className="text-slate-500 text-xs">
                  {currentPlan?.limits.users === -1 ? 'Unlimited' : `of ${currentPlan?.limits.users}`}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Projects</p>
                <p className="text-2xl font-bold text-white">{usage.projects}</p>
                <p className="text-slate-500 text-xs">
                  {currentPlan?.limits.projects === -1 ? 'Unlimited' : `of ${currentPlan?.limits.projects}`}
                </p>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Storage</p>
                <p className="text-2xl font-bold text-white">{usage.storage}GB</p>
                <p className="text-slate-500 text-xs">
                  {currentPlan?.limits.storage === 'Unlimited' ? 'Unlimited' : `of ${currentPlan?.limits.storage}`}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">API Calls</p>
                <p className="text-2xl font-bold text-white">{usage.apiCalls.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">this month</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`p-6 relative ${
                plan.popular 
                  ? 'border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10' 
                  : 'border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="text-3xl font-bold text-white">
                  ${plan.price}
                  <span className="text-slate-400 text-lg">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                className={`w-full ${
                  plan.id === subscription?.planId
                    ? 'btn-outline cursor-not-allowed'
                    : plan.popular
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
                disabled={plan.id === subscription?.planId}
              >
                {plan.id === subscription?.planId ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Research Team Plan</div>
                <div className="text-slate-400 text-sm">January 1, 2024</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">$99.00</div>
              <div className="text-green-400 text-sm">Paid</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Research Team Plan</div>
                <div className="text-slate-400 text-sm">December 1, 2023</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">$99.00</div>
              <div className="text-green-400 text-sm">Paid</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
        <div className="flex items-center gap-4">
          <Button className="btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
          <Button className="btn-outline">
            <CreditCard className="w-4 h-4 mr-2" />
            Update Payment Method
          </Button>
          <Button 
            onClick={handleCancel}
            className="btn-outline text-red-400 border-red-500/20 hover:border-red-500/40"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel Subscription
          </Button>
        </div>
      </Card>
    </div>
  );
}
