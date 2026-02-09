import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InfoTooltip } from '../ui/InfoTooltip';
import { Skeleton } from '../ui/Skeleton';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconColor?: string; // e.g. "bg-primary-500/20 text-primary-400"
  description?: string;
  loading?: boolean;
}

export function KPIWidget({ title, value, icon: Icon, trend, trendUp, className, iconColor, description, loading = false }: KPIWidgetProps) {
  if (loading) {
    return (
      <div className={cn("glass-panel rounded-2xl p-6 relative overflow-visible h-full", className)}>
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-3 w-full">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <div className="mt-4 flex items-center gap-2">
           <Skeleton className="h-5 w-16 rounded-full" />
           <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-panel rounded-2xl p-6 relative overflow-visible group hover:bg-surfaceHighlight/50 transition-all duration-300", className)}>
       {/* Background Glow Effect */}
       <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center">
            <p className="text-sm font-medium text-muted">{title}</p>
            {description && <InfoTooltip content={description} />}
          </div>
          <h3 className="mt-3 text-3xl font-bold text-main tracking-tight">{value}</h3>
        </div>
        <div className={cn("rounded-xl p-3 shadow-inner", iconColor || "bg-primary-500/10 text-primary-400")}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm relative z-10">
          <div className={cn("px-2 py-0.5 rounded-full text-xs font-semibold flex items-center", trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
          <span className="ml-2 text-xs text-muted">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
