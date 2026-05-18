import { describe, expect, it } from 'vitest'
import {
  earthApparentShipRate,
  earthEmissionTimeReceivedOnShip,
  earthReceivesShipSignal,
  earthReceivesTurnaroundTime,
  lorentzFactor,
  observedDopplerColorShift,
  observedSignalMotion,
  observedStreamRate,
  sampleScenario,
  shipEmissionTimeReceivedOnEarth,
  shipPosition,
  shipProperTime,
  signalTravelTime,
  totalEarthTime,
  totalShipProperTime,
} from './index'

const scenario = {
  velocity: 0.8,
  outboundDuration: 6,
}

describe('relativity model', () => {
  it('calculates Lorentz factor at rest', () => {
    expect(lorentzFactor(0)).toBe(1)
  })

  it('increases Lorentz factor as velocity approaches light speed', () => {
    expect(lorentzFactor(0.8)).toBeGreaterThan(lorentzFactor(0.5))
    expect(lorentzFactor(0.95)).toBeGreaterThan(lorentzFactor(0.8))
  })

  it('rejects invalid velocities', () => {
    expect(() => lorentzFactor(-0.1)).toThrow(RangeError)
    expect(() => lorentzFactor(1)).toThrow(RangeError)
    expect(() => lorentzFactor(Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })

  it('calculates ship position during outbound and inbound legs', () => {
    expect(shipPosition(scenario, 3)).toBeCloseTo(2.4)
    expect(shipPosition(scenario, 6)).toBeCloseTo(4.8)
    expect(shipPosition(scenario, 9)).toBeCloseTo(2.4)
    expect(shipPosition(scenario, 12)).toBeCloseTo(0)
  })

  it('keeps ship proper time less than Earth coordinate time for moving ship', () => {
    expect(shipProperTime(scenario, 6)).toBeCloseTo(3.6)
    expect(shipProperTime(scenario, 6)).toBeLessThan(6)
  })

  it('calculates light signal receive time as emission plus distance traveled', () => {
    expect(signalTravelTime(4.8)).toBeCloseTo(4.8)
    const signal = earthReceivesShipSignal(scenario, 6)

    expect(signal.emitter).toBe('ship')
    expect(signal.emissionTime).toBe(6)
    expect(signal.position).toBeCloseTo(4.8)
    expect(signal.receiveTime).toBeCloseTo(10.8)
  })

  it('models outbound stream as slower and inbound stream as faster for Earth', () => {
    expect(earthApparentShipRate(scenario, 'outbound')).toBeCloseTo(1 / 3)
    expect(earthApparentShipRate(scenario, 'inbound')).toBeCloseTo(3)
  })

  it('reports redshift for receding received streams and blueshift for approaching streams', () => {
    expect(observedSignalMotion(scenario, 'earth', 0)).toBe('stationary')
    expect(observedDopplerColorShift(scenario, 'earth', 0)).toBe('neutral')
    expect(observedStreamRate(scenario, 'earth', 0)).toBe(1)

    expect(observedSignalMotion(scenario, 'earth', 3)).toBe('receding')
    expect(observedDopplerColorShift(scenario, 'earth', 3)).toBe('redshift')
    expect(observedStreamRate(scenario, 'earth', 3)).toBeCloseTo(1 / 3)

    expect(observedSignalMotion(scenario, 'earth', 9)).toBe('approaching')
    expect(observedDopplerColorShift(scenario, 'earth', 9)).toBe('blueshift')
    expect(observedStreamRate(scenario, 'earth', 9)).toBeCloseTo(3)
  })

  it('switches the traveler received stream from slow to fast at turnaround', () => {
    expect(observedDopplerColorShift(scenario, 'ship', 5.9)).toBe('redshift')
    expect(observedStreamRate(scenario, 'ship', 5.9)).toBeCloseTo(1 / 3)

    expect(observedDopplerColorShift(scenario, 'ship', 6)).toBe('blueshift')
    expect(observedStreamRate(scenario, 'ship', 6)).toBeCloseTo(3)
  })

  it('makes Earth elapsed time greater than ship proper time at reunion', () => {
    expect(totalEarthTime(scenario)).toBe(12)
    expect(totalShipProperTime(scenario)).toBeCloseTo(7.2)
    expect(totalEarthTime(scenario)).toBeGreaterThan(totalShipProperTime(scenario))
  })

  it('delays Earth visibility of the turnaround event', () => {
    const turnaroundEmission = scenario.outboundDuration
    const turnaroundReceive = earthReceivesTurnaroundTime(scenario)

    expect(turnaroundReceive).toBeCloseTo(10.8)
    expect(turnaroundReceive).toBeGreaterThan(turnaroundEmission)
  })

  it('finds the ship event visible on Earth at a receive time', () => {
    expect(shipEmissionTimeReceivedOnEarth(scenario, 6)).toBeCloseTo(10 / 3)
    expect(shipEmissionTimeReceivedOnEarth(scenario, 10.8)).toBeCloseTo(6)
    expect(shipEmissionTimeReceivedOnEarth(scenario, 12)).toBeCloseTo(12)
  })

  it('finds the Earth event visible on the ship at a receive time', () => {
    expect(earthEmissionTimeReceivedOnShip(scenario, 3)).toBeCloseTo(0.6)
    expect(earthEmissionTimeReceivedOnShip(scenario, 6)).toBeCloseTo(1.2)
    expect(earthEmissionTimeReceivedOnShip(scenario, 12)).toBeCloseTo(12)
  })

  it('samples scenario state for future UI consumers', () => {
    expect(sampleScenario(scenario, 3)).toMatchObject({
      coordinateTime: 3,
      phase: 'outbound',
      earthElapsedTime: 3,
    })
    expect(sampleScenario(scenario, 9)).toMatchObject({
      coordinateTime: 9,
      phase: 'inbound',
      earthElapsedTime: 9,
    })
    expect(sampleScenario(scenario, 99)).toMatchObject({
      coordinateTime: 12,
      phase: 'reunion',
      shipPosition: 0,
    })
  })
})
