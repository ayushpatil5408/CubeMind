/**
 * CubeMind Camera Stream Lifecycle Hook (Phase 4A)
 * Manages browser getUserMedia media stream, device selection, permissions, and cleanup.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { CAMERA_STATUS } from '../types/scan'
import { captureVideoFrame } from '../utils/frameCapture'

export function useCameraStream() {
  const [stream, setStream] = useState(null)
  const [status, setStatus] = useState(CAMERA_STATUS.IDLE)
  const [facingMode, setFacingMode] = useState('environment') // 'environment' (rear) | 'user' (front)
  const [availableDevices, setAvailableDevices] = useState([])
  const [activeDeviceId, setActiveDeviceId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const streamRef = useRef(null)
  streamRef.current = stream

  // Check if getUserMedia is supported in the browser
  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  // Enumerate video input devices
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return []
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices.filter((d) => d.kind === 'videoinput')
      setAvailableDevices(videoInputs)
      return videoInputs
    } catch (err) {
      return []
    }
  }, [])

  // Safely stop all tracks on the active media stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch (e) {
          // Track already ended
        }
      })
      streamRef.current = null
    }
    setStream(null)
    setStatus(CAMERA_STATUS.IDLE)
    setErrorMessage(null)
  }, [])

  // Start camera stream with constraints
  const startCamera = useCallback(async (preferredFacingMode = 'environment', deviceId = null) => {
    if (!isSupported) {
      setStatus(CAMERA_STATUS.NOT_SUPPORTED)
      setErrorMessage('Camera access is not supported by your browser or environment.')
      return null
    }

    // Stop any existing stream before starting a new one
    stopCamera()

    setStatus(CAMERA_STATUS.REQUESTING)
    setErrorMessage(null)

    const constraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : {
            facingMode: { ideal: preferredFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)
      setStatus(CAMERA_STATUS.ACTIVE)
      setFacingMode(preferredFacingMode)

      // Identify active device ID from stream tracks
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : {}
        if (settings.deviceId) {
          setActiveDeviceId(settings.deviceId)
        }
      }

      // Refresh device list
      refreshDevices()

      return mediaStream
    } catch (err) {
      const name = err.name || ''

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus(CAMERA_STATUS.DENIED)
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings to scan the cube.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus(CAMERA_STATUS.UNAVAILABLE)
        setErrorMessage('No camera device found on this system.')
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setStatus(CAMERA_STATUS.UNAVAILABLE)
        setErrorMessage('Camera is currently in use by another application or browser tab.')
      } else {
        setStatus(CAMERA_STATUS.ERROR)
        setErrorMessage(err.message || 'An unexpected error occurred while starting the camera.')
      }
      return null
    }
  }, [isSupported, stopCamera, refreshDevices])

  // Switch camera between environment and user facing, or next device
  const switchCamera = useCallback(async () => {
    if (availableDevices.length > 1) {
      const currentIndex = availableDevices.findIndex((d) => d.deviceId === activeDeviceId)
      const nextIndex = (currentIndex + 1) % availableDevices.length
      const nextDevice = availableDevices[nextIndex]
      if (nextDevice) {
        return startCamera(facingMode, nextDevice.deviceId)
      }
    }

    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment'
    return startCamera(nextFacingMode)
  }, [availableDevices, activeDeviceId, facingMode, startCamera])

  // Capture a frame from an attached video element
  const captureFrame = useCallback((videoElement, options = {}) => {
    return captureVideoFrame(videoElement, options)
  }, [])

  // Cleanup on unmount: guarantee all media tracks are stopped
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    stream,
    status,
    isActive: status === CAMERA_STATUS.ACTIVE,
    isRequesting: status === CAMERA_STATUS.REQUESTING,
    isDenied: status === CAMERA_STATUS.DENIED,
    isUnavailable: status === CAMERA_STATUS.UNAVAILABLE,
    facingMode,
    availableDevices,
    activeDeviceId,
    errorMessage,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
  }
}
