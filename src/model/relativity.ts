export function assertValidVelocity(velocity: number): void {
  if (!Number.isFinite(velocity) || velocity < 0 || velocity >= 1) {
    throw new RangeError('Velocity must be finite and satisfy 0 <= v < 1.')
  }
}

export function lorentzFactor(velocity: number): number {
  assertValidVelocity(velocity)

  return 1 / Math.sqrt(1 - velocity * velocity)
}

export function properTimeForCoordinateDuration(
  coordinateDuration: number,
  velocity: number,
): number {
  if (!Number.isFinite(coordinateDuration) || coordinateDuration < 0) {
    throw new RangeError('Coordinate duration must be finite and non-negative.')
  }

  return coordinateDuration / lorentzFactor(velocity)
}

export function relativisticDopplerRate(
  velocity: number,
  direction: 'approaching' | 'receding',
): number {
  assertValidVelocity(velocity)

  const rate = Math.sqrt((1 + velocity) / (1 - velocity))

  return direction === 'approaching' ? rate : 1 / rate
}
