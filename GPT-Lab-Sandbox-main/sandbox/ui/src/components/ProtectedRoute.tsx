'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Shield, Lock, CreditCard, Crown } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredSubscription?: 'basic' | 'professional' | 'enterprise';
  requiredRole?: 'super_admin' | 'research_admin' | 'researcher' | 'viewer';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredSubscription,
  requiredRole,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        router.push(fallbackPath);
        return;
      }

      // Check subscription requirements
      if (requiredSubscription && user) {
        const subscriptionTiers = {
          'free': 0,
          'basic': 1,
          'professional': 2,
          'enterprise': 3
        };
        
        const userTier = subscriptionTiers[user.subscription_tier as keyof typeof subscriptionTiers] || 0;
        const requiredTier = subscriptionTiers[requiredSubscription];
        
        if (userTier < requiredTier) {
          setShowUpgrade(true);
          return;
        }
      }

      // Check role requirements
      if (requiredRole && user) {
        const roleHierarchy = {
          'viewer': 1,
          'researcher': 2,
          'research_admin': 3,
          'super_admin': 4
        };
        
        const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
        const requiredLevel = roleHierarchy[requiredRole];
        
        if (userLevel < requiredLevel) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, loading, requireAuth, requiredSubscription, requiredRole, router, fallbackPath]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Subscription upgrade required
  if (showUpgrade && requiredSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            {requiredSubscription === 'enterprise' ? (
              <Crown className="w-8 h-8 text-primary" />
            ) : requiredSubscription === 'professional' ? (
              <Shield className="w-8 h-8 text-primary" />
            ) : (
              <CreditCard className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Upgrade Required
          </h2>
          
          <p className="text-text-secondary mb-6">
            This feature requires a <span className="font-semibold text-primary capitalize">{requiredSubscription}</span> subscription or higher.
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full btn-primary"
              onClick={() => router.push('/billing?upgrade=' + requiredSubscription)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade to {requiredSubscription.charAt(0).toUpperCase() + requiredSubscription.slice(1)}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-surface rounded-lg">
            <p className="text-sm text-text-secondary">
              <strong>Your current plan:</strong> {user?.subscription_tier || 'Free'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Authentication required but user not logged in
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Authentication Required
          </h2>
          
          <p className="text-text-secondary mb-6">
            Please sign in to access this page.
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full btn-primary"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}

// Convenience wrapper components
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={true}>{children}</ProtectedRoute>;
}

export function RequireProfessional({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredSubscription="professional">
      {children}
    </ProtectedRoute>
  );
}

export function RequireEnterprise({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredSubscription="enterprise">
      {children}
    </ProtectedRoute>
  );
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="research_admin">
      {children}
    </ProtectedRoute>
  );
}

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="super_admin">
      {children}
    </ProtectedRoute>
  );
}