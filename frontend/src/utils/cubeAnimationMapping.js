/**
 * CubeMind 3D Move Animation Mapping (Phase 3D)
 * Defines geometric rotation axes, layer coordinates, angles, and speed presets for 3D playback.
 */

export const MOVE_ANIMATION_MAP = {
  // Right Face (x = +1)
  R: { axis: 'x', layerCoord: 1, targetAngle: -Math.PI / 2, baseMove: 'R', modifier: '' },
  "R'": { axis: 'x', layerCoord: 1, targetAngle: Math.PI / 2, baseMove: 'R', modifier: "'" },
  R2: { axis: 'x', layerCoord: 1, targetAngle: -Math.PI, baseMove: 'R', modifier: '2' },

  // Left Face (x = -1)
  L: { axis: 'x', layerCoord: -1, targetAngle: Math.PI / 2, baseMove: 'L', modifier: '' },
  "L'": { axis: 'x', layerCoord: -1, targetAngle: -Math.PI / 2, baseMove: 'L', modifier: "'" },
  L2: { axis: 'x', layerCoord: -1, targetAngle: Math.PI, baseMove: 'L', modifier: '2' },

  // Up Face (y = +1)
  U: { axis: 'y', layerCoord: 1, targetAngle: -Math.PI / 2, baseMove: 'U', modifier: '' },
  "U'": { axis: 'y', layerCoord: 1, targetAngle: Math.PI / 2, baseMove: 'U', modifier: "'" },
  U2: { axis: 'y', layerCoord: 1, targetAngle: -Math.PI, baseMove: 'U', modifier: '2' },

  // Down Face (y = -1)
  D: { axis: 'y', layerCoord: -1, targetAngle: Math.PI / 2, baseMove: 'D', modifier: '' },
  "D'": { axis: 'y', layerCoord: -1, targetAngle: -Math.PI / 2, baseMove: 'D', modifier: "'" },
  D2: { axis: 'y', layerCoord: -1, targetAngle: Math.PI, baseMove: 'D', modifier: '2' },

  // Front Face (z = +1)
  F: { axis: 'z', layerCoord: 1, targetAngle: -Math.PI / 2, baseMove: 'F', modifier: '' },
  "F'": { axis: 'z', layerCoord: 1, targetAngle: Math.PI / 2, baseMove: 'F', modifier: "'" },
  F2: { axis: 'z', layerCoord: 1, targetAngle: -Math.PI, baseMove: 'F', modifier: '2' },

  // Back Face (z = -1)
  B: { axis: 'z', layerCoord: -1, targetAngle: Math.PI / 2, baseMove: 'B', modifier: '' },
  "B'": { axis: 'z', layerCoord: -1, targetAngle: -Math.PI / 2, baseMove: 'B', modifier: "'" },
  B2: { axis: 'z', layerCoord: -1, targetAngle: Math.PI, baseMove: 'B', modifier: '2' },
}

export const SPEED_PRESETS = [
  { value: 650, label: '0.5x (Slow)' },
  { value: 380, label: '1.0x (Normal)' },
  { value: 240, label: '1.5x (Fast)' },
  { value: 140, label: '2.0x (Turbo)' },
]

/**
 * Returns 3D animation parameters for a canonical move.
 */
export function getMoveAnimation(move, durationMs = 380) {
  const clean = (move || '').trim()
  const mapping = MOVE_ANIMATION_MAP[clean]
  if (!mapping) {
    return null
  }
  return {
    ...mapping,
    move: clean,
    durationMs,
  }
}
