/**
 * Explicit, conservative pattern library for micro-algorithms and triggers (Phase 5B).
 */

export const KNOWN_PATTERNS = [
  {
    name: 'Sexy Move Trigger',
    sequence: ['R', 'U', "R'", "U'"],
    description: 'A foundational 4-move trigger cycling top-right corner and edge pieces.',
  },
  {
    name: 'Inverse Sexy Move',
    sequence: ['U', 'R', "U'", "R'"],
    description: 'An inverse 4-move trigger used in F2L piece pairing.',
  },
  {
    name: 'Left Sexy Move',
    sequence: ["L'", "U'", 'L', 'U'],
    description: 'Mirrored left-handed 4-move trigger cycling top-left pieces.',
  },
  {
    name: 'Sune Orientation Sequence',
    sequence: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    description: 'Standard corner orientation sequence preserving bottom layers.',
  },
  {
    name: 'Anti-Sune Sequence',
    sequence: ['R', 'U2', "R'", "U'", 'R', "U'", "R'"],
    description: 'Inverse corner orientation sequence preserving bottom layers.',
  },
  {
    name: 'T-Perm Sequence',
    sequence: ['R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'"],
    description: 'Corner-edge swap permutation algorithm.',
  },
]
