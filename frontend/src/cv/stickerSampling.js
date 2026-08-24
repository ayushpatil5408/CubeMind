/**
 * CubeMind Sticker Sampling (Phase 4B)
 * Extracts pixels from safe inner sampling regions of each 3x3 grid cell,
 * filters specular highlights and border bleed, and generates statistical color profiles.
 */

import { computeColorStatistics } from './colorAnalysis'

/**
 * Samples all 9 sticker cells from image data using precomputed grid cell bounds.
 * @param {ImageData} imageData
 * @param {Array<Object>} gridCells - 9 cells produced by estimate3x3Grid
 * @param {Object} [options]
 * @returns {Array<{
 *   index: number,
 *   row: number,
 *   col: number,
 *   name: string,
 *   isCenter: boolean,
 *   bounds: Object,
 *   sampleBounds: Object,
 *   color: Object,
 *   confidence: number
 * }>}
 */
export function sampleGridStickers(imageData, gridCells, options = {}) {
  const { outlierRejection = true } = options
  const { data, width: imgW, height: imgH } = imageData

  return gridCells.map((cell) => {
    const { sampleBounds } = cell
    const { x, y, width: sw, height: sh } = sampleBounds

    const startX = Math.max(0, Math.min(x, imgW - 1))
    const startY = Math.max(0, Math.min(y, imgH - 1))
    const endX = Math.max(startX + 1, Math.min(startX + sw, imgW))
    const endY = Math.max(startY + 1, Math.min(startY + sh, imgH))

    const rawPixels = []

    for (let py = startY; py < endY; py++) {
      const rowOffset = py * imgW
      for (let px = startX; px < endX; px++) {
        const idx = (rowOffset + px) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        rawPixels.push([r, g, b])
      }
    }

    // Outlier rejection (filter extreme glare / deep shadow pixels if variance is high)
    let finalPixels = rawPixels
    if (outlierRejection && rawPixels.length >= 16) {
      finalPixels = filterPixelOutliers(rawPixels)
    }

    const colorStats = computeColorStatistics(finalPixels)

    // Confidence metric based on sample variance and count
    // Clean, solid sticker color typically has low internal variance (< 200)
    let cellConfidence = 0.95
    if (colorStats.variance > 400) {
      cellConfidence -= Math.min(0.35, (colorStats.variance - 400) / 1000)
    }
    if (colorStats.sampleCount < 10) {
      cellConfidence -= 0.3
    }

    cellConfidence = Math.max(0.1, Math.min(1.0, Number(cellConfidence.toFixed(2))))

    return {
      index: cell.index,
      row: cell.row,
      col: cell.col,
      name: cell.name,
      isCenter: cell.isCenter,
      bounds: cell.bounds,
      sampleBounds: cell.sampleBounds,
      color: colorStats,
      confidence: cellConfidence,
    }
  })
}

/**
 * Filters out extreme luminance outliers (e.g. specular hot spots or dust specs) from pixel set.
 * @param {Array<[number, number, number]>} pixels
 * @returns {Array<[number, number, number]>}
 */
function filterPixelOutliers(pixels) {
  const lumas = pixels.map(([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b)
  const sorted = [...lumas].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.20)]
  const q3 = sorted[Math.floor(sorted.length * 0.80)]
  const iqr = q3 - q1

  const minLuma = Math.max(0, q1 - 1.5 * iqr)
  const maxLuma = Math.min(255, q3 + 1.5 * iqr)

  const filtered = []
  for (let i = 0; i < pixels.length; i++) {
    const luma = lumas[i]
    if (luma >= minLuma && luma <= maxLuma) {
      filtered.push(pixels[i])
    }
  }

  return filtered.length >= 8 ? filtered : pixels
}
