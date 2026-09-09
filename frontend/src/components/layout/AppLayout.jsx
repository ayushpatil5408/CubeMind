import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function AppLayout({ children }) {
  const { activeTab } = useCubeSolver()

  if (activeTab === 'workspace') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 relative overflow-hidden selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Cinematic Ambient Background Atmosphere */}
      <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/12 via-violet-600/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-500/10 via-cyan-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-amber-600/8 via-cyan-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Futuristic Header */}
      <Header />

      {/* Primary Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {children}
      </main>

      {/* System Telemetry Footer */}
      <Footer />
    </div>
  )
}

