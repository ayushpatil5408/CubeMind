import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App root component', () => {
  it('renders application brand and telemetry', async () => {
    render(<App />)
    const brandElements = await screen.findAllByText(/CUBEMIND AI/i)
    expect(brandElements.length).toBeGreaterThan(0)
    const proBadges = await screen.findAllByText(/v4.2 PRO/i)
    expect(proBadges.length).toBeGreaterThan(0)
  }, 10000)

  it('renders cube visualizer and floating pods controls on default tab', async () => {
    render(<App />)
    expect(await screen.findByText(/Controls & Engine Triggers/i)).toBeInTheDocument()
    expect(await screen.findByText(/Scramble \(20\)/i)).toBeInTheDocument()
    const solveElements = await screen.findAllByText(/Solve with Kociemba/i)
    expect(solveElements.length).toBeGreaterThan(0)
    expect(await screen.findByText(/Telemetry Matrix/i)).toBeInTheDocument()
    expect(await screen.findByText(/Spatial Gyro HUD/i)).toBeInTheDocument()
  }, 10000)
})

