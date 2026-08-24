/**
 * CubeMind Detected Face Preview & Quality Inspector (Phase 4B)
 * Displays the 3x3 detected facelet color grid, sampled RGB/HSV metrics,
 * multi-factor confidence rating, image quality diagnostics, and actionable feedback.
 */

import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Eye,
} from 'lucide-react'
import { Button } from '../common/Button'
import { CONFIDENCE_LEVEL } from '../../cv/types'

export function DetectedFacePreview({
  cvResult,
  faceMeta,
  onAccept,
  onRetake,
  previewDataUrl,
}) {
  const [selectedStickerIdx, setSelectedStickerIdx] = useState(4) // Default to center

  if (!cvResult) return null

  const {
    confidence,
    imageQuality,
    stickers,
    isGuided,
    targetFace,
  } = cvResult

  const { level, overallConfidence, feedbackTitle, guidance, metrics } = confidence
  const selectedSticker = stickers[selectedStickerIdx] || stickers[4]

  const isGood = level === CONFIDENCE_LEVEL.GOOD
  const isWarning = level === CONFIDENCE_LEVEL.WARNING
  const isFailed = level === CONFIDENCE_LEVEL.FAILED

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-100 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
            style={{ backgroundColor: faceMeta?.color || '#ffffff' }}
          />
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              {faceMeta?.name || targetFace} Face Detected
            </h4>
            <p className="text-[11px] text-slate-400">
              Single-Face Computer Vision Inspection (Phase 4B)
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          {isGuided && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Guided
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              isGood
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isWarning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-red-500/20 text-red-300 border-red-500/40'
            }`}
          >
            {isGood && <CheckCircle2 className="w-3.5 h-3.5" />}
            {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
            {isFailed && <XCircle className="w-3.5 h-3.5" />}
            {feedbackTitle} ({Math.round(overallConfidence * 100)}%)
          </span>
        </div>
      </div>

      {/* Main Content Area: Grid on left, Details on right */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {/* Left: 3x3 Detected Facelet Color Grid */}
        <div className="flex flex-col items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Extracted 3×3 Sticker Colors</span>
          </div>

          <div className="w-48 h-48 grid grid-cols-3 grid-rows-3 gap-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
            {stickers.map((stk) => {
              const isSelected = stk.index === selectedStickerIdx
              const isCenter = stk.index === 4
              return (
                <button
                  key={stk.index}
                  onClick={() => setSelectedStickerIdx(stk.index)}
                  title={`Cell ${stk.index} (${stk.name}): ${stk.color.hex}`}
                  className={`relative rounded-lg flex items-center justify-center transition-all duration-150 shadow-md ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-105 z-10'
                      : 'hover:scale-98 opacity-95 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: stk.color.hex }}
                >
                  <span className="absolute top-1 left-1 text-[9px] font-mono font-bold bg-black/60 text-white/90 px-1 rounded">
                    {stk.index}
                  </span>
                  {isCenter && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/40 shadow" />
                  )}
                </button>
              )
            })}
          </div>
          <span className="text-[10px] text-slate-400 mt-2">
            Click any cell above to inspect color metrics
          </span>
        </div>

        {/* Right: Selected Cell Color Profile & Metrics */}
        <div className="flex flex-col bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                style={{ backgroundColor: selectedSticker?.color?.hex || '#000' }}
              />
              <span className="text-xs font-bold text-slate-200">
                Cell {selectedSticker?.index} ({selectedSticker?.name})
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              {selectedSticker?.color?.hex}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Mean RGB
              </span>
              <span className="font-mono text-slate-200 font-medium">
                {selectedSticker?.color?.meanRgb?.r}, {selectedSticker?.color?.meanRgb?.g},{' '}
                {selectedSticker?.color?.meanRgb?.b}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                HSV Profile
              </span>
              <span className="font-mono text-slate-200 font-medium">
                {selectedSticker?.color?.hsv?.h}°, {selectedSticker?.color?.hsv?.s}%,{' '}
                {selectedSticker?.color?.hsv?.v}%
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Brightness / Sat
              </span>
              <span className="font-mono text-slate-200 font-medium">
                {selectedSticker?.color?.brightness} / {selectedSticker?.color?.saturation}%
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Sample Pixels
              </span>
              <span className="font-mono text-slate-200 font-medium">
                {selectedSticker?.color?.sampleCount} px (±{selectedSticker?.color?.variance})
              </span>
            </div>
          </div>

          {/* Quality Diagnostics */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Sharpness Score:</span>
              <span className="font-mono text-slate-200">
                {metrics?.blurScore} {imageQuality?.isBlurry ? '(Blurry)' : '(Sharp)'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Lighting / Exposure:</span>
              <span className="font-mono text-slate-200">
                {imageQuality?.isTooDark
                  ? 'Too Dark'
                  : imageQuality?.isTooBright
                  ? 'Too Bright / Glare'
                  : 'Balanced'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Guidance Note */}
      <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200">
          <span className="font-semibold block mb-0.5">CV Guidance:</span>
          <ul className="list-disc list-inside space-y-0.5 text-indigo-300">
            {guidance.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={onRetake}
          variant="outline"
          size="sm"
          icon={RotateCcw}
        >
          Retake Scan
        </Button>

        <Button
          onClick={onAccept}
          variant="primary"
          size="sm"
          icon={CheckCircle2}
          disabled={isFailed}
          title={isFailed ? 'Scan confidence too low to accept' : 'Accept this face scan'}
        >
          {isFailed ? 'Retake Required' : 'Accept Face Scan'}
        </Button>
      </div>
    </div>
  )
}
