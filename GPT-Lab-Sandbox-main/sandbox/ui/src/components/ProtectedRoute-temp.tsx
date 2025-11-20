'use client';

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredSubscription?: 'basic' | 'professional' | 'enterprise';
  requiredRole?: 'super_admin' | 'research_admin' | 'researcher' | 'viewer';
  fallbackPath?: string;
}

// Temporary ProtectedRoute that allows all access for testing
export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredSubscription,
  requiredRole,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  // For now, just render children without any protection
  // This allows us to test the services without authentication issues
  return <>{children}</>;
}
