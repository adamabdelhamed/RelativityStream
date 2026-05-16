# 2026-05-16 - POV Received Stream Controls

## What Changed

This iteration added a point-of-view control so the app can distinguish a local
observer's own experience from the delayed remote stream that observer receives.

Updated:

- `src/model/signals.ts`
- `src/model/relativity.test.ts`
- `src/App.tsx`
- `src/App.css`
- `src/App.test.tsx`
- `tests/e2e/app.spec.ts`

Added screenshot:

```text
WorkReports/2026-05-16-pov-received-stream.png
```

## Behavior

The default POV is Earth.

In Earth POV:

- Earth view shows Earth's local present.
- Traveler view shows the traveler event whose light has arrived at Earth.
- At `t = 6.0 y`, Earth sees the traveler stream from about `3.3 y` Earth
  coordinate emission time, with the ship clock around `2.0 y`.

In Traveler POV:

- Traveler view shows the traveler's local present.
- Earth view shows the Earth event whose light has arrived at the ship.
- At `t = 6.0 y`, the traveler sees Earth from `1.2 y`, while the ship clock is
  `3.6 y`.

This is the first pass at the original "perfect light-speed live stream"
framing: the remote panel is no longer another simultaneous local present.

## Model Additions

Added inverse signal helpers:

- `shipEmissionTimeReceivedOnEarth`
- `earthEmissionTimeReceivedOnShip`

These answer: given a receive time, which remote emission event has arrived?
The UI uses these helpers to choose the correct remote tree age and telemetry.

## How To Use It

Use the segmented POV control in the bottom rail:

- `Earth POV`
- `Traveler POV`

The selected observer is local. The other panel becomes the delayed received
stream.

## Commands Run

```powershell
npm test
npm run check
npm run test:e2e
```

Results:

- Vitest passed: 2 test files, 17 tests
- ESLint passed
- Production build passed
- Playwright passed: 1 Chromium test

## Browser Checks

Codex in-app browser verified:

- Earth POV is selected by default
- Traveler POV control is visible
- received traveler stream label is visible in Earth POV
- local Earth telemetry is visible
- browser console errors: 0

Playwright verified interactive control behavior, including switching to
Traveler POV after scrubbing the timeline.

## Notes

The signal equations are still the simplified instantaneous-turnaround 1D model.
That is consistent with the current milestone plan and enough to drive the
received-stream distinction.
