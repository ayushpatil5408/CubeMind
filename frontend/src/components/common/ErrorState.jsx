import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({
  title = 'Solving Error',
  message = 'An unexpected error occurred during state solving.',
  details,
  onRetry,
  className = '',
}) {
  return (
    <div className={`p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-slate-200 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-red-300">{title}</h4>
          <p className="mt-1 text-xs text-red-200/80 leading-relaxed">{message}</p>
          {details && (
            <pre className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-red-500/20 text-[11px] text-red-300/90 font-mono overflow-x-auto">
              {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
          {onRetry && (
            <div className="mt-4">
              <Button onClick={onRetry} size="sm" variant="danger" icon={RotateCcw}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
