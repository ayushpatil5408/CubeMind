import React from 'react'
import { Check } from 'lucide-react'
import { SCAN_FACE_ORDER, SCAN_FACE_METADATA } from '../../types/scan'

export function ScanFaceProgress({ currentFace, capturedFrames, onSelectFace }) {
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#06090F]/90 backdrop-blur-xl border border-white/[0.08] shadow-xl overflow-x-auto max-w-full scrollbar-none">
      {SCAN_FACE_ORDER.map((faceKey) => {
        const meta = SCAN_FACE_METADATA[faceKey]
        const isCurrent = currentFace === faceKey
        const isCaptured = !!capturedFrames[faceKey]

        return (
          <button
            key={faceKey}
            type="button"
            onClick={() => onSelectFace && onSelectFace(faceKey)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all select-none ${
              isCurrent
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold shadow-md shadow-cyan-500/25 scale-105 border border-white/20'
                : isCaptured
                ? 'bg-[#0C1322] text-slate-300 border border-white/[0.08] hover:bg-[#111C33]'
                : 'bg-[#06090F]/40 text-slate-500 border border-white/[0.04] hover:text-slate-400'
            }`}
          >
            {/* Color Swatch Dot */}
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/40 shrink-0"
              style={{ backgroundColor: meta.color }}
            />
            <span>{faceKey}</span>

            {/* Checkmark badge */}
            {isCaptured && (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}
