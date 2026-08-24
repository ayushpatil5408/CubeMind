/**
 * CubeMind Canonical Move Engine (Phase 3D)
 * Pure JavaScript deterministic cube move transformations on 54-character URFDLB strings.
 * Perfectly mirrors backend/cube_engine.py permutations.
 */

import { SOLVED_STATE_STRING } from '../types/cube'

export const VALID_MOVE_BASE = ['U', 'D', 'L', 'R', 'F', 'B']
export const VALID_MODIFIERS = ['', "'", '2']

export const ALL_VALID_MOVES = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'L', "L'", 'L2',
  'R', "R'", 'R2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
]

/**
 * Validates a single move string notation.
 */
export function isValidMove(move) {
  if (typeof move !== 'string') return false
  return ALL_VALID_MOVES.includes(move.trim())
}

/**
 * Parses algorithm string or array into normalized move tokens.
 */
export function parseAlgorithm(algo) {
  if (!algo) return []
  const tokens = Array.isArray(algo) ? algo : algo.trim().split(/\s+/)
  const normalized = []

  for (const token of tokens) {
    const clean = token.trim()
    if (!clean) continue
    if (!ALL_VALID_MOVES.includes(clean)) {
      throw new Error(`Invalid move notation '${clean}'. Valid moves: ${ALL_VALID_MOVES.join(', ')}`)
    }
    normalized.push(clean)
  }
  return normalized
}

/**
 * Inverts a single move.
 * e.g. U -> U', U' -> U, U2 -> U2
 */
export function invertMove(move) {
  const clean = (move || '').trim()
  if (!ALL_VALID_MOVES.includes(clean)) {
    throw new Error(`Cannot invert invalid move '${move}'.`)
  }
  const base = clean[0]
  const modifier = clean.slice(1)

  if (modifier === '') return `${base}'`
  if (modifier === "'") return base
  if (modifier === '2') return clean
  throw new Error(`Unknown modifier in move '${move}'.`)
}

/**
 * Inverts a full sequence of moves (inverts each move and reverses array order).
 */
export function invertAlgorithm(algo) {
  const moves = parseAlgorithm(algo)
  return moves.slice().reverse().map(invertMove)
}

/**
 * Rotates a 3x3 face (9 stickers starting at offset) 90° clockwise in an array.
 */
function rotateFaceCW(arr, offset) {
  const [s0, s1, s2, s3, s4, s5, s6, s7, s8] = [
    arr[offset + 0],
    arr[offset + 1],
    arr[offset + 2],
    arr[offset + 3],
    arr[offset + 4],
    arr[offset + 5],
    arr[offset + 6],
    arr[offset + 7],
    arr[offset + 8],
  ]

  arr[offset + 0] = s6
  arr[offset + 1] = s3
  arr[offset + 2] = s0
  arr[offset + 3] = s7
  arr[offset + 4] = s4
  arr[offset + 5] = s1
  arr[offset + 6] = s8
  arr[offset + 7] = s5
  arr[offset + 8] = s2
}

function applyU(s) {
  rotateFaceCW(s, 0)
  const [f18, f19, f20, l36, l37, l38, b45, b46, b47, r9, r10, r11] = [
    s[18], s[19], s[20],
    s[36], s[37], s[38],
    s[45], s[46], s[47],
    s[9], s[10], s[11],
  ]

  s[36] = f18
  s[37] = f19
  s[38] = f20

  s[45] = l38
  s[46] = l37
  s[47] = l36

  s[9] = b47
  s[10] = b46
  s[11] = b45

  s[18] = r9
  s[19] = r10
  s[20] = r11
}

function applyD(s) {
  rotateFaceCW(s, 27)
  const [f24, f25, f26, r15, r16, r17, b51, b52, b53, l42, l43, l44] = [
    s[24], s[25], s[26],
    s[15], s[16], s[17],
    s[51], s[52], s[53],
    s[42], s[43], s[44],
  ]

  s[15] = f24
  s[16] = f25
  s[17] = f26

  s[51] = r17
  s[52] = r16
  s[53] = r15

  s[42] = b53
  s[43] = b52
  s[44] = b51

  s[24] = l42
  s[25] = l43
  s[26] = l44
}

function applyF(s) {
  rotateFaceCW(s, 18)
  const [u6, u7, u8, r9, r12, r15, d27, d28, d29, l38, l41, l44] = [
    s[6], s[7], s[8],
    s[9], s[12], s[15],
    s[27], s[28], s[29],
    s[38], s[41], s[44],
  ]

  s[9] = u6
  s[12] = u7
  s[15] = u8

  s[29] = r9
  s[28] = r12
  s[27] = r15

  s[44] = d29
  s[41] = d28
  s[38] = d27

  s[6] = l44
  s[7] = l41
  s[8] = l38
}

function applyB(s) {
  rotateFaceCW(s, 45)
  const [u0, u1, u2, r11, r14, r17, d33, d34, d35, l36, l39, l42] = [
    s[0], s[1], s[2],
    s[11], s[14], s[17],
    s[33], s[34], s[35],
    s[36], s[39], s[42],
  ]

  s[11] = u0
  s[14] = u1
  s[17] = u2

  s[35] = r11
  s[34] = r14
  s[33] = r17

  s[42] = d35
  s[39] = d34
  s[36] = d33

  s[0] = l42
  s[1] = l39
  s[2] = l36
}

function applyR(s) {
  rotateFaceCW(s, 9)
  const [f20, f23, f26, u2, u5, u8, b47, b50, b53, d29, d32, d35] = [
    s[20], s[23], s[26],
    s[2], s[5], s[8],
    s[47], s[50], s[53],
    s[29], s[32], s[35],
  ]

  s[2] = f20
  s[5] = f23
  s[8] = f26

  s[53] = u2
  s[50] = u5
  s[47] = u8

  s[29] = b53
  s[32] = b50
  s[35] = b47

  s[20] = d29
  s[23] = d32
  s[26] = d35
}

function applyL(s) {
  rotateFaceCW(s, 36)
  const [u0, u3, u6, f18, f21, f24, d27, d30, d33, b45, b48, b51] = [
    s[0], s[3], s[6],
    s[18], s[21], s[24],
    s[27], s[30], s[33],
    s[45], s[48], s[51],
  ]

  s[18] = u0
  s[21] = u3
  s[24] = u6

  s[27] = f18
  s[30] = f21
  s[33] = f24

  s[45] = d33
  s[48] = d30
  s[51] = d27

  s[0] = b51
  s[3] = b48
  s[6] = b45
}

const BASE_OPERATIONS = {
  U: applyU,
  D: applyD,
  L: applyL,
  R: applyR,
  F: applyF,
  B: applyB,
}

/**
 * Applies a single move (e.g. "R", "U'", "F2") to a 54-character state string.
 * Returns a new transformed 54-character state string.
 */
export function applyMoveToState(stateString, move) {
  const clean = (move || '').trim()
  if (!ALL_VALID_MOVES.includes(clean)) {
    throw new Error(`Invalid move '${move}'. Supported: ${ALL_VALID_MOVES.join(', ')}`)
  }

  if (!stateString || stateString.length !== 54) {
    throw new Error(`Invalid state string length: expected 54, got ${stateString?.length}`)
  }

  const s = stateString.split('')
  const base = clean[0]
  const modifier = clean.slice(1)
  const op = BASE_OPERATIONS[base]

  if (!op) {
    throw new Error(`Unknown base move '${base}'`)
  }

  if (modifier === '') {
    op(s)
  } else if (modifier === "'") {
    op(s)
    op(s)
    op(s)
  } else if (modifier === '2') {
    op(s)
    op(s)
  }

  return s.join('')
}

/**
 * Applies a sequence of moves to a 54-character state string.
 */
export function applyAlgorithmToState(stateString, algorithm) {
  const moves = parseAlgorithm(algorithm)
  let current = stateString
  for (const move of moves) {
    current = applyMoveToState(current, move)
  }
  return current
}

/**
 * Precomputes the state timeline for a solution move sequence:
 * Returns array [S0, S1, S2, ..., SN] where S0 is initial, SN is final.
 */
export function computeStateTimeline(initialState, moves) {
  const normalizedMoves = parseAlgorithm(moves)
  const timeline = [initialState]
  let current = initialState

  for (const move of normalizedMoves) {
    current = applyMoveToState(current, move)
    timeline.push(current)
  }

  return timeline
}
