/**
 * TSUNAMISENSE AI - Ocean Observation & DART Buoy Service Boundary
 * 
 * Defines interface for deep-ocean buoy telemetry and tidal gauge networks.
 */

import { OceanObservation, OceanObservationsResponse } from '../../types';
import { DART_BUOY_STATION_PLACEHOLDERS } from '../../data';

export interface IOceanObservationService {
  getStations(): OceanObservation[];
  getBuoyTelemetry(): Promise<OceanObservationsResponse>;
}

export class OceanObservationService implements IOceanObservationService {
  getStations(): OceanObservation[] {
    return DART_BUOY_STATION_PLACEHOLDERS.map((station) => ({
      stationId: station.id,
      stationCode: station.code,
      stationName: station.stationName,
      latitude: station.latitude,
      longitude: station.longitude,
      timestamp: new Date().toISOString(),
      measurement: null,
      measurementType: 'WATER_COLUMN_HEIGHT',
      unit: 'meters',
      status: 'AWAITING_INTEGRATION',
      oceanRegion: station.oceanRegion
    }));
  }

  async getBuoyTelemetry(): Promise<OceanObservationsResponse> {
    return {
      status: 'DISCONNECTED',
      message: 'NOAA DART Buoy Network telemetry will be connected in Phase 1.',
      count: this.getStations().length,
      stations: this.getStations()
    };
  }
}

export const oceanObservationService = new OceanObservationService();
