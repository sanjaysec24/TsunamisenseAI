import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100 tracking-tight">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
