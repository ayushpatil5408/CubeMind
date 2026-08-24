import React, { useState } from 'react'
import {
  Shuffle,
  Zap,
  RotateCcw,
  Camera,
  Sparkles,
  Sliders,
  PlayCircle,
  HelpCircle,
  History,
  Award,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { ALGORITHM_PRESETS } from '../../utils/cubeUtils'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function ControlsPanel({ onOpenScanner, onOpenPractice, onOpenHistory }) {
  const {
    isLoading,
    generateScramble,
    solveCurrentState,
    resetToSolved,
    activeScramble,
    stateString,
    validationResult,
    solutionResult,
  } = useCubeSolver()

  const [selectedPreset, setSelectedPreset] = useState('')

  const isSolvable = !validationResult || validationResult.is_valid
  const hasSolution = solutionResult?.moves && solutionResult.moves.length > 0

  const handleApplyPreset = (presetId) => {
    setSelectedPreset(presetId)
    const preset = ALGORITHM_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      // In Phase 3, generate a scramble or apply preset through scramble endpoint
      generateScramble(20)
    }
  }

  return (
    <Card
      title="Controls & Engine Triggers"
      subtitle="Execution triggers for Kociemba solving, practice, and WCA scrambles"
      icon={Sliders}
      action={
        onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            title="View local solve and practice history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        )
      }
    >
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Button
          onClick={() => generateScramble(20)}
          isLoading={isLoading}
          variant="secondary"
          size="lg"
          icon={Shuffle}
          className="w-full"
        >
          Scramble Cube (WCA 20)
        </Button>

        <Button
          onClick={() => solveCurrentState()}
          isLoading={isLoading}
          disabled={!isSolvable}
          variant="primary"
          size="lg"
          icon={Zap}
          className={`w-full ${!isSolvable ? 'opacity-60 cursor-not-allowed' : ''}`}
          title={!isSolvable ? 'Fix validation errors before solving' : 'Solve current cube state'}
        >
          Solve with Kociemba
        </Button>
      </div>

      {/* Practice Mode and Camera Scanner Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {onOpenPractice && (
          <Button
            onClick={onOpenPractice}
            disabled={!hasSolution}
            variant="secondary"
            size="md"
            icon={Award}
            className={`w-full border-amber-500/30 text-amber-300 hover:bg-amber-950/40 ${
              !hasSolution ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={hasSolution ? 'Practice current solution step-by-step' : 'Compute a solution first to practice'}
          >
            Practice Solution
          </Button>
        )}

        {onOpenScanner && (
          <Button
            onClick={onOpenScanner}
            variant="outline"
            size="md"
            icon={Camera}
            className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-400"
          >
            Scan with Camera
          </Button>
        )}
      </div>

      {/* Secondary Controls & Preset Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        {/* Preset Algorithms */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Known Algorithm Presets</span>
            <span className="text-[11px] text-slate-500 font-mono">6 presets available</span>
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => handleApplyPreset(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select an algorithm preset...</option>
            {ALGORITHM_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.moves})
              </option>
            ))}
          </select>
        </div>

        {/* Active Scramble Display */}
        {activeScramble && (
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1">
              Active Scramble Applied
            </span>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300/90 break-words">
              {activeScramble}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={resetToSolved}
            variant="outline"
            size="sm"
            icon={RotateCcw}
          >
            Reset to Solved State
          </Button>
        </div>
      </div>
    </Card>
  )
}

