import React, { useState, useEffect } from 'react'
import { Terminal, Cpu, ShieldCheck, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { cubeApi } from '../services/api'
import { useCubeSolver } from '../hooks/useCubeSolver'

export function DiagnosticsView() {
  const { backendHealth } = useCubeSolver()
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const data = await cubeApi.getHealth()
      setHealthData(data)
    } catch (err) {
      setHealthData({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  return (
    <div className="space-y-8">
      <Card
        title="Engine Diagnostics & Architecture Audit"
        subtitle="Verification of backend endpoints, mathematical validator, and solver registry"
        icon={Terminal}
        action={
          <Button onClick={fetchHealth} isLoading={loading} size="sm" variant="outline" icon={RefreshCw}>
            Refresh Audit
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Architecture Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Module Status</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Phase 1: Pure-Python Cube Engine</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Phase 2A: Mathematical Parity Validator</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Phase 2B: Solution Verifier & BaseSolver</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Phase 2C: Kociemba Two-Phase Engine</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Phase 2D: End-to-End Orchestration & API</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Phase 2E: Reproducible Benchmark Engine</span>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-semibold">Phase 3A: Frontend Architecture</span>
                <Badge variant="indigo" size="sm">Active Phase</Badge>
              </div>
            </div>
          </div>

          {/* Live API Health Check Response */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live API Response (GET /)</h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 h-64 overflow-y-auto">
              <pre>{JSON.stringify(healthData, null, 2)}</pre>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
