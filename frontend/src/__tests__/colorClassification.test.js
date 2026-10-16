/**
 * Phase 4C Color Classification, Clustering & Canonical State Reconstruction Tests
 * Validates center calibration, color distance metrics, 9-per-color global balancing,
 * canonical state string construction, manual corrections, and review workflows.
 */

import { describe, it, expect } from 'vitest'
import {
  calibrateCenterReferences,
  computeColorDistance,
  classifyStickersWithBalancing,
  reconstructCanonicalCubeState,
  DEFAULT_WCA_REFERENCES,
} from '../cv/colorClassification'
import { SOLVED_STATE_STRING, CENTER_INDICES } from '../types/cube'
import { SCAN_FACE_ORDER } from '../types/scan'

/**
 * Helper to build synthetic 54-sticker dataset with realistic RGB/HSV color vectors.
 */
function createSynthetic54StickerDataset(stateStr = SOLVED_STATE_STRING, noiseRatio = 0) {
  const colorMap = {
    U: { meanRgb: { r: 255, g: 255, b: 255 }, hsv: { h: 0, s: 0, v: 100 }, hex: '#FFFFFF' },
    R: { meanRgb: { r: 183, g: 18, b: 52 }, hsv: { h: 348, s: 90, v: 72 }, hex: '#B71234' },
    F: { meanRgb: { r: 0, g: 155, b: 72 }, hsv: { h: 148, s: 100, v: 61 }, hex: '#009B48' },
    D: { meanRgb: { r: 255, g: 213, b: 0 }, hsv: { h: 50, s: 100, v: 100 }, hex: '#FFD500' },
    L: { meanRgb: { r: 255, g: 88, b: 0 }, hsv: { h: 21, s: 100, v: 100 }, hex: '#FF5800' },
    B: { meanRgb: { r: 0, g: 70, b: 173 }, hsv: { h: 216, s: 100, v: 68 }, hex: '#0046AD' },
  }

  const stickers = []

  for (let idx = 0; idx < 54; idx++) {
    const char = stateStr[idx]
    const base = colorMap[char]
    const noise = noiseRatio * (idx % 5 - 2) * 5

    stickers.push({
      index: idx,
      color: {
        meanRgb: {
          r: Math.max(0, Math.min(255, base.meanRgb.r + noise)),
          g: Math.max(0, Math.min(255, base.meanRgb.g + noise)),
          b: Math.max(0, Math.min(255, base.meanRgb.b + noise)),
        },
        hsv: {
          h: base.hsv.h,
          s: Math.max(0, Math.min(100, base.hsv.s + noise)),
          v: Math.max(0, Math.min(100, base.hsv.v + noise)),
        },
        hex: base.hex,
      },
    })
  }

  return stickers
}

/**
 * Helper to build synthetic detectedFaces dictionary for 6 faces.
 */
function createSyntheticDetectedFaces(stateStr = SOLVED_STATE_STRING) {
  const allStickers = createSynthetic54StickerDataset(stateStr)
  const detectedFaces = {}

  SCAN_FACE_ORDER.forEach((face, faceIdx) => {
    const start = faceIdx * 9
    const faceStickers = allStickers.slice(start, start + 9).map((s, relIdx) => ({
      ...s,
      index: relIdx,
      isCenter: relIdx === 4,
    }))

    detectedFaces[face] = {
      status: 'success',
      targetFace: face,
      stickers: faceStickers,
      centerSticker: faceStickers[4],
      confidence: { overallConfidence: 0.92, level: 'good' },
    }
  })

  return detectedFaces
}

describe('Phase 4C: Color Classification & Canonical Reconstruction', () => {
  describe('Center Calibration', () => {
    it('calibrates reference profiles from the 6 captured center stickers', () => {
      const detectedFaces = createSyntheticDetectedFaces()
      const references = calibrateCenterReferences(detectedFaces)

      expect(Object.keys(references)).toEqual(['U', 'R', 'F', 'D', 'L', 'B'])
      expect(references.U.face).toBe('U')
      expect(references.U.isCalibrated).toBe(true)
      expect(references.U.r).toBeGreaterThan(200) // White
      expect(references.F.g).toBeGreaterThan(150) // Green
      expect(references.B.b).toBeGreaterThan(150) // Blue
    })

    it('falls back to default WCA baseline for uncaptured centers', () => {
      const partialFaces = {
        U: { stickers: Array.from({ length: 9 }, () => ({ color: { meanRgb: { r: 250, g: 250, b: 250 }, hsv: { h: 0, s: 0, v: 98 } } })) },
      }
      const references = calibrateCenterReferences(partialFaces)

      expect(references.U.isCalibrated).toBe(true)
      expect(references.R.isCalibrated).toBe(false)
      expect(references.R.r).toBe(DEFAULT_WCA_REFERENCES.R.r)
    })
  })

  describe('Color Distance Metrics', () => {
    it('correctly discriminates White (U) from Yellow (D) based on saturation and hue', () => {
      const whiteSample = { meanRgb: { r: 245, g: 248, b: 250 }, hsv: { h: 0, s: 2, v: 98 } }
      const yellowSample = { meanRgb: { r: 235, g: 190, b: 10 }, hsv: { h: 48, s: 95, v: 92 } }

      const refWhite = DEFAULT_WCA_REFERENCES.U
      const refYellow = DEFAULT_WCA_REFERENCES.D

      const distWhiteToWhite = computeColorDistance(whiteSample, refWhite)
      const distWhiteToYellow = computeColorDistance(whiteSample, refYellow)

      expect(distWhiteToWhite).toBeLessThan(distWhiteToYellow)

      const distYellowToYellow = computeColorDistance(yellowSample, refYellow)
      const distYellowToWhite = computeColorDistance(yellowSample, refWhite)

      expect(distYellowToYellow).toBeLessThan(distYellowToWhite)
    })

    it('correctly discriminates Red (R) from Orange (L)', () => {
      const redSample = { meanRgb: { r: 235, g: 30, b: 30 }, hsv: { h: 0, s: 87, v: 92 } }
      const orangeSample = { meanRgb: { r: 245, g: 120, b: 20 }, hsv: { h: 26, s: 92, v: 96 } }

      const refRed = DEFAULT_WCA_REFERENCES.R
      const refOrange = DEFAULT_WCA_REFERENCES.L

      expect(computeColorDistance(redSample, refRed)).toBeLessThan(computeColorDistance(redSample, refOrange))
      expect(computeColorDistance(orangeSample, refOrange)).toBeLessThan(computeColorDistance(orangeSample, refRed))
    })
  })

  describe('Global 6-Color Classification & 9-Per-Color Balancing', () => {
    it('accurately classifies pristine 54-sticker solved dataset into canonical string', () => {
      const rawStickers = createSynthetic54StickerDataset(SOLVED_STATE_STRING)
      const references = DEFAULT_WCA_REFERENCES

      const result = classifyStickersWithBalancing(rawStickers, references)

      expect(result.stateString).toBe(SOLVED_STATE_STRING)
      expect(result.colorCounts).toEqual({ U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 })
      expect(result.ambiguousIndices).toHaveLength(0)
      expect(result.averageConfidence).toBeGreaterThan(0.75)
    })

    it('enforces exactly 9 stickers per color even when lighting noise causes borderline ambiguities', () => {
      // Create stickers with lighting noise
      const rawStickers = createSynthetic54StickerDataset(SOLVED_STATE_STRING, 0.4)
      const references = DEFAULT_WCA_REFERENCES

      const result = classifyStickersWithBalancing(rawStickers, references)

      expect(result.stateString).toHaveLength(54)
      expect(result.colorCounts.U).toBe(9)
      expect(result.colorCounts.R).toBe(9)
      expect(result.colorCounts.F).toBe(9)
      expect(result.colorCounts.D).toBe(9)
      expect(result.colorCounts.L).toBe(9)
      expect(result.colorCounts.B).toBe(9)

      // Center stickers must remain locked to canonical faces
      CENTER_INDICES.forEach((cIdx, i) => {
        expect(result.stateString[cIdx]).toBe(SCAN_FACE_ORDER[i])
      })
    })
  })

  describe('End-to-End Canonical 6-Face Reconstruction', () => {
    it('reconstructs valid canonical state from 6 captured face dictionaries', () => {
      const detectedFaces = createSyntheticDetectedFaces(SOLVED_STATE_STRING)
      const result = reconstructCanonicalCubeState(detectedFaces)

      expect(result.isFullyCaptured).toBe(true)
      expect(result.missingFaces).toHaveLength(0)
      expect(result.stateString).toBe(SOLVED_STATE_STRING)
      expect(result.colorCounts).toEqual({ U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 })
      expect(result.error).toBeNull()
    })

    it('gracefully reports missing faces when incomplete', () => {
      const detectedFaces = createSyntheticDetectedFaces()
      delete detectedFaces.B // Missing Back face

      const result = reconstructCanonicalCubeState(detectedFaces)

      expect(result.isFullyCaptured).toBe(false)
      expect(result.missingFaces).toContain('B')
      expect(result.stateString).toBeNull()
      expect(result.error).toBeDefined()
    })
  })
})
