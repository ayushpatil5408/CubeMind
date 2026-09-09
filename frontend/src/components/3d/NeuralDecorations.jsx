import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 1. Gyroscopic Holographic Orbital Rings (Solar Amber + Iris Violet + Cyan)
export function NeuralOrbitalRings() {
  const ring1Ref = useRef(null)
  const ring2Ref = useRef(null)
  const ring3Ref = useRef(null)

  useFrame((_, delta) => {
    const factor = delta * 60
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.004 * factor
      ring1Ref.current.rotation.y += 0.002 * factor
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.0035 * factor
      ring2Ref.current.rotation.x += 0.002 * factor
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += 0.0025 * factor
    }
  })

  return (
    <group name="neural-orbital-rings-group">
      {/* Solar Amber Primary Orbital Ring */}
      <mesh
        ref={ring1Ref}
        rotation={[Math.PI / 2.3, 0, 0]}
      >
        <torusGeometry args={[3.6, 0.018, 16, 120]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Iris Violet Outer Orbital Ring */}
      <mesh
        ref={ring2Ref}
        rotation={[-Math.PI / 3.2, Math.PI / 4, 0]}
      >
        <torusGeometry args={[4.6, 0.016, 16, 120]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Quantum Cyan Concentric Perimeter Ring */}
      <mesh
        ref={ring3Ref}
        rotation={[Math.PI / 4, -Math.PI / 5, Math.PI / 6]}
      >
        <torusGeometry args={[5.4, 0.012, 16, 120]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// 2. Floating Neural Decision Nodes and Synaptic Laser Lines
const NODE_COUNT = 24

export function SynapticNodesAndLines() {
  const nodeGroupRef = useRef(null)
  const lineGeoRef = useRef(null)

  // Initialize spherical Fibonacci distribution
  const nodeData = useMemo(() => {
    const list = []
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / NODE_COUNT)
      const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi
      const radius = 3.2 + Math.sin(i * 1.5) * 0.9

      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(phi)

      const color = i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#f59e0b' : '#8b5cf6'

      list.push({
        origin: [x, y, z],
        color,
        phase: (i * 1.3) % (Math.PI * 2),
      })
    }
    return list
  }, [])

  const initialLinePositions = useMemo(() => {
    return new Float32Array(NODE_COUNT * 6)
  }, [])

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()

    if (nodeGroupRef.current && lineGeoRef.current) {
      const posArray = lineGeoRef.current.attributes.position.array
      const children = nodeGroupRef.current.children

      for (let i = 0; i < NODE_COUNT; i++) {
        const nodeMesh = children[i]
        const data = nodeData[i]
        if (!nodeMesh || !data) continue

        const [ox, oy, oz] = data.origin
        const wave = Math.sin(elapsed * 1.8 + data.phase) * 0.18

        const nx = ox + wave * 0.4
        const ny = oy + wave * 0.28
        const nz = oz + wave * 0.4

        nodeMesh.position.set(nx, ny, nz)

        // Synaptic laser from center to node
        const ptr = i * 6
        posArray[ptr] = 0
        posArray[ptr + 1] = 0
        posArray[ptr + 2] = 0
        posArray[ptr + 3] = nx
        posArray[ptr + 4] = ny
        posArray[ptr + 5] = nz
      }

      lineGeoRef.current.attributes.position.needsUpdate = true
    }
  })

  return (
    <group name="synaptic-network-group">
      {/* Laser Connections */}
      <lineSegments>
        <bufferGeometry ref={lineGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[initialLinePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Floating Node Spheres */}
      <group ref={nodeGroupRef}>
        {nodeData.map((node, i) => (
          <mesh key={i} position={node.origin}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color={node.color} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// 3. Ambient Floating & Revolving Quantum Particles Swarm
const PARTICLE_COUNT = 280

export function QuantumParticleDust() {
  const particlesRef = useRef(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const col = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18

      const choice = Math.random()
      if (choice < 0.4) {
        // Quantum Cyan
        col[i * 3] = 0.0
        col[i * 3 + 1] = 0.94
        col[i * 3 + 2] = 1.0
      } else if (choice < 0.7) {
        // Solar Amber
        col[i * 3] = 0.98
        col[i * 3 + 1] = 0.65
        col[i * 3 + 2] = 0.1
      } else {
        // Iris Violet
        col[i * 3] = 0.55
        col[i * 3 + 1] = 0.36
        col[i * 3 + 2] = 0.96
      }
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const factor = delta * 60
      particlesRef.current.rotation.y += 0.0007 * factor
      particlesRef.current.rotation.x += 0.0003 * factor
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 4. Core Thinking Pulse Light
export function CoreNeuralPulseLight() {
  const lightRef = useRef(null)

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()
    if (lightRef.current) {
      lightRef.current.intensity = 2.8 + Math.sin(elapsed * 4.0) * 1.5
    }
  })

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 0]}
      color="#ffaa00"
      distance={14}
      intensity={2.8}
    />
  )
}

