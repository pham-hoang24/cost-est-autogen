'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  hasUIAccess, 
  isSystemAdmin, 
  isOrganizationAdmin, 
  isProjectAdmin, 
  isResearcher,
  getRoleDisplayName,
  getRoleTypeDisplayName 
} from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Building2, 
  FolderOpen, 
  Brain, 
  Database, 
  Settings, 
  BarChart3,
  Shield,
  GraduationCap,
  UserCheck,
  Globe
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  requiredPermission?: string;
  requiredUIAccess?: string;
  requiredRoleType?: string;
  subscriptionRequired?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    description: 'Dashboard and overview'
  },
  {
    name: 'AI Services',
    href: '/ai-services',
    icon: Brain,
    description: 'AI tools and services',
    requiredUIAccess: 'ai_services'
  },
  {
    name: 'Data Catalog',
    href: '/data-catalog',
    icon: Database,
    description: 'Data management and catalog',
    requiredUIAccess: 'data_catalog'
  },
  {
    name: 'Collaborations',
    href: '/collaborations',
    icon: Globe,
    description: 'Project collaboration and management',
    requiredUIAccess: 'collaboration_tools'
  },
  {
    name: 'Academic Hub',
    href: '/academic',
    icon: GraduationCap,
    description: 'Academic resources and tools',
    requiredUIAccess: 'educational_resources'
  },
  {
    name: 'Admin Console',
    href: '/admin',
    icon: Shield,
    description: 'System administration',
    requiredUIAccess: 'admin_console',
    requiredRoleType: 'system'
  },
  {
    name: 'Organization',
    href: '/organization',
    icon: Building2,
    description: 'Organization management',
    requiredUIAccess: 'organization_dashboard',
    requiredRoleType: 'organization'
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Project management',
    requiredUIAccess: 'project_dashboard',
    requiredRoleType: 'project'
  },
  {
    name: 'Research',
    href: '/research',
    icon: Brain,
    description: 'Research tools and experiments',
    requiredUIAccess: 'research_dashboard',
    requiredRoleType: 'research'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'System and project analytics',
    requiredUIAccess: 'global_analytics'
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'User administration',
    requiredUIAccess: 'user_management',
    requiredRoleType: 'system'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System and user settings',
    requiredUIAccess: 'system_settings'
  }
];

export default function RoleBasedNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const canAccessItem = (item: NavigationItem): boolean => {
    // Check UI access
    if (item.requiredUIAccess && !hasUIAccess(user, item.requiredUIAccess)) {
      return false;
    }

    // Check role type
    if (item.requiredRoleType && user.roleType !== item.requiredRoleType) {
      return false;
    }

    // Check subscription
    if (item.subscriptionRequired && user.subscription_tier !== item.subscriptionRequired) {
      return false;
    }

    return true;
  };

  const getVisibleItems = (): NavigationItem[] => {
    return navigationItems.filter(canAccessItem);
  };

  const visibleItems = getVisibleItems();

  return (
    <nav className="space-y-2">
      {/* User Role Information */}
      <div className="px-3 py-2 bg-gray-50 rounded-lg mb-4">
        <div className="text-sm font-medium text-gray-900">
          {getRoleDisplayName(user.role)}
        </div>
        <div className="text-xs text-gray-500">
          {getRoleTypeDisplayName(user.roleType || '')} • {user.subscription_tier || 'basic'}
        </div>
        {user.organization && (
          <div className="text-xs text-gray-500 mt-1">
            {user.organization}
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <div>
                <div>{item.name}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Role-based Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Quick Actions
        </div>
        <div className="space-y-1">
          {isSystemAdmin(user) && (
            <Link
              href="/admin/dashboard"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              System Dashboard
            </Link>
          )}
          
          {isOrganizationAdmin(user) && (
            <Link
              href="/organization/members"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <UserCheck className="mr-3 h-4 w-4" />
              Manage Members
            </Link>
          )}
          
          {isProjectAdmin(user) && (
            <Link
              href="/collaborations/create"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <FolderOpen className="mr-3 h-4 w-4" />
              Create Project
            </Link>
          )}
          
          {isResearcher(user) && (
            <Link
              href="/ai-services"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Brain className="mr-3 h-4 w-4" />
              Start Experiment
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
