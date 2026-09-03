import React from 'react'

export function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  bodyClassName = '',
  glow = false,
}) {
  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden transition-all duration-200 ${
        glow ? 'border-cyan-500/25 shadow-lg shadow-cyan-950/20' : ''
      } ${className}`}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#0C1322]/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0 ml-3">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  )
}
