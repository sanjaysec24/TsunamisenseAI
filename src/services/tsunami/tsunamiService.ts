/**
 * TSUNAMISENSE AI - Tsunami & Historical Benchmark Service Boundary
 * 
 * Provides static historical benchmark events for reference and defines
 * the contract for live tsunami event feeds in Phase 1.
 */

import { TsunamiEvent, HistoricalApiResponse } from '../../types';
import { HISTORICAL_BENCHMARK_EVENTS } from '../../data';

export interface ITsunamiService {
  getHistoricalBenchmarkEvents(): TsunamiEvent[];
  searchHistoricalEvents(region?: string, minMagnitude?: number, query?: string): TsunamiEvent[];
  getLiveTsunamiAlerts(): Promise<HistoricalApiResponse>;
}

export class TsunamiService implements ITsunamiService {
  getHistoricalBenchmarkEvents(): TsunamiEvent[] {
    return HISTORICAL_BENCHMARK_EVENTS.map((event) => ({
      id: event.id,
      eventTime: event.date,
      latitude: 0,
      longitude: 0,
      cause: 'Subduction Earthquake',
      tsunamiMagnitude: event.magnitude,
      maximumWaterHeightM: event.maxWaterHeightM,
      affectedRegion: event.region,
      fatalitiesEstimate: event.fatalitiesEstimate,
      summary: event.summary
    }));
  }

  searchHistoricalEvents(region?: string, minMagnitude?: number, query?: string): TsunamiEvent[] {
    let events = this.getHistoricalBenchmarkEvents();

    if (region && region !== 'ALL') {
      events = events.filter((e) => e.affectedRegion.toLowerCase().includes(region.toLowerCase()));
    }

    if (minMagnitude && minMagnitude > 0) {
      events = events.filter((e) => (e.tsunamiMagnitude || 0) >= minMagnitude);
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase();
      events = events.filter(
        (e) =>
          e.affectedRegion.toLowerCase().includes(q) ||
          (e.summary && e.summary.toLowerCase().includes(q))
      );
    }

    return events;
  }

  async getLiveTsunamiAlerts(): Promise<HistoricalApiResponse> {
    return {
      status: 'DISCONNECTED',
      message: 'Real-time NOAA Tsunami Warning Center feed will be connected in Phase 1.',
      count: 0,
      events: []
    };
  }
}

export const tsunamiService = new TsunamiService();
