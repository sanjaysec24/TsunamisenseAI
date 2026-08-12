/**
 * TSUNAMISENSE AI — Earthquake ↔ Tsunami Association Engine (Phase 1.1)
 * 
 * SCIENTIFIC ASSOCIATION POLICY:
 * Does NOT apply arbitrary thresholds (e.g., M > X = tsunami).
 * Establishes explicit, transparent candidate matching based on:
 * 1. Deterministic Source Identifier Matching (USGS / NOAA official cross-references)
 * 2. Spatiotemporal Proximity Candidate Matching (Haversine spatial distance + UTC origin delta)
 * 3. Preserves unassociated earthquakes without fabricating labels.
 */

import { EarthquakeRecord, TsunamiRecord, EventAssociation } from '../types';

export class EventAssociator {
  /**
   * Calculates great-circle distance between two (lat, lng) coordinates in kilometers using the Haversine formula.
   */
  static calculateHaversineDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const EARTH_RADIUS_KM = 6371.0;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  /**
   * Calculates absolute time difference in minutes between two ISO 8601 UTC timestamps.
   */
  static calculateTimeDifferenceMinutes(time1: string, time2: string): number | null {
    try {
      const t1 = new Date(time1).getTime();
      const t2 = new Date(time2).getTime();
      if (isNaN(t1) || isNaN(t2)) return null;
      return Math.abs(t1 - t2) / (1000 * 60);
    } catch {
      return null;
    }
  }

  /**
   * Evaluates associations between a pool of earthquakes and tsunami events.
   */
  static associateEvents(
    earthquakes: EarthquakeRecord[],
    tsunamis: TsunamiRecord[],
    options: { maxDistanceKm?: number; maxTimeDeltaMinutes?: number } = {}
  ): EventAssociation[] {
    const MAX_DISTANCE_KM = options.maxDistanceKm ?? 200.0; // 200 km
    const MAX_TIME_DELTA_MIN = options.maxTimeDeltaMinutes ?? 180.0; // 3 hours
    const associations: EventAssociation[] = [];

    for (const eq of earthquakes) {
      let bestMatch: {
        tsunamiId: string;
        method: EventAssociation['association_method'];
        confidence: number;
        distKm: number | null;
        timeDeltaMin: number | null;
        notes: string;
      } | null = null;

      for (const tsu of tsunamis) {
        // 1. DETERMINISTIC SOURCE ID MATCHING
        if (
          (tsu.source_earthquake_id && tsu.source_earthquake_id === eq.earthquake_id) ||
          eq.earthquake_id.includes(tsu.tsunami_event_id.replace('noaa-', ''))
        ) {
          const dist =
            tsu.source_latitude !== null && tsu.source_longitude !== null
              ? this.calculateHaversineDistanceKm(eq.latitude, eq.longitude, tsu.source_latitude, tsu.source_longitude)
              : null;
          const timeDelta = this.calculateTimeDifferenceMinutes(eq.origin_time, tsu.event_time);

          bestMatch = {
            tsunamiId: tsu.tsunami_event_id,
            method: 'DETERMINISTIC_SOURCE_ID',
            confidence: 1.0,
            distKm: dist !== null ? Math.round(dist * 10) / 10 : null,
            timeDeltaMin: timeDelta !== null ? Math.round(timeDelta * 10) / 10 : null,
            notes: `Verified deterministic cross-reference match via source identifier '${tsu.source_earthquake_id}'.`
          };
          break; // Deterministic match takes highest priority
        }

        // 2. SPATIOTEMPORAL CANDIDATE MATCHING
        if (tsu.source_latitude !== null && tsu.source_longitude !== null) {
          const distKm = this.calculateHaversineDistanceKm(
            eq.latitude,
            eq.longitude,
            tsu.source_latitude,
            tsu.source_longitude
          );
          const timeDeltaMin = this.calculateTimeDifferenceMinutes(eq.origin_time, tsu.event_time);

          if (
            distKm <= MAX_DISTANCE_KM &&
            timeDeltaMin !== null &&
            timeDeltaMin <= MAX_TIME_DELTA_MIN
          ) {
            // Confidence calculation based on spatial and temporal proximity
            const spatialScore = 1.0 - distKm / MAX_DISTANCE_KM;
            const temporalScore = 1.0 - timeDeltaMin / MAX_TIME_DELTA_MIN;
            const candidateConfidence = Math.round((spatialScore * 0.6 + temporalScore * 0.4) * 100) / 100;

            if (!bestMatch || candidateConfidence > bestMatch.confidence) {
              bestMatch = {
                tsunamiId: tsu.tsunami_event_id,
                method: 'SPATIOTEMPORAL_CANDIDATE',
                confidence: candidateConfidence,
                distKm: Math.round(distKm * 10) / 10,
                timeDeltaMin: Math.round(timeDeltaMin * 10) / 10,
                notes: `Spatiotemporal candidate match: ${Math.round(distKm)} km epicenter distance, ${Math.round(timeDeltaMin)} min origin time delta.`
              };
            }
          }
        }
      }

      if (bestMatch) {
        associations.push({
          earthquake_id: eq.earthquake_id,
          tsunami_event_id: bestMatch.tsunamiId,
          association_method: bestMatch.method,
          association_confidence: bestMatch.confidence,
          time_difference_minutes: bestMatch.timeDeltaMin,
          distance_km: bestMatch.distKm,
          association_notes: bestMatch.notes,
          associated_at: new Date().toISOString()
        });
      } else {
        // UNASSOCIATED (Non-tsunamigenic candidate pool preserved without fake labels)
        associations.push({
          earthquake_id: eq.earthquake_id,
          tsunami_event_id: null,
          association_method: 'UNASSOCIATED',
          association_confidence: 0.0,
          time_difference_minutes: null,
          distance_km: null,
          association_notes: 'No matching tsunamigenic observation within 200km / 180min spatiotemporal threshold.',
          associated_at: new Date().toISOString()
        });
      }
    }

    return associations;
  }
}
