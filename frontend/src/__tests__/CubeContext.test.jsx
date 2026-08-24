import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CubeProvider, CubeContext } from '../context/CubeContext'
import { SOLVED_STATE_STRING } from '../types/cube'

function TestConsumer() {
  const context = React.useContext(CubeContext)
  return (
    <div>
      <div data-testid="state-str">{context.stateString}</div>
      <div data-testid="step-idx">{context.currentStepIndex}</div>
      <div data-testid="is-playing">{context.isPlaying ? 'true' : 'false'}</div>
      <div data-testid="active-tab">{context.activeTab}</div>
      <button onClick={context.resetToSolved} data-testid="reset-btn">Reset</button>
      <button onClick={() => context.setActiveTab('benchmark')} data-testid="tab-btn">Tab</button>
    </div>
  )
}

describe('CubeContext', () => {
  it('provides default solved state string and initial values', () => {
    render(
      <CubeProvider>
        <TestConsumer />
      </CubeProvider>
    )

    expect(screen.getByTestId('state-str').textContent).toBe(SOLVED_STATE_STRING)
    expect(screen.getByTestId('step-idx').textContent).toBe('-1')
    expect(screen.getByTestId('is-playing').textContent).toBe('false')
    expect(screen.getByTestId('active-tab').textContent).toBe('workspace')
  })

  it('updates activeTab when changed', () => {
    render(
      <CubeProvider>
        <TestConsumer />
      </CubeProvider>
    )

    act(() => {
      screen.getByTestId('tab-btn').click()
    })

    expect(screen.getByTestId('active-tab').textContent).toBe('benchmark')
  })

  it('resets state when resetToSolved is called', () => {
    render(
      <CubeProvider>
        <TestConsumer />
      </CubeProvider>
    )

    act(() => {
      screen.getByTestId('reset-btn').click()
    })

    expect(screen.getByTestId('state-str').textContent).toBe(SOLVED_STATE_STRING)
    expect(screen.getByTestId('step-idx').textContent).toBe('-1')
  })
})
