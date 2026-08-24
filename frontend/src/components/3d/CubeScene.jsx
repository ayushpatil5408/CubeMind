import React, { useRef, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, PerspectiveCamera } from '@react-three/drei'
import { RotateCcw, Compass, Eye, Sparkles, AlertCircle } from 'lucide-react'
import { RubiksCube3D } from './RubiksCube3D'
import { useCubeSolver } from '../../hooks/useCubeSolver'
import { LoadingSpinner } from '../common/LoadingSpinner'

// Standard camera view presets
const CAMERA_PRESETS = [
  { label: 'Isometric', position: [3.8, 3.2, 4.5] },
  { label: 'Front (F)', position: [0, 0, 6.2] },
  { label: 'Top (U)', position: [0, 6.2, 0.01] },
  { label: 'Right (R)', position: [6.2, 0, 0] },
  { label: 'Back (B)', position: [0, 0, -6.2] },
  { label: 'Down (D)', position: [0, -6.2, 0.01] },
  { label: 'Left (L)', position: [-6.2, 0, 0] },
]

function SceneContent({
  stateString,
  selectedStickerIndex,
  hoveredStickerIndex,
  activeAnimation,
  onAnimationComplete,
  onStickerClick,
  onStickerHover,
  controlsRef,
}) {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[10, 15, 12]} intensity={1.4} castShadow />
      <directionalLight position={[-10, -12, -8]} intensity={0.6} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

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

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={3.2}
        maxDistance={14.0}
        rotateSpeed={0.8}
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
        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/60 rounded-2xl border border-red-500/30">
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

export function CubeScene() {
  const {
    stateString,
    setStickerColor,
    selectedColor,
    selectedStickerIndex,
    setSelectedStickerIndex,
    activeAnimation,
    completeCurrentAnimation,
  } = useCubeSolver()

  const controlsRef = useRef(null)
  const [activePreset, setActivePreset] = useState('Isometric')
  const [hoveredStickerIndex, setHoveredStickerIndex] = useState(null)

  const handleStickerClick = (stickerIdx) => {
    setSelectedStickerIndex(stickerIdx)
    setStickerColor(stickerIdx, selectedColor)
  }

  const setCameraPosition = (pos, name) => {
    setActivePreset(name)
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
  }

  const handleResetCamera = () => {
    setCameraPosition([3.8, 3.2, 4.5], 'Isometric')
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* 3D Canvas Viewport */}
      <WebGLErrorBoundary>
        <Suspense fallback={<LoadingSpinner message="Initializing 3D WebGL Canvas..." />}>
          <Canvas
            camera={{ position: [3.8, 3.2, 4.5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            className="cursor-grab active:cursor-grabbing w-full h-full"
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
            />
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>

      {/* Floating Camera Presets Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 pointer-events-auto shadow-lg overflow-x-auto max-w-[80%]">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setCameraPosition(preset.position, preset.label)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
                activePreset === preset.label
                  ? 'bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 pointer-events-auto shadow-lg transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interaction Hint & Target Badge */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[10px] font-mono text-slate-400">
        <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80 flex items-center gap-1.5 shadow-md">
          <Compass className="w-3 h-3 text-cyan-400" />
          Click to Paint • Drag to Rotate
        </span>

        {hoveredStickerIndex !== null && (
          <span className="px-2.5 py-1 rounded-lg bg-indigo-950/90 backdrop-blur-md border border-indigo-500/50 text-cyan-300 shadow-md">
            Sticker #{hoveredStickerIndex}
          </span>
        )}
      </div>
    </div>
  )
}
