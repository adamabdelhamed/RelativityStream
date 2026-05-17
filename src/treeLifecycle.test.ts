import { describe, expect, it } from 'vitest'
import {
  TREE_CYCLE_YEARS,
  TREE_FULL_GROWTH_YEARS,
  TREE_MAX_VISIBLE_GENERATIONS,
} from './tunables'
import {
  decayPileGenerations,
  generationGroundPoint,
  phaseAtTreeYear,
  reachedTreeGenerations,
  visibleTreeGenerations,
  visualTreeYearFromLocalAge,
} from './treeLifecycle'

describe('tree lifecycle', () => {
  it('maps observer local years directly to visual tree years', () => {
    expect(visualTreeYearFromLocalAge(0)).toBe(0)
    expect(visualTreeYearFromLocalAge(50)).toBe(50)
    expect(visualTreeYearFromLocalAge(75)).toBe(75)
  })

  it('uses the configured growth and cycle years as hard phase boundaries', () => {
    expect(phaseAtTreeYear(0).growth).toBe(0)
    expect(phaseAtTreeYear(TREE_FULL_GROWTH_YEARS).growth).toBe(1)
    expect(phaseAtTreeYear(TREE_FULL_GROWTH_YEARS).decay).toBe(0)
    expect(phaseAtTreeYear(TREE_CYCLE_YEARS - 0.01).isVisible).toBe(true)
    expect(phaseAtTreeYear(TREE_CYCLE_YEARS).isVisible).toBe(false)
  })

  it('keeps producing generation indices after the visible object pool is exceeded', () => {
    const generations = visibleTreeGenerations(TREE_CYCLE_YEARS * 12 + 4)

    expect(generations).toHaveLength(TREE_MAX_VISIBLE_GENERATIONS)
    expect(generations.at(-1)).toBe(12)
    expect(generations[0]).toBe(12 - TREE_MAX_VISIBLE_GENERATIONS + 1)
  })

  it('tracks every generation reached for persistent decay piles', () => {
    expect(reachedTreeGenerations(TREE_CYCLE_YEARS * 4 + 12)).toEqual([0, 1, 2, 3, 4])
  })

  it('does not create a decay pile for a fresh generation', () => {
    expect(decayPileGenerations(0)).toEqual([])
    expect(decayPileGenerations(TREE_FULL_GROWTH_YEARS - 1)).toEqual([])
    expect(decayPileGenerations(TREE_CYCLE_YEARS * 2)).toEqual([0, 1])
  })

  it('expands generation spawn points instead of cycling over fixed radii', () => {
    const firstEightRadii = Array.from({ length: 8 }, (_, index) => {
      const point = generationGroundPoint(index)

      return Math.hypot(point.x, point.z)
    })
    const nextEightRadii = Array.from({ length: 8 }, (_, index) => {
      const point = generationGroundPoint(index + 8)

      return Math.hypot(point.x, point.z)
    })

    expect(Math.min(...nextEightRadii)).toBeGreaterThan(Math.max(...firstEightRadii))
  })
})
