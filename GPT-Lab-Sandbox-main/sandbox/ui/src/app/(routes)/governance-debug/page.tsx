'use client';

import { useState, useEffect } from 'react';

export default function GovernanceDebugPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 Component mounted, fetching data...');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔍 Starting fetch...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/simple-governance/dashboard');
      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🔍 Response data:', result);
      setData(result);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('🔍 Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading governance data...</p>
          <p className="text-slate-400 text-sm mt-2">Check browser console for details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-red-500 text-2xl mb-4">Error Loading Data</h1>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Governance Debug Page</h1>
        
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">API Response:</h2>
          <pre className="bg-slate-900 p-4 rounded text-green-400 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="mt-8">
          <button 
            onClick={fetchData}
            className="bg-green-500 text-black px-6 py-3 rounded hover:bg-green-600 font-semibold"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
