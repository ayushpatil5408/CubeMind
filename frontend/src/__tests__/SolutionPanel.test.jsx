/**
 * Phase 5A SolutionPanel & Solution Intelligence UI Tests
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SolutionPanel } from '../components/workspace/SolutionPanel'
import { CubeContext } from '../context/CubeContext'

function renderWithContext(contextValues) {
  const defaultContext = {
    solutionResult: null,
    isLoading: false,
    error: null,
    currentStepIndex: -1,
    playbackStatus: 'IDLE',
    isPlaying: false,
    playbackSpeed: 380,
    stepForward: vi.fn(),
    stepBackward: vi.fn(),
    resetPlayback: vi.fn(),
    jumpToStep: vi.fn(),
    togglePlayback: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    solveCurrentState: vi.fn(),
    ...contextValues,
  }

  return render(
    <CubeContext.Provider value={defaultContext}>
      <SolutionPanel />
    </CubeContext.Provider>
  )
}

describe('SolutionPanel Component (Phase 5A)', () => {
  it('renders empty state when no solution is present', () => {
    renderWithContext({ solutionResult: null })
    expect(screen.getByText(/Ready to Solve/i)).toBeInTheDocument()
  })

  it('renders "Cube is Already Solved" message for solved state', () => {
    renderWithContext({
      solutionResult: {
        success: true,
        status: 'ALREADY_SOLVED',
        moves: [],
        move_count: 0,
        solver_name: 'Kociemba Two-Phase',
        verification_result: { is_verified: true },
      },
    })
    expect(screen.getByText(/Cube is Already Solved/i)).toBeInTheDocument()
  })

  it('renders solution moves, solve time, and verified badge', () => {
    renderWithContext({
      solutionResult: {
        success: true,
        status: 'SOLVED',
        moves: ['R', 'U', "R'", "U'"],
        move_count: 4,
        solve_time_ms: 12.4,
        solver_name: 'Kociemba Two-Phase',
        verification_result: { is_verified: true },
      },
    })

    expect(screen.getByText(/12.4 ms/i)).toBeInTheDocument()
    expect(screen.getByText(/Verified/i)).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('displays optimization badge and analytics breakdown when is_optimized is true', () => {
    renderWithContext({
      solutionResult: {
        success: true,
        status: 'SOLVED',
        moves: ['R2', 'U', "U'"],
        original_moves: ['R', 'R', 'U', "U'"],
        is_optimized: true,
        move_count: 2,
        solve_time_ms: 8.5,
        solver_name: 'Kociemba Two-Phase',
        verification_result: { is_verified: true },
        optimization_analytics: {
          original_move_count: 4,
          optimized_move_count: 2,
          moves_saved: 2,
          optimization_percentage: 50.0,
          face_distribution: { U: 0, R: 1, F: 0, D: 0, L: 0, B: 0 },
          half_turn_count: 1,
          prime_move_count: 0,
          quarter_turn_count: 1,
        },
      },
    })

    // Optimization badge & percentage
    expect(screen.getByText(/⚡ -50%/i)).toBeInTheDocument()
    expect(screen.getByText(/2 moves eliminated \(-50%\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Solution Intelligence Analytics/i)).toBeInTheDocument()

    // View raw toggle
    expect(screen.getByText(/View Raw/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/View Raw/i))
    expect(screen.getByText(/View Optimized/i)).toBeInTheDocument()
  })
})
