import React, { useState } from 'react'
import { Box, Layers, Columns2, Sparkles, Paintbrush } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { CubeScene } from '../3d/CubeScene'
import { CubeNetEditor } from './CubeNetEditor'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function CubeWorkspace() {
  const { solutionResult, currentStepIndex } = useCubeSolver()
  const [viewMode, setViewMode] = useState('3d') // '3d' | 'net' | 'split'

  const activeMove = solutionResult?.moves?.[currentStepIndex] || null

  return (
    <Card
      title="Cube State & Visualizer"
      subtitle="Interactive 3D WebGL Canvas • 2D Unfolded Net Editor • Real-time State Synchronization"
      icon={Box}
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D View</span>
            </button>
            <button
              onClick={() => setViewMode('net')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'net'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Net</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:flex px-3 py-1 rounded-lg text-xs font-medium transition-all items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>
        </div>
      }
      className="relative"
    >
      {/* Active Move Overlay Banner */}
      {activeMove && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/60 border border-indigo-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="indigo" size="sm" dot>Active Move</Badge>
            <span className="text-xl font-mono font-extrabold text-cyan-300 tracking-wider">
              {activeMove}
            </span>
          </div>
          <span className="text-xs text-slate-300 font-mono">
            Step {currentStepIndex + 1} of {solutionResult.moves.length}
          </span>
        </div>
      )}

      {/* Main View Area */}
      {viewMode === '3d' && (
        <div className="w-full">
          <CubeScene />
        </div>
      )}

      {viewMode === 'net' && (
        <div className="w-full">
          <CubeNetEditor />
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          <CubeScene />
          <CubeNetEditor />
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400">
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
