/**
 * CubeMind Computer Vision Types & Contracts (Phase 4B)
 * Defines data structures, confidence levels, detection modes, and sticker feature contracts.
 */

export const DETECTION_STATUS = {
  SUCCESS: 'success', // High-confidence quad/contour detection
  GUIDED_FALLBACK: 'guided_fallback', // Center-guided reticle grid fallback
  LOW_CONFIDENCE: 'low_confidence', // Candidate detected but with low certainty
  FAILED: 'failed', // Image unusable (pitch black, extreme blur, out of frame)
}

export const CONFIDENCE_LEVEL = {
  GOOD: 'good', // Confidence >= 0.75 - Scan is crisp and reliable
  WARNING: 'warning', // 0.50 <= Confidence < 0.75 - Review needed
  FAILED: 'failed', // Confidence < 0.50 - Retake required
}

export const QUALITY_FLAGS = {
  BLURRY: 'BLURRY',
  TOO_DARK: 'TOO_DARK',
  TOO_BRIGHT: 'TOO_BRIGHT',
  LOW_SATURATION: 'LOW_SATURATION',
  OFF_CENTER: 'OFF_CENTER',
  HIGH_VARIANCE: 'HIGH_VARIANCE',
}

/**
 * Deterministic 3x3 Grid Coordinate Index Definition:
 * 0: Top-Left       1: Top-Center       2: Top-Right
 * 3: Middle-Left    4: Center (Anchor)  5: Middle-Right
 * 6: Bottom-Left    7: Bottom-Center    8: Bottom-Right
 */
export const GRID_CELL_ORDER = [
  { index: 0, row: 0, col: 0, name: 'Top-Left', isCenter: false },
  { index: 1, row: 0, col: 1, name: 'Top-Center', isCenter: false },
  { index: 2, row: 0, col: 2, name: 'Top-Right', isCenter: false },
  { index: 3, row: 1, col: 0, name: 'Middle-Left', isCenter: false },
  { index: 4, row: 1, col: 1, name: 'Center', isCenter: true },
  { index: 5, row: 1, col: 2, name: 'Middle-Right', isCenter: false },
  { index: 6, row: 2, col: 0, name: 'Bottom-Left', isCenter: false },
  { index: 7, row: 2, col: 1, name: 'Bottom-Center', isCenter: false },
  { index: 8, row: 2, col: 2, name: 'Bottom-Right', isCenter: false },
]
