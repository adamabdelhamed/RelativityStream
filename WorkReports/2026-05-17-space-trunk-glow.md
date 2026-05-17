# Space Tree Trunk Glow

## What changed

- Updated the space-view tree branch palette in `src/ThreeTreeScene.tsx`.
- Changed the space trunk and young branches from dark blue-gray to warm copper and amber.
- Added emissive glow to the space bark materials and preserved that glow during per-frame branch color updates.

## Why

The trunk was too close to the dark space background and hard to notice. The new warm glow contrasts with the cyan leaves and pale fruit while staying visually compatible with the outer-space theme.

## How to run

```powershell
npm run dev
```

Open `http://127.0.0.1:5173/`, click the picture-in-picture panel to switch to Traveler POV, and scrub forward until the tree trunk is visible.

## Automated checks

```powershell
npm run lint
npm run build
```

Results:

- ESLint: passed.
- Production build: passed. Vite still reports the existing large chunk warning from Three.js.

## Browser checks

Verified in Chromium:

- Traveler POV loaded with no console errors.
- Scrubbed to `70.0 y` Earth coordinate time.
- Confirmed the space tree trunk is visibly warm and distinct from the cyan fruit/leaves.

Screenshot:

- `WorkReports/2026-05-17-space-trunk-glow.png`
