/**
 * CubeMind Multi-Factor Confidence & Actionable Feedback (Phase 4B)
 * Evaluates holistic scan reliability across image quality, grid alignment,
 * and sticker sampling uniformity, producing user-facing guidance.
 */

import { CONFIDENCE_LEVEL, QUALITY_FLAGS } from './types'

/**
 * Evaluates overall confidence and generates actionable user feedback.
 * @param {Object} params
 * @param {Object} params.imageQuality - Result from assessImageQuality
 * @param {Object} params.faceDetection - Result from detectFaceRegion
 * @param {Array<Object>} params.stickers - 9 sampled stickers
 * @returns {{
 *   overallConfidence: number,
 *   level: 'good'|'warning'|'failed',
 *   isAcceptable: boolean,
 *   feedbackTitle: string,
 *   guidance: string[],
 *   metrics: {
 *     qualityScore: number,
 *     faceConfidence: number,
 *     stickerConfidence: number,
 *     blurScore: number,
 *     brightness: number,
 *     saturation: number
 *   }
 * }}
 */
export function evaluateScanConfidence({ imageQuality, faceDetection, stickers }) {
  const qScore = imageQuality.qualityScore
  const fScore = faceDetection.confidence

  // Average sticker confidence
  const avgStickerConf =
    stickers.length > 0
      ? stickers.reduce((sum, s) => sum + s.confidence, 0) / stickers.length
      : 0

  // Multi-factor weighted composite
  // Quality: 35%, Face detection: 35%, Sticker sampling: 30%
  const composite = 0.35 * qScore + 0.35 * fScore + 0.30 * avgStickerConf
  const overallConfidence = Math.max(0.05, Math.min(1.0, Number(composite.toFixed(2))))

  let level = CONFIDENCE_LEVEL.FAILED
  if (overallConfidence >= 0.75 && !imageQuality.isBlurry && !imageQuality.isTooDark) {
    level = CONFIDENCE_LEVEL.GOOD
  } else if (overallConfidence >= 0.50) {
    level = CONFIDENCE_LEVEL.WARNING
  }

  const isAcceptable = level === CONFIDENCE_LEVEL.GOOD || level === CONFIDENCE_LEVEL.WARNING

  // Generate actionable guidance messages
  const guidance = []

  if (imageQuality.flags.includes(QUALITY_FLAGS.BLURRY)) {
    guidance.push('Hold the camera steady to reduce motion blur.')
  }
  if (imageQuality.flags.includes(QUALITY_FLAGS.TOO_DARK)) {
    guidance.push('Lighting is too dark. Move into a brighter area or turn on a light.')
  }
  if (imageQuality.flags.includes(QUALITY_FLAGS.TOO_BRIGHT)) {
    guidance.push('Strong glare or reflection detected. Tilt the cube slightly away from the light.')
  }
  if (imageQuality.flags.includes(QUALITY_FLAGS.LOW_SATURATION)) {
    guidance.push('Colors appear faint. Ensure ambient light is white rather than colored.')
  }
  if (faceDetection.isGuided && level === CONFIDENCE_LEVEL.GOOD) {
    guidance.push('Cube face aligned nicely within the reticle.')
  }

  if (guidance.length === 0) {
    if (level === CONFIDENCE_LEVEL.GOOD) {
      guidance.push('Crisp scan! All 9 sticker cells successfully detected.')
    } else {
      guidance.push('Please center the cube face inside the square reticle.')
    }
  }

  let feedbackTitle = 'Good Scan'
  if (level === CONFIDENCE_LEVEL.WARNING) {
    feedbackTitle = 'Review Recommended'
  } else if (level === CONFIDENCE_LEVEL.FAILED) {
    feedbackTitle = 'Scan Failed'
  }

  return {
    overallConfidence,
    level,
    isAcceptable,
    feedbackTitle,
    guidance,
    metrics: {
      qualityScore: qScore,
      faceConfidence: Number(fScore.toFixed(2)),
      stickerConfidence: Number(avgStickerConf.toFixed(2)),
      blurScore: imageQuality.blurScore,
      brightness: imageQuality.meanBrightness,
      saturation: imageQuality.meanSaturation,
    },
  }
}
