/**
 * Phase 4C Scan Reconstruction Review & Manual Correction UI Tests
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScanReconstructionReview } from '../components/scanner/ScanReconstructionReview'
import { SOLVED_STATE_STRING } from '../types/cube'

describe('ScanReconstructionReview Component (Phase 4C)', () => {
  const defaultProps = {
    stateString: SOLVED_STATE_STRING,
    colorCounts: { U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 },
    reconstruction: {
      averageConfidence: 0.92,
      ambiguousIndices: [1, 10],
    },
    detectedFaces: {
      U: { confidence: { overallConfidence: 0.95 } },
      R: { confidence: { overallConfidence: 0.90 } },
      F: { confidence: { overallConfidence: 0.92 } },
      D: { confidence: { overallConfidence: 0.94 } },
      L: { confidence: { overallConfidence: 0.88 } },
      B: { confidence: { overallConfidence: 0.91 } },
    },
    onOverrideSticker: vi.fn(),
    onRescanFace: vi.fn(),
    onResetSession: vi.fn(),
    onCommitToSolver: vi.fn(),
  }

  it('renders 6-face reconstructed net layout and status badge', () => {
    render(<ScanReconstructionReview {...defaultProps} />)

    expect(screen.getByText(/Reconstructed Cube State/i)).toBeInTheDocument()
    expect(screen.getByText(/Scan Confidence: 92%/i)).toBeInTheDocument()
    expect(screen.getByText(/Use Scanned Cube State/i)).toBeInTheDocument()
    expect(screen.getByText(/Restart Scan/i)).toBeInTheDocument()
  })

  it('highlights ambiguous stickers and explains guidance', () => {
    render(<ScanReconstructionReview {...defaultProps} />)

    expect(screen.getByText(/2 Ambiguous Sticker\(s\) Detected/i)).toBeInTheDocument()
  })

  it('triggers onOverrideSticker when a non-center sticker is clicked', () => {
    render(<ScanReconstructionReview {...defaultProps} />)

    // Find non-center sticker button (e.g. Sticker #0)
    const stickerBtn = screen.getByTitle(/Sticker #0/i)
    fireEvent.click(stickerBtn)

    expect(defaultProps.onOverrideSticker).toHaveBeenCalledWith(0, 'U')
  })

  it('triggers onRescanFace when rescan button is clicked under a face', () => {
    render(<ScanReconstructionReview {...defaultProps} />)

    const rescanButtons = screen.getAllByTitle(/Rescan U face/i)
    fireEvent.click(rescanButtons[0])

    expect(defaultProps.onRescanFace).toHaveBeenCalledWith('U')
  })

  it('triggers onCommitToSolver when "Use Scanned Cube State" is clicked with valid counts', () => {
    render(<ScanReconstructionReview {...defaultProps} />)

    const commitBtn = screen.getByText(/Use Scanned Cube State/i)
    fireEvent.click(commitBtn)

    expect(defaultProps.onCommitToSolver).toHaveBeenCalledWith(SOLVED_STATE_STRING)
  })

  it('disables "Use Scanned Cube State" if color counts are invalid', () => {
    const invalidProps = {
      ...defaultProps,
      colorCounts: { U: 10, R: 8, F: 9, D: 9, L: 9, B: 9 },
    }
    render(<ScanReconstructionReview {...invalidProps} />)

    const commitBtn = screen.getByRole('button', { name: /Use Scanned Cube State/i })
    expect(commitBtn).toBeDisabled()
  })
})

