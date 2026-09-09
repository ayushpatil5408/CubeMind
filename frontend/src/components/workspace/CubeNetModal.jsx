import React from 'react'
import { X } from 'lucide-react'
import { CubeNetEditor } from './CubeNetEditor'

export function CubeNetModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full glass-base pod-squircle p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-cyan-500/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <CubeNetEditor />
      </div>
    </div>
  )
}
