'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function AuthTestPage() {
  const { user, loading, login, logout } = useAuth();
  const [testEmail, setTestEmail] = useState('admin@sw4e.org');
  const [testPassword, setTestPassword] = useState('admin123');
  const [testResult, setTestResult] = useState('');

  const handleLogin = async () => {
    try {
      setTestResult('Testing login...');
      const success = await login(testEmail, testPassword);
      setTestResult(success ? 'Login successful!' : 'Login failed!');
    } catch (error) {
      setTestResult(`Login error: ${error}`);
    }
  };

  const handleLogout = () => {
    logout();
    setTestResult('Logged out');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Authentication Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Current State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'Not logged in'}</div>
              <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Test Login</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLogin} disabled={loading}>
                  Test Login
                </Button>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
              {testResult && (
                <div className="p-3 bg-surface rounded-lg text-sm text-text-primary">
                  {testResult}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Backend Status</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Backend URL:</strong> http://localhost:8080</div>
            <div><strong>Auth Endpoint:</strong> /api/auth/me</div>
            <div><strong>Login Endpoint:</strong> /api/auth/login</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
