/**
 * Unit Tests for PracticeModal Component (Phase 5C).
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PracticeModal } from '../components/workspace/PracticeModal'

describe('PracticeModal Component (Phase 5C)', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PracticeModal isOpen={false} onClose={() => {}} moves={['R', 'U']} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders practice modal, active move hero card, and confirmation button when isOpen is true', () => {
    render(
      <PracticeModal isOpen={true} onClose={() => {}} moves={['R', 'U']} />
    )

    expect(screen.getByText('Practice Mode')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
    expect(screen.getByText(/Red Face \(Right\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /I Completed This Move/i })).toBeInTheDocument()
  })

  it('advances through moves and displays completion screen', () => {
    render(
      <PracticeModal isOpen={true} onClose={() => {}} moves={['R', 'U']} />
    )

    const confirmBtn = screen.getByRole('button', { name: /I Completed This Move/i })

    // Complete move 1: R
    fireEvent.click(confirmBtn)
    expect(screen.getByText('U')).toBeInTheDocument()

    // Complete move 2: U -> shows Completion screen
    fireEvent.click(confirmBtn)
    expect(screen.getByText(/Practice Session Complete!/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Practice Again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument()
  })
})
