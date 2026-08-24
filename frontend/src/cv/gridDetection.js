/**
 * CubeMind 3x3 Grid Estimation & Cell Geometry (Phase 4B)
 * Divides normalized face region into 9 deterministic cells (0-8 row-major)
 * and calculates border-safe inner sampling sub-regions.
 */

import { GRID_CELL_ORDER } from './types'

/**
 * Computes deterministic 3x3 grid geometry and safe inner sampling rectangles for each cell.
 * @param {{ x: number, y: number, width: number, height: number }} faceRegion
 * @param {Object} [options]
 * @param {number} [options.innerSampleRatio=0.50] - Central portion of cell to sample (0.50 = inner 50%)
 * @returns {Array<{
 *   index: number,
 *   row: number,
 *   col: number,
 *   name: string,
 *   isCenter: boolean,
 *   bounds: { x: number, y: number, width: number, height: number },
 *   sampleBounds: { x: number, y: number, width: number, height: number }
 * }>}
 */
export function estimate3x3Grid(faceRegion, options = {}) {
  const { innerSampleRatio = 0.50 } = options
  const { x, y, width, height } = faceRegion

  const cellWidth = width / 3
  const cellHeight = height / 3

  return GRID_CELL_ORDER.map((cell) => {
    const cellX = Math.round(x + cell.col * cellWidth)
    const cellY = Math.round(y + cell.row * cellHeight)
    const cellW = Math.round(cellWidth)
    const cellH = Math.round(cellHeight)

    // Calculate safe inner sampling box (centered, avoiding cell borders and black lines)
    const sampleW = Math.max(2, Math.round(cellW * innerSampleRatio))
    const sampleH = Math.max(2, Math.round(cellH * innerSampleRatio))
    const sampleX = Math.round(cellX + (cellW - sampleW) / 2)
    const sampleY = Math.round(cellY + (cellH - sampleH) / 2)

    return {
      index: cell.index,
      row: cell.row,
      col: cell.col,
      name: cell.name,
      isCenter: cell.isCenter,
      bounds: {
        x: cellX,
        y: cellY,
        width: cellW,
        height: cellH,
      },
      sampleBounds: {
        x: sampleX,
        y: sampleY,
        width: sampleW,
        height: sampleH,
      },
    }
  })
}
