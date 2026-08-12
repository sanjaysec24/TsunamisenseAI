import React from 'react';
import { Activity, Layers, Cpu, ShieldAlert, Waves, Sparkles, BookOpen, ArrowDown, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { AlertPanel } from '../components/AlertPanel';
import { Card } from '../components/Card';

export const MethodologyPage: React.FC = () => {
  const pipelineSteps = [
    {
      num: '01',
      title: 'Earthquake Data Ingestion',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      summary: 'Real-time USGS / GFZ / JMA seismic feeds transmit moment magnitude (Mw), hypocenter depth, focal mechanism, and epicentral coordinates.',
      phase: 'Phase 1'
    },
    {
      num: '02',
      title: 'Feature Engineering & Geospatial GIS',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      summary: 'Computes distance to subduction trench, bathymetric ocean depth at fault rupture location, coastal shelf slope, and crustal structure classification.',
      phase: 'Phase 1'
    },
    {
      num: '03',
      title: 'Machine Learning Potential Estimator',
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      summary: 'Gradient Boosted Decision Trees trained on historical tsunamigenic catalogs estimate seafloor vertical displacement and tsunami generation probability.',
      phase: 'Phase 2'
    },
    {
      num: '04',
      title: 'Hydrodynamic Risk Estimation',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      summary: 'Calculates initial wave amplitude potential, coastal travel time matrices, and threat level categorization for regional coastlines.',
      phase: 'Phase 3'
    },
    {
      num: '05',
      title: 'Explainable AI (XAI)',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      summary: 'SHAP (SHapley Additive exPlanations) values decompose model decisions to explain why an event is flagged high or low risk.',
      phase: 'Phase 3'
    },
    {
      num: '06',
      title: 'Ocean Observation Telemetry',
      icon: <Waves className="w-5 h-5 text-cyan-400" />,
      summary: 'Cross-verifies predictions against NOAA DART deep-ocean sea level pressure sensors to confirm wave passage and amplitude.',
      phase: 'Phase 1 & 6'
    },
    {
      num: '07',
      title: 'AI Analysis & Decision Support',
      icon: <Sparkles className="w-5 h-5 text-cyan-300" />,
      summary: 'Google Gemini synthesizes multi-source evidence into concise, clear decision-support summaries for disaster management professionals.',
      phase: 'Phase 4'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <SectionHeader
        title="Scientific Methodology & Pipeline"
        subtitle="End-to-end analytical architecture for multi-source tsunami risk estimation, physics-aware feature engineering, and explainable AI."
        badge={<StatusBadge label="RESEARCH METHODOLOGY" variant="accent" size="sm" />}
      />

      {/* MANDATORY DISCLAIMER ALERT */}
      <AlertPanel
        type="disclaimer"
        title="Official Emergency System Notice"
        description="TsunamiSense AI is a research prototype and does not replace official tsunami warning centers. Operational emergency directives must strictly originate from authorized government agencies (e.g., PTWC, NOAA, JMA)."
      />

      {/* PIPELINE STEP-BY-STEP DIAGRAM */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <StatusBadge label="ARCHITECTURAL WORKFLOW" variant="info" size="sm" />
          <h3 className="text-2xl font-display font-bold text-slate-100">
            System Intelligence Pipeline Flow
          </h3>
          <p className="text-xs text-slate-400">
            Data flows sequentially through validation, ML inference, ocean observation confirmation, and natural language synthesis.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <Card hoverEffect className="p-5 border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{step.num}</span>
                        <h4 className="text-base font-display font-bold text-slate-100">{step.title}</h4>
                      </div>
                      <StatusBadge label={step.phase} variant="neutral" size="sm" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{step.summary}</p>
                  </div>
                </div>
              </Card>

              {idx < pipelineSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 text-slate-600 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
