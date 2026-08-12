/**
 * TSUNAMISENSE AI - Earthquake Input Validation Engine
 * 
 * Enforces technically sensible ranges for seismic parameters without
 * hardcoding unscientific prediction rules.
 */

import { EarthquakeInput, EarthquakeValidationError } from '../../types';

export function validateEarthquakeInput(input: EarthquakeInput): {
  isValid: boolean;
  errors: EarthquakeValidationError;
} {
  const errors: EarthquakeValidationError = {};

  // 1. Magnitude Validation
  if (input.magnitude === '' || input.magnitude === undefined || input.magnitude === null) {
    errors.magnitude = 'Moment magnitude (Mw) is required.';
  } else if (typeof input.magnitude !== 'number' || isNaN(input.magnitude)) {
    errors.magnitude = 'Magnitude must be a valid numeric value.';
  } else if (input.magnitude < 1.0 || input.magnitude > 10.0) {
    errors.magnitude = 'Moment magnitude must be between 1.0 and 10.0.';
  }

  // 2. Depth Validation
  if (input.depthKm === '' || input.depthKm === undefined || input.depthKm === null) {
    errors.depthKm = 'Focal depth (km) is required.';
  } else if (typeof input.depthKm !== 'number' || isNaN(input.depthKm)) {
    errors.depthKm = 'Focal depth must be a valid numeric value.';
  } else if (input.depthKm < 0 || input.depthKm > 800) {
    errors.depthKm = 'Focal depth must be between 0 and 800 km.';
  }

  // 3. Latitude Validation
  if (input.latitude === '' || input.latitude === undefined || input.latitude === null) {
    errors.latitude = 'Latitude is required.';
  } else if (typeof input.latitude !== 'number' || isNaN(input.latitude)) {
    errors.latitude = 'Latitude must be a valid numeric value.';
  } else if (input.latitude < -90 || input.latitude > 90) {
    errors.latitude = 'Latitude must be between -90° and +90°.';
  }

  // 4. Longitude Validation
  if (input.longitude === '' || input.longitude === undefined || input.longitude === null) {
    errors.longitude = 'Longitude is required.';
  } else if (typeof input.longitude !== 'number' || isNaN(input.longitude)) {
    errors.longitude = 'Longitude must be a valid numeric value.';
  } else if (input.longitude < -180 || input.longitude > 180) {
    errors.longitude = 'Longitude must be between -180° and +180°.';
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
}
