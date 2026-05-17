# 2026-05-17 GitHub CI and Pages deployment setup

## What changed

- Added GitHub Actions CI workflow at `.github/workflows/ci.yml`.
  - Validates pull requests and `main` pushes with lint, unit tests, and build.
  - Uploads `dist` artifacts for inspection.
  - Adds an optional Playwright E2E stage for `main` pushes and manual runs.
- Added GitHub Pages deployment workflow at `.github/workflows/deploy-pages.yml`.
  - Builds the Vite app and deploys static `dist` output through official Pages actions.
- Updated `vite.config.ts`.
  - Added configurable `base` path support via `VITE_BASE_PATH`.
  - Keeps local development behavior unchanged while supporting project-site deploy paths.
- Updated `README.md`.
  - Documented CI triggers, deployment behavior, expected URL, rerun/rollback flow, and alternative static hosts.
  - Included branch protection and required checks guidance.

## Why this change was made

The repository needed a baseline CI pipeline that blocks broken changes and a deployment path for publishing the app as a static site. GitHub Pages is the fastest path in-repo, and Vite base path control is required for project-page asset routing.

## How to run or use what was built

- CI runs automatically on pull requests and pushes to `main`.
- Optional E2E can run on `main` pushes or manual workflow dispatch.
- Deploy runs automatically on `main` pushes (or manually) and publishes Pages output.

Local equivalents:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e`

## Automated checks run

Before making changes:

- `npm install`
- `npm run lint`
- `npm test`
- `npm run build`

After changes:

- To be run in this task after file updates:
  - `npm run lint`
  - `npm test`
  - `npm run build`
  - `npm run test:e2e`

## Browser checks performed

No direct UI logic changed. Browser behavior is expected to remain unchanged. Existing Playwright E2E tests are used as automated browser verification for this task.

## What Codex could validate independently

Codex validated baseline lint, unit tests, and build before editing. Post-change validations are run in the same task and reflected in commit history and workflow files.

## What the human owner should review or steer next

- Enable GitHub Pages in repository settings if not already enabled.
- Configure branch protection on `main` with required checks.
- Decide whether optional E2E should remain non-blocking or become required.

## Limitations, setup notes, or follow-up work

- Branch protection cannot be enabled from repository code alone; it must be set in GitHub repository settings.
- `npm ci` currently fails locally due to package-lock synchronization drift; CI expects lockfile consistency and may need a lockfile refresh in a follow-up if this persists.
