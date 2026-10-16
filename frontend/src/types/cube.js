/**
 * CubeMind Canonical Constants & Type Definitions (Phase 3A)
 */

export const SOLVED_STATE_STRING = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'

export const FACES = {
  U: { name: 'Up', color: '#FFFFFF', textColor: '#0f172a', label: 'White', opposite: 'D', axis: 'Top/Bottom' },
  R: { name: 'Right', color: '#B71234', textColor: '#ffffff', label: 'Red', opposite: 'L', axis: 'Right/Left' },
  F: { name: 'Front', color: '#009B48', textColor: '#ffffff', label: 'Green', opposite: 'B', axis: 'Front/Back' },
  D: { name: 'Down', color: '#FFD500', textColor: '#0f172a', label: 'Yellow', opposite: 'U', axis: 'Top/Bottom' },
  L: { name: 'Left', color: '#FF5800', textColor: '#ffffff', label: 'Orange', opposite: 'R', axis: 'Right/Left' },
  B: { name: 'Back', color: '#0046AD', textColor: '#ffffff', label: 'Blue', opposite: 'F', axis: 'Front/Back' },
}

// Canonical Kociemba mathematical face string order: URFDLB
export const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B']

// Physical Opposite Pairs Sequence: Top/Bottom (U/D), Front/Back (F/B), Left/Right (L/R)
export const PAIRED_FACE_ORDER = ['U', 'D', 'F', 'B', 'L', 'R']


export const STANDARD_MOVES = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'L', "L'", 'L2',
  'R', "R'", 'R2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
]

export const SOLVER_STATUS = {
  SOLVED: 'SOLVED',
  ALREADY_SOLVED: 'ALREADY_SOLVED',
  INVALID_INPUT: 'INVALID_INPUT',
  UNSOLVABLE_STATE: 'UNSOLVABLE_STATE',
  TIMEOUT: 'TIMEOUT',
  ERROR: 'ERROR',
}

export const PLAYBACK_SPEEDS = [
  { label: '0.5x (Slow)', value: 1200 },
  { label: '1.0x (Normal)', value: 600 },
  { label: '2.0x (Fast)', value: 300 },
  { label: '4.0x (Instant)', value: 100 },
]

/**
 * Center facelet indices in the canonical 54-character URFDLB array.
 * Fixed under standard Western color scheme.
 */
export const CENTER_INDICES = [4, 13, 22, 31, 40, 49]

export const CENTER_FACE_MAP = {
  4: 'U',
  13: 'R',
  22: 'F',
  31: 'D',
  40: 'L',
  49: 'B',
}

export const FACE_INDEX_RANGES = {
  U: { start: 0, end: 8, center: 4, name: 'Up', label: 'White' },
  R: { start: 9, end: 17, center: 13, name: 'Right', label: 'Red' },
  F: { start: 18, end: 26, center: 22, name: 'Front', label: 'Green' },
  D: { start: 27, end: 35, center: 31, name: 'Down', label: 'Yellow' },
  L: { start: 36, end: 44, center: 40, name: 'Left', label: 'Orange' },
  B: { start: 45, end: 53, center: 49, name: 'Back', label: 'Blue' },
}

