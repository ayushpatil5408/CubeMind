import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { CubeProvider, CubeContext } from '../context/CubeContext'
import { SOLVED_STATE_STRING, CENTER_INDICES } from '../types/cube'
import { mapStateTo3DCubies } from '../utils/cube3DMapping'
import { validateBasicFormat, isCenterIndex, getCenterFace } from '../utils/cubeUtils'

function TestManualEditor() {
  const {
    stateString,
    selectedColor,
    setSelectedColor,
    selectedStickerIndex,
    setSelectedStickerIndex,
    setStickerColor,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToSolved,
    validationResult,
    setEntireState,
    error,
  } = React.useContext(CubeContext)

  return (
    <div>
      <div data-testid="state-str">{stateString}</div>
      <div data-testid="selected-color">{selectedColor}</div>
      <div data-testid="selected-idx">{selectedStickerIndex ?? 'none'}</div>
      <div data-testid="can-undo">{canUndo ? 'true' : 'false'}</div>
      <div data-testid="can-redo">{canRedo ? 'true' : 'false'}</div>
      <div data-testid="error-msg">{error || ''}</div>
      <div data-testid="is-valid">{validationResult?.is_valid ? 'true' : 'false'}</div>

      {/* Buttons */}
      <button data-testid="select-red-btn" onClick={() => setSelectedColor('R')}>
        Select Red
      </button>
      <button data-testid="select-sticker-0-btn" onClick={() => setSelectedStickerIndex(0)}>
        Select Sticker 0
      </button>
      <button data-testid="paint-sticker-0-btn" onClick={() => setStickerColor(0, 'R')}>
        Paint Sticker 0 Red
      </button>
      <button data-testid="paint-center-4-btn" onClick={() => setStickerColor(4, 'R')}>
        Paint Center 4 Red
      </button>
      <button data-testid="undo-btn" onClick={undo}>
        Undo
      </button>
      <button data-testid="redo-btn" onClick={redo}>
        Redo
      </button>
      <button data-testid="reset-btn" onClick={resetToSolved}>
        Reset
      </button>
    </div>
  )
}

describe('Manual Cube Input & State Editing (Phase 3C)', () => {
  it('allows selecting active color and target sticker', () => {
    render(
      <CubeProvider>
        <TestManualEditor />
      </CubeProvider>
    )

    expect(screen.getByTestId('selected-color').textContent).toBe('U')
    expect(screen.getByTestId('selected-idx').textContent).toBe('none')

    act(() => {
      screen.getByTestId('select-red-btn').click()
      screen.getByTestId('select-sticker-0-btn').click()
    })

    expect(screen.getByTestId('selected-color').textContent).toBe('R')
    expect(screen.getByTestId('selected-idx').textContent).toBe('0')
  })

  it('updates canonical stateString and pushes to undo history when painting a sticker', () => {
    render(
      <CubeProvider>
        <TestManualEditor />
      </CubeProvider>
    )

    expect(screen.getByTestId('can-undo').textContent).toBe('false')

    act(() => {
      screen.getByTestId('paint-sticker-0-btn').click()
    })

    const updatedState = screen.getByTestId('state-str').textContent
    expect(updatedState[0]).toBe('R')
    expect(screen.getByTestId('can-undo').textContent).toBe('true')
  })

  it('protects center stickers from invalid modifications and sets an error message', () => {
    render(
      <CubeProvider>
        <TestManualEditor />
      </CubeProvider>
    )

    // Center sticker index 4 is Up face (must be 'U')
    expect(screen.getByTestId('state-str').textContent[4]).toBe('U')

    act(() => {
      screen.getByTestId('paint-center-4-btn').click()
    })

    // Center should remain 'U'
    expect(screen.getByTestId('state-str').textContent[4]).toBe('U')
    expect(screen.getByTestId('error-msg').textContent).toContain('Center stickers are fixed')
  })

  it('supports undo and redo of sticker edits', () => {
    render(
      <CubeProvider>
        <TestManualEditor />
      </CubeProvider>
    )

    // Initially solved
    expect(screen.getByTestId('state-str').textContent).toBe(SOLVED_STATE_STRING)

    // Edit sticker 0
    act(() => {
      screen.getByTestId('paint-sticker-0-btn').click()
    })
    expect(screen.getByTestId('state-str').textContent[0]).toBe('R')
    expect(screen.getByTestId('can-undo').textContent).toBe('true')
    expect(screen.getByTestId('can-redo').textContent).toBe('false')

    // Undo edit
    act(() => {
      screen.getByTestId('undo-btn').click()
    })
    expect(screen.getByTestId('state-str').textContent[0]).toBe('U')
    expect(screen.getByTestId('can-undo').textContent).toBe('false')
    expect(screen.getByTestId('can-redo').textContent).toBe('true')

    // Redo edit
    act(() => {
      screen.getByTestId('redo-btn').click()
    })
    expect(screen.getByTestId('state-str').textContent[0]).toBe('R')
    expect(screen.getByTestId('can-undo').textContent).toBe('true')
    expect(screen.getByTestId('can-redo').textContent).toBe('false')
  })

  it('resets modified state back to solved state', () => {
    render(
      <CubeProvider>
        <TestManualEditor />
      </CubeProvider>
    )

    act(() => {
      screen.getByTestId('paint-sticker-0-btn').click()
    })
    expect(screen.getByTestId('state-str').textContent).not.toBe(SOLVED_STATE_STRING)

    act(() => {
      screen.getByTestId('reset-btn').click()
    })
    expect(screen.getByTestId('state-str').textContent).toBe(SOLVED_STATE_STRING)
  })

  it('synchronizes 2D sticker edits into 3D cubie materials', () => {
    const solvedCubies = mapStateTo3DCubies(SOLVED_STATE_STRING)
    expect(solvedCubies.length).toBe(26)

    // In solved state, top-left-front cubie (-1, 1, 1) has UP=U (White #f8fafc) and FRONT=F (Green #22c55e)
    const tlfCubie = solvedCubies.find((c) => c.position[0] === -1 && c.position[1] === 1 && c.position[2] === 1)
    expect(tlfCubie).toBeDefined()
    // UP facelet index 6
    expect(tlfCubie.faceIndices.UP).toBe(6)
    expect(tlfCubie.faceColors[2]).toBe('#f8fafc') // White

    // Edit sticker index 6 to 'R' (Red)
    const modifiedState = SOLVED_STATE_STRING.substring(0, 6) + 'R' + SOLVED_STATE_STRING.substring(7)
    const modifiedCubies = mapStateTo3DCubies(modifiedState)
    const modifiedTlfCubie = modifiedCubies.find((c) => c.position[0] === -1 && c.position[1] === 1 && c.position[2] === 1)
    expect(modifiedTlfCubie.faceColors[2]).toBe('#ef4444') // Red
  })

  it('verifies center index definitions according to cube contract', () => {
    expect(CENTER_INDICES).toEqual([4, 13, 22, 31, 40, 49])
    expect(isCenterIndex(4)).toBe(true)
    expect(isCenterIndex(13)).toBe(true)
    expect(isCenterIndex(22)).toBe(true)
    expect(isCenterIndex(31)).toBe(true)
    expect(isCenterIndex(40)).toBe(true)
    expect(isCenterIndex(49)).toBe(true)
    expect(isCenterIndex(0)).toBe(false)
    expect(isCenterIndex(53)).toBe(false)

    expect(getCenterFace(4)).toBe('U')
    expect(getCenterFace(13)).toBe('R')
    expect(getCenterFace(22)).toBe('F')
    expect(getCenterFace(31)).toBe('D')
    expect(getCenterFace(40)).toBe('L')
    expect(getCenterFace(49)).toBe('B')
  })
})
