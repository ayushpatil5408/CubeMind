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
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#0C1322]/40 rounded-2xl border border-dashed border-white/10 ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-[#111C33] border border-white/[0.08] text-cyan-400 mb-3.5 shadow-inner">
        <Icon className="w-6 h-6 opacity-85" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <Button onClick={onAction} size="sm" variant="secondary" icon={Sparkles}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}
