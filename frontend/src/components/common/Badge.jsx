import React from 'react'

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const baseStyles = 'liquid-clay-pill inline-flex items-center font-semibold select-none transition-all duration-200'

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-xs sm:text-sm gap-2',
  }

  const variantStyles = {
    neutral: 'bg-slate-900/80 text-slate-200 border-white/20',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    error: 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    info: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]',
    indigo: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
  }

  const dotColors = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
    warning: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]',
    error: 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]',
    info: 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]',
    indigo: 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]',
  }

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.neutral}`} />}
      <span>{children}</span>
    </span>
  )
}
