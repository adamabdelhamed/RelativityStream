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

- `/home/runner/work/RelativityStream/RelativityStream/.github/workflows/ci.yml`
  - Triggers on pull requests, pushes to `main`, and manual dispatch.
  - Runs `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
  - Uploads `dist` as an artifact (when present) so build output can still be inspected.
  - Contains an optional E2E job that runs on `main` pushes or manual dispatch.
  - E2E installs Playwright browsers and uploads reports/results on failure.

- `/home/runner/work/RelativityStream/RelativityStream/.github/workflows/deploy-pages.yml`
  - Triggers on pushes to `main` and manual dispatch.
  - Builds with a GitHub Pages base path and deploys `dist` using official Pages actions.

### Live site URL

After Pages is enabled for this repo, the expected site URL is:

- `https://adamabdelhamed.github.io/RelativityStream/`

### Branch protection and required checks

Enable branch protection for `main` in GitHub repository settings and require status checks before merge.
Recommended required checks:

- `Lint, unit tests, and build`
- optionally `E2E (optional)` if you want E2E required on `main`/manual runs only

Suggested settings:

- Require pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging

### Manual rerun and rollback

- Rerun: open the workflow run in GitHub Actions and use **Re-run jobs**.
- Rollback: revert the bad `main` commit (or restore an earlier commit), then push; deployment will republish automatically.

### Other static hosting options

This project can be deployed to Netlify, Cloudflare Pages, or Vercel with the same build output:

- Install: `npm ci`
- Build: `npm run build`
- Publish directory: `dist`

Only deployment wiring changes; core CI checks stay the same.
