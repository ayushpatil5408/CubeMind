import React from 'react'
import { X } from 'lucide-react'
import { CubeNetEditor } from './CubeNetEditor'

export function CubeNetModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full liquid-clay-card rounded-3xl p-6 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="liquid-clay-btn-secondary absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <CubeNetEditor />
      </div>
    </div>
  )
}
