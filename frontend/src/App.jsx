import { useState } from 'react'
import './App.css'

function App() {
  const [solution, setSolution] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSolve = async () => {
    setLoading(true)
    setError(null)
    try {
      // Dummy state string
      const state_string = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
      const response = await fetch('http://localhost:8000/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state_string })
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      setSolution(data.solution)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <h1>Rubik's Cube Solver</h1>
      <p>Phase 1: Connectivity Test</p>
      
      <button onClick={handleSolve} disabled={loading}>
        {loading ? 'Solving...' : 'Test Backend Connection (/solve)'}
      </button>

      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
      {solution && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Dummy Solution Generated:</h3>
          <p style={{ fontSize: '1.5rem', letterSpacing: '0.2rem' }}>
            {solution.join(' ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default App
