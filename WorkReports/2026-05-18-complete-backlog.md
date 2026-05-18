# Complete Backlog

## What changed

- Fixed playback restart when the timeline is at the end by treating the rounded scrubber maximum as an end state.
- Simplified the main POV pills so Earth shows turnaround visibility and the apparent traveler aging rate, while Traveler shows distance from Earth and the apparent Earth aging rate.
- Added model-level Doppler color-shift helpers and tests for redshift, blueshift, observed signal motion, and observed stream rate.
- Applied redshift/blueshift data attributes and visual CSS filters to received telescope streams.
- Brightened the Earth scene with a clearer blue-sky horizon and adjusted Earth camera framing.
- Removed the background planet from the Traveler scene, animated the star field, and changed the space tree trunk/branches toward neon green to contrast with blue leaves.
- Cleared completed items from `Backlog.md`.

## Why

The backlog items were all visible product defects or UX issues in the current interactive demo. The changes keep the core physics behavior in the model layer and leave the UI responsible for labels and rendering effects.

## How to run or use

Run the app with:

```powershell
npm run dev:host
```

Open `http://127.0.0.1:5173`, scrub or play the timeline, and switch POVs by clicking the telescope panel. Earth should not see the fast return stream until the return signal arrives; the Traveler POV switches apparent Earth aging immediately at turnaround.

## Automated checks

```powershell
npm test
npm run check
npm run test:e2e
```

Results:

- `npm test`: 34 tests passed.
- `npm run check`: lint, unit tests, and production build passed.
- `npm run test:e2e`: 5 Playwright tests passed.

The production build still reports Vite's existing chunk-size warning for the Three.js bundle.

## Browser checks

Codex in-app browser verification was performed against `http://127.0.0.1:5173`.

Verified:

- Page loads with title `RelativityStream`.
- Main Earth POV, telescope panel, signal overlay, canvases, and controls are visible.
- Simplified Earth pills show turnaround visibility and apparent slow traveler aging.
- Received traveler telescope stream reports `data-signal-shift="redshift"` while outbound.
- Timeline keyboard scrubbing updates displayed clock values without `NaN`.
- Pressing Play at the end restarts playback from the beginning.
- Browser console error log was empty.

Playwright e2e also covered desktop interaction, low-speed diagram alignment, long tree generations, portrait mobile controls, and mobile landscape secondary view placement.

## Human review

Please review whether the brighter Earth horizon and symbolic star movement feel right for the cinematic mission-control tone. The star motion is intentionally symbolic, not a physically exact aberration or Doppler visualization.

## Limitations and follow-up

- Telescope color shifting is applied as a CSS filter to received canvas views. The model owns the shift decision, but the visual treatment is still representational.
- The chunk-size warning remains because Three.js is bundled into the main app chunk; this was not part of the backlog work.
