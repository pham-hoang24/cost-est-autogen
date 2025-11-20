'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function DebugAuthContext() {
  const { user, loading, token } = useAuth();
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

  useEffect(() => {
    setLocalStorageToken(localStorage.getItem('token'));
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug AuthContext</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> {loading ? 'true' : 'false'}
            </div>
            <div>
              <strong>Token (from context):</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {token || 'null'}
              </pre>
            </div>
            <div>
              <strong>User:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-4">
            <div>
              <strong>Token (from localStorage):</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {localStorageToken || 'null'}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={() => {
                const testToken = 'eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQHN3NGUub3JnIiwicm9sZSI6InN1cGVyX2FkbWluIiwiZXhwIjoxNzU4NjYzOTI5MzU3fQ==';
                localStorage.setItem('token', testToken);
                setLocalStorageToken(testToken);
                window.location.reload();
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Set Test Token & Reload
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                setLocalStorageToken(null);
                window.location.reload();
              }}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Clear Token & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
