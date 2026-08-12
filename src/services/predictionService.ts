/**
 * TSUNAMISENSE AI — Centralized Prediction Service
 * 
 * Conceptually runs:
 * analyzeEarthquake(event)
 *   ↓
 * validateInput()
 *   ↓
 * engineerFeatures()
 *   ↓
 * predict()
 *   ↓
 * createRiskAssessment()
 */

import { RiskAssessment, TsunamiRiskPrediction } from '../ml/types';
import { Preprocessor } from '../ml/preprocessing/preprocessor';
import { TsunamiRiskPredictor } from '../ml/predictor';

export interface EarthquakeAnalysisInput {
  magnitude: number;
  depth_km: number;
  latitude: number;
  longitude: number;
  location_name?: string | null;
}

export class PredictionService {
  /**
   * Main reusable prediction workflow returning a structured RiskAssessment object.
   */
  static analyzeEarthquake(input: EarthquakeAnalysisInput): RiskAssessment {
    // 1. Validate Input
    if (input.magnitude === undefined || input.magnitude === null || isNaN(Number(input.magnitude))) {
      throw new Error('Validation Error: Magnitude is required and must be a valid number.');
    }
    if (input.depth_km === undefined || input.depth_km === null || isNaN(Number(input.depth_km))) {
      throw new Error('Validation Error: Depth (km) is required and must be a valid number.');
    }
    if (input.latitude === undefined || input.latitude === null || isNaN(Number(input.latitude))) {
      throw new Error('Validation Error: Latitude is required and must be a valid number.');
    }
    if (input.longitude === undefined || input.longitude === null || isNaN(Number(input.longitude))) {
      throw new Error('Validation Error: Longitude is required and must be a valid number.');
    }

    const mag = Number(input.magnitude);
    const depth = Number(input.depth_km);
    const lat = Number(input.latitude);
    const lng = Number(input.longitude);

    const validation = Preprocessor.validateInput(mag, depth, lat, lng);
    if (!validation.isValid) {
      throw new Error(`Validation Error: ${validation.error}`);
    }

    // 2. Predict via ML Model
    const prediction: TsunamiRiskPrediction = TsunamiRiskPredictor.predict(
      mag,
      depth,
      lat,
      lng,
      input.location_name || undefined
    );

    // 3. Create Structured RiskAssessment Object
    const assessment: RiskAssessment = {
      event: {
        magnitude: mag,
        depth_km: depth,
        latitude: lat,
        longitude: lng,
        location_name: input.location_name || null
      },
      risk: {
        score: prediction.risk_score,
        level: prediction.risk_level,
        model_probability: prediction.model_probability
      },
      model: {
        name: prediction.selected_model_name,
        version: prediction.model_version,
        metrics: prediction.evaluation_metrics
      },
      engineered_features: prediction.features_calculated,
      factors: prediction.contributing_factors,
      limitations: [
        'TsunamiSense AI is a research/decision-support prototype and NOT an official tsunami warning authority.',
        'Risk estimates are calculated using trained statistical ML models (Logistic Regression & Random Forest) on historical USGS/NOAA catalog data.',
        'Real-time ocean buoy (DART) sea-level pressure signals and hydrodynamic wave propagation modeling are not currently connected.'
      ],
      generated_at: new Date().toISOString()
    };

    return assessment;
  }
}
