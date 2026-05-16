# 2026-05-16 - Tree Age And Signal Labels

## What Changed

This iteration fixed the tree-aging visual and made the signal propagation
overlay easier to read.

Updated:

- `src/App.tsx`
- `src/App.css`
- `src/App.test.tsx`
- `tests/e2e/app.spec.ts`

Added screenshot:

```text
WorkReports/2026-05-16-tree-age-signal-labels.png
```

## Tree Aging Fix

The bug was that each tree used its own final local time as the maturity scale.
That meant both trees reached full growth at reunion, even though Earth elapsed
12.0 years and the traveler elapsed only 7.2 years.

The tree visual now uses the same 12-year maturity reference for both scenes.
At reunion:

- Earth tree: `12.0 y`, `local growth rings 12`
- Traveler tree: `7.2 y`, `local growth rings 7`

This makes the traveler-side object visibly younger at reunion.

## Signal Propagation Changes

The signal propagation overlay now sits in the bottom-right of the visual stage.

It also has subtle labels:

- `later` on the vertical/time direction
- `farther from Earth` on the horizontal/distance direction

I added a small `i` info button with a hover tooltip explaining:

```text
Down is later Earth-coordinate time. Right is farther from Earth. Orange
diagonals are ship motion; red pulses are light signals moving back toward
Earth.
```

## Commands Run

```powershell
npm test
npm run check
npm run test:e2e
```

Results:

- Vitest passed: 2 test files, 14 tests
- ESLint passed
- Production build passed
- Playwright passed: 1 Chromium test

## Browser Checks

Codex in-app browser verified:

- signal propagation overlay is visible
- `i` info button is visible
- `later` label is visible
- `farther from Earth` label is visible
- browser console errors: 0

The in-app browser range automation changed the slider DOM value but did not
fire React state updates, so it could not manually scrub to reunion in that
surface. The automated Playwright browser test and Vitest component test did
verify the React state behavior.

I used Playwright to capture the reunion-state screenshot after setting the
timeline to 12 years.

## What To Review

Please review whether the bottom-right overlay placement feels better and
whether the axis labels are subtle enough. The tree divergence is now model
accurate, but the visual difference may still need to be exaggerated for
emotional clarity.
