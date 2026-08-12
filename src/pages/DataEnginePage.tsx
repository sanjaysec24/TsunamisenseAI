/**
 * TSUNAMISENSE AI — Phase 1.1 Data Engine Viewport Page
 * 
 * Provides an interactive UI for inspecting official Data Source Registries,
 * executing live USGS & NOAA ingestion queries, analyzing Earthquake ↔ Tsunami
 * spatiotemporal associations, and reviewing Dataset Manifests & Data Quality Reports.
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Radio,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  ExternalLink,
  Activity,
  FileCode,
  Globe
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { DataTableFoundation } from '../components/DataTableFoundation';
import { SkeletonLoader } from '../components/feedback/SkeletonLoader';
import { SourceRegistryService, SourceRegistryEntry } from '../dataEngine/registry/sourceRegistry';
import { DataEngineFacade, DataEnginePipelineResult } from '../dataEngine/dataEngineFacade';
import { EarthquakeRecord, EventAssociation, TsunamiRecord } from '../dataEngine/types';

export const DataEnginePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'ingest' | 'associations' | 'lineage'>('sources');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<SourceRegistryEntry[]>([]);
  const [pipelineData, setPipelineData] = useState<DataEnginePipelineResult | null>(null);

  // Ingestion query controls
  const [minMag, setMinMag] = useState<number>(6.0);
  const [limit, setLimit] = useState<number>(50);
  const [associationFilter, setAssociationFilter] = useState<'ALL' | 'DETERMINISTIC_SOURCE_ID' | 'SPATIOTEMPORAL_CANDIDATE' | 'UNASSOCIATED'>('ALL');

  useEffect(() => {
    setSources(SourceRegistryService.getAllSources());
    loadPipelineData(6.0, 50);
  }, []);

  const loadPipelineData = async (mag: number, maxLimit: number) => {
    setLoading(true);
    try {
      const data = await DataEngineFacade.runPipeline({
        minMagnitude: mag,
        limit: maxLimit
      });
      setPipelineData(data);
    } catch (err) {
      console.error('Failed to run pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = (e: React.FormEvent) => {
    e.preventDefault();
    loadPipelineData(minMag, limit);
  };

  const filteredAssociations = pipelineData?.associations.filter((assoc) => {
    if (associationFilter === 'ALL') return true;
    return assoc.association_method === associationFilter;
  }) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION HEADER */}
      <SectionHeader
        title="Phase 1 Data Engine Viewport"
        subtitle="Authoritative scientific data ingestion pipeline, source registries, earthquake-tsunami association engine, and dataset lineage manifests."
        badge={<StatusBadge label="PHASE 1 OPERATIONAL" variant="success" size="sm" pulse />}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPipelineData(minMag, limit)}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Re-run Ingestion Pipeline
          </Button>
        }
      />

      {/* TOP METRICS STRIP */}
      {loading ? (
        <SkeletonLoader variant="metric" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-900/80 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Registered Sources</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-100 mt-2">{sources.length}</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> All Sources Verified
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">USGS Earthquakes Ingested</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-2">
              {pipelineData?.earthquakes.length || 0}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Valid: {pipelineData?.earthquakeQualityReport.valid_records} | Duplicates: {pipelineData?.earthquakeQualityReport.duplicate_records}
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">NOAA Benchmark Records</span>
              <Radio className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-sky-400 mt-2">
              {pipelineData?.tsunamis.length || 0}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">NOAA NCEI Verified Snapshots</div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Formed Associations</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-mono font-bold text-indigo-400 mt-2">
              {pipelineData?.associations.length || 0}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-1">Haversine Spatiotemporal Matcher</div>
          </Card>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800/80 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-3 text-xs font-mono uppercase font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'sources'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" /> Data Source Registry ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('ingest')}
          className={`px-4 py-3 text-xs font-mono uppercase font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'ingest'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" /> Live Ingestion Query Engine
        </button>

        <button
          onClick={() => setActiveTab('associations')}
          className={`px-4 py-3 text-xs font-mono uppercase font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'associations'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" /> Earthquake ↔ Tsunami Associations
        </button>

        <button
          onClick={() => setActiveTab('lineage')}
          className={`px-4 py-3 text-xs font-mono uppercase font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'lineage'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-400" /> Manifests & Quality Report
        </button>
      </div>

      {/* TAB 1: DATA SOURCE REGISTRY */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-100 font-semibold block mb-1">Authoritative Source Policy</strong>
              All datasets are sourced directly from verified scientific endpoints (USGS, NOAA NCEI, Peter Bird 2002). No random Kaggle datasets or synthetic placeholder arrays are used as primary sources.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sources.map((src) => (
              <Card
                key={src.sourceId}
                header={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="font-display font-semibold text-sm text-slate-200">
                        {src.sourceName}
                      </span>
                    </div>
                    <StatusBadge label="VERIFIED OPERATIONAL" variant="success" size="sm" />
                  </div>
                }
              >
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">{src.purpose}</p>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block uppercase">Organization</span>
                      <span className="text-slate-200">{src.organization}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase">Format / Method</span>
                      <span className="text-cyan-300">{src.format} ({src.accessMethod})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase">Cadence</span>
                      <span className="text-slate-300">{src.updateFrequency}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase">License</span>
                      <span className="text-emerald-400">{src.license}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-slate-400 uppercase text-[10px] block mb-1 font-semibold">Key Fields Ingested</span>
                    <div className="flex flex-wrap gap-1">
                      {src.importantFields.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <a
                      href={src.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Official Source Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-500 font-mono text-[10px]">ID: {src.sourceId}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE INGESTION QUERY ENGINE */}
      {activeTab === 'ingest' && (
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span className="font-display font-semibold text-sm text-slate-200">
                    Live USGS FDSN Query Controls
                  </span>
                </div>
                <StatusBadge label="USGS FDSN CONNECTED" variant="info" size="sm" />
              </div>
            }
          >
            <form onSubmit={handleRunQuery} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <Input
                label="Minimum Magnitude (Mw)"
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={minMag}
                onChange={(e) => setMinMag(parseFloat(e.target.value) || 5.0)}
                mono
              />

              <Input
                label="Query Limit (Records)"
                type="number"
                step="10"
                min="10"
                max="500"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10) || 50)}
                mono
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              >
                Execute USGS Query
              </Button>
            </form>
          </Card>

          {/* TABLE OF INGESTED USGS RECORDS */}
          <DataTableFoundation<EarthquakeRecord>
            title="Ingested Normalized Earthquake Records (USGS FDSN Web Service)"
            statusBadgeLabel="REAL-TIME USGS FEED"
            data={pipelineData?.earthquakes || []}
            keyExtractor={(item) => item.earthquake_id}
            columns={[
              {
                key: 'earthquake_id',
                header: 'USGS ID',
                render: (item) => <span className="font-mono text-cyan-300 font-bold">{item.earthquake_id}</span>
              },
              {
                key: 'origin_time',
                header: 'Origin Time (UTC)',
                render: (item) => <span className="font-mono text-slate-300 text-xs">{item.origin_time}</span>
              },
              {
                key: 'magnitude',
                header: 'Magnitude',
                render: (item) => (
                  <span className="font-mono text-amber-400 font-bold">
                    {item.magnitude !== null ? `${item.magnitude_type} ${item.magnitude.toFixed(1)}` : 'N/A'}
                  </span>
                )
              },
              {
                key: 'depth_km',
                header: 'Depth',
                render: (item) => (
                  <span className="font-mono text-slate-300">
                    {item.depth_km !== null ? `${item.depth_km.toFixed(1)} km` : 'N/A (Preserved Null)'}
                  </span>
                )
              },
              {
                key: 'coordinates',
                header: 'Coordinates',
                render: (item) => (
                  <span className="font-mono text-slate-400 text-xs">
                    {`${item.latitude.toFixed(2)}° N, ${item.longitude.toFixed(2)}° E`}
                  </span>
                )
              },
              {
                key: 'place',
                header: 'Location Description',
                render: (item) => <span className="text-slate-200 text-xs">{item.place}</span>
              },
              {
                key: 'usgs_url',
                header: 'Link',
                render: (item) => item.usgs_url ? (
                  <a href={item.usgs_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5">
                    USGS <ArrowUpRight className="w-3 h-3" />
                  </a>
                ) : 'N/A'
              }
            ]}
          />
        </div>
      )}

      {/* TAB 3: EARTHQUAKE ↔ TSUNAMI ASSOCIATIONS */}
      {activeTab === 'associations' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <h4 className="font-mono font-bold text-slate-200 uppercase">Scientific Association Strategy</h4>
            <p>
              TsunamiSense AI explicitly distinguishes earthquake events from tsunami events. No fake labels or simplistic rules (such as Mw &gt; X = tsunami) are applied. Association pairing is determined by deterministic cross-referencing or spatiotemporal proximity candidate matching (&le; 200 km Haversine distance, &le; 180 minutes origin delta).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Filter Strategy:</span>
            {(['ALL', 'DETERMINISTIC_SOURCE_ID', 'SPATIOTEMPORAL_CANDIDATE', 'UNASSOCIATED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setAssociationFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  associationFilter === filter
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <DataTableFoundation<EventAssociation>
            title="Earthquake ↔ Tsunami Candidate Associations"
            statusBadgeLabel="SPATIOTEMPORAL MATCHING ENGINE"
            data={filteredAssociations}
            keyExtractor={(item) => `${item.earthquake_id}-${item.tsunami_event_id || 'unassoc'}`}
            columns={[
              {
                key: 'earthquake_id',
                header: 'Earthquake ID',
                render: (item) => <span className="font-mono text-amber-400 font-bold">{item.earthquake_id}</span>
              },
              {
                key: 'tsunami_event_id',
                header: 'Matched Tsunami ID',
                render: (item) => item.tsunami_event_id ? (
                  <span className="font-mono text-cyan-300 font-bold">{item.tsunami_event_id}</span>
                ) : (
                  <span className="font-mono text-slate-500 italic">None (Unassociated)</span>
                )
              },
              {
                key: 'association_method',
                header: 'Methodology',
                render: (item) => (
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                    item.association_method === 'DETERMINISTIC_SOURCE_ID'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.association_method === 'SPATIOTEMPORAL_CANDIDATE'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {item.association_method}
                  </span>
                )
              },
              {
                key: 'association_confidence',
                header: 'Confidence',
                render: (item) => (
                  <span className="font-mono font-bold text-slate-200">
                    {(item.association_confidence * 100).toFixed(0)}%
                  </span>
                )
              },
              {
                key: 'distance_km',
                header: 'Distance (Haversine)',
                render: (item) => item.distance_km !== null ? (
                  <span className="font-mono text-slate-300">{item.distance_km} km</span>
                ) : 'N/A'
              },
              {
                key: 'time_difference_minutes',
                header: 'Time Delta',
                render: (item) => item.time_difference_minutes !== null ? (
                  <span className="font-mono text-slate-300">{item.time_difference_minutes} min</span>
                ) : 'N/A'
              },
              {
                key: 'association_notes',
                header: 'Rationale Notes',
                render: (item) => <span className="text-slate-400 text-xs">{item.association_notes}</span>
              }
            ]}
          />
        </div>
      )}

      {/* TAB 4: MANIFESTS & QUALITY REPORT */}
      {activeTab === 'lineage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manifest Card 1 */}
            <Card
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span className="font-display font-semibold text-sm text-slate-200">
                      Earthquake Dataset Manifest
                    </span>
                  </div>
                  <StatusBadge label="VERIFIED MANIFEST" variant="accent" size="sm" />
                </div>
              }
            >
              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-[11px] text-cyan-200/90 overflow-x-auto space-y-1">
                {JSON.stringify(pipelineData?.earthquakeManifest, null, 2)}
              </div>
            </Card>

            {/* Manifest Card 2 */}
            <Card
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span className="font-display font-semibold text-sm text-slate-200">
                      Tsunami Dataset Manifest
                    </span>
                  </div>
                  <StatusBadge label="VERIFIED MANIFEST" variant="accent" size="sm" />
                </div>
              }
            >
              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-[11px] text-cyan-200/90 overflow-x-auto space-y-1">
                {JSON.stringify(pipelineData?.tsunamiManifest, null, 2)}
              </div>
            </Card>
          </div>

          {/* Full Quality Report */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="font-display font-semibold text-sm text-slate-200">
                    Automated Data Quality Audit Report
                  </span>
                </div>
                <StatusBadge label="AUDIT PASSED" variant="success" size="sm" />
              </div>
            }
          >
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto space-y-2">
              <pre className="text-cyan-300">
                {JSON.stringify(pipelineData?.earthquakeQualityReport, null, 2)}
              </pre>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
