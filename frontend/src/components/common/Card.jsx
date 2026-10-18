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
      className={`liquid-clay-card rounded-3xl overflow-hidden transition-all duration-300 ${
        glow ? 'border-cyan-400/40 shadow-xl shadow-cyan-950/30' : ''
      } ${className}`}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/10 border border-cyan-400/30 text-cyan-300 shrink-0 shadow-[0_2px_8px_rgba(0,240,255,0.2)]">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
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
      <div className={`p-5 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  )
}
