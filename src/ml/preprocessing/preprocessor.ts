/**
 * TSUNAMISENSE AI — ML Preprocessing Pipeline
 * 
 * Handles input validation, feature scaling (StandardScaler), missing-value policies,
 * and stratified train/test dataset splits.
 */

import { ExtractedFeatures, FeatureKey, ScalerParams, EarthquakeMLRecord } from '../types';
import { FeatureExtractor } from '../features/featureExtractor';

export interface ProcessedSample {
  id: string;
  rawRecord: EarthquakeMLRecord;
  features: ExtractedFeatures;
  scaledVector: number[];
  label: number;
}

export class Preprocessor {
  /**
   * Validates raw earthquake input parameters before processing.
   * Throws descriptive errors on out-of-bound or malformed inputs.
   */
  static validateInput(
    magnitude: any,
    depthKm: any,
    latitude: any,
    longitude: any
  ): { isValid: boolean; error?: string } {
    if (magnitude === undefined || magnitude === null || Number.isNaN(Number(magnitude))) {
      return { isValid: false, error: 'Missing or non-numeric moment magnitude (Mw).' };
    }
    const mag = Number(magnitude);
    if (mag < 1.0 || mag > 10.0) {
      return { isValid: false, error: `Magnitude ${mag} out of physical range [1.0, 10.0].` };
    }

    if (depthKm === undefined || depthKm === null || Number.isNaN(Number(depthKm))) {
      return { isValid: false, error: 'Missing or non-numeric focal depth (depth_km).' };
    }
    const depth = Number(depthKm);
    if (depth < 0 || depth > 1000) {
      return { isValid: false, error: `Focal depth ${depth} km out of valid range [0, 1000].` };
    }

    if (latitude === undefined || latitude === null || Number.isNaN(Number(latitude))) {
      return { isValid: false, error: 'Missing or non-numeric latitude.' };
    }
    const lat = Number(latitude);
    if (lat < -90 || lat > 90) {
      return { isValid: false, error: `Latitude ${lat}° out of valid range [-90, +90].` };
    }

    if (longitude === undefined || longitude === null || Number.isNaN(Number(longitude))) {
      return { isValid: false, error: 'Missing or non-numeric longitude.' };
    }
    const lng = Number(longitude);
    if (lng < -180 || lng > 180) {
      return { isValid: false, error: `Longitude ${lng}° out of valid range [-180, +180].` };
    }

    return { isValid: true };
  }

  /**
   * Computes feature scaling parameters (means and standard deviations) across a training set.
   */
  static computeScalerParams(samples: ExtractedFeatures[]): ScalerParams {
    const featureKeys = FeatureExtractor.getFeatureKeys();
    const means = {} as Record<FeatureKey, number>;
    const stds = {} as Record<FeatureKey, number>;

    for (const key of featureKeys) {
      const values = samples.map((s) => s[key]);
      const sum = values.reduce((acc, v) => acc + v, 0);
      const mean = sum / (values.length || 1);
      means[key] = mean;

      const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length || 1);
      const std = Math.sqrt(variance);
      stds[key] = std === 0 ? 1.0 : std; // Prevent division by zero
    }

    return { means, stds };
  }

  /**
   * Transforms an ExtractedFeatures object into a standardized feature vector z = (x - mu) / sigma.
   */
  static scaleFeatures(features: ExtractedFeatures, scaler: ScalerParams): number[] {
    const keys = FeatureExtractor.getFeatureKeys();
    return keys.map((key) => {
      const mean = scaler.means[key] ?? 0;
      const std = scaler.stds[key] ?? 1;
      return (features[key] - mean) / std;
    });
  }

  /**
   * Performs stratified dataset splitting into training and test sets.
   */
  static stratifiedSplit(
    records: EarthquakeMLRecord[],
    testRatio = 0.25
  ): { trainRecords: EarthquakeMLRecord[]; testRecords: EarthquakeMLRecord[] } {
    const pos = records.filter((r) => r.tsunami_label === 1);
    const neg = records.filter((r) => r.tsunami_label === 0);

    const posTestCount = Math.max(1, Math.round(pos.length * testRatio));
    const negTestCount = Math.max(1, Math.round(neg.length * testRatio));

    const testRecords = [
      ...pos.slice(0, posTestCount),
      ...neg.slice(0, negTestCount)
    ];

    const trainRecords = [
      ...pos.slice(posTestCount),
      ...neg.slice(negTestCount)
    ];

    return { trainRecords, testRecords };
  }
}
