# Compact Control Rail

## What changed

- Reworked the bottom control rail so it stays as a shorter single-line control surface.
- Made the play button smaller while keeping it visually primary.
- Removed the visible Reset button from the primary rail.
- Removed the `tnow / tmax` text after the scrubber so the timeline gets more horizontal space.
- Made secondary controls more compact with minimal border treatment.
- Added a fullscreen toggle that uses the browser Fullscreen API when available and safely no-ops when unsupported.
- Collapsed secondary controls behind a three-dot `More controls` menu at portrait mobile widths so the rail keeps only Play, the scrubber, and the menu button visible.
- Replaced `Incoming Stream` copy with dynamic telescope labels:
  - `Telescope view of traveler`
  - `Telescope view of earth`
- Removed the completed related items from `src/Backlog.md`.

## Why

These backlog items all affected the same UI surface. Doing them together avoided repeatedly changing the control rail layout and kept the tests aligned with the new interaction model.

## How to run

```powershell
npm run dev:host
```

Open the Vite local URL shown in the terminal. On this machine during validation, ports `5173` through `5175` were already occupied, so Vite used:

```text
http://127.0.0.1:5176/
```

## Automated checks

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```

Results:

- Lint passed.
- Vitest passed: 28 tests.
- Vitest passed after the final collapse update: 29 tests.
- Build passed.
- Playwright passed after the final collapse update: 4 tests.

Build note: Vite still reports the existing large chunk warning for the bundled app output. This did not fail the build.

## Browser checks

Codex in-app browser checked the local Vite app at `http://127.0.0.1:5176/`.

Verified:

- Page loaded with no console errors.
- Main POV, picture-in-picture stream, and signal propagation panel were visible.
- Control rail rendered at desktop width with no horizontal overflow.
- Reset was absent from the visible rail.
- Fullscreen toggle was present.
- Portrait mobile control rail collapsed secondary controls into `More controls`, leaving the scrubber wide.
- `Incoming Stream` no longer appeared in visible copy.
- Telescope label appeared as `Telescope view of traveler`.
- Playback changed displayed clock values.
- No visible `NaN` values were present.

Playwright e2e additionally verified exact scrubber-driven model updates, popovers, PIP drag/resize/click behavior, signal overlay behavior, and console cleanliness.

## What to review next

The next high-value slice is still the responsive layout work: introduce explicit layout modes, then use that foundation for mobile landscape and portrait secondary-view behavior.
