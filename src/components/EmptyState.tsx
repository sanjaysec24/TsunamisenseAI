import React from 'react';
import { Database, Waves, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface EmptyStateProps {
  title?: string;
  description?: string;
  badgeLabel?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Awaiting Data Integration',
  description = 'Live data pipeline and telemetry streaming will be connected in Phase 1.',
  badgeLabel = 'DATA NOT CONNECTED',
  action,
  icon,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#091122]/60 backdrop-blur-md flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="p-4 rounded-full bg-slate-900/80 border border-slate-800 text-cyan-400 shadow-lg">
        {icon || <Waves className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <div className="space-y-1.5 max-w-md">
        <StatusBadge label={badgeLabel} variant="warning" />
        <h3 className="text-lg font-display font-semibold text-slate-200 pt-2">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
