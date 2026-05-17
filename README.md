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

## GitHub CI and deployment

This repository uses GitHub Actions for validation and static hosting on GitHub Pages.

### Workflows

- `.github/workflows/ci.yml`
  - Triggers on pushes to `master`.
  - Runs `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
  - Builds with a GitHub Pages base path and deploys `dist` using official Pages actions.
  - Requires GitHub Pages to be enabled once in repository settings (Build and deployment source: GitHub Actions).
  - Uses one workflow for validation and deployment to avoid duplicate Actions runs.

### Live site URL

After Pages is enabled, the site URL pattern is:

- `https://<username>.github.io/<repository-name>/`

### Branch protection and required checks

Enable branch protection for `master` in GitHub repository settings and require status checks before merge.
Recommended required checks:

- `Build, test, and deploy`

Suggested settings:

- Require pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging

### Manual rerun and rollback

- Rerun: open the workflow run in GitHub Actions and use **Re-run jobs**.
- Rollback: revert the bad `master` commit (or restore an earlier commit), then push; deployment will republish automatically.

### Other static hosting options

This project can be deployed to Netlify, Cloudflare Pages, or Vercel with the same build output:

- Install: `npm ci`
- Build: `npm run build`
- Publish directory: `dist`

Only deployment wiring changes; core CI checks stay the same.
