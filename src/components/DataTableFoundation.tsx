import React from 'react';
import { StatusBadge } from './StatusBadge';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableFoundationProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  title?: string;
  statusBadgeLabel?: string;
}

export function DataTableFoundation<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  title,
  statusBadgeLabel = 'PHASE 1 DATASET INTEGRATION'
}: DataTableFoundationProps<T>) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a1224]/80 backdrop-blur-md overflow-hidden shadow-xl">
      {title && (
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-slate-200 uppercase tracking-wider">
            {title}
          </h3>
          <StatusBadge label={statusBadgeLabel} variant="phase" size="sm" />
        </div>
      )}

      {data.length === 0 ? (
        <div className="p-6">{emptyState}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-xs uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={`px-4 py-3 font-semibold ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-slate-800/40 transition-colors text-slate-300"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
