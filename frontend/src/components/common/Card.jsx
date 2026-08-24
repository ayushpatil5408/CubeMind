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
      className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
        glow ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/10' : ''
      } ${className}`}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-semibold text-slate-100 tracking-wide">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  )
}
