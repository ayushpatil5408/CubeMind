import React, { useState } from 'react'
import {
  Shuffle,
  Zap,
  RotateCcw,
  Camera,
  Sparkles,
  Sliders,
  History,
  Award,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { ALGORITHM_PRESETS, validateBasicFormat } from '../../utils/cubeUtils'
import { applyAlgorithmToState } from '../../utils/cubeMoveEngine'
import { SOLVED_STATE_STRING } from '../../types/cube'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function ControlsPanel({ onOpenScanner, onOpenPractice, onOpenHistory }) {
  const {
    isLoading,
    isScrambling,
    generateScramble,
    solveCurrentState,
    resetToSolved,
    setEntireState,
    activeScramble,
    stateString,
    validationResult,
    solutionResult,
    backendHealth,
  } = useCubeSolver()

  const [selectedPreset, setSelectedPreset] = useState('')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const basicFormat = validateBasicFormat(stateString)
  const isPhysicallySolvable = basicFormat.isValid && (!validationResult || validationResult.is_valid)
  const isSolved = stateString === SOLVED_STATE_STRING
  const isConnected = backendHealth.status === 'connected'
  const hasSolution = solutionResult?.moves && solutionResult.moves.length > 0

  const handleApplyPreset = (presetId) => {
    setSelectedPreset(presetId)
    const preset = ALGORITHM_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      try {
        const nextState = applyAlgorithmToState(SOLVED_STATE_STRING, preset.moves)
        setEntireState(nextState, `preset_${preset.id}`)
      } catch (e) {
        generateScramble(20)
      }
    }
  }

  // Section 3 & 6: Smart Contextual Status & Guidance
  let statusBadge = {
    label: 'READY',
    subtext: 'Cube Solved & Solvable',
    color: 'emerald',
    icon: CheckCircle2,
  }

  if (isLoading) {
    statusBadge = {
      label: 'ANALYZING',
      subtext: 'Kociemba IDA* Engine Processing...',
      color: 'cyan',
      icon: Activity,
    }
  } else if (!isPhysicallySolvable) {
    statusBadge = {
      label: 'INVALID STATE',
      subtext: validationResult?.message || basicFormat.message || 'Parity violation detected',
      color: 'red',
      icon: AlertTriangle,
    }
  } else if (!isSolved) {
    statusBadge = {
      label: 'SCRAMBLED',
      subtext: hasSolution ? 'Solution Generated' : 'Ready for Kociemba Solve',
      color: 'cyan',
      icon: Sparkles,
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
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs text-cyan-300 hover:text-white bg-[#06090F] hover:bg-[#111C33] border border-white/[0.08] font-medium transition-all shadow-sm"
            title="View local solve and practice history"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History</span>
          </button>
        )
      }
    >
      {/* SECTION 3 & 4: Live Cube & AI Engine Status HUD Bar */}
      <div className="mb-4 p-3 rounded-xl bg-[#06090F] border border-white/[0.06] flex items-center justify-between gap-2">
        {/* Left: Cube State Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              statusBadge.color === 'emerald'
                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                : statusBadge.color === 'cyan'
                ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse'
                : 'bg-red-400 shadow-[0_0_8px_#ef4444]'
            }`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-200 uppercase">
                {statusBadge.label}
              </span>
              <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                • {statusBadge.subtext}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Engine Telemetry Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 border ${
              isConnected
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                : 'bg-red-950/50 text-red-300 border-red-500/30'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{isConnected ? 'Engine Online' : 'API Offline'}</span>
          </span>
        </div>
      </div>

      {/* SECTION 1: HERO ACTION — Solve with Kociemba */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => solveCurrentState()}
          disabled={isLoading || !isPhysicallySolvable}
          title={!isPhysicallySolvable ? 'Fix validation errors before solving' : 'Execute Kociemba IDA* Solve'}
          className={`relative w-full group overflow-hidden rounded-2xl p-[1px] transition-all duration-200 active:scale-[0.99] ${
            !isPhysicallySolvable
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:shadow-lg hover:shadow-cyan-500/20'
          }`}
        >
          {/* Animated Neon Gradient Rim */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Inner Surface */}
          <div className="relative flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-[15px] bg-gradient-to-r from-[#0C1322] via-[#0E172A] to-[#121A2F] text-white font-semibold text-sm transition-all group-hover:bg-opacity-80">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="tracking-wide font-mono text-cyan-300">Searching IDA* Solution Tree...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/30 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">Solve with Kociemba</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 ml-1">
                  IDA*
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Primary Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        <Button
          onClick={() => generateScramble(20)}
          isLoading={isLoading || isScrambling}
          variant="secondary"
          size="md"
          icon={Shuffle}
          className="w-full"
        >
          {isScrambling ? 'Scrambling 3D Cube...' : 'Scramble Cube (WCA 20)'}
        </Button>

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

      {/* Practice & Quick Reset Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
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

        <Button
          onClick={resetToSolved}
          variant="ghost"
          size="md"
          icon={RotateCcw}
          className="w-full text-slate-400 hover:text-slate-200 border border-white/[0.04]"
        >
          Reset to Solved State
        </Button>
      </div>

      {/* SECTION 2: SOLVER MODE & PRESETS DOCK */}
      <div className="p-3.5 rounded-2xl bg-[#06090F] border border-white/[0.06] space-y-3">
        {/* Preset Selector Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Known Algorithm Presets
            </span>
            <span className="text-[10px] text-slate-500 font-mono">6 Speedcubing Patterns</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {ALGORITHM_PRESETS.map((p) => {
              const isSelected = selectedPreset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p.id)}
                  title={`${p.name}: ${p.moves}`}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all text-left truncate ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-[#0C1322] text-slate-400 hover:text-slate-200 hover:bg-[#111C33] border border-white/[0.04]'
                  }`}
                >
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{p.moves}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Scramble Display Banner */}
        {activeScramble && (
          <div className="pt-2 border-t border-white/[0.04]">
            <span className="block text-[10px] font-mono text-slate-400 mb-1">
              Active Scramble Applied (WCA 20):
            </span>
            <div className="p-2 rounded-xl bg-[#0C1322] border border-amber-500/30 font-mono text-xs text-amber-300/90 break-words">
              {activeScramble}
            </div>
          </div>
        )}

        {/* Expandable Advanced Settings (Progressive Disclosure) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center justify-between w-full py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>Advanced Solver Settings</span>
            {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedSettings && (
            <div className="mt-2 p-3 rounded-xl bg-[#0C1322] border border-white/[0.06] space-y-2.5 text-xs text-slate-300 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span>Solver Algorithm:</span>
                <span className="font-mono text-cyan-400 text-[11px] font-semibold">
                  Kociemba Two-Phase IDA*
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max Search Depth:</span>
                <span className="font-mono text-slate-400 text-[11px]">24 Moves (God's Number ≤ 20)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phase 1 Subgroup:</span>
                <span className="font-mono text-slate-400 text-[11px]">G0 = &lt;U, D, R, L, F, B&gt; → G1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phase 2 Subgroup:</span>
                <span className="font-mono text-slate-400 text-[11px]">G1 = &lt;U, D, R2, L2, F2, B2&gt;</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
