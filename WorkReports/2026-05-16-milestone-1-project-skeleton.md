# 2026-05-16 - Milestone 1 Project Skeleton

## What Changed

This task turned the repository from a single planning Markdown file into a
working web app skeleton for RelativityStream.

Added:

- Vite, React, and TypeScript app scaffold
- Vitest unit test setup
- Playwright end-to-end smoke test setup
- A first static RelativityStream UI shell
- Basic interactive controls for the skeleton: Play/Pause, Reset, and velocity
  adjustment
- npm scripts for common local workflows
- WorkReports process notes in `AGENTS.md`
- Windows-machine notes in `AGENTS.md`

The UI is intentionally still a skeleton. It does not implement the relativity
model yet. It gives us the page frame that later milestones can fill with
tested model behavior.

## How To Run It

From the repository root:

```powershell
npm install
npm run dev
```

The dev server prints a local URL, normally:

```text
http://localhost:5173/
```

For the exact host used by automated browser tests:

```powershell
npm run dev:host
```

That serves the app at:

```text
http://127.0.0.1:5173/
```

## Useful Scripts

```powershell
npm run lint
```

Runs ESLint over the project.

```powershell
npm test
```

Runs Vitest unit/component tests.

```powershell
npm run build
```

Runs TypeScript build checks and creates a production Vite build.

```powershell
npm run check
```

Runs lint, unit tests, and production build together.

```powershell
npm run test:e2e
```

Runs the Playwright browser smoke test.

## First-Time Browser Test Setup

Playwright was installed by npm, but its Chromium browser runtime was not
present on this machine yet. I installed it with:

```powershell
npx playwright install chromium
```

If a future machine reports a missing Playwright browser executable, run that
command once.

## What I Verified

Automated checks:

```powershell
npm run check
npm run test:e2e
```

Results:

- ESLint passed
- Vitest passed: 1 test file, 2 tests
- Production build passed
- Playwright passed: 1 Chromium smoke test

Codex in-app browser checks:

- Opened `http://127.0.0.1:5173/`
- Confirmed page title is `RelativityStream`
- Confirmed the main heading is visible
- Confirmed Earth, astronaut, signal propagation, controls, and comparison
  panels are visible
- Clicked Play and confirmed the button changes to Pause
- Clicked Faster and confirmed the velocity display changes to `0.85 c`
- Clicked Reset and confirmed the velocity display returns to `0.80 c`
- Checked browser console errors: 0

Screenshot from browser verification:

```text
WorkReports/2026-05-16-milestone-1-skeleton.png
```

## What Codex Can Validate

Codex can independently validate a lot of mechanical frontend quality:

- dependency installation
- lint, tests, and production builds
- local dev server startup
- whether the page loads in a browser
- console errors
- whether expected UI text and controls are visible
- basic button clicks and form interactions
- simple layout sanity at the tested viewport

Playwright is good for repeatable checks. The Codex in-app browser is useful
for manual inspection after a UI change.

## What You Should Still Review

You should steer the subjective and product parts:

- whether the tone feels like the intended cinematic mission-control interface
- whether the visual density feels right
- whether the first screen is too sparse or too busy
- whether labels and copy match the intuition you want users to build
- whether the next slice should be the pure physics model or more visible UI
  framing

My recommendation is to do Milestone 2 next: build the pure TypeScript model
with deterministic tests before adding more UI behavior.

## Plan Suggestions

The current milestone plan is feasible on this Windows machine.

Suggested refinements:

- Keep Milestone 2 entirely model-layer and test-driven. No React dependency.
- Add a `src/model/` folder before adding more UI components.
- Keep Playwright smoke tests small until the UI has real behavior. Use Vitest
  for the physics math.
- Keep WorkReports per completed slice so the project history remains readable.
- Avoid adding visual libraries until the model and first diagram requirements
  are clearer.

## Machine Notes Learned

- PowerShell is the active shell.
- npm and Node are available. Observed versions:
  - Node: `v24.12.0`
  - npm: `11.6.2`
- The Vite generator did not scaffold directly into the non-empty repo root, so
  I generated into a temporary sibling folder and copied the scaffold in.
- PowerShell `Start-Process` requires separate stdout and stderr redirect files.
- Git reported that `AGENTS.md` line endings may normalize from LF to CRLF on a
  future Git operation. That appears to be normal Windows line-ending behavior,
  not a functional problem with this change.
- The existing `AGENTS.md` displays encoding artifacts for some punctuation in
  PowerShell, so I kept new documentation ASCII-only.
