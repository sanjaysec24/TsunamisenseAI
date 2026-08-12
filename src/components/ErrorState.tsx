import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Warning or Subsystem Error',
  message = 'A subsystem reported an exception. Ensure required Phase dependencies are initialized.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-xl border border-rose-900/50 bg-rose-950/20 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
      <AlertOctagon className="w-8 h-8 text-rose-400" />
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/80 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Re-initialize Module
        </Button>
      )}
    </div>
  );
};
