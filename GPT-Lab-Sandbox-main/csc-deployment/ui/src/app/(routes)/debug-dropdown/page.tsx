'use client';

import React, { useState } from 'react';
import { GraduationCap, ChevronDown } from 'lucide-react';

export default function DebugDropdownPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('🎯 DEBUG: Button clicked!', { isOpen });
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Dropdown Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Simple Dropdown Test</h2>
          
          <div className="relative">
            <button
              onClick={handleClick}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                isOpen ? 'bg-blue-100 border-2 border-blue-500 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <GraduationCap size={20} />
              <span>Academic Hub</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-blue-500 rounded-xl shadow-2xl z-[99999]">
                <div className="p-3">
                  <div className="text-xs font-medium text-blue-600 px-3 py-2 border-b border-blue-200 mb-3 bg-blue-50">
                    🎓 DEBUG: Dropdown is OPEN!
                  </div>
                  <div className="space-y-1">
                    <div className="px-3 py-2 bg-gray-100 rounded">Item 1</div>
                    <div className="px-3 py-2 bg-gray-100 rounded">Item 2</div>
                    <div className="px-3 py-2 bg-gray-100 rounded">Item 3</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>isOpen: <code className="bg-gray-200 px-2 py-1 rounded">{isOpen.toString()}</code></p>
            <p>Button should be blue when open: <code className="bg-gray-200 px-2 py-1 rounded">{isOpen ? 'YES' : 'NO'}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
