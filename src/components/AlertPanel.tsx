import React from 'react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

export type AlertType = 'warning' | 'info' | 'disclaimer' | 'success';

interface AlertPanelProps {
  type?: AlertType;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  type = 'info',
  title,
  description,
  action,
  className = ''
}) => {
  const styles: Record<AlertType, { bg: string; border: string; icon: React.ReactNode; iconColor: string }> = {
    warning: {
      bg: 'bg-amber-950/30',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5" />,
      iconColor: 'text-amber-400'
    },
    info: {
      bg: 'bg-sky-950/30',
      border: 'border-sky-500/30',
      icon: <Info className="w-5 h-5" />,
      iconColor: 'text-sky-400'
    },
    disclaimer: {
      bg: 'bg-slate-900/80',
      border: 'border-slate-700/60',
      icon: <ShieldAlert className="w-5 h-5" />,
      iconColor: 'text-cyan-400'
    },
    success: {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconColor: 'text-emerald-400'
    }
  };

  const current = styles[type];

  return (
    <div
      className={`p-4 rounded-xl border backdrop-blur-md transition-all ${current.bg} ${current.border} ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 shrink-0 ${current.iconColor}`}>{current.icon}</div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h4>
          {description && <div className="text-xs text-slate-400 leading-relaxed">{description}</div>}
        </div>
        {action && <div className="shrink-0 pl-2">{action}</div>}
      </div>
    </div>
  );
};
