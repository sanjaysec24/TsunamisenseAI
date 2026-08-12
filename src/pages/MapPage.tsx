/**
 * TSUNAMISENSE AI - Global Risk Map & GIS Viewport
 * 
 * Interactive 5-Layer GIS Viewport powered by Leaflet (CARTO Dark Matter Basemap):
 * - Real geographic coordinates (Lat/Lon)
 * - Live USGS M≥5.5 Earthquake events
 * - Verified NOAA historical tsunamigenic epicenters
 * - DART Deep-ocean buoy telemetry stations
 * - Subduction zone trench boundaries
 * - Click map location to inspect and send to Risk Detector
 */

import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Layers,
  Radio,
  Compass,
  Activity,
  ShieldAlert,
  Waves,
  MapPin,
  Cpu,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InteractiveMap } from '../components/InteractiveMap';
import { useApp } from '../context/AppContext';
import { earthquakeService } from '../services/earthquake/earthquakeService';
import { oceanObservationService } from '../services/oceanObservation/oceanObservationService';
import { EarthquakeEvent, OceanObservation } from '../types';
import { VERIFIED_HISTORICAL_PRESETS } from '../ml/dataset/datasetManager';

export const MapPage: React.FC = () => {
  const {
    analysisInput,
    setAnalysisInput,
    setCurrentRoute,
    activeAssessment,
    runAnalysis
  } = useApp();

  const [liveEvents, setLiveEvents] = useState<EarthquakeEvent[]>([]);
  const [buoys, setBuoys] = useState<OceanObservation[]>([]);
  const [loadingGIS, setLoadingGIS] = useState<boolean>(true);

  const [selectedLat, setSelectedLat] = useState<number | null>(
    typeof analysisInput.latitude === 'number' ? analysisInput.latitude : parseFloat(analysisInput.latitude as string) || null
  );
  const [selectedLng, setSelectedLng] = useState<number | null>(
    typeof analysisInput.longitude === 'number' ? analysisInput.longitude : parseFloat(analysisInput.longitude as string) || null
  );
  const [selectedName, setSelectedName] = useState<string>(analysisInput.locationName || '');

  // Load GIS layers
  useEffect(() => {
    let isMounted = true;
    const fetchGISData = async () => {
      setLoadingGIS(true);
      try {
        const [eqRes, buoyRes] = await Promise.all([
          earthquakeService.getLiveEvents(5.5, 30),
          oceanObservationService.getBuoyTelemetry()
        ]);
        if (isMounted) {
          if (eqRes.status === 'SUCCESS') setLiveEvents(eqRes.events);
          if (buoyRes.status === 'SUCCESS') setBuoys(buoyRes.stations);
        }
      } catch (err) {
        console.warn('GIS data load warning:', err);
      } finally {
        if (isMounted) setLoadingGIS(false);
      }
    };

    fetchGISData();
    return () => { isMounted = false; };
  }, []);

  const handleSelectMapLocation = (lat: number, lng: number, locName?: string) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    const name = locName || `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
    setSelectedName(name);

    setAnalysisInput((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      locationName: name
    }));
  };

  const handleClearMapSelection = () => {
    setSelectedLat(null);
    setSelectedLng(null);
    setSelectedName('');
  };

  const handleSendToAnalyze = () => {
    if (selectedLat !== null && selectedLng !== null) {
      setAnalysisInput((prev) => ({
        ...prev,
        latitude: parseFloat(selectedLat.toFixed(6)),
        longitude: parseFloat(selectedLng.toFixed(6)),
        locationName: selectedName || prev.locationName
      }));
    }
    setCurrentRoute('/analyze');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <SectionHeader
        title="Global Tectonic GIS Viewport"
        subtitle="Real-world geographic mapping platform displaying subduction zone trenches, real-time USGS earthquake telemetry, NOAA tsunamigenic records, and DART buoys."
        badge={<StatusBadge label="5-LAYER LIVE GIS ACTIVE" variant="success" size="sm" pulse />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEAFLET REAL MAP VIEWPORT */}
        <div className="lg:col-span-8 space-y-4">
          <InteractiveMap
            selectedLat={selectedLat}
            selectedLng={selectedLng}
            onSelectLocation={handleSelectMapLocation}
            onClearLocation={handleClearMapSelection}
            activeAssessment={activeAssessment}
            liveEarthquakes={liveEvents}
            oceanStations={buoys}
            height="h-[580px]"
          />
        </div>

        {/* GIS CONTROLS & SELECTED LOCATION DETAILS */}
        <div className="lg:col-span-4 space-y-6">
          {/* SELECTED LOCATION ACTION CARD */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="font-display font-semibold text-sm text-slate-200">
                  Selected Map Location
                </span>
              </div>
            }
          >
            {selectedLat !== null && selectedLng !== null ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800 space-y-2 font-mono">
                  <div className="text-cyan-300 font-bold text-sm">
                    {selectedName || 'Custom Coordinates'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-200 pt-1 border-t border-cyan-900/60">
                    <div>
                      <span className="text-slate-400 text-[10px] block">LATITUDE</span>
                      <span className="text-cyan-400 font-bold">{selectedLat.toFixed(6)}°</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">LONGITUDE</span>
                      <span className="text-cyan-400 font-bold">{selectedLng.toFixed(6)}°</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleSendToAnalyze}
                    variant="primary"
                    size="md"
                    className="w-full font-mono font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    ANALYZE LOCATION IN RISK DETECTOR
                  </Button>

                  <Button
                    onClick={handleClearMapSelection}
                    variant="secondary"
                    size="sm"
                    className="w-full font-mono"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    CLEAR MAP SELECTION
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <div className="p-3 w-fit mx-auto rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-mono text-xs font-bold text-slate-200">No Location Selected</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click anywhere on the map to place a selection marker and extract exact geographic coordinates.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* GIS LAYERS SUMMARY */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-semibold text-sm text-slate-200">
                    Active GIS Data Summary
                  </span>
                </div>
                <StatusBadge label={loadingGIS ? "LOADING" : "ONLINE"} variant={loadingGIS ? "warning" : "success"} size="sm" />
              </div>
            }
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">Live Earthquakes (USGS)</div>
                    <div className="text-[10px] text-slate-400">Mw ≥ 5.5 events in last 30 days</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-400">{liveEvents.length}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Waves className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">Historical Tsunamis (NOAA)</div>
                    <div className="text-[10px] text-slate-400">Verified tsunamigenic catalog</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-sky-400">{VERIFIED_HISTORICAL_PRESETS.length}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">DART Deep-Ocean Buoys</div>
                    <div className="text-[10px] text-slate-400">Sea surface level telemetry</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-cyan-400">{buoys.length || 4}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">Subduction Trench Lines</div>
                    <div className="text-[10px] text-slate-400">Pacific Ring of Fire megathrusts</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-400">22</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
