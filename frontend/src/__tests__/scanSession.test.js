import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScanSession } from '../hooks/useScanSession'
import { SCAN_FACE_ORDER, SCAN_SESSION_STATUS } from '../types/scan'

describe('useScanSession hook', () => {
  it('initializes at Up (U) face in READY status', () => {
    const { result } = renderHook(() => useScanSession())

    expect(result.current.currentFace).toBe('U')
    expect(result.current.currentFaceIndex).toBe(0)
    expect(result.current.capturedCount).toBe(0)
    expect(result.current.sessionStatus).toBe(SCAN_SESSION_STATUS.READY)
    expect(result.current.isAllFacesCaptured).toBe(false)
  })

  it('progresses sequentially through all 6 faces as frames are captured', () => {
    const { result } = renderHook(() => useScanSession())

    const mockFrame = { dataUrl: 'data:image/jpeg;base64,sample' }

    // Face 0: U
    expect(result.current.currentFace).toBe('U')
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })

    // Face 1: R
    expect(result.current.currentFace).toBe('R')
    expect(result.current.capturedCount).toBe(1)
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })

    // Face 2: F
    expect(result.current.currentFace).toBe('F')
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })

    // Face 3: D
    expect(result.current.currentFace).toBe('D')
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })

    // Face 4: L
    expect(result.current.currentFace).toBe('L')
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })

    // Face 5: B (Final face)
    expect(result.current.currentFace).toBe('B')
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })

    expect(result.current.capturedCount).toBe(6)
    expect(result.current.isAllFacesCaptured).toBe(true)
    expect(result.current.sessionStatus).toBe(SCAN_SESSION_STATUS.COMPLETED)
  })

  it('allows retaking a face frame', () => {
    const { result } = renderHook(() => useScanSession())
    const mockFrame = { dataUrl: 'data:image/jpeg;base64,sample' }

    act(() => {
      result.current.saveCapturedFrame(mockFrame) // U saved, advances to R
    })
    expect(result.current.capturedFrames.U).toBeDefined()

    // Step back to U and retake
    act(() => {
      result.current.prevFace()
    })
    expect(result.current.currentFace).toBe('U')

    act(() => {
      result.current.retakeCurrentFace()
    })
    expect(result.current.capturedFrames.U).toBeNull()
    expect(result.current.capturedCount).toBe(0)
  })

  it('resets entire session', () => {
    const { result } = renderHook(() => useScanSession())
    const mockFrame = { dataUrl: 'data:image/jpeg;base64,sample' }

    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })
    act(() => {
      result.current.saveCapturedFrame(mockFrame)
    })
    expect(result.current.capturedCount).toBe(2)

    act(() => {
      result.current.resetSession()
    })

    expect(result.current.capturedCount).toBe(0)
    expect(result.current.currentFaceIndex).toBe(0)
    expect(result.current.currentFace).toBe('U')
  })
})
