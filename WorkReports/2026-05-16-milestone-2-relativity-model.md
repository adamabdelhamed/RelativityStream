# 2026-05-16 - Milestone 2 Relativity Model

## What Changed

This task added the first pure TypeScript relativity model under `src/model/`.

Added model files:

- `src/model/relativity.ts`
- `src/model/scenario.ts`
- `src/model/signals.ts`
- `src/model/index.ts`

Added tests:

- `src/model/relativity.test.ts`

Updated documentation:

- `AGENTS.md` now includes the sharpened visual direction: representative
  simulated streams instead of literal webcam feeds.
- `README.md` now notes that the pure model exists and should drive later UI.

## Visual Direction Captured

The product should be highly visual, but the streams should be simulations:

- Traveler view: start with a readable foreground object, such as a rotating
  cube or simple probe, with an outer-space background.
- Earth view: use a grounded Earth-side scene, such as a horizon, ground
  station, city glow, or mission-control reference object.
- Later visual effects should communicate physics behavior: delayed signals,
  apparent slow/fast playback, redshift, blueshift, and delayed awareness of
  the turnaround.

The model added here is meant to drive those visuals deterministically.

## Model Capabilities

The model currently supports:

- velocity validation for `0 <= v < 1`
- Lorentz factor
- coordinate-time to ship-proper-time conversion
- outbound, inbound, and reunion phases
- ship position during outbound and inbound legs
- scenario sampling for future UI consumers
- total Earth elapsed time
- total ship proper time
- light signal travel time in units where `c = 1`
- ship-to-Earth signal receive events
- Earth-to-ship signal receive events
- Earth receive time for the turnaround event
- apparent Earth-received ship stream rate for outbound and inbound phases

For the default test scenario, `v = 0.8` and outbound Earth-coordinate duration
is `6`. That makes total Earth time `12` and total ship proper time `7.2`.

## How To Use The Model

Import from the model barrel:

```ts
import { sampleScenario, defaultScenario } from './model'

const sample = sampleScenario(defaultScenario, 3)
```

That returns values such as:

- coordinate time
- phase
- ship position
- ship proper time
- Earth elapsed time
- final Earth time
- final ship proper time

Future React components should consume model outputs rather than duplicating
physics logic inside UI components.

## Commands Run

```powershell
npm test
npm run check
npm run test:e2e
```

Results:

- Vitest passed: 2 files, 12 tests
- ESLint passed
- Production build passed
- Playwright smoke test passed: 1 Chromium test

## Browser Validation

This slice did not change the visible UI, so a manual in-app browser pass was
not required by the repo rules. I still ran the existing Playwright e2e smoke
test to confirm the app shell continues to load after adding the model.

Codex can validate the math behavior well through deterministic unit tests. You
should still steer whether the next UI slice presents the model in the way you
want users to feel it.

## Notes And Limitations

- The model uses instantaneous turnaround, matching the current repo plan.
- The first signal model is deliberately 1D and uses `c = 1`.
- Earth-to-ship receive solving is included for the simple outbound/inbound
  path, but the UI does not consume it yet.
- No acceleration curve or continuous visual interpolation has been added.

## Recommended Next Step

Milestone 3 should connect this model to the static UI:

- show Earth elapsed time
- show ship proper time
- show velocity
- show current phase
- show final clock comparison

Keep it static first, then add playback and scrubbing in Milestone 4.
