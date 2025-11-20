'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  Database, 
  FlaskConical, 
  Brain, 
  Shield, 
  Settings,
  Lock,
  Crown,
  Building,
  UserCheck,
  Zap,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredRole: string[];
  requiredSubscription?: string[];
  isPremium?: boolean;
  isAdminOnly?: boolean;
}

interface ServiceAccessControlProps {
  userRole: 'super_admin' | 'research_admin' | 'researcher' | 'viewer';
  userSubscription?: string;
  onServiceClick: (serviceId: string) => void;
}

const services: Service[] = [
  {
    id: 'data-catalog',
    name: 'Data Catalog',
    description: 'Browse and manage research datasets',
    icon: <Database className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin', 'researcher', 'viewer'],
    requiredSubscription: ['individual', 'research_team', 'enterprise']
  },
  {
    id: 'experiment-management',
    name: 'Experiment Management',
    description: 'Create and manage ML experiments',
    icon: <FlaskConical className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin', 'researcher'],
    requiredSubscription: ['research_team', 'enterprise']
  },
  {
    id: 'llm-management',
    name: 'LLM Model Management',
    description: 'Deploy and manage AI models',
    icon: <Brain className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin', 'researcher'],
    requiredSubscription: ['research_team', 'enterprise'],
    isPremium: true
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot Assistant',
    description: 'Interactive AI assistant for research',
    icon: <Zap className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin', 'researcher', 'viewer'],
    requiredSubscription: ['individual', 'research_team', 'enterprise']
  },
  {
    id: 'governance',
    name: 'Governance',
    description: 'User and organization management',
    icon: <Shield className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin'],
    isAdminOnly: true
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage team members and permissions',
    icon: <UserCheck className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin'],
    isAdminOnly: true
  },
  {
    id: 'organization-management',
    name: 'Organization Management',
    description: 'Manage organization settings and resources',
    icon: <Building className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin'],
    isAdminOnly: true
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'View usage and performance metrics',
    icon: <BarChart3 className="w-6 h-6" />,
    requiredRole: ['super_admin', 'research_admin', 'researcher'],
    requiredSubscription: ['research_team', 'enterprise']
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    description: 'Configure platform settings',
    icon: <Settings className="w-6 h-6" />,
    requiredRole: ['super_admin'],
    isAdminOnly: true
  }
];

export default function ServiceAccessControl({ 
  userRole, 
  userSubscription = 'individual',
  onServiceClick 
}: ServiceAccessControlProps) {
  
  const canAccessService = (service: Service): boolean => {
    // Check role requirement
    if (!service.requiredRole.includes(userRole)) {
      return false;
    }
    
    // Check subscription requirement
    if (service.requiredSubscription && !service.requiredSubscription.includes(userSubscription)) {
      return false;
    }
    
    return true;
  };

  const getServiceStatus = (service: Service) => {
    if (!canAccessService(service)) {
      if (service.isAdminOnly) {
        return { status: 'admin-only', message: 'Admin access required' };
      }
      if (service.isPremium) {
        return { status: 'premium', message: 'Premium subscription required' };
      }
      return { status: 'restricted', message: 'Access not available' };
    }
    return { status: 'available', message: 'Available' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'premium':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin-only':
        return <Lock className="w-4 h-4 text-red-500" />;
      case 'restricted':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-green-500/20 hover:border-green-500/40';
      case 'premium':
        return 'border-yellow-500/20 hover:border-yellow-500/40';
      case 'admin-only':
        return 'border-red-500/20 hover:border-red-500/40';
      case 'restricted':
        return 'border-gray-500/20 hover:border-gray-500/40';
      default:
        return 'border-gray-500/20 hover:border-gray-500/40';
    }
  };

  const availableServices = services.filter(service => canAccessService(service));
  const restrictedServices = services.filter(service => !canAccessService(service));

  return (
    <div className="space-y-8">
      {/* Available Services */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableServices.map((service) => {
            const { status, message } = getServiceStatus(service);
            return (
              <Card 
                key={service.id}
                className={`p-6 hover:shadow-glow transition-all duration-300 ${getStatusColor(status)} cursor-pointer`}
                onClick={() => onServiceClick(service.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      {getStatusIcon(status)}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-xs font-medium">{message}</span>
                      <Button 
                        size="sm" 
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onServiceClick(service.id);
                        }}
                      >
                        Launch
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Restricted Services */}
      {restrictedServices.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restrictedServices.map((service) => {
              const { status, message } = getServiceStatus(service);
              return (
                <Card 
                  key={service.id}
                  className={`p-6 transition-all duration-300 ${getStatusColor(status)} opacity-75`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-300">{service.name}</h3>
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-slate-500 text-sm mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-medium">{message}</span>
                        <Button 
                          size="sm" 
                          className="btn-outline opacity-50 cursor-not-allowed"
                          disabled
                        >
                          {service.isPremium ? 'Upgrade' : 'Locked'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {userRole === 'researcher' && userSubscription === 'individual' && (
        <Card className="p-6 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
          <div className="flex items-center gap-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Upgrade to Research Team Plan</h3>
              <p className="text-slate-300 text-sm">
                Unlock advanced features, team collaboration, and premium services for your research organization.
              </p>
            </div>
            <Button className="btn-primary">
              Upgrade Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
