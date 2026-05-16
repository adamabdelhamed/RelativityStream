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

The app currently shows the project title and the basic panel layout. The
relativity model, playback controls, signal timing, and final visualization are
planned for later milestones.

See `AGENTS.md` for the product vision and repo workflow rules.
