import React, { useState } from 'react'
import {
  Box,
  Activity,
  Cpu,
  BookOpen,
  Terminal,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { Badge } from '../common/Badge'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function Header() {
  const { activeTab, setActiveTab, backendHealth } = useCubeSolver()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      id: 'workspace',
      label: 'Solver Workspace',
      shortLabel: 'Workspace',
      icon: Box,
      tag: '3D Studio',
    },
    {
      id: 'benchmark',
      label: 'Benchmark Lab',
      shortLabel: 'Benchmark',
      icon: Activity,
      tag: 'IDA* Latency',
    },
    {
      id: 'algorithms',
      label: 'Algorithm Library',
      shortLabel: 'Algorithms',
      icon: BookOpen,
      tag: 'OLL/PLL',
    },
    {
      id: 'diagnostics',
      label: 'System Diagnostics',
      shortLabel: 'Diagnostics',
      icon: Terminal,
      tag: 'API Health',
    },
  ]

  const isConnected = backendHealth.status === 'connected'
  const isChecking = backendHealth.status === 'checking'

  const handleNavClick = (id) => {
    setActiveTab(id)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#06090F]/85 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Futuristic Brand & Isometric Glyph */}
        <div
          onClick={() => setActiveTab('workspace')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-[1px] shadow-lg shadow-cyan-500/15 group-hover:shadow-cyan-500/30 transition-all duration-200">
            <div className="w-full h-full bg-[#080D1A] rounded-[11px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
              <Box className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                Cube<span className="text-cyan-400">Mind</span>
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                OS v2.6
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wider">
              KOCIEMBA TWO-PHASE ENGINE
            </p>
          </div>
        </div>

        {/* Desktop Main Command Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-[#0C1322]/80 border border-white/[0.08] shadow-inner"
        >
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/15 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right System Telemetry & Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Live Engine Connection Status Pill */}
          <div
            title={
              isConnected
                ? 'Kociemba IDA* Engine Backend Connected'
                : isChecking
                ? 'Verifying Backend Connection...'
                : 'Backend API Offline — Offline Fallback Active'
            }
            className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-colors ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : isChecking
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse'
                  : isChecking
                  ? 'bg-cyan-400 animate-spin'
                  : 'bg-red-400'
              }`}
            />
            <span>{isConnected ? 'API Connected' : isChecking ? 'Checking API...' : 'API Offline'}</span>
          </div>

          {/* Diagnostics Quick Switch Button */}
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            title="System Diagnostics & Telemetry"
            className={`p-2 rounded-xl border transition-all duration-150 ${
              activeTab === 'diagnostics'
                ? 'bg-violet-950/50 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-500/20'
                : 'bg-[#0C1322]/80 border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl bg-[#0C1322] border border-white/[0.08] text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-white/[0.06] bg-[#090E1A]/95 backdrop-blur-2xl space-y-1 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map(({ id, label, icon: Icon, tag }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavClick(id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{tag}</span>
                </button>
              )
            })}
          </div>

          <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Status:</span>
            <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
              {isConnected ? 'Backend Connected' : 'Backend Offline'}
            </span>
          </div>
        </div>
      )}

      {/* Sub-header Mobile Quick Scroller Tabs */}
      <div className="flex md:hidden overflow-x-auto px-4 py-1.5 border-t border-white/[0.05] bg-[#06090F]/90 gap-1.5 scrollbar-none">
        {navItems.map(({ id, shortLabel, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavClick(id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{shortLabel}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
