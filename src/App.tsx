import { useEffect, useMemo, useState } from 'react'
import {
  earthApparentShipRate,
  earthEmissionTimeReceivedOnShip,
  earthReceivesTurnaroundTime,
  sampleScenario,
  shipEmissionTimeReceivedOnEarth,
  shipPosition,
  shipProperTime,
} from './model'
import './App.css'

const defaultVelocity = 0.8
const defaultTurnaroundDistance = 4.8
const minVelocity = 0.01
const maxVelocity = 0.99
const minTurnaroundDistance = 0.5
const maxTurnaroundDistance = 100
type PointOfView = 'earth' | 'traveler'

function App() {
  const [velocity, setVelocity] = useState(defaultVelocity)
  const [turnaroundDistance, setTurnaroundDistance] = useState(defaultTurnaroundDistance)
  const [coordinateTime, setCoordinateTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pointOfView, setPointOfView] = useState<PointOfView>('earth')

  const scenario = useMemo(
    () => ({
      velocity,
      outboundDuration: turnaroundDistance / velocity,
    }),
    [turnaroundDistance, velocity],
  )
  const sample = sampleScenario(scenario, coordinateTime)
  const playbackStep = Math.max(0.08, sample.totalEarthTime / 300)
  const treeMaturityYears = sample.totalEarthTime
  const turnaroundReceiveTime = earthReceivesTurnaroundTime(scenario)
  const hasEarthSeenTurnaround = sample.coordinateTime >= turnaroundReceiveTime
  const shipEmissionSeenByEarth = shipEmissionTimeReceivedOnEarth(
    scenario,
    sample.coordinateTime,
  )
  const earthEmissionSeenByShip = earthEmissionTimeReceivedOnShip(
    scenario,
    sample.coordinateTime,
  )
  const travelerAgeSeenByEarth = shipProperTime(scenario, shipEmissionSeenByEarth)
  const travelerPositionSeenByEarth = shipPosition(scenario, shipEmissionSeenByEarth)
  const streamRate =
    sample.phase === 'reunion'
      ? 1
      : earthApparentShipRate(scenario, sample.phase)
  const isEarthPov = pointOfView === 'earth'
  const earthDisplayAge = isEarthPov ? sample.earthElapsedTime : earthEmissionSeenByShip
  const travelerDisplayAge = isEarthPov ? travelerAgeSeenByEarth : sample.shipProperTime
  const travelerDisplayPosition = isEarthPov
    ? travelerPositionSeenByEarth
    : sample.shipPosition

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = window.setInterval(() => {
      setCoordinateTime((value) => {
        const nextValue = Math.min(sample.totalEarthTime, value + playbackStep)

        if (nextValue >= sample.totalEarthTime) {
          window.clearInterval(timer)
          setIsPlaying(false)
        }

        return nextValue
      })
    }, 80)

    return () => window.clearInterval(timer)
  }, [isPlaying, playbackStep, sample.totalEarthTime])

  const resetScenario = () => {
    setVelocity(defaultVelocity)
    setTurnaroundDistance(defaultTurnaroundDistance)
    setCoordinateTime(0)
    setIsPlaying(false)
  }

  return (
    <main className="app-shell">
      <header className="mission-bar" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Reality has ping</p>
          <h1 id="page-title">RelativityStream</h1>
        </div>
        <div className="mission-status">
          <span>{isEarthPov ? 'Earth POV' : 'Traveler POV'} - {phaseLabel(sample.phase)}</span>
          <strong>{formatTime(sample.coordinateTime)}</strong>
        </div>
      </header>

      <section className="experience-stage" aria-label="RelativityStream visual simulation">
        <SignalOverlay
          coordinateTime={sample.coordinateTime}
          ghostShipPosition={travelerPositionSeenByEarth}
          outboundDuration={scenario.outboundDuration}
          velocity={velocity}
        />

        <StreamView
          title="Earth view"
          subtitle={
            isEarthPov
              ? 'Local experience'
              : `Received Earth stream from ${formatTime(earthEmissionSeenByShip)}`
          }
          variant="earth"
          localAge={earthDisplayAge}
          ageTotal={sample.totalEarthTime}
          streamMode={isEarthPov ? 'local' : 'received'}
          primaryStat={`${isEarthPov ? 'Local clock' : 'Received clock'} ${formatTime(earthDisplayAge)}`}
          secondaryStat={
            isEarthPov
              ? `Astronaut stream ${streamRate.toFixed(2)}x`
              : `Earth signal age ${formatYears(sample.coordinateTime - earthEmissionSeenByShip)}`
          }
          note={
            isEarthPov
              ? `${hasEarthSeenTurnaround ? 'Turnaround visible' : 'Turnaround not visible yet'}`
              : 'What the traveler can see from Earth.'
          }
        />

        <StreamView
          title="Traveler view"
          subtitle={
            isEarthPov
              ? `Received traveler stream from ${formatTime(shipEmissionSeenByEarth)}`
              : 'Local experience'
          }
          variant="space"
          localAge={travelerDisplayAge}
          ageTotal={treeMaturityYears}
          streamMode={isEarthPov ? 'received' : 'local'}
          primaryStat={`${isEarthPov ? 'Received ship clock' : 'Ship clock'} ${formatTime(travelerDisplayAge)}`}
          secondaryStat={`${travelerDisplayPosition.toFixed(2)} ly from Earth`}
          note={
            isEarthPov
              ? `Signal delay ${formatYears(sample.coordinateTime - shipEmissionSeenByEarth)}`
              : 'The traveler feels normal locally.'
          }
        />
      </section>

      <section className="control-rail" aria-label="Scenario controls">
        <div className="rail-controls">
          <div className="pov-toggle" aria-label="Point of view">
            <button
              type="button"
              aria-pressed={isEarthPov}
              onClick={() => setPointOfView('earth')}
            >
              Earth POV
            </button>
            <button
              type="button"
              aria-pressed={!isEarthPov}
              onClick={() => setPointOfView('traveler')}
            >
              Traveler POV
            </button>
          </div>
          <button type="button" onClick={() => setIsPlaying((value) => !value)}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button type="button" onClick={resetScenario}>
            Reset
          </button>
          <label className="rail-slider">
            <span>Timeline</span>
            <input
              aria-label="Timeline"
              type="range"
              min="0"
              max={sample.totalEarthTime}
              step="0.1"
              value={sample.coordinateTime}
              onChange={(event) => {
                setCoordinateTime(Number(event.target.value))
                setIsPlaying(false)
              }}
            />
            <strong>{formatTime(sample.coordinateTime)} / {formatTime(sample.totalEarthTime)}</strong>
          </label>
          <label className="rail-slider compact">
            <span>Velocity</span>
            <input
              aria-label="Velocity"
              type="range"
              min={minVelocity}
              max={maxVelocity}
              step="0.01"
              value={velocity}
              onChange={(event) => {
                setVelocity(Number(event.target.value))
                setCoordinateTime(0)
                setIsPlaying(false)
              }}
            />
            <strong>{velocity.toFixed(2)} c</strong>
          </label>
          <label className="rail-slider compact">
            <span>Turnaround distance</span>
            <input
              aria-label="Turnaround distance"
              type="range"
              min={minTurnaroundDistance}
              max={maxTurnaroundDistance}
              step="0.1"
              value={turnaroundDistance}
              onChange={(event) => {
                setTurnaroundDistance(Number(event.target.value))
                setCoordinateTime(0)
                setIsPlaying(false)
              }}
            />
            <strong>{turnaroundDistance.toFixed(1)} ly</strong>
          </label>
        </div>

        <dl className="clock-strip" aria-label="Clock comparison">
          <div>
            <dt>Earth reunion</dt>
            <dd>{formatTime(sample.totalEarthTime)}</dd>
          </div>
          <div>
            <dt>Traveler reunion</dt>
            <dd>{formatTime(sample.totalShipProperTime)}</dd>
          </div>
          <div>
            <dt>Clock gap</dt>
            <dd>{formatTime(sample.totalEarthTime - sample.totalShipProperTime)}</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

type StreamViewProps = {
  title: string
  subtitle: string
  variant: 'earth' | 'space'
  localAge: number
  ageTotal: number
  primaryStat: string
  secondaryStat: string
  note: string
  streamMode: 'local' | 'received'
}

function StreamView({
  title,
  subtitle,
  variant,
  localAge,
  ageTotal,
  primaryStat,
  secondaryStat,
  note,
  streamMode,
}: StreamViewProps) {
  const growth = Math.min(1, Math.max(0.04, localAge / ageTotal))

  return (
    <article className={`stream-view ${variant}`} aria-label={title}>
      <div className="stream-copy">
        <div>
          <p>{title}</p>
          <span>{subtitle}</span>
        </div>
        <div className="stream-clock">
          <small>{streamMode === 'local' ? 'local now' : 'received'}</small>
          <strong>{formatTime(localAge)}</strong>
        </div>
      </div>

      <div className="scene-window">
        <TreeScene
          growth={growth}
          localAge={localAge}
          variant={variant}
        />
      </div>

      <div className="stream-telemetry">
        <span>{primaryStat}</span>
        <span>{secondaryStat}</span>
        <span>{note}</span>
      </div>
    </article>
  )
}

type TreeSceneProps = {
  growth: number
  localAge: number
  variant: 'earth' | 'space'
}

function TreeScene({ growth, localAge, variant }: TreeSceneProps) {
  const trunkHeight = 54 + growth * 132
  const trunkWidth = 10 + growth * 18
  const canopyRadius = 16 + growth * 58
  const rootY = 252
  const trunkTopY = rootY - trunkHeight
  const leafOpacity = Math.min(1, growth * 1.35)
  const rings = Math.max(1, Math.round(localAge))

  return (
    <svg
      className="tree-scene"
      viewBox="0 0 520 300"
      role="img"
      aria-label={`${variant === 'earth' ? 'Earth' : 'Traveler'} tree aged to ${formatTime(localAge)}`}
    >
      <defs>
        <radialGradient id={`${variant}-skyGlow`} cx="50%" cy="18%" r="70%">
          <stop offset="0%" stopColor={variant === 'earth' ? '#8fd3ff' : '#4761ff'} />
          <stop offset="100%" stopColor={variant === 'earth' ? '#13243a' : '#050816'} />
        </radialGradient>
        <linearGradient id={`${variant}-trunk`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#c89555" />
          <stop offset="100%" stopColor="#6f4329" />
        </linearGradient>
      </defs>

      <rect className="scene-bg" width="520" height="300" fill={`url(#${variant}-skyGlow)`} />
      {variant === 'earth' ? <EarthBackdrop /> : <SpaceBackdrop />}

      <line className="tree-ground" x1="54" x2="466" y1={rootY} y2={rootY} />
      <path
        className="tree-root"
        d={`M 260 ${rootY - 6} C 230 ${rootY + 5}, 198 ${rootY + 8}, 164 ${rootY + 2}`}
      />
      <path
        className="tree-root"
        d={`M 260 ${rootY - 6} C 292 ${rootY + 6}, 326 ${rootY + 8}, 370 ${rootY + 1}`}
      />
      <rect
        className="tree-trunk"
        x={260 - trunkWidth / 2}
        y={trunkTopY}
        width={trunkWidth}
        height={trunkHeight}
        rx={trunkWidth / 2}
        fill={`url(#${variant}-trunk)`}
      />
      <path
        className="tree-branch"
        d={`M 260 ${trunkTopY + trunkHeight * 0.42} C ${232 - growth * 18} ${trunkTopY + 42}, ${214 - growth * 24} ${trunkTopY + 34}, ${190 - growth * 26} ${trunkTopY + 18}`}
      />
      <path
        className="tree-branch"
        d={`M 262 ${trunkTopY + trunkHeight * 0.34} C ${296 + growth * 20} ${trunkTopY + 34}, ${322 + growth * 24} ${trunkTopY + 18}, ${350 + growth * 28} ${trunkTopY + 2}`}
      />
      <circle className="canopy main" cx="260" cy={trunkTopY - 8} r={canopyRadius} opacity={leafOpacity} />
      <circle className="canopy side" cx={218 - growth * 18} cy={trunkTopY + 22} r={canopyRadius * 0.72} opacity={leafOpacity} />
      <circle className="canopy side" cx={302 + growth * 18} cy={trunkTopY + 20} r={canopyRadius * 0.76} opacity={leafOpacity} />
      <circle className="canopy glow" cx="260" cy={trunkTopY - 8} r={canopyRadius + 14} opacity={leafOpacity * 0.35} />
      <text className="growth-label" x="28" y="42">local growth rings {rings}</text>
    </svg>
  )
}

function EarthBackdrop() {
  return (
    <>
      <circle className="sun-glow" cx="438" cy="62" r="34" />
      <path className="horizon" d="M 0 220 C 120 188, 250 205, 520 172 L 520 300 L 0 300 Z" />
      <path className="city-line" d="M 62 218 L 62 188 L 88 188 L 88 214 L 112 214 L 112 176 L 136 176 L 136 216 L 170 216 L 170 196 L 190 196 L 190 218" />
      <path className="signal-dish" d="M 398 226 L 422 194 M 424 194 C 392 188, 383 165, 392 146 C 421 153, 438 172, 424 194" />
    </>
  )
}

function SpaceBackdrop() {
  return (
    <>
      <circle className="star big" cx="70" cy="52" r="2" />
      <circle className="star" cx="118" cy="96" r="1.4" />
      <circle className="star" cx="194" cy="42" r="1.6" />
      <circle className="star" cx="396" cy="72" r="1.8" />
      <circle className="star" cx="458" cy="118" r="1.2" />
      <circle className="planet" cx="414" cy="207" r="54" />
      <path className="orbit-ring" d="M 326 210 C 366 176, 446 172, 492 202" />
      <path className="ship-platform" d="M 88 238 L 432 238 L 468 268 L 52 268 Z" />
    </>
  )
}

type SignalOverlayProps = {
  coordinateTime: number
  ghostShipPosition: number
  outboundDuration: number
  velocity: number
}

function SignalOverlay({
  coordinateTime,
  ghostShipPosition,
  outboundDuration,
  velocity,
}: SignalOverlayProps) {
  const width = 760
  const height = 172
  const totalTime = outboundDuration * 2
  const earthX = 78
  const farX = width - 76
  const topY = 32
  const bottomY = height - 28
  const maxDistance = velocity * outboundDuration
  const timeToY = (time: number) => topY + (time / totalTime) * (bottomY - topY)
  const positionToX = (position: number) =>
    earthX + (position / Math.max(maxDistance, 1)) * (farX - earthX)
  const shipPosition =
    coordinateTime <= outboundDuration
      ? velocity * coordinateTime
      : Math.max(0, maxDistance - velocity * (coordinateTime - outboundDuration))
  const currentY = timeToY(coordinateTime)
  const ghostShipX = positionToX(ghostShipPosition)
  const pulseTimes = [
    0,
    outboundDuration * 0.25,
    outboundDuration * 0.5,
    outboundDuration * 0.75,
    outboundDuration,
    outboundDuration * 1.25,
    outboundDuration * 1.5,
    outboundDuration * 1.75,
  ]
  const pulses = pulseTimes.filter((time, index) => (
    pulseTimes.indexOf(time) === index && time <= coordinateTime
  ))

  return (
    <aside className="signal-overlay" aria-label="Signal propagation view">
      <div className="overlay-heading">
        <p>Signal propagation</p>
        <button
          className="info-button"
          type="button"
          aria-label="How to read signal propagation"
          title="Down is later Earth-coordinate time. Right is farther from Earth. Orange diagonals are ship motion; red pulses are light signals moving back toward Earth."
        >
          i
        </button>
      </div>
      <svg
        className="overlay-diagram"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Compact signal propagation diagram over the simulated streams"
      >
        <line className="overlay-axis" x1={earthX} y1={topY} x2={earthX} y2={bottomY} />
        <line className="overlay-distance-axis" x1={earthX} y1={bottomY} x2={farX} y2={bottomY} />
        <path
          className="overlay-ship-path"
          d={`M ${earthX} ${topY} L ${farX} ${timeToY(outboundDuration)} L ${earthX} ${bottomY}`}
        />
        <line className="overlay-now" x1={earthX} y1={currentY} x2={farX} y2={currentY} />
        {pulses.map((emissionTime) => {
          const isTurnaroundPulse = Math.abs(emissionTime - outboundDuration) < 0.001
          const emittedPosition =
            emissionTime <= outboundDuration
              ? velocity * emissionTime
              : Math.max(0, maxDistance - velocity * (emissionTime - outboundDuration))
          const startX = positionToX(emittedPosition)
          const startY = timeToY(emissionTime)
          const receiveTime = emissionTime + emittedPosition
          const endY = timeToY(Math.min(receiveTime, totalTime))
          const progress = Math.min(1, Math.max(0.05, (coordinateTime - emissionTime) / Math.max(receiveTime - emissionTime, 0.1)))
          const endX = startX + (earthX - startX) * progress
          const visibleEndY = startY + (endY - startY) * progress

          return (
            <g key={emissionTime}>
              <line
                className={`overlay-pulse ${isTurnaroundPulse ? 'turnaround' : ''}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={visibleEndY}
              />
              <circle
                className={`overlay-pulse-dot ${isTurnaroundPulse ? 'turnaround' : ''}`}
                cx={endX}
                cy={visibleEndY}
                r={isTurnaroundPulse ? '5.8' : '3.4'}
              />
              {isTurnaroundPulse ? (
                <text className="overlay-turnaround-label" x={endX - 92} y={visibleEndY - 9}>
                  turnaround signal
                </text>
              ) : null}
            </g>
          )
        })}
        <circle
          className="overlay-ghost-ship"
          cx={ghostShipX}
          cy={currentY}
          r="12"
        />
        <circle className="overlay-earth" cx={earthX} cy={currentY} r="7" />
        <circle className="overlay-ship" cx={positionToX(shipPosition)} cy={currentY} r="8" />
        <text className="overlay-label" x={earthX + 10} y={topY + 12}>Earth</text>
        <text className="overlay-label" x={farX - 70} y={timeToY(outboundDuration) - 8}>turn</text>
        <text className="overlay-hint vertical" x={earthX - 30} y={(topY + bottomY) / 2}>later</text>
        <text className="overlay-hint" x={farX - 132} y={bottomY - 10}>farther from Earth</text>
      </svg>
    </aside>
  )
}

function formatTime(value: number): string {
  return `${value.toFixed(1)} y`
}

function formatYears(value: number): string {
  return `${value.toFixed(2)} years`
}

function phaseLabel(phase: string): string {
  if (phase === 'outbound') {
    return 'Outbound'
  }

  if (phase === 'inbound') {
    return 'Inbound'
  }

  return 'Reunion'
}

export default App
