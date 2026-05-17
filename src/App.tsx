import { type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  earthApparentShipRate,
  earthEmissionTimeReceivedOnShip,
  earthReceivesTurnaroundTime,
  sampleScenario,
  shipEmissionTimeReceivedOnEarth,
  shipPosition,
  shipProperTime,
} from './model'
import { ThreeTreeScene } from './ThreeTreeScene'
import {
  DEFAULT_SIMULATION_SPEED,
  DEFAULT_TURNAROUND_DISTANCE_LY,
  DEFAULT_VELOCITY_FRACTION_OF_C,
  MAX_TURNAROUND_DISTANCE_LY,
  MAX_VELOCITY_FRACTION_OF_C,
  MIN_TURNAROUND_DISTANCE_LY,
  MIN_VELOCITY_FRACTION_OF_C,
  SIMULATION_SPEED_OPTIONS,
} from './tunables'
import './App.css'

type PointOfView = 'earth' | 'traveler'
type PanelPosition = { height?: number; left: number; top: number; width: number }
type DragState = {
  pointerId: number
  height?: number
  left: number
  mode: 'move' | 'resize'
  startX: number
  startY: number
  top: number
  width: number
}
type SettingsMenu = 'speed' | 'velocity' | 'distance' | null

function App() {
  const [velocity, setVelocity] = useState(DEFAULT_VELOCITY_FRACTION_OF_C)
  const [turnaroundDistance, setTurnaroundDistance] = useState(DEFAULT_TURNAROUND_DISTANCE_LY)
  const [coordinateTime, setCoordinateTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pointOfView, setPointOfView] = useState<PointOfView>('earth')
  const [simulationSpeed, setSimulationSpeed] = useState(DEFAULT_SIMULATION_SPEED)
  const [activeMenu, setActiveMenu] = useState<SettingsMenu>(null)
  const [pipPosition, setPipPosition] = useState<PanelPosition>({
    height: 210,
    left: window.innerWidth - 390,
    top: window.innerHeight - 310,
    width: 340,
  })
  const [signalPosition, setSignalPosition] = useState<PanelPosition>({
    left: 24,
    top: window.innerHeight - 420,
    width: 430,
  })
  const interactionMovedRef = useRef(false)
  const pipDrag = useRef<DragState | null>(null)
  const signalDrag = useRef<DragState | null>(null)
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const suppressContextMenuUntil = useRef(0)

  const scenario = useMemo(
    () => ({
      velocity,
      outboundDuration: turnaroundDistance / velocity,
    }),
    [turnaroundDistance, velocity],
  )
  const sample = sampleScenario(scenario, coordinateTime)
  const timelineMax = Number(sample.totalEarthTime.toFixed(1))
  const playbackStep = Math.max(0.08, sample.totalEarthTime / 300) * simulationSpeed
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
  const mainView = getViewModel(pointOfView, {
    earthEmissionSeenByShip,
    hasEarthSeenTurnaround,
    sample,
    shipEmissionSeenByEarth,
    streamRate,
    travelerAgeSeenByEarth,
    travelerPositionSeenByEarth,
  })
  const pipView = getReceivedViewModel(isEarthPov ? 'traveler' : 'earth', {
    earthEmissionSeenByShip,
    sample,
    shipEmissionSeenByEarth,
    streamRate,
    travelerAgeSeenByEarth,
    travelerPositionSeenByEarth,
  })

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

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) {
        if (controlsRef.current?.contains(document.activeElement)) {
          (document.activeElement as HTMLElement).blur()
        }
        window.requestAnimationFrame(() => setActiveMenu(null))
      }
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismissOnEscape)

    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [])

  const resetScenario = () => {
    setCoordinateTime(0)
    setIsPlaying(false)
  }

  const playOrPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    if (coordinateTime >= timelineMax) {
      setCoordinateTime(0)
    }

    setIsPlaying(true)
  }

  const preserveTimelineProgress = (nextVelocity: number, nextTurnaroundDistance: number) => {
    const currentTotalTime = 2 * (turnaroundDistance / velocity)
    const nextTotalTime = 2 * (nextTurnaroundDistance / nextVelocity)
    const progress = currentTotalTime > 0 ? coordinateTime / currentTotalTime : 0

    setCoordinateTime(Math.min(nextTotalTime, Math.max(0, progress * nextTotalTime)))
  }

  const changeVelocity = (nextVelocity: number) => {
    const clampedVelocity = clamp(nextVelocity, MIN_VELOCITY_FRACTION_OF_C, MAX_VELOCITY_FRACTION_OF_C)
    preserveTimelineProgress(clampedVelocity, turnaroundDistance)
    setVelocity(clampedVelocity)
    setIsPlaying(false)
  }

  const changeTurnaroundDistance = (nextTurnaroundDistance: number) => {
    const clampedDistance = clamp(
      nextTurnaroundDistance,
      MIN_TURNAROUND_DISTANCE_LY,
      MAX_TURNAROUND_DISTANCE_LY,
    )
    preserveTimelineProgress(velocity, clampedDistance)
    setTurnaroundDistance(clampedDistance)
    setIsPlaying(false)
  }

  const togglePov = () => {
    setPointOfView((current) => (current === 'earth' ? 'traveler' : 'earth'))
  }

  const startPipInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const isResize = Boolean((event.target as HTMLElement).closest('.resize-corner'))
    pipDrag.current = {
      height: pipPosition.height ?? 210,
      left: pipPosition.left,
      mode: isResize ? 'resize' : 'move',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      top: pipPosition.top,
      width: pipPosition.width,
    }
    interactionMovedRef.current = false
    document.body.classList.add('dragging-pip')
    if ('setPointerCapture' in event.currentTarget) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const movePipInteraction = (event: Pick<PointerEvent, 'clientX' | 'clientY' | 'pointerId' | 'preventDefault'>) => {
    const drag = pipDrag.current

    if (!drag || event.pointerId !== drag.pointerId) {
      return
    }

    event.preventDefault()
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (Math.abs(dx) + Math.abs(dy) > 5) {
      interactionMovedRef.current = true
    }

    if (drag.mode === 'resize') {
      const width = clamp(drag.width + dx, 230, Math.min(620, window.innerWidth - 40))
      const height = clamp((drag.height ?? 210) + dy, 150, Math.min(420, window.innerHeight - 140))
      setPipPosition((current) => ({
        ...current,
        height,
        width,
      }))
      return
    }

    setPipPosition((current) => ({
      ...current,
      left: clamp(drag.left + dx, 12, window.innerWidth - current.width - 12),
      top: clamp(drag.top + dy, 12, window.innerHeight - (current.height ?? 210) - 88),
    }))
  }

  const endPipInteraction = (event?: Pick<PointerEvent, 'pointerId' | 'preventDefault'>) => {
    if (event && pipDrag.current && event.pointerId !== pipDrag.current.pointerId) {
      return
    }

    event?.preventDefault()
    if (pipDrag.current && !interactionMovedRef.current && pipDrag.current.mode === 'move') {
      togglePov()
    }
    pipDrag.current = null
    suppressContextMenuUntil.current = Date.now() + 650
    document.body.classList.remove('dragging-pip')
  }

  const startSignalDrag = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault()
    signalDrag.current = {
      left: signalPosition.left,
      mode: 'move',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      top: signalPosition.top,
      width: signalPosition.width,
    }
    document.body.classList.add('dragging-pip')
    if ('setPointerCapture' in event.currentTarget) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const moveSignalInteraction = (event: Pick<PointerEvent, 'clientX' | 'clientY' | 'pointerId' | 'preventDefault'>) => {
    const drag = signalDrag.current

    if (!drag || event.pointerId !== drag.pointerId) {
      return
    }

    event.preventDefault()
    setSignalPosition((current) => ({
      ...current,
      left: clamp(drag.left + event.clientX - drag.startX, 12, window.innerWidth - current.width - 12),
      top: clamp(drag.top + event.clientY - drag.startY, 12, window.innerHeight - 220),
    }))
  }

  const endSignalDrag = (event?: Pick<PointerEvent, 'pointerId' | 'preventDefault'>) => {
    if (event && signalDrag.current && event.pointerId !== signalDrag.current.pointerId) {
      return
    }

    event?.preventDefault()
    signalDrag.current = null
    suppressContextMenuUntil.current = Date.now() + 650
    document.body.classList.remove('dragging-pip')
  }

  useEffect(() => {
    const moveActivePointer = (event: PointerEvent) => {
      if (pipDrag.current) {
        movePipInteraction(event)
      }

      if (signalDrag.current) {
        moveSignalInteraction(event)
      }
    }
    const endActivePointer = (event: PointerEvent) => {
      if (pipDrag.current) {
        endPipInteraction(event)
      }

      if (signalDrag.current) {
        endSignalDrag(event)
      }
    }
    const blockContextMenu = (event: MouseEvent) => {
      if (pipDrag.current || signalDrag.current || Date.now() < suppressContextMenuUntil.current) {
        event.preventDefault()
      }
    }

    document.addEventListener('pointermove', moveActivePointer)
    document.addEventListener('pointerup', endActivePointer)
    document.addEventListener('pointercancel', endActivePointer)
    document.addEventListener('contextmenu', blockContextMenu)

    return () => {
      document.removeEventListener('pointermove', moveActivePointer)
      document.removeEventListener('pointerup', endActivePointer)
      document.removeEventListener('pointercancel', endActivePointer)
      document.removeEventListener('contextmenu', blockContextMenu)
    }
  })

  return (
    <main className="app-shell" aria-label="RelativityStream interactive simulation">
      <section className={`immersive-stage ${mainView.variant}`} aria-label={`${mainView.title} full-screen POV`}>
        <ThreeTreeScene
          ageTotal={sample.totalEarthTime}
          localAge={mainView.localAge}
          streamMode={mainView.streamMode}
          variant={mainView.variant}
        />
        <div className="view-vignette" aria-hidden="true" />

        <header className="mission-bar" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Reality has ping</p>
            <h1 id="page-title">RelativityStream</h1>
          </div>
          <div className="mission-status">
            <span>{mainView.title} - {phaseLabel(sample.phase)}</span>
            <strong>{formatTime(mainView.localAge)}</strong>
          </div>
        </header>

        <section className="view-card" aria-label={mainView.title}>
          <p>{mainView.subtitle}</p>
          <div className="view-stat-row">
            <span>{mainView.primaryStat}</span>
            <span>{mainView.secondaryStat}</span>
            <span>{mainView.note}</span>
          </div>
        </section>

        <aside
          className="pip-panel"
          style={{
            height: pipPosition.height,
            left: pipPosition.left,
            top: pipPosition.top,
            width: pipPosition.width,
          }}
          aria-label={`${pipView.title} picture in picture`}
          onPointerDown={startPipInteraction}
          onContextMenu={(event) => event.preventDefault()}
        >
          <ThreeTreeScene
            ageTotal={sample.totalEarthTime}
            localAge={pipView.localAge}
            streamMode={pipView.streamMode}
            variant={pipView.variant}
          />
          <div className="pip-copy">
            <span>{pipView.title}</span>
            <strong>{formatTime(pipView.localAge)}</strong>
          </div>
          <span className="resize-corner" aria-hidden="true" />
        </aside>

        <SignalOverlay
          coordinateTime={sample.coordinateTime}
          ghostShipPosition={travelerPositionSeenByEarth}
          outboundDuration={scenario.outboundDuration}
          position={signalPosition}
          velocity={velocity}
          onPointerDown={startSignalDrag}
        />

        <section className="control-rail" aria-label="Scenario controls" ref={controlsRef}>
          <button
            className="play-button"
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={playOrPause}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <label className="timeline-control">
            <span className="sr-only">Timeline</span>
            <input
              aria-label="Timeline"
              type="range"
              min="0"
              max={timelineMax}
              step="0.1"
              value={sample.coordinateTime}
              onChange={(event) => {
                setCoordinateTime(Number(event.target.value))
                setIsPlaying(false)
              }}
            />
            <strong>{formatTime(sample.coordinateTime)} / {formatTime(sample.totalEarthTime)}</strong>
          </label>

          <button className="reset-button" type="button" onClick={resetScenario}>
            Reset
          </button>

          <PopoverButton
            active={activeMenu === 'speed'}
            icon={<ClockIcon />}
            label={`${simulationSpeed}x`}
            onClick={() => setActiveMenu(activeMenu === 'speed' ? null : 'speed')}
          >
            <div className="option-grid" aria-label="Simulation speed">
              {SIMULATION_SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  aria-pressed={simulationSpeed === speed}
                  onClick={() => {
                    setSimulationSpeed(speed)
                    setActiveMenu(null)
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </PopoverButton>

          <PopoverButton
            active={activeMenu === 'velocity'}
            icon={<VelocityIcon />}
            label={`${velocity.toFixed(2)} c`}
            onClick={() => setActiveMenu(activeMenu === 'velocity' ? null : 'velocity')}
          >
            <NumericSlider
              label="Velocity"
              max={MAX_VELOCITY_FRACTION_OF_C}
              min={MIN_VELOCITY_FRACTION_OF_C}
              onChange={changeVelocity}
              onDismiss={() => setActiveMenu(null)}
              step={0.01}
              suffix="c"
              value={velocity}
            />
          </PopoverButton>

          <PopoverButton
            active={activeMenu === 'distance'}
            icon={<DistanceIcon />}
            label={`${turnaroundDistance.toFixed(1)} ly`}
            onClick={() => setActiveMenu(activeMenu === 'distance' ? null : 'distance')}
          >
            <NumericSlider
              label="Turnaround distance"
              max={MAX_TURNAROUND_DISTANCE_LY}
              min={MIN_TURNAROUND_DISTANCE_LY}
              onChange={changeTurnaroundDistance}
              onDismiss={() => setActiveMenu(null)}
              step={0.1}
              suffix="ly"
              value={turnaroundDistance}
            />
          </PopoverButton>
        </section>
      </section>
    </main>
  )
}

type ViewModelInputs = {
  earthEmissionSeenByShip: number
  hasEarthSeenTurnaround: boolean
  sample: ReturnType<typeof sampleScenario>
  shipEmissionSeenByEarth: number
  streamRate: number
  travelerAgeSeenByEarth: number
  travelerPositionSeenByEarth: number
}

function getViewModel(pointOfView: PointOfView, inputs: ViewModelInputs) {
  const { earthEmissionSeenByShip, hasEarthSeenTurnaround, sample, streamRate, travelerAgeSeenByEarth, travelerPositionSeenByEarth } = inputs

  if (pointOfView === 'earth') {
    return {
      localAge: sample.earthElapsedTime,
      note: hasEarthSeenTurnaround ? 'Turnaround visible' : 'Turnaround not visible yet',
      primaryStat: `Local clock ${formatTime(sample.earthElapsedTime)}`,
      secondaryStat: `Received ship ${formatTime(travelerAgeSeenByEarth)} at ${travelerPositionSeenByEarth.toFixed(2)} ly, ${streamRate.toFixed(2)}x`,
      streamMode: 'local' as const,
      subtitle: 'Earth local experience',
      title: 'Earth POV',
      variant: 'earth' as const,
    }
  }

  return {
    localAge: sample.shipProperTime,
    note: 'The traveler feels normal locally.',
    primaryStat: `Ship clock ${formatTime(sample.shipProperTime)}`,
    secondaryStat: `${sample.shipPosition.toFixed(2)} ly from Earth`,
    streamMode: 'local' as const,
    subtitle: `Received Earth stream from ${formatTime(earthEmissionSeenByShip)}`,
    title: 'Traveler POV',
    variant: 'space' as const,
  }
}

function getReceivedViewModel(pointOfView: PointOfView, inputs: Omit<ViewModelInputs, 'hasEarthSeenTurnaround'>) {
  const { earthEmissionSeenByShip, sample, shipEmissionSeenByEarth, streamRate, travelerAgeSeenByEarth, travelerPositionSeenByEarth } = inputs

  if (pointOfView === 'traveler') {
    return {
      localAge: travelerAgeSeenByEarth,
      note: `Signal delay ${formatTime(sample.coordinateTime - shipEmissionSeenByEarth)}`,
      primaryStat: `Received ship clock ${formatTime(travelerAgeSeenByEarth)}`,
      secondaryStat: `${travelerPositionSeenByEarth.toFixed(2)} ly from Earth, ${streamRate.toFixed(2)}x`,
      streamMode: 'received' as const,
      subtitle: `Received traveler stream at Earth`,
      title: 'Traveler POV',
      variant: 'space' as const,
    }
  }

  return {
    localAge: earthEmissionSeenByShip,
    note: `Earth signal age ${formatTime(sample.coordinateTime - earthEmissionSeenByShip)}`,
    primaryStat: `Received Earth clock ${formatTime(earthEmissionSeenByShip)}`,
    secondaryStat: 'What the traveler can see from Earth.',
    streamMode: 'received' as const,
    subtitle: `Received Earth stream from ${formatTime(earthEmissionSeenByShip)}`,
    title: 'Earth POV',
    variant: 'earth' as const,
  }
}

type PopoverButtonProps = {
  active: boolean
  children: ReactNode
  icon: ReactNode
  label: string
  onClick: () => void
}

function PopoverButton({ active, children, icon, label, onClick }: PopoverButtonProps) {
  return (
    <div className="control-popover">
      <button
        className="popover-trigger"
        type="button"
        aria-expanded={active}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </button>
      {active ? <div className="popover-panel">{children}</div> : null}
    </div>
  )
}

type NumericSliderProps = {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  onDismiss: () => void
  step: number
  suffix: string
  value: number
}

function NumericSlider({ label, max, min, onChange, onDismiss, step, suffix, value }: NumericSliderProps) {
  const [draftValue, setDraftValue] = useState(formatInputValue(value, step))
  const latestDraft = useRef(draftValue)
  const latestValue = useRef(value)

  useEffect(() => {
    latestValue.current = value
  }, [value])

  const updateDraft = (nextDraft: string) => {
    latestDraft.current = nextDraft
    setDraftValue(nextDraft)
  }

  const commitDraft = () => {
    const parsed = parseDraftNumber(draftValue, min, max)
    if (!parsed.valid) {
      const formattedValue = formatInputValue(latestValue.current, step)
      updateDraft(formattedValue)
      return false
    }

    onChange(parsed.value)
    updateDraft(formatInputValue(parsed.value, step))
    return true
  }

  const revertDraft = () => {
    updateDraft(formatInputValue(latestValue.current, step))
  }

  return (
    <label className="numeric-slider">
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value)
          onChange(nextValue)
          updateDraft(formatInputValue(nextValue, step))
        }}
      />
      <div className="number-entry">
        <input
          aria-label={`${label} value`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={draftValue}
          onBlur={commitDraft}
          onChange={(event) => updateDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && commitDraft()) {
              onDismiss()
            }

            if (event.key === 'Escape') {
              revertDraft()
              onDismiss()
            }
          }}
        />
        <span>{suffix}</span>
      </div>
    </label>
  )
}

type SignalOverlayProps = {
  coordinateTime: number
  ghostShipPosition: number
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  outboundDuration: number
  position: PanelPosition
  velocity: number
}

function SignalOverlay({
  coordinateTime,
  ghostShipPosition,
  onPointerDown,
  outboundDuration,
  position,
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
  const positionToX = (shipDistance: number) =>
    earthX + (shipDistance / Math.max(maxDistance, 1)) * (farX - earthX)
  const shipDistance =
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
    <aside
      className="signal-overlay"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
      }}
      aria-label="Signal propagation view"
      onPointerDown={onPointerDown}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="overlay-heading">
        <p>Signal propagation</p>
        <span>drag</span>
      </div>
      <svg
        className="overlay-diagram"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Compact signal propagation diagram over the simulated stream"
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
        <circle className="overlay-ghost-ship" cx={ghostShipX} cy={currentY} r="12" />
        <circle className="overlay-earth" cx={earthX} cy={currentY} r="7" />
        <circle className="overlay-ship" cx={positionToX(shipDistance)} cy={currentY} r="8" />
        <text className="overlay-label" x={earthX + 10} y={topY + 12}>Earth</text>
        <text className="overlay-label" x={farX - 70} y={timeToY(outboundDuration) - 8}>turn</text>
        <text className="overlay-hint vertical" x={earthX - 30} y={(topY + bottomY) / 2}>later</text>
        <text className="overlay-hint" x={farX - 132} y={bottomY - 10}>farther from Earth</text>
      </svg>
    </aside>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  )
}

function VelocityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 14h9" />
      <path d="M10 7l7 5-7 5" />
      <path d="M4 10h5" />
    </svg>
  )
}

function DistanceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M7 9l-3 3 3 3" />
      <path d="M17 9l3 3-3 3" />
    </svg>
  )
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function parseDraftNumber(value: string, min: number, max: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return { valid: false as const, value: min }
  }

  return { valid: true as const, value: parsed }
}

function formatInputValue(value: number, step: number): string {
  if (step >= 1) {
    return value.toFixed(0)
  }

  const decimals = Math.max(0, Math.ceil(Math.abs(Math.log10(step))))

  return value.toFixed(decimals)
}

function formatTime(value: number): string {
  return `${value.toFixed(1)} y`
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
