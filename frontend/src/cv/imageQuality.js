/**
 * CubeMind Image Quality Assessment (Phase 4B)
 * Evaluates blur, exposure, and color saturation signals to give actionable user advice.
 */

import { toGrayscale } from './imageProcessing'
import { QUALITY_FLAGS } from './types'

/**
 * Computes Laplacian variance on grayscale buffer to measure edge sharpness/blur.
 * Higher variance indicates sharper image; lower indicates blur.
 * @param {Uint8Array} gray - Grayscale image buffer
 * @param {number} width
 * @param {number} height
 * @returns {number} Laplacian variance score
 */
export function computeLaplacianVariance(gray, width, height) {
  if (width < 3 || height < 3) return 0

  let sum = 0
  let sumSq = 0
  let count = 0

  // 3x3 Discrete Laplacian Kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width
    const prevRowOffset = (y - 1) * width
    const nextRowOffset = (y + 1) * width

    for (let x = 1; x < width - 1; x++) {
      const center = gray[rowOffset + x]
      const top = gray[prevRowOffset + x]
      const bottom = gray[nextRowOffset + x]
      const left = gray[rowOffset + x - 1]
      const right = gray[rowOffset + x + 1]

      const lap = top + bottom + left + right - 4 * center
      sum += lap
      sumSq += lap * lap
      count++
    }
  }

  if (count === 0) return 0
  const mean = sum / count
  const variance = sumSq / count - mean * mean
  return Math.max(0, variance)
}

/**
 * Evaluates exposure (brightness/darkness) and average color saturation across an image.
 * @param {ImageData} imageData
 * @returns {{ meanBrightness: number, darkRatio: number, brightRatio: number, meanSaturation: number }}
 */
export function computeExposureAndSaturation(imageData) {
  const { data } = imageData
  const totalPixels = data.length / 4
  if (totalPixels === 0) {
    return { meanBrightness: 0, darkRatio: 0, brightRatio: 0, meanSaturation: 0 }
  }

  let totalLuma = 0
  let totalSat = 0
  let darkPixels = 0
  let brightPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Rec. 601 Luma
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    totalLuma += luma

    if (luma < 25) darkPixels++
    if (luma > 245) brightPixels++

    // Fast Saturation: (max - min) / max
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const sat = max === 0 ? 0 : (max - min) / max
    totalSat += sat
  }

  return {
    meanBrightness: totalLuma / totalPixels,
    darkRatio: darkPixels / totalPixels,
    brightRatio: brightPixels / totalPixels,
    meanSaturation: (totalSat / totalPixels) * 100, // 0-100%
  }
}

/**
 * Full image quality assessment for a frame.
 * @param {ImageData} imageData
 * @param {Object} [options]
 * @returns {{
 *   qualityScore: number,
 *   isBlurry: boolean,
 *   blurScore: number,
 *   isTooDark: boolean,
 *   isTooBright: boolean,
 *   meanBrightness: number,
 *   meanSaturation: number,
 *   flags: string[]
 * }}
 */
export function assessImageQuality(imageData, options = {}) {
  const {
    blurThreshold = 35.0,
    darkThreshold = 35.0,
    darkRatioThreshold = 0.55,
    brightThreshold = 225.0,
    brightRatioThreshold = 0.35,
    saturationThreshold = 8.0,
  } = options

  const { width, height } = imageData
  const gray = toGrayscale(imageData)
  const blurScore = computeLaplacianVariance(gray, width, height)
  const exposure = computeExposureAndSaturation(imageData)

  const flags = []

  const isBlurry = blurScore < blurThreshold
  if (isBlurry) flags.push(QUALITY_FLAGS.BLURRY)

  const isTooDark = exposure.meanBrightness < darkThreshold || exposure.darkRatio > darkRatioThreshold
  if (isTooDark) flags.push(QUALITY_FLAGS.TOO_DARK)

  const isTooBright = exposure.meanBrightness > brightThreshold || exposure.brightRatio > brightRatioThreshold
  if (isTooBright) flags.push(QUALITY_FLAGS.TOO_BRIGHT)

  const isLowSaturation = exposure.meanSaturation < saturationThreshold
  if (isLowSaturation) flags.push(QUALITY_FLAGS.LOW_SATURATION)

  // Compute composite quality score [0..1]
  let score = 1.0

  if (isBlurry) {
    score -= 0.35 * Math.min(1, (blurThreshold - blurScore) / blurThreshold)
  }
  if (isTooDark) {
    score -= 0.40 * Math.min(1, (darkThreshold - exposure.meanBrightness) / darkThreshold + exposure.darkRatio)
  }
  if (isTooBright) {
    score -= 0.40 * Math.min(1, (exposure.meanBrightness - brightThreshold) / (255 - brightThreshold) + exposure.brightRatio)
  }
  if (isLowSaturation) {
    score -= 0.15
  }

  const qualityScore = Math.max(0.05, Math.min(1.0, Number(score.toFixed(3))))

  return {
    qualityScore,
    isBlurry,
    blurScore: Number(blurScore.toFixed(2)),
    isTooDark,
    isTooBright,
    meanBrightness: Number(exposure.meanBrightness.toFixed(1)),
    meanSaturation: Number(exposure.meanSaturation.toFixed(1)),
    flags,
  }
}
