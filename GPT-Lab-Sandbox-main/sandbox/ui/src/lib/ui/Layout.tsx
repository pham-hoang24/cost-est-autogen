"use client";
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { canAccessService, hasUIAccess, isSystemAdmin, isOrganizationAdmin, isProjectAdmin, isResearcher } from '@/lib/auth';
import DemoChatbot from '@/components/DemoChatbot';
import { RoleBasedSidebar } from '@/components/RoleBasedSidebar';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LayoutDashboard, Boxes, BookOpen, FlaskConical, Shield, Home, Blocks, Brain, Lock, Server, Settings, Users, UserPlus, BarChart3, CreditCard, LogIn, LogOut, Database, Building2, User, GraduationCap, FileText, Microscope, Menu, Handshake, FolderOpen } from 'lucide-react';

// Define navigation links with role-based access control
export const getNavigationLinks = (user: any, t: (key: string) => string) => {
  const links = [];
  
  // Add public navigation links
  if (!user) {
    // Non-authenticated users see marketing/public links
    links.push(
      { href: '/', label: t ? t('nav.home') : 'Home', icon: Home, requiresAuth: false, isPublic: true },
      { href: '/academic', label: t ? t('nav.academicHub') : 'Academic Hub', icon: GraduationCap, requiresAuth: false, isPublic: true },
      { href: '/company-onboarding', label: t ? t('nav.companyHub') : 'Company Hub', icon: Building2, requiresAuth: false, isPublic: true },
      { href: '/collaborations/discovery', label: t ? t('nav.collaborationHub') : 'Collaboration Hub', icon: UserPlus, requiresAuth: false, isPublic: true },
      { href: '/features', label: t ? t('nav.features') : 'Features', icon: Blocks, requiresAuth: false, isPublic: true },
      { href: '/pricing', label: t ? t('nav.pricing') : 'Pricing', icon: CreditCard, requiresAuth: false, isPublic: true },
      { href: '/faq', label: t ? t('nav.faq') : 'FAQs', icon: BookOpen, requiresAuth: false, isPublic: true }
    );
  } else {
    // Authenticated users see minimal public links (Dashboard replaces Home)
    // Help will be added at the end
  }

  // Add authenticated user links based on role
  if (user) {
    // PRIMARY NAVIGATION - Core daily tasks
    // Dashboard - Available to all authenticated users (except system admins)
    if (!isSystemAdmin(user)) {
      links.push({ href: '/dashboard', label: t ? t('nav.dashboard') : 'Dashboard', icon: LayoutDashboard, requiresAuth: true, isPublic: false });
    }

    // Student-specific links - Only show student services
    if (user.role === 'student') {
      links.push(
        { href: '/student-dashboard', label: 'My Learning', icon: GraduationCap, requiresAuth: true, isPublic: false },
        { href: '/assignments', label: 'Assignments', icon: FileText, requiresAuth: true, isPublic: false },
        { href: '/progress', label: 'My Progress', icon: BarChart3, requiresAuth: true, isPublic: false }
      );
    } else {
      // PRIMARY: Core Services - Available to all non-student users
      links.push(
        { href: '/projects', label: 'Projects', icon: FolderOpen, requiresAuth: true, isPublic: false },
        { href: '/ai-services', label: 'AI Services', icon: Brain, requiresAuth: true, isPublic: false },
        { href: '/hardware-requests', label: 'Hardware Requests', icon: Server, requiresAuth: true, isPublic: false }
      );

      // Data Management Hub - Available to all authenticated users
      links.push({ href: '/data-management', label: 'Data Management', icon: Database, requiresAuth: true, isPublic: false });

      // Data Catalog - Based on permissions
      if (hasUIAccess(user, 'data_catalog')) {
        links.push({ href: '/data-catalog', label: 'Data Catalog', icon: Database, requiresAuth: true, isPublic: false });
      }

      // Researcher-specific links
      if (isResearcher(user)) {
        links.push(
          { href: '/research-dashboard', label: 'Research Hub', icon: Microscope, requiresAuth: true, isPublic: false },
          { href: '/experiments', label: 'Experiments', icon: FlaskConical, requiresAuth: true, isPublic: false },
          { href: '/research-analytics', label: 'Research Analytics', icon: BarChart3, requiresAuth: true, isPublic: false }
        );
      }

      // Organization Admin links
      if (isOrganizationAdmin(user)) {
        links.push(
          { href: '/organization-dashboard', label: 'Organization', icon: Building2, requiresAuth: true, isPublic: false },
          { href: '/organization/members', label: 'Members', icon: Users, requiresAuth: true, isPublic: false },
          { href: '/organization/projects', label: 'Projects', icon: FolderOpen, requiresAuth: true, isPublic: false },
          { href: '/organization/analytics', label: 'Analytics', icon: BarChart3, requiresAuth: true, isPublic: false },
          { href: '/organization/billing', label: 'Billing', icon: CreditCard, requiresAuth: true, isPublic: false }
        );
      }

      // System Admin links - Dashboard first for system admins
      if (isSystemAdmin(user)) {
        // Insert Dashboard at the beginning for system admins
        links.unshift({ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true, isPublic: false });
      }

      // Collaboration Tools - Based on permissions
      if (hasUIAccess(user, 'collaboration_tools')) {
        links.push(
          { href: '/collaborations/active', label: 'My Collaborations', icon: Users, requiresAuth: true, isPublic: false },
          { href: '/collaborations/multi-party', label: 'Multi-Party Projects', icon: Handshake, requiresAuth: true, isPublic: false },
          { href: '/collaborations/analytics', label: 'Analytics Dashboard', icon: BarChart3, requiresAuth: true, isPublic: false }
        );
      }

      // Invitations - Based on permissions
      if (hasUIAccess(user, 'invitation_management')) {
        links.push({ href: '/invitations', label: 'Invitations', icon: UserPlus, requiresAuth: true, isPublic: false });
      }

      // Security Center - Based on permissions
      if (hasUIAccess(user, 'security_center')) {
        links.push({ href: '/security', label: 'Security Center', icon: Shield, requiresAuth: true, isPublic: false });
      }

      // FAQs
      links.push(
        { href: '/faq', label: 'FAQs', icon: BookOpen, requiresAuth: false, isPublic: true }
      );
    }
  }

  return links;
};

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'research_admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  

  // Get navigation links based on user role and permissions
  const visibleLinks = useMemo(() => {
    return getNavigationLinks(user, t).filter(link => {
      // For authenticated users, only show role-specific links
      if (user) {
        // Show public links that are appropriate for authenticated users
        if (link.isPublic) return true;
        // Show authenticated user links
        if (link.requiresAuth) return true;
        return false;
      }
      
      // For non-authenticated users, show all public links
      if (link.isPublic || !link.requiresAuth) return true;
      
      return false;
    });
  }, [user, t]);

  // Debug logging
  console.log('🔍 Layout - User state:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null, 
    loading, 
    isAdmin, 
    visibleLinksCount: visibleLinks.length,
    userRole: user?.role,
    userSubscription: user?.subscription,
    visibleLinkLabels: visibleLinks.map(l => l.label)
  });

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr] bg-background">
      <header className="backdrop-blur bg-surface/80 sticky top-0 border-b border-border z-50">
        <div className="max-w-7xl mx-auto p-4">
          {/* Main header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-lg">S</span>
                </div>
                <div className="text-left">
                  <div className="text-text-primary font-semibold">GPT-Lab’s Sandbox</div>
                  <div className="text-text-muted text-xs">Multi-tenant platform</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <LanguageSelector />
              
              {loading ? (
                <div className="text-text-muted text-sm">{t('common.loading')}</div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant={isAdmin ? 'accent' : 'muted'}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-text-muted text-sm hidden md:block">{user.email}</div>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors duration-200"
                  >
                    <LogOut size={16} /> <span className="hidden sm:inline">{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors duration-200"
                  >
                    <LogIn size={16} /> <span className="hidden sm:inline">{t('nav.login')}</span>
                  </a>
                  <a
                    href="/register"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-background hover:bg-primary-500 transition-colors duration-200"
                  >
                    <UserPlus size={16} /> <span className="hidden sm:inline">{t('nav.register')}</span>
                  </a>
                </>
              )}
            </div>
          </div>
          
          {/* Navigation row - Simple and clean */}
          <nav className="flex gap-2 text-sm overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-primary bg-primary/10 border border-primary/20' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>

      {/* Sidebar */}
      <RoleBasedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Demo Chatbot - Available on all pages */}
      <DemoChatbot position="bottom-right" theme="light" />
    </div>
  );
}


