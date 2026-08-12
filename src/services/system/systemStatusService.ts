/**
 * TSUNAMISENSE AI - System Status Service
 */

import { SystemStatus } from '../../types';
import { CONFIG } from '../../config';

export class SystemStatusService {
  static getSystemStatus(): SystemStatus {
    return {
      phase: 'Phase 0 — Technical Architecture Foundation',
      systemReady: true,
      dataEngineConnected: CONFIG.featureFlags.enablePhase1DataEngine,
      mlEngineConnected: CONFIG.featureFlags.enablePhase2MLEngine,
      geminiConnected: CONFIG.featureFlags.enablePhase4Gemini,
      lastHealthCheck: new Date().toISOString()
    };
  }
}

export const systemStatusService = new SystemStatusService();
