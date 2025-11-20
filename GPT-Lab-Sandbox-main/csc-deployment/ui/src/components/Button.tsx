import { ReactNode, ReactElement, ButtonHTMLAttributes, isValidElement, cloneElement } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  asChild = false,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-primary text-background hover:bg-primary-500',
    outline: 'border border-border bg-transparent text-text-primary hover:border-primary hover:text-primary',
    ghost: 'bg-transparent text-text-primary hover:bg-muted'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const computedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<any>;
    const mergedClassName = `${computedClasses} ${child.props?.className || ''}`.trim();
    return cloneElement(child, { className: mergedClassName, ...props });
  }

  return (
    <button className={computedClasses} {...props}>
      {children}
    </button>
  );
}

