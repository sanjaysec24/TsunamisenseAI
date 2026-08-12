import React from 'react';
import { Waves, ShieldAlert, Cpu, ExternalLink } from 'lucide-react';
import { AppRoute } from '../types';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#040812] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Waves className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg text-slate-100">
                TSUNAMISENSE <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Intelligent Tsunami Risk Detection & Early-Warning Decision Support. Designed to combine seismic data, bathymetry, tectonic features, and AI-driven analysis for coastal disaster resilience.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-cyan-400/90 pt-1">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                IBM Datathon Project
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Phase 0 — Product Foundation
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/monitor')} className="hover:text-cyan-300 transition-colors">
                  Global Monitoring
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/analyze')} className="hover:text-cyan-300 transition-colors">
                  Earthquake Risk Analyzer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/map')} className="hover:text-cyan-300 transition-colors">
                  Global Risk Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/history')} className="hover:text-cyan-300 transition-colors">
                  Historical Intelligence
                </button>
              </li>
            </ul>
          </div>

          {/* Documentation & Meta */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Framework & Research
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/methodology')} className="hover:text-cyan-300 transition-colors">
                  System Methodology
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/analyst')} className="hover:text-cyan-300 transition-colors">
                  AI Analyst Interface
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-cyan-300 transition-colors">
                  About & Responsible AI
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Prototype Legal & Operational Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <strong className="text-slate-300 font-medium">Research & Decision-Support Prototype Notice:</strong> TsunamiSense AI is an experimental decision-support research application. It is <em>NOT</em> an official tsunami warning system and must never be used as a primary source for emergency evacuations or official safety alerts. Always consult official national bodies (e.g., PTWC, JMA, NOAA, USGS, BMKG).
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <span>© 2026 TsunamiSense AI. IBM Datathon Prototype Initiative.</span>
          <span>Version 0.1.0-Phase0</span>
        </div>
      </div>
    </footer>
  );
};
