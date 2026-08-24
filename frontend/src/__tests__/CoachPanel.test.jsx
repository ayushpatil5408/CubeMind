/**
 * Phase 5B CoachPanel Component Tests
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CoachPanel } from '../components/workspace/CoachPanel'
import { CubeContext } from '../context/CubeContext'

function renderCoachPanel(contextValues) {
  const defaultContext = {
    solutionResult: {
      success: true,
      moves: ['R', 'U', "R'", "U'"],
      move_count: 4,
      solver_name: 'Kociemba Two-Phase',
    },
    currentStepIndex: -1,
    playbackStatus: 'IDLE',
    stepForward: vi.fn(),
    stepBackward: vi.fn(),
    jumpToStep: vi.fn(),
    ...contextValues,
  }

  return render(
    <CubeContext.Provider value={defaultContext}>
      <CoachPanel />
    </CubeContext.Provider>
  )
}

describe('CoachPanel Component (Phase 5B)', () => {
  it('renders nothing when no solution exists', () => {
    const { container } = renderCoachPanel({ solutionResult: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders "Ready to Begin Solution" state before playback starts', () => {
    renderCoachPanel({ currentStepIndex: -1, playbackStatus: 'IDLE' })

    expect(screen.getByText(/CubeMind AI Coach/i)).toBeInTheDocument()
    expect(screen.getByText(/Ready to Begin Solution/i)).toBeInTheDocument()
    expect(screen.getByText(/First move:/i)).toBeInTheDocument()
  })

  it('renders active move hero card, instructions, and grip advice in Beginner Mode', () => {
    renderCoachPanel({ currentStepIndex: 0, playbackStatus: 'PLAYING' })

    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText(/Right Clockwise/i)).toBeInTheDocument()
    expect(screen.getByText(/Why This Move\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Physical Grip & Turning Advice/i)).toBeInTheDocument()
  })

  it('detects pattern and displays trigger banner', () => {
    renderCoachPanel({ currentStepIndex: 0, playbackStatus: 'PLAYING' })

    expect(screen.getByText(/Sexy Move Trigger \(Move 1\/4\)/i)).toBeInTheDocument()
  })

  it('switches between Beginner and Compact modes', () => {
    renderCoachPanel({ currentStepIndex: 0, playbackStatus: 'PLAYING' })

    const modeToggleBtn = screen.getByRole('button', { name: /Beginner/i })
    fireEvent.click(modeToggleBtn)

    // In Compact mode, grip hints are hidden and button says Compact
    expect(screen.getByRole('button', { name: /Compact/i })).toBeInTheDocument()
    expect(screen.getByText(/Compact Speed-Solving Mode/i)).toBeInTheDocument()
    expect(screen.queryByText(/Physical Grip & Turning Advice/i)).not.toBeInTheDocument()
  })


  it('renders completion banner when playback finishes', () => {
    renderCoachPanel({ currentStepIndex: 3, playbackStatus: 'COMPLETED' })

    expect(screen.getByText(/Solution Completed!/i)).toBeInTheDocument()
    expect(screen.getByText(/All 4 moves have been executed/i)).toBeInTheDocument()
  })
})
