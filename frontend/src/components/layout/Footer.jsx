import React from 'react'
import { Terminal, ShieldCheck, Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300">CubeMind AI Engine</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Mathematical Parity Verified
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-indigo-400 hidden sm:inline-flex">
            <Zap className="w-3.5 h-3.5" />
            IDA* Two-Phase Algorithm
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>54-Facelet URFDLB Contract</span>
          <span>•</span>
          <span>v0.3.0-alpha</span>
        </div>
      </div>
    </footer>
  )
}
