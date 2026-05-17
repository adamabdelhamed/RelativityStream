# Radial Tree Piles and Stream Labels

## What changed

- Replaced the single vertically growing dust heap with small per-generation dust piles.
- Offset each tree generation around the scene so dead tree piles accumulate around the ground plane instead of stacking upward.
- Changed branch end caps to reuse the branch material, removing the bright ball-like tips.
- Removed the large visible `RelativityStream` hero title from the stage.
- Changed the small top label from `Reality has ping` to `Relativity Simulator`.
- Changed picture-in-picture stream labels to use `Incoming Stream` instead of only `POV`.
- Raised the picture-in-picture resize limit so it can grow close to the viewport size instead of stopping at the old fixed cap.
- Updated unit and Playwright e2e expectations for the new labels.

## Why

The old dust metaphor read as a pile growing vertically rather than a sequence of dead trees leaving traces over time. The new placement keeps each dead-tree trace low and spatial, while the next tree sprouts from a nearby radial point. The branch tip material change removes the tennis-ball visual at branch ends.

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

Codex verified the running app in the in-app browser at `http://127.0.0.1:5173`.

- Page loaded without console errors.
- `Relativity Simulator` appeared and the old large `RelativityStream` heading was absent.
- Picture-in-picture label showed `Traveler POV Incoming Stream`.
- Play/pause updated displayed time values.
- WebGL scenes were active with no renderer fallback.
- Picture-in-picture resize grew from `340x210` to `825x490`, confirming the old fixed maximum was removed.

The Playwright e2e suite also verified timeline scrubbing, controls, PIP drag/resize, POV switching, and signal overlay behavior.

## Human review

Please review the visual feel of the radial pile spacing and pile scale. The implementation keeps the piles intentionally low and restrained, but the exact radius and generation count are subjective product-tuning choices.

## Limitations and follow-up

- The scene currently prebuilds eight visible generations. That is enough to establish the radial pile behavior without a larger rendering cost, but a future pass could make the generation window recycle for very long scenarios.
- The app title in the browser tab remains `RelativityStream`; only the oversized on-stage title was removed.
