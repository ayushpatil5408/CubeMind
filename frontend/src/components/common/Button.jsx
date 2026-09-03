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
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090F] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none tracking-tight'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[30px]',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2 min-h-[36px]',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5 min-h-[44px]',
  }

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-500 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-sm shadow-cyan-950/30 border border-cyan-400/25',
    secondary:
      'bg-[#111C33]/90 hover:bg-[#162444] text-slate-100 border border-white/10 hover:border-white/20 shadow-sm',
    outline:
      'bg-transparent hover:bg-[#111C33]/60 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-sm shadow-red-950/30 border border-red-400/25',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-950/30 border border-emerald-400/25',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border-none',
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
