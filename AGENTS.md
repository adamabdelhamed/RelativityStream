# AGENTS.md

# RelativityStream

RelativityStream is a web-based interactive explanation of special relativity built around a modern, emotionally intuitive metaphor:

> What would a perfect video call look like if one person stayed on Earth and the other traveled near the speed of light?

The goal is not to start with equations, trains, rulers, or abstract clocks. The goal is to let people *experience* relativity through livestreams, latency, timestamps, Doppler shift, signal delay, and synchronized views of the same scenario.

This project should feel like a cinematic interactive demo, not a classroom worksheet.

## Core Vision

RelativityStream teaches relativity by making the user feel that:

- the universe has latency
- reality has ping
- observation is delayed information
- there is no universal “now”
- each observer experiences themselves normally
- remote observers are reconstructed from arriving signals
- outbound motion makes the remote stream slow/redshift
- inbound motion makes the remote stream fast/blueshift
- the turnaround breaks the symmetry in the twin paradox
- final clock comparison resolves the apparent contradiction

The experience should be beautiful, minimal, modern, and emotionally sticky.

Think:

- FaceTime across spacetime
- Netcode for the universe
- a sci-fi mission display
- an interactive spacetime diagram
- an elegant educational toy for adults

Avoid:

- childish classroom visuals
- cluttered textbook UI
- dumping equations before intuition
- fake precision that is not backed by the model
- overbuilding before the core loop works

## Product Shape

The first complete version should be a single-page web app.

The primary experience should include:

1. **Earth View**
   - Earth-local clock
   - received astronaut video/state
   - signal delay
   - apparent playback speed
   - Doppler/redshift/blueshift indication

2. **Astronaut View**
   - astronaut-local clock
   - received Earth video/state
   - signal delay
   - apparent playback speed
   - Doppler/redshift/blueshift indication

3. **Scenario Controls**
   - velocity as a fraction of `c`
   - outbound duration
   - turnaround
   - return leg
   - play/pause/reset
   - scrubber

4. **Signal Propagation View**
   - Earth worldline
   - ship worldline
   - light/message paths
   - current received events
   - delayed visibility of turnaround

5. **Clock Comparison**
   - Earth elapsed time
   - astronaut elapsed proper time
   - ratio
   - final reunion comparison

The user should be able to scrub the scenario and see all views update consistently.

## Technical Direction

Prefer a simple, modern web stack.

Default recommendation unless the repo already chose otherwise:

- TypeScript
- React
- Vite
- Vitest
- Playwright
- SVG or Canvas for visualization
- CSS modules, plain CSS, or lightweight utility classes

Keep the physics/math model independent from React.

Suggested structure:

```text
src/
  app/
    App.tsx
    App.css
  model/
    relativity.ts
    scenario.ts
    signals.ts
    units.ts
  components/
    EarthPanel.tsx
    ShipPanel.tsx
    ScenarioControls.tsx
    SignalDiagram.tsx
    ClockComparison.tsx
  test/
    ...
```

The model layer should be deterministic, unit-tested, and UI-independent.

## Physics Model Rules

Do not fake the core relativity behavior.

For the first iteration, use a simplified 1D special relativity model:

- Earth remains inertial at position `x = 0`
- ship moves outbound at constant velocity `v`
- ship turns around at a defined event
- ship returns at constant velocity `-v`
- light/signals propagate at speed `c = 1`
- use units where `c = 1` by default
- compute Lorentz factor as:

```ts
gamma = 1 / Math.sqrt(1 - v * v)
```

- Earth coordinate time is the global simulation coordinate for the first model
- ship proper time accumulates as:

```ts
dTau = dt / gamma
```

for constant-speed legs.

The app may later support acceleration curves, but the first version should use instantaneous turnaround because it is easier to explain and test.

Always distinguish:

- **coordinate time**
- **proper time**
- **emission time**
- **receive time**
- **apparent stream rate**
- **signal delay**

Do not blur “what is seen” with “what is happening after correcting for light travel time.”

That distinction is the whole point.

## Educational Framing

Use plain-language explanations that resonate with modern users.

Good phrases:

- “Reality has ping.”
- “You never see the present. You see arriving information.”
- “The astronaut is not buffering. The universe is.”
- “The stream slows because signals arrive farther apart.”
- “The turnaround happened before Earth can know it happened.”
- “The return stream fast-forwards because the ship is moving toward the signals it sends.”
- “The reunion is where everybody agrees on the clocks.”

Avoid overclaiming. This is an intuitive simulation, not a replacement for a full relativity course.

When adding copy, prefer short labels and tooltips over long paragraphs.

## Development Philosophy

Work in small, provable steps.

Every meaningful step must include:

1. a clear implementation change
2. appropriate unit tests
3. a browser-based manual verification
4. a short summary of what changed and how it was verified

Do not do giant rewrites.

Do not build speculative features before the current step is testable.

Do not introduce a dependency unless it directly helps the current milestone.

Do not hide broken tests.

Do not leave TODOs in core logic unless the TODO is explicitly part of a tracked future milestone.

## Codex Workflow Rules

When Codex works in this repo, it should proceed iteratively.

For each task:

1. inspect the existing repo
2. identify the smallest useful next step
3. implement that step
4. add or update tests
5. run the relevant automated tests
6. launch the app locally when UI changed
7. use browser automation to manually verify the result
8. report:
   - files changed
   - tests run
   - browser checks performed
   - any limitations or follow-up work

Codex should prefer finishing one coherent slice over starting many.

Codex should not claim success unless tests passed and browser verification was performed when applicable.

If browser verification is not possible due to environment limitations, Codex must say so clearly.

## Manual Browser Verification Requirements

For any UI-visible change, Codex must verify in a browser.

Minimum checks:

- page loads without console errors
- main UI is visible
- controls are usable
- scenario can play or scrub
- displayed values update
- no obvious layout overflow at desktop size
- no obvious broken labels or NaN values

For visualization changes, Codex should verify:

- Earth and ship are visible
- signal lines/messages are visible when expected
- turnaround is represented correctly
- outbound and inbound phases are distinguishable
- scrubber changes the diagram consistently

For educational text changes, Codex should verify:

- copy appears in the intended location
- copy is readable
- copy does not overflow or dominate the interface

## Unit Test Expectations

The model layer must be covered by unit tests.

Important test cases:

- Lorentz factor at `v = 0`
- Lorentz factor increases as `v` approaches `1`
- invalid velocities are rejected
- ship position during outbound leg
- ship position during inbound leg
- ship proper time is less than Earth coordinate time for `v > 0`
- light signal receive time is emission time plus distance traveled
- outbound received stream rate is slower than local time
- inbound received stream rate is faster than local time
- final reunion has Earth elapsed time greater than ship proper time
- turnaround event is not visible to Earth until its signal arrives

Prefer simple deterministic tests over snapshot tests for the physics model.

Use snapshot tests sparingly, if at all.

## UI Design Principles

The interface should be calm, cinematic, and legible.

Prioritize:

- dark background
- high contrast text
- subtle glow
- clean panels
- restrained animation
- large readable clocks
- clear labels
- minimal clutter
- smooth scrubbing
- responsive layout

The app should feel like a mission-control interface crossed with a video-call timeline.

Avoid:

- dense academic diagrams
- rainbow color chaos
- tiny labels
- excessive animation
- unnecessary configuration
- walls of explanatory text

## Accessibility

Do not rely on color alone.

Every redshift/blueshift state should also have text labels or icons.

Controls must be keyboard usable.

Use semantic buttons and inputs where possible.

Prefer readable font sizes.

Avoid animation that cannot be paused.

## Performance

Keep the app fast and smooth.

The first version does not need heavy optimization, but avoid obvious waste:

- do not recompute large histories on every render unless memoized
- keep model functions pure
- keep animation loops simple
- avoid unnecessary dependencies
- avoid storing derived state when it can be computed cleanly

If using Canvas, keep drawing logic isolated and test the model separately.

## Suggested Milestones

### Milestone 1 — Project Skeleton

Create the web app skeleton with test infrastructure.

Acceptance criteria:

- app runs locally
- tests run
- page displays project title and basic layout
- Playwright can open the page

### Milestone 2 — Core Relativity Model

Implement pure TypeScript model functions for:

- Lorentz factor
- scenario phases
- ship position
- ship proper time
- basic signal travel time

Acceptance criteria:

- unit tests cover the core math
- no React dependency in model

### Milestone 3 — Static Scenario Display

Render a fixed scenario:

- Earth clock
- ship clock
- velocity
- outbound/return phase
- final elapsed time comparison

Acceptance criteria:

- values match model tests
- browser verification confirms no NaN or broken UI

### Milestone 4 — Playback and Scrubbing

Add:

- play/pause
- reset
- timeline scrubber
- current simulation time

Acceptance criteria:

- scrubbing updates all displayed values
- playback advances time
- tests cover time clamping and phase transitions

### Milestone 5 — Signal Delay

Show what Earth receives from the astronaut and what the astronaut receives from Earth.

Acceptance criteria:

- received events lag behind emitted events
- turnaround is delayed from Earth’s received perspective
- tests cover receive-time calculations

### Milestone 6 — Apparent Stream Rate

Show outbound slow stream and inbound fast stream.

Acceptance criteria:

- Earth sees astronaut stream slow while outbound
- Earth sees astronaut stream fast while inbound
- labels update correctly
- tests cover apparent rate signs/ratios

### Milestone 7 — Signal Diagram

Add a visual diagram with:

- Earth worldline
- ship worldline
- light/signal paths
- current receive event

Acceptance criteria:

- diagram updates on scrub
- browser verification confirms visibility and consistency

### Milestone 8 — Educational Polish

Add concise explanatory copy and tooltips.

Acceptance criteria:

- explanation supports the current visual state
- text does not overwhelm the app
- browser verification confirms readability

### Milestone 9 — Shareable Demo

Prepare the app for public sharing.

Acceptance criteria:

- polished landing state
- clear default scenario
- responsive layout
- no console errors
- all tests pass

## Tone of the App

The app should make users think:

> “Oh. I finally get why the video would slow down, then speed up, and why the traveler comes back younger.”

The app should feel surprising without being sensationalist.

It should respect the user’s intelligence while avoiding needless academic ceremony.

## Definition of Done

A change is done only when:

- implementation is complete
- unit tests pass
- lint/typecheck passes if configured
- app builds if build tooling exists
- browser verification is completed for UI changes
- the summary clearly states what was verified

No silent failures.

No handwaving.

No “probably works.”

Prove it.

## Work Reports

After each completed Codex task or coherent milestone slice, add a Markdown
entry under `WorkReports/`.

Report file names should be easy to sort and understand:

```text
WorkReports/YYYY-MM-DD-short-task-name.md
```

Each report should explain:

- what changed
- why the change was made
- how to run or use what was built
- which automated checks were run
- which browser checks were performed
- what Codex could validate independently
- what the human owner should review or steer next
- any limitations, setup notes, or follow-up work

Write reports for a reasonably strong software engineer who may not be an
expert in the current frontend stack. Prefer concrete commands and plain
language over framework shorthand.

## Windows Machine Notes

This repo is being worked on from Windows in PowerShell and Visual Studio.

- Assume `rg` may not be available. Use PowerShell commands such as
  `Get-ChildItem`, `Select-String`, and `Get-Content` when searching or reading.
- Be careful with PowerShell path handling. Prefer explicit absolute paths for
  cross-directory operations, and verify path variables before copying,
  deleting, or moving files.
- `Start-Process` on this machine requires separate files for
  `-RedirectStandardOutput` and `-RedirectStandardError`; it rejects using the
  same log file for both streams.
- Avoid noisy shell output made from chained separator commands. Run focused
  commands and summarize the important output in the final response.
- Keep new Markdown and code edits ASCII unless there is a clear reason to use
  non-ASCII characters. The existing `AGENTS.md` has displayed encoding
  artifacts in PowerShell, so avoid adding more punctuation that depends on
  encoding interpretation.
- Git may warn that LF will be replaced by CRLF on Windows. Treat this as a
  normal line-ending normalization warning unless the task is specifically about
  line endings.
- Use npm scripts for common workflows so Visual Studio and terminal usage stay
  simple. Current expected scripts include `npm run dev`, `npm run dev:host`,
  `npm run lint`, `npm test`, `npm run build`, `npm run check`, and
  `npm run test:e2e`.

## Browser Validation Notes

Codex can use automated Playwright tests and the Codex in-app browser to verify
local UI changes. Codex should use those tools for page load, console errors,
basic visibility, layout sanity, and simple interactions.

The human owner should still review product direction and subjective quality:

- whether the metaphor feels right
- whether the educational copy lands clearly
- whether the visual tone matches the desired cinematic mission-control feel
- whether the next milestone is the most useful slice of work

When browser validation is performed, the WorkReports entry should distinguish
between automated Playwright coverage, Codex in-app browser inspection, and any
manual review requested from the human owner.
