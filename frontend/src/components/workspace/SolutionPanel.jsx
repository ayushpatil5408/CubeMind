import React, { useState } from 'react'
import {
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Clock,
  Hash,
  Activity,
  Award,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { SPEED_PRESETS } from '../../utils/cubeAnimationMapping'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function SolutionPanel() {
  const {
    solutionResult,
    isLoading,
    error,
    currentStepIndex,
    playbackStatus,
    isPlaying,
    playbackSpeed,
    stepForward,
    stepBackward,
    resetPlayback,
    jumpToStep,
    togglePlayback,
    setPlaybackSpeed,
    solveCurrentState,
  } = useCubeSolver()

  const [copied, setCopied] = useState(false)
  const [showOriginalSequence, setShowOriginalSequence] = useState(false)

  const handleCopy = () => {
    const activeMoves = showOriginalSequence
      ? solutionResult?.original_moves || solutionResult?.moves
      : solutionResult?.moves
    if (!activeMoves) return
    navigator.clipboard.writeText(activeMoves.join(' '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <Card title="Solution Engine" icon={Sparkles}>
        <LoadingSpinner message="Kociemba IDA* search in progress..." />
      </Card>
    )
  }

  if (error && !solutionResult) {
    return (
      <Card title="Solution Engine" icon={Sparkles}>
        <ErrorState
          title="Solve Failed"
          message={error}
          onRetry={() => solveCurrentState()}
        />
      </Card>
    )
  }

  if (!solutionResult) {
    return (
      <Card title="Solution Engine" icon={Sparkles}>
        <EmptyState
          title="Ready to Solve"
          description="Click 'Scramble' or 'Solve with Kociemba' in the Controls Panel to compute optimal move sequences."
        />
      </Card>
    )
  }

  const moves = solutionResult.moves || []
  const originalMoves = solutionResult.original_moves || moves
  const isOptimized = !!solutionResult.is_optimized
  const analytics = solutionResult.optimization_analytics || null
  const displayedMoves = showOriginalSequence ? originalMoves : moves

  const isAlreadySolved = solutionResult.status === 'ALREADY_SOLVED' || (solutionResult.success && moves.length === 0)
  const isVerified = solutionResult.verification_result?.is_verified ?? true
  const isCompleted = playbackStatus === 'COMPLETED'

  // Determine badge variant for playback status
  let statusBadgeVariant = 'info'
  if (playbackStatus === 'PLAYING') statusBadgeVariant = 'primary'
  else if (playbackStatus === 'COMPLETED') statusBadgeVariant = 'success'
  else if (playbackStatus === 'PAUSED') statusBadgeVariant = 'warning'

  const progressPercent = moves.length > 0
    ? Math.round(((currentStepIndex + 1) / moves.length) * 100)
    : 100

  return (
    <Card
      title="Optimal Solution & Playback"
      subtitle={solutionResult.solver_name || 'Kociemba Two-Phase Solver'}
      icon={Sparkles}
      glow
      action={
        <div className="flex items-center gap-2">
          {isOptimized && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ⚡ -{analytics?.optimization_percentage}%
            </span>
          )}
          <Badge variant={statusBadgeVariant} size="sm" dot>
            {playbackStatus}
          </Badge>
          <Badge variant={isVerified ? 'success' : 'warning'} size="sm">
            {isVerified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      }
    >
      {/* Solution KPI Metrics Bar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Moves</span>
            <p className="text-lg font-bold text-slate-100 font-mono">
              {solutionResult.move_count ?? moves.length}
              {isOptimized && analytics && (
                <span className="text-[11px] text-slate-400 font-normal ml-1.5 line-through">
                  {analytics.original_move_count}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Solve Time</span>
            <p className="text-lg font-bold text-slate-100 font-mono">
              {typeof solutionResult.solve_time_ms === 'number' ? `${solutionResult.solve_time_ms.toFixed(1)} ms` : '—'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Progress</span>
            <p className="text-xs font-bold text-emerald-400 font-mono">
              {currentStepIndex + 1}/{moves.length} ({progressPercent}%)
            </p>
          </div>
        </div>
      </div>

      {/* Solution Analytics & Face Distribution Breakdown (Phase 5A) */}
      {analytics && !isAlreadySolved && (
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Solution Intelligence Analytics
            </span>
            {isOptimized ? (
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {analytics.moves_saved} moves eliminated (-{analytics.optimization_percentage}%)
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-400">Already optimal</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400 flex-wrap">
            <div className="flex items-center gap-2">
              <span>Faces:</span>
              <span className="font-mono text-slate-300">
                U:{analytics.face_distribution?.U ?? 0} R:{analytics.face_distribution?.R ?? 0} F:{analytics.face_distribution?.F ?? 0} D:{analytics.face_distribution?.D ?? 0} L:{analytics.face_distribution?.L ?? 0} B:{analytics.face_distribution?.B ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <span>Half: {analytics.half_turn_count ?? 0}</span>
              <span>Prime: {analytics.prime_move_count ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      {isAlreadySolved ? (
        <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-emerald-300">Cube is Already Solved</h4>
          <p className="mt-1 text-xs text-emerald-200/80">0 moves required to reach canonical state.</p>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-800/80">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-200"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>

          {/* Move Sequence Interactive Timeline */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  {showOriginalSequence ? 'Raw Solver Output' : 'Solution Move Sequence'}
                </span>
                {isOptimized && (
                  <button
                    onClick={() => setShowOriginalSequence((prev) => !prev)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono ml-1"
                  >
                    {showOriginalSequence ? 'View Optimized' : 'View Raw'}
                  </button>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Moves'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 max-h-40 overflow-y-auto">
              {displayedMoves.map((move, index) => {
                const isActive = !showOriginalSequence && currentStepIndex === index
                const isPast = !showOriginalSequence && currentStepIndex > index

                return (
                  <button
                    key={`${move}-${index}`}
                    onClick={() => {
                      if (!showOriginalSequence) jumpToStep(index)
                    }}
                    title={showOriginalSequence ? `Raw move ${move}` : `Jump to step ${index + 1} (${move})`}
                    className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold transition-all duration-200 ${

                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 scale-105 border border-white/20'
                        : isPast
                        ? 'bg-slate-900 text-slate-500 border border-slate-800/50'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {move}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Playback Finished Banner */}
          {isCompleted && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-300">Solution Playback Completed!</span>
                  <p className="text-[10px] text-emerald-200/80">Canonical cube state is fully solved.</p>
                </div>
              </div>
              <Button
                onClick={resetPlayback}
                size="sm"
                variant="secondary"
                icon={RotateCcw}
              >
                Replay
              </Button>
            </div>
          )}

          {/* Step Playback Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Button
                onClick={resetPlayback}
                size="sm"
                variant="ghost"
                icon={RotateCcw}
                title="Reset to initial state"
              />
              <Button
                onClick={stepBackward}
                disabled={currentStepIndex <= -1}
                size="sm"
                variant="secondary"
                icon={SkipBack}
                title="Step backward one move"
              >
                Prev
              </Button>
              <Button
                onClick={togglePlayback}
                size="sm"
                variant="primary"
                icon={isPlaying ? Pause : Play}
                className="px-4"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                onClick={stepForward}
                disabled={currentStepIndex >= moves.length - 1}
                size="sm"
                variant="secondary"
                icon={SkipForward}
                title="Step forward one move"
              >
                Next
              </Button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px] font-medium">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 font-medium shadow-inner"
              >
                {SPEED_PRESETS.map((sp) => (
                  <option key={sp.value} value={sp.value}>
                    {sp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

