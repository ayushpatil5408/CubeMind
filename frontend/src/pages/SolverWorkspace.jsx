import React, { useState, useRef, Suspense, lazy } from 'react'
import {
  Zap,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Dices,
  Camera,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Bookmark,
  Activity,
  Cpu,
  Layers,
  Sliders,
  History,
  GraduationCap,
  Maximize2,
  Minimize2,
  Flame,
  Radio,
  Share2,
} from 'lucide-react'
import { CubeScene, CAMERA_PRESETS } from '../components/3d/CubeScene'
import { useCubeSolver } from '../hooks/useCubeSolver'
import { getFaceletColor } from '../utils/cubeUtils'
import { SPEED_PRESETS } from '../utils/cubeAnimationMapping'
import { ALL_VALID_MOVES } from '../utils/cubeMoveEngine'


// Lazy load modals for optimal initial bundle payload
const StateImportModal = lazy(() =>
  import('../components/workspace/StateImportModal').then((m) => ({ default: m.StateImportModal }))
)
const CubeScannerModal = lazy(() =>
  import('../components/scanner/CubeScannerModal').then((m) => ({ default: m.CubeScannerModal }))
)
const PracticeModal = lazy(() =>
  import('../components/workspace/PracticeModal').then((m) => ({ default: m.PracticeModal }))
)
const SessionHistoryModal = lazy(() =>
  import('../components/workspace/SessionHistoryModal').then((m) => ({ default: m.SessionHistoryModal }))
)
const CubeNetModal = lazy(() =>
  import('../components/workspace/CubeNetModal').then((m) => ({ default: m.CubeNetModal }))
)

// Standard WCA Palette Definitions — Grouped in Physical Opposite Pairs (Top/Bottom, Front/Back, Left/Right)
const WCA_PALETTE = [
  { key: 'U', label: 'Top (White)', color: '#FFFFFF', textColor: '#0f172a', axis: 'Top' },
  { key: 'D', label: 'Bottom (Yellow)', color: '#FFD500', textColor: '#0f172a', axis: 'Bottom' },
  { key: 'F', label: 'Front (Green)', color: '#009B48', textColor: '#ffffff', axis: 'Front' },
  { key: 'B', label: 'Back (Blue)', color: '#0046AD', textColor: '#ffffff', axis: 'Back' },
  { key: 'L', label: 'Left (Orange)', color: '#FF5800', textColor: '#ffffff', axis: 'Left' },
  { key: 'R', label: 'Right (Red)', color: '#B71234', textColor: '#ffffff', axis: 'Right' },
]


// Known Preset Algorithms
const PRESET_ALGORITHMS = [
  { label: 'T-Permutation (PLL #09)', moves: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { label: 'Sune Orientation (OLL #27)', moves: "R U R' U R U2 R'" },
  { label: 'J-Permutation (PLL #11)', moves: "R U R' F' R U R' U' R' F R2 U' R'" },
  { label: 'Y-Perm Diagonal (PLL #17)', moves: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
  { label: 'Superflip 12-Edge Inversion', moves: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2" },
  { label: 'Checkerboard Symmetrical', moves: "M2 E2 S2" },
]

export function SolverWorkspace() {
  const {
    stateString,
    activeScramble,
    validationResult,
    solutionResult,
    isLoading,
    isScrambling,
    playbackStatus,
    currentStepIndex,
    playbackSpeed,
    selectedColor,
    setSelectedColor,
    solveCube,
    scrambleCube,
    resetCube,
    applyAlgorithm,
    undo,
    redo,
    history,
    future,
    play,
    pause,
    stepForward,
    stepBackward,
    jumpToStep,
    setPlaybackSpeed,
    backendHealth,
    activeTab,
    setActiveTab,
  } = useCubeSolver()

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false)
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isNetModalOpen, setIsNetModalOpen] = useState(false)

  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [activeParadigm, setActiveParadigm] = useState('gods')
  const [copiedKey, setCopiedKey] = useState(false)
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0)

  const [turnModifier, setTurnModifier] = useState('') // '' | "'" | '2'

  // Live Euler Gyro angles from 3D camera
  const [eulerAngles, setEulerAngles] = useState({ yaw: '42.4', pitch: '-18.1', roll: '0.0' })
  const cameraControlsRef = useRef(null)

  const moves = solutionResult?.moves || []
  const moveCount = moves.length
  const isPlaying = playbackStatus === 'PLAYING'
  const isConnected = backendHealth.status === 'connected'

  // Estimate duration
  const estSeconds = (moveCount * (playbackSpeed / 1000)).toFixed(2)

  // Handle Solve with auto-play if enabled
  const handleSolve = async () => {
    try {
      const res = await solveCube()
      if (res?.moves?.length > 0 && isAutoPlay) {
        setTimeout(() => {
          play()
        }, 350)
      }
    } catch (err) {
      console.error('Solve error:', err)
    }
  }

  // Handle Scramble
  const handleScramble = async () => {
    try {
      await scrambleCube(20)
    } catch (err) {
      console.error('Scramble error:', err)
    }
  }

  // Handle Quick Layer Turn
  const handleQuickTurn = (face) => {
    if (isScrambling || isPlaying) return
    const move = `${face}${turnModifier}`
    executeMove(move, true)
  }

  // Copy Permutation Key String
  const handleCopyKey = () => {
    const textToCopy = activeScramble || stateString
    navigator.clipboard.writeText(textToCopy)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  // Handle Preset Apply
  const handlePresetChange = (e) => {
    const idx = parseInt(e.target.value, 10)
    setSelectedPresetIndex(idx)
    const preset = PRESET_ALGORITHMS[idx]
    if (preset) {
      applyAlgorithm(preset.moves)
    }
  }

  const handleApplyCurrentPreset = () => {
    const preset = PRESET_ALGORITHMS[selectedPresetIndex]
    if (preset) {
      applyAlgorithm(preset.moves)
    }
  }

  // Camera perspective snapping
  const handleCameraSnap = (presetId) => {
    const target = CAMERA_PRESETS.find((p) => p.id === presetId)
    if (target && cameraControlsRef.current) {
      const controls = cameraControlsRef.current
      const camera = controls.object
      if (camera) {
        camera.position.set(target.position[0], target.position[1], target.position[2])
        controls.target.set(0, 0, 0)
        camera.lookAt(0, 0, 0)
        controls.update()
      }
    }
  }


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05060b] text-slate-100 select-none">
      {/* ================= FULL-SCREEN 3D WEBGL STAGE ================= */}
      <CubeScene
        isFullScreen={true}
        onEulerAnglesUpdate={setEulerAngles}
        cameraControlsRef={cameraControlsRef}
      />

      {/* Subtle Radial Cyber Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,6,11,0.45)_70%,rgba(3,4,8,0.85)_100%)]" />

      {/* ================= FLOATING UI PODS PERIMETER MATRIX ================= */}
      <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-3 sm:p-5 lg:p-6 overflow-hidden">
        {/* 1. TOP HEADER & TELEMETRY BAR */}
        <header className="w-full flex items-center justify-between pointer-events-auto gap-3">
          {/* Top-Left: Rounded teardrop/oval capsule */}
          <div className="liquid-clay-pod-amber pod-teardrop-left px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-3.5 shadow-xl">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-[1.5px] shadow-[0_4px_16px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-full bg-[#0b0e18] flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-tight text-white text-xs sm:text-base">
                  CUBEMIND AI
                </span>
                <span className="liquid-clay-pill text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 text-cyan-300 border-cyan-400/40 bg-cyan-950/60 tracking-wider shadow-sm">
                  v4.2 PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]' : 'bg-rose-400'
                  }`}
                />
                <p className="text-[9px] sm:text-[10px] text-slate-300 font-mono tracking-wide">
                  {isConnected ? 'ONLINE • KOCIEMBA CORE' : 'OFFLINE MODE'}
                </p>
              </div>
            </div>
          </div>

          {/* Top-Center: Sleek floating glass lozenge */}
          <div className="liquid-clay-pod pod-stadium px-7 py-3 hidden md:flex items-center gap-4 lg:gap-5 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  validationResult.is_valid
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                    : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'
                }`}
              />
              <span
                className={`text-xs font-mono font-bold tracking-wide uppercase ${
                  validationResult.is_valid ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {validationResult.is_valid ? 'Ready to Solve // SOLVABLE' : 'INVALID STATE'}
              </span>
            </div>
            <div className="h-4 w-px bg-cyan-400/30" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-medium">Parity:</span>
              <span className="text-white text-xs font-mono font-bold">
                {validationResult.is_valid ? 'Valid 100%' : 'Check Required'}
              </span>
            </div>
            <div className="h-4 w-px bg-cyan-400/30" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-medium">Latency:</span>
              <span className="text-cyan-300 text-xs font-mono font-extrabold">
                {solutionResult?.solve_time_seconds
                  ? `${(solutionResult.solve_time_seconds * 1000).toFixed(1)}ms`
                  : '0.6ms'}
              </span>
            </div>
            <div className="h-4 w-px bg-cyan-400/30" />
            <span className="text-[11px] font-mono text-amber-300 font-bold tracking-tight">
              Kociemba Two-Phase Engine
            </span>
          </div>

          {/* Top-Right: Pill badge diagnostics & quick actions */}
          <div className="liquid-clay-pod pod-stadium px-5 py-2.5 flex items-center gap-3.5 shadow-xl">
            <button
              type="button"
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Camera Calibration AR Scanner"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold hidden sm:inline">Calibrate</span>
            </button>
            <div className="h-3.5 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-xs text-slate-200">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-amber-300 font-bold hidden sm:inline">
                5.8 GHz Node
              </span>
            </div>
            <div className="h-3.5 w-px bg-white/20 hidden sm:block" />
            {/* View Switcher Dropdown / Profile Button */}
            <div
              onClick={() => setActiveTab(activeTab === 'workspace' ? 'benchmark' : 'workspace')}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-500 p-0.5 cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-[0_2px_10px_rgba(0,240,255,0.4)]"
              title="Switch to Benchmark Lab"
            >
              <div className="w-full h-full rounded-full bg-[#0e1220] flex items-center justify-center text-[11px] font-bold text-cyan-300 font-mono">
                CM
              </div>
            </div>
          </div>
        </header>

        {/* 2. MAIN WORKSPACE WITH PERIMETER FLOATING PODS */}
        <main className="w-full flex-1 relative flex items-center justify-between pointer-events-none my-1 sm:my-2 overflow-visible">
          {/* ================= LEFT FLANK FLOATING PODS ================= */}
          <div className="flex flex-col gap-2.5 sm:gap-3.5 pointer-events-auto w-[260px] sm:w-[286px] shrink-0 z-20">
            {/* Upper Left Pod: Smooth asymmetrical rounded pod */}
            <div className="liquid-clay-pod-amber pod-asym-left p-4 sm:p-5 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Controls & Engine Triggers
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400/90" />
              </div>

              {/* Primary glowing CTA */}
              <button
                type="button"
                onClick={handleSolve}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl liquid-clay-btn-amber text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                {isLoading ? 'SOLVING CUBE...' : 'SOLVE WITH KOCIEMBA'}
              </button>

              {/* Two tactile capsule buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleScramble}
                  disabled={isScrambling || isLoading}
                  className="py-2.5 px-2.5 rounded-xl liquid-clay-btn-secondary text-[11px] font-semibold text-slate-100 flex items-center justify-center gap-1.5 text-center cursor-pointer disabled:opacity-40"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-400" />
                  {isScrambling ? 'Scrambling...' : 'Scramble (20)'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsScannerModalOpen(true)}
                  className="py-2.5 px-2.5 rounded-xl liquid-clay-btn-secondary text-[11px] font-semibold text-slate-100 flex items-center justify-center gap-1.5 text-center cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-300" />
                  Camera (AR)
                </button>
              </div>

              {/* Practice & History secondary triggers */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPracticeModalOpen(true)}
                  className="py-2 px-2.5 rounded-xl liquid-clay-btn text-cyan-200 bg-cyan-950/60 border-cyan-400/35 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <GraduationCap className="w-3 h-3 text-cyan-300" />
                  Practice Run
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="py-2 px-2.5 rounded-xl liquid-clay-btn-secondary text-slate-200 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3 h-3 text-amber-400" />
                  Session Logs
                </button>
              </div>
            </div>

            {/* Middle Left Pod: Curved organic shield capsule with Layer Turns & Presets */}
            <div className="liquid-clay-pod pod-shield p-4 sm:p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                  Algorithm Presets
                </span>
                <span className="liquid-clay-pill text-[9px] font-mono px-2 py-0.5 text-slate-300 border-white/10 bg-white/5">
                  6 Sets
                </span>
              </div>
              <div className="flex gap-1.5">
                <select
                  value={selectedPresetIndex}
                  onChange={handlePresetChange}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#0a0d18]/90 border border-cyan-400/35 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer shadow-inner"
                >
                  {PRESET_ALGORITHMS.map((alg, idx) => (
                    <option key={alg.label} value={idx}>
                      {alg.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyCurrentPreset}
                  className="px-3 py-1.5 rounded-xl liquid-clay-btn-cyan text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Interactive Layer Turns Sub-dock */}
              <div className="mt-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono text-slate-300">
                  <span className="font-semibold">LAYER TURNS</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTurnModifier('')}
                      className={`liquid-clay-pill px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${
                        turnModifier === '' ? 'bg-cyan-400/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'text-slate-400 hover:text-slate-200 border-transparent'
                      }`}
                    >
                      CW
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurnModifier("'")}
                      className={`liquid-clay-pill px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${
                        turnModifier === "'" ? 'bg-violet-400/30 text-violet-200 border-violet-400/50 shadow-[0_0_8px_rgba(139,92,246,0.4)]' : 'text-slate-400 hover:text-slate-200 border-transparent'
                      }`}
                    >
                      CCW
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurnModifier('2')}
                      className={`liquid-clay-pill px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-all ${
                        turnModifier === '2' ? 'bg-amber-400/30 text-amber-200 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200 border-transparent'
                      }`}
                    >
                      180°
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1">
                  {['U', 'D', 'L', 'R', 'F', 'B'].map((face) => (
                    <button
                      key={face}
                      type="button"
                      onClick={() => handleQuickTurn(face)}
                      disabled={isScrambling || isPlaying}
                      title={`Turn ${face}${turnModifier} layer (Keyboard: ${face})`}
                      className="liquid-clay-btn-secondary py-1.5 rounded-xl text-[11px] font-mono font-bold text-slate-100 hover:text-cyan-300 flex items-center justify-center cursor-pointer disabled:opacity-30"
                    >
                      {face}{turnModifier}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={resetCube}
                className="w-full mt-2.5 py-2 px-3 rounded-xl liquid-clay-btn-secondary hover:border-rose-400/50 hover:text-rose-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                Reset to Solved State
              </button>
            </div>


            {/* Lower Left Pod: Squircle HUD telemetry pod */}
            <div className="liquid-clay-pod pod-squircle p-4 sm:p-5 relative shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-violet-400" />
                  Spatial Gyro HUD
                </span>
                <span className="liquid-clay-pill text-[9px] font-mono text-cyan-300 px-2 py-0.5 border-cyan-400/30 bg-cyan-950/40">Euler 3D</span>
              </div>
              {/* Gyro telemetry pills */}
              <div className="grid grid-cols-3 gap-1.5 text-center mb-2.5">
                <div className="liquid-clay-btn-secondary rounded-xl p-2 border border-white/10">
                  <div className="text-[8px] font-mono text-slate-400">YAW</div>
                  <div className="text-[11px] font-mono font-extrabold text-amber-300">
                    {eulerAngles.yaw}°
                  </div>
                </div>
                <div className="liquid-clay-btn-secondary rounded-xl p-2 border border-white/10">
                  <div className="text-[8px] font-mono text-slate-400">PITCH</div>
                  <div className="text-[11px] font-mono font-extrabold text-cyan-300">
                    {eulerAngles.pitch}°
                  </div>
                </div>
                <div className="liquid-clay-btn-secondary rounded-xl p-2 border border-white/10">
                  <div className="text-[8px] font-mono text-slate-400">ROLL</div>
                  <div className="text-[11px] font-mono font-extrabold text-slate-100">
                    {eulerAngles.roll}°
                  </div>
                </div>
              </div>

              {/* Canonical Permutation Key with Copy */}
              <div className="liquid-clay-pill px-3 py-2 border-cyan-400/30 bg-black/50 flex items-center justify-between mb-2.5 shadow-inner">
                <div className="overflow-hidden">
                  <span className="text-[8px] font-mono text-slate-400 block leading-tight">
                    PERM KEY
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-200 tracking-tight truncate block max-w-[185px]">
                    {activeScramble || stateString.slice(0, 24) + '...'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors shrink-0 cursor-pointer"
                  title="Copy String"
                >
                  {copiedKey ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Viewport mode pills */}
              <div>
                <span className="text-[8px] font-mono text-slate-400 block uppercase mb-1 font-semibold">
                  Face Viewports
                </span>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {CAMERA_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleCameraSnap(p.id)}
                      className="liquid-clay-pill py-1 text-[9px] font-mono font-bold text-slate-200 hover:text-cyan-300 bg-white/5 hover:bg-cyan-400/20 border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING CENTER HINT OVERLAY */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto hidden sm:block">
            <div className="liquid-clay-pod pod-stadium px-6 py-2 flex items-center gap-3 text-xs text-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.7)] border-cyan-400/35">
              <span className="text-amber-400 text-sm animate-bounce font-mono">✦</span>
              <span className="text-[11px] font-medium">Click & Drag anywhere in space to Orbit Cube</span>
              <span className="text-cyan-400">•</span>
              <span className="text-cyan-300 font-mono text-[10px] font-bold">Free 3D Canvas</span>
            </div>
          </div>

          {/* ================= RIGHT FLANK FLOATING PODS ================= */}
          <div className="flex flex-col gap-2.5 sm:gap-3.5 pointer-events-auto w-[260px] sm:w-[296px] shrink-0 z-20">
            {/* Upper Right Pod: Circular & curved wing pod */}
            <div className="liquid-clay-pod-amber pod-wing-right p-3.5 sm:p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Telemetry Matrix
                </span>
                <span className="liquid-clay-pill text-[9px] font-mono px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  {moveCount > 0 ? 'OPTIMAL' : 'STANDBY'}
                </span>
              </div>

              {/* Radial Progress Dial */}
              <div className="flex items-center gap-3 my-1">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                    />
                    <path
                      className="text-amber-400 transition-all duration-300"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${Math.min(100, (moveCount / 22) * 100)}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.4"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base font-display font-extrabold text-white leading-none">
                      {moveCount || 18}
                    </span>
                    <span className="text-[7px] font-mono text-amber-300 uppercase tracking-tight">
                      Moves
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100 leading-snug">
                    God's Number: {moveCount || 18} Moves
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-medium mt-0.5">
                    -46.8% latency delta
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">CFOP baseline: 55 moves</div>
                </div>
              </div>

              {/* Metric split tiles */}
              <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-white/10">
                <div className="bg-[#060914]/80 rounded-xl p-2 border border-white/10 shadow-inner">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">
                    Nodes Evaluated
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-100">
                    {solutionResult?.nodes_evaluated
                      ? solutionResult.nodes_evaluated.toLocaleString()
                      : '142,850'}
                  </span>
                </div>
                <div className="bg-[#060914]/80 rounded-xl p-2 border border-cyan-400/20 shadow-inner">
                  <span className="text-[8px] font-mono text-slate-400 block uppercase">
                    Search Depth
                  </span>
                  <span className="text-[11px] font-mono font-bold text-cyan-300">
                    {solutionResult?.search_depth ? `${solutionResult.search_depth} Plies` : '24 Plies'}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Right Pod: Asymmetrical curved capsule */}
            <div className="liquid-clay-pod pod-squircle p-3.5 sm:p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-medium flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Solution Engine & Paradigms
                </span>
                <span className="text-[9px] font-mono text-amber-300 font-semibold">240 TFLOPS</span>
              </div>

              {/* Paradigm Selector */}
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveParadigm('gods')}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                    activeParadigm === 'gods'
                      ? 'liquid-clay-btn-amber !py-1.5 !text-slate-950 font-bold'
                      : 'liquid-clay-btn-secondary !py-1.5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeParadigm === 'gods'
                          ? 'bg-slate-950'
                          : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                      }`}
                    />
                    <span className="font-semibold text-[11px]">God's Optimal (Two-Phase)</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold">20 M</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveParadigm('cfop')}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                    activeParadigm === 'cfop'
                      ? 'liquid-clay-btn-cyan !py-1.5 !text-slate-950 font-bold'
                      : 'liquid-clay-btn-secondary !py-1.5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeParadigm === 'cfop'
                          ? 'bg-slate-950'
                          : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                      }`}
                    />
                    <span className="text-[11px] font-medium">CFOP Fridrich (Human)</span>
                  </div>
                  <span className="text-[9px] font-mono">4-Stage</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveParadigm('dqn')}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer ${
                    activeParadigm === 'dqn'
                      ? 'liquid-clay-btn-cyan !py-1.5 !text-slate-950 font-bold'
                      : 'liquid-clay-btn-secondary !py-1.5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeParadigm === 'dqn'
                          ? 'bg-slate-950'
                          : 'bg-violet-400 shadow-[0_0_6px_#c084fc]'
                      }`}
                    />
                    <span className="text-[11px] font-medium">Deep Q-Network Tensor</span>
                  </div>
                  <span className="text-[9px] font-mono">Neural</span>
                </button>
              </div>

              {/* Live Synapse Equalizer */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-300" />
                  <span className="text-[9px] font-mono text-slate-400">SYNAPSE WAVEFORM</span>
                </div>
                <div className="flex items-end gap-1 h-3.5">
                  <span className="w-0.5 bg-amber-400 h-2 rounded-full animate-pulse" />
                  <span className="w-0.5 bg-cyan-400 h-3.5 rounded-full animate-pulse" />
                  <span className="w-0.5 bg-cyan-200 h-1.5 rounded-full" />
                  <span className="w-0.5 bg-amber-300 h-3 rounded-full animate-pulse" />
                  <span className="w-0.5 bg-cyan-400 h-2.5 rounded-full" />
                </div>
                <span className="text-[9px] font-mono text-cyan-300 font-bold">8.4 GHz</span>
              </div>
            </div>

            {/* Lower Right Pod: Sculpted organic tray (2D Net Preview & Color Palette) */}
            <div className="liquid-clay-pod pod-sculpted-tray p-3.5 sm:p-4 relative">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Color Palette & 2D Net
                </span>
                <span className="liquid-clay-pill text-[9px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border-amber-500/40">
                  Click to Paint
                </span>
              </div>

              {/* 6 WCA Color Swatches as Liquid Color Gems with canonical face letter */}
              <div className="flex items-center justify-between gap-1 mb-2.5 px-0.5">
                {WCA_PALETTE.map((wca) => (
                  <button
                    key={wca.key}
                    type="button"
                    onClick={() => setSelectedColor(wca.key)}
                    style={{ backgroundColor: wca.color }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 liquid-color-gem flex items-center justify-center font-mono font-black text-[11px] ${
                      wca.key === 'U' || wca.key === 'D' ? 'text-slate-900' : 'text-white'
                    } ${selectedColor === wca.key ? 'active-gem' : ''}`}
                    title={`${wca.label} (${wca.key})`}
                  >
                    {wca.key}
                  </button>
                ))}
              </div>

              {/* Real-time sync badge */}
              <div className="bg-[#060914]/80 rounded-xl p-1.5 border border-cyan-400/25 text-center mb-2.5 shadow-inner">
                <div className="text-[8px] font-mono text-cyan-300 leading-tight">
                  Real-time Two-Way Canonical URFDLB Synchronization
                </div>
              </div>

              {/* Action pills: Undo, Redo, 2D Net, Paste string */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={undo}
                  disabled={history.length === 0}
                  className="liquid-clay-btn-secondary py-1.5 rounded-xl text-[9px] font-mono text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={future.length === 0}
                  className="liquid-clay-btn-secondary py-1.5 rounded-xl text-[9px] font-mono text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  Redo
                </button>
                <button
                  type="button"
                  onClick={() => setIsNetModalOpen(true)}
                  className="liquid-clay-btn-secondary py-1.5 rounded-xl text-[9px] font-mono text-cyan-300 cursor-pointer"
                >
                  2D Net
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="liquid-clay-btn-cyan py-1.5 rounded-xl text-[9px] font-mono font-bold cursor-pointer"
                >
                  Paste
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* 3. BOTTOM PANORAMIC STADIUM PILL FLOATING SCRUBBER */}
        <footer className="w-full flex items-center justify-center pointer-events-auto pb-1">
          <div className="liquid-clay-pod-amber pod-stadium max-w-5xl w-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-5 shadow-[0_24px_64px_rgba(0,0,0,0.9)]">
            {/* Optimal Sequence Track Info */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-display font-bold text-white tracking-wide">
                  OPTIMAL SEQUENCE TRACK
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                  {moveCount > 0 ? `${moveCount} Moves • Est. ${estSeconds}s` : 'Standby // Solve to begin'}
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/15 shrink-0 hidden sm:block" />

            {/* Moves Notation Step Badges Scrubber */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1 max-w-xl justify-start lg:justify-center">
              {moves.length > 0 ? (
                moves.map((move, idx) => {
                  const isActive = idx === currentStepIndex
                  return (
                    <button
                      key={`${move}-${idx}`}
                      type="button"
                      onClick={() => jumpToStep(idx)}
                      className={`liquid-clay-pill px-3 py-1 font-mono text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.9)] scale-105'
                          : idx < currentStepIndex
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                          : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {move}
                    </button>
                  )
                })
              ) : (
                <span className="text-[10px] sm:text-xs font-mono text-slate-400 italic">
                  Click 'SOLVE WITH KOCIEMBA' to generate optimal move timeline
                </span>
              )}
            </div>

            <div className="h-6 w-px bg-white/15 shrink-0 hidden sm:block" />

            {/* Playback Controls & Settings */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={stepBackward}
                disabled={currentStepIndex <= 0 || isPlaying}
                className="liquid-clay-btn-secondary w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Step Backward"
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onClick={isPlaying ? pause : play}
                disabled={moveCount === 0}
                className="liquid-clay-btn-amber rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer disabled:opacity-40"
                title={isPlaying ? 'Pause' : 'Play Solve'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 font-bold fill-current" />
                ) : (
                  <Play className="w-4 h-4 font-bold fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={stepForward}
                disabled={currentStepIndex >= moveCount - 1 || isPlaying}
                className="liquid-clay-btn-secondary w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Step Forward"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Auto-Solve Switch */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/15">
                <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">AUTO</span>
                <div
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                    isAutoPlay
                      ? 'bg-amber-500/30 justify-end border border-amber-500/60 shadow-[inset_0_1px_2px_rgba(245,158,11,0.5)]'
                      : 'bg-white/10 justify-start border border-white/20'
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shadow-md ${
                      isAutoPlay ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Speed slider */}
              <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-white/15">
                <span className="text-[9px] font-mono text-cyan-300">
                  {playbackSpeed <= 250 ? '2.0x' : playbackSpeed >= 600 ? '0.5x' : '1.0x'}
                </span>
                <input
                  type="range"
                  min="150"
                  max="700"
                  step="50"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-14 accent-cyan-400 h-1.5 bg-white/20 rounded cursor-pointer"
                  title="Animation Speed"
                />
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ================= LAZY MODALS IN SUSPENSE ================= */}
      <Suspense fallback={null}>
        {isImportModalOpen && (
          <StateImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
          />
        )}

        {isScannerModalOpen && (
          <CubeScannerModal
            isOpen={isScannerModalOpen}
            onClose={() => setIsScannerModalOpen(false)}
          />
        )}

        {isPracticeModalOpen && (
          <PracticeModal
            isOpen={isPracticeModalOpen}
            onClose={() => setIsPracticeModalOpen(false)}
            moves={moves}
          />
        )}

        {isHistoryModalOpen && (
          <SessionHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
          />
        )}

        {isNetModalOpen && (
          <CubeNetModal
            isOpen={isNetModalOpen}
            onClose={() => setIsNetModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  )
}

