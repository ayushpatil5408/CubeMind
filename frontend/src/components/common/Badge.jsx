import React from 'react'

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border'

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }

  const variantStyles = {
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  }

  const dotColors = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    info: 'bg-cyan-400 animate-pulse',
    indigo: 'bg-indigo-400 animate-pulse',
  }

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral}`} />}
      {children}
    </span>
  )
}
