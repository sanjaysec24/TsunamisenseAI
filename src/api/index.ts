/**
 * TSUNAMISENSE AI - API Gateway & External Integrations
 * 
 * PHASE 0 STATUS: CONTRACT DEFINITIONS ONLY
 * Live API services (USGS Seismology, NOAA Tsunami Center, DART Buoys, Gemini AI)
 * will be connected in subsequent phases.
 */

export interface ExternalAPIContracts {
  usgsSeismologyAPI: { status: 'PHASE_1_PENDING'; endpoint: 'https://earthquake.usgs.gov/fdsnws/event/1/' };
  noaaTsunamiWarningCenter: { status: 'PHASE_1_PENDING'; endpoint: 'https://www.tsunami.gov/api/' };
  dartBuoyNetwork: { status: 'PHASE_1_PENDING'; endpoint: 'https://www.ndbc.noaa.gov/dart/' };
  geminiAnalysisEngine: { status: 'PHASE_4_PENDING'; model: 'gemini-2.5-flash' };
}

export const API_INTEGRATION_STATUS = {
  dataEngineConnected: false,
  message: 'Awaiting data integration (Phase 1)',
  geminiConnected: false,
  geminiMessage: 'Gemini intelligence will be connected in Phase 4.'
};
