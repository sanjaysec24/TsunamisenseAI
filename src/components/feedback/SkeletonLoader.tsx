/**
 * TSUNAMISENSE AI - Skeleton Loading Component
 * 
 * Reusable subtle skeleton indicators for dashboard cards, tables, and metrics.
 */

import React from 'react';
import { cn } from '../../utils';

export interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'metric' | 'text';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const items = Array.from({ length: count });

  if (variant === 'metric') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 animate-pulse"
          >
            <div className="h-3 w-1/2 bg-slate-800 rounded" />
            <div className="h-7 w-3/4 bg-slate-800 rounded" />
            <div className="h-2 w-1/3 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800', className)}>
        <div className="h-4 w-1/4 bg-slate-800 rounded mb-4" />
        {items.map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 animate-pulse">
            <div className="h-3 w-1/3 bg-slate-800 rounded" />
            <div className="h-3 w-1/4 bg-slate-800 rounded" />
            <div className="h-3 w-1/6 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 animate-pulse"
        >
          <div className="h-4 w-2/3 bg-slate-800 rounded" />
          <div className="h-3 w-full bg-slate-800/60 rounded" />
          <div className="h-3 w-4/5 bg-slate-800/60 rounded" />
        </div>
      ))}
    </div>
  );
};
