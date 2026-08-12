/**
 * TSUNAMISENSE AI — Data Engine Core Domain Contracts (Phase 1.1)
 * 
 * Defines strict TypeScript interfaces for normalized earthquake records,
 * tsunami events, runup observations, tectonic features, event associations,
 * dataset manifests, and data quality reports.
 */

export interface EarthquakeRecord {
  earthquake_id: string; // USGS unique ID (e.g., us7000lui3)
  origin_time: string; // ISO 8601 UTC timestamp
  latitude: number; // -90 to +90
  longitude: number; // -180 to +180
  depth_km: number | null; // Focal depth in km (preserved null if missing)
  magnitude: number | null; // Moment magnitude (preserved null if missing)
  magnitude_type: string; // Mw, Mwc, Mww, Mb, Ms, or UNKNOWN
  place: string; // Location string
  event_type: string; // earthquake, subduction megathrust, etc.
  status: string; // reviewed, automatic, etc.
  source: string; // USGS, ISC, etc.
  usgs_url: string | null;
  usgs_tsunami_flag: boolean;
  focal_mechanism: string | null;
  retrieved_at: string; // Ingestion UTC timestamp
}

export interface TsunamiRecord {
  tsunami_event_id: string; // NOAA/NCEI ID
  event_time: string; // ISO 8601 UTC timestamp
  source_latitude: number | null;
  source_longitude: number | null;
  cause: string; // Subduction Earthquake, Volcanic Eruption, Landslide, Unknown
  tsunami_magnitude: number | null;
  maximum_water_height_m: number | null;
  runup_height_m: number | null;
  affected_region: string;
  country: string | null;
  fatalities_estimate: string | null;
  damage_amount_millions: number | null;
  source_earthquake_id: string | null;
  source: string; // NOAA_NCEI
  retrieved_at: string;
}

export interface TsunamiRunupRecord {
  runup_id: string;
  tsunami_event_id: string;
  latitude: number;
  longitude: number;
  first_wave_arrival_time: string | null;
  wave_height_m: number | null;
  runup_height_m: number | null;
  location_name: string;
  country: string | null;
  measurement_type: string; // Tide Gauge, DART Buoy, Field Survey
}

export interface TectonicFeature {
  feature_id: string;
  plate_name: string;
  boundary_type: 'subduction_zone' | 'transform_fault' | 'spreading_ridge' | 'trench_axis';
  coordinates: [number, number][]; // LineString [lng, lat]
  source: string;
}

export type AssociationMethod =
  | 'DETERMINISTIC_SOURCE_ID'
  | 'SPATIOTEMPORAL_CANDIDATE'
  | 'UNASSOCIATED';

export interface EventAssociation {
  earthquake_id: string;
  tsunami_event_id: string | null; // Null if earthquake did not trigger a tsunami
  association_method: AssociationMethod;
  association_confidence: number; // 0.0 to 1.0 (1.0 = verified ID match)
  time_difference_minutes: number | null;
  distance_km: number | null;
  association_notes: string;
  associated_at: string;
}

export interface IngestionError {
  record_id: string;
  field: string;
  reason: string;
  raw_value: any;
}

export interface DataManifest {
  manifest_id: string;
  dataset_name: string;
  source_url: string;
  retrieved_at: string;
  processing_version: string;
  record_count: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  missing_value_summary: Record<string, number>;
  checksum: string;
}

export interface DataQualityReport {
  report_id: string;
  dataset_name: string;
  generated_at: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  source_coverage: string;
  earliest_timestamp: string | null;
  latest_timestamp: string | null;
  magnitude_range: { min: number | null; max: number | null };
  depth_range: { min: number | null; max: number | null };
  missing_values: Record<string, { count: number; percentage: number }>;
  validation_errors: IngestionError[];
}

export interface USGSQueryParams {
  startTime?: string;
  endTime?: string;
  minMagnitude?: number;
  maxMagnitude?: number;
  minDepth?: number;
  maxDepth?: number;
  bbox?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  limit?: number;
  eventType?: string;
}
