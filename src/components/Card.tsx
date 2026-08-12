import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  hoverEffect = true
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-800/80 bg-[#0b1326]/80 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-700/80 hover:bg-[#0f1b33]/90 hover:shadow-cyan-950/20' : ''
      } ${className}`}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-900/30 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/40 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
