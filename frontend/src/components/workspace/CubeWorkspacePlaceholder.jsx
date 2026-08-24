import React, { useState } from 'react'
import { Box, Layers, Eye, Sparkles, RefreshCw } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { parseFacelets, getFaceletColor, getFaceletTextColor } from '../../utils/cubeUtils'
import { useCubeSolver } from '../../hooks/useCubeSolver'
import { CubeScene } from '../3d/CubeScene'

export function CubeWorkspacePlaceholder() {
  const { stateString, solutionResult, currentStepIndex } = useCubeSolver()
  const [viewMode, setViewMode] = useState('3d') // '3d' | 'net'

  const faces = parseFacelets(stateString)
  const activeMove = solutionResult?.moves?.[currentStepIndex] || null

  const renderFaceGrid = (faceLetter, faceName, gridData) => {
    return (
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-mono font-medium text-slate-400 mb-1 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFaceletColor(faceLetter) }} />
          {faceLetter} ({faceName})
        </span>
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
          {gridData.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  backgroundColor: getFaceletColor(cell),
                  color: getFaceletTextColor(cell),
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 hover:scale-105 border border-black/20"
                title={`${faceLetter}[${r},${c}] = ${cell}`}
              >
                <span className="opacity-90">{cell}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <Card
      title="3D Interactive Rubik's Cube"
      subtitle="Full 3D WebGL Canvas • 26 Cubies • Canonical URFDLB Synchronization"
      icon={Box}
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === '3d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Cube
            </button>
            <button
              onClick={() => setViewMode('net')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'net' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Net
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

      {/* Main View: 3D Scene or 2D Net */}
      {viewMode === '3d' ? (
        <CubeScene />
      ) : (
        <div className="flex flex-col items-center justify-center py-6 overflow-x-auto bg-slate-950/40 rounded-2xl border border-slate-800/80">
          {/* Top: U Face */}
          <div className="mb-2">
            {renderFaceGrid('U', 'Up', faces.U)}
          </div>

          {/* Middle: L, F, R, B Faces */}
          <div className="flex items-center gap-2 mb-2">
            {renderFaceGrid('L', 'Left', faces.L)}
            {renderFaceGrid('F', 'Front', faces.F)}
            {renderFaceGrid('R', 'Right', faces.R)}
            {renderFaceGrid('B', 'Back', faces.B)}
          </div>

          {/* Bottom: D Face */}
          <div>
            {renderFaceGrid('D', 'Down', faces.D)}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          WebGL 3D Rendering (React Three Fiber)
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Standard WCA Western Colors (W-R-G-Y-O-B)
        </span>
      </div>
    </Card>
  )
}
