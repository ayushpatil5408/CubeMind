import React, { useState } from 'react'
import { Terminal, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { countFaceletColors, validateBasicFormat, getFaceletColor } from '../../utils/cubeUtils'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function StateInspector() {
  const { stateString, solutionResult } = useCubeSolver()
  const [copied, setCopied] = useState(false)

  const counts = countFaceletColors(stateString)
  const validation = validateBasicFormat(stateString)

  const handleCopy = () => {
    navigator.clipboard.writeText(stateString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const faces = ['U', 'R', 'F', 'D', 'L', 'B']

  return (
    <Card
      title="54-Facelet State Inspector"
      subtitle="Canonical URFDLB Facelet Serialization & Physical Validation"
      icon={Terminal}
      action={
        <Badge variant={validation.isValid ? 'success' : 'error'} size="sm" dot>
          {validation.isValid ? 'Structure Valid' : 'Invalid Format'}
        </Badge>
      }
    >
      {/* 54-char string representation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-300 font-mono">
            State String (54 Chars)
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300/90 break-all select-all tracking-wider">
          {stateString}
        </div>
      </div>

      {/* Facelet Distribution Counter */}
      <div>
        <span className="block text-xs font-medium text-slate-400 mb-2">
          Sticker Distribution (9 required per face)
        </span>
        <div className="grid grid-cols-6 gap-2">
          {faces.map((f) => {
            const count = counts[f] || 0
            const isOk = count === 9
            return (
              <div
                key={f}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                  isOk ? 'bg-slate-900/60 border-slate-800' : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFaceletColor(f) }} />
                  <span className="font-bold text-xs font-mono">{f}</span>
                </div>
                <span className={`text-xs font-mono ${isOk ? 'text-slate-300' : 'text-red-400 font-bold'}`}>
                  {count}/9
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
