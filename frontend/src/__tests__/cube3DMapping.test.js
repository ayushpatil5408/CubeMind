import { describe, it, expect } from 'vitest'
import {
  getFaceletIndex,
  mapStateTo3DCubies,
  CUBIE_INNER_COLOR,
} from '../utils/cube3DMapping'
import { SOLVED_STATE_STRING, FACES } from '../types/cube'

describe('cube3DMapping (Phase 3B)', () => {
  it('maps center pieces to canonical facelet indices', () => {
    expect(getFaceletIndex(0, 1, 0, 'UP')).toBe(4) // U center
    expect(getFaceletIndex(1, 0, 0, 'RIGHT')).toBe(13) // R center
    expect(getFaceletIndex(0, 0, 1, 'FRONT')).toBe(22) // F center
    expect(getFaceletIndex(0, -1, 0, 'DOWN')).toBe(31) // D center
    expect(getFaceletIndex(-1, 0, 0, 'LEFT')).toBe(40) // L center
    expect(getFaceletIndex(0, 0, -1, 'BACK')).toBe(49) // B center
  })

  it('maps URF corner cubie at (1, 1, 1) to canonical indices', () => {
    // URF corner: U facelet index 8, R facelet index 9, F facelet index 20
    expect(getFaceletIndex(1, 1, 1, 'UP')).toBe(8)
    expect(getFaceletIndex(1, 1, 1, 'RIGHT')).toBe(9)
    expect(getFaceletIndex(1, 1, 1, 'FRONT')).toBe(20)
  })

  it('maps UF edge cubie at (0, 1, 1) to canonical indices', () => {
    // UF edge: U facelet index 7, F facelet index 19
    expect(getFaceletIndex(0, 1, 1, 'UP')).toBe(7)
    expect(getFaceletIndex(0, 1, 1, 'FRONT')).toBe(19)
  })

  it('generates exactly 26 visible cubies', () => {
    const cubies = mapStateTo3DCubies(SOLVED_STATE_STRING)
    expect(cubies.length).toBe(26)
    // Assert no cubie at origin (0, 0, 0)
    const hasCore = cubies.some((c) => c.position[0] === 0 && c.position[1] === 0 && c.position[2] === 0)
    expect(hasCore).toBe(false)
  })

  it('sets canonical colors for solved state', () => {
    const cubies = mapStateTo3DCubies(SOLVED_STATE_STRING)

    // Find U-Center cubie at (0, 1, 0)
    const uCenter = cubies.find((c) => c.position[0] === 0 && c.position[1] === 1 && c.position[2] === 0)
    expect(uCenter).toBeDefined()
    // Face colors order: [+X, -X, +Y, -Y, +Z, -Z]
    expect(uCenter.faceColors[2]).toBe(FACES.U.color) // Up face is White
    expect(uCenter.faceColors[0]).toBe(CUBIE_INNER_COLOR) // Internal Right face
    expect(uCenter.faceColors[4]).toBe(CUBIE_INNER_COLOR) // Internal Front face

    // Find F-Center cubie at (0, 0, 1)
    const fCenter = cubies.find((c) => c.position[0] === 0 && c.position[1] === 0 && c.position[2] === 1)
    expect(fCenter.faceColors[4]).toBe(FACES.F.color) // Front face is Green
  })

  it('updates sticker colors on scrambled state', () => {
    // Single U move scramble state:
    // U face is unchanged, F top row becomes R top row (Red), R top row becomes B top row (Blue), etc.
    const uScrambleState = 'UUUUUUUUUBBBRRRRRRRRRFFFFFFDDDDDDDDDFFFFLLLLLULLLBBBBBB'
    const cubies = mapStateTo3DCubies(uScrambleState)

    // Find U-F-R corner at (1, 1, 1)
    const ufrCorner = cubies.find((c) => c.position[0] === 1 && c.position[1] === 1 && c.position[2] === 1)
    expect(ufrCorner).toBeDefined()
    // In uScrambleState:
    // Up (idx 8) is 'U'
    // Right (idx 9) is 'B' (Blue)
    // Front (idx 20) is 'R' (Red)
    expect(ufrCorner.faceColors[2]).toBe(FACES.U.color)
    expect(ufrCorner.faceColors[0]).toBe(FACES.B.color)
    expect(ufrCorner.faceColors[4]).toBe(FACES.R.color)
  })
})
