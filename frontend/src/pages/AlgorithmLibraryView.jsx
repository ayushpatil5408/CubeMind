import React from 'react'
import { BookOpen, Play, CheckCircle2, Copy } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { ALGORITHM_PRESETS } from '../utils/cubeUtils'
import { useCubeSolver } from '../hooks/useCubeSolver'

export function AlgorithmLibraryView() {
  const { setActiveTab, generateScramble } = useCubeSolver()

  const handleTestAlgorithm = (preset) => {
    // Switch to workspace and trigger solve
    setActiveTab('workspace')
  }

  return (
    <div className="space-y-8">
      <Card
        title="Algorithm Catalog & Speedsolving Library"
        subtitle="Standard algorithmic triggers, OLL/PLL sequences, and mathematical benchmarks"
        icon={BookOpen}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGORITHM_PRESETS.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-semibold text-slate-100">{p.name}</h4>
                  <Badge variant="indigo" size="sm">{p.moves.split(' ').length} moves</Badge>
                </div>
                <p className="text-xs text-slate-400">{p.description}</p>
                <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                  {p.moves}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(p.moves)
                  }}
                  size="sm"
                  variant="ghost"
                  icon={Copy}
                >
                  Copy
                </Button>
                <Button
                  onClick={() => handleTestAlgorithm(p)}
                  size="sm"
                  variant="secondary"
                  icon={Play}
                >
                  Load into Workspace
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
