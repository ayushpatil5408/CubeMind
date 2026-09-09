import React, { useEffect } from 'react'
import {
  Undo2,
  Redo2,
  RotateCcw,
  Paintbrush,
  Lock,
  Upload,
  Sparkles,
} from 'lucide-react'
import { FACES, FACE_ORDER } from '../../types/cube'
import { countFaceletColors } from '../../utils/cubeUtils'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function ColorPalette({ onOpenImportModal }) {
  const {
    stateString,
    selectedColor,
    setSelectedColor,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToSolved,
  } = useCubeSolver()

  const counts = countFaceletColors(stateString)

  // Keyboard shortcut listener: numbers 1-6 or letters U, R, F, D, L, B
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture when typing in text input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      const key = e.key.toUpperCase()
      const keyMap = {
        '1': 'U', U: 'U',
        '2': 'R', R: 'R',
        '3': 'F', F: 'F',
        '4': 'D', D: 'D',
        '5': 'L', L: 'L',
        '6': 'B', B: 'B',
      }

      if (keyMap[key]) {
        setSelectedColor(keyMap[key])
      } else if ((e.ctrlKey || e.metaKey) && key === 'Z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && key === 'Y') {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setSelectedColor, undo, redo])

  return (
    <div className="p-4 rounded-2xl bg-[#0C1322]/80 border border-white/[0.08] shadow-xl space-y-4">
      {/* Header with Mode Toggle & History Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Paintbrush className="w-3.5 h-3.5 text-cyan-400" />
            Color Palette & Tools
          </span>
        </div>

        {/* Action Buttons: Undo, Redo, Reset, Import */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo Last Sticker Edit (Ctrl+Z)"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              canUndo
                ? 'bg-[#111C33] border-white/10 text-slate-200 hover:bg-[#162444] hover:text-white'
                : 'bg-[#06090F]/50 border-white/[0.04] text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo Last Undone Edit (Ctrl+Y)"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              canRedo
                ? 'bg-[#111C33] border-white/10 text-slate-200 hover:bg-[#162444] hover:text-white'
                : 'bg-[#06090F]/50 border-white/[0.04] text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          <button
            type="button"
            onClick={resetToSolved}
            title="Reset to Solved State"
            className="p-1.5 rounded-lg bg-[#111C33] border border-white/10 text-xs text-slate-300 hover:bg-[#162444] hover:text-white transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {onOpenImportModal && (
            <button
              type="button"
              onClick={onOpenImportModal}
              title="Import 54-Char State String"
              className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-900/40 hover:text-white transition-all flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Color Swatches */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {FACE_ORDER.map((faceKey, index) => {
          const face = FACES[faceKey]
          const isSelected = selectedColor === faceKey
          const count = counts[faceKey] || 0
          const isFull = count === 9
          const isOver = count > 9

          return (
            <button
              key={faceKey}
              type="button"
              onClick={() => setSelectedColor(faceKey)}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all duration-150 text-left ${
                isSelected
                  ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/30 scale-[1.03] shadow-lg shadow-cyan-950/30'
                  : 'bg-[#06090F]/70 border-white/[0.08] hover:border-white/20 hover:bg-[#0C1322]'
              }`}
            >
              {/* Color Swatch Circle */}
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className="w-5 h-5 rounded-full shadow-md border border-black/30 flex items-center justify-center font-mono font-black text-[10px]"
                  style={{
                    backgroundColor: face.color,
                    color: face.textColor,
                  }}
                >
                  {faceKey}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  [{index + 1}]
                </span>
              </div>

              {/* Label & Count */}
              <div className="w-full">
                <div className="text-[11px] font-semibold text-slate-200 truncate">
                  {face.name}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">{face.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isFull
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                        : isOver
                        ? 'bg-red-950/80 text-red-300 border border-red-800/40'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    {count}/9
                  </span>
                </div>
              </div>

              {/* Active Selection Pin */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-[#06090F] shadow-[0_0_6px_#06b6d4]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Editing Hint & Western Scheme Fixed Centers Reminder */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/[0.06]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Click any sticker to apply <strong className="text-slate-200">{FACES[selectedColor]?.name} ({selectedColor})</strong>
        </span>
        <span className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
          <Lock className="w-3 h-3 text-amber-500/70" />
          Center stickers are fixed reference axes
        </span>
      </div>
    </div>
  )
}
