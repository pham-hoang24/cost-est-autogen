'use client';

import React from 'react';

interface UserAvatarProps {
  user: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    status?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

const roleColors = {
  super_admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  research_admin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  researcher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewer: 'bg-green-500/20 text-green-400 border-green-500/30'
};

const statusIndicators = {
  approved: 'bg-green-500',
  pending: 'bg-yellow-500',
  rejected: 'bg-red-500',
  suspended: 'bg-gray-500'
};

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const email = user.email || '';
  const role = user.role || 'viewer';
  const status = user.status || 'pending';

  // Generate initials
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get role color
  const getRoleColor = () => {
    return roleColors[role as keyof typeof roleColors] || roleColors.viewer;
  };

  // Get status indicator color
  const getStatusColor = () => {
    return statusIndicators[status as keyof typeof statusIndicators] || statusIndicators.pending;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Circle */}
      <div className={`
        ${sizeClasses[size]}
        ${getRoleColor()}
        rounded-full border-2 flex items-center justify-center font-semibold
        shadow-lg hover:shadow-xl transition-all duration-200
      `}>
        {getInitials()}
      </div>
      
      {/* Status Indicator */}
      <div className={`
        absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor()} rounded-full
        border-2 border-background shadow-sm
      `} title={`Status: ${status}`} />
      
      {/* Role Badge (for larger sizes) */}
      {size === 'lg' || size === 'xl' ? (
        <div className="absolute -top-1 -right-1">
          <div className={`
            px-1.5 py-0.5 text-xs font-medium rounded-full
            ${getRoleColor()} border
            shadow-sm
          `}>
            {role.replace('_', ' ')}
          </div>
        </div>
      ) : null}
    </div>
  );
}
