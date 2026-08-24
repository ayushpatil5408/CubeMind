/**
 * CubeMind Single Face CV Processing Pipeline (Phase 4B)
 * Orchestrates raw frame processing, quality assessment, candidate region detection,
 * 3x3 grid estimation, sticker sampling, and multi-factor confidence scoring.
 */

import { getImageDataFromSource } from './imageProcessing'
import { assessImageQuality } from './imageQuality'
import { detectFaceRegion } from './faceDetection'
import { estimate3x3Grid } from './gridDetection'
import { sampleGridStickers } from './stickerSampling'
import { evaluateScanConfidence } from './confidence'
import { DETECTION_STATUS } from './types'

/**
 * Executes the complete Phase 4B CV pipeline for a single captured Rubik's cube face frame.
 * 
 * @param {HTMLCanvasElement|ImageData|{ data: Uint8ClampedArray, width: number, height: number }} imageSource
 * @param {Object} [options]
 * @param {string} [options.targetFace='U'] - Optional target face identifier
 * @param {boolean} [options.forceGuided=false] - Force reticle guided fallback
 * @returns {Object} DetectedFaceResult
 */
export function processCapturedFace(imageSource, options = {}) {
  const { targetFace = 'U', forceGuided = false } = options

  const imageData = getImageDataFromSource(imageSource)
  const { width, height } = imageData

  if (width < 20 || height < 20) {
    return createFailedResult('Image resolution too low for processing.')
  }

  // 1. Assess image quality
  const imageQuality = assessImageQuality(imageData)

  // 2. Detect face region (candidate or guided fallback)
  const faceDetection = detectFaceRegion(imageData, { forceGuided })

  // 3. Estimate 3x3 grid coordinates
  const gridCells = estimate3x3Grid(faceDetection.region)

  // 4. Sample pixels for all 9 sticker cells
  const stickers = sampleGridStickers(imageData, gridCells)

  // 5. Evaluate scan confidence & actionable user feedback
  const confidence = evaluateScanConfidence({
    imageQuality,
    faceDetection,
    stickers,
  })

  // 6. Center sticker reference (index 4)
  const centerSticker = stickers[4] || null

  let status = DETECTION_STATUS.SUCCESS
  if (confidence.level === 'failed') {
    status = DETECTION_STATUS.FAILED
  } else if (faceDetection.isGuided) {
    status = DETECTION_STATUS.GUIDED_FALLBACK
  } else if (confidence.level === 'warning') {
    status = DETECTION_STATUS.LOW_CONFIDENCE
  }

  return {
    status,
    targetFace,
    timestamp: Date.now(),
    dimensions: { width, height },
    imageQuality,
    faceRegion: faceDetection.region,
    detectionMode: faceDetection.mode,
    isGuided: faceDetection.isGuided,
    gridCells,
    stickers,
    centerSticker,
    confidence,
  }
}

/**
 * Creates fallback failed result for invalid or unprocessable frames.
 */
function createFailedResult(reason) {
  return {
    status: DETECTION_STATUS.FAILED,
    targetFace: 'U',
    timestamp: Date.now(),
    dimensions: { width: 0, height: 0 },
    imageQuality: {
      qualityScore: 0,
      isBlurry: true,
      blurScore: 0,
      isTooDark: false,
      isTooBright: false,
      meanBrightness: 0,
      meanSaturation: 0,
      flags: ['FAILED'],
    },
    faceRegion: { x: 0, y: 0, width: 0, height: 0 },
    detectionMode: DETECTION_STATUS.FAILED,
    isGuided: false,
    gridCells: [],
    stickers: [],
    centerSticker: null,
    confidence: {
      overallConfidence: 0,
      level: 'failed',
      isAcceptable: false,
      feedbackTitle: 'Scan Failed',
      guidance: [reason || 'Frame capture failed.'],
      metrics: {
        qualityScore: 0,
        faceConfidence: 0,
        stickerConfidence: 0,
        blurScore: 0,
        brightness: 0,
        saturation: 0,
      },
    },
  }
}
