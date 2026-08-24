import { describe, it, expect } from 'vitest'
import {
  getFaceletColor,
  getFaceletTextColor,
  countFaceletColors,
  validateBasicFormat,
  parseFacelets,
} from '../utils/cubeUtils'
import { SOLVED_STATE_STRING } from '../types/cube'

describe('cubeUtils', () => {
  it('returns canonical facelet colors', () => {
    expect(getFaceletColor('U')).toBe('#f8fafc')
    expect(getFaceletColor('R')).toBe('#ef4444')
    expect(getFaceletColor('F')).toBe('#22c55e')
    expect(getFaceletColor('D')).toBe('#eab308')
    expect(getFaceletColor('L')).toBe('#f97316')
    expect(getFaceletColor('B')).toBe('#3b82f6')
    expect(getFaceletColor('X')).toBe('#475569') // fallback
  })

  it('correctly counts 9 facelets per face on solved state', () => {
    const counts = countFaceletColors(SOLVED_STATE_STRING)
    expect(counts.U).toBe(9)
    expect(counts.R).toBe(9)
    expect(counts.F).toBe(9)
    expect(counts.D).toBe(9)
    expect(counts.L).toBe(9)
    expect(counts.B).toBe(9)
  })

  it('validates basic format for solved cube', () => {
    const res = validateBasicFormat(SOLVED_STATE_STRING)
    expect(res.isValid).toBe(true)
  })

  it('rejects invalid length state strings', () => {
    const res = validateBasicFormat('UUUU')
    expect(res.isValid).toBe(false)
    expect(res.message).toContain('Invalid length')
  })

  it('rejects invalid color distribution', () => {
    // Modify non-center sticker 0 to 'R' (U=8, R=10), centers remain valid
    const badState = 'R' + SOLVED_STATE_STRING.substring(1)
    const res = validateBasicFormat(badState)
    expect(res.isValid).toBe(false)
    expect(res.message).toContain('Invalid color distribution')
  })

  it('parses facelets into 6 grids of 3x3', () => {
    const faces = parseFacelets(SOLVED_STATE_STRING)
    expect(faces.U.length).toBe(3)
    expect(faces.U[0].length).toBe(3)
    expect(faces.U[0][0]).toBe('U')
    expect(faces.R[0][0]).toBe('R')
    expect(faces.F[0][0]).toBe('F')
    expect(faces.D[0][0]).toBe('D')
    expect(faces.L[0][0]).toBe('L')
    expect(faces.B[0][0]).toBe('B')
  })
})
