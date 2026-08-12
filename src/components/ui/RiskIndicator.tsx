/**
 * TSUNAMISENSE AI - Risk Indicator Component
 * 
 * Neutral Phase 0 development state component.
 * Displays "Awaiting Analysis / Model Disconnected" without inventing fake numbers.
 */

import React from 'react';
import { Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card } from '../Card';
import { StatusBadge } from '../StatusBadge';

export interface RiskIndicatorProps {
  status?: 'DISCONNECTED' | 'AWAITING_ANALYSIS' | 'COMPUTED';
  modelMessage?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  status = 'DISCONNECTED',
  modelMessage = 'Prediction engine will be connected in Phase 2.'
}) => {
  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-semibold text-sm text-slate-200">
              Risk Inference Output Engine
            </span>
          </div>
          <StatusBadge label="PHASE 2 REQUIRED" variant="accent" size="sm" />
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* NEUTRAL ARC GAUGE FOUNDATION */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Arc background ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-cyan-500/30"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset="180"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-bold text-slate-400">-- / 100</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Risk Score
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-slate-300 uppercase">
              MODEL STATUS: <span className="text-amber-400">NOT CONNECTED</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs">{modelMessage}</p>
          </div>
        </div>

        {/* NEUTRAL INDICATORS GRID */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Risk Level</div>
            <div className="font-bold text-slate-400">PENDING ANALYSIS</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Model Confidence</div>
            <div className="font-bold text-slate-400">-- %</div>
          </div>
        </div>

        {/* FACTOR CONTRACT LIST */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
            Inference Parameters Schema
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {[
              { name: 'Vertical Seafloor Displacement (ΔZ)', status: 'Phase 2 Model' },
              { name: 'Distance to Subduction Trench Axis', status: 'Phase 1 GIS' },
              { name: 'Focal Mechanism (Slip Vector)', status: 'Phase 1 USGS' },
              { name: 'Epicentral Water Column Depth', status: 'Phase 1 GEBCO' }
            ].map((f, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-slate-300"
              >
                <span>{f.name}</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
