/**
 * Local Session History Modal (Phase 5C).
 * Displays local historical solve solutions and practice sessions with clearing controls.
 */

import React, { useState, useEffect } from 'react'
import {
  X,
  History,
  Trash2,
  CheckCircle2,
  Clock,
  Hash,
  Zap,
  Award,
  Calendar,
} from 'lucide-react'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  getSolveHistory,
  getPracticeHistory,
  clearSolveHistory,
  clearPracticeHistory,
  clearAllHistory,
} from '../../utils/sessionHistory'

function formatDate(isoStr) {
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Recent'
  }
}

export function SessionHistoryModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('solves') // 'solves' | 'practice'
  const [solveRecords, setSolveRecords] = useState([])
  const [practiceRecords, setPracticeRecords] = useState([])

  const loadHistory = () => {
    setSolveRecords(getSolveHistory())
    setPracticeRecords(getPracticeHistory())
  }

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClear = () => {
    if (window.confirm(`Are you sure you want to clear ${activeTab === 'solves' ? 'solve' : 'practice'} history?`)) {
      if (activeTab === 'solves') {
        clearSolveHistory()
      } else {
        clearPracticeHistory()
      }
      loadHistory()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-base font-bold text-slate-100">
                Session History
              </h3>
              <p className="text-xs text-slate-400">Local solve records & practice metrics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close session history"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection & Clear Actions */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('solves')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'solves'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solves ({solveRecords.length})
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'practice'
                  ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Practice ({practiceRecords.length})
            </button>
          </div>

          {(activeTab === 'solves' ? solveRecords.length > 0 : practiceRecords.length > 0) && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              title="Clear current tab history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-96">
          {activeTab === 'solves' ? (
            solveRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-950/40 border border-slate-800/80">
                No solve records found. Solve a cube in the workspace to record your solutions!
              </div>
            ) : (
              solveRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{rec.solverName}</span>
                      {rec.isOptimized && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⚡ Optimized
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(rec.timestamp)}
                      </span>
                      <span className="font-mono text-cyan-400">{rec.solveTimeMs.toFixed(1)} ms</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-100">
                      {rec.moveCount} moves
                    </span>
                    {rec.isOptimized && rec.originalMoveCount > rec.moveCount && (
                      <p className="text-[10px] text-slate-400 line-through">
                        {rec.originalMoveCount} moves
                      </p>
                    )}
                  </div>
                </div>
              ))
            )
          ) : practiceRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-950/40 border border-slate-800/80">
              No practice sessions recorded yet. Launch Practice Mode to track your tactical drill stats!
            </div>
          ) : (
            practiceRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-300">Practice Complete</span>
                    <Badge variant="success" size="sm">
                      {rec.completedMoves} / {rec.totalMoves} moves
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(rec.timestamp)}
                    </span>
                    <span className="font-mono text-cyan-400">{rec.avgTimePerMoveSec}s / move pace</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-100">
                    {(rec.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
