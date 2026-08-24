/**
 * Custom Hook for accessing Cube Solver Context
 */

import { useContext } from 'react'
import { CubeContext } from '../context/CubeContext'

export function useCubeSolver() {
  const context = useContext(CubeContext)
  if (!context) {
    throw new Error('useCubeSolver must be used within a CubeProvider')
  }
  return context
}
