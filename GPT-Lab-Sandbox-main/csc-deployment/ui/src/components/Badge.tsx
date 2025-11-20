export function Badge({ children, variant = 'muted', className }: { children: React.ReactNode; variant?: 'muted' | 'accent' | 'outline' | 'secondary' | 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple' | 'orange'; className?: string }) {
  const getStyles = () => {
    switch (variant) {
      case 'accent': return 'bg-accent/15 text-accent border border-accent/30';
      case 'outline': return 'bg-transparent text-gray-700 border border-gray-300';
      case 'secondary': return 'bg-gray-200 text-gray-800 border border-gray-300';
      case 'green': return 'bg-green-100 text-green-800 border border-green-300';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'red': return 'bg-red-100 text-red-800 border border-red-300';
      case 'gray': return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'blue': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'purple': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'orange': return 'bg-orange-100 text-orange-800 border border-orange-300';
      default: return 'bg-neutral-100 text-neutral-700 border border-neutral-200';
    }
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ${getStyles()} ${className || ''}`}>{children}</span>;
}


