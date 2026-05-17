// Scenario defaults. Velocity must stay in [0.01, 0.99); distances are light years.
export const DEFAULT_VELOCITY_FRACTION_OF_C = 0.9
export const DEFAULT_TURNAROUND_DISTANCE_LY = 100
export const MIN_VELOCITY_FRACTION_OF_C = 0.01
export const MAX_VELOCITY_FRACTION_OF_C = 0.99
export const MIN_TURNAROUND_DISTANCE_LY = 0.5
export const MAX_TURNAROUND_DISTANCE_LY = 1000

// Playback speed options multiply the timeline step. Keep the default in this list.
export const DEFAULT_SIMULATION_SPEED = 1
export const SIMULATION_SPEED_OPTIONS = [0.5, 1, 2, 4]

// The procedural tree uses visual tree-years, independent from relativity units.
// Growth is from 0-50 tree-years, decay is from 50-75, then a new generation sprouts.
export const TREE_CYCLE_YEARS = 75
export const TREE_FULL_GROWTH_YEARS = 50
export const TREE_DECAY_YEARS = 25

// The default scenario is 100 ly out and back at 0.9c, or 222.22 Earth years.
// This scale maps that default Earth timeline to exactly two 75-year tree lifecycles.
export const TREE_YEARS_PER_EARTH_YEAR =
  (TREE_CYCLE_YEARS * 2) /
  (2 * (DEFAULT_TURNAROUND_DISTANCE_LY / DEFAULT_VELOCITY_FRACTION_OF_C))

// Rendering and lifecycle tuning. Safe ranges are broad, but large counts affect frame time.
export const TREE_PRIMARY_BRANCH_COUNT = 13
export const TREE_SECONDARY_BRANCHES_PER_PRIMARY = 5
export const TREE_LEAVES_PER_SECONDARY_BRANCH = 8
export const TREE_DUST_PARTICLE_COUNT = 520
export const TREE_MAX_VISIBLE_GENERATIONS = 3

// Persistent dust heap. A value of 0.01 means 100 complete tree deaths build
// a pile as tall as the mature tree. Keep this small; high values dominate the scene.
export const TREE_MAX_HEIGHT_UNITS = 6.8
export const TREE_DUST_PILE_HEIGHT_PER_DEATH_RATIO = 0.033
export const TREE_DUST_PILE_RADIUS_UNITS = 1.55

// Fixed camera framing. Larger z values zoom out; keep high enough to see the full mature tree.
export const TREE_CAMERA_POSITION = { x: 7.8, y: 4.5, z: 15 }
export const TREE_CAMERA_TARGET = { x: 0, y: 2.6, z: 0 }
