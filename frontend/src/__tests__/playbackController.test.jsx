import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CubeProvider, CubeContext } from '../context/CubeContext'
import { SOLVED_STATE_STRING } from '../types/cube'
import { applyAlgorithmToState } from '../utils/cubeMoveEngine'

function TestPlaybackConsumer() {
  const {
    stateString,
    playbackStatus,
    currentStepIndex,
    playbackSpeed,
    setPlaybackSpeed,
    solutionResult,
    activeAnimation,
    stepForward,
    stepBackward,
    play,
    pause,
    resetPlayback,
    jumpToStep,
    completeCurrentAnimation,
    solveCurrentState,
    setEntireState,
  } = React.useContext(CubeContext)

  return (
    <div>
      <div data-testid="state-str">{stateString}</div>
      <div data-testid="playback-status">{playbackStatus}</div>
      <div data-testid="step-idx">{currentStepIndex}</div>
      <div data-testid="speed">{playbackSpeed}</div>
      <div data-testid="has-animation">{activeAnimation ? 'true' : 'false'}</div>
      <div data-testid="anim-move">{activeAnimation?.move || 'none'}</div>

      {/* Control buttons */}
      <button data-testid="step-fwd-btn" onClick={stepForward}>Step Forward</button>
      <button data-testid="step-back-btn" onClick={stepBackward}>Step Backward</button>
      <button data-testid="play-btn" onClick={play}>Play</button>
      <button data-testid="pause-btn" onClick={pause}>Pause</button>
      <button data-testid="reset-playback-btn" onClick={resetPlayback}>Reset Playback</button>
      <button data-testid="jump-btn" onClick={() => jumpToStep(1)}>Jump Step 1</button>
      <button data-testid="set-speed-btn" onClick={() => setPlaybackSpeed(140)}>Set Fast Speed</button>
      <button
        data-testid="complete-anim-btn"
        onClick={() => {
          if (activeAnimation) {
            completeCurrentAnimation(activeAnimation.stepIndex, activeAnimation.targetState)
          }
        }}
      >
        Complete Animation
      </button>
    </div>
  )
}

describe('Playback Controller State Machine (Phase 3D)', () => {
  it('initializes in IDLE status and tracks speed', () => {
    render(
      <CubeProvider>
        <TestPlaybackConsumer />
      </CubeProvider>
    )

    expect(screen.getByTestId('playback-status').textContent).toBe('IDLE')
    expect(screen.getByTestId('step-idx').textContent).toBe('-1')
    expect(screen.getByTestId('has-animation').textContent).toBe('false')

    act(() => {
      screen.getByTestId('set-speed-btn').click()
    })
    expect(screen.getByTestId('speed').textContent).toBe('140')
  })

  it('manages step forward, animated commitment, and step backward with canonical synchronization', async () => {
    // Scramble state with "R U"
    const scrambledState = applyAlgorithmToState(SOLVED_STATE_STRING, 'R U')

    // Mock API solve result
    const { cubeApi } = await import('../services/api')
    vi.spyOn(cubeApi, 'solveCube').mockResolvedValueOnce({
      success: true,
      moves: ["U'", "R'"],
      move_count: 2,
      solver_name: 'Kociemba Two-Phase',
      status: 'SOLVED',
      verification_result: { is_verified: true },
    })

    let contextRef
    function CaptureContext() {
      contextRef = React.useContext(CubeContext)
      return <TestPlaybackConsumer />
    }

    render(
      <CubeProvider>
        <CaptureContext />
      </CubeProvider>
    )

    // Set scrambled state
    act(() => {
      contextRef.setEntireState(scrambledState)
    })

    // Solve state
    await act(async () => {
      await contextRef.solveCurrentState()
    })

    expect(screen.getByTestId('playback-status').textContent).toBe('READY')
    expect(screen.getByTestId('step-idx').textContent).toBe('-1')

    // 1. Step forward: initiates animation for move U'
    act(() => {
      screen.getByTestId('step-fwd-btn').click()
    })

    expect(screen.getByTestId('has-animation').textContent).toBe('true')
    expect(screen.getByTestId('anim-move').textContent).toBe("U'")

    // 2. Complete animation: commits state 1 (R U U' = R)
    act(() => {
      screen.getByTestId('complete-anim-btn').click()
    })

    expect(screen.getByTestId('has-animation').textContent).toBe('false')
    expect(screen.getByTestId('step-idx').textContent).toBe('0')
    const stateAfterStep0 = screen.getByTestId('state-str').textContent
    expect(stateAfterStep0).toBe(applyAlgorithmToState(SOLVED_STATE_STRING, 'R'))

    // 3. Step forward again: initiates move R'
    act(() => {
      screen.getByTestId('step-fwd-btn').click()
    })
    expect(screen.getByTestId('anim-move').textContent).toBe("R'")

    // Complete animation: commits final move (R R' = Solved!)
    act(() => {
      screen.getByTestId('complete-anim-btn').click()
    })

    expect(screen.getByTestId('step-idx').textContent).toBe('1')
    expect(screen.getByTestId('playback-status').textContent).toBe('COMPLETED')
    expect(screen.getByTestId('state-str').textContent).toBe(SOLVED_STATE_STRING)

    // 4. Step backward: returns safely to state after step 0
    act(() => {
      screen.getByTestId('step-back-btn').click()
    })

    expect(screen.getByTestId('step-idx').textContent).toBe('0')
    expect(screen.getByTestId('state-str').textContent).toBe(stateAfterStep0)
    expect(screen.getByTestId('playback-status').textContent).toBe('PAUSED')

    // 5. Reset playback: returns to initial scrambled state
    act(() => {
      screen.getByTestId('reset-playback-btn').click()
    })

    expect(screen.getByTestId('step-idx').textContent).toBe('-1')
    expect(screen.getByTestId('state-str').textContent).toBe(scrambledState)
    expect(screen.getByTestId('playback-status').textContent).toBe('READY')
  })
})
