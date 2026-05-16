import type { Scenario } from './scenario'
import { shipPosition, totalEarthTime, validateScenario } from './scenario'

export type SignalEndpoint = 'earth' | 'ship'

export type SignalEvent = {
  emitter: SignalEndpoint
  emissionTime: number
  position: number
  receiveTime: number
}

export function signalTravelTime(distance: number): number {
  if (!Number.isFinite(distance) || distance < 0) {
    throw new RangeError('Signal distance must be finite and non-negative.')
  }

  return distance
}

export function earthReceivesShipSignal(
  scenario: Scenario,
  emissionTime: number,
): SignalEvent {
  validateScenario(scenario)

  if (!Number.isFinite(emissionTime) || emissionTime < 0) {
    throw new RangeError('Emission time must be finite and non-negative.')
  }

  const position = shipPosition(scenario, emissionTime)

  return {
    emitter: 'ship',
    emissionTime,
    position,
    receiveTime: emissionTime + signalTravelTime(Math.abs(position)),
  }
}

export function shipReceivesEarthSignal(
  scenario: Scenario,
  emissionTime: number,
): SignalEvent {
  validateScenario(scenario)

  if (!Number.isFinite(emissionTime) || emissionTime < 0) {
    throw new RangeError('Emission time must be finite and non-negative.')
  }

  const receiveTime = solveShipReceiveTimeForEarthEmission(scenario, emissionTime)
  const position = shipPosition(scenario, receiveTime)

  return {
    emitter: 'earth',
    emissionTime,
    position,
    receiveTime,
  }
}

export function shipEmissionTimeReceivedOnEarth(
  scenario: Scenario,
  earthReceiveTime: number,
): number {
  validateScenario(scenario)
  assertFiniteNonNegativeTime(earthReceiveTime, 'Earth receive time')

  const outboundEnd = scenario.outboundDuration
  const totalTime = totalEarthTime(scenario)
  const turnaroundReceiveTime = outboundEnd * (1 + scenario.velocity)
  const emissionTime =
    earthReceiveTime <= turnaroundReceiveTime
      ? earthReceiveTime / (1 + scenario.velocity)
      : (earthReceiveTime - 2 * scenario.velocity * outboundEnd) /
        (1 - scenario.velocity)

  return clampTime(emissionTime, totalTime)
}

export function earthEmissionTimeReceivedOnShip(
  scenario: Scenario,
  shipReceiveCoordinateTime: number,
): number {
  validateScenario(scenario)
  assertFiniteNonNegativeTime(shipReceiveCoordinateTime, 'Ship receive time')

  const outboundEnd = scenario.outboundDuration
  const totalTime = totalEarthTime(scenario)
  const emissionTime =
    shipReceiveCoordinateTime <= outboundEnd
      ? shipReceiveCoordinateTime * (1 - scenario.velocity)
      : shipReceiveCoordinateTime * (1 + scenario.velocity) -
        2 * scenario.velocity * outboundEnd

  return clampTime(emissionTime, totalTime)
}

function solveShipReceiveTimeForEarthEmission(
  scenario: Scenario,
  emissionTime: number,
): number {
  const outboundEnd = scenario.outboundDuration
  const totalTime = outboundEnd * 2

  const outboundReceive = emissionTime / (1 - scenario.velocity)

  if (outboundReceive <= outboundEnd) {
    return outboundReceive
  }

  const maxDistance = scenario.velocity * outboundEnd
  const inboundReceive =
    (emissionTime + maxDistance + scenario.velocity * outboundEnd) /
    (1 + scenario.velocity)

  return Math.min(totalTime, inboundReceive)
}

function assertFiniteNonNegativeTime(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be finite and non-negative.`)
  }
}

function clampTime(value: number, totalTime: number): number {
  return Math.min(totalTime, Math.max(0, value))
}
