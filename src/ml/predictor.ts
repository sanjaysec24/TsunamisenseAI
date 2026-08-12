/**
 * TSUNAMISENSE AI — Reusable Tsunami Risk Prediction Engine
 * 
 * Implements predict_tsunami_risk(magnitude, depth_km, latitude, longitude)
 * using trained ML models, derived feature engineering, and feature explainability.
 */

import {
  TsunamiRiskPrediction,
  RiskLevel,
  ContributingFactor,
  ExtractedFeatures,
  ModelArtifact
} from './types';
import { Preprocessor } from './preprocessing/preprocessor';
import { FeatureExtractor } from './features/featureExtractor';
import selectedModelJson from './artifacts/selectedModel.json';

const MODEL_ARTIFACT = selectedModelJson as ModelArtifact;

export class TsunamiRiskPredictor {
  private static sigmoid(z: number): number {
    if (z > 30) return 0.999999;
    if (z < -30) return 0.000001;
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Main prediction entry point matching MVP specification contract.
   */
  static predict(
    magnitude: number,
    depthKm: number,
    latitude: number,
    longitude: number,
    locationName?: string
  ): TsunamiRiskPrediction {
    // 1. Validate Input Parameters
    const validation = Preprocessor.validateInput(magnitude, depthKm, latitude, longitude);
    if (!validation.isValid) {
      throw new Error(`Invalid Input Parameters: ${validation.error}`);
    }

    const numMag = Number(magnitude);
    const numDepth = Number(depthKm);
    const numLat = Number(latitude);
    const numLng = Number(longitude);

    // 2. Extract Derived Domain Features
    const extractedFeatures: ExtractedFeatures = FeatureExtractor.extractFeatures(
      numMag,
      numDepth,
      numLat,
      numLng
    );

    // 3. Preprocessing & Standardization
    const featureKeys = FeatureExtractor.getFeatureKeys();
    const scalerParams = MODEL_ARTIFACT.scaler_params;
    const scaledVector = Preprocessor.scaleFeatures(extractedFeatures, scalerParams);

    // 4. Inference via Trained Model (Logistic Regression weights & bias)
    const weights = MODEL_ARTIFACT.weights || {};
    const bias = MODEL_ARTIFACT.bias || 0;

    let logOdds = bias;
    const featureContributions: Array<{
      key: string;
      value: number;
      weight: number;
      scaledVal: number;
      contribution: number;
    }> = [];

    for (let i = 0; i < featureKeys.length; i++) {
      const key = featureKeys[i];
      const weight = weights[key] ?? 0;
      const scaledVal = scaledVector[i];
      const contribution = weight * scaledVal;

      logOdds += contribution;
      featureContributions.push({
        key,
        value: extractedFeatures[key],
        weight,
        scaledVal,
        contribution
      });
    }

    const modelProbability = Math.round(this.sigmoid(logOdds) * 10000) / 10000;

    // 5. Calculate Presentation Risk Score (0 - 100)
    const riskScore = Math.min(100, Math.max(0, Math.round(modelProbability * 100)));

    // 6. Determine Application Presentation Risk Category
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 80) riskLevel = 'CRITICAL';
    else if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 40) riskLevel = 'MODERATE';
    else if (riskScore >= 20) riskLevel = 'GUARDED';

    // 7. Calculate Feature Contribution Factors & Rationale
    // Sort contributions by absolute impact magnitude
    featureContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    const totalAbsContrib =
      featureContributions.reduce((acc, f) => acc + Math.abs(f.contribution), 0) || 1;

    const contributingFactors: ContributingFactor[] = featureContributions
      .slice(0, 5) // Top 5 influential factors
      .map((item) => {
        const impactPercentage = Math.round((Math.abs(item.contribution) / totalAbsContrib) * 100);
        let impactDirection: 'INCREASES_RISK' | 'REDUCES_RISK' | 'NEUTRAL' = 'NEUTRAL';
        if (item.contribution > 0.05) impactDirection = 'INCREASES_RISK';
        else if (item.contribution < -0.05) impactDirection = 'REDUCES_RISK';

        let factorName = item.key;
        let rationale = '';
        let rawValStr = `${item.value}`;

        switch (item.key) {
          case 'magnitude':
            factorName = 'Moment Magnitude (Mw)';
            rawValStr = `Mw ${numMag.toFixed(1)}`;
            rationale =
              numMag >= 8.0
                ? `Great Earthquake magnitude (Mw ${numMag.toFixed(1)}) drives exponential fault surface dislocation.`
                : numMag >= 7.0
                ? `Major Earthquake magnitude (Mw ${numMag.toFixed(1)}) presents moderate displacement capacity.`
                : `Moderate earthquake magnitude (Mw ${numMag.toFixed(1)}) has limited fault rupture dimensions.`;
            break;

          case 'depth_km':
            factorName = 'Focal Depth';
            rawValStr = `${numDepth.toFixed(1)} km`;
            rationale =
              numDepth <= 35
                ? `Shallow focal depth (${numDepth.toFixed(1)} km) couples rupture strain directly to the seafloor.`
                : numDepth <= 70
                ? `Intermediate focal depth (${numDepth.toFixed(1)} km) attenuates vertical water displacement.`
                : `Deep focal depth (${numDepth.toFixed(1)} km) dissipates strain in mantle; minimal seafloor deformation.`;
            break;

          case 'distance_to_trench_km':
            factorName = 'Subduction Trench Distance';
            rawValStr = `${item.value.toFixed(1)} km`;
            rationale =
              item.value <= 150
                ? `Proximity to active subduction trench (${item.value.toFixed(1)} km) indicates high megathrust strain coupling.`
                : item.value <= 300
                ? `Located within ${item.value.toFixed(1)} km of subduction trench zone.`
                : `Distant from active subduction trench axis (${item.value.toFixed(1)} km).`;
            break;

          case 'historical_tsunami_density':
            factorName = 'Regional Tsunami History';
            rawValStr = `${item.value} past events`;
            rationale =
              item.value >= 3
                ? `Region has ${item.value} verified historical tsunamigenic events in catalog.`
                : `Limited historical tsunamigenic activity in immediate 600km radius.`;
            break;

          case 'energy_depth_ratio':
            factorName = 'Energy-Depth Focal Ratio';
            rawValStr = `${item.value.toFixed(2)}`;
            rationale = `Physics ratio combining magnitude and focal depth logarithmic decay.`;
            break;

          case 'is_subduction_zone':
            factorName = 'Subduction Zone Setting';
            rawValStr = item.value === 1 ? 'YES' : 'NO';
            rationale = item.value === 1 ? 'Located inside major active oceanic subduction zone.' : 'Not located in primary oceanic subduction boundary.';
            break;

          default:
            factorName = item.key;
            rationale = `Calculated feature contribution to probability log-odds: ${item.contribution.toFixed(3)}`;
            break;
        }

        return {
          feature_key: item.key,
          factor_name: factorName,
          raw_value: rawValStr,
          impact_direction: impactDirection,
          impact_percentage: impactPercentage,
          rationale
        };
      });

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      model_probability: modelProbability,
      model_version: MODEL_ARTIFACT.model_version,
      selected_model_name: MODEL_ARTIFACT.selected_model_name,
      evaluation_metrics: MODEL_ARTIFACT.evaluation_metrics,
      features_calculated: extractedFeatures,
      contributing_factors: contributingFactors,
      disclaimer:
        'RESEARCH/DECISION-SUPPORT ESTIMATE: This risk score is generated by a statistical machine learning model trained on historical USGS/NOAA catalog data. It is NOT an official tsunami warning or advisory issued by NOAA, USGS, or PTWC.',
      timestamp: new Date().toISOString(),
      input_parameters: {
        magnitude: numMag,
        depth_km: numDepth,
        latitude: numLat,
        longitude: numLng,
        location_name: locationName
      }
    };
  }
}

/**
 * Global function matching MVP prompt contract requirement:
 * predict_tsunami_risk(magnitude, depth_km, latitude, longitude)
 */
export function predict_tsunami_risk(
  magnitude: number,
  depth_km: number,
  latitude: number,
  longitude: number,
  location_name?: string
): TsunamiRiskPrediction {
  return TsunamiRiskPredictor.predict(magnitude, depth_km, latitude, longitude, location_name);
}
