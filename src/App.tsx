import { useState } from 'react'
import './App.css'

function App() {
  const defaultVelocity = 0.8
  const [velocity, setVelocity] = useState(defaultVelocity)
  const [isPlaying, setIsPlaying] = useState(false)

  const resetScenario = () => {
    setVelocity(defaultVelocity)
    setIsPlaying(false)
  }

  const adjustVelocity = (delta: number) => {
    setVelocity((value) => Math.min(0.95, Math.max(0, Number((value + delta).toFixed(2)))))
  }

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Interactive special relativity</p>
          <h1 id="page-title">RelativityStream</h1>
          <p className="hero-copy">
            A video-call view of spacetime, signal delay, and clocks that
            disagree until reunion.
          </p>
        </div>
        <div className="status-pill" aria-label="Milestone status">
          Milestone 1 skeleton
        </div>
      </section>

      <section className="dashboard-grid" aria-label="RelativityStream layout">
        <article className="observer-card">
          <div className="card-heading">
            <p>Earth view</p>
            <span>Local observer</span>
          </div>
          <div className="clock-readout">00:00:00</div>
          <p className="muted">Received astronaut stream will appear here.</p>
        </article>

        <article className="observer-card">
          <div className="card-heading">
            <p>Astronaut view</p>
            <span>Ship proper time</span>
          </div>
          <div className="clock-readout">00:00:00</div>
          <p className="muted">Received Earth stream will appear here.</p>
        </article>

        <article className="control-panel">
          <div className="card-heading">
            <p>Scenario controls</p>
            <span>Prepared for playback</span>
          </div>
          <label>
            Velocity
            <input
              type="range"
              min="0"
              max="0.95"
              step="0.01"
              value={velocity}
              onChange={(event) => setVelocity(Number(event.target.value))}
            />
          </label>
          <p className="control-value">{velocity.toFixed(2)} c</p>
          <div className="button-row" aria-label="Velocity step controls">
            <button type="button" onClick={() => adjustVelocity(-0.05)}>
              Slower
            </button>
            <button type="button" onClick={() => adjustVelocity(0.05)}>
              Faster
            </button>
          </div>
          <div className="button-row" aria-label="Playback controls">
            <button type="button" onClick={() => setIsPlaying((value) => !value)}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button type="button" onClick={resetScenario}>
              Reset
            </button>
          </div>
        </article>

        <article className="diagram-panel" aria-label="Signal propagation view">
          <div className="card-heading">
            <p>Signal propagation</p>
            <span>Worldlines placeholder</span>
          </div>
          <div className="diagram-line" aria-hidden="true">
            <span className="earth-line" />
            <span className="ship-line" />
            <span className="signal-line" />
          </div>
        </article>

        <article className="comparison-panel">
          <div className="card-heading">
            <p>Clock comparison</p>
            <span>Reunion summary</span>
          </div>
          <dl>
            <div>
              <dt>Earth elapsed</dt>
              <dd>Pending model</dd>
            </div>
            <div>
              <dt>Astronaut elapsed</dt>
              <dd>Pending model</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  )
}

export default App
