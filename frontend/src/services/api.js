/**
 * CubeMind API Service Client (Phase 3A)
 * Handles communication with backend solving, validation, and scramble services.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Generic request helper with timeout and structured error parsing.
 */
async function request(endpoint, options = {}, timeoutMs = 25000) {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      let errorMessage = 'An unexpected server error occurred.'
      if (typeof data.detail === 'string') {
        errorMessage = data.detail
      } else if (data.detail && typeof data.detail.error_message === 'string') {
        errorMessage = data.detail.error_message
      } else if (data.message) {
        errorMessage = data.message
      }

      throw new ApiError(errorMessage, response.status, data.detail || data)
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. The solving engine took too long to respond.', 408)
    }
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure the FastAPI server is running.`,
      0,
      { originalError: error.message }
    )
  } finally {
    clearTimeout(id)
  }
}

export const cubeApi = {
  /**
   * Health check and metadata endpoint.
   */
  async getHealth() {
    return request('/')
  },

  /**
   * Generates a random WCA-compliant scramble sequence.
   */
  async getScramble(length = 20) {
    return request(`/scramble?length=${encodeURIComponent(length)}`)
  },

  /**
   * Validates a 54-facelet state string.
   */
  async validateState(stateString) {
    return request('/validate', {
      method: 'POST',
      body: JSON.stringify({ state_string: stateString }),
    })
  },

  /**
   * Solves a Rubik's Cube state.
   */
  async solveCube({ stateString, solver = 'kociemba', verify = true, maxDepth = 24, timeoutSec = 20.0 }) {
    return request('/solve', {
      method: 'POST',
      body: JSON.stringify({
        state_string: stateString,
        solver,
        verify,
        max_depth: maxDepth,
        timeout_sec: timeoutSec,
      }),
    })
  },
}

export { ApiError, API_BASE_URL }
