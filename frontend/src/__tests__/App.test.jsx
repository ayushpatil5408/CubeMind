import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App root component', () => {
  it('renders application brand and navigation header', () => {
    render(<App />)
    const brandElements = screen.getAllByText(/Cube/i)
    expect(brandElements.length).toBeGreaterThan(0)
    const mindElements = screen.getAllByText(/Mind/i)
    expect(mindElements.length).toBeGreaterThan(0)
    const workspaceNavs = screen.getAllByText(/Solver Workspace/i)
    expect(workspaceNavs.length).toBeGreaterThan(0)
  })

  it('renders cube visualizer and controls on default tab', () => {
    render(<App />)
    const cubeCardHeaders = screen.getAllByText(/Cube State & Visualizer/i)
    expect(cubeCardHeaders.length).toBeGreaterThan(0)
    expect(screen.getByText(/Controls & Engine Triggers/i)).toBeInTheDocument()
    expect(screen.getByText(/Scramble Cube \(WCA 20\)/i)).toBeInTheDocument()
    const solveElements = screen.getAllByText(/Solve with Kociemba/i)
    expect(solveElements.length).toBeGreaterThan(0)
  })
})
