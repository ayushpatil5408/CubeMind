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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl p-6 bg-[#06090F] border border-white/[0.08] rounded-3xl shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Manual Cube State Input & Paste
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
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
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
              >
                Paste Clipboard
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopyCurrent}
                className="text-slate-400 hover:text-slate-200 transition-colors font-mono"
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
            className="w-full p-3.5 bg-[#0C1322] border border-white/[0.08] rounded-2xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 tracking-wider resize-none shadow-inner"
          />

          {/* Real-time Validation Feedback */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              validation.isValid
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
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
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Quick Preset States
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_STATES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setInputString(preset.state)}
                className="p-2.5 rounded-xl bg-[#0C1322] border border-white/[0.06] hover:border-cyan-500/40 hover:bg-[#111C33] text-left transition-all"
              >
                <div className="text-xs font-medium text-slate-200">{preset.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                  {preset.state.substring(0, 16)}...
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!validation.isValid}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              validation.isValid
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white cursor-pointer shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Apply Cube State
          </button>
        </div>
      </div>
    </div>
  )
}
