/**
 * TSUNAMISENSE AI — Machine Learning Engine & Risk Detector Types
 */

export interface EarthquakeMLRecord {
  id: string;
  source: 'USGS_FDSN' | 'NOAA_NCEI' | 'USGS_HISTORICAL_CATALOG';
  retrieved_at: string;
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  location: string;
  event_time: string;
  /** Binary target label: 1 = Tsunamigenic, 0 = Non-tsunamigenic */
  tsunami_label: number;
  /** Provenance metadata describing label source */
  label_provenance: string;
}

export interface ExtractedFeatures {
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  distance_to_trench_km: number;
  is_subduction_zone: number; // 0 or 1
  is_offshore: number; // 0 or 1
  historical_tsunami_density: number; // count of nearby historical events
  energy_depth_ratio: number; // Mw / ln(depth_km + 2)
}

export type FeatureKey = keyof ExtractedFeatures;

export interface ScalerParams {
  means: Record<FeatureKey, number>;
  stds: Record<FeatureKey, number>;
}

export interface ModelEvaluationMetrics {
  confusion_matrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  total_samples: number;
  train_samples: number;
  test_samples: number;
}

export interface ModelComparisonResult {
  model_name: 'Logistic Regression' | 'Random Forest' | 'Gradient Boosting';
  metrics: ModelEvaluationMetrics;
  is_selected: boolean;
  feature_importances: Record<string, number>;
}

export interface ModelArtifact {
  model_version: string;
  trained_at: string;
  selected_model_name: string;
  dataset_metadata: {
    total_records: number;
    tsunamigenic_records: number;
    non_tsunamigenic_records: number;
    sources_used: string[];
  };
  feature_keys: FeatureKey[];
  scaler_params: ScalerParams;
  weights?: Record<string, number>; // For Logistic Regression
  bias?: number;
  tree_structures?: any[]; // For Random Forest / Gradient Boosting
  evaluation_metrics: ModelEvaluationMetrics;
  all_model_comparisons: ModelComparisonResult[];
}

export interface ContributingFactor {
  feature_key: string;
  factor_name: string;
  raw_value: string;
  impact_direction: 'INCREASES_RISK' | 'REDUCES_RISK' | 'NEUTRAL';
  impact_percentage: number;
  rationale: string;
}

export type RiskLevel = 'LOW' | 'GUARDED' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface TsunamiRiskPrediction {
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  model_probability: number; // 0.00 to 1.00
  model_version: string;
  selected_model_name: string;
  evaluation_metrics: ModelEvaluationMetrics;
  features_calculated: ExtractedFeatures;
  contributing_factors: ContributingFactor[];
  disclaimer: string;
  timestamp: string;
  input_parameters: {
    magnitude: number;
    depth_km: number;
    latitude: number;
    longitude: number;
    location_name?: string;
  };
}

export interface RiskAssessment {
  event: {
    magnitude: number;
    depth_km: number;
    latitude: number;
    longitude: number;
    location_name?: string | null;
  };
  risk: {
    score: number; // 0 - 100
    level: RiskLevel;
    model_probability: number; // 0.00 to 1.00
  };
  model: {
    name: string;
    version: string;
    metrics?: ModelEvaluationMetrics;
  };
  engineered_features: ExtractedFeatures;
  factors: ContributingFactor[];
  limitations: string[];
  generated_at: string;
}

export interface GeminiExplanation {
  summary: string;
  risk_interpretation: string;
  key_factors: string[];
  uncertainty: string;
  recommended_verification: string[];
  disclaimer: string;
}

export interface HistoricalDemoPreset {
  id: string;
  event_name: string;
  date: string;
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  location: string;
  historical_tsunami_verified: boolean;
  max_water_height_m?: number;
  historical_fatalities?: string;
  source: string;
}
