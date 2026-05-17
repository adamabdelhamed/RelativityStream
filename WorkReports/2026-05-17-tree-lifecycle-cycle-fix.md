# Tree Lifecycle Cycle Fix

## What changed

- Removed the visual tree year scale that made configured tree cycles run slower than local observer years.
- Added `treeLifecycle.ts` as a small pure lifecycle module for tree phase math.
- Derived leaf fall, branch wilt, dust build, dust fade, and structure fade timings from `TREE_FULL_GROWTH_YEARS` and `TREE_DECAY_YEARS` instead of hard-coded year values.
- Changed the Three.js tree renderer to recycle visible tree slots based on the current generation index.
- Added runtime `data-visual-tree-year` and `data-visible-generations` attributes to the WebGL scene for browser verification.
- Added unit tests for lifecycle boundaries and generation continuation.
- Added an e2e test that scrubs to 675 years, proving generation 9 renders after the old 8-generation pool limit.

## Why

The prior implementation multiplied local observer age by `TREE_YEARS_PER_EARTH_YEAR`. In the default Earth view, that made a configured 75-year tree cycle take about 111 Earth years:

```text
75 / 0.675 = 111.1
```

That contradicted the lifecycle config. Earth-local trees now use Earth-local years directly, so a 50-year growth plus 25-year decay produces a 75-year cycle.

The renderer also previously created fixed generations 0 through 7. After visual time passed generation 7, no later generation existed to sprout. The renderer now maps the object pool onto the latest visible generation indices.

## How to run

```powershell
npm run dev:host
```

Then open:

```text
http://127.0.0.1:5173
```

## Automated checks

```powershell
npm test
npm run build
npm run check
npm run test:e2e
```

All checks passed.

## Browser checks

Codex verified the app in the in-app browser at `http://127.0.0.1:5173`.

- Page loaded without console errors.
- WebGL canvas rendered at desktop size.
- `Relativity Simulator` and `Incoming Stream` labels were present.
- No `NaN` text appeared.
- The scene exposed `data-visual-tree-year="0.0"` and `data-visible-generations="0,1,2,3,4,5,6,7"` at load.

The Playwright e2e suite performed the long-duration browser check by setting the turnaround distance to `1000 ly`, scrubbing to `675.0 y`, and confirming the Earth scene reported `data-visible-generations="2,3,4,5,6,7,8,9"`.

## Human review

Please review whether one local observer year should equal one visual tree year in both Earth and traveler views. That is now the implemented behavior, which matches the 50+25=75 lifecycle expectation.

## Limitations and follow-up

- The renderer shows the latest eight generation traces, not every historical pile forever. This prevents runaway scene cost while still avoiding the hard stop after generation 7.
- The browser tab title remains `RelativityStream`.
