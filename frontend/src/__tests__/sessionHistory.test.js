/**
 * Unit Tests for Session History Storage Manager (Phase 5C).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSolveHistory,
  addSolveRecord,
  clearSolveHistory,
  getPracticeHistory,
  addPracticeRecord,
  clearPracticeHistory,
  clearAllHistory,
} from '../utils/sessionHistory'

describe('Session History Storage Manager (Phase 5C)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retrieves empty arrays when no history exists', () => {
    expect(getSolveHistory()).toEqual([])
    expect(getPracticeHistory()).toEqual([])
  })

  it('adds and retrieves solve records correctly', () => {
    const record = {
      solverName: 'Kociemba Two-Phase',
      moveCount: 20,
      originalMoveCount: 22,
      isOptimized: true,
      solveTimeMs: 14.2,
      isVerified: true,
    }

    addSolveRecord(record)
    const history = getSolveHistory()

    expect(history).toHaveLength(1)
    expect(history[0].moveCount).toBe(20)
    expect(history[0].isOptimized).toBe(true)
    expect(history[0].id).toBeDefined()
    expect(history[0].timestamp).toBeDefined()
  })

  it('clears solve history without crashing', () => {
    addSolveRecord({ moveCount: 15 })
    expect(getSolveHistory()).toHaveLength(1)

    clearSolveHistory()
    expect(getSolveHistory()).toHaveLength(0)
  })

  it('adds, paces, and retrieves practice records', () => {
    addPracticeRecord({
      totalMoves: 10,
      completedMoves: 10,
      durationMs: 20000,
      status: 'COMPLETED',
    })

    const history = getPracticeHistory()
    expect(history).toHaveLength(1)
    expect(history[0].completedMoves).toBe(10)
    expect(history[0].avgTimePerMoveSec).toBe(2.0)
  })

  it('clears practice history correctly', () => {
    addPracticeRecord({ totalMoves: 5, completedMoves: 5, durationMs: 5000 })
    expect(getPracticeHistory()).toHaveLength(1)

    clearPracticeHistory()
    expect(getPracticeHistory()).toHaveLength(0)
  })

  it('clears all history at once', () => {
    addSolveRecord({ moveCount: 10 })
    addPracticeRecord({ totalMoves: 5, completedMoves: 5, durationMs: 5000 })

    expect(getSolveHistory()).toHaveLength(1)
    expect(getPracticeHistory()).toHaveLength(1)

    clearAllHistory()
    expect(getSolveHistory()).toHaveLength(0)
    expect(getPracticeHistory()).toHaveLength(0)
  })

  it('handles corrupted JSON strings in localStorage safely without throwing', () => {
    localStorage.setItem('cubemind_solve_history', 'CORRUPTED_NOT_JSON{{')
    localStorage.setItem('cubemind_practice_history', '{bad json')

    expect(getSolveHistory()).toEqual([])
    expect(getPracticeHistory()).toEqual([])
  })
})
