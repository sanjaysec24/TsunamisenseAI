/**
 * TSUNAMISENSE AI — USGS Earthquake Ingestion Pipeline (Phase 1.1)
 * 
 * Fetches real-time and historical earthquake event feeds directly from the official
 * USGS FDSN Web Service API, validates coordinates, depth, time, magnitude, and
 * normalizes records into the TsunamiSense AI Earthquake Schema.
 */

import { EarthquakeRecord, USGSQueryParams, IngestionError } from '../types';
import { DataValidator } from '../validation/dataValidator';

export interface USGSIngestResult {
  source_url: string;
  retrieved_at: string;
  total_retrieved: number;
  valid_count: number;
  invalid_count: number;
  records: EarthquakeRecord[];
  errors: IngestionError[];
}

export class USGSIngestionModule {
  private static readonly BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

  /**
   * Builds the query URL with configurable filters.
   */
  static buildQueryUrl(params: USGSQueryParams): string {
    const url = new URL(this.BASE_URL);
    url.searchParams.set('format', 'geojson');

    if (params.startTime) url.searchParams.set('starttime', params.startTime);
    if (params.endTime) url.searchParams.set('endtime', params.endTime);
    if (params.minMagnitude !== undefined) url.searchParams.set('minmagnitude', params.minMagnitude.toString());
    if (params.maxMagnitude !== undefined) url.searchParams.set('maxmagnitude', params.maxMagnitude.toString());
    if (params.minDepth !== undefined) url.searchParams.set('mindepth', params.minDepth.toString());
    if (params.maxDepth !== undefined) url.searchParams.set('maxdepth', params.maxDepth.toString());
    if (params.limit !== undefined) url.searchParams.set('limit', params.limit.toString());
    if (params.eventType) url.searchParams.set('eventtype', params.eventType);

    if (params.bbox) {
      url.searchParams.set('minlatitude', params.bbox.minLat.toString());
      url.searchParams.set('maxlatitude', params.bbox.maxLat.toString());
      url.searchParams.set('minlongitude', params.bbox.minLng.toString());
      url.searchParams.set('maxlongitude', params.bbox.maxLng.toString());
    }

    return url.toString();
  }

  /**
   * Parses raw GeoJSON feature into normalized EarthquakeRecord.
   */
  static parseGeoJsonFeature(feature: any, retrievedAt: string): EarthquakeRecord {
    const props = feature.properties || {};
    const geom = feature.geometry || {};
    const coords = Array.isArray(geom.coordinates) ? geom.coordinates : [0, 0, 0];

    // USGS GeoJSON geometry format: [longitude, latitude, depth_km]
    const longitude = typeof coords[0] === 'number' ? coords[0] : 0;
    const latitude = typeof coords[1] === 'number' ? coords[1] : 0;
    const depth_km = typeof coords[2] === 'number' && !isNaN(coords[2]) ? coords[2] : null;

    const origin_time = DataValidator.normalizeUtcTimestamp(props.time) || new Date().toISOString();

    return {
      earthquake_id: feature.id || props.code || `usgs-${Date.now()}`,
      origin_time,
      latitude,
      longitude,
      depth_km,
      magnitude: typeof props.mag === 'number' && !isNaN(props.mag) ? props.mag : null,
      magnitude_type: props.magType ? String(props.magType).toUpperCase() : 'UNKNOWN',
      place: props.place || 'Unknown Location',
      event_type: props.type || 'earthquake',
      status: props.status || 'unreviewed',
      source: 'USGS',
      usgs_url: props.url || null,
      usgs_tsunami_flag: Boolean(props.tsunami),
      focal_mechanism: null, // Populated during deep event detail queries if available
      retrieved_at: retrievedAt
    };
  }

  /**
   * Ingests earthquake records directly from USGS FDSN Web Service API.
   */
  static async fetchAndIngest(params: USGSQueryParams): Promise<USGSIngestResult> {
    const queryUrl = this.buildQueryUrl(params);
    const retrievedAt = new Date().toISOString();

    try {
      const response = await fetch(queryUrl, {
        headers: {
          'User-Agent': 'TsunamiSense-AI-DataEngine/1.1 (Academic Research Prototype)'
        }
      });

      if (!response.ok) {
        throw new Error(`USGS HTTP Error ${response.status}: ${response.statusText}`);
      }

      const geoJson = await response.json();
      const features = Array.isArray(geoJson.features) ? geoJson.features : [];

      const validRecords: EarthquakeRecord[] = [];
      const allErrors: IngestionError[] = [];

      for (const feature of features) {
        const record = this.parseGeoJsonFeature(feature, retrievedAt);
        const validation = DataValidator.validateEarthquakeRecord(record);

        if (validation.isValid) {
          validRecords.push(validation.record);
        } else {
          allErrors.push(...validation.errors);
        }
      }

      return {
        source_url: queryUrl,
        retrieved_at: retrievedAt,
        total_retrieved: features.length,
        valid_count: validRecords.length,
        invalid_count: features.length - validRecords.length,
        records: validRecords,
        errors: allErrors
      };
    } catch (err: any) {
      throw new Error(`USGS Ingestion Pipeline Error: ${err.message}`);
    }
  }
}
