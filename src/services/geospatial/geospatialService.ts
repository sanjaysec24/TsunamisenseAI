/**
 * TSUNAMISENSE AI - Geospatial Mapping Service Boundary
 * 
 * Manages GIS layers and tectonic map configurations for Phase 7 visual integration.
 */

import { MapLayerConfig } from '../../types';

export interface IGeospatialService {
  getDefaultMapLayers(): MapLayerConfig[];
}

export class GeospatialService implements IGeospatialService {
  getDefaultMapLayers(): MapLayerConfig[] {
    return [
      {
        id: 'earthquakes',
        label: 'Live Earthquakes (USGS)',
        description: 'Real-time seismic events (Mw ≥ 5.0) with focal depth coding.',
        visible: true,
        status: 'AWAITING_PHASE_1',
        count: 0
      },
      {
        id: 'historical_tsunamis',
        label: 'Historical Tsunamis (NOAA NCEI)',
        description: 'Historic tsunamigenic epicenter markers and runup locations.',
        visible: true,
        status: 'AWAITING_PHASE_1',
        count: 4
      },
      {
        id: 'risk_assessments',
        label: 'ML Tsunami Risk Heatmap',
        description: 'Inference model risk potential overlays and propagation vectors.',
        visible: false,
        status: 'AWAITING_PHASE_2',
        count: 0
      },
      {
        id: 'ocean_stations',
        label: 'DART Deep-Ocean Buoys',
        description: 'Real-time sea surface elevation telemetry stations.',
        visible: true,
        status: 'AWAITING_PHASE_1',
        count: 4
      },
      {
        id: 'tectonic_context',
        label: 'Tectonic Plate Boundaries & Trenches',
        description: 'Subduction zone trench axes and oceanic fault lines.',
        visible: true,
        status: 'ACTIVE',
        count: 12
      }
    ];
  }
}

export const geospatialService = new GeospatialService();
