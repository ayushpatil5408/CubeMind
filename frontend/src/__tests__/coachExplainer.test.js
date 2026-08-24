/**
 * Unit Tests for Frontend AI Coach Explainer & Pattern Matcher (Phase 5B).
 */

import { describe, it, expect } from 'vitest'
import {
  generateCoachingSteps,
  detectPatterns,
  COACH_MODES,
  FACE_DETAILS,
} from '../coach/coachExplainer'

describe('Frontend Coach Explainer Engine (Phase 5B)', () => {
  it('generates structured coaching steps for standard moves in Beginner Mode', () => {
    const moves = ['R', "U'", 'F2']
    const steps = generateCoachingSteps(moves, COACH_MODES.BEGINNER)

    expect(steps).toHaveLength(3)

    // Step 1: R
    expect(steps[0].move).toBe('R')
    expect(steps[0].faceName).toBe('Right')
    expect(steps[0].faceColor).toBe('Red')
    expect(steps[0].direction).toBe('Clockwise (90°)')
    expect(steps[0].instruction).toContain('Turn the Right face (Red) 90 degrees clockwise')
    expect(steps[0].hint).toBe(FACE_DETAILS.R.grip)

    // Step 2: U'
    expect(steps[1].move).toBe("U'")
    expect(steps[1].faceName).toBe('Up')
    expect(steps[1].faceColor).toBe('White')
    expect(steps[1].direction).toBe('Counter-Clockwise (90°)')
    expect(steps[1].instruction).toContain('90 degrees counter-clockwise')

    // Step 3: F2
    expect(steps[2].move).toBe('F2')
    expect(steps[2].faceName).toBe('Front')
    expect(steps[2].faceColor).toBe('Green')
    expect(steps[2].direction).toBe('Double Turn (180°)')
    expect(steps[2].turnType).toBe('Half Turn (180°)')
  })

  it('generates concise instructions in Compact Mode', () => {
    const moves = ['L', "B'"]
    const steps = generateCoachingSteps(moves, COACH_MODES.COMPACT)

    expect(steps).toHaveLength(2)
    expect(steps[0].instruction).toBe('Rotate Left (L) Clockwise (90°).')
    expect(steps[0].hint).toBeNull()
  })

  it('detects Sexy Move trigger pattern across consecutive moves', () => {
    const moves = ['D', 'R', 'U', "R'", "U'", 'D2']
    const steps = generateCoachingSteps(moves)

    expect(steps[0].patternName).toBeNull()
    expect(steps[1].patternName).toBe('Sexy Move Trigger (Move 1/4)')
    expect(steps[2].patternName).toBe('Sexy Move Trigger (Move 2/4)')
    expect(steps[3].patternName).toBe('Sexy Move Trigger (Move 3/4)')
    expect(steps[4].patternName).toBe('Sexy Move Trigger (Move 4/4)')
    expect(steps[5].patternName).toBeNull()
  })

  it('handles empty or missing moves gracefully', () => {
    expect(generateCoachingSteps([])).toEqual([])
    expect(generateCoachingSteps(null)).toEqual([])
  })
})
