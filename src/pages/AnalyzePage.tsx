/**
 * TSUNAMISENSE AI - Core Tsunami Risk Detector & AI Scientific Analyst Interface
 * 
 * Accepts earthquake parameters (magnitude, depth, latitude, longitude)
 * via interactive map clicks or manual coordinate input, and orchestrates:
 * 1. Validates inputs & updates map selection marker
 * 2. Runs trained ML model via POST /api/predict -> RiskAssessment
 * 3. Highlights actual risk score/level on map with subtle visual pulse
 * 4. Requests Gemini 3.6 Flash scientific explanation via POST /api/ai/explain
 * 5. Provides interactive Q&A via POST /api/ai/analyze
 */

import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bookmark,
  BarChart3,
  ListChecks,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  ShieldCheck,
  MapPin,
  X,
  Compass,
  Navigation,
  Layers
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Input } from '../components/ui/Input';
import { InteractiveMap } from '../components/InteractiveMap';
import { useApp } from '../context/AppContext';
import { riskService } from '../services/risk/riskService';
import { RiskAssessment, GeminiExplanation, RiskLevel } from '../ml/types';
import { VERIFIED_HISTORICAL_PRESETS } from '../ml/dataset/datasetManager';
import { FeatureExtractor } from '../ml/features/featureExtractor';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AnalyzePage: React.FC = () => {
  const {
    analysisInput,
    setAnalysisInput,
    validationErrors,
    validateCurrentInput,
    clearAnalysisInput
  } = useApp();

  // Primary State
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [aiExplanation, setAiExplanation] = useState<GeminiExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [showModelDetails, setShowModelDetails] = useState<boolean>(false);

  // Q&A Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);

  // Map selection callback
  const handleLocationSelected = (lat: number, lng: number, locName?: string) => {
    setAnalysisInput((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      locationName: locName || prev.locationName || `Epicenter (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`
    }));
    setSelectedPresetId(''); // Clear preset highlight if map clicked
  };

  const handleClearLocation = () => {
    clearAnalysisInput();
    setSelectedPresetId('');
    setAssessment(null);
    setAiExplanation(null);
  };

  const handleInputChange = (field: keyof typeof analysisInput, value: any) => {
    setAnalysisInput((prev) => ({ ...prev, [field]: value }));
    setSelectedPresetId(''); // clear preset highlight if user edits parameters
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = VERIFIED_HISTORICAL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setAnalysisInput({
      magnitude: preset.magnitude,
      depthKm: preset.depth_km,
      latitude: preset.latitude,
      longitude: preset.longitude,
      locationName: preset.location
    });
  };

  const handleRunDetector = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateCurrentInput();
    if (!isValid) return;

    setIsPredicting(true);
    setIsExplaining(false);
    setAiExplanation(null);
    setAiError(null);
    setChatMessages([]);

    try {
      // Step 1: Validation & Model Prediction
      setLoadingStep('Validating seismic parameters...');
      await new Promise((r) => setTimeout(r, 150));

      setLoadingStep('Running ML risk model...');
      const riskAssessment = await riskService.evaluateRiskAssessment(analysisInput);
      
      setLoadingStep('Generating assessment...');
      await new Promise((r) => setTimeout(r, 100));
      
      setAssessment(riskAssessment);
      setIsPredicting(false);

      // Step 2: Gemini Scientific Explanation
      setIsExplaining(true);
      setLoadingStep('Generating Gemini scientific explanation...');

      const matchedPreset = VERIFIED_HISTORICAL_PRESETS.find((p) => p.id === selectedPresetId);
      const historicalContextStr = matchedPreset
        ? `Historical Benchmark Event: ${matchedPreset.event_name} (${matchedPreset.date}). Verified Tsunami: ${matchedPreset.historical_tsunami_verified ? 'YES' : 'NO'}. Max Water Height: ${matchedPreset.max_water_height_m || 'N/A'}m.`
        : undefined;

      const aiRes = await riskService.getAIExplanation(riskAssessment, historicalContextStr);

      if (aiRes.success && aiRes.explanation) {
        setAiExplanation(aiRes.explanation);
      } else {
        setAiError(aiRes.error || 'AI explanation temporarily unavailable.');
      }
    } catch (err: any) {
      console.error('Error running Tsunami Risk Detector:', err);
      setAiError(err?.message || 'Error executing risk prediction.');
    } finally {
      setIsPredicting(false);
      setIsExplaining(false);
      setLoadingStep('');
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionInput.trim() || !assessment || isAsking) return;

    const userQ = questionInput.trim();
    setQuestionInput('');
    
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: userQ,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);

    const matchedPreset = VERIFIED_HISTORICAL_PRESETS.find((p) => p.id === selectedPresetId);
    const historicalContextStr = matchedPreset
      ? `Historical Benchmark Event: ${matchedPreset.event_name}`
      : undefined;

    const aiRes = await riskService.askAIAnalyst(userQ, assessment, historicalContextStr);

    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      sender: 'assistant',
      text: aiRes.success && aiRes.answer ? aiRes.answer : (aiRes.error || 'AI Analyst is temporarily unavailable.'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, botMsg]);
    setIsAsking(false);
  };

  // Helper to colorize risk categories
  const getRiskCategoryStyle = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/80',
          border: 'border-red-500',
          text: 'text-red-400',
          badge: 'bg-red-500 text-slate-950 font-bold'
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-950/70',
          border: 'border-rose-500',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-slate-950 font-bold'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/70',
          border: 'border-amber-500',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-950 font-bold'
        };
      case 'GUARDED':
        return {
          bg: 'bg-yellow-950/60',
          border: 'border-yellow-600',
          text: 'text-yellow-300',
          badge: 'bg-yellow-500 text-slate-950 font-bold'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-600',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500 text-slate-950 font-bold'
        };
    }
  };

  const parsedLat = typeof analysisInput.latitude === 'number' ? analysisInput.latitude : parseFloat(analysisInput.latitude as string);
  const parsedLng = typeof analysisInput.longitude === 'number' ? analysisInput.longitude : parseFloat(analysisInput.longitude as string);
  const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

  // Compute live trench distance for form badge
  const trenchDist = hasValidCoords ? FeatureExtractor.calculateDistanceToTrenchKm(parsedLat, parsedLng) : null;

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <SectionHeader
        title="Interactive Location-Based Tsunami Risk Analysis"
        subtitle="Click any location on the interactive ocean map or enter coordinates manually to evaluate tsunami generation risk using trained statistical ML models and Gemini scientific analysis."
        badge={<StatusBadge label="REAL-TIME MAP & ML DETECTOR ACTIVE" variant="success" size="sm" pulse />}
      />

      {/* VERIFIED HISTORICAL BENCHMARK PRESETS (DEMO MODE) */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              <span className="font-display font-semibold text-sm text-slate-200">
                Verified Historical Benchmarks (Quick Preset Selector)
              </span>
            </div>
            <StatusBadge label="USGS / NOAA CATALOG" variant="info" size="sm" />
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Select a verified historical earthquake record from the catalog to auto-populate coordinates on the map and test ML predictions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VERIFIED_HISTORICAL_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200 line-clamp-1">
                      {preset.event_name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        preset.historical_tsunami_verified
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {preset.historical_tsunami_verified ? 'TSUNAMI' : 'NO TSUNAMI'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="text-cyan-400 font-bold">Mw {preset.magnitude}</span>
                    <span>{preset.depth_km} km</span>
                    <span>{preset.date}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* CORE WORKFLOW: REAL MAP + SEISMIC INPUT FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / TOP COLUMN: INTERACTIVE GEOGRAPHIC MAP */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-semibold text-sm text-slate-200">
                    1. Select Epicenter Location on Map
                  </span>
                </div>
                <StatusBadge label="INTERACTIVE MAP CLICK" variant="accent" size="sm" pulse />
              </div>
            }
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Click or tap anywhere on the real-world ocean map below to capture exact latitude and longitude coordinates.
              </p>
              <InteractiveMap
                selectedLat={hasValidCoords ? parsedLat : null}
                selectedLng={hasValidCoords ? parsedLng : null}
                onSelectLocation={handleLocationSelected}
                onClearLocation={handleClearLocation}
                activeAssessment={assessment}
                height="h-[480px]"
              />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: SEISMIC PARAMETER INPUTS FORM */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-semibold text-sm text-slate-200">
                    2. Earthquake Parameters Form
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {hasValidCoords && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearLocation}
                      title="Clear location"
                    >
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-rose-400 font-mono">Clear</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearAnalysisInput();
                      setSelectedPresetId('');
                      setAssessment(null);
                    }}
                    title="Reset parameters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            }
          >
            <form onSubmit={handleRunDetector} className="space-y-5">
              {/* Selected Location Banner */}
              {hasValidCoords ? (
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-cyan-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      SELECTED LOCATION
                    </span>
                    <span className="text-[10px] text-cyan-400/80 bg-cyan-900/60 px-2 py-0.5 rounded">
                      SYNCHRONIZED
                    </span>
                  </div>
                  <div className="text-slate-200 grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>Lat: <strong className="text-cyan-400">{parsedLat.toFixed(6)}°</strong></div>
                    <div>Lon: <strong className="text-cyan-400">{parsedLng.toFixed(6)}°</strong></div>
                  </div>
                  {trenchDist !== null && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-cyan-900/60">
                      Subduction Trench Distance: <strong className="text-slate-200">{trenchDist} km</strong> ({trenchDist <= 250 ? 'Active Trench Zone' : 'Standard Boundary'})
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Click map to extract coordinates or type manually below.</span>
                </div>
              )}

              {/* Location Description */}
              <Input
                label="Location / Region Description"
                placeholder="e.g. Near East Coast of Honshu, Japan"
                value={analysisInput.locationName || ''}
                onChange={(e) => handleInputChange('locationName', e.target.value)}
                error={validationErrors.locationName}
                helperText="Geographical reference name or auto-populated map region."
              />

              {/* Magnitude & Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Moment Magnitude (Mw)"
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={analysisInput.magnitude}
                  onChange={(e) =>
                    handleInputChange(
                      'magnitude',
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  error={validationErrors.magnitude}
                  helperText="Range: 1.0 to 10.0"
                  rightBadge={
                    <span className="text-cyan-400 font-bold">{analysisInput.magnitude || '--'}</span>
                  }
                  mono
                  required
                />

                <Input
                  label="Focal Depth (km)"
                  type="number"
                  step="1"
                  min="0"
                  max="1000"
                  value={analysisInput.depthKm}
                  onChange={(e) =>
                    handleInputChange(
                      'depthKm',
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  error={validationErrors.depthKm}
                  helperText="Shallow < 50km, Deep > 300km"
                  rightBadge={
                    <span className="text-cyan-400 font-bold">
                      {analysisInput.depthKm !== '' ? `${analysisInput.depthKm} km` : '--'}
                    </span>
                  }
                  mono
                  required
                />
              </div>

              {/* Latitude & Longitude (Manual & Map Synchronized) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Latitude (°N / °S)"
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={analysisInput.latitude}
                  onChange={(e) =>
                    handleInputChange(
                      'latitude',
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  error={validationErrors.latitude}
                  helperText="Range: -90° to +90°"
                  mono
                  required
                />

                <Input
                  label="Longitude (°E / °W)"
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={analysisInput.longitude}
                  onChange={(e) =>
                    handleInputChange(
                      'longitude',
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  error={validationErrors.longitude}
                  helperText="Range: -180° to +180°"
                  mono
                  required
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full font-mono font-bold"
                  leftIcon={
                    isPredicting || isExplaining ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Cpu className="w-5 h-5" />
                    )
                  }
                  disabled={isPredicting || isExplaining}
                >
                  {isPredicting || isExplaining
                    ? loadingStep || 'ANALYZING EVENT...'
                    : 'ANALYZE EVENT & CALCULATE RISK'}
                </Button>
              </div>
            </form>
          </Card>

          {/* RESEARCH DISCLAIMER */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300 font-mono uppercase">Research & Decision Support Notice:</strong>
              <p className="mt-1">
                TsunamiSense AI risk scores are generated by trained statistical machine learning models (Logistic Regression & Random Forest Ensembles) and explained by Gemini 3.6 Flash. They represent empirical risk estimates and are NOT official tsunami warnings issued by NOAA, USGS, or PTWC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY PANEL */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        {isPredicting ? (
          <div className="min-h-[380px] rounded-2xl bg-slate-900/60 border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div className="space-y-1">
              <h3 className="font-mono font-bold text-slate-200">{loadingStep}</h3>
              <p className="text-xs text-slate-400">Processing seismic vectors through ML risk pipeline...</p>
            </div>
          </div>
        ) : assessment ? (
          <div className="space-y-6">
            {/* 1. SECTION: MODEL ASSESSMENT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-bold text-xs text-slate-200 uppercase tracking-wider">
                    ACTUAL ML TSUNAMI GENERATION RISK RESULT
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                  Calculated by ML Model
                </span>
              </div>

              {/* PRIMARY RISK SCORE CARD */}
              <div
                className={`p-6 rounded-2xl border transition-all ${
                  getRiskCategoryStyle(assessment.risk.level).bg
                } ${getRiskCategoryStyle(assessment.risk.level).border}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                      TSUNAMI GENERATION RISK
                    </span>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-5xl font-mono font-extrabold text-white">
                        {assessment.risk.score}
                      </span>
                      <span className="text-xl font-mono text-slate-300">/ 100</span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-mono tracking-wide uppercase ${
                      getRiskCategoryStyle(assessment.risk.level).badge
                    }`}
                  >
                    {assessment.risk.level} RISK
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px]">LOCATION</span>
                    <span className="text-cyan-300 font-bold text-xs">
                      {assessment.event.latitude.toFixed(4)}°, {assessment.event.longitude.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">EARTHQUAKE</span>
                    <span className="text-slate-200 font-bold text-xs">
                      Mw {assessment.event.magnitude} ({assessment.event.depth_km} km depth)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">MODEL PROBABILITY</span>
                    <span className="text-cyan-300 font-bold text-xs">
                      {(assessment.risk.model_probability * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">TRAINED MODEL</span>
                    <span className="text-slate-200 font-bold text-xs">
                      {assessment.model.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTRIBUTING FACTORS BREAKDOWN */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-cyan-400" />
                    <span className="font-display font-semibold text-sm text-slate-200">
                      Why This Risk? Model Feature Factor Decomposition
                    </span>
                  </div>
                }
              >
                <div className="space-y-3">
                  {assessment.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-200">
                          {factor.factor_name}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-cyan-300 font-semibold">{factor.raw_value}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              factor.impact_direction === 'INCREASES_RISK'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : factor.impact_direction === 'REDUCES_RISK'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {factor.impact_direction === 'INCREASES_RISK'
                              ? `+${factor.impact_percentage}% RISK`
                              : factor.impact_direction === 'REDUCES_RISK'
                              ? `-${factor.impact_percentage}% RISK`
                              : 'NEUTRAL'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal font-sans">
                        {factor.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* CALCULATED DERIVED DOMAIN FEATURES */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span className="font-display font-semibold text-sm text-slate-200">
                      Calculated Spatial & Physics Domain Features
                    </span>
                  </div>
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">TRENCH DISTANCE</span>
                    <span className="text-cyan-300 font-bold">
                      {assessment.engineered_features.distance_to_trench_km} km
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">SUBDUCTION SETTING</span>
                    <span className="text-slate-200 font-bold">
                      {assessment.engineered_features.is_subduction_zone ? 'YES (Active)' : 'NO'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ENERGY-DEPTH RATIO</span>
                    <span className="text-slate-200 font-bold">
                      {assessment.engineered_features.energy_depth_ratio}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">REGIONAL TSUNAMI DENSITY</span>
                    <span className="text-slate-200 font-bold">
                      {assessment.engineered_features.historical_tsunami_density} events
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">OFFSHORE ESTIMATE</span>
                    <span className="text-slate-200 font-bold">
                      {assessment.engineered_features.is_offshore ? 'OFFSHORE' : 'INLAND / COASTAL'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">EPICENTER LAT / LNG</span>
                    <span className="text-slate-200 font-bold text-[11px]">
                      {`${assessment.event.latitude.toFixed(4)}°, ${assessment.event.longitude.toFixed(4)}°`}
                    </span>
                  </div>
                </div>
              </Card>

              {/* MODEL METRICS TOGGLE */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowModelDetails(!showModelDetails)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>
                    {showModelDetails
                      ? 'Hide Validation Metrics & Model Details'
                      : 'Show Validation Metrics & Model Details'}
                  </span>
                </button>

                {showModelDetails && assessment.model.metrics && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
                    <h4 className="font-bold text-slate-200 uppercase">
                      Selected Model Test Performance Metrics ({assessment.model.name})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">PRECISION</span>
                        <span className="text-emerald-400 font-bold">
                          {(assessment.model.metrics.precision * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">RECALL</span>
                        <span className="text-emerald-400 font-bold">
                          {(assessment.model.metrics.recall * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">F1 SCORE</span>
                        <span className="text-cyan-400 font-bold">
                          {assessment.model.metrics.f1_score.toFixed(3)}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">ROC-AUC</span>
                        <span className="text-cyan-400 font-bold">
                          {assessment.model.metrics.roc_auc.toFixed(3)}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">PR-AUC</span>
                        <span className="text-cyan-400 font-bold">
                          {assessment.model.metrics.pr_auc.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. SECTION: AI ANALYST ("Why This Risk?") */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono font-bold text-xs text-slate-200 uppercase tracking-wider">
                    AI SCIENTIFIC ANALYST ("WHY THIS RISK?")
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  AI explanation based on model output
                </span>
              </div>

              {isExplaining ? (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-300">
                    Generating scientific explanation via Gemini 3.6 Flash...
                  </span>
                </div>
              ) : aiExplanation ? (
                <Card
                  header={
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="font-display font-semibold text-sm text-slate-200">
                        Gemini Scientific Risk Explanation
                      </span>
                    </div>
                  }
                >
                  <div className="space-y-4 text-xs leading-relaxed">
                    {/* Executive Summary */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-900/60 text-cyan-200">
                      <strong className="font-mono text-[11px] text-cyan-400 block uppercase mb-1">
                        Executive Summary
                      </strong>
                      <p>{aiExplanation.summary}</p>
                    </div>

                    {/* Scientific Interpretation */}
                    <div>
                      <strong className="font-mono text-slate-300 text-[11px] uppercase block mb-1">
                        Scientific Interpretation
                      </strong>
                      <p className="text-slate-300">{aiExplanation.risk_interpretation}</p>
                    </div>

                    {/* Key Driving Factors */}
                    <div>
                      <strong className="font-mono text-slate-300 text-[11px] uppercase block mb-1.5">
                        Key Contributing Drivers
                      </strong>
                      <ul className="space-y-1 pl-4 list-disc text-slate-300">
                        {aiExplanation.key_factors.map((kf, i) => (
                          <li key={i}>{kf}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Sources of Uncertainty */}
                    <div>
                      <strong className="font-mono text-amber-400 text-[11px] uppercase block mb-1">
                        Key Physical Uncertainties
                      </strong>
                      <p className="text-slate-300">{aiExplanation.uncertainty}</p>
                    </div>

                    {/* Recommended Verification Steps */}
                    <div>
                      <strong className="font-mono text-emerald-400 text-[11px] uppercase block mb-1.5">
                        Recommended Actionable Verifications
                      </strong>
                      <ul className="space-y-1 pl-4 list-disc text-slate-300">
                        {aiExplanation.recommended_verification.map((rv, i) => (
                          <li key={i}>{rv}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Disclaimer */}
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                      {aiExplanation.disclaimer}
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/50 flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{aiError || 'AI explanation temporarily unavailable.'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    ✓ Model assessment available
                  </span>
                </div>
              )}

              {/* 3. INTERACTIVE AI ANALYST Q&A PANEL */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span className="font-display font-semibold text-sm text-slate-200">
                      Ask the AI Scientific Analyst
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Have questions about this event, model risk drivers, or uncertainties? Ask the AI Analyst below:
                  </p>

                  {/* Chat Messages List */}
                  {chatMessages.length > 0 && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            msg.sender === 'user'
                              ? 'bg-cyan-950/60 border border-cyan-800/80 text-cyan-100 ml-6'
                              : 'bg-slate-900/90 border border-slate-800 text-slate-200 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                            <span>{msg.sender === 'user' ? 'YOU' : 'AI SCIENTIFIC ANALYST'}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Q&A Input */}
                  <form onSubmit={handleAskQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Why is shallow depth so critical for tsunami generation?"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      disabled={isAsking}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isAsking || !questionInput.trim()}
                      leftIcon={
                        isAsking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )
                      }
                    >
                      Ask
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] rounded-2xl bg-slate-900/40 border border-slate-800 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
              <Cpu className="w-8 h-8 text-cyan-400/60" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-display font-semibold text-slate-200">
                Ready to Evaluate Tsunami Risk
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click a location on the interactive map or enter earthquake parameters on the form above to run the ML Risk Detector.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
