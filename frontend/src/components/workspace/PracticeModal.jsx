/**
 * Dedicated Interactive Practice Mode Modal (Phase 5C).
 * Allows tactile physical practice of Rubik's Cube solutions with manual confirmations,
 * stopwatch timing, pace analytics, and history recording.
 */

import React, { useEffect } from 'react'
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Zap,
  Award,
  BookOpen,
  Info,
} from 'lucide-react'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { usePracticeSession, PRACTICE_STATUS } from '../../hooks/usePracticeSession'
import { FACE_DETAILS } from '../../coach/coachExplainer'

function formatTimer(ms = 0) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function PracticeModal({ isOpen, onClose, moves = [] }) {
  const {
    currentMove,
    currentMoveIndex,
    totalMoves,
    status,
    elapsedMs,
    progressPercent,
    startPractice,
    confirmMove,
    stepBackward,
    pausePractice,
    resumePractice,
    restartPractice,
    resetSession,
  } = usePracticeSession()

  // Start session when modal opens
  useEffect(() => {
    if (isOpen && moves && moves.length > 0) {
      startPractice(moves)
    } else if (!isOpen) {
      resetSession()
    }
  }, [isOpen, moves, startPractice, resetSession])

  // Keyboard shortcut listener (Space or Enter to confirm)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        // Prevent default scrolling on Space
        e.preventDefault()
        if (status === PRACTICE_STATUS.PRACTICING || status === PRACTICE_STATUS.PAUSED) {
          confirmMove()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, status, confirmMove, onClose])

  if (!isOpen) return null

  const isCompleted = status === PRACTICE_STATUS.COMPLETED
  const isPaused = status === PRACTICE_STATUS.PAUSED

  const faceChar = currentMove ? currentMove[0]?.toUpperCase() : 'U'
  const faceInfo = FACE_DETAILS[faceChar] || {
    name: faceChar,
    color: 'Standard',
    glowClass: 'from-slate-700 to-slate-800 text-slate-100',
    grip: 'Turn the indicated face.',
  }

  let turnDescription = 'Turn 90° clockwise'
  if (currentMove?.includes('2')) turnDescription = 'Turn 180° (double turn)'
  else if (currentMove?.includes("'")) turnDescription = 'Turn 90° counter-clockwise (inverted)'

  const avgTimePerMove = totalMoves > 0 ? ((elapsedMs / 1000) / totalMoves).toFixed(1) : 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 id="practice-modal-title" className="text-base font-bold text-slate-100">
                Practice Mode
              </h3>
              <p className="text-xs text-slate-400">Step-by-step physical solution practice</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close practice mode"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stopwatch & Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Elapsed: <strong className="text-slate-100">{formatTimer(elapsedMs)}</strong>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              Move {isCompleted ? totalMoves : currentMoveIndex + 1} of {totalMoves} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body: Active Move Card vs Completion View */}
        {isCompleted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-emerald-300">Practice Session Complete!</h4>
              <p className="text-xs text-emerald-200/80 mt-1">
                You successfully practiced all {totalMoves} moves on your physical cube.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Time</span>
                <p className="text-base font-bold text-slate-100 font-mono">{formatTimer(elapsedMs)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pace</span>
                <p className="text-base font-bold text-cyan-400 font-mono">{avgTimePerMove}s / move</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="secondary" icon={RotateCcw} onClick={restartPractice}>
                Practice Again
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Move Hero */}
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${faceInfo.glowClass} border shadow-xl text-center space-y-3 relative overflow-hidden`}>
              <Badge variant="primary" size="sm">
                {faceInfo.color} Face ({faceInfo.name})
              </Badge>

              <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center mx-auto text-4xl font-black font-mono shadow-inner text-white">
                {currentMove}
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {turnDescription}
                </h4>
                <p className="text-xs text-slate-200/90 mt-1">
                  {faceInfo.grip}
                </p>
              </div>
            </div>

            {/* Honest Physical Confirmation Callout */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Execute the turn physically on your cube, then press the button below (or hit Space/Enter).
              </span>
            </div>

            {/* Main Action Button */}
            <Button
              variant="primary"
              size="lg"
              icon={CheckCircle2}
              onClick={confirmMove}
              className="w-full py-3.5 text-sm font-bold shadow-lg shadow-cyan-500/20"
            >
              I Completed This Move
            </Button>

            {/* Secondary Utility Controls */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={stepBackward}
                disabled={currentMoveIndex === 0}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Step Back</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={isPaused ? resumePractice : pausePractice}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={restartPractice}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
