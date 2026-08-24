/**
 * CubeMind Six-Face Color Classification & Canonical Reconstruction (Phase 4C)
 * Calibrates color references from 6 center stickers, classifies 54 stickers using
 * feature distance metrics, enforces exact 9-per-color global balancing, and
 * reconstructs canonical URFDLB state strings.
 */

import { rgbToHsv } from './colorAnalysis'
import { SCAN_FACE_ORDER } from '../types/scan'
import { CENTER_INDICES, CENTER_FACE_MAP } from '../types/cube'

/**
 * Standard WCA Western Color Baseline Reference Vectors
 */
export const DEFAULT_WCA_REFERENCES = {
  U: { r: 248, g: 250, b: 252, h: 0, s: 2, v: 98, name: 'White', face: 'U' },
  R: { r: 239, g: 68, b: 68, h: 0, s: 72, v: 94, name: 'Red', face: 'R' },
  F: { r: 34, g: 197, b: 94, h: 142, s: 83, v: 77, name: 'Green', face: 'F' },
  D: { r: 234, g: 179, b: 8, h: 45, s: 97, v: 92, name: 'Yellow', face: 'D' },
  L: { r: 249, g: 115, b: 22, h: 25, s: 91, v: 98, name: 'Orange', face: 'L' },
  B: { r: 59, g: 130, b: 246, h: 217, s: 76, v: 96, name: 'Blue', face: 'B' },
}

/**
 * Extracts calibrated color reference profiles from the 6 center stickers of captured faces.
 * @param {Object} detectedFaces - Dictionary { U: result, R: result, ... }
 * @returns {Object} Calibrated reference dictionary { U: ref, R: ref, ... }
 */
export function calibrateCenterReferences(detectedFaces = {}) {
  const references = {}

  for (const face of SCAN_FACE_ORDER) {
    const faceResult = detectedFaces[face]
    const centerSticker = faceResult?.stickers ? faceResult.stickers[4] : faceResult?.centerSticker

    if (centerSticker && centerSticker.color) {
      const { meanRgb, hsv, hex } = centerSticker.color
      references[face] = {
        r: meanRgb.r,
        g: meanRgb.g,
        b: meanRgb.b,
        h: hsv.h,
        s: hsv.s,
        v: hsv.v,
        hex,
        face,
        isCalibrated: true,
      }
    } else {
      // Fallback to WCA standard baseline if center not yet captured
      references[face] = {
        ...DEFAULT_WCA_REFERENCES[face],
        isCalibrated: false,
      }
    }
  }

  return references
}

/**
 * Computes color distance between a sampled sticker color and a target reference color.
 * Combines circular hue distance, saturation/value differences, and normalized RGB Euclidean distance.
 * @param {Object} sample - { meanRgb: {r,g,b}, hsv: {h,s,v} }
 * @param {Object} ref - { r, g, b, h, s, v, face }
 * @returns {number} Non-negative distance score (lower = closer match)
 */
export function computeColorDistance(sample, ref) {
  if (!sample || !ref) return 9999

  const sRgb = sample.meanRgb || sample
  const sHsv = sample.hsv || rgbToHsv(sRgb.r, sRgb.g, sRgb.b)

  // 1. Normalized RGB distance [0..1]
  const dr = (sRgb.r - ref.r) / 255
  const dg = (sRgb.g - ref.g) / 255
  const db = (sRgb.b - ref.b) / 255
  const rgbDist = Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(3)

  // 2. Circular Hue distance [0..1]
  let dh = Math.abs(sHsv.h - ref.h)
  if (dh > 180) dh = 360 - dh
  const hueDist = dh / 180

  // 3. Saturation & Value differences [0..1]
  const satDist = Math.abs(sHsv.s - ref.s) / 100
  const valDist = Math.abs(sHsv.v - ref.v) / 100

  // Specialized classification heuristics:
  // Case A: Target is White ('U')
  // White has very low saturation (s < 28) and high brightness
  if (ref.face === 'U') {
    const isDesaturated = sHsv.s < 28
    const isBright = sHsv.v > 50 || (sRgb.r > 150 && sRgb.g > 150 && sRgb.b > 150)

    if (isDesaturated && isBright) {
      return satDist * 0.5 + rgbDist * 0.5
    }
    // Heavy penalty if comparing saturated color against White
    return 1.5 + satDist + rgbDist
  }

  // Case B: Sample is nearly achromatic (White-like), but target is chromatic
  if (sHsv.s < 20 && sHsv.v > 60 && ref.face !== 'U') {
    return 2.0 + (1 - satDist) + rgbDist
  }

  // Case C: Red vs Orange distinction (both warm hues near 0° / 25°)
  if ((ref.face === 'R' || ref.face === 'L') && sHsv.h < 45) {
    return hueDist * 1.4 + satDist * 0.4 + valDist * 0.3 + rgbDist * 0.7
  }

  // Case D: Yellow vs White/Orange distinction
  if (ref.face === 'D') {
    return hueDist * 1.2 + satDist * 0.6 + valDist * 0.4 + rgbDist * 0.6
  }

  // General Chromatic Distance (Green, Blue, Red, Orange, Yellow)
  return hueDist * 1.0 + satDist * 0.5 + valDist * 0.3 + rgbDist * 0.7
}

/**
 * Classifies 54 stickers into 6 color groups with global count balancing (exactly 9 per color).
 * @param {Array<Object>} rawStickers - Array of 54 sticker objects in canonical index order (0..53)
 * @param {Object} centerReferences - Calibrated center profiles for U, R, F, D, L, B
 * @returns {{
 *   stateString: string,
 *   classifiedStickers: Array<Object>,
 *   colorCounts: Object,
 *   ambiguousIndices: Array<number>,
 *   averageConfidence: number
 * }}
 */
export function classifyStickersWithBalancing(rawStickers, centerReferences) {
  if (!rawStickers || rawStickers.length !== 54) {
    throw new Error('Expected exactly 54 raw sticker samples for canonical classification.')
  }

  const faces = SCAN_FACE_ORDER // ['U', 'R', 'F', 'D', 'L', 'B']
  const classified = new Array(54)

  // Target count per color: exactly 9 total (1 center + 8 non-centers)
  const remainingCapacity = { U: 8, R: 8, F: 8, D: 8, L: 8, B: 8 }

  // Step 1: Assign fixed centers
  for (let idx = 0; idx < 54; idx++) {
    if (CENTER_INDICES.includes(idx)) {
      const fixedFace = CENTER_FACE_MAP[idx]
      classified[idx] = {
        index: idx,
        color: fixedFace,
        confidence: 1.0,
        isCenter: true,
        isAmbiguous: false,
        rawColor: rawStickers[idx]?.color || null,
        distances: { [fixedFace]: 0 },
      }
    }
  }

  // Step 2: Compute distance matrix for all 48 non-center stickers
  const nonCenterItems = []

  for (let idx = 0; idx < 54; idx++) {
    if (CENTER_INDICES.includes(idx)) continue

    const sticker = rawStickers[idx]
    const distances = {}
    let minD = Infinity
    let secondMinD = Infinity
    let bestFace = 'U'

    for (const face of faces) {
      const ref = centerReferences[face] || DEFAULT_WCA_REFERENCES[face]
      const dist = computeColorDistance(sticker?.color || sticker, ref)
      distances[face] = Number(dist.toFixed(4))

      if (dist < minD) {
        secondMinD = minD
        minD = dist
        bestFace = face
      } else if (dist < secondMinD) {
        secondMinD = dist
      }
    }

    // Confidence metric based on difference between top 2 nearest color references
    const denom = minD + secondMinD
    const margin = denom > 0 ? (secondMinD - minD) / denom : 1.0
    const confidence = Math.max(0.1, Math.min(1.0, Number(margin.toFixed(2))))

    nonCenterItems.push({
      index: idx,
      rawColor: sticker?.color || sticker,
      bestFace,
      minD,
      secondMinD,
      confidence,
      distances,
    })
  }

  // Step 3: Sort non-centers by confidence descending (assign highest-certainty stickers first)
  nonCenterItems.sort((a, b) => b.confidence - a.confidence)

  const unassigned = []

  for (const item of nonCenterItems) {
    if (remainingCapacity[item.bestFace] > 0) {
      classified[item.index] = {
        index: item.index,
        color: item.bestFace,
        confidence: item.confidence,
        isCenter: false,
        isAmbiguous: item.confidence < 0.40,
        rawColor: item.rawColor,
        distances: item.distances,
      }
      remainingCapacity[item.bestFace]--
    } else {
      unassigned.push(item)
    }
  }

  // Step 4: Globally balance any remaining unassigned stickers to available slots
  for (const item of unassigned) {
    let bestAvailableFace = null
    let bestAvailableDist = Infinity

    for (const face of faces) {
      if (remainingCapacity[face] > 0) {
        const d = item.distances[face]
        if (d < bestAvailableDist) {
          bestAvailableDist = d
          bestAvailableFace = face
        }
      }
    }

    if (bestAvailableFace) {
      classified[item.index] = {
        index: item.index,
        color: bestAvailableFace,
        // Lower confidence for constrained fallback assignments
        confidence: Math.max(0.15, Number((item.confidence * 0.6).toFixed(2))),
        isCenter: false,
        isAmbiguous: true, // Marked for user review
        rawColor: item.rawColor,
        distances: item.distances,
      }
      remainingCapacity[bestAvailableFace]--
    }
  }

  // Build final 54-character canonical string
  const stateChars = classified.map((c) => c.color)
  const stateString = stateChars.join('')

  const colorCounts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 }
  for (const char of stateChars) {
    if (colorCounts[char] !== undefined) colorCounts[char]++
  }

  const ambiguousIndices = classified
    .filter((c) => c.isAmbiguous && !c.isCenter)
    .map((c) => c.index)

  const totalConf = classified.reduce((sum, c) => sum + c.confidence, 0)
  const averageConfidence = Number((totalConf / 54).toFixed(2))

  return {
    stateString,
    classifiedStickers: classified,
    colorCounts,
    ambiguousIndices,
    averageConfidence,
  }
}

/**
 * Reconstructs the canonical 54-character cube state from the 6 captured face results.
 * @param {Object} detectedFaces - Dictionary { U: result, R: result, F: result, D: result, L: result, B: result }
 * @returns {Object} Complete reconstructed canonical state payload
 */
export function reconstructCanonicalCubeState(detectedFaces = {}) {
  const faces = SCAN_FACE_ORDER
  const missingFaces = faces.filter((f) => !detectedFaces[f] || !detectedFaces[f].stickers)

  if (missingFaces.length > 0) {
    return {
      isFullyCaptured: false,
      missingFaces,
      stateString: null,
      classifiedStickers: [],
      ambiguousIndices: [],
      averageConfidence: 0,
      centerReferences: calibrateCenterReferences(detectedFaces),
      error: `Incomplete scan: missing faces ${missingFaces.join(', ')}.`,
    }
  }

  // Extract all 54 raw sticker samples in canonical order
  // U (0..8), R (9..17), F (18..26), D (27..35), L (36..44), B (45..53)
  const all54Stickers = []

  for (const face of faces) {
    const faceStickers = detectedFaces[face].stickers
    for (let i = 0; i < 9; i++) {
      all54Stickers.push(faceStickers[i])
    }
  }

  // Calibrate center references
  const centerReferences = calibrateCenterReferences(detectedFaces)

  // Classify with global 9-count balancing
  const classification = classifyStickersWithBalancing(all54Stickers, centerReferences)

  return {
    isFullyCaptured: true,
    missingFaces: [],
    stateString: classification.stateString,
    classifiedStickers: classification.classifiedStickers,
    colorCounts: classification.colorCounts,
    ambiguousIndices: classification.ambiguousIndices,
    averageConfidence: classification.averageConfidence,
    centerReferences,
    error: null,
  }
}
