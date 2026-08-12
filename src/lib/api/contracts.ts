/**
 * TSUNAMISENSE AI - API Contracts Specification
 * 
 * Formal TypeScript definitions for all 7 application REST API endpoints.
 * In Phase 0.2, these serve as strict architectural boundaries.
 */

import {
  PredictApiRequest,
  PredictApiResponse,
  EventsApiQuery,
  EventsApiResponse,
  HistoricalApiQuery,
  HistoricalApiResponse,
  OceanObservationsResponse,
  AIExplainApiRequest,
  AIExplainApiResponse,
  HealthApiResponse
} from '../../types';

export const API_ENDPOINTS = {
  PREDICT: '/api/predict',
  EVENTS: '/api/events',
  EVENT_DETAIL: (id: string) => `/api/events/${id}`,
  HISTORICAL: '/api/historical',
  OCEAN_OBSERVATIONS: '/api/ocean-observations',
  AI_EXPLAIN: '/api/ai/explain',
  HEALTH: '/api/health'
} as const;

export interface ApiContractRegistry {
  'POST /api/predict': {
    request: PredictApiRequest;
    response: PredictApiResponse;
    phase: 'Phase 2 ML Engine';
  };
  'GET /api/events': {
    query: EventsApiQuery;
    response: EventsApiResponse;
    phase: 'Phase 1 Data Engine';
  };
  'GET /api/events/:id': {
    params: { id: string };
    response: EventsApiResponse;
    phase: 'Phase 1 Data Engine';
  };
  'GET /api/historical': {
    query: HistoricalApiQuery;
    response: HistoricalApiResponse;
    phase: 'Phase 1 Data Engine';
  };
  'GET /api/ocean-observations': {
    response: OceanObservationsResponse;
    phase: 'Phase 1 Data Engine';
  };
  'POST /api/ai/explain': {
    request: AIExplainApiRequest;
    response: AIExplainApiResponse;
    phase: 'Phase 4 Gemini Analyst';
  };
  'GET /api/health': {
    response: HealthApiResponse;
    phase: 'Phase 0 Active';
  };
}
