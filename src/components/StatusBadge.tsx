import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'neutral' | 'accent' | 'phase';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'info',
  pulse = false,
  size = 'md',
  icon
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-emerald-900/20',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-900/20',
    info: 'bg-sky-950/80 text-sky-300 border-sky-500/40 shadow-sky-900/20',
    accent: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-cyan-900/20',
    neutral: 'bg-slate-900/90 text-slate-300 border-slate-700/60 shadow-slate-950/40',
    phase: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40 shadow-indigo-900/20'
  };

  const pulseColors: Record<BadgeVariant, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-sky-400',
    accent: 'bg-cyan-400',
    neutral: 'bg-slate-400',
    phase: 'bg-indigo-400'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-mono',
    md: 'px-2.5 py-1 text-xs font-mono font-medium',
    lg: 'px-3 py-1.5 text-sm font-mono font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md shadow-sm tracking-wide uppercase transition-all ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[variant]}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColors[variant]}`} />
        </span>
      )}
      {icon && <span className="opacity-80">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
