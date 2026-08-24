/**
 * Unit Tests for SessionHistoryModal Component (Phase 5C).
 */

import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionHistoryModal } from '../components/workspace/SessionHistoryModal'
import { addSolveRecord, addPracticeRecord } from '../utils/sessionHistory'

describe('SessionHistoryModal Component (Phase 5C)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SessionHistoryModal isOpen={false} onClose={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders solve history records when open', () => {
    addSolveRecord({
      solverName: 'Kociemba Two-Phase',
      moveCount: 22,
      solveTimeMs: 16.5,
      isOptimized: true,
      originalMoveCount: 25,
    })

    render(
      <SessionHistoryModal isOpen={true} onClose={() => {}} />
    )

    expect(screen.getByText('Session History')).toBeInTheDocument()
    expect(screen.getByText(/22 moves/i)).toBeInTheDocument()
    expect(screen.getByText(/⚡ Optimized/i)).toBeInTheDocument()
  })

  it('switches to Practice tab and renders practice session records', () => {
    addPracticeRecord({
      totalMoves: 12,
      completedMoves: 12,
      durationMs: 24000,
    })

    render(
      <SessionHistoryModal isOpen={true} onClose={() => {}} />
    )

    const practiceTabBtn = screen.getByRole('button', { name: /Practice \(1\)/i })
    fireEvent.click(practiceTabBtn)

    expect(screen.getByText(/Practice Complete/i)).toBeInTheDocument()
    expect(screen.getByText(/12 \/ 12 moves/i)).toBeInTheDocument()
    expect(screen.getByText(/24.0s/i)).toBeInTheDocument()
  })
})
