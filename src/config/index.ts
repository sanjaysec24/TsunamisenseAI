/**
 * TSUNAMISENSE AI - Central Application Configuration
 * 
 * Safely accesses environment variables, defines service endpoints,
 * feature flags, and system-wide constants.
 */

export interface AppConfig {
  appName: string;
  appVersion: string;
  projectTag: string;
  api: {
    baseUrl: string;
    usgsEndpoint: string;
    noaaEndpoint: string;
    dartEndpoint: string;
  };
  featureFlags: {
    enablePhase1DataEngine: boolean;
    enablePhase2MLEngine: boolean;
    enablePhase3IntelligenceEngine: boolean;
    enablePhase4Gemini: boolean;
    enablePhase5Backend: boolean;
  };
}

/**
 * Safe helper to retrieve environment variables without throwing errors on client.
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
    return meta.env[key] as string;
  }
  return defaultValue;
}

export const CONFIG: AppConfig = {
  appName: getEnvVar('VITE_APP_NAME', 'TsunamiSense AI'),
  appVersion: '1.1.0-data-engine',
  projectTag: 'IBM Datathon Project — Research Decision-Support Prototype',
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),
    usgsEndpoint: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    noaaEndpoint: 'https://www.ngdc.noaa.gov/hazard/tsunami.shtml',
    dartEndpoint: 'https://www.ndbc.noaa.gov/dart/',
  },
  featureFlags: {
    enablePhase1DataEngine: true,
    enablePhase2MLEngine: false,
    enablePhase3IntelligenceEngine: false,
    enablePhase4Gemini: false,
    enablePhase5Backend: false,
  },
};
