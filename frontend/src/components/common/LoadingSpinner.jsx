import React from 'react'

export function LoadingSpinner({
  size = 'md',
  message = 'Computing optimal solution...',
  className = '',
}) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-lg" />
        <svg
          className={`${sizeStyles[size] || sizeStyles.md} animate-spin text-cyan-400 relative z-10`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && (
        <p className="mt-3 text-xs sm:text-sm font-medium text-slate-300 tracking-wide font-mono">
          {message}
        </p>
      )}
    </div>
  )
}
