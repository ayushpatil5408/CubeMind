/**
 * CubeMind Global State Management (Phase 3D)
 * Central React Context managing canonical cube state, manual state editing,
 * undo/redo history, deep validation status, solver solutions, precomputed move timelines,
 * and 3D animated playback state machine.
 */

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { SOLVED_STATE_STRING, CENTER_INDICES } from '../types/cube'
import { cubeApi, ApiError } from '../services/api'
import { validateBasicFormat, isCenterIndex, getCenterFace, updateStickerColor } from '../utils/cubeUtils'
import { computeStateTimeline, parseAlgorithm, ALL_VALID_MOVES } from '../utils/cubeMoveEngine'
import { getMoveAnimation, SPEED_PRESETS } from '../utils/cubeAnimationMapping'
import { addSolveRecord } from '../utils/sessionHistory'

export const CubeContext = createContext(null)


const MAX_HISTORY_LENGTH = 50

export function CubeProvider({ children }) {
  // 1. Core Cube State
  const [stateString, setStateString] = useState(SOLVED_STATE_STRING)
  const [activeScramble, setActiveScramble] = useState('')
  const [scrambleHistory, setScrambleHistory] = useState([])

  // 2. Manual Editing & History (Phase 3C)
  const [selectedColor, setSelectedColor] = useState('U') // 'U' | 'R' | 'F' | 'D' | 'L' | 'B'
  const [selectedStickerIndex, setSelectedStickerIndex] = useState(null)
  const [editMode, setEditMode] = useState('paint') // 'paint' | 'select'
  const [history, setHistory] = useState([])
  const [future, setFuture] = useState([])

  // 3. Validation State
  const [validationResult, setValidationResult] = useState({
    is_valid: true,
    status: 'VALID',
    message: 'Solved cube state',
    details: null,
  })
  const [isValidating, setIsValidating] = useState(false)

  // 4. Solving & Solution State
  const [solutionResult, setSolutionResult] = useState(null)
  const [initialSolveState, setInitialSolveState] = useState(SOLVED_STATE_STRING)
  const [solutionTimeline, setSolutionTimeline] = useState([SOLVED_STATE_STRING])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 5. Playback Controller State Machine (Phase 3D)
  // 'IDLE' | 'READY' | 'PLAYING' | 'PAUSED' | 'COMPLETED' | 'ERROR'
  const [playbackStatus, setPlaybackStatus] = useState('IDLE')
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [playbackSpeed, setPlaybackSpeed] = useState(380) // ms duration per move
  const [activeAnimation, setActiveAnimation] = useState(null)

  // 6. UI & Navigation State
  const [activeTab, setActiveTab] = useState('workspace')
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', details: null })

  // Synchronized refs to prevent stale closure in animation loops
  const playbackStatusRef = useRef(playbackStatus)
  playbackStatusRef.current = playbackStatus

  const currentStepIndexRef = useRef(currentStepIndex)
  currentStepIndexRef.current = currentStepIndex

  const solutionTimelineRef = useRef(solutionTimeline)
  solutionTimelineRef.current = solutionTimeline

  const solutionResultRef = useRef(solutionResult)
  solutionResultRef.current = solutionResult

  const playbackSpeedRef = useRef(playbackSpeed)
  playbackSpeedRef.current = playbackSpeed

  const activeAnimationRef = useRef(activeAnimation)
  activeAnimationRef.current = activeAnimation

  const validationTimeoutRef = useRef(null)

  // Check backend health on mount
  useEffect(() => {
    cubeApi.getHealth()
      .then((data) => setBackendHealth({ status: 'connected', details: data }))
      .catch((err) => setBackendHealth({ status: 'disconnected', details: err.message }))
  }, [])

  // Deep validation call
  const runDeepValidation = useCallback(async (stateToValidate) => {
    const basic = validateBasicFormat(stateToValidate)
    if (!basic.isValid) {
      setValidationResult({
        is_valid: false,
        status: basic.code || 'INVALID_FORMAT',
        message: basic.message,
        details: { counts: basic.counts },
      })
      return { is_valid: false, message: basic.message }
    }

    setIsValidating(true)
    try {
      const res = await cubeApi.validateState(stateToValidate)
      setValidationResult(res)
      return res
    } catch (err) {
      setValidationResult({
        is_valid: basic.isValid,
        status: 'LOCAL_VALID',
        message: basic.isValid ? 'Basic format valid (Offline mode)' : basic.message,
        details: null,
      })
      return { is_valid: basic.isValid, message: basic.message }
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Auto debounced validation whenever stateString changes (except during active animation playback)
  useEffect(() => {
    if (activeAnimation) return

    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    const basic = validateBasicFormat(stateString)
    if (!basic.isValid) {
      setValidationResult({
        is_valid: false,
        status: basic.code || 'INVALID_FORMAT',
        message: basic.message,
        details: { counts: basic.counts },
      })
      return
    }

    validationTimeoutRef.current = setTimeout(() => {
      runDeepValidation(stateString)
    }, 350)

    return () => {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current)
    }
  }, [stateString, activeAnimation, runDeepValidation])

  // Sticker editing with history push and center protection
  const setStickerColor = useCallback((index, colorToSet = null) => {
    const idx = Number(index)
    const color = (colorToSet || selectedColor).toUpperCase()

    if (idx < 0 || idx >= 54) return false

    if (isCenterIndex(idx)) {
      const fixedColor = getCenterFace(idx)
      if (color !== fixedColor) {
        setError(`Center stickers are fixed reference axes (${fixedColor} on face ${fixedColor}) and cannot be changed.`)
        return false
      }
    }

    setStateString((currentState) => {
      if (currentState[idx] === color) {
        return currentState
      }

      setHistory((prev) => [...prev.slice(-MAX_HISTORY_LENGTH + 1), currentState])
      setFuture([])

      // Reset solver & playback state on manual edit
      setSolutionResult(null)
      setPlaybackStatus('IDLE')
      setCurrentStepIndex(-1)
      setActiveAnimation(null)
      setError(null)

      return updateStickerColor(currentState, idx, color)
    })

    return true
  }, [selectedColor])

  // Load custom state string with history
  const setEntireState = useCallback((newString, reason = 'custom_edit') => {
    if (typeof newString !== 'string' || newString.length !== 54) {
      setError('State string must be exactly 54 characters (U, R, F, D, L, B).')
      return false
    }

    setStateString((currentState) => {
      if (currentState === newString) return currentState

      setHistory((prev) => [...prev.slice(-MAX_HISTORY_LENGTH + 1), currentState])
      setFuture([])
      setSolutionResult(null)
      setPlaybackStatus('IDLE')
      setCurrentStepIndex(-1)
      setActiveAnimation(null)
      setError(null)
      return newString
    })
    return true
  }, [])

  // Undo last edit
  const undo = useCallback(() => {
    if (history.length === 0) return

    const previousState = history[history.length - 1]
    const newHistory = history.slice(0, -1)

    setFuture((prev) => [stateString, ...prev])
    setHistory(newHistory)
    setStateString(previousState)
    setSolutionResult(null)
    setPlaybackStatus('IDLE')
    setCurrentStepIndex(-1)
    setActiveAnimation(null)
    setError(null)
  }, [history, stateString])

  // Redo last undone edit
  const redo = useCallback(() => {
    if (future.length === 0) return

    const nextState = future[0]
    const newFuture = future.slice(1)

    setHistory((prev) => [...prev, stateString])
    setFuture(newFuture)
    setStateString(nextState)
    setSolutionResult(null)
    setPlaybackStatus('IDLE')
    setCurrentStepIndex(-1)
    setActiveAnimation(null)
    setError(null)
  }, [future, stateString])

  // Reset to solved state
  const resetToSolved = useCallback(() => {
    if (stateString === SOLVED_STATE_STRING && playbackStatus === 'IDLE') return

    setHistory((prev) => [...prev.slice(-MAX_HISTORY_LENGTH + 1), stateString])
    setFuture([])
    setStateString(SOLVED_STATE_STRING)
    setActiveScramble('')
    setSolutionResult(null)
    setPlaybackStatus('IDLE')
    setCurrentStepIndex(-1)
    setActiveAnimation(null)
    setError(null)
    setSelectedStickerIndex(null)
  }, [stateString, playbackStatus])

  // Generate and apply new scramble from backend
  const generateScramble = useCallback(async (length = 20) => {
    setIsLoading(true)
    setError(null)
    setSolutionResult(null)
    setPlaybackStatus('IDLE')
    setCurrentStepIndex(-1)
    setActiveAnimation(null)

    try {
      const data = await cubeApi.getScramble(length)
      if (data.resulting_state) {
        setHistory((prev) => [...prev.slice(-MAX_HISTORY_LENGTH + 1), stateString])
        setFuture([])
        setStateString(data.resulting_state)
        setActiveScramble(data.scramble_str || data.scramble?.join(' ') || '')
        setScrambleHistory((prev) => [data.scramble_str || data.scramble?.join(' '), ...prev.slice(0, 9)])
      }
      return data
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to generate scramble')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [stateString])

  // Solve the current state using backend API and initialize timeline
  const solveCurrentState = useCallback(async (options = {}) => {
    const val = validateBasicFormat(stateString)
    if (!val.isValid) {
      setError(`Cannot solve: ${val.message}`)
      return null
    }

    if (validationResult && !validationResult.is_valid) {
      setError(`Cannot solve: ${validationResult.message || 'Cube state is physically unsolvable.'}`)
      return null
    }

    setIsLoading(true)
    setError(null)
    setSolutionResult(null)
    setPlaybackStatus('IDLE')
    setCurrentStepIndex(-1)
    setActiveAnimation(null)

    try {
      const data = await cubeApi.solveCube({
        stateString,
        solver: options.solver || 'kociemba',
        verify: options.verify !== false,
        maxDepth: options.maxDepth || 24,
        timeoutSec: options.timeoutSec || 20.0,
      })

      setSolutionResult(data)
      setInitialSolveState(stateString)

      const moves = data.moves || []
      const timeline = computeStateTimeline(stateString, moves)
      setSolutionTimeline(timeline)
      setCurrentStepIndex(-1)

      if (data.success) {
        addSolveRecord({
          solverName: data.solver_name,
          moveCount: data.move_count ?? moves.length,
          originalMoveCount: data.original_moves ? data.original_moves.length : moves.length,
          isOptimized: !!data.is_optimized,
          solveTimeMs: data.solve_time_ms,
          isVerified: data.verification_result?.is_verified ?? true,
          statePreview: stateString,
        })
      }

      if (moves.length === 0 || data.status === 'ALREADY_SOLVED') {

        setPlaybackStatus('COMPLETED')
      } else {
        setPlaybackStatus('READY')
      }

      return data
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Solve failed. Please check network connection.'
      setError(msg)
      setSolutionResult({
        success: false,
        error: msg,
        details: err.details,
      })
      setPlaybackStatus('ERROR')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [stateString, validationResult])

  // --------------------------------------------------------------------------
  // Playback Controller Engine (Phase 3D)
  // --------------------------------------------------------------------------

  // Starts animating a specific move index
  const startAnimatingMove = useCallback((targetStepIdx) => {
    const moves = solutionResultRef.current?.moves || []
    const timeline = solutionTimelineRef.current

    if (targetStepIdx < 0 || targetStepIdx >= moves.length) return false

    const move = moves[targetStepIdx]
    const nextState = timeline[targetStepIdx + 1]
    const anim = getMoveAnimation(move, playbackSpeedRef.current)

    if (!anim) return false

    setActiveAnimation({
      ...anim,
      stepIndex: targetStepIdx,
      targetState: nextState,
    })
    return true
  }, [])

  // Callback invoked when 3D layer animation completes
  const completeCurrentAnimation = useCallback((stepIndex, targetState) => {
    // 1. Commit canonical state & step index
    setStateString(targetState)
    setCurrentStepIndex(stepIndex)

    const moves = solutionResultRef.current?.moves || []
    const isLastMove = stepIndex >= moves.length - 1

    if (isLastMove) {
      setPlaybackStatus('COMPLETED')
      setActiveAnimation(null)
      return
    }

    // 2. If playing, chain next move immediately
    if (playbackStatusRef.current === 'PLAYING') {
      const nextStepIdx = stepIndex + 1
      const move = moves[nextStepIdx]
      const nextState = solutionTimelineRef.current[nextStepIdx + 1]
      const anim = getMoveAnimation(move, playbackSpeedRef.current)

      if (anim) {
        setActiveAnimation({
          ...anim,
          stepIndex: nextStepIdx,
          targetState: nextState,
        })
      } else {
        setActiveAnimation(null)
      }
    } else {
      setActiveAnimation(null)
    }
  }, [])

  // Step Forward exactly 1 move with animation
  const stepForward = useCallback(() => {
    if (activeAnimationRef.current) return // Prevent overlapping
    const moves = solutionResult?.moves || []
    if (moves.length === 0) return

    const nextStepIdx = currentStepIndex + 1
    if (nextStepIdx >= moves.length) return

    setPlaybackStatus('PAUSED')
    startAnimatingMove(nextStepIdx)
  }, [solutionResult, currentStepIndex, startAnimatingMove])

  // Step Backward safely using precomputed timeline snapshots
  const stepBackward = useCallback(() => {
    if (activeAnimationRef.current) {
      setActiveAnimation(null)
    }

    const moves = solutionResult?.moves || []
    if (moves.length === 0 || currentStepIndex < 0) return

    const prevStepIdx = currentStepIndex - 1
    const targetState = solutionTimeline[prevStepIdx + 1]

    setStateString(targetState)
    setCurrentStepIndex(prevStepIdx)
    setPlaybackStatus(prevStepIdx === -1 ? 'READY' : 'PAUSED')
    setActiveAnimation(null)
  }, [solutionResult, currentStepIndex, solutionTimeline])

  // Play continuously from current step
  const play = useCallback(() => {
    const moves = solutionResult?.moves || []
    if (moves.length === 0) return

    let startIdx = currentStepIndex + 1

    // If completed or at end, restart from beginning
    if (playbackStatus === 'COMPLETED' || currentStepIndex >= moves.length - 1) {
      setStateString(initialSolveState)
      setCurrentStepIndex(-1)
      startIdx = 0
    }

    setPlaybackStatus('PLAYING')
    startAnimatingMove(startIdx)
  }, [solutionResult, currentStepIndex, playbackStatus, initialSolveState, startAnimatingMove])

  // Pause playback
  const pause = useCallback(() => {
    setPlaybackStatus('PAUSED')
  }, [])

  // Toggle Play / Pause
  const togglePlayback = useCallback(() => {
    if (playbackStatus === 'PLAYING') {
      pause()
    } else {
      play()
    }
  }, [playbackStatus, play, pause])

  // Reset playback to start of solution
  const resetPlayback = useCallback(() => {
    setActiveAnimation(null)
    if (initialSolveState) {
      setStateString(initialSolveState)
    }
    setCurrentStepIndex(-1)
    setPlaybackStatus('READY')
  }, [initialSolveState])

  // Jump to specific step snapshot
  const jumpToStep = useCallback((targetStepIdx) => {
    setActiveAnimation(null)
    const moves = solutionResult?.moves || []
    const idx = Math.max(-1, Math.min(targetStepIdx, moves.length - 1))

    const targetState = solutionTimeline[idx + 1] || initialSolveState
    setStateString(targetState)
    setCurrentStepIndex(idx)
    setPlaybackStatus(idx === moves.length - 1 ? 'COMPLETED' : idx === -1 ? 'READY' : 'PAUSED')
  }, [solutionResult, solutionTimeline, initialSolveState])

  const isPlaying = playbackStatus === 'PLAYING'

  const contextValue = {
    // State
    stateString,
    activeScramble,
    scrambleHistory,
    solutionResult,
    initialSolveState,
    solutionTimeline,
    currentStepIndex,
    playbackStatus,
    isPlaying,
    playbackSpeed,
    activeAnimation,
    isLoading,
    error,
    activeTab,
    backendHealth,

    // Manual Editing & History (Phase 3C)
    selectedColor,
    selectedStickerIndex,
    editMode,
    history,
    future,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    validationResult,
    isValidating,

    // Playback Actions (Phase 3D)
    play,
    pause,
    togglePlayback,
    stepForward,
    stepBackward,
    resetPlayback,
    jumpToStep,
    completeCurrentAnimation,
    setPlaybackSpeed,

    // Core Actions
    setStateString,
    setStickerColor,
    setEntireState,
    setSelectedColor,
    setSelectedStickerIndex,
    setEditMode,
    undo,
    redo,
    resetToSolved,
    generateScramble,
    solveCurrentState,
    validateCurrentState: () => runDeepValidation(stateString),
    setActiveTab,
    setError,
    clearError: () => setError(null),

    // Backward compatibility aliases
    nextStep: stepForward,
    prevStep: stepBackward,
    setCurrentStepIndex: jumpToStep,
    setIsPlaying: (val) => (val ? play() : pause()),
  }

  return (
    <CubeContext.Provider value={contextValue}>
      {children}
    </CubeContext.Provider>
  )
}
