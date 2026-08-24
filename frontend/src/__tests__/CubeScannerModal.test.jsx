import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { CubeScannerModal } from '../components/scanner/CubeScannerModal'

describe('CubeScannerModal component (Phase 4A)', () => {
  let mockTrack
  let mockStream

  beforeEach(() => {
    mockTrack = {
      stop: vi.fn(),
      getSettings: vi.fn().mockReturnValue({ deviceId: 'cam-1' }),
    }

    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
      getVideoTracks: vi.fn().mockReturnValue([mockTrack]),
    }

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: 'videoinput', deviceId: 'cam-1', label: 'Rear Camera' },
        ]),
      },
      writable: true,
      configurable: true,
    })

    // Mock HTMLMediaElement play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<CubeScannerModal isOpen={false} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal and initiates camera stream when isOpen is true', async () => {
    await act(async () => {
      render(<CubeScannerModal isOpen={true} onClose={() => {}} />)
    })

    expect(screen.getByText(/Cube Scanner/i)).toBeInTheDocument()
    expect(screen.getByText(/Scanning Up \(White\) Face/i)).toBeInTheDocument()
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
  })

  it('stops camera stream when close button is clicked', async () => {
    const handleClose = vi.fn()

    await act(async () => {
      render(<CubeScannerModal isOpen={true} onClose={handleClose} />)
    })

    const closeBtn = screen.getByTitle(/Close Scanner/i)
    act(() => {
      closeBtn.click()
    })

    expect(mockTrack.stop).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })

  it('renders permission denied UI when camera access is rejected', async () => {
    const permError = new Error('Permission Denied')
    permError.name = 'NotAllowedError'
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(permError)

    await act(async () => {
      render(<CubeScannerModal isOpen={true} onClose={() => {}} />)
    })

    expect(screen.getByText(/Camera Permission Denied/i)).toBeInTheDocument()
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument()
  })

  it('triggers CV pipeline and displays inspection preview on shutter capture', async () => {
    await act(async () => {
      render(<CubeScannerModal isOpen={true} onClose={() => {}} />)
    })

    const shutterBtn = screen.getByTitle(/Capture Current Face Frame/i)
    expect(shutterBtn).toBeInTheDocument()

    // Click shutter
    await act(async () => {
      fireEvent.click(shutterBtn)
    })

    // Inspector preview should appear
    expect(screen.getByText(/Face Detected/i)).toBeInTheDocument()
    expect(screen.getByText(/Extracted 3×3 Sticker Colors/i)).toBeInTheDocument()
    expect(screen.getByText(/Accept Face Scan/i)).toBeInTheDocument()
    expect(screen.getByText(/Retake Scan/i)).toBeInTheDocument()

    // Accept face
    const acceptBtn = screen.getByText(/Accept Face Scan/i)
    await act(async () => {
      fireEvent.click(acceptBtn)
    })

    // Advances to next face (Right Red)
    expect(screen.getByText(/Scanning Right \(Red\) Face/i)).toBeInTheDocument()
  })
})

