import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Primary Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
