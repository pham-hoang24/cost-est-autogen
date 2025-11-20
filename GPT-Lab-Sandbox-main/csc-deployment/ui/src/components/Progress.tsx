import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  className = '', 
  indicatorColor = 'bg-blue-500' 
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`w-full bg-slate-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-full ${indicatorColor} transition-all duration-500 ease-out`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
