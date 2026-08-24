import { describe, it, expect } from 'vitest'
import {
  ALL_VALID_MOVES,
  isValidMove,
  parseAlgorithm,
  invertMove,
  invertAlgorithm,
  applyMoveToState,
  applyAlgorithmToState,
  computeStateTimeline,
} from '../utils/cubeMoveEngine'
import { SOLVED_STATE_STRING } from '../types/cube'

describe('cubeMoveEngine', () => {
  it('contains all 18 canonical Rubik cube moves', () => {
    expect(ALL_VALID_MOVES.length).toBe(18)
    expect(isValidMove('R')).toBe(true)
    expect(isValidMove("U'")).toBe(true)
    expect(isValidMove('F2')).toBe(true)
    expect(isValidMove('M')).toBe(false)
    expect(isValidMove('xyz')).toBe(false)
  })

  it('parses algorithm strings correctly', () => {
    expect(parseAlgorithm("R U R' U'")).toEqual(['R', 'U', "R'", "U'"])
    expect(parseAlgorithm(['F', 'R', 'U'])).toEqual(['F', 'R', 'U'])
    expect(() => parseAlgorithm('R U INVALID')).toThrow(/Invalid move notation/)
  })

  it('correctly inverts single moves', () => {
    expect(invertMove('R')).toBe("R'")
    expect(invertMove("R'")).toBe('R')
    expect(invertMove('R2')).toBe('R2')
    expect(invertMove('U')).toBe("U'")
    expect(invertMove("U'")).toBe('U')
    expect(invertMove('U2')).toBe('U2')
    expect(invertMove('F')).toBe("F'")
    expect(invertMove("F'")).toBe('F')
    expect(invertMove('F2')).toBe('F2')
    expect(invertMove('D')).toBe("D'")
    expect(invertMove("D'")).toBe('D')
    expect(invertMove('D2')).toBe('D2')
    expect(invertMove('L')).toBe("L'")
    expect(invertMove("L'")).toBe('L')
    expect(invertMove('L2')).toBe('L2')
    expect(invertMove('B')).toBe("B'")
    expect(invertMove("B'")).toBe('B')
    expect(invertMove('B2')).toBe('B2')
  })

  it('correctly inverts full move algorithms', () => {
    expect(invertAlgorithm("R U R' U'")).toEqual(['U', 'R', "U'", "R'"])
    expect(invertAlgorithm('U2 F R')).toEqual(["R'", "F'", 'U2'])
  })

  it('satisfies mathematical invariant X * X_prime = Identity for all 6 faces', () => {
    const bases = ['U', 'D', 'L', 'R', 'F', 'B']
    for (const base of bases) {
      const stateAfterMove = applyMoveToState(SOLVED_STATE_STRING, base)
      expect(stateAfterMove).not.toBe(SOLVED_STATE_STRING)

      const stateAfterInverse = applyMoveToState(stateAfterMove, `${base}'`)
      expect(stateAfterInverse).toBe(SOLVED_STATE_STRING)
    }
  })

  it('satisfies mathematical invariant X^4 = Identity for all 6 faces', () => {
    const bases = ['U', 'D', 'L', 'R', 'F', 'B']
    for (const base of bases) {
      let state = SOLVED_STATE_STRING
      for (let i = 0; i < 4; i++) {
        state = applyMoveToState(state, base)
      }
      expect(state).toBe(SOLVED_STATE_STRING)
    }
  })

  it('satisfies mathematical invariant X2 * X2 = Identity for all 6 faces', () => {
    const bases = ['U', 'D', 'L', 'R', 'F', 'B']
    for (const base of bases) {
      let state = SOLVED_STATE_STRING
      state = applyMoveToState(state, `${base}2`)
      expect(state).not.toBe(SOLVED_STATE_STRING)
      state = applyMoveToState(state, `${base}2`)
      expect(state).toBe(SOLVED_STATE_STRING)
    }
  })

  it('applies Sexy Move 6 times and returns to solved state (order 6 cyclic group)', () => {
    const sexyMove = "R U R' U'"
    let state = SOLVED_STATE_STRING
    for (let i = 0; i < 6; i++) {
      state = applyAlgorithmToState(state, sexyMove)
    }
    expect(state).toBe(SOLVED_STATE_STRING)
  })

  it('computes exact state timeline for a solution sequence', () => {
    const moves = ['R', 'U', "R'", "U'"]
    const timeline = computeStateTimeline(SOLVED_STATE_STRING, moves)

    expect(timeline.length).toBe(5) // S0 + 4 moves
    expect(timeline[0]).toBe(SOLVED_STATE_STRING)
    expect(timeline[1]).toBe(applyMoveToState(SOLVED_STATE_STRING, 'R'))
    expect(timeline[2]).toBe(applyAlgorithmToState(SOLVED_STATE_STRING, 'R U'))
    expect(timeline[3]).toBe(applyAlgorithmToState(SOLVED_STATE_STRING, "R U R'"))
    expect(timeline[4]).toBe(applyAlgorithmToState(SOLVED_STATE_STRING, "R U R' U'"))
  })
})
