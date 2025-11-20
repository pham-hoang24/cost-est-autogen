'use client';

import React from 'react';

export default function TestAIServicesPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">AI Services Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Test Service 1</h3>
            <p className="text-text-secondary mb-4">This is a test service to verify the page is working.</p>
            <button className="bg-primary text-white px-4 py-2 rounded">Use Service</button>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Test Service 2</h3>
            <p className="text-text-secondary mb-4">Another test service to verify the page is working.</p>
            <button className="bg-primary text-white px-4 py-2 rounded">Use Service</button>
          </div>
        </div>
      </div>
    </div>
  );
}
