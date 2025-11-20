'use client';

import { useState, useEffect } from 'react';

export default function SimpleAuthTest() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test authentication directly
    const testAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test login
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@sw4e.org',
            password: 'admin123'
          })
        });

        if (!loginResponse.ok) {
          throw new Error('Login failed');
        }

        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData);

        // Test /api/auth/me
        const meResponse = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!meResponse.ok) {
          throw new Error('Me endpoint failed');
        }

        const meData = await meResponse.json();
        console.log('Me endpoint successful:', meData);
        
        setUser(meData.user);
        setLoading(false);
      } catch (err) {
        console.error('Auth test error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    testAuth();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Authentication Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> {loading ? 'true' : 'false'}
            </div>
            
            {error && (
              <div className="text-red-600">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div>
              <strong>User:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
