import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import CosmicBG from './CosmicBG'
import { useCubeSolver } from '../../hooks/useCubeSolver'

export function AppLayout({ children }) {
  const { activeTab } = useCubeSolver()

  if (activeTab === 'workspace') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-slate-100 relative overflow-hidden selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Cosmic Nebula Shader Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
        <CosmicBG
          className="w-full h-full"
          coreColor="#581c87"
          midColor="#6b21a8"
          accentColor="#00f0ff"
          outerColor="#3b0764"
          detail={14}
          brightness={24}
          speed={18}
          rotation={10}
        />
      </div>

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

