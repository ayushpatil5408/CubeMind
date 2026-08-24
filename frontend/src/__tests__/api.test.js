import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cubeApi, ApiError } from '../services/api'
import { SOLVED_STATE_STRING } from '../types/cube'

describe('cubeApi service', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('getHealth sends GET / and returns json', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', app: 'CubeMind' }),
    })

    const res = await cubeApi.getHealth()
    expect(res.status).toBe('ok')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/'),
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
    )
  })

  it('getScramble sends GET /scramble with query params', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ scramble: "R U R' U'", state_string: SOLVED_STATE_STRING }),
    })

    const res = await cubeApi.getScramble(20)
    expect(res.scramble).toBe("R U R' U'")
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/scramble?length=20'),
      expect.any(Object)
    )
  })

  it('solveCube sends POST /solve with payload', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        moves: ['U', 'R'],
        move_count: 2,
        solve_time_ms: 1.5,
      }),
    })

    const res = await cubeApi.solveCube({
      stateString: SOLVED_STATE_STRING,
      solver: 'kociemba',
      verify: true,
    })

    expect(res.success).toBe(true)
    expect(res.moves).toEqual(['U', 'R'])
  })

  it('throws ApiError with detail message on 400 error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Invalid state string format' }),
    })

    await expect(
      cubeApi.solveCube({ stateString: 'BAD' })
    ).rejects.toThrow('Invalid state string format')
  })

  it('throws structured ApiError on 422 unsolvable state error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: {
          status: 'UNSOLVABLE_STATE',
          error_message: 'Twisted corner detected',
        },
      }),
    })

    try {
      await cubeApi.solveCube({ stateString: SOLVED_STATE_STRING })
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(422)
      expect(err.message).toBe('Twisted corner detected')
    }
  })
})
