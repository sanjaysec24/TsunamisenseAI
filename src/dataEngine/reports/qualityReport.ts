/**
 * TSUNAMISENSE AI — Automated Data Quality Report Generator (Phase 1.1)
 * 
 * Computes exact data quality metrics, parameter distribution bounds, timestamp ranges,
 * missing value ratios, and validation error logs for ingested datasets.
 */

import { DataQualityReport, EarthquakeRecord, IngestionError } from '../types';

export class QualityReportGenerator {
  static generateEarthquakeQualityReport(
    datasetName: string,
    records: EarthquakeRecord[],
    invalidCount: number,
    duplicateCount: number,
    validationErrors: IngestionError[]
  ): DataQualityReport {
    const totalRecords = records.length + invalidCount;
    let minMag: number | null = null;
    let maxMag: number | null = null;
    let minDepth: number | null = null;
    let maxDepth: number | null = null;

    let earliestTime: string | null = null;
    let latestTime: string | null = null;

    const missingCounts: Record<string, number> = {
      depth_km: 0,
      magnitude: 0,
      focal_mechanism: 0,
      usgs_url: 0
    };

    for (const r of records) {
      // Magnitude bounds
      if (r.magnitude !== null) {
        if (minMag === null || r.magnitude < minMag) minMag = r.magnitude;
        if (maxMag === null || r.magnitude > maxMag) maxMag = r.magnitude;
      } else {
        missingCounts.magnitude++;
      }

      // Depth bounds
      if (r.depth_km !== null) {
        if (minDepth === null || r.depth_km < minDepth) minDepth = r.depth_km;
        if (maxDepth === null || r.depth_km > maxDepth) maxDepth = r.depth_km;
      } else {
        missingCounts.depth_km++;
      }

      if (r.focal_mechanism === null) missingCounts.focal_mechanism++;
      if (r.usgs_url === null) missingCounts.usgs_url++;

      // Timestamp range
      if (r.origin_time) {
        if (earliestTime === null || r.origin_time < earliestTime) earliestTime = r.origin_time;
        if (latestTime === null || r.origin_time > latestTime) latestTime = r.origin_time;
      }
    }

    const missingValues: Record<string, { count: number; percentage: number }> = {};
    const recordCount = records.length || 1;

    for (const [key, count] of Object.entries(missingCounts)) {
      missingValues[key] = {
        count,
        percentage: Math.round((count / recordCount) * 1000) / 10
      };
    }

    return {
      report_id: `report-eq-${Date.now()}`,
      dataset_name: datasetName,
      generated_at: new Date().toISOString(),
      total_records: totalRecords,
      valid_records: records.length,
      invalid_records: invalidCount,
      duplicate_records: duplicateCount,
      source_coverage: 'USGS Global FDSN Event Web Service',
      earliest_timestamp: earliestTime,
      latest_timestamp: latestTime,
      magnitude_range: { min: minMag, max: maxMag },
      depth_range: { min: minDepth, max: maxDepth },
      missing_values: missingValues,
      validation_errors: validationErrors
    };
  }
}
