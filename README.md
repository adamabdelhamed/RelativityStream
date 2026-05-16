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

The app currently shows the project title and the basic panel layout. The first
pure TypeScript relativity model is in `src/model/` and covers constant-speed
outbound/inbound travel, ship proper time, signal travel, delayed turnaround
visibility, and apparent stream rates.

The next UI milestone should connect this model to the visible scenario panels.
The visual goal is representative simulation rather than literal webcam video:
an Earth-side scene, a traveler-side space scene, and simple readable objects
whose apparent playback and color can communicate signal delay and Doppler
effects.

See `AGENTS.md` for the product vision and repo workflow rules.
