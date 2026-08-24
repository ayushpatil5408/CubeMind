import { describe, it, expect } from 'vitest'
import {
  MOVE_ANIMATION_MAP,
  SPEED_PRESETS,
  getMoveAnimation,
} from '../utils/cubeAnimationMapping'
import { ALL_VALID_MOVES } from '../utils/cubeMoveEngine'

describe('cubeAnimationMapping', () => {
  it('defines 3D animation mappings for all 18 moves', () => {
    for (const move of ALL_VALID_MOVES) {
      const mapping = MOVE_ANIMATION_MAP[move]
      expect(mapping).toBeDefined()
      expect(['x', 'y', 'z']).toContain(mapping.axis)
      expect([1, -1]).toContain(mapping.layerCoord)
      expect(typeof mapping.targetAngle).toBe('number')
      expect(Math.abs(mapping.targetAngle)).toBeGreaterThan(0)
    }
  })

  it('correctly maps Right face moves to +X axis at x=1', () => {
    const r = getMoveAnimation('R')
    expect(r.axis).toBe('x')
    expect(r.layerCoord).toBe(1)
    expect(r.targetAngle).toBeCloseTo(-Math.PI / 2)

    const rPrime = getMoveAnimation("R'")
    expect(rPrime.axis).toBe('x')
    expect(rPrime.layerCoord).toBe(1)
    expect(rPrime.targetAngle).toBeCloseTo(Math.PI / 2)

    const r2 = getMoveAnimation('R2')
    expect(r2.axis).toBe('x')
    expect(r2.layerCoord).toBe(1)
    expect(r2.targetAngle).toBeCloseTo(-Math.PI)
  })

  it('correctly maps Up face moves to +Y axis at y=1', () => {
    const u = getMoveAnimation('U')
    expect(u.axis).toBe('y')
    expect(u.layerCoord).toBe(1)
    expect(u.targetAngle).toBeCloseTo(-Math.PI / 2)

    const uPrime = getMoveAnimation("U'")
    expect(uPrime.axis).toBe('y')
    expect(uPrime.layerCoord).toBe(1)
    expect(uPrime.targetAngle).toBeCloseTo(Math.PI / 2)
  })

  it('correctly maps Front face moves to +Z axis at z=1', () => {
    const f = getMoveAnimation('F')
    expect(f.axis).toBe('z')
    expect(f.layerCoord).toBe(1)
    expect(f.targetAngle).toBeCloseTo(-Math.PI / 2)
  })

  it('provides standard speed presets', () => {
    expect(SPEED_PRESETS.length).toBe(4)
    expect(SPEED_PRESETS.map((s) => s.label)).toContain('1.0x (Normal)')
  })
})
