import React from 'react'
import { Check } from 'lucide-react'
import { SCAN_FACE_ORDER, SCAN_FACE_METADATA } from '../../types/scan'

export function ScanFaceProgress({ currentFace, capturedFrames, onSelectFace }) {
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#060914]/80 backdrop-blur-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full scrollbar-none">
      {SCAN_FACE_ORDER.map((faceKey) => {
        const meta = SCAN_FACE_METADATA[faceKey]
        const isCurrent = currentFace === faceKey
        const isCaptured = !!capturedFrames[faceKey]

        return (
          <button
            key={faceKey}
            type="button"
            onClick={() => onSelectFace && onSelectFace(faceKey)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
              isCurrent
                ? 'liquid-clay-btn-cyan !py-1 text-slate-950 font-bold scale-105 shadow-[0_0_16px_rgba(0,240,255,0.4)]'
                : isCaptured
                ? 'liquid-clay-btn-secondary !py-1 text-emerald-300 border-emerald-500/30'
                : 'liquid-clay-pill !py-1 text-slate-400 hover:text-slate-200 border-white/10'
            }`}
          >
            {/* Color Swatch Dot */}
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/40 shrink-0 shadow-sm"
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
