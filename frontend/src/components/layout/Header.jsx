import React from 'react'
import { Box, Activity, Cpu, BookOpen, Terminal, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '../common/Badge'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function Header() {
  const { activeTab, setActiveTab, backendHealth } = useCubeSolver()

  const navItems = [
    { id: 'workspace', label: 'Solver Workspace', icon: Box },
    { id: 'benchmark', label: 'Benchmark Lab', icon: Activity },
    { id: 'algorithms', label: 'Algorithm Library', icon: BookOpen },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Terminal },
  ]

  const isConnected = backendHealth.status === 'connected'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Box className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                Cube<span className="text-cyan-400">Mind</span>
              </span>
              <Badge variant="indigo" size="sm">Phase 4A</Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">KOCIEMBA TWO-PHASE ENGINE</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Backend Connectivity Status & Controls */}
        <div className="flex items-center gap-3">
          <Badge
            variant={isConnected ? 'success' : 'error'}
            size="md"
            dot
            className="hidden sm:inline-flex"
          >
            {isConnected ? 'API Connected' : 'API Offline'}
          </Badge>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-slate-900/60 gap-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
                isActive ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
