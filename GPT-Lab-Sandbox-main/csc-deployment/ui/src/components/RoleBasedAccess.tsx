'use client';

import { useAuth } from '@/contexts/AuthContext';
import { 
  hasPermission, 
  hasUIAccess, 
  checkSubscriptionAccess,
  isSystemAdmin,
  isOrganizationAdmin,
  isProjectAdmin,
  isResearcher
} from '@/lib/auth';
import { ReactNode } from 'react';

interface RoleBasedAccessProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPermission?: string;
  requiredUIAccess?: string;
  requiredRoleType?: string;
  requiredRoles?: string[];
  requiredSubscription?: string;
  requireSystemAdmin?: boolean;
  requireOrganizationAdmin?: boolean;
  requireProjectAdmin?: boolean;
  requireResearcher?: boolean;
  organizationId?: string;
  projectId?: string;
}

export default function RoleBasedAccess({
  children,
  fallback = null,
  requiredPermission,
  requiredUIAccess,
  requiredRoleType,
  requiredRoles,
  requiredSubscription,
  requireSystemAdmin = false,
  requireOrganizationAdmin = false,
  requireProjectAdmin = false,
  requireResearcher = false,
  organizationId,
  projectId
}: RoleBasedAccessProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check specific role requirements
  if (requireSystemAdmin && !isSystemAdmin(user)) {
    return <>{fallback}</>;
  }

  if (requireOrganizationAdmin && !isOrganizationAdmin(user)) {
    return <>{fallback}</>;
  }

  if (requireProjectAdmin && !isProjectAdmin(user)) {
    return <>{fallback}</>;
  }

  if (requireResearcher && !isResearcher(user)) {
    return <>{fallback}</>;
  }

  // Check role type
  if (requiredRoleType && user.roleType !== requiredRoleType) {
    return <>{fallback}</>;
  }

  // Check specific roles
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Check permission
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check UI access
  if (requiredUIAccess && !hasUIAccess(user, requiredUIAccess)) {
    return <>{fallback}</>;
  }

  // Check subscription
  if (requiredSubscription && !checkSubscriptionAccess(user, requiredSubscription)) {
    return <>{fallback}</>;
  }

  // Check organization access
  if (organizationId && user.organization_id !== organizationId && !isSystemAdmin(user)) {
    return <>{fallback}</>;
  }

  // Check project access (this would need to be implemented with project membership check)
  if (projectId && !isSystemAdmin(user)) {
    // For now, allow all authenticated users to access projects
    // In a real implementation, you'd check project membership
  }

  return <>{children}</>;
}

// Convenience components for common access patterns
export function SystemAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requireSystemAdmin={true} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function OrganizationAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requireOrganizationAdmin={true} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function ProjectAdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requireProjectAdmin={true} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function ResearcherOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requireResearcher={true} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function PermissionRequired({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string; 
  children: ReactNode; 
  fallback?: ReactNode 
}) {
  return (
    <RoleBasedAccess requiredPermission={permission} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function UIAccessRequired({ 
  uiAccess, 
  children, 
  fallback = null 
}: { 
  uiAccess: string; 
  children: ReactNode; 
  fallback?: ReactNode 
}) {
  return (
    <RoleBasedAccess requiredUIAccess={uiAccess} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function SubscriptionRequired({ 
  subscription, 
  children, 
  fallback = null 
}: { 
  subscription: string; 
  children: ReactNode; 
  fallback?: ReactNode 
}) {
  return (
    <RoleBasedAccess requiredSubscription={subscription} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}
