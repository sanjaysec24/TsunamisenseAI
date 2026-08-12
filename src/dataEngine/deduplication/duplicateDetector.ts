/**
 * TSUNAMISENSE AI — Duplicate Detection & Resolution Engine (Phase 1.1)
 * 
 * Detects duplicate records based on authoritative source IDs and logs resolution metadata.
 * Does NOT arbitrarily drop distinct source solutions or distinct network revisions.
 */

import { EarthquakeRecord, TsunamiRecord } from '../types';

export interface DeduplicationResult<T> {
  uniqueRecords: T[];
  duplicatesDetected: number;
  duplicateLog: Array<{ id: string; reason: string }>;
}

export class DuplicateDetector {
  /**
   * Deduplicates earthquake records by authoritative earthquake_id.
   */
  static deduplicateEarthquakes(records: EarthquakeRecord[]): DeduplicationResult<EarthquakeRecord> {
    const seen = new Map<string, EarthquakeRecord>();
    const duplicateLog: Array<{ id: string; reason: string }> = [];

    for (const record of records) {
      if (seen.has(record.earthquake_id)) {
        duplicateLog.push({
          id: record.earthquake_id,
          reason: `Duplicate USGS event identifier '${record.earthquake_id}' detected.`
        });
      } else {
        seen.set(record.earthquake_id, record);
      }
    }

    return {
      uniqueRecords: Array.from(seen.values()),
      duplicatesDetected: duplicateLog.length,
      duplicateLog
    };
  }

  /**
   * Deduplicates tsunami records by authoritative tsunami_event_id.
   */
  static deduplicateTsunamis(records: TsunamiRecord[]): DeduplicationResult<TsunamiRecord> {
    const seen = new Map<string, TsunamiRecord>();
    const duplicateLog: Array<{ id: string; reason: string }> = [];

    for (const record of records) {
      if (seen.has(record.tsunami_event_id)) {
        duplicateLog.push({
          id: record.tsunami_event_id,
          reason: `Duplicate NOAA tsunami event identifier '${record.tsunami_event_id}' detected.`
        });
      } else {
        seen.set(record.tsunami_event_id, record);
      }
    }

    return {
      uniqueRecords: Array.from(seen.values()),
      duplicatesDetected: duplicateLog.length,
      duplicateLog
    };
  }
}
