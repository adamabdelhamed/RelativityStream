import {
  TREE_CYCLE_YEARS,
  TREE_DECAY_YEARS,
  TREE_FULL_GROWTH_YEARS,
  TREE_MAX_VISIBLE_GENERATIONS,
} from './tunables'

export type TreePhase = {
  branchWilt: number
  decay: number
  dustBuild: number
  dustOpacity: number
  growth: number
  isVisible: boolean
  leafFall: number
  structureOpacity: number
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function smoother(value: number): number {
  const t = clamp01(value)

  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function growWindow(value: number, start: number, end: number): number {
  return smoother((value - start) / (end - start))
}

export function visualTreeYearFromLocalAge(localAge: number): number {
  return localAge
}

export function visibleTreeGenerations(visualTreeYear: number): number[] {
  const currentGeneration = Math.max(0, Math.floor(visualTreeYear / TREE_CYCLE_YEARS))
  const firstGeneration = Math.max(0, currentGeneration - TREE_MAX_VISIBLE_GENERATIONS + 1)

  return Array.from(
    { length: TREE_MAX_VISIBLE_GENERATIONS },
    (_, index) => firstGeneration + index,
  )
}

export function reachedTreeGenerations(visualTreeYear: number): number[] {
  const currentGeneration = Math.max(0, Math.floor(visualTreeYear / TREE_CYCLE_YEARS))

  return Array.from({ length: currentGeneration + 1 }, (_, index) => index)
}

export function decayPileGenerations(visualTreeYear: number): number[] {
  return reachedTreeGenerations(visualTreeYear).filter((generationIndex) => {
    const localYear = visualTreeYear - generationIndex * TREE_CYCLE_YEARS

    return phaseAtTreeYear(localYear).dustBuild > 0 || localYear >= TREE_CYCLE_YEARS
  })
}

export function generationGroundPoint(generationIndex: number): { x: number; z: number } {
  const angle = generationIndex * 2.399963229728653
  const radius = 1.05 + Math.sqrt(generationIndex) * 0.58

  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
  }
}

export function phaseAtTreeYear(localYear: number): TreePhase {
  const decayStart = TREE_FULL_GROWTH_YEARS
  const decayEnd = TREE_FULL_GROWTH_YEARS + TREE_DECAY_YEARS
  const leafFallEnd = decayStart + TREE_DECAY_YEARS * 0.48
  const branchWiltEnd = decayStart + TREE_DECAY_YEARS * 0.72
  const dustBuildStart = decayStart + TREE_DECAY_YEARS * 0.24
  const dustBuildEnd = decayStart + TREE_DECAY_YEARS * 0.8
  const structureFadeStart = decayStart + TREE_DECAY_YEARS * 0.48
  const structureFadeEnd = dustBuildEnd
  const growth = clamp01(localYear / TREE_FULL_GROWTH_YEARS)
  const leafFall = growWindow(localYear, decayStart, leafFallEnd)
  const branchWilt = growWindow(localYear, decayStart, branchWiltEnd)
  const dustBuild = growWindow(localYear, dustBuildStart, dustBuildEnd)
  const dustFade = growWindow(localYear, dustBuildEnd, decayEnd)
  const structureOpacity = 1 - growWindow(localYear, structureFadeStart, structureFadeEnd)
  const dustOpacity = dustBuild * (1 - dustFade)
  const decay = growWindow(localYear, decayStart, decayEnd)

  return {
    branchWilt,
    decay,
    dustBuild,
    dustOpacity,
    growth,
    isVisible: localYear >= 0 && localYear < TREE_CYCLE_YEARS,
    leafFall,
    structureOpacity,
  }
}
