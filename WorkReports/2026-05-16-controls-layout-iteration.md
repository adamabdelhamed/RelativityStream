# Controls and Layout Iteration

## What changed

- Updated playback behavior so Play restarts from the beginning when the timeline is already at the reunion.
- Changed Reset to reset only the timeline and pause playback. It no longer restores velocity or turnaround distance.
- Preserved timeline progress when velocity or turnaround distance changes. For example, halfway through the trip stays halfway through the revised trip.
- Added simulation speed controls for 0.5x, 1x, 2x, and 4x playback.
- Removed the duplicated `local growth rings` label from the stream scenes.
- Reworked the stage layout so signal propagation is a full-width panel instead of an overlay on the traveler view.
- Reworked the bottom controls into predictable grid rows instead of flex wrapping.
- Normalized the timeline slider max to the same precision shown in the UI so the displayed end state is actually selectable.

## Why

The previous controls mixed scenario reset and timeline reset, which made iteration feel destructive. Scenario edits also jumped the user back to the start, which interrupted exploration. The signal propagation overlay was compact and could cover stream telemetry, while the control rail wrapped based on available width rather than a deliberate layout.

## How to run

```powershell
npm run dev:host
```

Then open:

```text
http://127.0.0.1:5173/
```

## Automated checks

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```

All checks passed.

## Browser checks

Codex opened the app in the in-app browser at `http://127.0.0.1:5173/` and verified:

- page title and main UI loaded
- no browser console errors
- signal propagation no longer overlays either stream view
- horizontal page overflow was removed after the compact slider adjustment
- `local growth rings` text is no longer present
- Play, speed selection, reset, timeline, velocity, POV switching, and received stream updates are covered by the Playwright e2e test

The browser plugin timed out when trying to capture a screenshot, so no manual screenshot artifact was saved for this report.

## What Codex could validate

The interaction contract is covered by component tests and e2e tests:

- Play at timeline end resets to `0.0 y` and starts playback
- Reset keeps velocity and turnaround distance while returning timeline to zero
- velocity and turnaround distance edits preserve progress through the journey
- simulation speed buttons expose pressed state
- the duplicated growth-ring label is gone

## Human review notes

Please review whether the signal propagation panel should stay above the stream views or move below them in the next layout pass. The current change solves the overlap and size problem, but the best placement is a product/design call.

