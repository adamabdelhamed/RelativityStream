# Minor Scene Polish

## What changed

- Star-field movement now activates only while playback is running during travel.
- The nearby planet is visible at the start, then shrinks and fades quickly as the traveler leaves Earth. The fade distance gets shorter as ship velocity approaches light speed.
- The space tree trunk and branches use a stronger neon green material and glow.
- Telescope redshift/blueshift styling is much stronger, with both canvas filters and a colored overlay.
- Co-located observed events, including `t = 0`, are now Doppler-neutral instead of redshifted.

## Why

These changes keep visual effects tied to the simulation state instead of wall-clock animation, and make the relativistic telescope effects easier to notice at high velocity.

## How to run or use

Run:

```powershell
npm run dev:host
```

Open `http://127.0.0.1:5173`. At the initial stopped state, the traveler telescope should look neutral with the planet visible. Press Play: stars move, the planet shrinks away quickly, and the outbound traveler telescope becomes strongly redshifted.

## Automated checks

```powershell
npm run check
npm run test:e2e
```

Results:

- `npm run check`: lint, unit tests, and production build passed.
- `npm run test:e2e`: 5 Playwright tests passed.

The existing Vite chunk-size warning remains because Three.js is bundled into the main app chunk.

## Browser checks

Codex in-app browser verification was performed against `http://127.0.0.1:5173`.

Verified:

- Initial Earth POV shows `Traveler appears normal`.
- Initial traveler telescope has `data-signal-shift="neutral"` and no CSS filter.
- Initial star motion is stopped and the nearby planet is visible.
- After playback starts, the traveler telescope advances, star motion becomes active, the planet scale drops to `0.000`, and redshift applies a strong red filter.
- Browser console error log was empty.

## Human review

Please review the subjective strength of the redshift/blueshift treatment. The effect is intentionally representational rather than a physically rendered spectrum.
