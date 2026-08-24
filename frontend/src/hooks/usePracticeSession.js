/**
 * Practice Mode State & Analytics Custom Hook (Phase 5C).
 * Orchestrates step-by-step physical move practice with user confirmations,
 * stopwatch timing, pace analytics, and history recording.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { addPracticeRecord } from '../utils/sessionHistory'

export const PRACTICE_STATUS = {
  IDLE: 'IDLE',
  PRACTICING: 'PRACTICING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
}

export function usePracticeSession() {
  const [moves, setMoves] = useState([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [status, setStatus] = useState(PRACTICE_STATUS.IDLE)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [restartCount, setRestartCount] = useState(0)

  const timerRef = useRef(null)
  const lastTickRef = useRef(null)

  // Timer ticker
  useEffect(() => {
    if (status === PRACTICE_STATUS.PRACTICING) {
      lastTickRef.current = Date.now()
      timerRef.current = setInterval(() => {
        const now = Date.now()
        const delta = now - (lastTickRef.current || now)
        lastTickRef.current = now
        setElapsedMs((prev) => prev + delta)
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])

  /**
   * Initializes and starts a new practice session with target moves.
   */
  const startPractice = useCallback((targetMoves = []) => {
    if (!targetMoves || targetMoves.length === 0) return
    setMoves(targetMoves)
    setCurrentMoveIndex(0)
    setElapsedMs(0)
    setPauseCount(0)
    setRestartCount(0)
    setStatus(PRACTICE_STATUS.PRACTICING)
  }, [])

  /**
   * Confirms execution of current move and advances.
   */
  const confirmMove = useCallback(() => {
    if (status !== PRACTICE_STATUS.PRACTICING && status !== PRACTICE_STATUS.PAUSED) return

    if (currentMoveIndex < moves.length - 1) {
      setCurrentMoveIndex((prev) => prev + 1)
      if (status === PRACTICE_STATUS.PAUSED) {
        setStatus(PRACTICE_STATUS.PRACTICING)
      }
    } else {
      // Completed last move
      setStatus(PRACTICE_STATUS.COMPLETED)
      addPracticeRecord({
        totalMoves: moves.length,
        completedMoves: moves.length,
        durationMs: elapsedMs,
        status: 'COMPLETED',
      })
    }
  }, [currentMoveIndex, moves.length, status, elapsedMs])

  /**
   * Steps back to previous move.
   */
  const stepBackward = useCallback(() => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex((prev) => prev - 1)
    }
  }, [currentMoveIndex])

  /**
   * Pauses the practice stopwatch.
   */
  const pausePractice = useCallback(() => {
    if (status === PRACTICE_STATUS.PRACTICING) {
      setStatus(PRACTICE_STATUS.PAUSED)
      setPauseCount((prev) => prev + 1)
    }
  }, [status])

  /**
   * Resumes the practice stopwatch.
   */
  const resumePractice = useCallback(() => {
    if (status === PRACTICE_STATUS.PAUSED) {
      setStatus(PRACTICE_STATUS.PRACTICING)
    }
  }, [status])

  /**
   * Restarts current practice session from move 0.
   */
  const restartPractice = useCallback(() => {
    setCurrentMoveIndex(0)
    setElapsedMs(0)
    setRestartCount((prev) => prev + 1)
    setStatus(PRACTICE_STATUS.PRACTICING)
  }, [])

  /**
   * Resets entire session back to IDLE.
   */
  const resetSession = useCallback(() => {
    setMoves([])
    setCurrentMoveIndex(0)
    setElapsedMs(0)
    setPauseCount(0)
    setRestartCount(0)
    setStatus(PRACTICE_STATUS.IDLE)
  }, [])

  const currentMove = moves[currentMoveIndex] || null
  const progressPercent = moves.length > 0
    ? Math.round(((status === PRACTICE_STATUS.COMPLETED ? moves.length : currentMoveIndex) / moves.length) * 100)
    : 0

  return {
    moves,
    currentMove,
    currentMoveIndex,
    totalMoves: moves.length,
    status,
    elapsedMs,
    progressPercent,
    pauseCount,
    restartCount,
    startPractice,
    confirmMove,
    stepBackward,
    pausePractice,
    resumePractice,
    restartPractice,
    resetSession,
  }
}
