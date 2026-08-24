import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { mapStateTo3DCubies } from '../../utils/cube3DMapping'
import { Cubie } from './Cubie'

// Cubic ease-in-out curve for natural physical turn acceleration/deceleration
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function RubiksCube3D({
  stateString,
  selectedStickerIndex,
  hoveredStickerIndex,
  activeAnimation,
  onAnimationComplete,
  onStickerClick,
  onStickerHover,
}) {
  const cubies = useMemo(() => {
    return mapStateTo3DCubies(stateString)
  }, [stateString])

  const layerGroupRef = useRef(null)
  const animProgressRef = useRef({
    elapsedMs: 0,
    isAnimating: false,
    currentStepIndex: null,
  })

  // Whenever activeAnimation changes, initialize or reset animation timing
  useEffect(() => {
    if (activeAnimation) {
      animProgressRef.current = {
        elapsedMs: 0,
        isAnimating: true,
        currentStepIndex: activeAnimation.stepIndex,
      }
      if (layerGroupRef.current) {
        layerGroupRef.current.rotation.set(0, 0, 0)
      }
    } else {
      animProgressRef.current.isAnimating = false
      if (layerGroupRef.current) {
        layerGroupRef.current.rotation.set(0, 0, 0)
      }
    }
  }, [activeAnimation])

  // R3F Animation Frame Loop
  useFrame((_, delta) => {
    if (!activeAnimation || !animProgressRef.current.isAnimating) return

    const { axis, targetAngle, durationMs = 380, stepIndex, targetState } = activeAnimation
    const anim = animProgressRef.current

    anim.elapsedMs += delta * 1000
    const rawProgress = Math.min(1.0, anim.elapsedMs / durationMs)
    const easedProgress = easeInOutCubic(rawProgress)
    const currentAngle = targetAngle * easedProgress

    if (layerGroupRef.current) {
      if (axis === 'x') {
        layerGroupRef.current.rotation.x = currentAngle
      } else if (axis === 'y') {
        layerGroupRef.current.rotation.y = currentAngle
      } else if (axis === 'z') {
        layerGroupRef.current.rotation.z = currentAngle
      }
    }

    // Animation completed
    if (rawProgress >= 1.0) {
      anim.isAnimating = false
      if (layerGroupRef.current) {
        layerGroupRef.current.rotation.set(0, 0, 0)
      }
      if (onAnimationComplete) {
        onAnimationComplete(stepIndex, targetState)
      }
    }
  })

  // Segregate cubies into static vs rotating based on active animation layer
  const { staticCubies, rotatingCubies } = useMemo(() => {
    if (!activeAnimation) {
      return { staticCubies: cubies, rotatingCubies: [] }
    }

    const { axis, layerCoord } = activeAnimation
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2

    const staticList = []
    const rotatingList = []

    for (const cubie of cubies) {
      if (cubie.position[axisIndex] === layerCoord) {
        rotatingList.push(cubie)
      } else {
        staticList.push(cubie)
      }
    }

    return { staticCubies: staticList, rotatingCubies: rotatingList }
  }, [cubies, activeAnimation])

  return (
    <group name="rubiks-cube-group">
      {/* Unaffected Static Cubies */}
      {staticCubies.map((cubie) => (
        <Cubie
          key={cubie.id}
          position={cubie.position}
          faceColors={cubie.faceColors}
          faceIndices={cubie.faceIndices}
          selectedStickerIndex={selectedStickerIndex}
          hoveredStickerIndex={hoveredStickerIndex}
          onStickerClick={onStickerClick}
          onStickerHover={onStickerHover}
        />
      ))}

      {/* Animated Rotating Layer Group */}
      {rotatingCubies.length > 0 && (
        <group ref={layerGroupRef} name="active-rotating-layer-group">
          {rotatingCubies.map((cubie) => (
            <Cubie
              key={cubie.id}
              position={cubie.position}
              faceColors={cubie.faceColors}
              faceIndices={cubie.faceIndices}
              selectedStickerIndex={selectedStickerIndex}
              hoveredStickerIndex={hoveredStickerIndex}
              onStickerClick={onStickerClick}
              onStickerHover={onStickerHover}
            />
          ))}
        </group>
      )}
    </group>
  )
}
