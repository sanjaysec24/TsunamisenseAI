/**
 * TSUNAMISENSE AI - Earthquake & Tsunami Event Card Component
 */

import React from 'react';
import { MapPin, Calendar, Waves, ArrowUpRight } from 'lucide-react';
import { EarthquakeEvent, TsunamiEvent } from '../../types';
import { formatCoordinates } from '../../utils';
import { Card } from '../Card';
import { StatusBadge } from '../StatusBadge';

export interface EventCardProps {
  earthquake?: EarthquakeEvent;
  tsunami?: TsunamiEvent;
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ earthquake, tsunami, onClick }) => {
  if (earthquake) {
    return (
      <Card
        onClick={onClick}
        className="hover:border-cyan-500/50 cursor-pointer transition-colors"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold text-cyan-400">
                M {earthquake.magnitude.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {earthquake.magnitudeType || 'Mw'}
              </span>
            </div>
            <StatusBadge label={earthquake.status} variant="info" size="sm" />
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{earthquake.location}</span>
            </h4>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Depth: {earthquake.depthKm} km | {formatCoordinates(earthquake.latitude, earthquake.longitude)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(earthquake.eventTime).toLocaleString()}
            </span>
            <span className="text-cyan-400 flex items-center gap-0.5 hover:underline">
              View <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Card>
    );
  }

  if (tsunami) {
    return (
      <Card
        onClick={onClick}
        className="hover:border-cyan-500/50 cursor-pointer transition-colors"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-mono font-bold text-slate-200">
                Max Wave: {tsunami.maximumWaterHeightM ? `${tsunami.maximumWaterHeightM}m` : 'N/A'}
              </span>
            </div>
            <StatusBadge label="HISTORICAL DATASET" variant="neutral" size="sm" />
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{tsunami.affectedRegion}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tsunami.summary}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Date: {tsunami.eventTime}</span>
            <span>Fatalities: {tsunami.fatalitiesEstimate || 'Unknown'}</span>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};
