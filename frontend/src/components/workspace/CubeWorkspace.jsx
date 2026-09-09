import React, { useState } from 'react'
import { Box, Layers, Columns2, Sparkles, Maximize2, Minimize2 } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { CubeScene } from '../3d/CubeScene'
import { CubeNetEditor } from './CubeNetEditor'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function CubeWorkspace() {
  const { solutionResult, currentStepIndex } = useCubeSolver()
  const [viewMode, setViewMode] = useState('3d') // '3d' | 'net' | 'split' | 'focus'

  const activeMove = solutionResult?.moves?.[currentStepIndex] || null

  let moveDescription = ''
  if (activeMove) {
    if (activeMove.includes('2')) moveDescription = '180° Half Turn'
    else if (activeMove.includes("'")) moveDescription = '90° Counter-Clockwise (Inverted)'
    else moveDescription = '90° Clockwise Turn'
  }

  return (
    <Card
      title="Cube State & Visualizer"
      subtitle="Holographic 3D WebGL Canvas • 2D Unfolded Net • Real-Time Synchronization"
      icon={Box}
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-[#06090F] p-1 border border-white/[0.08] shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('net')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'net'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Net</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden md:flex px-3 py-1 rounded-lg text-xs font-medium transition-all items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'focus' ? '3d' : 'focus')}
              title={viewMode === 'focus' ? 'Exit Focus Mode' : 'Enter Expanded Focus Mode'}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                viewMode === 'focus'
                  ? 'bg-violet-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              {viewMode === 'focus' ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Focus</span>
            </button>
          </div>
        </div>
      }
      className="relative"
    >
      {/* Active Move Holographic Overlay Banner */}
      {activeMove && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-indigo-950/40 to-[#0C1322] border border-cyan-500/30 flex items-center justify-between shadow-lg shadow-cyan-950/20 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <Badge variant="indigo" size="sm" dot>
              Active Move
            </Badge>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-mono font-black text-cyan-300 tracking-wider">
                {activeMove}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                ({moveDescription})
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-300 font-mono">
            Step {currentStepIndex + 1} of {solutionResult.moves.length}
          </span>
        </div>
      )}

      {/* Main 3D / 2D / Split Viewport Stage */}
      {viewMode === '3d' && (
        <div className="w-full">
          <CubeScene heightClass="h-[420px] sm:h-[480px]" />
        </div>
      )}

      {viewMode === 'focus' && (
        <div className="w-full animate-in fade-in duration-200">
          <CubeScene heightClass="h-[560px] sm:h-[620px]" />
        </div>
      )}

      {viewMode === 'net' && (
        <div className="w-full">
          <CubeNetEditor />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          <CubeScene heightClass="h-[400px] sm:h-[440px]" />
          <CubeNetEditor />
        </div>
      )}

      {/* Workspace Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Real-time Two-Way Canonical URFDLB Synchronization
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Standard WCA Western Colors (W-R-G-Y-O-B)
        </span>
      </div>
    </Card>
  )
}
