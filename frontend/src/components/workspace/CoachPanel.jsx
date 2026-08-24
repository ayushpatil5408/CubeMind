/**
 * AI Solution Coach & Explainable Steps Panel (Phase 5B).
 * Interactive coaching interface synchronized in real time with the 3D playback controller.
 */

import React, { useState, useMemo } from 'react'
import {
  Compass,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { useCubeSolver } from '../../hooks/useCubeSolver'
import { generateCoachingSteps, COACH_MODES } from '../../coach/coachExplainer'

export function CoachPanel() {
  const {
    solutionResult,
    currentStepIndex,
    playbackStatus,
    stepForward,
    stepBackward,
    jumpToStep,
  } = useCubeSolver()

  const [coachMode, setCoachMode] = useState(COACH_MODES.BEGINNER)

  const moves = solutionResult?.moves || []
  const coachingSteps = useMemo(() => {
    return generateCoachingSteps(moves, coachMode)
  }, [moves, coachMode])

  if (!solutionResult || moves.length === 0) {
    return null
  }

  const isCompleted = playbackStatus === 'COMPLETED' || currentStepIndex >= moves.length - 1 && moves.length > 0 && playbackStatus === 'PAUSED' && currentStepIndex === moves.length - 1
  const isStarted = currentStepIndex >= 0
  const activeStep = isStarted && currentStepIndex < coachingSteps.length ? coachingSteps[currentStepIndex] : null
  const nextStep = isStarted && currentStepIndex + 1 < coachingSteps.length ? coachingSteps[currentStepIndex + 1] : (!isStarted && coachingSteps.length > 0 ? coachingSteps[0] : null)

  const toggleMode = () => {
    setCoachMode((prev) =>
      prev === COACH_MODES.BEGINNER ? COACH_MODES.COMPACT : COACH_MODES.BEGINNER
    )
  }

  return (
    <Card
      title="CubeMind AI Coach"
      subtitle={coachMode === COACH_MODES.BEGINNER ? 'Beginner-Friendly Step Explanations' : 'Compact Speed-Solving Mode'}
      icon={Compass}
      glow
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm"
            title="Switch Coach Mode"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{coachMode === COACH_MODES.BEGINNER ? 'Beginner' : 'Compact'}</span>
          </button>
        </div>
      }
    >
      {playbackStatus === 'COMPLETED' ? (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-emerald-300">Solution Completed!</h4>
          <p className="text-xs text-emerald-200/80 max-w-sm mx-auto">
            All {coachingSteps.length} moves have been executed. Your cube is in the canonical solved state.
          </p>
        </div>
      ) : !isStarted ? (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Ready to Begin Solution</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            The coach is ready. Use the Step Forward or Play controls in the Solution Panel to start step 1 of {coachingSteps.length}.
          </p>
          {nextStep && (
            <div className="pt-2">
              <span className="text-[11px] text-indigo-400 font-medium">
                First move: <strong className="font-mono">{nextStep.move}</strong> ({nextStep.moveName})
              </span>
            </div>
          )}
        </div>
      ) : activeStep ? (
        <div className="space-y-4">
          {/* Active Step Hero Card */}
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${activeStep.glowClass} border shadow-lg space-y-3 relative overflow-hidden transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-80">
                  Step {activeStep.stepNumber} of {activeStep.totalSteps}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/30 backdrop-blur-sm border border-white/10">
                  {activeStep.turnType}
                </span>
              </div>
              <Badge variant="primary" size="sm">
                {activeStep.faceColor} Face
              </Badge>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-2xl font-black font-mono shadow-inner">
                {activeStep.move}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-white truncate">
                  {activeStep.moveName}
                </h4>
                <p className="text-xs text-slate-200/90 mt-0.5 leading-relaxed">
                  {activeStep.instruction}
                </p>
              </div>
            </div>

            {/* Pattern Detection Banner if matching trigger */}
            {activeStep.patternName && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 flex items-center gap-2 text-xs">
                <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{activeStep.patternName}</span>
                  {activeStep.patternDescription && (
                    <p className="text-[11px] text-amber-300/80 truncate">
                      {activeStep.patternDescription}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Explanation & Grip Guidance (Beginner Mode) */}
          {coachMode === COACH_MODES.BEGINNER && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Why This Move?</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-5">
                  {activeStep.explanation}
                </p>
              </div>

              {activeStep.hint && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Physical Grip & Turning Advice</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed pl-5">
                    {activeStep.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Up Next Preview */}
          {nextStep && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
              <span className="text-[11px]">Up Next:</span>
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {nextStep.move}
                </span>
                <span>{nextStep.moveName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}
