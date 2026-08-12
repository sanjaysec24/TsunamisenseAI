/**
 * TSUNAMISENSE AI - Historical Tsunami Intelligence Page
 */

import React from 'react';
import { Search } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { AlertPanel } from '../components/AlertPanel';
import { Card } from '../components/Card';
import { DataTableFoundation } from '../components/DataTableFoundation';
import { Input } from '../components/ui/Input';
import { EventCard } from '../components/ui/EventCard';
import { useApp } from '../context/AppContext';
import { tsunamiService } from '../services/tsunami/tsunamiService';

export const HistoryPage: React.FC = () => {
  const { historyFilters, setHistoryFilters } = useApp();

  const filteredEvents = tsunamiService.searchHistoricalEvents(
    historyFilters.region,
    historyFilters.minMagnitude,
    historyFilters.searchQuery
  );

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <SectionHeader
        title="Historical Tsunami Intelligence"
        subtitle="Catalog of catastrophic historical tsunamigenic events for analog matching and hydrodynamic validation."
        badge={<StatusBadge label="HISTORICAL DATASET — PHASE 1" variant="phase" size="sm" />}
      />

      {/* PHASE 1 INTEGRATION BANNER */}
      <AlertPanel
        type="info"
        title="Historical Dataset Integration Status"
        description="This section contains benchmark static reference cases from NOAA/NCEI and USGS records. Complete searchable database query engine integration will occur in Phase 1."
      />

      {/* SEARCH / FILTER CONTROLS */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search events by location, summary, or region..."
            value={historyFilters.searchQuery}
            onChange={(e) => setHistoryFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Showing {filteredEvents.length} Benchmark Reference Events</span>
        </div>
      </div>

      {/* DETAILED HISTORICAL CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} hoverEffect className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                  {event.affectedRegion} • {event.eventTime}
                </span>
                <h3 className="text-lg font-display font-bold text-slate-100">{event.affectedRegion}</h3>
              </div>
              <StatusBadge
                label={`Mw ${event.tsunamiMagnitude || '--'}`}
                variant="warning"
                size="md"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{event.summary}</p>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs text-center font-mono">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Max Run-up</span>
                <span className="font-bold text-cyan-300">{event.maximumWaterHeightM} m</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Est. Fatalities</span>
                <span className="font-bold text-rose-400">{event.fatalitiesEstimate || 'Unknown'}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Source: {event.cause}</span>
              <span className="text-cyan-400">Phase 1 Reference</span>
            </div>
          </Card>
        ))}
      </div>

      {/* TABULAR FOUNDATION */}
      <DataTableFoundation
        title="Historical Benchmark Dataset Index"
        statusBadgeLabel="STATIC BENCHMARKS"
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        columns={[
          {
            key: 'eventTime',
            header: 'Event Date',
            render: (item) => <span className="font-mono text-slate-300">{item.eventTime}</span>
          },
          {
            key: 'affectedRegion',
            header: 'Epicenter / Region',
            render: (item) => <span className="font-semibold text-slate-200">{item.affectedRegion}</span>
          },
          {
            key: 'tsunamiMagnitude',
            header: 'Magnitude',
            render: (item) => (
              <span className="font-mono text-amber-400 font-bold">
                {item.tsunamiMagnitude ? `Mw ${item.tsunamiMagnitude}` : 'N/A'}
              </span>
            )
          },
          {
            key: 'maximumWaterHeightM',
            header: 'Max Water Height',
            render: (item) => <span className="font-mono text-cyan-300">{item.maximumWaterHeightM} m</span>
          },
          {
            key: 'cause',
            header: 'Source Mechanism',
            render: (item) => <span className="text-slate-400 text-xs">{item.cause}</span>
          }
        ]}
      />
    </div>
  );
};
