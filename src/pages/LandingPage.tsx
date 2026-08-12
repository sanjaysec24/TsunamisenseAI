import React from 'react';
import { Waves, Activity, ArrowRight, Layers, Database, Cpu, Compass, CheckCircle2, Radio, Globe, ShieldAlert, Bot, Search, Map } from 'lucide-react';
import { AppRoute } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { AlertPanel } from '../components/AlertPanel';
import { HeroWaveCanvas } from '../components/HeroWaveCanvas';

interface LandingPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center rounded-3xl border border-slate-800/80 bg-ocean-radial overflow-hidden shadow-2xl my-4">
        <HeroWaveCanvas />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060c18] via-transparent to-transparent z-1 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 py-12">
          {/* Tag & Status */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs font-mono">
            <StatusBadge label="IBM DATATHON SHOWCASE" variant="accent" size="sm" />
            <span className="text-slate-400">|</span>
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              EARLY-WARNING DECISION SUPPORT
            </span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-100 uppercase">
              UNDERSTAND THE RISK <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                BEFORE THE WAVE ARRIVES.
              </span>
            </h1>
          </div>

          {/* Core Messaging Paragraph */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
            TsunamiSense AI combines seismic characteristics, geographic context, historical evidence and machine learning to estimate tsunami-generation risk following an earthquake.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onNavigate('/analyze')}
              leftIcon={<Activity className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              ANALYZE AN EARTHQUAKE
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('/monitor')}
              leftIcon={<Globe className="w-5 h-5" />}
            >
              EXPLORE GLOBAL EVENTS
            </Button>
          </div>

          {/* Explicit Research Prototype Disclaimer Banner */}
          <div className="pt-6 max-w-2xl mx-auto text-left">
            <AlertPanel
              type="disclaimer"
              title="RESEARCH & DECISION SUPPORT PROTOTYPE"
              description="TsunamiSense AI is a research decision-support prototype and is not an official tsunami warning authority. Do not rely on it for primary emergency notifications."
            />
          </div>
        </div>
      </section>

      {/* 1. INTELLIGENCE OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <StatusBadge label="INTELLIGENCE ARCHITECTURE" variant="info" size="sm" />
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
            Multi-Source Tsunami Intelligence Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Synthesizes heterogeneous seismic, bathymetric, historical and oceanographic signals into structured risk estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-semibold text-slate-100">Seismic Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests moment magnitude ($M_w$), focal depth, fault slip mechanism, hypocenter coordinates and seismic rupture velocity.
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-semibold text-slate-100">Geographic & Bathymetric</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates coastal proximity, epicentral ocean depth, shelf slope angle and subduction trench fault geometry.
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-semibold text-slate-100">Historical Benchmarks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matches current earthquake parameters against verified NOAA NCEI historical tsunamigenic catalogs and run-up records.
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-sky-950/80 border border-sky-500/30 text-sky-400">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-semibold text-slate-100">Ocean Observation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cross-references deep-ocean DART water displacement and tide gauge telemetry when observational feeds are connected.
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-semibold text-slate-100">Trained Machine Learning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gradient Boosted Decision Trees trained on real historical events calculate probability of tsunamigenic displacement.
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-semibold text-slate-100">AI Explanation Layer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Gemini synthesizes model parameters and feature rationale into transparent natural language decision support.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 rounded-3xl border border-slate-800 bg-[#070f1e]/90 backdrop-blur-xl space-y-8 shadow-2xl">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <StatusBadge label="END-TO-END PIPELINE" variant="accent" size="sm" />
            <h2 className="text-2xl font-display font-bold text-slate-100">How TsunamiSense AI Works</h2>
            <p className="text-xs text-slate-400">A strict 5-stage pipeline transforming raw parameters into explainable risk analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">01. EARTHQUAKE</span>
              <h3 className="text-sm font-semibold text-slate-200">Parameter Input</h3>
              <p className="text-xs text-slate-400">Magnitude, focal depth (km), latitude, longitude and regional location.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">02. FEATURES</span>
              <h3 className="text-sm font-semibold text-slate-200">Feature Engineering</h3>
              <p className="text-xs text-slate-400">Distance to trench, subduction flag, offshore status, energy/depth ratio.</p>
            </div>

            <div className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/30 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">03. ML MODEL</span>
              <h3 className="text-sm font-semibold text-cyan-200">Risk Model Inference</h3>
              <p className="text-xs text-cyan-300/80">Gradient Boosted Tree model computes risk score (0-100) & probability.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">04. EXPLAINABILITY</span>
              <h3 className="text-sm font-semibold text-slate-200">Contributing Factors</h3>
              <p className="text-xs text-slate-400">Feature contribution decomposition detailing why the score was assigned.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">05. GEMINI AI</span>
              <h3 className="text-sm font-semibold text-slate-200">AI Explanation</h3>
              <p className="text-xs text-slate-400">Gemini LLM generates rationale, uncertainty notes, and verification steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <StatusBadge label="PLATFORM FEATURES" variant="info" size="sm" />
          <h2 className="text-2xl font-display font-bold text-slate-100">Core Platform Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="space-y-3 cursor-pointer" onClick={() => onNavigate('/analyze')}>
            <div className="p-3 w-fit rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-100">1. Instant Risk Analysis</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluate custom or historical earthquake parameters against trained ML algorithms to get immediate risk level categorizations.
            </p>
            <div className="pt-2 text-xs text-cyan-400 font-medium flex items-center gap-1">
              <span>Open Analyzer</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card hoverEffect className="space-y-3 cursor-pointer" onClick={() => onNavigate('/history')}>
            <div className="p-3 w-fit rounded-xl bg-blue-950 border border-blue-500/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-100">2. Historical Intelligence</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Browse and query verified historical megathrust and tsunamigenic records from NOAA NCEI to compare analog event conditions.
            </p>
            <div className="pt-2 text-xs text-blue-400 font-medium flex items-center gap-1">
              <span>Explore History</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          <Card hoverEffect className="space-y-3 cursor-pointer" onClick={() => onNavigate('/analyst')}>
            <div className="p-3 w-fit rounded-xl bg-indigo-950 border border-indigo-500/30 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-slate-100">3. Conversational AI Analyst</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Interact with a Gemini-powered decision support assistant to ask analytical questions about risk scores and seismic features.
            </p>
            <div className="pt-2 text-xs text-indigo-400 font-medium flex items-center gap-1">
              <span>Consult Analyst</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        </div>
      </section>

      {/* 4. RESPONSIBLE AI & DISCLAIMER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl border border-slate-800 bg-[#081021] space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <h3 className="text-lg font-display font-bold text-slate-100">Responsible AI & Scientific Integrity</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-4xl">
            TsunamiSense AI is strictly positioned as a research and decision-support prototype. Machine learning predictions are trained on historical earthquake records and are designed to assist emergency response analysts. It does not issue public evacuation orders or replace authoritative warning centers (NOAA PTWC, JMA, BMKG, USGS).
          </p>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-4">
        <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-100">
          Ready to Evaluate an Event?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Test the ML model and Gemini reasoning engine with real seismic parameters or historical benchmark presets.
        </p>
        <div>
          <Button
            size="lg"
            variant="primary"
            onClick={() => onNavigate('/analyze')}
            leftIcon={<Activity className="w-5 h-5" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            ANALYZE AN EVENT NOW
          </Button>
        </div>
      </section>
    </div>
  );
};
