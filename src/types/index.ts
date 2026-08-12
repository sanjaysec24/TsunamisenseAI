/**
 * TSUNAMISENSE AI - Core Domain Types & Data Contracts
 * 
 * Defines domain models for Earthquakes, Tsunamis, Risk Assessments,
 * Ocean Observations, API Contracts, Map Layers, and Application State.
 */

export type AppRoute = 
  | '/'
  | '/monitor'
  | '/data-engine'
  | '/analyze'
  | '/map'
  | '/history'
  | '/analyst'
  | '/methodology'
  | '/about';

export type IntegrationPhase = 
  | 'Phase 0 — Product Foundation'
  | 'Phase 1 — Data Engine'
  | 'Phase 2 — ML Engine'
  | 'Phase 3 — Intelligence Engine'
  | 'Phase 4 — Gemini Analyst'
  | 'Phase 5 — Backend & API'
  | 'Phase 6 — Real-Time Pipeline'
  | 'Phase 7 — Advanced Visualizations'
  | 'Phase 8 — Validation & Demo';

export interface SystemStatus {
  phase: string;
  systemReady: boolean;
  dataEngineConnected: boolean;
  mlEngineConnected: boolean;
  geminiConnected: boolean;
  lastHealthCheck: string;
}

// ==========================================
// 1. DOMAIN TYPES
// ==========================================

export type DepthCategory = 'Shallow' | 'Intermediate' | 'Deep';
export type MagnitudeType = 'Mw' | 'Mwc' | 'Mww' | 'Mb' | 'Ms';

export interface EarthquakeEvent {
  id: string;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  eventTime: string; // ISO String
  location: string;
  magnitudeType: MagnitudeType;
  eventType: 'Earthquake' | 'Subduction Megathrust' | 'Volcanic' | 'Intraslab';
  depthCategory?: DepthCategory;
  tectonicSetting?: string;
  focalMechanism?: 'Reverse / Thrust' | 'Normal' | 'Strike-Slip' | 'Unknown';
  tsunamiWarningFlag?: boolean;
  status: 'VERIFIED' | 'PRELIMINARY' | 'UNPROCESSED';
  usgsUrl?: string;
}

export interface TsunamiEvent {
  id: string;
  eventTime: string;
  latitude: number;
  longitude: number;
  cause: 'Subduction Earthquake' | 'Submarine Volcanic Eruption' | 'Submarine Landslide' | 'Unknown';
  tsunamiMagnitude?: number;
  maximumWaterHeightM?: number;
  runupHeightM?: number;
  affectedRegion: string;
  sourceEarthquakeId?: string;
  fatalitiesEstimate?: string;
  summary?: string;
}

export type RiskLevel = 'PENDING' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface RiskContributingFactor {
  factorName: string;
  weight: number; // 0.0 - 1.0
  description: string;
  status: 'COMPUTED' | 'AWAITING_MODEL';
}

export interface RiskAssessment {
  id: string;
  earthquakeId: string;
  riskScore: number | null; // 0.0 to 100.0, null when un-analyzed
  riskLevel: RiskLevel;
  confidence: number | null; // 0.0 to 1.0, null when un-analyzed
  modelVersion: string;
  contributingFactors: RiskContributingFactor[];
  generatedAt: string;
  status: 'AWAITING_ML_ENGINE' | 'COMPUTED' | 'DISCONNECTED';
  message: string;
}

export type OceanMeasurementType = 'WATER_COLUMN_HEIGHT' | 'PRESSURE_PASCAL' | 'SEA_SURFACE_TEMP';

export interface OceanObservation {
  stationId: string;
  stationCode: string;
  stationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  measurement: number | null; // Null when not connected
  measurementType: OceanMeasurementType;
  unit: string;
  status: 'AWAITING_INTEGRATION' | 'ONLINE' | 'OFFLINE';
  oceanRegion: string;
}

// ==========================================
// 2. INPUT & FORM TYPES
// ==========================================

export interface EarthquakeInput {
  magnitude: number | '';
  depthKm: number | '';
  latitude: number | '';
  longitude: number | '';
  locationName?: string;
  tectonicSetting?: string;
  focalMechanism?: string;
}

export interface EarthquakeValidationError {
  magnitude?: string;
  depthKm?: string;
  latitude?: string;
  longitude?: string;
  locationName?: string;
  general?: string;
}

// ==========================================
// 3. MAP ARCHITECTURE LAYER TYPES
// ==========================================

export interface MapLayerConfig {
  id: 'earthquakes' | 'historical_tsunamis' | 'risk_assessments' | 'ocean_stations' | 'tectonic_context';
  label: string;
  description: string;
  visible: boolean;
  status: 'AWAITING_PHASE_1' | 'AWAITING_PHASE_2' | 'ACTIVE';
  count?: number;
}

// ==========================================
// 4. API CONTRACT TYPES
// ==========================================

export interface PredictApiRequest {
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  focalMechanism?: string;
}

export interface PredictApiResponse {
  status: 'DISCONNECTED' | 'SUCCESS';
  message: string;
  data: RiskAssessment | null;
  phase: 'Phase 2 Required';
}

export interface EventsApiQuery {
  minMagnitude?: number;
  startTime?: string;
  limit?: number;
}

export interface EventsApiResponse {
  status: 'DISCONNECTED' | 'SUCCESS';
  message: string;
  count: number;
  events: EarthquakeEvent[];
}

export interface HistoricalApiQuery {
  region?: string;
  minMagnitude?: number;
  startYear?: number;
}

export interface HistoricalApiResponse {
  status: 'SUCCESS' | 'DISCONNECTED';
  message: string;
  count: number;
  events: TsunamiEvent[];
}

export interface OceanObservationsResponse {
  status: 'DISCONNECTED' | 'SUCCESS';
  message: string;
  count: number;
  stations: OceanObservation[];
}

export interface AIExplainApiRequest {
  query: string;
  eventContext?: EarthquakeInput | EarthquakeEvent;
}

export interface AIExplainApiResponse {
  status: 'DISCONNECTED' | 'SUCCESS';
  message: string;
  explanation: string | null;
  phase: 'Phase 4 Required';
}

export interface HealthApiResponse {
  status: 'OK';
  timestamp: string;
  services: {
    dataEngine: boolean;
    mlEngine: boolean;
    geminiAnalyst: boolean;
  };
}

// ==========================================
// 5. APPLICATION STATE TYPES
// ==========================================

export interface GlobalState {
  currentRoute: AppRoute;
  selectedEventId: string | null;
  mapLayers: MapLayerConfig[];
  systemStatus: SystemStatus;
}

export interface HistoryFilterState {
  searchQuery: string;
  region: string;
  minMagnitude: number;
}

export interface AnalystConversationState {
  queries: Array<{
    id: string;
    timestamp: string;
    question: string;
    status: 'PHASE_4_PENDING';
  }>;
}
