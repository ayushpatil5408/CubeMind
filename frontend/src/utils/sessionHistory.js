/**
 * Local Session History Storage Manager (Phase 5C).
 * Safe, privacy-first local storage for recent solve solutions and practice sessions.
 * Resilient against corrupted data, quota exceptions, and storage unavailability.
 */

const SOLVE_HISTORY_KEY = 'cubemind_solve_history'
const PRACTICE_HISTORY_KEY = 'cubemind_practice_history'
const MAX_HISTORY_ITEMS = 50

/**
 * Safely parses JSON array from localStorage with corrupted data recovery.
 */
function safeGetArray(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // If corrupted, clean up and return empty array
    try {
      localStorage.removeItem(key)
    } catch {}
    return []
  }
}

/**
 * Safely writes an array to localStorage.
 */
function safeSetArray(key, array) {
  try {
    const truncated = array.slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(key, JSON.stringify(truncated))
    return true
  } catch {
    return false
  }
}

/**
 * Retrieves list of recent solve records.
 */
export function getSolveHistory() {
  return safeGetArray(SOLVE_HISTORY_KEY)
}

/**
 * Appends a new solve record to local history.
 */
export function addSolveRecord(record) {
  if (!record || typeof record !== 'object') return false

  const existing = getSolveHistory()
  const newRecord = {
    id: `solve-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    solverName: record.solverName || 'Kociemba Two-Phase',
    moveCount: record.moveCount ?? (record.moves ? record.moves.length : 0),
    originalMoveCount: record.originalMoveCount ?? record.moveCount ?? 0,
    isOptimized: !!record.isOptimized,
    solveTimeMs: record.solveTimeMs ?? 0,
    isVerified: record.isVerified ?? true,
    statePreview: record.statePreview || null,
  }

  return safeSetArray(SOLVE_HISTORY_KEY, [newRecord, ...existing])
}

/**
 * Clears all solve history records.
 */
export function clearSolveHistory() {
  try {
    localStorage.removeItem(SOLVE_HISTORY_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * Retrieves list of recent practice session records.
 */
export function getPracticeHistory() {
  return safeGetArray(PRACTICE_HISTORY_KEY)
}

/**
 * Appends a new practice session record.
 */
export function addPracticeRecord(record) {
  if (!record || typeof record !== 'object') return false

  const existing = getPracticeHistory()
  const newRecord = {
    id: `practice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    totalMoves: record.totalMoves || 0,
    completedMoves: record.completedMoves || 0,
    durationMs: record.durationMs || 0,
    avgTimePerMoveSec:
      record.completedMoves > 0
        ? Number(((record.durationMs / 1000) / record.completedMoves).toFixed(1))
        : 0,
    status: record.status || 'COMPLETED',
  }

  return safeSetArray(PRACTICE_HISTORY_KEY, [newRecord, ...existing])
}

/**
 * Clears all practice history records.
 */
export function clearPracticeHistory() {
  try {
    localStorage.removeItem(PRACTICE_HISTORY_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * Clears all session histories.
 */
export function clearAllHistory() {
  clearSolveHistory()
  clearPracticeHistory()
}
