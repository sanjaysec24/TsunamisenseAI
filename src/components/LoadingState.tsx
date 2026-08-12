import React from 'react';
import { Waves } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Initialising System Subsystems...',
  subtext = 'Establishing Phase 0 Application Architecture Framework',
  className = ''
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center gap-3.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Waves className="w-5 h-5 text-cyan-400 absolute" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-mono font-medium text-slate-200">{label}</p>
        {subtext && <p className="text-xs text-slate-400 font-mono">{subtext}</p>}
      </div>
    </div>
  );
};
