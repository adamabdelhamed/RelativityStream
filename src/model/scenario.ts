import {
  assertValidVelocity,
  properTimeForCoordinateDuration,
  relativisticDopplerRate,
} from './relativity'

export type Scenario = {
  velocity: number
  outboundDuration: number
}

export type ScenarioPhase = 'outbound' | 'inbound' | 'reunion'

export type ScenarioSample = {
  coordinateTime: number
  phase: ScenarioPhase
  shipPosition: number
  shipProperTime: number
  earthElapsedTime: number
  totalEarthTime: number
  totalShipProperTime: number
}

export const defaultScenario: Scenario = {
  velocity: 0.8,
  outboundDuration: 6,
}

export function validateScenario(scenario: Scenario): void {
  assertValidVelocity(scenario.velocity)

  if (!Number.isFinite(scenario.outboundDuration) || scenario.outboundDuration <= 0) {
    throw new RangeError('Outbound duration must be finite and greater than zero.')
  }
}

export function totalEarthTime(scenario: Scenario): number {
  validateScenario(scenario)

  return scenario.outboundDuration * 2
}

export function totalShipProperTime(scenario: Scenario): number {
  validateScenario(scenario)

  return properTimeForCoordinateDuration(totalEarthTime(scenario), scenario.velocity)
}

export function clampCoordinateTime(scenario: Scenario, coordinateTime: number): number {
  validateScenario(scenario)

  if (!Number.isFinite(coordinateTime)) {
    throw new RangeError('Coordinate time must be finite.')
  }

  return Math.min(totalEarthTime(scenario), Math.max(0, coordinateTime))
}

export function scenarioPhase(scenario: Scenario, coordinateTime: number): ScenarioPhase {
  const time = clampCoordinateTime(scenario, coordinateTime)

  if (time < scenario.outboundDuration) {
    return 'outbound'
  }

  if (time < totalEarthTime(scenario)) {
    return 'inbound'
  }

  return 'reunion'
}

export function shipPosition(scenario: Scenario, coordinateTime: number): number {
  const time = clampCoordinateTime(scenario, coordinateTime)
  const maxDistance = scenario.velocity * scenario.outboundDuration

  if (time <= scenario.outboundDuration) {
    return scenario.velocity * time
  }

  return Math.max(0, maxDistance - scenario.velocity * (time - scenario.outboundDuration))
}

export function shipProperTime(scenario: Scenario, coordinateTime: number): number {
  const time = clampCoordinateTime(scenario, coordinateTime)

  return properTimeForCoordinateDuration(time, scenario.velocity)
}

export function sampleScenario(
  scenario: Scenario,
  coordinateTime: number,
): ScenarioSample {
  const time = clampCoordinateTime(scenario, coordinateTime)

  return {
    coordinateTime: time,
    phase: scenarioPhase(scenario, time),
    shipPosition: shipPosition(scenario, time),
    shipProperTime: shipProperTime(scenario, time),
    earthElapsedTime: time,
    totalEarthTime: totalEarthTime(scenario),
    totalShipProperTime: totalShipProperTime(scenario),
  }
}

export function earthReceivesTurnaroundTime(scenario: Scenario): number {
  validateScenario(scenario)

  return scenario.outboundDuration + shipPosition(scenario, scenario.outboundDuration)
}

export function earthApparentShipRate(
  scenario: Scenario,
  phase: Exclude<ScenarioPhase, 'reunion'>,
): number {
  validateScenario(scenario)

  return relativisticDopplerRate(
    scenario.velocity,
    phase === 'outbound' ? 'receding' : 'approaching',
  )
}
