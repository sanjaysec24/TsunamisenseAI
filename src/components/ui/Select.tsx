/**
 * TSUNAMISENSE AI - Reusable Select Dropdown Component
 */

import React, { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-mono uppercase text-slate-300 font-semibold"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-slate-100 text-sm focus:outline-none transition-colors duration-150 font-sans cursor-pointer',
          error
            ? 'border-rose-500/80 focus:border-rose-400 bg-rose-950/20'
            : 'border-slate-700/80 focus:border-cyan-400',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-[11px] font-mono text-rose-400">⚠ {error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
