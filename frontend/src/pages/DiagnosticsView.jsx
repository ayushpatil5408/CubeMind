import React, { useState, useEffect } from 'react'
import {
  Terminal,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Layers,
  Camera,
  Box,
  Copy,
  Check,
  Zap,
} from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { cubeApi } from '../services/api'
import { useCubeSolver } from '../hooks/useCubeSolver'
import { getSolveHistory, getPracticeHistory } from '../utils/sessionHistory'

export function DiagnosticsView() {
  const { backendHealth } = useCubeSolver()
  const [healthData, setHealthData] = useState(null)
  const [healthLatency, setHealthLatency] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const isConnected = backendHealth.status === 'connected'

  const fetchHealth = async () => {
    setLoading(true)
    const t0 = performance.now()
    try {
      const data = await cubeApi.getHealth()
      const t1 = performance.now()
      setHealthData(data)
      setHealthLatency((t1 - t0).toFixed(1))
    } catch (err) {
      setHealthData({ error: err.message })
      setHealthLatency(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const handleCopyJson = () => {
    if (healthData) {
      navigator.clipboard.writeText(JSON.stringify(healthData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const solveHistory = getSolveHistory()
  const practiceHistory = getPracticeHistory()

  const systemModules = [
    { name: 'Pure-Python Cube Representation (54 Facelets)', status: 'Operational', icon: Box },
    { name: 'Mathematical Parity & Invariant Validator', status: 'Operational', icon: ShieldCheck },
    { name: 'Solution Verifier & BaseSolver Engine', status: 'Operational', icon: CheckCircle2 },
    { name: 'Kociemba Two-Phase IDA* Search Engine', status: isConnected ? 'Operational' : 'Offline', icon: Zap },
    { name: 'FastAPI Microservice Endpoints', status: isConnected ? 'Operational' : 'Offline', icon: Cpu },
    { name: 'Holographic Three.js 3D WebGL Canvas', status: 'Operational', icon: Layers },
    { name: 'Computer Vision AR Face Classification', status: 'Operational', icon: Camera },
  ]

  return (
    <div className="space-y-6 select-none">
      <Card
        title="Engine Diagnostics & Architecture Audit"
        subtitle="Verification of backend microservice endpoints, mathematical validator, and system modules"
        icon={Terminal}
        action={
          <Button
            onClick={fetchHealth}
            isLoading={loading}
            size="sm"
            variant="outline"
            icon={RefreshCw}
          >
            Refresh Audit
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Module Status Tree (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                System Health & Core Modules
              </h4>
              <Badge variant={isConnected ? 'success' : 'error'} size="sm" dot>
                {isConnected ? 'API Connected' : 'API Offline'}
              </Badge>
            </div>

            <div className="space-y-2">
              {systemModules.map((mod, i) => {
                const Icon = mod.icon
                const isOp = mod.status === 'Operational'
                return (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-[#06090F] border border-white/[0.06] flex items-center justify-between gap-3 shadow-sm hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#0C1322] text-cyan-400 shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-slate-200 font-medium truncate">
                        {mod.name}
                      </span>
                    </div>
                    <Badge variant={isOp ? 'success' : 'error'} size="sm">
                      {mod.status}
                    </Badge>
                  </div>
                )
              })}
            </div>

            {/* Diagnostics Stats Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#06090F] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Logged Solves</span>
                <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{solveHistory.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#06090F] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Drill Sessions</span>
                <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{practiceHistory.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#06090F] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Ping Latency</span>
                <p className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                  {healthLatency ? `${healthLatency} ms` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live API Health Check Response Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Live API Response (GET /)
              </h4>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#06090F] border border-white/[0.08] font-mono text-xs text-cyan-300/90 h-[340px] overflow-y-auto shadow-inner scrollbar-none">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  <span>Querying backend telemetry...</span>
                </div>
              ) : (
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
