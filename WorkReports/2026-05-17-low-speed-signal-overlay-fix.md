# Low-Speed Signal Overlay Fix

## What changed

- Fixed the signal propagation overlay distance scaling in `src/App.tsx`.
- Added a component regression test in `src/App.test.tsx` for `0.01c` and `0.5 ly`.
- Added a Playwright e2e regression test in `tests/e2e/app.spec.ts` for the same scenario.

## Why the change was made

The relativity model was producing the correct turnaround time and position. The visual mismatch came from the compact signal overlay using `Math.max(maxDistance, 1)` as its distance scale.

For scenarios where the turnaround distance is below `1 ly`, such as `0.5 ly`, that forced the live ship marker to use a larger scale than the drawn worldline. The worldline still placed the turn point at the far edge, but the amber ship marker only traveled halfway across the diagram before turning.

The overlay now scales positions against the actual scenario maximum distance, with only a tiny epsilon guard for division safety.

## How to run or use it

Run the app and set:

```powershell
npm run dev:host
```

Then use:

- Velocity: `0.01 c`
- Turnaround distance: `0.5 ly`
- Timeline: `50.0 y`

At `50.0 y / 100.0 y`, the amber ship marker should sit at the diagram turn point instead of turning early.

## Automated checks run

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Results:

- Vitest: 2 files passed, 22 tests passed.
- ESLint: passed.
- Build: passed. Vite still reports the existing large chunk warning.
- Playwright: 2 tests passed, including the new low-speed short-distance overlay regression.

## Browser checks performed

- Launched the app locally at `http://127.0.0.1:4174/`.
- Verified the page loads in the Codex in-app browser.
- Verified the signal overlay is present.
- Checked browser console logs; no errors were reported.
- Attempted to drive the exact range-control scenario in the in-app browser. The in-app browser moved the raw range input value but did not trigger React state updates for the timeline control in this environment, so the exact visual alignment was validated through the Playwright browser test instead.

## What Codex could validate independently

- The model math remains unchanged.
- The bug was isolated to SVG overlay coordinate scaling.
- The low-speed short-distance case now has both component-level and browser-level regression coverage.

## What the human owner should review next

- Confirm subjectively that the compact signal overlay reads clearly at very small distances like `0.5 ly`.
- Decide whether the overlay should show a numeric distance scale so low-distance scenarios are easier to interpret.

## Limitations and follow-up

- The current compact overlay still uses a simplified SVG scale rather than extracting a reusable diagram model.
- The Vite build still emits the pre-existing bundle size warning from the large client chunk.
