"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { 
  Home,
  Brain,
  Database,
  Globe,
  GraduationCap,
  Building2,
  FileText,
  Shield,
  BarChart3,
  UserCheck
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
}

// Role-based navigation items
const getNavigationItems = (user: any): SidebarItem[] => {
  const items: SidebarItem[] = [
    { href: '/', label: 'Home', icon: Home, description: 'Dashboard and overview' }
  ];

  // AI Services - Available to researchers and above
  if (hasUIAccess(user, 'ai_services')) {
    items.push({ href: '/ai-services', label: 'AI Services', icon: Brain, description: 'AI models and tools' });
  }

  // Data Catalog - Available to researchers and above
  if (hasUIAccess(user, 'data_catalog')) {
    items.push({ href: '/data-catalog', label: 'Data Catalog', icon: Database, description: 'Datasets and data sources' });
  }

  // Collaboration Tools - Available to project admins and above
  if (hasUIAccess(user, 'collaboration_tools')) {
    items.push({ href: '/collaborations', label: 'Collaborations', icon: Globe, description: 'Project collaboration and management' });
  }

  // Academic Resources - Available to students and researchers
  if (hasUIAccess(user, 'educational_resources')) {
    items.push({ href: '/academic', label: 'Academic Hub', icon: GraduationCap, description: 'Academic resources and tools' });
  }

  // Organization Management - Available to organization admins
  if (hasUIAccess(user, 'organization_dashboard')) {
    items.push({ href: '/organization', label: 'Organization', icon: Building2, description: 'Organization management' });
  }

  // Project Management - Available to project admins
  if (hasUIAccess(user, 'project_dashboard')) {
    items.push({ href: '/projects', label: 'Projects', icon: FileText, description: 'Project management' });
  }

  // Admin Console - Available to system admins
  if (hasUIAccess(user, 'admin_console')) {
    items.push({ href: '/admin', label: 'Admin Console', icon: Shield, description: 'System administration' });
  }

  // Analytics - Available to admins
  if (hasUIAccess(user, 'global_analytics')) {
    items.push({ href: '/analytics', label: 'Analytics', icon: BarChart3, description: 'System and project analytics' });
  }

  return items;
};

interface RoleBasedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleBasedSidebar({ isOpen, onClose }: RoleBasedSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || !isOpen) {
    return null;
  }

  const navigationItems = getNavigationItems(user);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">GPT-Lab’s Sandbox</h2>
              <p className="text-sm text-gray-500">Research Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Role Information */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            {navigationItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={onClose}
                >
                  <ItemIcon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.label}</div>
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

          {/* Quick Actions */}
          <div className="mt-6 px-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Quick Actions
            </div>
            <div className="space-y-1">
              {isSystemAdmin(user) && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={onClose}
                >
                  <BarChart3 className="w-4 h-4" />
                  System Dashboard
                </Link>
              )}
              
              {isOrganizationAdmin(user) && (
                <Link
                  href="/organization/members"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={onClose}
                >
                  <UserCheck className="w-4 h-4" />
                  Manage Members
                </Link>
              )}
              
              {isProjectAdmin(user) && (
                <Link
                  href="/collaborations/create"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={onClose}
                >
                  <FileText className="w-4 h-4" />
                  Create Project
                </Link>
              )}
              
              {isResearcher(user) && (
                <Link
                  href="/ai-services"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={onClose}
                >
                  <Brain className="w-4 h-4" />
                  Start Experiment
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
