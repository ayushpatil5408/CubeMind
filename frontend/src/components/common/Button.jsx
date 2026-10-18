import React from 'react'

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090F] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.97] select-none tracking-tight cursor-pointer'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px] rounded-xl',
    md: 'px-4.5 py-2 text-xs sm:text-sm gap-2 min-h-[38px] rounded-2xl',
    lg: 'px-6 py-2.5 text-sm sm:text-base gap-2.5 min-h-[46px] rounded-2xl',
  }

  const variantStyles = {
    primary:
      'liquid-clay-btn-cyan',
    amber:
      'liquid-clay-btn-amber',
    secondary:
      'liquid-clay-btn-secondary',
    outline:
      'liquid-clay-btn bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/15 hover:border-cyan-400/40',
    danger:
      'liquid-clay-btn bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white border-red-400/30 border-t-red-200/50 shadow-[0_8px_20px_rgba(239,68,68,0.35)]',
    success:
      'liquid-clay-btn bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/30 border-t-emerald-200/50 shadow-[0_8px_20px_rgba(16,185,129,0.35)]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border-none rounded-xl',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  )
}
