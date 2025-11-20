'use client';

import React from 'react';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ 
  id, 
  checked = false, 
  onCheckedChange, 
  className = '', 
  disabled = false 
}: CheckboxProps) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className={`w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 ${className}`}
    />
  );
}
