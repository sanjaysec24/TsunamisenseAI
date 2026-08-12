import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  label?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  subtext?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  label,
  icon,
  badge,
  subtext,
  className = ''
}) => {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-display font-bold text-slate-100">
              {value}
            </span>
            {label && <span className="text-xs text-slate-400 font-mono">{label}</span>}
          </div>
          {subtext && <p className="text-xs text-slate-400 pt-1">{subtext}</p>}
        </div>

        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shadow-inner">
              {icon}
            </div>
          )}
          {badge}
        </div>
      </div>
    </Card>
  );
};
