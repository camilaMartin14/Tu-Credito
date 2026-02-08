import { cn } from '../../lib/utils';

export type StatusVariant = 'success' | 'warning' | 'error' | 'default';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ children, variant = 'default', className }: StatusBadgeProps) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    default: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
