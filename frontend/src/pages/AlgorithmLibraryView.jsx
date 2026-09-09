import React, { useState } from 'react'
import { BookOpen, Play, CheckCircle2, Copy, Check, Sparkles } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { ALGORITHM_PRESETS } from '../utils/cubeUtils'
import { useCubeSolver } from '../hooks/useCubeSolver'

export function AlgorithmLibraryView() {
  const { setActiveTab } = useCubeSolver()
  const [copiedId, setCopiedId] = useState(null)

  const handleTestAlgorithm = (preset) => {
    // Switch to workspace where user can practice or inspect
    setActiveTab('workspace')
  }

  const handleCopy = (id, moves) => {
    navigator.clipboard.writeText(moves)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 select-none">
      <Card
        title="Algorithm Catalog & Speedsolving Library"
        subtitle="Standard algorithmic triggers, OLL/PLL speedsolving sequences, and mathematical pattern benchmarks"
        icon={BookOpen}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGORITHM_PRESETS.map((p) => {
            const moveList = p.moves.split(' ')
            const isCopied = copiedId === p.id

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#06090F] border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col justify-between gap-4 shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {moveList.length} moves
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                  
                  {/* Glowing Singmaster Move Sequence */}
                  <div className="mt-3 p-3 rounded-xl bg-[#0C1322] border border-white/[0.06] font-mono text-xs text-cyan-300 tracking-wider break-words shadow-inner">
                    {p.moves}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  <Button
                    onClick={() => handleCopy(p.id, p.moves)}
                    size="sm"
                    variant="ghost"
                    icon={isCopied ? Check : Copy}
                    className="text-slate-400 hover:text-white"
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => handleTestAlgorithm(p)}
                    size="sm"
                    variant="secondary"
                    icon={Play}
                    className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40"
                  >
                    Load into Workspace
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
