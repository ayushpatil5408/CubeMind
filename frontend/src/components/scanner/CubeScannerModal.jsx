import React, { useEffect, useRef, useState, useContext } from 'react'
import {
  Camera,
  X,
  RotateCcw,
  FlipHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react'
import { useCameraStream } from '../../hooks/useCameraStream'
import { useScanSession } from '../../hooks/useScanSession'
import { CubeContext } from '../../context/CubeContext'
import { ScanOverlayGuide } from './ScanOverlayGuide'
import { ScanFaceProgress } from './ScanFaceProgress'
import { DetectedFacePreview } from './DetectedFacePreview'
import { ScanReconstructionReview } from './ScanReconstructionReview'
import { Button } from '../common/Button'
import { CAMERA_STATUS } from '../../types/scan'
import { processCapturedFace } from '../../cv'

export function CubeScannerModal({ isOpen, onClose }) {
  const videoRef = useRef(null)
  const [capturedPreview, setCapturedPreview] = useState(null)
  const [activeCvInspection, setActiveCvInspection] = useState(null)

  const cubeContext = useContext(CubeContext)
  const setEntireState = cubeContext?.setEntireState

  const {
    stream,
    status: cameraStatus,
    isActive: isCameraActive,
    isDenied: isCameraDenied,
    isUnavailable: isCameraUnavailable,
    errorMessage,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
  } = useCameraStream()

  const {
    currentFace,
    currentFaceMeta,
    capturedFrames,
    detectedFaces,
    capturedCount,
    isAllFacesCaptured,
    rawReconstruction,
    effectiveStateString,
    effectiveColorCounts,
    saveCapturedFrame,
    acceptFace,
    overrideReconstructedSticker,
    rescanFace,
    retakeCurrentFace,
    setTargetFace,
    nextFace,
    prevFace,
    resetSession,
  } = useScanSession()

  // Start camera on modal open; stop when modal closes or when review is active
  useEffect(() => {
    if (isOpen && !isAllFacesCaptured) {
      startCamera('environment')
    } else {
      stopCamera()
      setCapturedPreview(null)
      setActiveCvInspection(null)
    }
  }, [isOpen, isAllFacesCaptured, startCamera, stopCamera])

  // Attach stream to video element whenever stream updates
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {
        // Autoplay policy handling
      })
    }
  }, [stream])

  if (!isOpen) return null

  // Capture frame from video feed and execute Phase 4B/4C CV pipeline
  const handleShutterClick = () => {
    if (!videoRef.current || !isCameraActive) return

    try {
      const frameData = captureFrame(videoRef.current)
      const cvResult = processCapturedFace(frameData.canvas || frameData, {
        targetFace: currentFace,
      })

      setActiveCvInspection({ frameData, cvResult })
      setCapturedPreview(frameData.dataUrl)
      setTimeout(() => setCapturedPreview(null), 300)
    } catch (err) {
      // Fallback
    }
  }

  const handleAcceptInspection = () => {
    if (activeCvInspection) {
      acceptFace(activeCvInspection.frameData, activeCvInspection.cvResult)
      setActiveCvInspection(null)
    }
  }

  const handleRetakeInspection = () => {
    setActiveCvInspection(null)
  }

  const handleCommitScannedCube = (scannedState) => {
    if (scannedState && setEntireState) {
      setEntireState(scannedState, 'scanner_reconstruction')
    }
    handleClose()
  }

  const handleClose = () => {
    stopCamera()
    setActiveCvInspection(null)
    onClose()
  }

  const isCurrentCaptured = !!capturedFrames[currentFace]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Cube Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {capturedCount}/6 Faces
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Phase 4C Six-Face Color Classification & Reconstruction
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            title="Close Scanner (Stops Camera)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Viewport Area */}
        <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Phase 4C 6-Face Reconstruction Review View */}
          {isAllFacesCaptured ? (
            <div className="absolute inset-0 z-30 bg-slate-950/95 overflow-y-auto">
              <ScanReconstructionReview
                stateString={effectiveStateString}
                colorCounts={effectiveColorCounts}
                reconstruction={rawReconstruction}
                detectedFaces={detectedFaces}
                onOverrideSticker={overrideReconstructedSticker}
                onRescanFace={rescanFace}
                onResetSession={resetSession}
                onCommitToSolver={handleCommitScannedCube}
              />
            </div>
          ) : activeCvInspection ? (
            /* Phase 4B Single Face Inspection Preview */
            <div className="absolute inset-0 z-30 bg-slate-950/95 overflow-y-auto">
              <DetectedFacePreview
                cvResult={activeCvInspection.cvResult}
                faceMeta={currentFaceMeta}
                previewDataUrl={activeCvInspection.frameData?.dataUrl}
                onAccept={handleAcceptInspection}
                onRetake={handleRetakeInspection}
              />
            </div>
          ) : (
            <>
              {/* Live Video Feed */}
              {isCameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* 3x3 Reticle Guide Overlay */}
              {isCameraActive && (
                <ScanOverlayGuide currentFaceMeta={currentFaceMeta} />
              )}
            </>
          )}

          {/* Shutter Flash Animation */}
          {capturedPreview && (
            <div className="absolute inset-0 bg-white/40 z-40 animate-out fade-out duration-300 pointer-events-none" />
          )}

          {/* Camera Requesting / Initializing */}
          {cameraStatus === CAMERA_STATUS.REQUESTING && !isAllFacesCaptured && (
            <div className="flex flex-col items-center gap-3 p-6 text-center z-20">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-200">
                Requesting Camera Permission...
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Please allow camera access when prompted by your browser.
              </p>
            </div>
          )}

          {/* Camera Permission Denied Error State */}
          {isCameraDenied && !isAllFacesCaptured && (
            <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md z-20">
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-400">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-red-200">
                Camera Permission Denied
              </h4>
              <p className="text-xs text-slate-300">
                {errorMessage || 'Camera access was blocked by your browser settings.'}
              </p>
              <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono">
                Click the lock/camera icon in your address bar and select "Allow".
              </p>
              <Button
                onClick={() => startCamera('environment')}
                variant="secondary"
                size="sm"
                icon={RefreshCw}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Camera Unavailable / Error State */}
          {(isCameraUnavailable || cameraStatus === CAMERA_STATUS.ERROR) && !isAllFacesCaptured && (
            <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md z-20">
              <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/60 text-amber-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-amber-200">
                Camera Unavailable
              </h4>
              <p className="text-xs text-slate-300">
                {errorMessage || 'Unable to connect to camera hardware.'}
              </p>
              <Button
                onClick={() => startCamera('environment')}
                variant="secondary"
                size="sm"
                icon={RefreshCw}
              >
                Retry Camera
              </Button>
            </div>
          )}
        </div>

        {/* 6-Face Step Indicator Bar (Hidden if in full 6-face review) */}
        {!isAllFacesCaptured && (
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex justify-center z-20">
            <ScanFaceProgress
              currentFace={currentFace}
              capturedFrames={capturedFrames}
              onSelectFace={setTargetFace}
            />
          </div>
        )}

        {/* Bottom Actions & Shutter Toolbar (Hidden if in full 6-face review) */}
        {!isAllFacesCaptured && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 z-20">
            {/* Left: Previous Face / Retake */}
            <div className="flex items-center gap-2">
              <Button
                onClick={prevFace}
                size="sm"
                variant="ghost"
                icon={ChevronLeft}
                title="Previous Face"
              />
              {isCurrentCaptured && (
                <Button
                  onClick={retakeCurrentFace}
                  size="sm"
                  variant="outline"
                  icon={RotateCcw}
                >
                  Retake
                </Button>
              )}
            </div>

            {/* Center: Shutter Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleShutterClick}
                disabled={!isCameraActive || !!activeCvInspection}
                title="Capture Current Face Frame"
                className={`relative flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-150 shadow-xl ${
                  isCameraActive && !activeCvInspection
                    ? 'border-cyan-400 bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white hover:scale-105 active:scale-95 shadow-cyan-500/30'
                    : 'border-slate-700 bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            {/* Right: Switch Camera / Next Face */}
            <div className="flex items-center gap-2">
              <Button
                onClick={switchCamera}
                disabled={!isCameraActive}
                size="sm"
                variant="ghost"
                icon={FlipHorizontal}
                title="Flip Camera (Front/Rear)"
              />
              <Button
                onClick={nextFace}
                size="sm"
                variant="ghost"
                icon={ChevronRight}
                title="Next Face"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


