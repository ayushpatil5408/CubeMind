import { useState, useCallback, useMemo } from 'react'
import { SCAN_FACE_ORDER, SCAN_FACE_METADATA, SCAN_SESSION_STATUS } from '../types/scan'
import { reconstructCanonicalCubeState } from '../cv/colorClassification'
import { updateStickerColor, countFaceletColors } from '../utils/cubeUtils'

export function useScanSession() {
  const [isScanning, setIsScanning] = useState(false)
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0)
  const [sessionStatus, setSessionStatus] = useState(SCAN_SESSION_STATUS.READY)
  const [capturedFrames, setCapturedFrames] = useState({
    U: null,
    R: null,
    F: null,
    D: null,
    L: null,
    B: null,
  })
  const [detectedFaces, setDetectedFaces] = useState({
    U: null,
    R: null,
    F: null,
    D: null,
    L: null,
    B: null,
  })
  const [reviewFrame, setReviewFrame] = useState(null)
  const [activeCvResult, setActiveCvResult] = useState(null)
  const [manualOverrides, setManualOverrides] = useState({}) // { [index]: colorChar }

  const currentFace = SCAN_FACE_ORDER[currentFaceIndex] || 'U'
  const currentFaceMeta = SCAN_FACE_METADATA[currentFace]

  const capturedCount = Object.values(capturedFrames).filter(Boolean).length
  const isAllFacesCaptured = capturedCount === 6

  // Automatic 6-Face Reconstruction
  const rawReconstruction = useMemo(() => {
    if (!isAllFacesCaptured) return null
    return reconstructCanonicalCubeState(detectedFaces)
  }, [isAllFacesCaptured, detectedFaces])

  // Effective state string with any user manual sticker overrides applied
  const effectiveStateString = useMemo(() => {
    if (!rawReconstruction?.stateString) return null

    let str = rawReconstruction.stateString
    Object.entries(manualOverrides).forEach(([idxStr, col]) => {
      str = updateStickerColor(str, Number(idxStr), col)
    })
    return str
  }, [rawReconstruction, manualOverrides])

  const effectiveColorCounts = useMemo(() => {
    if (!effectiveStateString) return { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 }
    return countFaceletColors(effectiveStateString)
  }, [effectiveStateString])

  // Start new scanning session
  const startScanSession = useCallback(() => {
    setIsScanning(true)
    setCurrentFaceIndex(0)
    setSessionStatus(SCAN_SESSION_STATUS.READY)
    setReviewFrame(null)
    setActiveCvResult(null)
    setManualOverrides({})
  }, [])

  // Save a captured frame and optional CV result for the current face
  const saveCapturedFrame = useCallback((frameData, cvResult = null) => {
    const face = SCAN_FACE_ORDER[currentFaceIndex]
    setCapturedFrames((prev) => ({
      ...prev,
      [face]: frameData,
    }))
    if (cvResult) {
      setDetectedFaces((prev) => ({
        ...prev,
        [face]: cvResult,
      }))
    }

    // Check if next face exists
    if (currentFaceIndex + 1 < SCAN_FACE_ORDER.length) {
      setCurrentFaceIndex((prev) => prev + 1)
      setSessionStatus(SCAN_SESSION_STATUS.READY)
      setReviewFrame(null)
      setActiveCvResult(null)
    } else {
      setSessionStatus(SCAN_SESSION_STATUS.COMPLETED)
      setReviewFrame(null)
      setActiveCvResult(null)
    }
  }, [currentFaceIndex])

  // Accept current inspected CV face result and advance
  const acceptFace = useCallback((frameData, cvResult) => {
    const face = SCAN_FACE_ORDER[currentFaceIndex]
    setCapturedFrames((prev) => ({
      ...prev,
      [face]: frameData,
    }))
    setDetectedFaces((prev) => ({
      ...prev,
      [face]: cvResult,
    }))
    setActiveCvResult(null)

    if (currentFaceIndex + 1 < SCAN_FACE_ORDER.length) {
      setCurrentFaceIndex((prev) => prev + 1)
      setSessionStatus(SCAN_SESSION_STATUS.READY)
    } else {
      setSessionStatus(SCAN_SESSION_STATUS.COMPLETED)
    }
  }, [currentFaceIndex])

  // Override / correct an individual sticker in the reconstructed cube
  const overrideReconstructedSticker = useCallback((index, colorChar) => {
    setManualOverrides((prev) => ({
      ...prev,
      [Number(index)]: (colorChar || '').toUpperCase(),
    }))
  }, [])

  // Rescan a specific single face
  const rescanFace = useCallback((face) => {
    const idx = SCAN_FACE_ORDER.indexOf(face)
    if (idx >= 0) {
      setCapturedFrames((prev) => ({ ...prev, [face]: null }))
      setDetectedFaces((prev) => ({ ...prev, [face]: null }))
      setCurrentFaceIndex(idx)
      setReviewFrame(null)
      setActiveCvResult(null)
      setSessionStatus(SCAN_SESSION_STATUS.READY)
    }
  }, [])

  // Retake the current face
  const retakeCurrentFace = useCallback(() => {
    const face = SCAN_FACE_ORDER[currentFaceIndex]
    setCapturedFrames((prev) => ({
      ...prev,
      [face]: null,
    }))
    setDetectedFaces((prev) => ({
      ...prev,
      [face]: null,
    }))
    setReviewFrame(null)
    setActiveCvResult(null)
    setSessionStatus(SCAN_SESSION_STATUS.READY)
  }, [currentFaceIndex])

  // Select target face directly
  const setTargetFace = useCallback((face) => {
    const idx = SCAN_FACE_ORDER.indexOf(face)
    if (idx >= 0) {
      setCurrentFaceIndex(idx)
      setReviewFrame(null)
      setActiveCvResult(null)
      setSessionStatus(SCAN_SESSION_STATUS.READY)
    }
  }, [])

  // Navigation steps
  const nextFace = useCallback(() => {
    setCurrentFaceIndex((prev) => Math.min(prev + 1, SCAN_FACE_ORDER.length - 1))
    setReviewFrame(null)
    setActiveCvResult(null)
  }, [])

  const prevFace = useCallback(() => {
    setCurrentFaceIndex((prev) => Math.max(prev - 1, 0))
    setReviewFrame(null)
    setActiveCvResult(null)
  }, [])

  // Reset entire session
  const resetSession = useCallback(() => {
    setCapturedFrames({
      U: null,
      R: null,
      F: null,
      D: null,
      L: null,
      B: null,
    })
    setDetectedFaces({
      U: null,
      R: null,
      F: null,
      D: null,
      L: null,
      B: null,
    })
    setCurrentFaceIndex(0)
    setReviewFrame(null)
    setActiveCvResult(null)
    setManualOverrides({})
    setSessionStatus(SCAN_SESSION_STATUS.READY)
  }, [])

  // Close session
  const closeScanSession = useCallback(() => {
    setIsScanning(false)
    setReviewFrame(null)
    setActiveCvResult(null)
    setSessionStatus(SCAN_SESSION_STATUS.READY)
  }, [])

  return {
    isScanning,
    currentFace,
    currentFaceIndex,
    currentFaceMeta,
    capturedFrames,
    detectedFaces,
    capturedCount,
    isAllFacesCaptured,
    sessionStatus,
    reviewFrame,
    activeCvResult,
    rawReconstruction,
    effectiveStateString,
    effectiveColorCounts,
    manualOverrides,
    setActiveCvResult,
    startScanSession,
    saveCapturedFrame,
    acceptFace,
    overrideReconstructedSticker,
    rescanFace,
    retakeCurrentFace,
    setTargetFace,
    nextFace,
    prevFace,
    resetSession,
    closeScanSession,
  }
}

