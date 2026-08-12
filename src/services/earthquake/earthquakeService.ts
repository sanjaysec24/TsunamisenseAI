/**
 * TSUNAMISENSE AI - Earthquake Data Service (Phase 1.1)
 * 
 * Connected directly to USGS FDSN Web Service via Phase 1.1 Data Engine Ingestion Module.
 */

import { EarthquakeEvent, EventsApiResponse } from '../../types';
import { USGSIngestionModule } from '../../dataEngine/ingestion/usgsIngest';

export interface IEarthquakeService {
  getLiveEvents(minMagnitude?: number, limit?: number): Promise<EventsApiResponse>;
  getEventById(id: string): Promise<EarthquakeEvent | null>;
}

export class EarthquakeService implements IEarthquakeService {
  async getLiveEvents(minMagnitude: number = 5.5, limit: number = 50): Promise<EventsApiResponse> {
    try {
      const result = await USGSIngestionModule.fetchAndIngest({
        minMagnitude,
        limit
      });

      const events: EarthquakeEvent[] = result.records.map((r) => ({
        id: r.earthquake_id,
        magnitude: r.magnitude || 0,
        depthKm: r.depth_km || 0,
        latitude: r.latitude,
        longitude: r.longitude,
        eventTime: r.origin_time,
        location: r.place,
        magnitudeType: (r.magnitude_type as any) || 'Mw',
        eventType: 'Earthquake',
        tsunamiWarningFlag: r.usgs_tsunami_flag,
        status: r.status === 'reviewed' ? 'VERIFIED' : 'PRELIMINARY',
        usgsUrl: r.usgs_url || undefined
      }));

      return {
        status: 'SUCCESS',
        message: `Successfully retrieved ${events.length} real-time earthquake events from USGS FDSN Web Service.`,
        count: events.length,
        events
      };
    } catch (err: any) {
      return {
        status: 'DISCONNECTED',
        message: `USGS Ingestion Warning: ${err.message}`,
        count: 0,
        events: []
      };
    }
  }

  async getEventById(id: string): Promise<EarthquakeEvent | null> {
    const response = await this.getLiveEvents();
    return response.events.find((e) => e.id === id) || null;
  }
}

export const earthquakeService = new EarthquakeService();
