/**
 * CubeMind Six-Face Reconstruction Review & Manual Correction (Phase 4C)
 * Displays the full 2D unfolded cube net with color classifications, ambiguous sticker flags,
 * color count counters, per-face rescan triggers, and direct solver commit action.
 */

import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Palette,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import { Button } from '../common/Button'
import { FACES, FACE_ORDER, CENTER_INDICES } from '../../types/cube'
import { SCAN_FACE_ORDER, SCAN_FACE_METADATA } from '../../types/scan'
import { getFaceletColor, getFaceletTextColor, isCenterIndex } from '../../utils/cubeUtils'

export function ScanReconstructionReview({
  stateString,
  colorCounts,
  reconstruction,
  detectedFaces,
  onOverrideSticker,
  onRescanFace,
  onResetSession,
  onCommitToSolver,
}) {
  const [selectedStickerIdx, setSelectedStickerIdx] = useState(null)
  const [selectedPaletteColor, setSelectedPaletteColor] = useState('U')

  if (!stateString || stateString.length !== 54) {
    return null
  }

  const { averageConfidence = 0.9, ambiguousIndices = [] } = reconstruction || {}

  // Check 9/9 counts
  const allCountsExact = Object.values(colorCounts).every((c) => c === 9)

  const handleStickerClick = (idx) => {
    if (isCenterIndex(idx)) return // Center is locked
    setSelectedStickerIdx(idx)
    // Apply selected palette color directly
    if (selectedPaletteColor) {
      onOverrideSticker(idx, selectedPaletteColor)
    }
  }

  // Render a 3x3 face net grid
  const renderFaceGrid = (faceKey, startIndex) => {
    const meta = SCAN_FACE_METADATA[faceKey]
    const faceResult = detectedFaces[faceKey]
    const faceConf = faceResult?.confidence?.overallConfidence
      ? Math.round(faceResult.confidence.overallConfidence * 100)
      : null

    return (
      <div className="flex flex-col items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between w-full mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-slate-200 font-mono flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/40"
              style={{ backgroundColor: meta?.color || '#fff' }}
            />
            {faceKey} ({meta?.name?.split(' ')[0]})
          </span>
          {faceConf && (
            <span className="text-[9px] font-mono text-cyan-400 font-semibold">
              {faceConf}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-24 h-24 bg-slate-900 p-1 rounded-lg border border-slate-700">
          {Array.from({ length: 9 }).map((_, relIdx) => {
            const absIdx = startIndex + relIdx
            const char = stateString[absIdx]
            const isCenter = relIdx === 4
            const isSelected = selectedStickerIdx === absIdx
            const isAmbiguous = ambiguousIndices.includes(absIdx)

            return (
              <button
                key={absIdx}
                onClick={() => handleStickerClick(absIdx)}
                disabled={isCenter}
                title={`Sticker #${absIdx} (${char})${isCenter ? ' [Locked Center]' : ''}${
                  isAmbiguous ? ' [Ambiguous Color]' : ''
                }`}
                className={`relative rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-150 ${
                  isCenter ? 'cursor-not-allowed opacity-90' : 'hover:scale-95 cursor-pointer'
                } ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 scale-105 z-10'
                    : ''
                } ${isAmbiguous ? 'border-2 border-amber-400' : 'border border-black/30'}`}
                style={{
                  backgroundColor: getFaceletColor(char),
                  color: getFaceletTextColor(char),
                }}
              >
                {isCenter ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-black/60 shadow" />
                ) : (
                  <span className="text-[8px] opacity-70">{char}</span>
                )}
                {isAmbiguous && !isCenter && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black" />
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onRescanFace(faceKey)}
          title={`Rescan ${faceKey} face`}
          className="mt-1.5 text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <Camera className="w-3 h-3" />
          <span>Rescan</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-100 p-4 sm:p-5 overflow-y-auto space-y-4">
      {/* Header & Overall Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-md">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Reconstructed Cube State
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 4C
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Review and correct the 54-facelet scanned state before solving
            </p>
          </div>
        </div>

        {/* Global Confidence Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              allCountsExact && averageConfidence >= 0.75
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {allCountsExact && averageConfidence >= 0.75 ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            Scan Confidence: {Math.round(averageConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* Color Count Distribution & Quick Palette */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Palette className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Select color tool to paint stickers:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {FACE_ORDER.map((f) => {
            const count = colorCounts[f] || 0
            const isExact = count === 9
            const isSelected = selectedPaletteColor === f

            return (
              <button
                key={f}
                onClick={() => setSelectedPaletteColor(f)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105'
                    : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: getFaceletColor(f),
                  color: getFaceletTextColor(f),
                }}
              >
                <span>{f}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    isExact
                      ? 'bg-black/30 text-white'
                      : 'bg-red-950 text-red-200 border border-red-500/40'
                  }`}
                >
                  {count}/9
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2D Unfolded Cross Layout Preview */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 shadow-inner">
        {/* Top: Up Face */}
        <div className="mb-2">{renderFaceGrid('U', 0)}</div>

        {/* Middle Row: Left, Front, Right, Back */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {renderFaceGrid('L', 36)}
          {renderFaceGrid('F', 18)}
          {renderFaceGrid('R', 9)}
          {renderFaceGrid('B', 45)}
        </div>

        {/* Bottom: Down Face */}
        <div>{renderFaceGrid('D', 27)}</div>
      </div>

      {/* Ambiguity / Review Notice */}
      {ambiguousIndices.length > 0 && (
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <span className="font-semibold block mb-0.5">
              {ambiguousIndices.length} Ambiguous Sticker(s) Detected (Highlighted with yellow border):
            </span>
            <p className="text-amber-300/90 text-[11px]">
              Lighting or reflections caused uncertainty on these positions. Click any sticker to
              correct its color or click "Rescan" under that face.
            </p>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={onResetSession}
          variant="outline"
          size="sm"
          icon={RotateCcw}
        >
          Restart Scan
        </Button>

        <Button
          onClick={() => onCommitToSolver(stateString)}
          variant="primary"
          size="sm"
          icon={ArrowRight}
          disabled={!allCountsExact}
          title={
            !allCountsExact
              ? 'Each color must have exactly 9 stickers before applying'
              : 'Apply this reconstructed cube state to the solver'
          }
        >
          Use Scanned Cube State
        </Button>
      </div>
    </div>
  )
}
