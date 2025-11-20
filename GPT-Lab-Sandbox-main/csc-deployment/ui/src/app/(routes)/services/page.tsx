'use client';

import { useAuth } from '@/contexts/AuthContext';
import ServiceAccessControl from '@/components/ServiceAccessControl';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Settings,
  Crown,
  Building,
  UserCheck,
  FlaskConical
} from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleServiceClick = (serviceId: string) => {
    console.log(`Launching service: ${serviceId}`);
    
    // Route to appropriate service based on ID
    switch (serviceId) {
      case 'data-catalog':
        window.location.href = '/data-catalog';
        break;
      case 'experiment-management':
        window.location.href = '/experiments';
        break;
      case 'llm-management':
        window.location.href = '/llm';
        break;
      case 'ai-chatbot':
        window.location.href = '/llm-chatbot';
        break;
      case 'governance':
        window.location.href = '/governance';
        break;
      case 'user-management':
        window.location.href = '/governance';
        break;
      case 'organization-management':
        window.location.href = '/governance';
        break;
      case 'analytics':
        window.location.href = '/dashboard';
        break;
      case 'system-settings':
        window.location.href = '/admin';
        break;
      default:
        console.log(`Service ${serviceId} not implemented yet`);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'research_admin': return 'Research Administrator';
      case 'researcher': return 'Researcher';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-5 h-5" />;
      case 'research_admin': return <Building className="w-5 h-5" />;
      case 'researcher': return <FlaskConical className="w-5 h-5" />;
      case 'viewer': return <UserCheck className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-900 text-red-300';
      case 'research_admin': return 'bg-yellow-900 text-yellow-300';
      case 'researcher': return 'bg-green-900 text-green-300';
      case 'viewer': return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading services...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Unable to load user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">
            <span className="text-primary">GPT-Lab's Services</span>
            <br />
            <span className="text-text-primary">built for scale</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Access powerful research tools and services tailored to your role and subscription.
          </p>
        </div>
        
        {/* User Info */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
          <div className="text-slate-400">•</div>
          <div className="text-slate-400 text-sm">
            {user.subscription?.replace('_', ' ').toUpperCase()} Plan
          </div>
        </div>
      </div>

      {/* Service Access Control */}
      <ServiceAccessControl 
        userRole={user.role as any}
        userSubscription={user.subscription}
        onServiceClick={handleServiceClick}
      />

      {/* Additional Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need More Access?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Contact your administrator to request access to additional services or upgrade your subscription plan.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="btn-outline">
              Contact Admin
            </Button>
            <Button className="btn-primary">
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}