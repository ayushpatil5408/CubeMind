/**
 * Production React Error Boundary Component (Phase 5C).
 * Traps runtime JavaScript rendering errors and displays a recovery card
 * without crashing the full application or exposing raw internal stack traces.
 */

import React from 'react'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'
import { Button } from './Button'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // In production, error telemetry can be dispatched here safely
    console.error('CubeMind ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-center shadow-2xl backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100">Something Went Wrong</h3>
              <p className="mt-1 text-xs text-slate-400">
                An unexpected interface error occurred. You can reset this component or reload the page to continue solving.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Home}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
