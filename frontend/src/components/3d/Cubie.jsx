import React, { useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { CUBIE_INNER_COLOR } from '../../utils/cube3DMapping'

// Material cache keyed by color + highlight state
const materialsCache = new Map()

function getMaterial(color, isSelected = false, isHovered = false) {
  const key = `${color}_sel:${isSelected}_hov:${isHovered}`
  if (materialsCache.has(key)) {
    return materialsCache.get(key)
  }

  const isInner = color === CUBIE_INNER_COLOR
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: isInner ? 0.85 : 0.25,
    metalness: isInner ? 0.05 : 0.15,
    flatShading: false,
    emissive: isSelected
      ? new THREE.Color('#38bdf8')
      : isHovered
      ? new THREE.Color('#ffffff')
      : new THREE.Color('#000000'),
    emissiveIntensity: isSelected ? 0.5 : isHovered ? 0.25 : 0.0,
  })

  materialsCache.set(key, material)
  return material
}

export function Cubie({
  position,
  faceColors,
  faceIndices,
  selectedStickerIndex,
  hoveredStickerIndex,
  onStickerClick,
  onStickerHover,
}) {
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

  const materials = useMemo(() => {
    return faceColors.map((col, i) => {
      const stickerIdx = faceIndexList[i]
      const isSelected = stickerIdx >= 0 && stickerIdx === selectedStickerIndex
      const isHovered = stickerIdx >= 0 && stickerIdx === hoveredStickerIndex
      return getMaterial(col, isSelected, isHovered)
    })
  }, [faceColors, faceIndexList, selectedStickerIndex, hoveredStickerIndex])

  const handleClick = useCallback((e) => {
    if (!e.face || e.face.materialIndex === undefined) return
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
    <mesh
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 0.94 scale creates clean 0.06 sticker gaps between cubies */}
      <boxGeometry args={[0.94, 0.94, 0.94]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  )
}
