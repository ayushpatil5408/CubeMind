import React from 'react'
import { Loader2 } from 'lucide-react'

export function LoadingSpinner({
  size = 'md',
  message = 'Computing optimal solution...',
  className = '',
}) {
  const sizeStyles = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
        <Loader2 className={`${sizeStyles[size] || sizeStyles.md} text-indigo-400 animate-spin relative z-10`} />
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-300 animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  )
}
