import React, { useState } from 'react'
import { X, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'
import { SOLVED_STATE_STRING } from '../../types/cube'
import { validateBasicFormat } from '../../utils/cubeUtils'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function StateImportModal({ isOpen, onClose }) {
  const { stateString, setEntireState } = useCubeSolver()
  const [inputString, setInputString] = useState(stateString)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const validation = validateBasicFormat(inputString)

  const handleApply = () => {
    if (!validation.isValid) return
    setEntireState(inputString.toUpperCase(), 'paste_import')
    onClose()
  }

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(inputString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setInputString(text.trim().toUpperCase())
      }
    } catch (err) {
      // Clipboard permissions denied
    }
  }

  const PRESET_STATES = [
    {
      name: 'Solved State',
      state: SOLVED_STATE_STRING,
    },
    {
      name: 'Checkerboard Pattern',
      state: 'UDUDUDUDURLRLRLRLRFBFBFBFBFDUDUDUDUDLRLRLRLRLBFBFBFBFB',
    },
    {
      name: 'Superflip (God’s Number)',
      state: 'UBULURUFURFRBRDRFURFUFLFDFDFDLDBDRDLULBLFLBLBRBRFRBRB',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl p-6 sm:p-7 liquid-clay-card rounded-3xl space-y-5 shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Manual Cube State Input & Paste
              </h3>
              <p className="text-[11px] text-slate-400">Canonical 54-facelet URFDLB verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-clay-btn-secondary w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Canonical 54-Character String (URFDLB Order)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="liquid-clay-pill px-2.5 py-0.5 text-[11px] text-cyan-300 border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 transition-colors font-mono cursor-pointer"
              >
                Paste Clipboard
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopyCurrent}
                className="liquid-clay-pill px-2.5 py-0.5 text-[11px] text-slate-300 border-white/15 bg-white/5 hover:bg-white/10 transition-colors font-mono cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={inputString}
            onChange={(e) => setInputString(e.target.value.trim().toUpperCase())}
            placeholder="Paste 54-character URFDLB state string..."
            className="w-full p-4 bg-[#060914]/85 border border-white/10 rounded-2xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 tracking-wider resize-none shadow-[inset_0_3px_6px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(0,0,0,0.5)]"
          />

          {/* Real-time Validation Feedback */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs shadow-inner ${
              validation.isValid
                ? 'bg-emerald-950/40 border-emerald-500/35 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/35 text-amber-300'
            }`}
          >
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-semibold">
                {validation.isValid ? 'Format Valid (54 chars)' : 'Validation Warning'}
              </span>
              <p className="text-[11px] opacity-90">{validation.message}</p>
            </div>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Quick Preset States
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_STATES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setInputString(preset.state)}
                className="liquid-clay-btn-secondary p-3 rounded-2xl text-left cursor-pointer transition-all"
              >
                <div className="text-xs font-semibold text-slate-200">{preset.name}</div>
                <div className="text-[10px] text-cyan-400/80 font-mono truncate mt-0.5">
                  {preset.state.substring(0, 16)}...
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="liquid-clay-btn-secondary px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!validation.isValid}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg ${
              validation.isValid
                ? 'liquid-clay-btn-cyan cursor-pointer'
                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Apply Cube State
          </button>
        </div>
      </div>
    </div>
  )
}
