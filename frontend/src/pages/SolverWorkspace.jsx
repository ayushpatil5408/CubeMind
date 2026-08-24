import React, { useState } from 'react'
import { CubeWorkspace } from '../components/workspace/CubeWorkspace'
import { ColorPalette } from '../components/workspace/ColorPalette'
import { ValidationBadge } from '../components/workspace/ValidationBadge'
import { SolutionPanel } from '../components/workspace/SolutionPanel'
import { CoachPanel } from '../components/workspace/CoachPanel'
import { ControlsPanel } from '../components/workspace/ControlsPanel'
import { StateInspector } from '../components/workspace/StateInspector'
import { StateImportModal } from '../components/workspace/StateImportModal'
import { CubeScannerModal } from '../components/scanner/CubeScannerModal'
import { PracticeModal } from '../components/workspace/PracticeModal'
import { SessionHistoryModal } from '../components/workspace/SessionHistoryModal'
import { useCubeSolver } from '../hooks/useCubeSolver'

export function SolverWorkspace() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false)
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const { solutionResult } = useCubeSolver()

  return (
    <div className="space-y-8">
      {/* Top Grid: Cube Workspace & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cube Visualizer & Manual State Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ValidationBadge />
          <CubeWorkspace />
          <ColorPalette onOpenImportModal={() => setIsImportModalOpen(true)} />
          <StateInspector />
        </div>

        {/* Right Column: Controls, Solution & AI Coach (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ControlsPanel
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onOpenPractice={() => setIsPracticeModalOpen(true)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
          />
          <SolutionPanel />
          <CoachPanel />
        </div>
      </div>

      {/* Manual State Import Modal */}
      <StateImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Camera Scanning Modal */}
      <CubeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
      />

      {/* Practice Mode Modal (Phase 5C) */}
      <PracticeModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        moves={solutionResult?.moves || []}
      />

      {/* Local Session History Modal (Phase 5C) */}
      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  )
}

