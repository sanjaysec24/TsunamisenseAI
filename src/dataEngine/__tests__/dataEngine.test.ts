/**
 * TSUNAMISENSE AI — Data Engine Test Suite (Phase 1.1)
 * 
 * Tests validation, normalization, timestamp parsing, duplicate detection,
 * missing-value preservation, and Earthquake ↔ Tsunami association algorithms.
 * Uses deterministic fixtures clearly labeled as TEST DATA.
 */

import { DataValidator } from '../validation/dataValidator';
import { USGSIngestionModule } from '../ingestion/usgsIngest';
import { DuplicateDetector } from '../deduplication/duplicateDetector';
import { EventAssociator } from '../association/eventAssociator';
import { EarthquakeRecord, TsunamiRecord } from '../types';

// ============================================================================
// DETERMINISTIC TEST FIXTURES — CLEARLY MARKED AS TEST DATA
// ============================================================================

export const MOCK_TEST_GEOJSON_FEATURE = {
  type: 'Feature',
  id: 'test_eq_001',
  properties: {
    mag: 7.2,
    place: 'TEST DATA - 50km W of Test Trench',
    time: 1700000000000, // UTC: 2023-11-14T22:13:20.000Z
    magType: 'mww',
    type: 'earthquake',
    status: 'reviewed',
    tsunami: 1,
    url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test_eq_001'
  },
  geometry: {
    type: 'Point',
    coordinates: [120.5, -8.2, 25.0] // [lng, lat, depth]
  }
};

export const MOCK_TEST_INVALID_LAT_FEATURE = {
  type: 'Feature',
  id: 'test_eq_invalid_lat',
  properties: { mag: 6.5, place: 'TEST DATA - Invalid Lat', time: 1700000000000 },
  geometry: { type: 'Point', coordinates: [100.0, 105.0, 30.0] } // Lat = 105.0 (> 90)
};

export const MOCK_TEST_NULL_DEPTH_FEATURE = {
  type: 'Feature',
  id: 'test_eq_null_depth',
  properties: { mag: 8.0, place: 'TEST DATA - Missing Depth', time: 1700000000000 },
  geometry: { type: 'Point', coordinates: [95.0, 3.0, null] } // Depth is null
};

export const MOCK_TEST_TSUNAMI_RECORD: TsunamiRecord = {
  tsunami_event_id: 'test_tsu_001',
  event_time: '2023-11-14T22:15:00.000Z', // 1.6 minutes after test_eq_001
  source_latitude: -8.18,
  source_longitude: 120.48, // ~5 km from test_eq_001
  cause: 'Subduction Earthquake',
  tsunami_magnitude: 7.0,
  maximum_water_height_m: 4.5,
  runup_height_m: 4.5,
  affected_region: 'TEST DATA - Test Coastal Basin',
  country: 'Testland',
  fatalities_estimate: '0',
  damage_amount_millions: 1.0,
  source_earthquake_id: 'test_eq_001',
  source: 'NOAA_NCEI',
  retrieved_at: new Date().toISOString()
};

// ============================================================================
// TEST SUITE ASSERTION RUNNER
// ============================================================================

export function runDataEngineTestSuite(): { total: number; passed: number; failed: number; log: string[] } {
  const log: string[] = [];
  let total = 0;
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      passed++;
      log.push(`✓ [PASS] ${testName}`);
    } else {
      failed++;
      log.push(`✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    }
  }

  log.push('=== TSUNAMISENSE AI — DATA ENGINE TEST SUITE (PHASE 1.1) ===\n');

  // TEST 1: USGS GeoJSON Feature Parsing
  const parsedEq = USGSIngestionModule.parseGeoJsonFeature(MOCK_TEST_GEOJSON_FEATURE, '2026-08-11T00:00:00Z');
  assert(parsedEq.earthquake_id === 'test_eq_001', '1.1 USGS GeoJSON parses earthquake_id correctly');
  assert(parsedEq.magnitude === 7.2, '1.2 USGS GeoJSON parses magnitude correctly');
  assert(parsedEq.depth_km === 25.0, '1.3 USGS GeoJSON parses focal depth_km correctly');
  assert(parsedEq.latitude === -8.2 && parsedEq.longitude === 120.5, '1.4 USGS GeoJSON parses coordinates [lng, lat]');

  // TEST 2: UTC Timestamp Normalization
  const utcNorm = DataValidator.normalizeUtcTimestamp(1700000000000);
  assert(utcNorm === '2023-11-14T22:13:20.000Z', '2.1 Converts epoch milliseconds into valid UTC ISO 8601 string');

  // TEST 3: Coordinate Bounds Validation
  const validResult = DataValidator.validateEarthquakeRecord(parsedEq);
  assert(validResult.isValid === true, '3.1 Validates correct earthquake record without errors');

  const invalidLatEq = USGSIngestionModule.parseGeoJsonFeature(MOCK_TEST_INVALID_LAT_FEATURE, '2026-08-11T00:00:00Z');
  const invalidResult = DataValidator.validateEarthquakeRecord(invalidLatEq);
  assert(invalidResult.isValid === false, '3.2 Flags out-of-range latitude (> 90 degrees)');
  assert(invalidResult.errors.some(e => e.field === 'latitude'), '3.3 Records explicit latitude IngestionError');

  // TEST 4: Missing Value Preservation (Depth = null, NEVER converted to 0)
  const nullDepthEq = USGSIngestionModule.parseGeoJsonFeature(MOCK_TEST_NULL_DEPTH_FEATURE, '2026-08-11T00:00:00Z');
  assert(nullDepthEq.depth_km === null, '4.1 Preserves missing depth_km as null');
  assert(nullDepthEq.depth_km !== 0, '4.2 DOES NOT silently convert missing depth_km to 0');

  // TEST 5: Duplicate Detection
  const duplicateRecords: EarthquakeRecord[] = [parsedEq, parsedEq];
  const dedupRes = DuplicateDetector.deduplicateEarthquakes(duplicateRecords);
  assert(dedupRes.uniqueRecords.length === 1, '5.1 Deduplicates identical earthquake IDs');
  assert(dedupRes.duplicatesDetected === 1, '5.2 Logs duplicate count correctly');

  // TEST 6: Earthquake ↔ Tsunami Association Algorithm
  const assocList = EventAssociator.associateEvents([parsedEq], [MOCK_TEST_TSUNAMI_RECORD]);
  assert(assocList.length === 1, '6.1 Produces association output');
  assert(assocList[0].association_method === 'DETERMINISTIC_SOURCE_ID', '6.2 Identifies deterministic source identifier match');
  assert(assocList[0].association_confidence === 1.0, '6.3 Assigns 1.0 confidence for verified ID match');

  // TEST 7: Haversine Spatial Distance Calculation
  const distKm = EventAssociator.calculateHaversineDistanceKm(0, 0, 0, 1);
  assert(Math.round(distKm) === 111, '7.1 Accurately computes 1 degree longitude distance (~111 km at equator)');

  log.push(`\nSUMMARY: ${passed} passed, ${failed} failed, ${total} total.`);
  return { total, passed, failed, log };
}
