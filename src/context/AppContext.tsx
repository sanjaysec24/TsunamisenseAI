/**
 * TSUNAMISENSE AI - Application State Provider
 * 
 * Central React Context managing application state across routes:
 * - Selected event & GIS map layer toggles
 * - Earthquake analysis form state & validation errors
 * - History filters
 * - AI Analyst conversation history
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  AppRoute,
  EarthquakeInput,
  EarthquakeValidationError,
  MapLayerConfig,
  SystemStatus,
  HistoryFilterState
} from '../types';
import { RiskAssessment, GeminiExplanation } from '../ml/types';
import { geospatialService } from '../services/geospatial/geospatialService';
import { SystemStatusService } from '../services/system/systemStatusService';
import { validateEarthquakeInput } from '../lib/validation/earthquakeValidation';
import { riskService } from '../services/risk/riskService';
import { PredictionService } from '../services/predictionService';

interface AppContextType {
  // Navigation & System Status
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  systemStatus: SystemStatus;

  // Selected Event & Map Layers
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  mapLayers: MapLayerConfig[];
  toggleMapLayer: (id: string) => void;

  // Analysis Form & Validation
  analysisInput: EarthquakeInput;
  setAnalysisInput: React.Dispatch<React.SetStateAction<EarthquakeInput>>;
  validationErrors: EarthquakeValidationError;
  validateCurrentInput: () => boolean;
  clearAnalysisInput: () => void;

  // Active ML Risk Assessment & Gemini Explanation
  activeAssessment: RiskAssessment | null;
  activeExplanation: GeminiExplanation | null;
  setActiveAssessment: (assessment: RiskAssessment | null) => void;
  setActiveExplanation: (explanation: GeminiExplanation | null) => void;
  runAnalysis: (input: EarthquakeInput) => Promise<{ assessment: RiskAssessment; explanation: GeminiExplanation | null }>;

  // History Page State
  historyFilters: HistoryFilterState;
  setHistoryFilters: React.Dispatch<React.SetStateAction<HistoryFilterState>>;

  // Analyst State
  analystQueries: Array<{ id: string; timestamp: string; question: string; response?: string; status: 'COMPLETED' | 'PENDING' }>;
  addAnalystQuery: (question: string, response?: string) => void;
}

const defaultInput: EarthquakeInput = {
  magnitude: 7.8,
  depthKm: 22,
  latitude: 3.3,
  longitude: 95.8,
  locationName: 'Sumatra Subduction Zone',
  tectonicSetting: 'Subduction Zone (Megathrust)',
  focalMechanism: 'Reverse / Thrust'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/');
  const [systemStatus] = useState<SystemStatus>(SystemStatusService.getSystemStatus());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [mapLayers, setMapLayers] = useState<MapLayerConfig[]>(
    geospatialService.getDefaultMapLayers()
  );

  const [analysisInput, setAnalysisInput] = useState<EarthquakeInput>(defaultInput);
  const [validationErrors, setValidationErrors] = useState<EarthquakeValidationError>({});

  // Global Active Assessment & Explanation
  const [activeAssessment, setActiveAssessment] = useState<RiskAssessment | null>(null);
  const [activeExplanation, setActiveExplanation] = useState<GeminiExplanation | null>(null);

  const [historyFilters, setHistoryFilters] = useState<HistoryFilterState>({
    searchQuery: '',
    region: 'ALL',
    minMagnitude: 0
  });

  const [analystQueries, setAnalystQueries] = useState<
    Array<{ id: string; timestamp: string; question: string; response?: string; status: 'COMPLETED' | 'PENDING' }>
  >([]);

  const toggleMapLayer = (id: string) => {
    setMapLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, visible: !layer.visible } : layer))
    );
  };

  const validateCurrentInput = (): boolean => {
    const { isValid, errors } = validateEarthquakeInput(analysisInput);
    setValidationErrors(errors);
    return isValid;
  };

  const clearAnalysisInput = () => {
    setAnalysisInput({
      magnitude: '',
      depthKm: '',
      latitude: '',
      longitude: '',
      locationName: '',
      tectonicSetting: '',
      focalMechanism: ''
    });
    setValidationErrors({});
  };

  const runAnalysis = async (input: EarthquakeInput) => {
    // 1. Run ML Model
    const assessment = await riskService.evaluateRiskAssessment(input);
    setActiveAssessment(assessment);

    // 2. Fetch Gemini Explanation
    let explanation: GeminiExplanation | null = null;
    try {
      const explainRes = await riskService.getAIExplanation(assessment);
      if (explainRes.success && explainRes.explanation) {
        explanation = explainRes.explanation;
        setActiveExplanation(explanation);
      }
    } catch (err) {
      console.warn('Gemini explanation fetch failed:', err);
    }

    return { assessment, explanation };
  };

  const addAnalystQuery = (question: string, response?: string) => {
    const newQuery = {
      id: `query-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      question,
      response,
      status: (response ? 'COMPLETED' : 'PENDING') as 'COMPLETED' | 'PENDING'
    };
    setAnalystQueries((prev) => [newQuery, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        systemStatus,
        selectedEventId,
        setSelectedEventId,
        mapLayers,
        toggleMapLayer,
        analysisInput,
        setAnalysisInput,
        validationErrors,
        validateCurrentInput,
        clearAnalysisInput,
        activeAssessment,
        activeExplanation,
        setActiveAssessment,
        setActiveExplanation,
        runAnalysis,
        historyFilters,
        setHistoryFilters,
        analystQueries,
        addAnalystQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
