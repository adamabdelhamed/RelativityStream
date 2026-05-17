# 2026-05-17 CI Pages workflow dedup on master

## What changed

- Updated `.github/workflows/ci.yml`.
  - Consolidated to a single job that runs `npm ci`, lint, unit tests, and build.
  - Added GitHub Pages deploy steps (`configure-pages`, `upload-pages-artifact`, `deploy-pages`).
  - Set trigger to push on `master`.
  - Removed optional E2E job to keep one clear auto-publish pipeline.
- Removed duplicate deployment workflows:
  - `.github/workflows/deploy-pages.yml`
  - `.github/workflows/static.yml`
- Updated `README.md` workflow and branch-protection sections to match the new single workflow and `master` branch trigger.

## Why the change was made

The repo had multiple overlapping Pages workflows. Recent runs showed one newer
static workflow succeeding while the existing deploy workflow had previously
failed before Pages was enabled, and both introduced duplicated deployment
paths. Consolidating to one workflow on `master` keeps CI behavior predictable:
push to `master` always validates and publishes.

## How to run or use what was built

- Push a commit to `master`.
- GitHub Actions runs `.github/workflows/ci.yml`.
- The same workflow lints, tests, builds, and deploys the built `dist` to
  GitHub Pages.

## Automated checks run

Before editing:

- `npm ci`
- `npm run check`

After editing:

- `npm run check`

## Browser checks performed

No UI-visible code changed. Browser verification was not required for workflow
and documentation-only updates.

## What Codex could validate independently

- Confirmed branch list includes `master` and not `main`.
- Confirmed duplicate Pages workflows existed before this change.
- Confirmed local lint, unit tests, and build pass after workflow/doc updates.

## What the human owner should review or steer next

- Confirm branch protection required checks match the new job name:
  `Build, test, and deploy`.
- Verify the next `master` push publishes expected built content at the Pages
  URL.

## Limitations, setup notes, or follow-up work

- This change intentionally removes the optional E2E workflow job from CI to
  satisfy a single auto-publish pipeline request.
