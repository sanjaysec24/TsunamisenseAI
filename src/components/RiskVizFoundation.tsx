import React from 'react';
import { Activity, Waves, ShieldAlert, Cpu } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface RiskVizFoundationProps {
  className?: string;
  showPlaceholderNote?: boolean;
}

export const RiskVizFoundation: React.FC<RiskVizFoundationProps> = ({
  className = '',
  showPlaceholderNote = true
}) => {
  return (
    <div className={`p-6 rounded-2xl border border-slate-800 bg-[#091326]/90 backdrop-blur-md relative overflow-hidden flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-display font-semibold text-slate-200">
            Tsunami Generation Potential Gauge (Model Architecture)
          </h3>
        </div>
        <StatusBadge label="PHASE 2 ML ENGINE" variant="phase" size="sm" />
      </div>

      <div className="py-8 flex flex-col items-center justify-center relative">
        {/* SVG Dial Gauge Arc Representation */}
        <div className="relative w-56 h-32 flex items-end justify-center">
          <svg className="w-56 h-56 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#1e293b"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="188.4 62.8"
            />
            {/* Decorative Segment Markers */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#0ea5e9"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="10 240"
              className="opacity-40"
            />
          </svg>

          <div className="absolute inset-x-0 bottom-0 text-center flex flex-col items-center">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Risk Probability
            </span>
            <span className="text-3xl font-display font-bold text-slate-400 tracking-wider">
              --.- %
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 pt-0.5">
              Awaiting Subduction & Magnitude Parameters
            </span>
          </div>
        </div>

        {/* Wave displacement schematic line */}
        <div className="w-full max-w-sm mt-6 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Seafloor Displacement Vector</span>
            <span className="text-slate-500">Physics Simulation</span>
          </div>
          <svg className="w-full h-10 stroke-cyan-500/50 fill-none" viewBox="0 0 300 40">
            <path d="M 0 20 Q 50 20 75 10 T 150 30 T 225 15 T 300 20" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>

      {showPlaceholderNote && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Model will ingest moment magnitude, fault dip/rake angle, and depth parameters to estimate tsunami potential in Phase 2.
          </span>
        </div>
      )}
    </div>
  );
};
