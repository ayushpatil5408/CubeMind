import React from 'react'
import { Box, Sparkles } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon = Box,
  title = 'No Solution Generated',
  description = 'Scramble the cube or enter an algorithm to generate a step-by-step solution.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border-dashed border-slate-800 ${className}`}>
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="mt-1.5 text-xs text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm" variant="secondary" icon={Sparkles}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}
