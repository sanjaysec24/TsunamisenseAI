/**
 * TSUNAMISENSE AI - Reusable Form Input Component
 */

import React, { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightBadge?: ReactNode;
  mono?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightBadge,
  mono = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-mono uppercase text-slate-300 font-semibold flex items-center justify-between"
        >
          <span>{label}</span>
          {rightBadge && <span>{rightBadge}</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border text-slate-100 text-sm focus:outline-none transition-colors duration-150',
            error
              ? 'border-rose-500/80 focus:border-rose-400 bg-rose-950/20'
              : 'border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30',
            leftIcon ? 'pl-10' : '',
            mono ? 'font-mono' : 'font-sans',
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
