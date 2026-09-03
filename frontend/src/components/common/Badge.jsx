import React from 'react'

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors select-none'

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-xs sm:text-sm gap-2',
  }

  const variantStyles = {
    neutral: 'bg-[#111C33]/80 text-slate-300 border-white/10',
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
    error: 'bg-red-950/40 text-red-300 border-red-500/30',
    info: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30',
    indigo: 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30',
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
