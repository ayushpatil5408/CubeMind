import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, Compass, AlertCircle } from 'lucide-react'
import { RubiksCube3D } from './RubiksCube3D'
import {
  NeuralOrbitalRings,
  SynapticNodesAndLines,
  QuantumParticleDust,
  CoreNeuralPulseLight,
} from './NeuralDecorations'
import { useCubeSolver } from '../../hooks/useCubeSolver'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { getStickerPositionName } from '../../utils/cubeUtils'

// Standard camera view presets
export const CAMERA_PRESETS = [
  { id: 'ISO', label: 'ISO', fullLabel: 'Isometric', position: [4.5, 3.2, 6.2] },
  { id: 'F', label: 'F', fullLabel: 'Front (F)', position: [0, 0, 7.2] },
  { id: 'U', label: 'U', fullLabel: 'Top (U)', position: [0, 7.2, 0.01] },
  { id: 'R', label: 'R', fullLabel: 'Right (R)', position: [7.2, 0, 0] },
  { id: 'B', label: 'B', fullLabel: 'Back (B)', position: [0, 0, -7.2] },
  { id: 'D', label: 'D', fullLabel: 'Down (D)', position: [0, -7.2, 0.01] },
  { id: 'L', label: 'L', fullLabel: 'Left (L)', position: [-7.2, 0, 0] },
]

export const QUICK_MOVES = ['U', 'D', 'L', 'R', 'F', 'B']

function CameraWatcher({ onEulerChange }) {
  const { camera } = useThree()
  const lastUpdateRef = useRef(0)

  useFrame(() => {
    const now = performance.now()
    if (now - lastUpdateRef.current > 60) {
      lastUpdateRef.current = now
      if (onEulerChange && camera) {
        // Calculate spherical Euler angles relative to target
        const yaw = (Math.atan2(camera.position.x, camera.position.z) * (180 / Math.PI)).toFixed(1)
        const radius = Math.sqrt(
          camera.position.x * camera.position.x +
          camera.position.y * camera.position.y +
          camera.position.z * camera.position.z
        )
        const pitch = (Math.asin(camera.position.y / (radius || 1)) * (180 / Math.PI)).toFixed(1)
        const roll = '0.0'
        onEulerChange({ yaw, pitch, roll })
      }
    }
  })

  return null
}

function SceneContent({
  stateString,
  selectedStickerIndex,
  hoveredStickerIndex,
  activeAnimation,
  onAnimationComplete,
  onStickerClick,
  onStickerHover,
  controlsRef,
  onEulerChange,
}) {
  return (
    <>
      {/* Studio Cyber & Solar Amber Hybrid Lighting */}
      <ambientLight intensity={3.0} color="#121828" />
      <directionalLight position={[7, 9, 7]} intensity={3.8} color="#ffaa22" />
      <directionalLight position={[-8, -6, -5]} intensity={2.5} color="#00e5ff" />
      <directionalLight position={[0, 8, -6]} intensity={2.2} color="#a855f7" />

      {/* Central Thinking Core Pulse Light */}
      <CoreNeuralPulseLight />

      {/* Floating Quantum Particle Swarm Dust */}
      <QuantumParticleDust />

      {/* Neural Orbital Rings (Tensor Search Plies) */}
      <NeuralOrbitalRings />

      {/* Floating Decision-Tree Nodes & Synaptic Laser Vector Network */}
      <SynapticNodesAndLines />

      {/* Central 3D Interactive Rubik's Cube */}
      <Center>
        <RubiksCube3D
          stateString={stateString}
          selectedStickerIndex={selectedStickerIndex}
          hoveredStickerIndex={hoveredStickerIndex}
          activeAnimation={activeAnimation}
          onAnimationComplete={onAnimationComplete}
          onStickerClick={onStickerClick}
          onStickerHover={onStickerHover}
        />
      </Center>

      <CameraWatcher onEulerChange={onEulerChange} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={2.5}
        maxDistance={14.0}
        rotateSpeed={0.85}
        zoomSpeed={1.0}
        enablePan={false}
      />
    </>
  )
}

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-[#0C1322]/80 rounded-2xl border border-red-500/30">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <h4 className="text-sm font-bold text-red-300">3D WebGL Canvas Unavailable</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {this.state.error?.message || 'Your browser could not initialize WebGL 3D context.'}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export function CubeScene({
  isFullScreen = false,
  heightClass = 'h-[420px] sm:h-[480px]',
  onEulerAnglesUpdate,
  cameraControlsRef,
}) {
  const {
    stateString,
    setStickerColor,
    selectedColor,
    selectedStickerIndex,
    setSelectedStickerIndex,
    hoveredStickerIndex,
    setHoveredStickerIndex,
    activeAnimation,
    completeCurrentAnimation,
    executeMove,
    isScrambling,
  } = useCubeSolver()

  const internalControlsRef = useRef(null)
  const controlsRef = cameraControlsRef || internalControlsRef
  const [activePreset, setActivePreset] = useState('ISO')
  const [turnModifier, setTurnModifier] = useState('') // '' | "'" | '2'

  const handleStickerClick = useCallback((stickerIdx) => {
    setSelectedStickerIndex(stickerIdx)
    setStickerColor(stickerIdx, selectedColor)
  }, [setSelectedStickerIndex, setStickerColor, selectedColor])

  const setCameraPosition = useCallback((pos, presetId) => {
    setActivePreset(presetId)
    if (controlsRef.current) {
      const controls = controlsRef.current
      const camera = controls.object
      if (camera) {
        camera.position.set(pos[0], pos[1], pos[2])
        controls.target.set(0, 0, 0)
        camera.lookAt(0, 0, 0)
        controls.update()
      }
    }
  }, [controlsRef])

  const handleResetCamera = useCallback(() => {
    setCameraPosition([4.5, 3.2, 6.2], 'ISO')
  }, [setCameraPosition])

  const handleQuickTurn = useCallback((baseFace) => {
    if (activeAnimation || isScrambling) return
    const move = `${baseFace}${turnModifier}`
    executeMove(move, true)
  }, [activeAnimation, isScrambling, turnModifier, executeMove])

  // Keyboard shortcut listener for interactive layer turns
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when typing inside input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      if (activeAnimation || isScrambling) return

      const key = e.key.toUpperCase()
      if (QUICK_MOVES.includes(key)) {
        e.preventDefault()
        const move = e.shiftKey ? `${key}'` : key
        executeMove(move, true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeAnimation, isScrambling, executeMove])

  const activeHoverStickerLabel =
    hoveredStickerIndex !== null ? getStickerPositionName(hoveredStickerIndex) : null

  if (isFullScreen) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden select-none">
        {/* Subtle Cyber Perspective Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Radial Core Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.06)_0%,rgba(245,158,11,0.03)_35%,transparent_70%)]" />

        <WebGLErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Initializing Cyber Holographic Stage..." />}>
            <Canvas
              camera={{ position: [4.5, 3.2, 6.2], fov: 42 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              className="cursor-grab active:cursor-grabbing w-full h-full relative z-0"
            >
              <SceneContent
                stateString={stateString}
                selectedStickerIndex={selectedStickerIndex}
                hoveredStickerIndex={hoveredStickerIndex}
                activeAnimation={activeAnimation}
                onAnimationComplete={completeCurrentAnimation}
                onStickerClick={handleStickerClick}
                onStickerHover={setHoveredStickerIndex}
                controlsRef={controlsRef}
                onEulerChange={onEulerAnglesUpdate}
              />
            </Canvas>
          </Suspense>
        </WebGLErrorBoundary>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl bg-[#06080F] border border-white/[0.08] shadow-2xl overflow-hidden group select-none`}
    >
      {/* Perspective Grid Background & Holographic Ambience */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Canvas Viewport */}
      <WebGLErrorBoundary>
        <Suspense fallback={<LoadingSpinner message="Initializing Holographic 3D Stage..." />}>
          <Canvas
            camera={{ position: [4.5, 3.2, 6.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            className="cursor-grab active:cursor-grabbing w-full h-full relative z-10"
          >
            <SceneContent
              stateString={stateString}
              selectedStickerIndex={selectedStickerIndex}
              hoveredStickerIndex={hoveredStickerIndex}
              activeAnimation={activeAnimation}
              onAnimationComplete={completeCurrentAnimation}
              onStickerClick={handleStickerClick}
              onStickerHover={setHoveredStickerIndex}
              controlsRef={controlsRef}
              onEulerChange={onEulerAnglesUpdate}
            />
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>

      {/* Top Floating Camera Presets Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0C1322]/85 backdrop-blur-xl border border-white/[0.08] pointer-events-auto shadow-lg overflow-x-auto max-w-[80%] scrollbar-none">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setCameraPosition(preset.position, preset.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 whitespace-nowrap ${
                activePreset === preset.id
                  ? 'bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/15 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Reset Camera Button */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Reset Camera to Isometric View"
          className="p-2 rounded-xl bg-[#0C1322]/85 backdrop-blur-xl border border-white/[0.08] text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 pointer-events-auto shadow-lg transition-all duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Interactive Layer Turn Quick-Dock */}
      <div className="absolute top-14 left-3 flex flex-col gap-1 p-1.5 rounded-2xl bg-[#0C1322]/85 backdrop-blur-xl border border-white/[0.08] pointer-events-auto shadow-xl z-20">
        <div className="flex items-center justify-between px-1 pb-1 border-b border-white/[0.06] text-[9px] font-mono font-bold text-slate-400">
          <span>TURNS</span>
          <div className="flex gap-0.5 ml-2">
            <button
              type="button"
              onClick={() => setTurnModifier('')}
              className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                turnModifier === '' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Standard 90° Clockwise"
            >
              CW
            </button>
            <button
              type="button"
              onClick={() => setTurnModifier("'")}
              className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                turnModifier === "'" ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Inverted 90° Counter-Clockwise (Prime)"
            >
              CCW
            </button>
            <button
              type="button"
              onClick={() => setTurnModifier('2')}
              className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                turnModifier === '2' ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="180° Half Turn"
            >
              180°
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-0.5">
          {QUICK_MOVES.map((face) => (
            <button
              key={face}
              type="button"
              onClick={() => handleQuickTurn(face)}
              disabled={!!activeAnimation || isScrambling}
              title={`Turn ${face}${turnModifier} layer (Keyboard: ${face})`}
              className="w-7 h-7 rounded-lg bg-[#111C33] hover:bg-cyan-950/60 active:bg-cyan-500/30 border border-white/[0.06] hover:border-cyan-400/40 text-xs font-mono font-bold text-slate-200 hover:text-cyan-300 transition-all flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {face}{turnModifier}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Floating Telemetry & Interaction Hint Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 text-[10px] font-mono text-slate-400">
        <span className="px-2.5 py-1 rounded-xl bg-[#0C1322]/85 backdrop-blur-xl border border-white/[0.08] flex items-center gap-1.5 shadow-md">
          <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Click: Paint • Drag: Rotate • Scroll: Zoom • Keys [U,D,L,R,F,B]: Turn</span>
        </span>

        {activeHoverStickerLabel && (
          <span className="px-2.5 py-1 rounded-xl bg-cyan-950/90 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 shadow-md font-semibold animate-in fade-in duration-100">
            {activeHoverStickerLabel}
          </span>
        )}
      </div>
    </div>
  )
}


