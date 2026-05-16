# 2026-05-16 - Turnaround Distance And Ghost Signal

## What Changed

This iteration made the turnaround event easier to notice and cleaned up the
scenario controls.

Updated:

- `src/App.tsx`
- `src/App.css`
- `src/App.test.tsx`
- `tests/e2e/app.spec.ts`

Added screenshot:

```text
WorkReports/2026-05-16-turnaround-distance-ghost-signal.png
```

## Control Changes

Velocity is now constrained to:

```text
0.01 c to 0.99 c
```

Added a turnaround distance slider:

```text
0.5 ly to 100.0 ly
```

The trip duration is derived from:

```text
outbound duration = turnaround distance / velocity
```

Removed the large Slower/Faster buttons. Velocity is now adjusted by the slider.

## Turnaround Signal Changes

The signal propagation overlay now highlights the turnaround signal pulse. It
uses a brighter, thicker white pulse with a `turnaround signal` label so the
special beam does not look like every other signal.

The ghost ship marker is now part of the signal propagation diagram, as a faded
yellow traveler circle. It represents where Earth's received stream implies the
traveler is, not where the traveler is in the current coordinate-time slice.

## Verification

Commands run:

```powershell
npm test
npm run check
npm run test:e2e
```

Results:

- Vitest passed: 2 files, 18 tests
- ESLint passed with no warnings
- Production build passed
- Playwright e2e passed

Codex in-app browser verified:

- turnaround distance slider is visible
- default distance is `4.8 ly`
- Slower/Faster buttons are gone
- signal overlay is visible
- browser console errors: 0

Screenshot was captured with Playwright at the turnaround moment.

## Notes

The default scenario still matches the prior timing: `0.80 c` and `4.8 ly`
produce a 6-year outbound leg and a 12-year Earth-coordinate round trip.
