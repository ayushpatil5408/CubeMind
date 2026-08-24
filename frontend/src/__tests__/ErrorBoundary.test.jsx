/**
 * Unit Tests for React ErrorBoundary Component (Phase 5C).
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

function ProblemChild({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test Explosion in Component')
  }
  return <div>Component is Healthy</div>
}

describe('ErrorBoundary Component (Phase 5C)', () => {
  // Suppress console.error for expected test error logs
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Component is Healthy')).toBeInTheDocument()
  })

  it('catches runtime errors and renders fallback card without crashing', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument()
  })

  it('triggers onReset callback when Try Again is clicked', () => {
    const handleReset = vi.fn()
    render(
      <ErrorBoundary onReset={handleReset}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryBtn = screen.getByRole('button', { name: /Try Again/i })
    fireEvent.click(retryBtn)

    expect(handleReset).toHaveBeenCalled()
  })
})
