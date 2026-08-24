/**
 * Unit Tests for usePracticeSession hook (Phase 5C).
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePracticeSession, PRACTICE_STATUS } from '../hooks/usePracticeSession'


describe('usePracticeSession Hook (Phase 5C)', () => {
  it('initializes in IDLE state', () => {
    const { result } = renderHook(() => usePracticeSession())

    expect(result.current.status).toBe(PRACTICE_STATUS.IDLE)
    expect(result.current.currentMoveIndex).toBe(0)
    expect(result.current.totalMoves).toBe(0)
  })

  it('starts practice session with move array', () => {
    const { result } = renderHook(() => usePracticeSession())

    act(() => {
      result.current.startPractice(['R', 'U', "R'", "U'"])
    })

    expect(result.current.status).toBe(PRACTICE_STATUS.PRACTICING)
    expect(result.current.totalMoves).toBe(4)
    expect(result.current.currentMove).toBe('R')
    expect(result.current.currentMoveIndex).toBe(0)
  })

  it('progresses through moves on confirmation and completes at end', () => {
    const { result } = renderHook(() => usePracticeSession())

    act(() => {
      result.current.startPractice(['R', 'U'])
    })

    // Move 0: R
    expect(result.current.currentMove).toBe('R')

    // Confirm Move 0 -> advances to Move 1: U
    act(() => {
      result.current.confirmMove()
    })
    expect(result.current.currentMoveIndex).toBe(1)
    expect(result.current.currentMove).toBe('U')
    expect(result.current.status).toBe(PRACTICE_STATUS.PRACTICING)

    // Confirm Move 1 -> reaches end -> COMPLETED
    act(() => {
      result.current.confirmMove()
    })
    expect(result.current.status).toBe(PRACTICE_STATUS.COMPLETED)
  })

  it('handles step backward without dropping below index 0', () => {
    const { result } = renderHook(() => usePracticeSession())

    act(() => {
      result.current.startPractice(['R', 'U', "R'"])
    })

    act(() => {
      result.current.confirmMove() // to index 1
    })
    expect(result.current.currentMoveIndex).toBe(1)

    act(() => {
      result.current.stepBackward() // back to index 0
    })
    expect(result.current.currentMoveIndex).toBe(0)

    act(() => {
      result.current.stepBackward() // remains at index 0
    })
    expect(result.current.currentMoveIndex).toBe(0)
  })

  it('pauses, resumes, and restarts practice session', () => {
    const { result } = renderHook(() => usePracticeSession())

    act(() => {
      result.current.startPractice(['R', 'U'])
    })

    act(() => {
      result.current.pausePractice()
    })
    expect(result.current.status).toBe(PRACTICE_STATUS.PAUSED)
    expect(result.current.pauseCount).toBe(1)

    act(() => {
      result.current.resumePractice()
    })
    expect(result.current.status).toBe(PRACTICE_STATUS.PRACTICING)

    act(() => {
      result.current.restartPractice()
    })
    expect(result.current.currentMoveIndex).toBe(0)
    expect(result.current.restartCount).toBe(1)
    expect(result.current.status).toBe(PRACTICE_STATUS.PRACTICING)
  })
})
