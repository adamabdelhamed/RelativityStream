# Ever Expanding Decay Piles

## What changed

- Changed tree generation placement from a two-radius orbit to an expanding spiral based on the generation index.
- Added deterministic lifecycle helpers for reached generations, active decay pile generations, and generation ground points.
- Changed persistent decay piles so no pile mesh is created for a fresh generation at startup.
- Removed the initial Earth-side mound that looked like a preexisting dust pile.
- Updated unit and Playwright e2e coverage for long generation runs.

## Why

The old placement reused the same small set of radii, so later trees could overlap earlier death sites. The new placement keeps the golden-angle distribution but lets the radius keep growing, which makes the accumulated dead-tree piles read as an expanding history instead of a capped object pool.

## How to run

```powershell
npm run dev:host
```

Then open the local Vite URL, usually:

```text
http://127.0.0.1:5173
```

## Automated checks

```powershell
npm test
npm run check
npm run test:e2e
```

All checks passed. `npm run check` also ran lint and the production build. Vite reported the existing large chunk warning after build.

## Browser checks

Codex verified the app in the in-app browser at `http://127.0.0.1:5175`.

- Page loaded with the WebGL canvas visible.
- The initial Earth tree reported no active decay pile generations.
- No browser console errors were reported during the page-load check.
- Playwright e2e also verified the long timeline case at `675.0 y`, with visible generations `2,3,4,5,6,7,8,9` and decay piles `0,1,2,3,4,5,6,7,8`.

## Human review

Please review the subjective spacing of the expanding spiral. The behavior is now unbounded by design, but the growth coefficient can still be tuned if the piles spread too slowly or too quickly.

## Limitations and follow-up

- The visible live-tree object pool still recycles eight tree meshes for performance.
- Persistent decay pile meshes are created as the timeline reaches decaying generations, then hidden again if the user scrubs back before those generations decay.
