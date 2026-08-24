/**
 * CubeMind 3D State Mapping Utility (Phase 3B)
 * Maps the 54-facelet canonical URFDLB state string to 3D cubie coordinates and facelet materials.
 */

import { SOLVED_STATE_STRING, FACES } from '../types/cube'
import { getFaceletColor } from './cubeUtils'

/**
 * Three.js BoxGeometry material face index order:
 * 0: +X (Right)
 * 1: -X (Left)
 * 2: +Y (Up)
 * 3: -Y (Down)
 * 4: +Z (Front)
 * 5: -Z (Back)
 */
export const FACE_DIR_TO_BOX_INDEX = {
  RIGHT: 0,
  LEFT: 1,
  UP: 2,
  DOWN: 3,
  FRONT: 4,
  BACK: 5,
}

export const CUBIE_INNER_COLOR = '#111827' // Dark matte plastic for internal faces

/**
 * Maps spatial (x, y, z) and face normal direction to canonical 54-facelet string index.
 * Coordinates: x ∈ {-1, 0, 1} (L to R), y ∈ {-1, 0, 1} (D to U), z ∈ {-1, 0, 1} (B to F)
 */
export function getFaceletIndex(x, y, z, direction) {
  // U Face (y = +1, indices 0..8)
  // row 0: z=-1, x=-1,0,1 -> 0,1,2
  // row 1: z= 0, x=-1,0,1 -> 3,4,5
  // row 2: z=+1, x=-1,0,1 -> 6,7,8
  if (direction === 'UP' && y === 1) {
    const row = z + 1 // -1->0, 0->1, 1->2
    const col = x + 1 // -1->0, 0->1, 1->2
    return row * 3 + col
  }

  // R Face (x = +1, indices 9..17)
  // row 0: y=+1, z=+1,0,-1 -> 9,10,11
  // row 1: y= 0, z=+1,0,-1 -> 12,13,14
  // row 2: y=-1, z=+1,0,-1 -> 15,16,17
  if (direction === 'RIGHT' && x === 1) {
    const row = 1 - y // 1->0, 0->1, -1->2
    const col = 1 - z // 1->0, 0->1, -1->2
    return 9 + row * 3 + col
  }

  // F Face (z = +1, indices 18..26)
  // row 0: y=+1, x=-1,0,1 -> 18,19,20
  // row 1: y= 0, x=-1,0,1 -> 21,22,23
  // row 2: y=-1, x=-1,0,1 -> 24,25,26
  if (direction === 'FRONT' && z === 1) {
    const row = 1 - y // 1->0, 0->1, -1->2
    const col = x + 1 // -1->0, 0->1, 1->2
    return 18 + row * 3 + col
  }

  // D Face (y = -1, indices 27..35)
  // row 0: z=+1, x=-1,0,1 -> 27,28,29
  // row 1: z= 0, x=-1,0,1 -> 30,31,32
  // row 2: z=-1, x=-1,0,1 -> 33,34,35
  if (direction === 'DOWN' && y === -1) {
    const row = 1 - z // 1->0, 0->1, -1->2
    const col = x + 1 // -1->0, 0->1, 1->2
    return 27 + row * 3 + col
  }

  // L Face (x = -1, indices 36..44)
  // row 0: y=+1, z=-1,0,+1 -> 36,37,38
  // row 1: y= 0, z=-1,0,+1 -> 39,40,41
  // row 2: y=-1, z=-1,0,+1 -> 42,43,44
  if (direction === 'LEFT' && x === -1) {
    const row = 1 - y // 1->0, 0->1, -1->2
    const col = z + 1 // -1->0, 0->1, 1->2
    return 36 + row * 3 + col
  }

  // B Face (z = -1, indices 45..53)
  // row 0: y=+1, x=+1,0,-1 -> 45,46,47
  // row 1: y= 0, x=+1,0,-1 -> 48,49,50
  // row 2: y=-1, x=+1,0,-1 -> 51,52,53
  if (direction === 'BACK' && z === -1) {
    const row = 1 - y // 1->0, 0->1, -1->2
    const col = 1 - x // 1->0, 0->1, -1->2
    return 45 + row * 3 + col
  }

  return -1 // Internal facelet
}

/**
 * Maps a 54-facelet state string to an array of 26 cubie specifications with 6 face colors each.
 */
export function mapStateTo3DCubies(stateString = SOLVED_STATE_STRING) {
  const safeStr = (stateString || SOLVED_STATE_STRING).padEnd(54, 'U')
  const cubies = []

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Skip internal core cubie (0,0,0)
        if (x === 0 && y === 0 && z === 0) continue

        const faceIndices = {
          RIGHT: x === 1 ? getFaceletIndex(x, y, z, 'RIGHT') : -1,
          LEFT: x === -1 ? getFaceletIndex(x, y, z, 'LEFT') : -1,
          UP: y === 1 ? getFaceletIndex(x, y, z, 'UP') : -1,
          DOWN: y === -1 ? getFaceletIndex(x, y, z, 'DOWN') : -1,
          FRONT: z === 1 ? getFaceletIndex(x, y, z, 'FRONT') : -1,
          BACK: z === -1 ? getFaceletIndex(x, y, z, 'BACK') : -1,
        }

        // Material array order: [+X, -X, +Y, -Y, +Z, -Z]
        const faceColors = [
          faceIndices.RIGHT >= 0 ? getFaceletColor(safeStr[faceIndices.RIGHT]) : CUBIE_INNER_COLOR,
          faceIndices.LEFT >= 0 ? getFaceletColor(safeStr[faceIndices.LEFT]) : CUBIE_INNER_COLOR,
          faceIndices.UP >= 0 ? getFaceletColor(safeStr[faceIndices.UP]) : CUBIE_INNER_COLOR,
          faceIndices.DOWN >= 0 ? getFaceletColor(safeStr[faceIndices.DOWN]) : CUBIE_INNER_COLOR,
          faceIndices.FRONT >= 0 ? getFaceletColor(safeStr[faceIndices.FRONT]) : CUBIE_INNER_COLOR,
          faceIndices.BACK >= 0 ? getFaceletColor(safeStr[faceIndices.BACK]) : CUBIE_INNER_COLOR,
        ]

        cubies.push({
          id: `cubie_${x}_${y}_${z}`,
          position: [x, y, z],
          faceColors,
          faceIndices,
        })
      }
    }
  }

  return cubies
}
