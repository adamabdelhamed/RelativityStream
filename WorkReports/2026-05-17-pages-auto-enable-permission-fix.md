# 2026-05-17 Pages auto-enable permission fix

## What changed

- Updated `.github/workflows/deploy-pages.yml`.
  - Removed `with: enablement: true` from `actions/configure-pages@v5`.
- Updated `README.md`.
  - Documented the one-time GitHub Pages setup requirement.
  - Documented why workflow-based auto-creation is not used with the default token.

## Why the change was made

The deploy workflow failed at `actions/configure-pages@v5` when trying to auto-create
the Pages site. Logs showed:
"Create Pages site failed. Error: Resource not accessible by integration".
That endpoint requires repository-admin capability that the default workflow token
does not have.

## How to run or use what was built

- In repository settings, enable GitHub Pages once:
  - **Settings > Pages > Build and deployment > Source = GitHub Actions**.
- Re-run **Deploy to GitHub Pages** (manual dispatch or push trigger).

## Automated checks run

Before editing:

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

After editing:

- `npm run lint`
- `npm test`
- `npm run build`

## Browser checks performed

No UI-visible code changed. Browser verification was not required for this workflow
and documentation update.

## What Codex could validate independently

- Confirmed the failing run and exact error from GitHub Actions logs:
  - run `25996682379`
  - job `76412300502`
  - failure at `actions/configure-pages@v5` with
    "Create Pages site failed. Error: Resource not accessible by integration".
- Confirmed local lint, tests, and build pass after the workflow/doc changes.

## What the human owner should review or steer next

- Confirm Pages is enabled in repository settings.
- Re-run the deploy workflow once and verify the published site URL.
- Optionally decide whether deploy push triggers should include `master` in addition
  to `main`, depending on default branch strategy.

## Limitations, setup notes, or follow-up work

- This change removes a failing auto-enable path tied to insufficient token scope.
- It does not grant repository-admin permissions to workflows; if true auto-creation
  is still desired, use a separate admin-scoped token and an explicit opt-in step.
