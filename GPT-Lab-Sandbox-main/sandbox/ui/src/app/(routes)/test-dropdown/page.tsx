'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, UserPlus, BookOpen, FileText, Users, Microscope, Building2, ChevronDown } from 'lucide-react';

const testDropdownItems = [
  { href: '/academic-onboarding', label: 'Join as Researcher', icon: UserPlus, description: 'Academic registration & onboarding' },
  { href: '/academic-resources', label: 'Resource Library', icon: BookOpen, description: 'Tutorials, papers & datasets' },
  { href: '/academic-templates', label: 'Project Templates', icon: FileText, description: 'Research & coursework templates' },
  { href: '/academic-community', label: 'Community', icon: Users, description: 'Connect with researchers' },
  { href: '/academic-mentorship', label: 'Mentorship', icon: Microscope, description: 'Find mentors & mentees' },
  { href: '/academic-partnerships', label: 'Industry Partnerships', icon: Building2, description: 'Academic-industry collaboration' }
];

export default function TestDropdownPage() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('🎯 Clicked outside, closing dropdown');
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownClick = () => {
    const newState = openDropdown === 'academic' ? null : 'academic';
    console.log('🎯 Test dropdown clicked:', { current: openDropdown, new: newState });
    setOpenDropdown(newState);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Academic Hub Dropdown Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test the Dropdown</h2>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleDropdownClick}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                openDropdown === 'academic'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-300'
              }`}
            >
              <GraduationCap size={20} />
              <span>Academic Hub</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${openDropdown === 'academic' ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {openDropdown === 'academic' && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999]">
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-200 mb-3">
                    Academic Community
                  </div>
                  <div className="space-y-1">
                    {testDropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            console.log('🎯 Dropdown item clicked:', item.label);
                            setOpenDropdown(null);
                          }}
                          className="flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-blue-50 group text-gray-700 hover:text-blue-700"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 group-hover:bg-blue-100">
                            <Icon size={16} className="text-gray-600 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm group-hover:text-blue-700">
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>Current dropdown state: <code className="bg-gray-200 px-2 py-1 rounded">{openDropdown || 'null'}</code></p>
            <p>Should show dropdown: <code className="bg-gray-200 px-2 py-1 rounded">{openDropdown === 'academic' ? 'true' : 'false'}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
