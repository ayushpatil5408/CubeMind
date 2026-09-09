import React, { Suspense, lazy } from 'react'
import { CubeProvider } from './context/CubeContext'
import { useCubeSolver } from './hooks/useCubeSolver'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { SolverWorkspace } from './pages/SolverWorkspace'

// Lazy load secondary views for bundle optimization
const BenchmarkView = lazy(() =>
  import('./pages/BenchmarkView').then((m) => ({ default: m.BenchmarkView }))
)
const AlgorithmLibraryView = lazy(() =>
  import('./pages/AlgorithmLibraryView').then((m) => ({ default: m.AlgorithmLibraryView }))
)
const DiagnosticsView = lazy(() =>
  import('./pages/DiagnosticsView').then((m) => ({ default: m.DiagnosticsView }))
)

function AppContent() {
  const { activeTab } = useCubeSolver()

  return (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner message="Loading CubeMind Intelligence Module..." />}>
        {activeTab === 'workspace' && <SolverWorkspace />}
        {activeTab === 'benchmark' && <BenchmarkView />}
        {activeTab === 'algorithms' && <AlgorithmLibraryView />}
        {activeTab === 'diagnostics' && <DiagnosticsView />}
      </Suspense>
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
