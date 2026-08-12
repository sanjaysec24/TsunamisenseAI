/**
 * TSUNAMISENSE AI — ML Feature Extraction & Engineering Pipeline
 * 
 * Computes derived domain features including subduction trench proximity,
 * focal energy-depth ratios, and historical regional tsunami density.
 */

import { ExtractedFeatures, FeatureKey } from '../types';

/**
 * Major Subduction Zone Trench Coordinates (Tectonic Registry)
 */
export const SUBDUCTION_TRENCH_NODES: Array<{ name: string; lat: number; lng: number }> = [
  // Sunda / Sumatra Trench
  { name: 'Sunda Trench North', lat: 6.0, lng: 93.0 },
  { name: 'Sunda Trench Central', lat: 3.3, lng: 95.8 },
  { name: 'Sunda Trench South', lat: -2.0, lng: 99.5 },
  { name: 'Java Trench', lat: -9.0, lng: 110.0 },

  // Japan / Kuril / Ryukyu Trench
  { name: 'Japan Trench North', lat: 40.5, lng: 143.5 },
  { name: 'Japan Trench Central (Tohoku)', lat: 38.3, lng: 142.8 },
  { name: 'Japan Trench South', lat: 35.0, lng: 141.5 },
  { name: 'Kuril Trench', lat: 46.5, lng: 153.2 },
  { name: 'Ryukyu Trench', lat: 26.5, lng: 126.5 },
  { name: 'Nankai Trough', lat: 33.0, lng: 136.0 },

  // Peru-Chile / South American Megathrust
  { name: 'Peru-Chile Trench North', lat: -12.0, lng: -77.5 },
  { name: 'Peru-Chile Trench Central (Peru)', lat: -16.3, lng: -73.6 },
  { name: 'Peru-Chile Trench Maule (Chile)', lat: -35.9, lng: -72.7 },
  { name: 'Peru-Chile Trench Valdivia (Chile)', lat: -38.1, lng: -73.4 },

  // Aleutian / Alaska Megathrust
  { name: 'Aleutian Trench East', lat: 54.0, lng: -160.0 },
  { name: 'Prince William Sound Alaska', lat: 60.5, lng: -147.5 },

  // Cascadia Subduction Zone
  { name: 'Cascadia North', lat: 48.0, lng: -125.5 },
  { name: 'Cascadia South', lat: 41.0, lng: -124.5 },

  // Tonga / Kermadec / New Zealand
  { name: 'Tonga Trench', lat: -20.0, lng: -175.0 },
  { name: 'Kermadec Trench', lat: -30.0, lng: -178.0 },

  // Philippines / Solomon / New Britain
  { name: 'Philippine Trench', lat: 10.0, lng: 126.5 },
  { name: 'Solomon Trench', lat: -8.5, lng: 157.0 },
  { name: 'Palu Sulawesi Trench', lat: -0.2, lng: 119.8 }
];

/**
 * Historical Tsunamigenic Epicenter Cluster Coordinates for Density Estimation
 */
const HISTORICAL_TSUNAMI_CLUSTER_CENTERS: Array<{ lat: number; lng: number }> = [
  { lat: 3.316, lng: 95.854 }, // Sumatra
  { lat: 38.297, lng: 142.373 }, // Tohoku
  { lat: -38.143, lng: -73.407 }, // Valdivia Chile
  { lat: 61.02, lng: -147.65 }, // Alaska
  { lat: -35.95, lng: -72.68 }, // Maule Chile
  { lat: -16.26, lng: -73.64 }, // Peru
  { lat: -8.48, lng: 156.98 }, // Solomon
  { lat: 46.59, lng: 153.23 }, // Kuril
  { lat: -31.57, lng: -71.67 }, // Illapel Chile
  { lat: -15.51, lng: -172.03 }, // Samoa
  { lat: 15.02, lng: -93.81 }, // Mexico
  { lat: -2.96, lng: 141.93 }, // PNG
  { lat: 41.81, lng: 143.91 }, // Hokkaido
  { lat: 42.85, lng: 139.2 }, // Okushiri
  { lat: -0.256, lng: 119.846 } // Palu
];

export class FeatureExtractor {
  /**
   * Computes Haversine distance in kilometers between two geographic coordinates.
   */
  static computeHaversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculates distance to the nearest subduction trench in kilometers.
   */
  static calculateDistanceToTrenchKm(latitude: number, longitude: number): number {
    let minDistance = Infinity;
    for (const node of SUBDUCTION_TRENCH_NODES) {
      const dist = this.computeHaversineKm(latitude, longitude, node.lat, node.lng);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return Math.round(minDistance * 10) / 10;
  }

  /**
   * Estimates historical regional tsunami density (count within 600 km).
   */
  static calculateHistoricalTsunamiDensity(latitude: number, longitude: number): number {
    let count = 0;
    for (const center of HISTORICAL_TSUNAMI_CLUSTER_CENTERS) {
      const dist = this.computeHaversineKm(latitude, longitude, center.lat, center.lng);
      if (dist <= 600) {
        count++;
      }
    }
    return count;
  }

  /**
   * Extracts the complete feature vector for a given earthquake event.
   */
  static extractFeatures(
    magnitude: number,
    depthKm: number,
    latitude: number,
    longitude: number
  ): ExtractedFeatures {
    const distanceToTrenchKm = this.calculateDistanceToTrenchKm(latitude, longitude);
    const isSubductionZone = distanceToTrenchKm <= 250 ? 1 : 0;
    
    // Offshore estimation: close to trench OR in oceanic bounds
    const isOffshore = (distanceToTrenchKm <= 350 || Math.abs(latitude) < 65) ? (distanceToTrenchKm <= 200 ? 1 : (distanceToTrenchKm <= 350 ? 1 : 0)) : 0;

    const historicalTsunamiDensity = this.calculateHistoricalTsunamiDensity(latitude, longitude);
    
    // Physics energy-depth ratio: Mw / ln(depth_km + 2)
    // Shallow earthquakes (<50 km) yield much higher values than deep earthquakes (>300 km)
    const energyDepthRatio = Math.round((magnitude / Math.log(depthKm + 2)) * 1000) / 1000;

    return {
      magnitude,
      depth_km: depthKm,
      latitude,
      longitude,
      distance_to_trench_km: distanceToTrenchKm,
      is_subduction_zone: isSubductionZone,
      is_offshore: isOffshore,
      historical_tsunami_density: historicalTsunamiDensity,
      energy_depth_ratio: energyDepthRatio
    };
  }

  /**
   * Ordered keys used for feature vector serialization.
   */
  static getFeatureKeys(): FeatureKey[] {
    return [
      'magnitude',
      'depth_km',
      'latitude',
      'longitude',
      'distance_to_trench_km',
      'is_subduction_zone',
      'is_offshore',
      'historical_tsunami_density',
      'energy_depth_ratio'
    ];
  }
}
