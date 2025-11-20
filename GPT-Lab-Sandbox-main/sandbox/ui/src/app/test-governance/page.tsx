'use client';

import { useState } from 'react';

export default function TestGovernancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting API test...');
      const response = await fetch('/api/simple-governance/dashboard');
      console.log('🔍 Response received:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🔍 Data received:', result);
      setData(result);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Test Page</h1>
        
        <div className="mb-8">
          <button 
            onClick={testAPI}
            disabled={loading}
            className="bg-green-500 text-black px-6 py-3 rounded hover:bg-green-600 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Testing...' : 'Test API Call'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && (
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">API Response:</h2>
            <pre className="bg-slate-900 p-4 rounded text-green-400 overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions:</h2>
          <ol className="text-slate-300 space-y-2">
            <li>1. Click "Test API Call" button</li>
            <li>2. Open browser console (F12) to see logs</li>
            <li>3. Check if data appears below</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
