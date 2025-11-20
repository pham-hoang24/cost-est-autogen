'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getNavigationLinks } from '@/lib/ui/Layout';
import { Card } from '@/components/Card';

export default function NavDebugPage() {
  const { user, loading } = useAuth();
  
  const allLinks = getNavigationLinks(user);
  const visibleLinks = allLinks.filter(link => {
    // if (link.hideWhenAuthenticated && user) return false;
    
    if (user) {
      if (link.isPublic) return true;
      if (link.requiresAuth) return true;
      return false;
    }
    
    if (link.isPublic || !link.requiresAuth) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Navigation Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">User State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'Not logged in'}</div>
              <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Navigation Counts</h2>
            <div className="space-y-2 text-sm">
              <div><strong>All Links:</strong> {allLinks.length}</div>
              <div><strong>Visible Links:</strong> {visibleLinks.length}</div>
              <div><strong>Public Links:</strong> {allLinks.filter(l => l.isPublic).length}</div>
              <div><strong>Auth Links:</strong> {allLinks.filter(l => l.requiresAuth).length}</div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">All Navigation Links</h2>
          <div className="space-y-2">
            {allLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-4 p-2 bg-surface/50 rounded">
                <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
                  <link.icon className="w-3 h-3 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{link.label}</div>
                  <div className="text-sm text-text-secondary">{link.href}</div>
                </div>
                <div className="flex gap-2">
                  {link.isPublic && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Public</span>}
                  {link.requiresAuth && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Auth</span>}
                  {/* {link.hideWhenAuthenticated && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Hide When Auth</span>} */}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Visible Navigation Links</h2>
          <div className="space-y-2">
            {visibleLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-4 p-2 bg-green-50 border border-green-200 rounded">
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                  <link.icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{link.label}</div>
                  <div className="text-sm text-text-secondary">{link.href}</div>
                </div>
                <div className="flex gap-2">
                  {link.isPublic && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Public</span>}
                  {link.requiresAuth && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Auth</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
