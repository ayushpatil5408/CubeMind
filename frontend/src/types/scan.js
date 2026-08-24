/**
 * CubeMind Camera & Scanning Types (Phase 4A)
 * Defines scanning face sequences, orientation instructions, and scanner state enums.
 */

export const SCAN_FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B']

export const SCAN_FACE_METADATA = {
  U: {
    face: 'U',
    name: 'Up (White)',
    color: '#f8fafc',
    textColor: '#0f172a',
    instruction: 'Hold the cube with WHITE center on top, GREEN facing you.',
    centerHint: 'White Center',
  },
  R: {
    face: 'R',
    name: 'Right (Red)',
    color: '#ef4444',
    textColor: '#ffffff',
    instruction: 'Rotate the cube to the RIGHT face (RED center), WHITE on top.',
    centerHint: 'Red Center',
  },
  F: {
    face: 'F',
    name: 'Front (Green)',
    color: '#22c55e',
    textColor: '#ffffff',
    instruction: 'Rotate back to FRONT face (GREEN center), WHITE on top.',
    centerHint: 'Green Center',
  },
  D: {
    face: 'D',
    name: 'Down (Yellow)',
    color: '#eab308',
    textColor: '#0f172a',
    instruction: 'Tilt cube up to scan DOWN face (YELLOW center), GREEN facing up.',
    centerHint: 'Yellow Center',
  },
  L: {
    face: 'L',
    name: 'Left (Orange)',
    color: '#f97316',
    textColor: '#ffffff',
    instruction: 'Rotate the cube to the LEFT face (ORANGE center), WHITE on top.',
    centerHint: 'Orange Center',
  },
  B: {
    face: 'B',
    name: 'Back (Blue)',
    color: '#3b82f6',
    textColor: '#ffffff',
    instruction: 'Rotate the cube to the BACK face (BLUE center), WHITE on top.',
    centerHint: 'Blue Center',
  },
}

export const CAMERA_STATUS = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  ACTIVE: 'active',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  NOT_SUPPORTED: 'not_supported',
  ERROR: 'error',
}

export const SCAN_SESSION_STATUS = {
  READY: 'ready',
  CAPTURING: 'capturing',
  REVIEWING: 'reviewing',
  COMPLETED: 'completed',
}
