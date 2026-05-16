# 2026-05-16 - Functional Visualization Slice

## What Changed

This iteration connected the Milestone 2 relativity model to the visible app.
The page is now functional enough to scrub and inspect a basic scenario.

Updated:

- `src/App.tsx`
- `src/App.css`
- `src/App.test.tsx`
- `tests/e2e/app.spec.ts`
- `eslint.config.js`
- `README.md`

Added browser verification screenshot:

```text
WorkReports/2026-05-16-functional-visualization.png
```

## What The App Does Now

The UI now shows model-backed values instead of placeholders:

- Earth elapsed time
- astronaut proper time
- current outbound/inbound/reunion phase
- velocity as a fraction of `c`
- signal delay from the current ship event to Earth
- apparent astronaut stream rate as seen by Earth
- final Earth elapsed time
- final astronaut elapsed time
- final clock gap at reunion

The timeline slider scrubs through the scenario. Play/Pause advances the
coordinate time. Reset returns the scenario to the default velocity and time.

## Basic Visualization

The signal propagation panel now uses an SVG diagram instead of static CSS
placeholder lines.

It shows:

- Earth worldline
- ship outbound and inbound worldline
- turnaround guide line
- current coordinate-time guide line
- current Earth marker
- current ship marker
- a light/signal path marker

This is still a first diagram, not the final cinematic stream simulation. It is
useful because it proves the model can drive visible positions and timing.

## How To Run It

```powershell
npm install
npm run dev
```

Then open the printed local URL. In my browser verification I used:

```text
http://localhost:5173/
```

## Commands Run

```powershell
npm test
npm run check
npm run test:e2e
```

Results:

- Vitest passed: 2 test files, 13 tests
- ESLint passed
- Production build passed
- Playwright passed: 1 Chromium test

## Browser Checks Performed

Using the Codex in-app browser:

- loaded the local app
- confirmed the page title and heading
- confirmed the timeline value appears
- confirmed the SVG signal diagram is visible
- confirmed final Earth time and ship time are visible
- clicked Play and saw Pause
- clicked Faster and saw `0.85 c`
- clicked Reset and saw `0.80 c`
- checked browser console errors: 0

## Tooling Note

After running Playwright, ESLint tried to scan `test-results` even though that
folder is an output artifact. I added `test-results` and `playwright-report` to
ESLint global ignores in addition to `.gitignore`.

## What Codex Can Validate

Codex can now validate that the model is connected to visible UI and that basic
controls update displayed values. The SVG is also inspectable enough to confirm
that the diagram exists and changes are not blank.

## What You Should Still Review

The subjective visual direction still needs human steering:

- whether this diagram is the right stepping stone toward the richer experience
- how literal or abstract the Earth-side stream should feel
- whether the traveler-side object should be a cube, probe, ship, or another
  readable object
- how much spacetime diagram detail should share the screen with the simulated
  stream views

## Recommended Next Step

The next meaningful slice should improve the representative stream panels:

- add a simple animated traveler object, likely a cube or probe
- add an Earth-side visual reference scene
- keep the visuals driven by the same model state
- avoid adding heavy 3D dependencies until we know the visual grammar works
