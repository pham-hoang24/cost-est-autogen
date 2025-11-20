'use client';

import React, { ReactNode } from 'react';

interface LabelProps {
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Label({ htmlFor, className = '', children }: LabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={`text-sm font-medium text-text-secondary ${className}`}
    >
      {children}
    </label>
  );
}
