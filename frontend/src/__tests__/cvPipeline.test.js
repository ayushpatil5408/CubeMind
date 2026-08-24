/**
 * Phase 4B Computer Vision Pipeline & Module Tests
 * Validates image preprocessing, grid geometry, sticker sampling,
 * color analysis, image quality checks, confidence scoring, and fallback modes.
 */

import { describe, it, expect } from 'vitest'
import {
  toGrayscale,
  cropImageData,
  computeLaplacianVariance,
  assessImageQuality,
  detectFaceRegion,
  estimate3x3Grid,
  rgbToHsv,
  rgbToHex,
  computeLuminance,
  computeColorStatistics,
  sampleGridStickers,
  evaluateScanConfidence,
  processCapturedFace,
  DETECTION_STATUS,
  CONFIDENCE_LEVEL,
  QUALITY_FLAGS,
  GRID_CELL_ORDER,
} from '../cv'

/**
 * Helper to generate synthetic ImageData with defined 3x3 colored squares.
 */
function createSyntheticCubeImage(width = 300, height = 300, options = {}) {
  const {
    colors = [
      [255, 255, 255], // 0: White
      [255, 0, 0],     // 1: Red
      [0, 255, 0],     // 2: Green
      [255, 255, 0],   // 3: Yellow
      [255, 128, 0],   // 4: Orange (Center)
      [0, 0, 255],     // 5: Blue
      [255, 255, 255], // 6: White
      [255, 0, 0],     // 7: Red
      [0, 255, 0],     // 8: Green
    ],
    blur = false,
    dark = false,
    bright = false,
    lowSat = false,
  } = options

  const data = new Uint8ClampedArray(width * height * 4)

  const cellW = width / 3
  const cellH = height / 3

  for (let y = 0; y < height; y++) {
    const row = Math.min(2, Math.floor(y / cellH))
    for (let x = 0; x < width; x++) {
      const col = Math.min(2, Math.floor(x / cellW))
      const cellIdx = row * 3 + col
      let [r, g, b] = colors[cellIdx]

      if (dark) {
        r = Math.floor(r * 0.05)
        g = Math.floor(g * 0.05)
        b = Math.floor(b * 0.05)
      } else if (bright) {
        r = Math.min(255, r + 240)
        g = Math.min(255, g + 240)
        b = Math.min(255, b + 240)
      } else if (lowSat) {
        const avg = Math.floor((r + g + b) / 3)
        r = avg
        g = avg
        b = avg
      }

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  // Simulate blur if requested (uniform flat colors create zero Laplacian variance)
  return { data, width, height }
}

describe('Phase 4B: Computer Vision Pipeline', () => {
  describe('Image Preprocessing & Low-Level Operations', () => {
    it('correctly converts RGBA ImageData to standard grayscale buffer', () => {
      const img = createSyntheticCubeImage(60, 60)
      const gray = toGrayscale(img)

      expect(gray).toBeInstanceOf(Uint8Array)
      expect(gray.length).toBe(60 * 60)
      // Top-left cell (White: 255, 255, 255) -> gray approx 255
      expect(gray[0]).toBe(255)
    })

    it('correctly crops a subregion from ImageData', () => {
      const img = createSyntheticCubeImage(60, 60)
      const crop = cropImageData(img, 20, 20, 20, 20)

      expect(crop.width).toBe(20)
      expect(crop.height).toBe(20)
      expect(crop.data.length).toBe(20 * 20 * 4)
    })
  })

  describe('Image Quality Assessment', () => {
    it('detects very dark / underexposed frames', () => {
      const darkImg = createSyntheticCubeImage(60, 60, { dark: true })
      const quality = assessImageQuality(darkImg)

      expect(quality.isTooDark).toBe(true)
      expect(quality.flags).toContain(QUALITY_FLAGS.TOO_DARK)
      expect(quality.qualityScore).toBeLessThan(0.70)
    })

    it('detects overexposed / bright glare frames', () => {
      const brightImg = createSyntheticCubeImage(60, 60, { bright: true })
      const quality = assessImageQuality(brightImg)

      expect(quality.isTooBright).toBe(true)
      expect(quality.flags).toContain(QUALITY_FLAGS.TOO_BRIGHT)
      expect(quality.qualityScore).toBeLessThan(0.70)
    })

    it('detects low color saturation in washed-out images', () => {
      const lowSatImg = createSyntheticCubeImage(60, 60, { lowSat: true })
      const quality = assessImageQuality(lowSatImg)

      expect(quality.flags).toContain(QUALITY_FLAGS.LOW_SATURATION)
      expect(quality.meanSaturation).toBeLessThan(10)
    })

    it('computes positive Laplacian edge variance on high-contrast patterns', () => {
      const img = createSyntheticCubeImage(90, 90)
      const gray = toGrayscale(img)
      const variance = computeLaplacianVariance(gray, 90, 90)

      expect(variance).toBeGreaterThan(100)
    })
  })

  describe('3x3 Grid Estimation & Cell Ordering', () => {
    it('generates 9 deterministic cells in strict row-major order (0..8)', () => {
      const faceRegion = { x: 30, y: 30, width: 240, height: 240 }
      const grid = estimate3x3Grid(faceRegion)

      expect(grid).toHaveLength(9)

      // Verify row-major sequence
      expect(grid[0]).toMatchObject({ index: 0, row: 0, col: 0, isCenter: false, name: 'Top-Left' })
      expect(grid[1]).toMatchObject({ index: 1, row: 0, col: 1, isCenter: false, name: 'Top-Center' })
      expect(grid[2]).toMatchObject({ index: 2, row: 0, col: 2, isCenter: false, name: 'Top-Right' })
      expect(grid[3]).toMatchObject({ index: 3, row: 1, col: 0, isCenter: false, name: 'Middle-Left' })
      expect(grid[4]).toMatchObject({ index: 4, row: 1, col: 1, isCenter: true, name: 'Center' })
      expect(grid[5]).toMatchObject({ index: 5, row: 1, col: 2, isCenter: false, name: 'Middle-Right' })
      expect(grid[6]).toMatchObject({ index: 6, row: 2, col: 0, isCenter: false, name: 'Bottom-Left' })
      expect(grid[7]).toMatchObject({ index: 7, row: 2, col: 1, isCenter: false, name: 'Bottom-Center' })
      expect(grid[8]).toMatchObject({ index: 8, row: 2, col: 2, isCenter: false, name: 'Bottom-Right' })
    })

    it('calculates safe inner sampling bounds strictly inside outer cell boundaries', () => {
      const faceRegion = { x: 0, y: 0, width: 300, height: 300 }
      const grid = estimate3x3Grid(faceRegion, { innerSampleRatio: 0.50 })

      grid.forEach((cell) => {
        const { bounds, sampleBounds } = cell

        expect(sampleBounds.width).toBe(bounds.width * 0.50)
        expect(sampleBounds.height).toBe(bounds.height * 0.50)
        expect(sampleBounds.x).toBeGreaterThanOrEqual(bounds.x)
        expect(sampleBounds.y).toBeGreaterThanOrEqual(bounds.y)
        expect(sampleBounds.x + sampleBounds.width).toBeLessThanOrEqual(bounds.x + bounds.width)
        expect(sampleBounds.y + sampleBounds.height).toBeLessThanOrEqual(bounds.y + bounds.height)
      })
    })
  })

  describe('Color Conversion & Feature Statistics', () => {
    it('accurately converts primary RGB colors to HSV', () => {
      expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 })
      expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 })
      expect(rgbToHsv(0, 0, 255)).toEqual({ h: 240, s: 100, v: 100 })
      expect(rgbToHsv(255, 255, 0)).toEqual({ h: 60, s: 100, v: 100 })
      expect(rgbToHsv(255, 255, 255)).toEqual({ h: 0, s: 0, v: 100 })
      expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 })
    })

    it('converts RGB to valid Hex string format', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(34, 197, 94)).toBe('#22c55e')
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
    })

    it('computes mean and median RGB from pixel lists', () => {
      const pixels = [
        [100, 100, 100],
        [102, 104, 106],
        [98, 96, 94],
      ]
      const stats = computeColorStatistics(pixels)

      expect(stats.meanRgb).toEqual({ r: 100, g: 100, b: 100 })
      expect(stats.medianRgb).toEqual({ r: 100, g: 100, b: 100 })
      expect(stats.sampleCount).toBe(3)
      expect(stats.variance).toBeLessThan(10)
    })
  })

  describe('Sticker Pixel Sampling', () => {
    it('samples 9 sticker cells with extracted color metrics and center anchor', () => {
      const img = createSyntheticCubeImage(300, 300)
      const faceRegion = { x: 0, y: 0, width: 300, height: 300 }
      const grid = estimate3x3Grid(faceRegion)
      const stickers = sampleGridStickers(img, grid)

      expect(stickers).toHaveLength(9)
      expect(stickers[4].isCenter).toBe(true)
      expect(stickers[4].name).toBe('Center')

      // Check center cell color (Orange [255, 128, 0])
      const centerStk = stickers[4]
      expect(centerStk.color.meanRgb.r).toBe(255)
      expect(centerStk.color.meanRgb.g).toBe(128)
      expect(centerStk.color.meanRgb.b).toBe(0)
      expect(centerStk.color.hex).toBe('#ff8000')
      expect(centerStk.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('Confidence Scoring & Actionable Guidance', () => {
    it('produces GOOD level rating for high-quality clean scans', () => {
      const img = createSyntheticCubeImage(300, 300)
      const imageQuality = assessImageQuality(img)
      const faceDetection = { region: { x: 0, y: 0, width: 300, height: 300 }, confidence: 0.90, isGuided: true }
      const grid = estimate3x3Grid(faceDetection.region)
      const stickers = sampleGridStickers(img, grid)

      const evalResult = evaluateScanConfidence({ imageQuality, faceDetection, stickers })

      expect(evalResult.level).toBe(CONFIDENCE_LEVEL.GOOD)
      expect(evalResult.isAcceptable).toBe(true)
      expect(evalResult.feedbackTitle).toBe('Good Scan')
      expect(evalResult.guidance.length).toBeGreaterThan(0)
    })

    it('generates guidance for dark frames requiring better lighting', () => {
      const darkImg = createSyntheticCubeImage(300, 300, { dark: true })
      const imageQuality = assessImageQuality(darkImg)
      const faceDetection = { region: { x: 0, y: 0, width: 300, height: 300 }, confidence: 0.60, isGuided: true }
      const grid = estimate3x3Grid(faceDetection.region)
      const stickers = sampleGridStickers(darkImg, grid)

      const evalResult = evaluateScanConfidence({ imageQuality, faceDetection, stickers })

      expect(evalResult.level).not.toBe(CONFIDENCE_LEVEL.GOOD)
      expect(evalResult.guidance.some((g) => g.toLowerCase().includes('dark') || g.toLowerCase().includes('light'))).toBe(true)
    })
  })

  describe('End-to-End processCapturedFace Pipeline', () => {
    it('executes full pipeline on standard synthetic cube image', () => {
      const img = createSyntheticCubeImage(300, 300)
      const result = processCapturedFace(img, { targetFace: 'F' })

      expect(result.status).toBe(DETECTION_STATUS.SUCCESS)
      expect(result.targetFace).toBe('F')
      expect(result.stickers).toHaveLength(9)
      expect(result.centerSticker).toBeDefined()
      expect(result.centerSticker.index).toBe(4)
      expect(result.confidence.isAcceptable).toBe(true)
    })

    it('supports guided fallback mode when requested', () => {
      const img = createSyntheticCubeImage(300, 300)
      const result = processCapturedFace(img, { targetFace: 'R', forceGuided: true })

      expect(result.status).toBe(DETECTION_STATUS.GUIDED_FALLBACK)
      expect(result.isGuided).toBe(true)
      expect(result.targetFace).toBe('R')
      expect(result.stickers).toHaveLength(9)
    })

    it('gracefully handles invalid zero-dimension frames without throwing', () => {
      const invalidImg = { data: new Uint8ClampedArray(0), width: 0, height: 0 }
      const result = processCapturedFace(invalidImg)

      expect(result.status).toBe(DETECTION_STATUS.FAILED)
      expect(result.confidence.level).toBe(CONFIDENCE_LEVEL.FAILED)
      expect(result.confidence.isAcceptable).toBe(false)
    })
  })
})
