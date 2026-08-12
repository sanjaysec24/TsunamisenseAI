/**
 * TSUNAMISENSE AI - Global Monitoring Dashboard (Phase 1.1)
 * 
 * Displays real-time USGS earthquake feed, NOAA historical tsunami benchmark records,
 * and data quality indicators powered by Phase 1.1 Data Engine.
 */

import React, { useState, useEffect } from 'react';
import { Radio, Activity, Waves, Globe, RefreshCw, Cpu, CheckCircle2, ArrowUpRight, ShieldAlert, Zap, Compass, Bot, Sparkles, Database } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { AlertPanel } from '../components/AlertPanel';
import { DataTableFoundation } from '../components/DataTableFoundation';
import { Button } from '../components/Button';
import { SkeletonLoader } from '../components/feedback/SkeletonLoader';
import { oceanObservationService } from '../services/oceanObservation/oceanObservationService';
import { tsunamiService } from '../services/tsunami/tsunamiService';
import { earthquakeService } from '../services/earthquake/earthquakeService';
import { OceanObservation, TsunamiEvent, EarthquakeEvent } from '../types';
import { useApp } from '../context/AppContext';
import { PredictionService } from '../services/predictionService';
import { riskService } from '../services/risk/riskService';
import { VERIFIED_HISTORICAL_PRESETS } from '../ml/dataset/datasetManager';

export const MonitorPage: React.FC = () => {
  const { activeAssessment, activeExplanation, setActiveAssessment, setActiveExplanation, runAnalysis, setCurrentRoute } = useApp();
  const [loading, setLoading] = useState(false);
  const [analyzingEventId, setAnalyzingEventId] = useState<string | null>(null);
  const [stations, setStations] = useState<OceanObservation[]>([]);
  const [benchmarkEvents, setBenchmarkEvents] = useState<TsunamiEvent[]>([]);
  const [liveEarthquakes, setLiveEarthquakes] = useState<EarthquakeEvent[]>([]);

  const fetchLiveFeed = async () => {
    setLoading(true);
    try {
      const response = await earthquakeService.getLiveEvents(5.5, 30);
      setLiveEarthquakes(response.events);
    } catch (err) {
      console.error('Error fetching live USGS feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStations(oceanObservationService.getStations());
    setBenchmarkEvents(tsunamiService.getHistoricalBenchmarkEvents());
    fetchLiveFeed();

    // Auto-initialize active assessment with 2011 Tohoku benchmark if none currently loaded
    if (!activeAssessment) {
      const defaultPreset = VERIFIED_HISTORICAL_PRESETS[0]; // Tohoku
      const initialAssessment = PredictionService.analyzeEarthquake({
        magnitude: defaultPreset.magnitude,
        depth_km: defaultPreset.depth_km,
        latitude: defaultPreset.latitude,
        longitude: defaultPreset.longitude,
        location_name: defaultPreset.event_name
      });
      setActiveAssessment(initialAssessment);

      // Fetch AI explanation
      riskService.getAIExplanation(initialAssessment).then(res => {
        if (res.success && res.explanation) {
          setActiveExplanation(res.explanation);
        }
      });
    }
  }, []);

  const handleAnalyzeEvent = async (event: EarthquakeEvent) => {
    setAnalyzingEventId(event.id);
    await runAnalysis({
      magnitude: event.magnitude,
      depthKm: event.depthKm,
      latitude: event.latitude,
      longitude: event.longitude,
      locationName: event.location
    });
    setAnalyzingEventId(null);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleLoadPreset = async (presetId: string) => {
    const preset = VERIFIED_HISTORICAL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    await runAnalysis({
      magnitude: preset.magnitude,
      depthKm: preset.depth_km,
      latitude: preset.latitude,
      longitude: preset.longitude,
      locationName: preset.event_name
    });
  };

  const getRiskBadgeVariant = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'EXTREME':
      case 'HIGH':
        return 'danger';
      case 'MODERATE':
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION HEADER */}
      <SectionHeader
        title="GLOBAL MONITORING"
        subtitle="Seismic and tsunami-risk intelligence overview"
        badge={<StatusBadge label="TSUNAMISENSE DETECTOR ONLINE" variant="success" size="sm" pulse />}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLiveFeed}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh USGS Feed
          </Button>
        }
      />

      {/* 1. TOP METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="ACTIVE ANALYSES"
          value={activeAssessment ? "1 Active Event" : "0 Active Events"}
          subtext={activeAssessment ? activeAssessment.event.location_name || 'Analyzed Earthquake' : 'Ready for input'}
          icon={<Radio className="w-5 h-5 text-emerald-400" />}
          badge={<StatusBadge label="ML ENGINE ACTIVE" variant="success" size="sm" pulse />}
        />

        <MetricCard
          title="MODEL STATUS"
          value="ONLINE"
          subtext={activeAssessment ? `${activeAssessment.model.name} v${activeAssessment.model.version}` : 'Trained ML Model Ready'}
          icon={<Cpu className="w-5 h-5 text-cyan-400" />}
          badge={<StatusBadge label="GBDT / RF" variant="accent" size="sm" />}
        />

        <MetricCard
          title="DATA STATUS"
          value="CONNECTED"
          subtext={`USGS FDSN (${liveEarthquakes.length} Events Ingested)`}
          icon={<Activity className="w-5 h-5 text-amber-400" />}
          badge={<StatusBadge label="LIVE USGS API" variant="success" size="sm" />}
        />

        <MetricCard
          title="OCEAN OBSERVATION"
          value="DATA NOT CONNECTED"
          subtext="NOAA DART Telemetry Disconnected"
          icon={<Waves className="w-5 h-5 text-slate-500" />}
          badge={<StatusBadge label="STANDBY" variant="warning" size="sm" />}
        />
      </div>

      {/* 2. ACTIVE RISK ASSESSMENT COMMAND CENTER PANEL */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-display font-bold text-slate-100">
              Active Tsunami Generation Risk Assessment
            </h2>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setCurrentRoute('/analyze')}
            leftIcon={<Activity className="w-4 h-4" />}
          >
            Analyze Custom Earthquake
          </Button>
        </div>

        {activeAssessment ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: RISK SCORE GAUGE & METRIC PANEL */}
            <div className="lg:col-span-5 p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-[#081224] via-[#060c18] to-[#040812] shadow-2xl flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    CURRENT EVENT ANALYSIS
                  </span>
                  <h3 className="text-lg font-display font-bold text-slate-100">
                    {activeAssessment.event.location_name || 'Analyzed Epicenter'}
                  </h3>
                </div>
                <StatusBadge
                  label={`${activeAssessment.risk.level} RISK`}
                  variant={getRiskBadgeVariant(activeAssessment.risk.level)}
                  size="md"
                  pulse
                />
              </div>

              {/* RISK SCORE VISUAL GAUGE / METER */}
              <div className="py-4 text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  {/* Gauge Circular Outline */}
                  <div className="w-44 h-44 rounded-full border-8 border-slate-800 flex items-center justify-center p-2 relative">
                    <div
                      className={`absolute inset-0 rounded-full border-8 transition-all duration-1000 ${
                        activeAssessment.risk.score >= 70
                          ? 'border-rose-500/80 shadow-lg shadow-rose-950/50'
                          : activeAssessment.risk.score >= 40
                          ? 'border-amber-500/80 shadow-lg shadow-amber-950/50'
                          : 'border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                      }`}
                      style={{
                        clipPath: `inset(${100 - activeAssessment.risk.score}% 0 0 0)`
                      }}
                    />
                    <div className="text-center space-y-1">
                      <span className="text-5xl font-display font-extrabold tracking-tight text-slate-100">
                        {activeAssessment.risk.score.toFixed(0)}
                      </span>
                      <span className="block text-xs font-mono text-slate-400">/ 100 RISK SCORE</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Model Probability</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {(activeAssessment.risk.model_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Selected Model</span>
                    <span className="font-bold text-slate-200 text-xs">
                      {activeAssessment.model.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* EVENT PARAMETER METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MAGNITUDE</span>
                  <span className="font-bold text-amber-400 text-sm">Mw {activeAssessment.event.magnitude.toFixed(1)}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">FOCAL DEPTH</span>
                  <span className="font-bold text-cyan-300 text-sm">{activeAssessment.event.depth_km.toFixed(1)} km</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                  <span className="font-bold text-slate-200">{activeAssessment.event.latitude.toFixed(2)}°</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                  <span className="font-bold text-slate-200">{activeAssessment.event.longitude.toFixed(2)}°</span>
                </div>
              </div>
            </div>

            {/* RIGHT: WHY THIS RISK & GEMINI AI ANALYST EXPLANATION */}
            <div className="lg:col-span-7 space-y-6">
              {/* WHY THIS RISK? CONTRIBUTING FACTORS */}
              <Card
                header={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-display font-bold text-sm text-slate-100 uppercase">
                        Why This Risk? (Model Feature Decomposition)
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {activeAssessment.factors.length} Key Factors Computed
                    </span>
                  </div>
                }
              >
                <div className="space-y-3">
                  {activeAssessment.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{factor.factor_name}</span>
                          <span className="font-mono text-slate-400">({factor.raw_value})</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{factor.rationale}</p>
                      </div>
                      <div className="shrink-0 text-right font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            factor.impact_direction === 'INCREASES_RISK'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {factor.impact_direction === 'INCREASES_RISK' ? `+${factor.impact_percentage}% RISK` : `-${factor.impact_percentage}% RISK`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* GEMINI AI ANALYST EXPLANATION PANEL */}
              <Card
                className="border-cyan-500/30 bg-slate-950/80"
                header={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-display font-bold text-sm text-cyan-200 uppercase">
                        TsunamiSense AI Analyst Explanation
                      </h3>
                    </div>
                    <StatusBadge label="GEMINI 3.6 FLASH" variant="accent" size="sm" />
                  </div>
                }
              >
                {activeExplanation ? (
                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                    <p className="font-semibold text-slate-100 text-sm">
                      {activeExplanation.summary}
                    </p>
                    <p className="text-slate-300">
                      {activeExplanation.risk_interpretation}
                    </p>
                    {activeExplanation.key_factors && activeExplanation.key_factors.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Key Seismic Rationale</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {activeExplanation.key_factors.map((kf, i) => (
                            <li key={i}>{kf}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-400">
                      <span>Scientific Uncertainty: {activeExplanation.uncertainty}</span>
                      <button
                        onClick={() => setCurrentRoute('/analyst')}
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                      >
                        Ask AI Analyst Questions <Sparkles className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center space-y-2 text-xs text-slate-400">
                    <p>AI Analyst Explanation is being generated via Gemini service...</p>
                    <p className="text-[10px] font-mono text-slate-500">The ML risk assessment above remains fully active and calculated.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 text-center space-y-4">
            <Radio className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold text-slate-200">NO ACTIVE ASSESSMENT</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Analyze an earthquake to generate a risk assessment, or select a historical benchmark event below to test the ML model immediately.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button size="sm" variant="primary" onClick={() => handleLoadPreset('tohoku-2011')}>
                Load 2011 Tohoku (M 9.1)
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleLoadPreset('sumatra-2004')}>
                Load 2004 Sumatra (M 9.1)
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleLoadPreset('turkey-2023-inland')}>
                Load 2023 Turkey Inland (M 7.8)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. LIVE USGS EARTHQUAKE STREAM TABLE */}
      <div className="space-y-4">
        <DataTableFoundation<EarthquakeEvent>
          title="Live USGS Earthquake Events Feed (Real Data — M ≥ 5.5)"
          statusBadgeLabel="USGS FDSN WEB SERVICE"
          data={liveEarthquakes}
          keyExtractor={(item) => item.id}
          columns={[
            {
              key: 'id',
              header: 'USGS ID',
              render: (item) => <span className="font-mono text-cyan-300 font-bold">{item.id}</span>
            },
            {
              key: 'eventTime',
              header: 'Origin Time (UTC)',
              render: (item) => <span className="font-mono text-slate-300 text-xs">{item.eventTime}</span>
            },
            {
              key: 'magnitude',
              header: 'Magnitude',
              render: (item) => (
                <span className="font-mono text-amber-400 font-bold">
                  {item.magnitudeType} {item.magnitude.toFixed(1)}
                </span>
              )
            },
            {
              key: 'depthKm',
              header: 'Focal Depth',
              render: (item) => <span className="font-mono text-slate-300">{item.depthKm.toFixed(1)} km</span>
            },
            {
              key: 'coordinates',
              header: 'Coordinates',
              render: (item) => (
                <span className="font-mono text-slate-400 text-xs">
                  {`${item.latitude.toFixed(2)}° N, ${item.longitude.toFixed(2)}° E`}
                </span>
              )
            },
            {
              key: 'location',
              header: 'Region',
              render: (item) => <span className="text-slate-200 text-xs">{item.location}</span>
            },
            {
              key: 'actions',
              header: 'Action',
              render: (item) => (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => handleAnalyzeEvent(item)}
                  disabled={analyzingEventId === item.id}
                >
                  {analyzingEventId === item.id ? 'Analyzing...' : 'Analyze Risk'}
                </Button>
              )
            }
          ]}
        />
      </div>

      {/* 4. RECENT HISTORICAL BENCHMARK EVENTS REFERENCE */}
      <div className="space-y-4">
        <DataTableFoundation<TsunamiEvent>
          title="NOAA/NCEI Global Historical Tsunami Benchmark Events"
          statusBadgeLabel="NOAA NCEI VERIFIED SNAPSHOTS"
          data={benchmarkEvents}
          keyExtractor={(item) => item.id}
          columns={[
            {
              key: 'eventTime',
              header: 'Date / Time',
              render: (item) => <span className="font-mono text-slate-300">{item.eventTime}</span>
            },
            {
              key: 'affectedRegion',
              header: 'Region / Location',
              render: (item) => <span className="font-semibold text-slate-200">{item.affectedRegion}</span>
            },
            {
              key: 'tsunamiMagnitude',
              header: 'Magnitude',
              render: (item) => (
                <span className="font-mono font-bold text-amber-400">
                  {item.tsunamiMagnitude ? `Mw ${item.tsunamiMagnitude}` : 'N/A'}
                </span>
              )
            },
            {
              key: 'maximumWaterHeightM',
              header: 'Max Run-up',
              render: (item) => (
                <span className="font-mono text-cyan-300">
                  {item.maximumWaterHeightM ? `${item.maximumWaterHeightM} m` : 'N/A'}
                </span>
              )
            },
            {
              key: 'fatalitiesEstimate',
              header: 'Direct Fatalities',
              render: (item) => <span className="font-mono text-slate-300">{item.fatalitiesEstimate || 'Unknown'}</span>
            }
          ]}
        />
      </div>
    </div>
  );
};
