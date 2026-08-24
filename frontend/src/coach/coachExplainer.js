/**
 * AI Solution Coach & Explainable Steps Engine (Phase 5B).
 * Generates structured, deterministic step explanations, physical grip hints,
 * and pattern recognitions for frontend visualization.
 */

import { KNOWN_PATTERNS } from './coachPatterns'

export const COACH_MODES = {
  BEGINNER: 'BEGINNER',
  COMPACT: 'COMPACT',
}

export const FACE_DETAILS = {
  U: {
    name: 'Up',
    color: 'White',
    colorHex: '#f8fafc',
    glowClass: 'from-slate-200/20 to-white/30 border-slate-200/40 text-slate-100',
    grip: 'Hold with White on top. Use your right or left index finger to flick the top layer.',
  },
  R: {
    name: 'Right',
    color: 'Red',
    colorHex: '#ef4444',
    glowClass: 'from-red-500/20 to-red-600/30 border-red-500/40 text-red-300',
    grip: 'Grip the left side; rotate the right layer with your right hand and wrist.',
  },
  F: {
    name: 'Front',
    color: 'Green',
    colorHex: '#22c55e',
    glowClass: 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/40 text-emerald-300',
    grip: 'Turn the front face facing you clockwise or counter-clockwise using your right index.',
  },
  D: {
    name: 'Down',
    color: 'Yellow',
    colorHex: '#eab308',
    glowClass: 'from-amber-500/20 to-yellow-600/30 border-yellow-500/40 text-amber-300',
    grip: 'Keep Yellow on bottom. Use your ring or pinky finger to turn the bottom layer.',
  },
  L: {
    name: 'Left',
    color: 'Orange',
    colorHex: '#f97316',
    glowClass: 'from-orange-500/20 to-amber-600/30 border-orange-500/40 text-orange-300',
    grip: 'Grip the right side; rotate the left layer with your left hand and wrist.',
  },
  B: {
    name: 'Back',
    color: 'Blue',
    colorHex: '#3b82f6',
    glowClass: 'from-blue-500/20 to-cyan-600/30 border-blue-500/40 text-blue-300',
    grip: 'Turn the rear face using your index or middle finger reaching over from behind.',
  },
}

/**
 * Scans a move sequence for exact sub-sequence matches against KNOWN_PATTERNS.
 */
export function detectPatterns(moves = []) {
  const patternMatches = {}
  const n = moves.length

  for (const pattern of KNOWN_PATTERNS) {
    const patSeq = pattern.sequence
    const k = patSeq.length
    if (k > n) continue

    for (let startIdx = 0; startIdx <= n - k; startIdx++) {
      let isMatch = true
      for (let j = 0; j < k; j++) {
        if (moves[startIdx + j] !== patSeq[j]) {
          isMatch = false
          break
        }
      }

      if (isMatch) {
        for (let offset = 0; offset < k; offset++) {
          patternMatches[startIdx + offset] = {
            patternName: `${pattern.name} (Move ${offset + 1}/${k})`,
            patternDescription: pattern.description,
            confidence: 1.0,
          }
        }
      }
    }
  }

  return patternMatches
}

/**
 * Generates an array of structured coaching steps for a sequence of moves.
 */
export function generateCoachingSteps(moves = [], mode = COACH_MODES.BEGINNER) {
  if (!moves || moves.length === 0) return []

  const totalSteps = moves.length
  const patternMap = detectPatterns(moves)

  return moves.map((move, idx) => {
    const faceChar = move[0]?.toUpperCase() || 'U'
    const faceInfo = FACE_DETAILS[faceChar] || {
      name: faceChar,
      color: 'Standard',
      colorHex: '#ffffff',
      glowClass: 'from-slate-700 to-slate-800 text-slate-100',
      grip: 'Turn the indicated face.',
    }

    let direction = 'Clockwise (90°)'
    let turnType = 'Quarter Turn (90°)'
    let dirDesc = '90 degrees clockwise'
    let moveTitle = `${faceInfo.name} Clockwise`

    if (move.includes('2')) {
      direction = 'Double Turn (180°)'
      turnType = 'Half Turn (180°)'
      dirDesc = '180 degrees (half turn)'
      moveTitle = `${faceInfo.name} Double Turn`
    } else if (move.includes("'")) {
      direction = 'Counter-Clockwise (90°)'
      turnType = 'Quarter Turn (90°)'
      dirDesc = '90 degrees counter-clockwise (inverted)'
      moveTitle = `${faceInfo.name} Inverted`
    }

    let instruction = ''
    let explanation = ''
    let hint = null

    if (mode === COACH_MODES.COMPACT) {
      instruction = `Rotate ${faceInfo.name} (${faceChar}) ${direction}.`
      explanation = `Repositions ${faceInfo.name.toLowerCase()} facelet orbits.`
    } else {
      instruction = `Turn the ${faceInfo.name} face (${faceInfo.color}) ${dirDesc}.`
      explanation = `This move repositions pieces on the ${faceInfo.name.toLowerCase()} layer towards their target solved positions without disturbing center alignment.`
      hint = faceInfo.grip
    }

    const patternInfo = patternMap[idx] || null

    return {
      stepNumber: idx + 1,
      totalSteps,
      move,
      moveName: moveTitle,
      faceChar,
      faceName: faceInfo.name,
      faceColor: faceInfo.color,
      faceColorHex: faceInfo.colorHex,
      glowClass: faceInfo.glowClass,
      direction,
      turnType,
      instruction,
      explanation,
      hint,
      patternName: patternInfo?.patternName || null,
      patternDescription: patternInfo?.patternDescription || null,
      patternConfidence: patternInfo?.confidence || null,
      playbackIndex: idx,
    }
  })
}
