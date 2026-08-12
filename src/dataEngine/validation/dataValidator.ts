/**
 * TSUNAMISENSE AI — Data Validation Engine (Phase 1.1)
 * 
 * Implements non-destructive validation rules for earthquake and tsunami records.
 * Flags invalid scientific parameters without converting missing values into 0s or fake defaults.
 */

import { EarthquakeRecord, TsunamiRecord, IngestionError } from '../types';

export interface ValidationResult<T> {
  isValid: boolean;
  record: T;
  errors: IngestionError[];
}

export class DataValidator {
  /**
   * Normalizes a timestamp into a UTC-aware ISO 8601 string.
   */
  static normalizeUtcTimestamp(input: string | number | null | undefined): string | null {
    if (input === null || input === undefined || input === '') {
      return null;
    }

    try {
      if (typeof input === 'number') {
        const date = new Date(input);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      if (typeof input === 'string') {
        // Handle numeric epoch string
        if (/^\d+$/.test(input)) {
          const epoch = parseInt(input, 10);
          const date = new Date(epoch);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }

        const date = new Date(input);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Validates a normalized EarthquakeRecord.
   */
  static validateEarthquakeRecord(record: EarthquakeRecord): ValidationResult<EarthquakeRecord> {
    const errors: IngestionError[] = [];

    // 1. Event ID Validation
    if (!record.earthquake_id || typeof record.earthquake_id !== 'string' || record.earthquake_id.trim() === '') {
      errors.push({
        record_id: record.earthquake_id || 'UNKNOWN',
        field: 'earthquake_id',
        reason: 'Event ID must be a non-empty string preserved directly from the source.',
        raw_value: record.earthquake_id
      });
    }

    // 2. Latitude Validation (-90 to +90)
    if (typeof record.latitude !== 'number' || isNaN(record.latitude)) {
      errors.push({
        record_id: record.earthquake_id,
        field: 'latitude',
        reason: 'Latitude must be a valid numeric value.',
        raw_value: record.latitude
      });
    } else if (record.latitude < -90 || record.latitude > 90) {
      errors.push({
        record_id: record.earthquake_id,
        field: 'latitude',
        reason: `Latitude ${record.latitude} out of valid range [-90, +90].`,
        raw_value: record.latitude
      });
    }

    // 3. Longitude Validation (-180 to +180)
    if (typeof record.longitude !== 'number' || isNaN(record.longitude)) {
      errors.push({
        record_id: record.earthquake_id,
        field: 'longitude',
        reason: 'Longitude must be a valid numeric value.',
        raw_value: record.longitude
      });
    } else if (record.longitude < -180 || record.longitude > 180) {
      errors.push({
        record_id: record.earthquake_id,
        field: 'longitude',
        reason: `Longitude ${record.longitude} out of valid range [-180, +180].`,
        raw_value: record.longitude
      });
    }

    // 4. Depth Validation (0 to 800 km) — MUST NOT convert null to 0!
    if (record.depth_km !== null) {
      if (typeof record.depth_km !== 'number' || isNaN(record.depth_km)) {
        errors.push({
          record_id: record.earthquake_id,
          field: 'depth_km',
          reason: 'Focal depth must be numeric or null.',
          raw_value: record.depth_km
        });
      } else if (record.depth_km < -5 || record.depth_km > 800) {
        errors.push({
          record_id: record.earthquake_id,
          field: 'depth_km',
          reason: `Focal depth ${record.depth_km} km out of valid scientific bounds [-5, 800].`,
          raw_value: record.depth_km
        });
      }
    }

    // 5. Magnitude Validation (1.0 to 10.0) — MUST NOT convert null to 0!
    if (record.magnitude !== null) {
      if (typeof record.magnitude !== 'number' || isNaN(record.magnitude)) {
        errors.push({
          record_id: record.earthquake_id,
          field: 'magnitude',
          reason: 'Magnitude must be numeric or null.',
          raw_value: record.magnitude
        });
      } else if (record.magnitude < 0.0 || record.magnitude > 10.0) {
        errors.push({
          record_id: record.earthquake_id,
          field: 'magnitude',
          reason: `Magnitude ${record.magnitude} out of valid scale bounds [0.0, 10.0].`,
          raw_value: record.magnitude
        });
      }
    }

    // 6. Time Validation
    if (!record.origin_time || !this.normalizeUtcTimestamp(record.origin_time)) {
      errors.push({
        record_id: record.earthquake_id,
        field: 'origin_time',
        reason: 'Origin time must be a valid UTC ISO 8601 timestamp.',
        raw_value: record.origin_time
      });
    }

    return {
      isValid: errors.length === 0,
      record,
      errors
    };
  }

  /**
   * Validates a normalized TsunamiRecord.
   */
  static validateTsunamiRecord(record: TsunamiRecord): ValidationResult<TsunamiRecord> {
    const errors: IngestionError[] = [];

    if (!record.tsunami_event_id || typeof record.tsunami_event_id !== 'string') {
      errors.push({
        record_id: record.tsunami_event_id || 'UNKNOWN',
        field: 'tsunami_event_id',
        reason: 'Tsunami Event ID is required.',
        raw_value: record.tsunami_event_id
      });
    }

    if (record.source_latitude !== null) {
      if (typeof record.source_latitude !== 'number' || isNaN(record.source_latitude) || record.source_latitude < -90 || record.source_latitude > 90) {
        errors.push({
          record_id: record.tsunami_event_id,
          field: 'source_latitude',
          reason: 'Tsunami source latitude out of range [-90, +90].',
          raw_value: record.source_latitude
        });
      }
    }

    if (record.source_longitude !== null) {
      if (typeof record.source_longitude !== 'number' || isNaN(record.source_longitude) || record.source_longitude < -180 || record.source_longitude > 180) {
        errors.push({
          record_id: record.tsunami_event_id,
          field: 'source_longitude',
          reason: 'Tsunami source longitude out of range [-180, +180].',
          raw_value: record.source_longitude
        });
      }
    }

    if (record.maximum_water_height_m !== null) {
      if (typeof record.maximum_water_height_m !== 'number' || isNaN(record.maximum_water_height_m) || record.maximum_water_height_m < 0) {
        errors.push({
          record_id: record.tsunami_event_id,
          field: 'maximum_water_height_m',
          reason: 'Maximum water height must be non-negative numeric or null.',
          raw_value: record.maximum_water_height_m
        });
      }
    }

    return {
      isValid: errors.length === 0,
      record,
      errors
    };
  }
}
