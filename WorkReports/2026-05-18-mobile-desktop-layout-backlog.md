# Mobile / Desktop Layout Backlog

## What changed

- Added a central layout mode decision in `App.tsx` for `desktop`, `mobile-landscape`, and `mobile-portrait`.
- Moved the active POV metadata into a compact row near the top of the view so the main scene has more vertical room.
- Made the desktop Signal propagation panel draggable and resizable, with bounded movement.
- Added a mobile secondary-view selector for Stream and Telescope.
- Changed mobile defaults so the stream is shown first and the Signal propagation panel is hidden until Telescope is selected.
- Added mobile landscape placement for the secondary view on the right side at about 60% viewport height.
- Added mobile portrait placement with the primary POV on top, secondary view below it, and compact controls at the bottom.
- Added a small 3D scene focus offset for mobile landscape so the primary subject is framed toward the left half.
- Adjusted mobile primary camera framing to zoom out and look lower so more of the tree and ground remain visible.
- Reduced mobile secondary view size in both landscape and portrait.
- Corrected mobile selector labels so Telescope always shows the remote POV and Signal always shows Signal propagation.
- Restored mobile tap-to-switch behavior on the Telescope/remote POV panel.
- Removed the completed mobile / desktop items from `src/Backlog.md`.

## Why

The previous layout used mostly desktop assumptions across viewport sizes. The backlog called for explicit layout modes and a mobile model where only one secondary view is shown at a time, with telescope/signal behavior no longer floating, draggable, or resizable on mobile.

## How to run

```powershell
npm run dev:host
```

Then open the printed local URL and test desktop, mobile landscape, and mobile portrait viewport sizes.

## Automated checks run

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Results:

- Unit tests: 32 passed.
- Lint: passed.
- Build: passed. Vite still reports the existing large chunk warning for the Three.js bundle.
- Playwright e2e: 5 passed.

## Browser checks performed

Using the Codex in-app browser against `http://127.0.0.1:4175/`:

- Desktop 1280x720 loaded without console errors.
- Main UI, canvases, PIP, Signal propagation overlay, and controls were visible.
- Play/pause worked and the timeline scrubber updated displayed values without `NaN`.
- Desktop Signal propagation overlay could be dragged and resized.
- Mobile landscape 667x375 used `mobile-landscape`, kept the secondary view on the right, defaulted to Stream, and switched to Telescope without drag/resize controls.
- Mobile landscape 667x375 used `mobile-landscape`, defaulted to Telescope/remote POV, tapped the remote POV to switch the main POV, and switched to Signal without drag/resize controls.
- Mobile portrait 390x844 used `mobile-portrait`, defaulted to Telescope/remote POV, kept controls visible with a wide scrubber, opened the More controls menu, and switched to Signal without drag/resize controls or overlap with the bottom rail.

## Independently validated

Codex validated the functional behavior, viewport placement, selector state, absence of console errors, and no obvious layout overlap at the checked desktop and mobile sizes.

## Human review

Please review the subjective framing of the mobile landscape subject placement on a real phone if possible. The implementation exposes the mode and constants clearly, but the exact subject framing may still benefit from product-direction tuning.

## Limitations and follow-up

- Browser validation used emulated viewport sizes in the in-app browser and Playwright, not a physical device.
- During hot reload, the in-app browser retained an old React hook dependency warning from a previous bundle version. A restarted dev server and Playwright e2e run validated the final behavior; the retained in-app browser log entry predates the final reload.
- The build continues to warn about a large bundled chunk because Three.js is included in the main app bundle.
