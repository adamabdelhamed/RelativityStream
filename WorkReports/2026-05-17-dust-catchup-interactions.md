# Dust Accumulation And Catch-Up Interactions

## What changed

- Added a persistent 3D dust pile to the tree renderer so tree deaths accumulate visible residue across lifecycles.
- Added dust pile tunables in `src/tunables.ts`:
  - `TREE_MAX_HEIGHT_UNITS`
  - `TREE_DUST_PILE_HEIGHT_PER_DEATH_RATIO`
  - `TREE_DUST_PILE_RADIUS_UNITS`
- Set the starting accumulation rate to `0.01`, meaning 100 complete tree deaths build a pile as tall as the mature tree.
- Updated the picture-in-picture view so it renders the model-backed received remote stream, not the remote side's current local clock.
- Changed outside-click dismissal for numeric popovers to blur first, which commits valid text edits instead of cancelling them.
- Hardened picture-in-picture and signal overlay drag behavior:
  - document-level pointer move/up/cancel handling
  - pointer-id filtering
  - browser text selection disabled while dragging
  - context menu suppressed during and shortly after drag/resize
  - WebGL canvas pointer events disabled inside the PIP frame

## Why

The tree lifecycle now communicates accumulated time scale. If an observer receives a fast catch-up stream and several lifecycles pass too quickly to perceive individually, the dust heap still gives a persistent visual clue that those cycles happened.

The PIP model fix matters because catch-up only makes sense when the inner view is the observer's received stream. Earth should see the traveler tree at the ship emission time that has reached Earth; the traveler should see the Earth tree at the Earth emission time that has reached the ship.

## How to run

```powershell
npm run dev
```

Open `http://127.0.0.1:5173/`.

To inspect the catch-up behavior, use the default scenario, scrub near the end of the trip, then click the picture-in-picture panel to switch POV and compare the received Earth stream.

## Automated checks

```powershell
npm test -- --run
npm run lint
npm run build
npm run test:e2e
```

Results:

- Vitest: 2 files passed, 21 tests passed.
- ESLint: passed.
- Production build: passed. Vite still reports the existing large chunk warning from Three.js.
- Playwright e2e: 1 Chromium test passed.

## Browser checks

Verified in Chromium at `http://127.0.0.1:5173/`:

- Page loaded with no console errors.
- Desktop layout displayed the full-screen Earth POV, PIP, signal overlay, and bottom controls.
- Scrubbing late in the default timeline showed Earth local time at `220.0 y` and received traveler time at `87.2 y`, confirming the PIP uses received ship time.
- Switching to traveler POV near the late timeline showed traveler local time and received Earth stream time separately, confirming the reciprocal received-stream mapping.
- Clicking outside an edited distance popover committed `72.0 ly`.
- PIP resize increased width by about 70 px, stopped on pointer up, and suppressed the browser context menu.

Screenshots:

- `WorkReports/2026-05-17-dust-catchup-desktop.png`
- `WorkReports/2026-05-17-dust-catchup-traveler.png`

## Owner review

Please review the visual weight of the persistent dust pile. The current default follows the requested 1% per tree death, so it is intentionally subtle for the default two-lifecycle Earth timeline and becomes more meaningful when experimenting with faster or longer received streams.
