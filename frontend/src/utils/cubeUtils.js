import { FACES, SOLVED_STATE_STRING, CENTER_INDICES, CENTER_FACE_MAP, FACE_ORDER, FACE_INDEX_RANGES } from '../types/cube'

/**
 * Returns whether a given 0-indexed sticker is a center piece.
 */
export function isCenterIndex(index) {
  return CENTER_INDICES.includes(Number(index))
}

/**
 * Returns the canonical fixed face letter if the index is a center, else null.
 */
export function getCenterFace(index) {
  return CENTER_FACE_MAP[Number(index)] || null
}

/**
 * Returns the face ('U', 'R', 'F', 'D', 'L', 'B') that a 0-indexed sticker belongs to.
 */
export function getFaceForIndex(index) {
  const i = Number(index)
  if (i >= 0 && i <= 8) return 'U'
  if (i >= 9 && i <= 17) return 'R'
  if (i >= 18 && i <= 26) return 'F'
  if (i >= 27 && i <= 35) return 'D'
  if (i >= 36 && i <= 44) return 'L'
  if (i >= 45 && i <= 53) return 'B'
  return null
}

/**
 * Returns a human-friendly name for a sticker position (e.g. "Front Top-Left [18]").
 */
export function getStickerPositionName(index) {
  const idx = Number(index)
  const face = getFaceForIndex(idx)
  if (!face) return `Sticker #${idx}`

  const range = FACE_INDEX_RANGES[face]
  const rel = idx - range.start
  const row = Math.floor(rel / 3)
  const col = rel % 3

  const rowNames = ['Top', 'Middle', 'Bottom']
  const colNames = ['Left', 'Center', 'Right']

  if (rel === 4) {
    return `${range.name} Center (Fixed ${range.label}) [${idx}]`
  }

  const pos = `${rowNames[row]}-${colNames[col]}`
  return `${range.name} ${pos} [${idx}]`
}

/**
 * Updates a single sticker at `index` with `color` ('U'|'R'|'F'|'D'|'L'|'B').
 * Protects center stickers from being modified.
 */
export function updateStickerColor(stateString, index, color) {
  const idx = Number(index)
  const col = (color || '').toUpperCase()

  if (!stateString || typeof stateString !== 'string' || stateString.length !== 54) {
    return stateString
  }

  if (idx < 0 || idx >= 54) {
    return stateString
  }

  // Prevent modifying center stickers to anything other than their fixed color
  if (isCenterIndex(idx)) {
    const fixedFace = getCenterFace(idx)
    if (col !== fixedFace) {
      return stateString // Reject invalid center modification
    }
  }

  const arr = stateString.split('')
  arr[idx] = col
  return arr.join('')
}

/**
 * Returns the hex color corresponding to a canonical facelet character.
 */
export function getFaceletColor(char) {
  const upper = (char || '').toUpperCase()
  return FACES[upper]?.color || '#475569'
}

/**
 * Returns text color for high contrast against the facelet color.
 */
export function getFaceletTextColor(char) {
  const upper = (char || '').toUpperCase()
  return FACES[upper]?.textColor || '#ffffff'
}

/**
 * Counts occurrences of each face character in a 54-char state string.
 */
export function countFaceletColors(stateString) {
  const counts = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 }
  if (typeof stateString !== 'string') return counts

  for (let i = 0; i < stateString.length; i++) {
    const ch = stateString[i].toUpperCase()
    if (counts[ch] !== undefined) {
      counts[ch]++
    }
  }
  return counts
}

/**
 * Performs fast frontend structural validation of a state string.
 */
export function validateBasicFormat(stateString) {
  if (typeof stateString !== 'string') {
    return { isValid: false, message: 'State must be a string', code: 'INVALID_TYPE' }
  }
  if (stateString.length !== 54) {
    return {
      isValid: false,
      message: `Invalid length: expected 54 characters, got ${stateString.length}`,
      code: 'INVALID_LENGTH',
    }
  }

  const validChars = new Set(['U', 'R', 'F', 'D', 'L', 'B'])
  for (let i = 0; i < stateString.length; i++) {
    if (!validChars.has(stateString[i].toUpperCase())) {
      return {
        isValid: false,
        message: `Invalid character '${stateString[i]}' at position ${i}. Expected U, R, F, D, L, or B.`,
        code: 'INVALID_CHAR',
      }
    }
  }

  // Check center stickers
  for (const centerIdx of CENTER_INDICES) {
    const expected = getCenterFace(centerIdx)
    const actual = stateString[centerIdx]?.toUpperCase()
    if (actual !== expected) {
      return {
        isValid: false,
        message: `Center sticker at index ${centerIdx} must be '${expected}', but found '${actual}'.`,
        code: 'INVALID_CENTER',
      }
    }
  }

  const counts = countFaceletColors(stateString)
  const distributionErrors = []
  for (const [face, count] of Object.entries(counts)) {
    if (count !== 9) {
      distributionErrors.push(`${face}: ${count}/9`)
    }
  }

  if (distributionErrors.length > 0) {
    return {
      isValid: false,
      message: `Invalid color distribution (${distributionErrors.join(', ')}). Each color must have exactly 9 stickers.`,
      code: 'INVALID_DISTRIBUTION',
      counts,
    }
  }

  return { isValid: true, message: 'Valid format and distribution', code: 'VALID', counts }
}

/**
 * Breaks a 54-char string into 6 face matrices of 3x3.
 * Ordering: U (0-8), R (9-17), F (18-26), D (27-35), L (36-44), B (45-53)
 */
export function parseFacelets(stateString = SOLVED_STATE_STRING) {
  const safeStr = (stateString || SOLVED_STATE_STRING).padEnd(54, 'U')
  return {
    U: sliceFace(safeStr, 0),
    R: sliceFace(safeStr, 9),
    F: sliceFace(safeStr, 18),
    D: sliceFace(safeStr, 27),
    L: sliceFace(safeStr, 36),
    B: sliceFace(safeStr, 45),
  }
}

function sliceFace(str, offset) {
  const grid = []
  for (let r = 0; r < 3; r++) {
    const row = []
    for (let c = 0; c < 3; c++) {
      row.push(str[offset + r * 3 + c])
    }
    grid.push(row)
  }
  return grid
}

/**
 * Common preset algorithms for demo / quick testing.
 */
export const ALGORITHM_PRESETS = [
  { id: 'sexy', name: 'Sexy Move', moves: "R U R' U'", description: '4-move trigger used in F2L and PLL' },
  { id: 'sune', name: 'Sune (OLL)', moves: "R U R' U R U2 R'", description: 'Classic 7-move corner orientation algorithm' },
  { id: 'anti_sune', name: 'Anti-Sune', moves: "R U2 R' U' R U' R'", description: 'Mirrored Sune algorithm' },
  { id: 'checkerboard', name: 'Checkerboard', moves: 'U2 D2 F2 B2 L2 R2', description: 'Famous 6-move symmetric aesthetic pattern' },
  { id: 't_perm', name: 'T-Permutation', moves: "R U R' U' R' F R2 U' R' U' R U R' F'", description: '14-move adjacent corner and edge swap' },
  { id: 'superflip', name: 'Superflip', moves: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2", description: "All 12 edges flipped in place (God's Number 20-move maximum)" },
]

