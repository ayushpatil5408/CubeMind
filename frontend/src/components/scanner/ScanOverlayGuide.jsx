import React from 'react'
import { Focus, Sparkles } from 'lucide-react'

export function ScanOverlayGuide({ currentFaceMeta }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 z-10 select-none">
      {/* Top Guidance Banner */}
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#06090F]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl max-w-sm text-center">
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-md border border-black/40 shrink-0"
            style={{ backgroundColor: currentFaceMeta.color }}
          />
          <span className="text-sm font-bold text-white font-mono tracking-tight">
            Scanning {currentFaceMeta.name} Face
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-tight">
          {currentFaceMeta.instruction}
        </p>
      </div>

      {/* Center 3x3 Laser Reticle Box */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
        {/* Corner Holographic Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl shadow-[0_0_12px_#06b6d4]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl shadow-[0_0_12px_#06b6d4]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl shadow-[0_0_12px_#06b6d4]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl shadow-[0_0_12px_#06b6d4]" />

        {/* 3x3 Grid Cells */}
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-cyan-500/30 rounded-lg overflow-hidden bg-cyan-950/10 backdrop-blur-[1px]">
          {Array.from({ length: 9 }).map((_, i) => {
            const isCenter = i === 4
            return (
              <div
                key={i}
                className={`border border-cyan-500/20 flex items-center justify-center transition-all ${
                  isCenter ? 'bg-cyan-500/15' : ''
                }`}
              >
                {isCenter && (
                  <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-black/60 border border-white/20 shadow-inner">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow border border-white/40"
                      style={{ backgroundColor: currentFaceMeta.color }}
                    />
                    <span className="text-[9px] font-bold font-mono text-cyan-200 uppercase tracking-tight">
                      Center
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Outer Focus Glow */}
        <div className="absolute inset-0 rounded-xl border border-cyan-400/25 shadow-[0_0_30px_rgba(6,182,212,0.15)] pointer-events-none" />
      </div>

      {/* Bottom Alignment Hint */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06090F]/90 backdrop-blur-xl border border-white/[0.08] text-[11px] text-slate-300 font-medium shadow-md">
        <Focus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Align 3x3 stickers evenly inside the laser reticle</span>
      </div>
    </div>
  )
}
