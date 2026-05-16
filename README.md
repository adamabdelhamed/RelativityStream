# RelativityStream

RelativityStream is a single-page interactive explanation of special relativity
using the metaphor of a video call across spacetime.

This first iteration is the Milestone 1 project skeleton:

- Vite
- React
- TypeScript
- Vitest
- Playwright

## Local Development

Install dependencies:

```powershell
npm install
```

Run the app:

```powershell
npm run dev
```

Run the app on the same host used by automated browser tests:

```powershell
npm run dev:host
```

Run checks:

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
```

Run the core checks together:

```powershell
npm run check
```

## Current State

The app currently shows a functional visual scenario view. The pure TypeScript
relativity model in `src/model/` drives the Earth clock, traveler proper time,
phase, velocity, signal delay, final clock comparison, compact signal
propagation overlay, and two simulated stream scenes.

The visual goal is representative simulation rather than literal webcam video:
the current Earth-side and traveler-side scenes each include a tree whose
growth is driven by that observer's local elapsed time. Future slices can
replace or supplement the trees with richer objects once the visual grammar is
settled.

See `AGENTS.md` for the product vision and repo workflow rules.
