import React, { useMemo, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { CUBIE_INNER_COLOR } from '../../utils/cube3DMapping'

// Material cache keyed by color + highlight state
const materialsCache = new Map()

const interiorMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#050914'),
  roughness: 0.15,
  metalness: 0.8,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  transparent: true,
  opacity: 0.88,
})

function getMaterial(color, isSelected = false, isHovered = false) {
  const isInner = color === CUBIE_INNER_COLOR
  if (isInner) {
    return interiorMaterial
  }

  const key = `${color}_sel:${isSelected}_hov:${isHovered}`
  if (materialsCache.has(key)) {
    return materialsCache.get(key)
  }

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
    shininess: 100,
    emissive: isSelected
      ? new THREE.Color('#00f0ff')
      : isHovered
      ? new THREE.Color('#38bdf8')
      : new THREE.Color(color),
    emissiveIntensity: isSelected ? 0.7 : isHovered ? 0.45 : 0.12,
  })

  materialsCache.set(key, material)
  return material
}

// Reusable Box and Edges Geometries (Piece size 0.92)
const sharedBoxGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92)
const sharedEdgesGeo = new THREE.EdgesGeometry(sharedBoxGeo)

export function Cubie({
  position,
  faceColors,
  faceIndices,
  selectedStickerIndex,
  hoveredStickerIndex,
  onStickerClick,
  onStickerHover,
}) {
  const pointerDownRef = useRef({ x: 0, y: 0, time: 0 })

  // Order: [+X (RIGHT), -X (LEFT), +Y (UP), -Y (DOWN), +Z (FRONT), -Z (BACK)]
  const faceIndexList = useMemo(() => {
    return [
      faceIndices?.RIGHT ?? -1,
      faceIndices?.LEFT ?? -1,
      faceIndices?.UP ?? -1,
      faceIndices?.DOWN ?? -1,
      faceIndices?.FRONT ?? -1,
      faceIndices?.BACK ?? -1,
    ]
  }, [faceIndices])

  const isAnySelected = useMemo(() => {
    return selectedStickerIndex !== null && faceIndexList.includes(selectedStickerIndex)
  }, [faceIndexList, selectedStickerIndex])

  const isAnyHovered = useMemo(() => {
    return hoveredStickerIndex !== null && faceIndexList.includes(hoveredStickerIndex)
  }, [faceIndexList, hoveredStickerIndex])

  const materials = useMemo(() => {
    return faceColors.map((col, i) => {
      const stickerIdx = faceIndexList[i]
      const isSelected = stickerIdx >= 0 && stickerIdx === selectedStickerIndex
      const isHovered = stickerIdx >= 0 && stickerIdx === hoveredStickerIndex
      return getMaterial(col, isSelected, isHovered)
    })
  }, [faceColors, faceIndexList, selectedStickerIndex, hoveredStickerIndex])

  // Neon Edge Wireframe Material (Stitch Cyber Aesthetic)
  const edgeMaterial = useMemo(() => {
    const color = isAnySelected ? '#00f0ff' : isAnyHovered ? '#38bdf8' : '#00f0ff'
    const opacity = isAnySelected ? 0.95 : isAnyHovered ? 0.75 : 0.28
    return new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      linewidth: isAnySelected || isAnyHovered ? 2 : 1,
    })
  }, [isAnySelected, isAnyHovered])

  const handlePointerDown = useCallback((e) => {
    pointerDownRef.current = {
      x: e.clientX ?? 0,
      y: e.clientY ?? 0,
      time: Date.now(),
    }
  }, [])

  const handleClick = useCallback((e) => {
    if (!e.face || e.face.materialIndex === undefined) return
    
    // Distinguish camera drag orbit from intentional sticker click
    const startX = pointerDownRef.current.x
    const startY = pointerDownRef.current.y
    const endX = e.clientX ?? startX
    const endY = e.clientY ?? startY
    const dist = Math.hypot(endX - startX, endY - startY)
    const duration = Date.now() - pointerDownRef.current.time

    if (dist > 6 || duration > 600) {
      return
    }

    const matIdx = e.face.materialIndex
    const stickerIdx = faceIndexList[matIdx]
    if (stickerIdx >= 0 && onStickerClick) {
      e.stopPropagation()
      onStickerClick(stickerIdx)
    }
  }, [faceIndexList, onStickerClick])

  const handlePointerOver = useCallback((e) => {
    if (!e.face || e.face.materialIndex === undefined) return
    const matIdx = e.face.materialIndex
    const stickerIdx = faceIndexList[matIdx]
    if (stickerIdx >= 0 && onStickerHover) {
      e.stopPropagation()
      onStickerHover(stickerIdx)
    }
  }, [faceIndexList, onStickerHover])

  const handlePointerOut = useCallback((e) => {
    if (onStickerHover) {
      onStickerHover(null)
    }
  }, [onStickerHover])

  return (
    <group position={position}>
      <mesh
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
        geometry={sharedBoxGeo}
      >
        {materials.map((mat, i) => (
          <primitive key={i} object={mat} attach={`material-${i}`} />
        ))}
      </mesh>

      {/* Holographic luminescent neon edges (Stitch design) */}
      <lineSegments geometry={sharedEdgesGeo} material={edgeMaterial} />
    </group>
  )
}
