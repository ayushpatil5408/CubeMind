import React, { useState } from 'react'
import { Lock, Sparkles, HelpCircle } from 'lucide-react'
import {
  parseFacelets,
  getFaceletColor,
  getFaceletTextColor,
  isCenterIndex,
  getStickerPositionName,
} from '../../utils/cubeUtils'
import { FACE_INDEX_RANGES, FACES } from '../../types/cube'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function CubeNetEditor() {
  const {
    stateString,
    setStickerColor,
    selectedColor,
    selectedStickerIndex,
    setSelectedStickerIndex,
    hoveredStickerIndex,
    setHoveredStickerIndex,
  } = useCubeSolver()

  const [showIndexLabels, setShowIndexLabels] = useState(false)

  const faces = parseFacelets(stateString)

  // Handle sticker click
  const handleStickerClick = (absIndex) => {
    setSelectedStickerIndex(absIndex)
    if (isCenterIndex(absIndex)) {
      // Center stickers are locked reference axes
      return
    }
    setStickerColor(absIndex, selectedColor)
  }

  // Render a 3x3 face grid
  const renderFace = (faceKey) => {
    const range = FACE_INDEX_RANGES[faceKey]
    const faceData = faces[faceKey] || []
    const faceMeta = FACES[faceKey]

    return (
      <div className="flex flex-col items-center">
        {/* Face Header Label */}
        <div className="liquid-clay-pill flex items-center gap-1.5 mb-2 px-3 py-0.5 bg-[#060914]/90 border border-white/15 shadow-sm">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: faceMeta.color }}
          />
          <span className="text-xs font-bold font-mono text-slate-200">
            {faceKey}
          </span>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
            ({faceMeta.name})
          </span>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 p-2 rounded-2xl bg-[#060914]/90 border border-white/10 shadow-inner">
          {faceData.map((row, r) =>
            row.map((cellChar, c) => {
              const absIndex = range.start + r * 3 + c
              const isCenter = isCenterIndex(absIndex)
              const isSelected = selectedStickerIndex === absIndex
              const isHovered = hoveredStickerIndex === absIndex

              const cellBg = getFaceletColor(cellChar)
              const cellText = getFaceletTextColor(cellChar)

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleStickerClick(absIndex)}
                  onMouseEnter={() => setHoveredStickerIndex(absIndex)}
                  onMouseLeave={() => setHoveredStickerIndex(null)}
                  title={getStickerPositionName(absIndex)}
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl flex flex-col items-center justify-center font-mono font-black text-xs transition-all duration-150 select-none liquid-color-gem ${
                    isCenter
                      ? 'cursor-not-allowed opacity-95 ring-1 ring-amber-400/40'
                      : 'cursor-pointer hover:scale-105 active:scale-95'
                  } ${
                    isSelected
                      ? 'active-gem z-10 scale-105'
                      : ''
                  }`}
                  style={{
                    backgroundColor: cellBg,
                    color: cellText,
                  }}
                >
                  {/* Lock icon for fixed center stickers */}
                  {isCenter ? (
                    <div className="flex flex-col items-center justify-center">
                      <Lock className="w-3 h-3 drop-shadow text-black/70" />
                      <span className="text-[8px] font-mono opacity-80 mt-[-2px]">
                        {faceKey}
                      </span>
                    </div>
                  ) : showIndexLabels ? (
                    <span className="text-[9px] opacity-80">{absIndex}</span>
                  ) : (
                    <span className="text-xs drop-shadow-sm opacity-90">{cellChar}</span>
                  )}

                  {/* Hover indicator */}
                  {isHovered && !isCenter && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 border border-white/40 pointer-events-none" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  const activeHoverStickerName = hoveredStickerIndex !== null ? getStickerPositionName(hoveredStickerIndex) : null

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-3">
      {/* Top Bar with Options */}
      <div className="w-full flex items-center justify-between mb-4 pb-2.5 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            2D Interactive Cube Net Editor
          </span>
        </div>

        {/* Index Labels Toggle */}
        <button
          type="button"
          onClick={() => setShowIndexLabels(!showIndexLabels)}
          className={`liquid-clay-btn-secondary px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
            showIndexLabels
              ? '!border-cyan-400/50 !text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {showIndexLabels ? 'Show Face Colors' : 'Show Indices (0-53)'}
        </button>
      </div>

      {/* Unfolded 2D Cube Net Structure */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 max-w-full overflow-x-auto p-2 scrollbar-none">
        {/* Row 1: Top (Up) Face */}
        <div className="flex justify-center">
          {renderFace('U')}
        </div>

        {/* Row 2: Left, Front, Right, Back Faces */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {renderFace('L')}
          {renderFace('F')}
          {renderFace('R')}
          {renderFace('B')}
        </div>

        {/* Row 3: Bottom (Down) Face */}
        <div className="flex justify-center">
          {renderFace('D')}
        </div>
      </div>

      {/* Footer Info / Hover Details */}
      <div className="w-full mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 min-h-[20px]">
          {activeHoverStickerName ? (
            <span className="text-cyan-300 font-mono font-medium">
              Target: {activeHoverStickerName}
            </span>
          ) : (
            <span className="text-slate-500">
              Hover over any sticker for position and index info
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Canonical Face Order: U → L / F / R / B → D
        </span>
      </div>
    </div>
  )
}
