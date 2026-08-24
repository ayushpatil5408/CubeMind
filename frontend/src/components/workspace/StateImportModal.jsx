import React, { useState } from 'react'
import { X, Check, Copy, AlertCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react'
import { SOLVED_STATE_STRING } from '../../types/cube'
import { validateBasicFormat, ALGORITHM_PRESETS } from '../../utils/cubeUtils'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Manual Cube State Input & Paste
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Paste from Clipboard
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopyCurrent}
                className="text-slate-400 hover:text-slate-200 transition-colors"
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
            className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-wider resize-none"
          />

          {/* Real-time Validation Feedback */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              validation.isValid
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
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
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Preset States
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_STATES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setInputString(preset.state)}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-600/50 hover:bg-slate-800/50 text-left transition-all"
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
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!validation.isValid}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              validation.isValid
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white cursor-pointer'
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
