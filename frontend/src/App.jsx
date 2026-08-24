import React from 'react'
import { CubeProvider } from './context/CubeContext'
import { useCubeSolver } from './hooks/useCubeSolver'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { SolverWorkspace } from './pages/SolverWorkspace'
import { BenchmarkView } from './pages/BenchmarkView'
import { AlgorithmLibraryView } from './pages/AlgorithmLibraryView'
import { DiagnosticsView } from './pages/DiagnosticsView'

function AppContent() {
  const { activeTab } = useCubeSolver()

  return (
    <AppLayout>
      {activeTab === 'workspace' && <SolverWorkspace />}
      {activeTab === 'benchmark' && <BenchmarkView />}
      {activeTab === 'algorithms' && <AlgorithmLibraryView />}
      {activeTab === 'diagnostics' && <DiagnosticsView />}
    </AppLayout>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <CubeProvider>
        <AppContent />
      </CubeProvider>
    </ErrorBoundary>
  )
}

