import React from 'react'
import { Terminal, ShieldCheck, Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#06090F]/90 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <span className="font-semibold text-slate-200 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            CubeMind AI Engine
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Parity Invariants Verified
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-violet-300 font-mono text-[11px] hidden sm:inline-flex">
            <Zap className="w-3.5 h-3.5" />
            Kociemba IDA* Solver
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-slate-500">
          <span>54-Facelet Canonical Contract</span>
          <span>•</span>
          <span className="text-cyan-400/80">v2.6.0-cinematic</span>
        </div>
      </div>
    </footer>
  )
}
