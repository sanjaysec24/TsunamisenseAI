/**
 * TSUNAMISENSE AI - Application Error Handling Strategy
 * 
 * Provides typed error codes and user-friendly error messages
 * without revealing internal technical stack traces.
 */

export type AppErrorCode = 
  | 'DATA_SOURCE_UNAVAILABLE'
  | 'PREDICTION_ENGINE_DISCONNECTED'
  | 'INVALID_INPUT'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'EVENT_NOT_FOUND'
  | 'GEOSPATIAL_SERVICE_OFFLINE'
  | 'NETWORK_FAILURE';

export class AppError extends Error {
  public code: AppErrorCode;
  public userMessage: string;
  public timestamp: string;

  constructor(code: AppErrorCode, userMessage: string, technicalDetail?: string) {
    super(technicalDetail || userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.timestamp = new Date().toISOString();
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.userMessage,
      timestamp: this.timestamp
    };
  }
}

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  DATA_SOURCE_UNAVAILABLE: 'Data source unavailable. Real-time seismic data will be connected during Phase 1.',
  PREDICTION_ENGINE_DISCONNECTED: 'Prediction engine is not connected yet (Phase 2).',
  INVALID_INPUT: 'Unable to process input. Please check the provided seismic parameters.',
  AI_SERVICE_UNAVAILABLE: 'AI Analyst service is offline. Gemini intelligence will be connected in Phase 4.',
  EVENT_NOT_FOUND: 'No matching earthquake or tsunami event was found in the database.',
  GEOSPATIAL_SERVICE_OFFLINE: 'Geospatial mapping engine is in Phase 0 visualization mode.',
  NETWORK_FAILURE: 'Network connection interrupted. Please try again later.'
};
