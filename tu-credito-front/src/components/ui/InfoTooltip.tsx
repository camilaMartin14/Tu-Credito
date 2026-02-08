import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <div className="group relative flex items-center ml-2 z-20">
      <Info className="h-4 w-4 text-muted hover:text-primary-500 cursor-help transition-colors opacity-70 hover:opacity-100" />
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-surface border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs text-main font-normal pointer-events-none text-center">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface" />
      </div>
    </div>
  );
}
