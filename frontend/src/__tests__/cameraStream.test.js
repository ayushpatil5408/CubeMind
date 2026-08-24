import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCameraStream } from '../hooks/useCameraStream'
import { captureVideoFrame } from '../utils/frameCapture'
import { CAMERA_STATUS } from '../types/scan'

describe('useCameraStream hook & frameCapture utility', () => {
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

    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
        enumerateDevices: vi.fn().mockResolvedValue([
          { kind: 'videoinput', deviceId: 'cam-1', label: 'Rear Camera' },
          { kind: 'videoinput', deviceId: 'cam-2', label: 'Front Camera' },
        ]),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes in IDLE status and acquires media stream on startCamera', async () => {
    const { result } = renderHook(() => useCameraStream())

    expect(result.current.status).toBe(CAMERA_STATUS.IDLE)
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      await result.current.startCamera('environment')
    })

    expect(result.current.status).toBe(CAMERA_STATUS.ACTIVE)
    expect(result.current.isActive).toBe(true)
    expect(result.current.stream).toBe(mockStream)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
  })

  it('stops all media tracks and resets status on stopCamera', async () => {
    const { result } = renderHook(() => useCameraStream())

    await act(async () => {
      await result.current.startCamera('environment')
    })
    expect(result.current.isActive).toBe(true)

    act(() => {
      result.current.stopCamera()
    })

    expect(mockTrack.stop).toHaveBeenCalled()
    expect(result.current.status).toBe(CAMERA_STATUS.IDLE)
    expect(result.current.stream).toBe(null)
  })

  it('handles camera permission denied (NotAllowedError)', async () => {
    const permError = new Error('Permission denied')
    permError.name = 'NotAllowedError'
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(permError)

    const { result } = renderHook(() => useCameraStream())

    await act(async () => {
      await result.current.startCamera('environment')
    })

    expect(result.current.status).toBe(CAMERA_STATUS.DENIED)
    expect(result.current.isDenied).toBe(true)
    expect(result.current.errorMessage).toContain('Camera permission was denied')
  })

  it('handles camera device not found (NotFoundError)', async () => {
    const notFoundError = new Error('No camera device found')
    notFoundError.name = 'NotFoundError'
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(notFoundError)

    const { result } = renderHook(() => useCameraStream())

    await act(async () => {
      await result.current.startCamera('environment')
    })

    expect(result.current.status).toBe(CAMERA_STATUS.UNAVAILABLE)
    expect(result.current.isUnavailable).toBe(true)
    expect(result.current.errorMessage).toContain('No camera device found')
  })

  it('handles camera in use by another app (NotReadableError)', async () => {
    const inUseError = new Error('Device in use')
    inUseError.name = 'NotReadableError'
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(inUseError)

    const { result } = renderHook(() => useCameraStream())

    await act(async () => {
      await result.current.startCamera('environment')
    })

    expect(result.current.status).toBe(CAMERA_STATUS.UNAVAILABLE)
    expect(result.current.errorMessage).toContain('Camera is currently in use')
  })

  it('captures high-resolution frame from HTMLVideoElement onto canvas', () => {
    const mockVideo = {
      videoWidth: 1280,
      videoHeight: 720,
    }

    // Mock createElement canvas
    const mockCtx = {
      drawImage: vi.fn(),
    }
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mockdata'),
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas)

    const frame = captureVideoFrame(mockVideo, { maxWidth: 1280, maxHeight: 1280 })

    expect(frame.dataUrl).toBe('data:image/jpeg;base64,mockdata')
    expect(frame.width).toBe(1280)
    expect(frame.height).toBe(720)
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockVideo, 0, 0, 1280, 720)
  })
})
