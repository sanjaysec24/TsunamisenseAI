/**
 * TSUNAMISENSE AI - Interactive Geographic Map Component
 * 
 * Provides real geographic map interactions using Leaflet (CARTO Dark Basemap):
 * - Click/tap location on map -> captures exact Lat/Lon
 * - Selection marker & popover with "USE THIS LOCATION"
 * - Synchronizes with form inputs (Map <-> Form)
 * - Highlights actual risk score/level with subtle visual pulse upon prediction completion
 * - Displays layers for live earthquakes, historical tsunamis, DART buoys, and subduction trenches
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Map as MapIcon,
  Layers,
  MapPin,
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Waves,
  Radio,
  Navigation,
  Info,
  ShieldAlert
} from 'lucide-react';
import { FeatureExtractor, SUBDUCTION_TRENCH_NODES } from '../ml/features/featureExtractor';
import { VERIFIED_HISTORICAL_PRESETS } from '../ml/dataset/datasetManager';
import { RiskAssessment } from '../ml/types';
import { EarthquakeEvent, TsunamiEvent, OceanObservation } from '../types';

interface InteractiveMapProps {
  selectedLat: number | null;
  selectedLng: number | null;
  onSelectLocation: (lat: number, lng: number, locationName?: string) => void;
  onClearLocation: () => void;
  activeAssessment: RiskAssessment | null;
  liveEarthquakes?: EarthquakeEvent[];
  historicalEvents?: TsunamiEvent[];
  oceanStations?: OceanObservation[];
  className?: string;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLat,
  selectedLng,
  onSelectLocation,
  onClearLocation,
  activeAssessment,
  liveEarthquakes = [],
  historicalEvents = [],
  oceanStations = [],
  className = '',
  height = 'h-[500px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  // Layer groups refs
  const layerEarthquakesRef = useRef<L.LayerGroup | null>(null);
  const layerHistoricalRef = useRef<L.LayerGroup | null>(null);
  const layerBuoysRef = useRef<L.LayerGroup | null>(null);
  const layerTrenchesRef = useRef<L.LayerGroup | null>(null);

  // Active Layer visibility state
  const [layersVisibility, setLayersVisibility] = useState({
    earthquakes: true,
    historical: true,
    buoys: true,
    trenches: true
  });

  const [showLayerControl, setShowLayerControl] = useState(false);
  const [mapHoverCoords, setMapHoverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Computed spatial context for currently selected location
  const [spatialContext, setSpatialContext] = useState<{
    trenchDistKm: number;
    isSubduction: boolean;
    nearbyHistorical: string | null;
  } | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Pacific Basin Ring of Fire view (0° N, 140° E)
    const map = L.map(mapContainerRef.current, {
      center: [15, 135],
      zoom: 3,
      minZoom: 2,
      maxZoom: 14,
      zoomControl: false
    });

    // Add Zoom Control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // High quality Dark Ocean tile basemap (CARTO Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Create Layer Groups
    layerEarthquakesRef.current = L.layerGroup().addTo(map);
    layerHistoricalRef.current = L.layerGroup().addTo(map);
    layerBuoysRef.current = L.layerGroup().addTo(map);
    layerTrenchesRef.current = L.layerGroup().addTo(map);

    // Map Click Listener -> Capture exact Lat/Lng
    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;
      
      // Normalize longitude to [-180, 180]
      let normalizedLng = ((clickedLng + 180) % 360 + 360) % 360 - 180;
      let normalizedLat = Math.max(-85, Math.min(85, clickedLat));

      onSelectLocation(normalizedLat, normalizedLng);
    });

    // Map Mouse Move Listener for Coordinate Telemetry
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMapHoverCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number((((e.latlng.lng + 180) % 360 + 360) % 360 - 180).toFixed(4))
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selected location marker & popup whenever selectedLat / selectedLng or activeAssessment changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing selected marker if coordinates cleared
    if (selectedLat === null || selectedLng === null || isNaN(selectedLat) || isNaN(selectedLng)) {
      if (selectedMarkerRef.current) {
        map.removeLayer(selectedMarkerRef.current);
        selectedMarkerRef.current = null;
      }
      setSpatialContext(null);
      return;
    }

    // Compute spatial context
    const trenchDist = FeatureExtractor.calculateDistanceToTrenchKm(selectedLat, selectedLng);
    const isSub = trenchDist <= 250;

    // Find nearby historical preset within 700km
    let nearbyHistName: string | null = null;
    for (const preset of VERIFIED_HISTORICAL_PRESETS) {
      const dist = FeatureExtractor.computeHaversineKm(selectedLat, selectedLng, preset.latitude, preset.longitude);
      if (dist <= 700) {
        nearbyHistName = `${preset.event_name} (${preset.date}, Mw ${preset.magnitude})`;
        break;
      }
    }

    setSpatialContext({
      trenchDistKm: trenchDist,
      isSubduction: isSub,
      nearbyHistorical: nearbyHistName
    });

    // Determine marker appearance based on active assessment risk level
    let ringColor = '#06b6d4'; // Cyan default selection
    let dotBg = '#0891b2';
    let riskLabel = 'SELECTED LOCATION';

    if (activeAssessment) {
      const level = activeAssessment.risk.level;
      if (level === 'CRITICAL' || level === 'EXTREME') {
        ringColor = '#ef4444'; // Red
        dotBg = '#dc2626';
        riskLabel = `CRITICAL RISK (${activeAssessment.risk.score.toFixed(0)}/100)`;
      } else if (level === 'HIGH') {
        ringColor = '#f97316'; // Orange
        dotBg = '#ea580c';
        riskLabel = `HIGH RISK (${activeAssessment.risk.score.toFixed(0)}/100)`;
      } else if (level === 'MODERATE' || level === 'MEDIUM') {
        ringColor = '#f59e0b'; // Amber
        dotBg = '#d97706';
        riskLabel = `MODERATE RISK (${activeAssessment.risk.score.toFixed(0)}/100)`;
      } else {
        ringColor = '#10b981'; // Green
        dotBg = '#059669';
        riskLabel = `LOW RISK (${activeAssessment.risk.score.toFixed(0)}/100)`;
      }
    }

    // Custom pulse HTML for marker icon
    const markerHtml = `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div class="animate-marker-pulse" style="position: absolute; width: 32px; height: 32px; borderRadius: 50%; border: 2px solid ${ringColor}; background: ${ringColor}22;"></div>
        <div style="width: 14px; height: 14px; borderRadius: 50%; background: ${dotBg}; border: 2.5px solid #ffffff; box-shadow: 0 0 10px ${ringColor};"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-selection-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    // Popup HTML
    const popupContent = `
      <div style="padding: 8px; font-family: system-ui, sans-serif; min-width: 210px;">
        <div style="font-size: 10px; font-weight: bold; color: ${ringColor}; font-family: monospace; letter-spacing: 0.05em; text-transform: uppercase;">
          ${riskLabel}
        </div>
        <div style="margin-top: 4px; font-size: 12px; font-weight: 600; color: #f1f5f9;">
          Lat: <span style="font-family: monospace; color: #38bdf8;">${selectedLat.toFixed(6)}°</span>
        </div>
        <div style="font-size: 12px; font-weight: 600; color: #f1f5f9;">
          Lon: <span style="font-family: monospace; color: #38bdf8;">${selectedLng.toFixed(6)}°</span>
        </div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #1e293b; font-size: 10px; color: #94a3b8; font-family: monospace;">
          Subduction Trench: <strong style="color: #e2e8f0;">${trenchDist} km</strong>
        </div>
        ${
          activeAssessment
            ? `<div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: ${ringColor};">
                Probability: ${(activeAssessment.risk.model_probability * 100).toFixed(1)}%
               </div>`
            : `<div style="margin-top: 6px; font-size: 10px; color: #38bdf8; font-weight: 500;">
                ✓ Location Selected for Analysis
               </div>`
        }
      </div>
    `;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setLatLng([selectedLat, selectedLng]);
      selectedMarkerRef.current.setIcon(customIcon);
      selectedMarkerRef.current.getPopup()?.setContent(popupContent);
    } else {
      const marker = L.marker([selectedLat, selectedLng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, { autoClose: false, closeOnClick: false });
      
      marker.openPopup();
      selectedMarkerRef.current = marker;
    }

    // Pan map to selected position if outside current view bounds
    const bounds = map.getBounds();
    if (!bounds.contains([selectedLat, selectedLng])) {
      map.panTo([selectedLat, selectedLng], { animate: true });
    }
  }, [selectedLat, selectedLng, activeAssessment]);

  // Render Layer Markers (Trenches, Live Earthquakes, Historical Tsunamis, DART Buoys)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Subduction Trench Lines & Nodes
    if (layerTrenchesRef.current) {
      layerTrenchesRef.current.clearLayers();
      if (layersVisibility.trenches) {
        SUBDUCTION_TRENCH_NODES.forEach((node) => {
          const circle = L.circleMarker([node.lat, node.lng], {
            radius: 4,
            color: '#f43f5e',
            fillColor: '#881337',
            fillOpacity: 0.8,
            weight: 1
          }).bindPopup(`
            <div style="padding: 4px; font-size: 11px;">
              <strong style="color: #f43f5e;">${node.name}</strong><br/>
              Subduction Trench Reference Node
            </div>
          `);
          circle.addTo(layerTrenchesRef.current!);
        });
      }
    }

    // 2. Live Earthquakes
    if (layerEarthquakesRef.current) {
      layerEarthquakesRef.current.clearLayers();
      if (layersVisibility.earthquakes && liveEarthquakes.length > 0) {
        liveEarthquakes.forEach((eq) => {
          const marker = L.circleMarker([eq.latitude, eq.longitude], {
            radius: Math.max(5, eq.magnitude * 1.5),
            color: '#f59e0b',
            fillColor: '#d97706',
            fillOpacity: 0.7,
            weight: 1.5
          }).bindPopup(`
            <div style="padding: 6px; font-size: 11px;">
              <strong style="color: #fbbf24;">USGS Event: ${eq.location}</strong><br/>
              Magnitude: <strong>Mw ${eq.magnitude.toFixed(1)}</strong><br/>
              Depth: ${eq.depthKm.toFixed(1)} km<br/>
              Time: ${new Date(eq.timestamp).toUTCString()}
            </div>
          `);

          // Clicking live earthquake marker selects it for analysis!
          marker.on('click', () => {
            onSelectLocation(eq.latitude, eq.longitude, eq.location);
          });

          marker.addTo(layerEarthquakesRef.current!);
        });
      }
    }

    // 3. Historical Tsunamis
    if (layerHistoricalRef.current) {
      layerHistoricalRef.current.clearLayers();
      if (layersVisibility.historical) {
        VERIFIED_HISTORICAL_PRESETS.forEach((preset) => {
          const marker = L.circleMarker([preset.latitude, preset.longitude], {
            radius: 6,
            color: '#38bdf8',
            fillColor: '#0284c7',
            fillOpacity: 0.8,
            weight: 1.5
          }).bindPopup(`
            <div style="padding: 6px; font-size: 11px;">
              <strong style="color: #38bdf8;">NOAA Benchmark: ${preset.event_name}</strong><br/>
              Date: ${preset.date}<br/>
              Magnitude: <strong>Mw ${preset.magnitude}</strong>, Depth: ${preset.depth_km} km<br/>
              Verified Tsunami: <strong style="color: #34d399;">YES</strong>
            </div>
          `);

          marker.on('click', () => {
            onSelectLocation(preset.latitude, preset.longitude, preset.event_name);
          });

          marker.addTo(layerHistoricalRef.current!);
        });
      }
    }

    // 4. DART Ocean Buoys
    if (layerBuoysRef.current) {
      layerBuoysRef.current.clearLayers();
      if (layersVisibility.buoys && oceanStations.length > 0) {
        oceanStations.forEach((st) => {
          const marker = L.circleMarker([st.latitude, st.longitude], {
            radius: 4,
            color: '#38bdf8',
            fillColor: '#0369a1',
            fillOpacity: 0.9,
            weight: 1
          }).bindPopup(`
            <div style="padding: 4px; font-size: 11px;">
              <strong style="color: #38bdf8;">DART Buoy: Station ${st.stationId}</strong><br/>
              Status: ${st.status}<br/>
              Sea Level Anomaly: ${st.waterLevelAnomalyM.toFixed(3)} m
            </div>
          `);
          marker.addTo(layerBuoysRef.current!);
        });
      }
    }
  }, [layersVisibility, liveEarthquakes, oceanStations]);

  return (
    <div className={`relative w-full rounded-2xl border border-slate-800 bg-[#050b14] overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* MAP HEADER / TOP CONTROL BAR */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-display font-bold text-slate-100 uppercase tracking-wide">
            Interactive Global Analysis Map
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 font-sans text-[11px] hidden sm:inline">
            Click anywhere to extract coordinates for ML risk estimation
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer Control Dropdown Trigger */}
          <button
            onClick={() => setShowLayerControl(!showLayerControl)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Layers</span>
          </button>

          {/* Reset / Clear Location Button */}
          {selectedLat !== null && selectedLng !== null && (
            <button
              onClick={onClearLocation}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Location</span>
            </button>
          )}
        </div>
      </div>

      {/* LAYER CONTROLS OVERLAY PANEL */}
      {showLayerControl && (
        <div className="absolute top-14 right-4 z-30 w-72 p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono font-bold text-slate-200 uppercase">GIS Layers</span>
            <button
              onClick={() => setShowLayerControl(false)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
              <span className="flex items-center gap-2 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Live Earthquakes (USGS)
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.earthquakes}
                onChange={(e) => setLayersVisibility((p) => ({ ...p, earthquakes: e.target.checked }))}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
              <span className="flex items-center gap-2 text-slate-300">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                Historical Tsunamis (NOAA)
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.historical}
                onChange={(e) => setLayersVisibility((p) => ({ ...p, historical: e.target.checked }))}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
              <span className="flex items-center gap-2 text-slate-300">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                DART Deep-Ocean Buoys
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.buoys}
                onChange={(e) => setLayersVisibility((p) => ({ ...p, buoys: e.target.checked }))}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-cyan-300">
              <span className="flex items-center gap-2 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                Subduction Zone Trenches
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.trenches}
                onChange={(e) => setLayersVisibility((p) => ({ ...p, trenches: e.target.checked }))}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
            </label>
          </div>
        </div>
      )}

      {/* LEAFLET CONTAINER */}
      <div ref={mapContainerRef} className={`w-full ${height} z-10`} />

      {/* FOOTER BAR: SELECTED LOCATION METRICS & TELEMETRY */}
      <div className="relative z-20 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-t border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          {selectedLat !== null && selectedLng !== null ? (
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
              <span>
                Selected: {selectedLat.toFixed(6)}°, {selectedLng.toFixed(6)}°
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Navigation className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Click map to select earthquake epicenter location</span>
            </div>
          )}

          {spatialContext && (
            <div className="hidden md:flex items-center gap-3 text-slate-400 border-l border-slate-800 pl-3">
              <span>Trench Proximity: <strong className="text-slate-200">{spatialContext.trenchDistKm} km</strong></span>
              <span>Subduction: <strong className={spatialContext.isSubduction ? 'text-rose-400' : 'text-slate-400'}>{spatialContext.isSubduction ? 'YES' : 'NO'}</strong></span>
            </div>
          )}
        </div>

        {mapHoverCoords && (
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Cursor: {mapHoverCoords.lat}° N, {mapHoverCoords.lng}° E
          </div>
        )}
      </div>

      {/* CONTEXTUAL HISTORICAL ANALOG BANNER (IF APPLICABLE) */}
      {spatialContext?.nearbyHistorical && (
        <div className="bg-cyan-950/70 border-t border-cyan-800/80 px-4 py-2 text-xs text-cyan-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Nearby Historical Tsunamigenic Benchmark: <strong>{spatialContext.nearbyHistorical}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
