# 2026-05-17 Pages enablement workflow fix

## What changed

- Updated `.github/workflows/deploy-pages.yml`.
  - Added `with: enablement: true` to `actions/configure-pages@v5`.

## Why the change was made

Manual deploy runs were failing at the "Configure GitHub Pages" step with:
"Get Pages site failed... Not Found". This indicates Pages was not initialized
for the repository yet. Enabling the `enablement` option allows the action to
initialize Pages when needed instead of hard-failing.

## How to run or use what was built

- Re-run workflow: **Deploy to GitHub Pages** (manual dispatch is fine).
- The workflow should now proceed past "Configure GitHub Pages" even if Pages
  had not been set up beforehand.

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

No UI-visible code changed. Browser verification was not required for this
workflow-only fix.

## What Codex could validate independently

- Confirmed the failed run and root cause from GitHub Actions logs:
  run `25996566293`, job `76411994463`, failed at
  `actions/configure-pages@v5` with "Get Pages site failed ... Not Found".
- Confirmed all local lint/test/build checks pass after the workflow update.

## What the human owner should review or steer next

- Verify repository Pages settings in GitHub UI now show GitHub Actions as the
  build source after the next successful deploy.
- Optionally confirm whether deploy trigger branch should be `main` or `master`
  to match the repository default branch strategy.

## Limitations, setup notes, or follow-up work

- This change fixes the observed setup failure path; it does not alter branch
  trigger policy (`push` still targets `main` only).
