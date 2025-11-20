import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  title,
  description,
  actions,
  href,
  onClick
}: CardProps) {
  const content = (
    <div className={`card ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {description && (
            <p className="text-text-secondary text-sm mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
      {actions && (
        <div className="mt-4 pt-4 border-t border-border">
          {actions}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:shadow-glow transition-all duration-300">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="block w-full text-left hover:shadow-glow transition-all duration-300"
      >
        {content}
      </button>
    );
  }

  return content;
}

