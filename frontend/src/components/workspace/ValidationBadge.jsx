import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react'
import { useCubeSolver } from '../../hooks/useCubeSolver'
import { validateBasicFormat, countFaceletColors } from '../../utils/cubeUtils'

export function ValidationBadge() {
  const { stateString, validationResult, isValidating, validateCurrentState } = useCubeSolver()
  const [isExpanded, setIsExpanded] = useState(false)

  const basic = validateBasicFormat(stateString)
  const counts = countFaceletColors(stateString)

  // Determine aggregate state
  const isPhysicallyValid = basic.isValid && (!validationResult || validationResult.is_valid)
  const isChecking = isValidating

  let bannerStyle = 'bg-slate-900/80 border-slate-800 text-slate-300'
  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />
  let title = 'Ready to Solve'
  let summary = 'Cube state is physically and mathematically solvable.'

  if (isChecking) {
    bannerStyle = 'bg-indigo-950/40 border-indigo-800/40 text-indigo-200'
    icon = <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
    title = 'Validating State...'
    summary = 'Evaluating physical edge orbits, corner twists, and permutation parity.'
  } else if (!basic.isValid) {
    bannerStyle = 'bg-amber-950/40 border-amber-800/40 text-amber-200'
    icon = <AlertTriangle className="w-4 h-4 text-amber-400" />
    title = 'Invalid Configuration'
    summary = basic.message
  } else if (validationResult && !validationResult.is_valid) {
    bannerStyle = 'bg-red-950/40 border-red-800/40 text-red-200'
    icon = <ShieldAlert className="w-4 h-4 text-red-400" />
    title = 'Unsolvable State'
    summary = validationResult.message || 'State violates mathematical Rubik’s cube invariants.'
  }

  // Rules checklist status
  const rules = [
    {
      name: '54 Canonical Facelets (URFDLB)',
      passed: stateString?.length === 54,
      detail: `${stateString?.length || 0}/54 characters`,
    },
    {
      name: '9 Stickers per Color Distribution',
      passed: Object.values(counts).every((c) => c === 9),
      detail: Object.entries(counts)
        .map(([f, c]) => `${f}:${c}`)
        .join(' '),
    },
    {
      name: 'Fixed Western Scheme Centers',
      passed:
        stateString[4] === 'U' &&
        stateString[13] === 'R' &&
        stateString[22] === 'F' &&
        stateString[31] === 'D' &&
        stateString[40] === 'L' &&
        stateString[49] === 'B',
      detail: 'U-W, R-R, F-G, D-Y, L-O, B-B',
    },
    {
      name: 'Edge & Corner Physical Orbits',
      passed: isPhysicallyValid,
      detail: validationResult?.details?.orbit_check || 'Orbit integrity verified',
    },
    {
      name: 'Orientation & Permutation Parity',
      passed: isPhysicallyValid,
      detail: validationResult?.details?.parity_check || 'Parity valid',
    },
  ]

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${bannerStyle}`}>
      {/* Top Main Status Bar */}
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-black/20 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wide">
                {title}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isPhysicallyValid
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    : 'bg-red-950/80 text-red-300 border border-red-700/50'
                }`}
              >
                {isPhysicallyValid ? 'SOLVABLE' : 'UNSOLVABLE'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 truncate max-w-md mt-0.5">
              {summary}
            </p>
          </div>
        </div>

        {/* Toggle details button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/40 text-[11px] font-medium text-slate-300 transition-colors"
          >
            <span>{isExpanded ? 'Hide Rules' : 'Checklist'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Mathematical Rules Drawer */}
      {isExpanded && (
        <div className="p-3.5 bg-black/30 border-t border-white/5 space-y-2 text-xs animate-in slide-in-from-top duration-150">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>Mathematical Validation Rules (Phase 2A Engine)</span>
            <button
              onClick={validateCurrentState}
              disabled={isChecking}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px] underline"
            >
              Re-verify Now
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  {rule.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={`text-xs ${rule.passed ? 'text-slate-300' : 'text-red-300 font-semibold'}`}>
                    {rule.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {rule.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
