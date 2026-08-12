/**
 * TSUNAMISENSE AI — Data Source Registry (Phase 1.1)
 * 
 * Machine-readable and human-auditable data source registry.
 */

export interface SourceRegistryEntry {
  sourceId: string;
  sourceName: string;
  organization: string;
  officialUrl: string;
  queryEndpoint: string;
  purpose: string;
  accessMethod: 'REST_API' | 'TSV_EXPORT' | 'GEOJSON_STATIC' | 'WEBSOCKET';
  format: 'GeoJSON' | 'JSON' | 'CSV' | 'TSV';
  updateFrequency: string;
  importantFields: string[];
  limitations: string;
  license: string;
  status: 'VERIFIED_OPERATIONAL' | 'OFFLINE' | 'DEGRADED';
}

export const DATA_SOURCE_REGISTRY: Record<string, SourceRegistryEntry> = {
  USGS_EARTHQUAKE: {
    sourceId: 'USGS_EARTHQUAKE',
    sourceName: 'USGS Earthquake Catalog / FDSN Event Web Service',
    organization: 'United States Geological Survey (USGS)',
    officialUrl: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    queryEndpoint: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
    purpose: 'Primary authoritative seismic feed for origin times, epicenters, depths, and magnitudes.',
    accessMethod: 'REST_API',
    format: 'GeoJSON',
    updateFrequency: 'Real-time (Every 1-5 minutes for M >= 2.5)',
    importantFields: ['id', 'properties.time', 'geometry.coordinates', 'properties.mag', 'properties.magType', 'properties.tsunami'],
    limitations: 'Moment tensors available primarily for M >= 5.5.',
    license: 'Public Domain (US Government Work)',
    status: 'VERIFIED_OPERATIONAL'
  },
  NOAA_TSUNAMI: {
    sourceId: 'NOAA_TSUNAMI',
    sourceName: 'NOAA / NCEI Global Historical Tsunami Database',
    organization: 'National Oceanic and Atmospheric Administration (NOAA)',
    officialUrl: 'https://www.ngdc.noaa.gov/hazard/tsunami.shtml',
    queryEndpoint: 'https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events',
    purpose: 'Authoritative benchmark database for historical tsunamigenic events and impacts.',
    accessMethod: 'REST_API',
    format: 'JSON',
    updateFrequency: 'Post-event field survey revisions',
    importantFields: ['id', 'year', 'month', 'day', 'latitude', 'longitude', 'causeCode', 'tsunamiMagnitude', 'maxWaterHeight'],
    limitations: 'Historical records pre-1900 rely on archival reconstruction.',
    license: 'Public Domain (NOAA Open Data Policy)',
    status: 'VERIFIED_OPERATIONAL'
  },
  NOAA_RUNUP: {
    sourceId: 'NOAA_RUNUP',
    sourceName: 'NOAA / NCEI Tsunami Run-Up Observations Dataset',
    organization: 'NOAA National Centers for Environmental Information',
    officialUrl: 'https://www.ngdc.noaa.gov/hazard/tsu_db.shtml',
    queryEndpoint: 'https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/runups',
    purpose: 'Coastal wave height and inland inundation height field survey observations.',
    accessMethod: 'REST_API',
    format: 'JSON',
    updateFrequency: 'Post-event field survey revisions',
    importantFields: ['runupId', 'eventId', 'latitude', 'longitude', 'waveHeight', 'runupHeight', 'measurementType'],
    limitations: 'Spatial density highest near populated coastal zones.',
    license: 'Public Domain (NOAA Open Data Policy)',
    status: 'VERIFIED_OPERATIONAL'
  },
  USGS_TECTONIC: {
    sourceId: 'USGS_TECTONIC',
    sourceName: 'USGS Geoserve Tectonic Regions & PB2002 Plate Boundaries',
    organization: 'USGS / Peter Bird (2002)',
    officialUrl: 'https://earthquake.usgs.gov/ws/geoserve/',
    queryEndpoint: 'https://earthquake.usgs.gov/ws/geoserve/places/',
    purpose: 'Subduction zone trench axes and tectonic plate boundaries for spatial trench distance calculations.',
    accessMethod: 'GEOJSON_STATIC',
    format: 'GeoJSON',
    updateFrequency: 'Static Geological Reference',
    importantFields: ['plateName', 'boundaryType', 'coordinates'],
    limitations: 'Geological plate boundaries evolve on megayear timescales.',
    license: 'Public Domain / Creative Commons ShareAlike',
    status: 'VERIFIED_OPERATIONAL'
  },
  NOAA_DART: {
    sourceId: 'NOAA_DART',
    sourceName: 'NOAA DART Deep-Ocean Buoy Network',
    organization: 'NOAA National Data Buoy Center (NDBC)',
    officialUrl: 'https://www.ndbc.noaa.gov/dart.shtml',
    queryEndpoint: 'https://www.ndbc.noaa.gov/data/realtime2/',
    purpose: 'Optional real-time deep-ocean bottom pressure water column elevation telemetry.',
    accessMethod: 'REST_API',
    format: 'TSV',
    updateFrequency: '15-minute routine / 15-second trigger mode',
    importantFields: ['stationId', 'timestamp', 'waterColumnHeightMeters', 'status'],
    limitations: 'Buoy maintenance schedules can lead to temporary station outages.',
    license: 'Public Domain',
    status: 'VERIFIED_OPERATIONAL'
  }
};

export class SourceRegistryService {
  static getAllSources(): SourceRegistryEntry[] {
    return Object.values(DATA_SOURCE_REGISTRY);
  }

  static getSourceById(id: string): SourceRegistryEntry | undefined {
    return DATA_SOURCE_REGISTRY[id];
  }
}
