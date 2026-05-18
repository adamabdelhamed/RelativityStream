# RelativityStream Layout Backlog

The relativity system is stable. This backlog focuses on making the layout feel first-class across desktop and mobile without destabilizing the simulation logic.

Primary goals:

- Preserve the current working relativity behavior.
- Improve visual openness on desktop.
- Make mobile landscape and portrait intentionally designed instead of merely responsive.
- Tighten the player controls so they never wrap or consume too much vertical space.
- Treat the secondary stream view and signal/telescope view as mutually selectable mobile views.

---

## Guiding Principles

1. **Do not rewrite simulation logic.**
   - This is primarily a layout, sizing, and interaction pass.
   - Avoid touching relativity math, event timing, signal propagation, or camera simulation unless needed to expose layout parameters.

2. **Desktop should receive minor polish only.**
   - Preserve the current desktop mental model.
   - Improve spacing, top-title layout, and panel interaction.

3. **Mobile should become first-class.**
   - Landscape and portrait should have explicit layout strategies.
   - Avoid overlap-prone “desktop squeezed down” behavior.

4. **Controls must remain one line.**
   - The bottom control bar should never wrap.
   - It should become shorter and more compact.
   - Secondary controls should collapse when space is constrained.

5. **Prefer tunable constants.**
   - Mobile overlay height, insets, collapse thresholds, and minimum scrubber width should be easy to adjust.

---

# Phase 1 — Desktop Header/Layout Polish

## 1. Move view metadata into the top of each view

### Problem

There is a strange vertical gap between the global `Relativity Simulator` title and the main POV title, such as `Earth local experience`, plus pills like `Local clock 0.0y`.

This makes the middle of the screen feel more cramped than necessary.

### Desired Behavior

Move the per-view title and metadata pills to the top of the view itself and lay them out horizontally.

For example:

```text
Earth local experience    Local clock 0.0y    Observing traveler
```

The exact labels may differ based on existing UI, but the visual direction is:

- Title and pills share one horizontal row.
- The row is compact.
- The middle of the view is visually open.
- Avoid stacking title/pills vertically unless space is extremely constrained.

### Acceptance Criteria

- Desktop has less vertical dead space between the global app title and the main visualization.
- The main POV title and related pills appear as a compact horizontal header inside or near the top of the view.
- The view content area gains meaningful vertical space.
- No overlap with the simulation canvas.
- No regression to mobile layout.

---

## 2. Make Signal propagation panel draggable on desktop

### Current Behavior

On desktop, the Signal propagation panel is resizable but not draggable.

### Desired Behavior

The Signal propagation panel should be both:

- Resizable
- Draggable

### Acceptance Criteria

- Desktop users can drag the Signal propagation panel.
- Existing resize behavior still works.
- Dragging should not interfere with resizing.
- Panel should remain bounded enough that it cannot be lost completely off-screen.
- Mobile behavior is unchanged: telescope/signal view is not draggable or resizable on mobile.

---

# Phase 2 — Mobile Layout Architecture

## 3. Introduce explicit layout modes

### Desired Behavior

The app should clearly distinguish between:

- Desktop
- Mobile landscape
- Mobile portrait

Use viewport dimensions and pointer/device heuristics as needed, but the implementation should produce stable modes.

Suggested conceptual modes:

```text
desktop
mobile-landscape
mobile-portrait
```

### Acceptance Criteria

- Layout mode can be determined consistently.
- Mobile landscape and mobile portrait do not share accidental desktop layout assumptions.
- The code has a clear place where layout constants are defined.
- Avoid scattering raw viewport checks across the app.

---

## 4. Mobile landscape: primary POV full screen with centered subject in left half

### Desired Behavior

In mobile landscape:

- The current/local POV takes the entire screen.
- The camera should position the tree/subject so it is centered inside the **left half** of the screen.
- This leaves room for the secondary view overlay on the right.

### Layout Rule

The main canvas still fills the viewport, but camera framing should bias the important subject into this region:

```text
+------------------------------------------------+
|                                                |
|      tree centered here       secondary view    |
|      within left half         overlay on right  |
|                                                |
+------------------------------------------------+
```

### Acceptance Criteria

- In mobile landscape, the primary POV remains full-screen.
- The tree/subject is visually centered in the left half, not the whole screen.
- The secondary overlay does not cover the main subject.
- This framing remains stable while the simulation runs.
- If the user manually pans/zooms, existing auto-camera opt-out behavior should still apply.

---

## 5. Mobile landscape: secondary stream overlay on the right

### Desired Behavior

In mobile landscape:

- The streamed POV overlay appears on the right half of the screen.
- It should take about `60%` of the viewport height.
- It should have a reasonable inset.
- It should clearly read as a secondary view.

### Tunable Constants

Add or centralize constants similar to:

```text
mobileLandscapeOverlayHeightRatio = 0.60
mobileLandscapeOverlayInset = ...
mobileLandscapeOverlayWidthRatio = ...
```

### Acceptance Criteria

- The secondary view is placed on the right side.
- It does not overlap the primary subject.
- It looks intentionally placed, not cramped.
- Height is approximately 60% of viewport height and tunable.
- Insets are visually reasonable.
- No drag/resize handles appear on mobile.

---

## 6. Mobile portrait: primary POV top, secondary view bottom

### Desired Behavior

In mobile portrait:

- The layout uses a top/bottom split instead of left/right.
- The current/local POV remains the dominant view.
- The secondary stream/telescope view appears in the bottom portion.

### Layout Rule

```text
+-----------------------------+
|                             |
|       primary POV           |
|       current view          |
|                             |
+-----------------------------+
|       secondary view        |
|       stream/telescope      |
+-----------------------------+
|       compact controls      |
+-----------------------------+
```

### Acceptance Criteria

- Portrait does not use the landscape side-by-side strategy.
- The primary POV has enough vertical space to feel useful.
- The secondary view is clearly subordinate.
- The controls remain visible and compact.
- Nothing overlaps the bottom control bar.
- No mobile panel is draggable or resizable.

---

# Phase 3 — Mobile Stream vs Telescope View

## 7. Rename incoming stream label

### Current Label

`Incoming stream`

### Desired Label

Use:

```text
Telescope view of traveler
```

or:

```text
Telescope view of earth
```

depending on which POV is being viewed.

### Acceptance Criteria

- All user-facing instances of `Incoming stream` are replaced.
- Label dynamically names the observed target.
- Examples:
  - Earth local view observing traveler: `Telescope view of traveler`
  - Traveler local view observing earth: `Telescope view of earth`

---

## 8. Mobile: hide Signal propagation panel by default

### Desired Behavior

On mobile, do not show the Signal propagation panel by default.

Instead, the user chooses between:

- Stream view
- Telescope/signal view

In this backlog, “telescope view” refers to the Signal propagation panel.

### Acceptance Criteria

- On mobile, the default secondary view is not the Signal propagation panel.
- User can choose between stream view and telescope view.
- Only one secondary view is shown at a time on mobile.
- Mobile telescope view is not draggable.
- Mobile telescope view is not resizable.
- Desktop behavior remains richer: signal panel can be visible, draggable, and resizable.

---

## 9. Add mobile secondary-view selector

### Desired Behavior

On mobile, provide a compact way to choose what appears in the secondary view area.

Options:

```text
Stream
Telescope
```

Potential UI options:

- Small segmented control
- Compact pill toggle
- Secondary-control menu item
- Minimal icon/text toggle

Prioritize clarity and small footprint.

### Acceptance Criteria

- User can switch between stream and telescope view on mobile.
- The selected mode is visually obvious.
- The selector does not crowd the simulation.
- The telescope view uses the same secondary slot as the stream view.
- No extra floating panel appears on mobile.

---

# Phase 4 — Bottom Player Controls

## 10. Tighten the player control bar

### Current Problems

The bottom controls take too much room and can wrap or become visually heavy.

### Desired Behavior

The control bar should be:

- Shorter
- Single-line only
- Compact
- Stable in height
- Usable on desktop and mobile

### Acceptance Criteria

- Control bar never wraps.
- Control bar height does not change based on available width.
- Controls remain tappable/clickable.
- Mobile control bar feels intentionally designed.
- Desktop control bar still feels comfortable.

---

## 11. Make the play button smaller

### Desired Behavior

The play button should use less space.

### Acceptance Criteria

- Play button is visually smaller than current implementation.
- It remains easy to tap on mobile.
- It remains visually primary.
- It aligns cleanly with the scrubber.

---

## 12. Remove the Reset button

### Desired Behavior

Remove the `Reset` button entirely from the primary control bar.

### Acceptance Criteria

- Reset button no longer appears in the control bar.
- Layout closes the gap left by Reset.
- No broken references or dead handlers remain.
- If reset functionality is still needed internally, it can remain callable from code, but not visible in this control bar.

---

## 13. Remove the `tnow / tmax` label after the scrubber

### Problem

The label immediately after the time scrubber takes too much horizontal space and adds cognitive load.

### Desired Behavior

Remove that label from the visible control bar.

### Acceptance Criteria

- The scrubber no longer has a visible `tnow / tmax` label after it.
- Scrubber gains more horizontal room.
- No layout gap remains where the label used to be.
- Simulation time can still be inferred through other UI if already available.

---

## 14. Compact the secondary control list

### Secondary Controls

The secondary control list includes:

- Play speed
- Traveler speed
- Traveler distance
- Full screen toggle

### Desired Behavior

These controls should become visually compact:

- No visible border
- Minimal padding
- Small text/icon footprint
- Still readable and tappable

### Acceptance Criteria

- Secondary controls are less visually dominant.
- Buttons do not have visible borders.
- Controls still show current values clearly where relevant.
- Full screen toggle is included as a secondary control option.

---

## 15. Add full screen toggle

### Desired Behavior

The control bar needs a full screen toggle so mobile users can remove browser chrome.

### Placement

The full screen toggle belongs in the secondary control list.

### Acceptance Criteria

- Full screen toggle is available from the secondary controls.
- Works in browsers that support the Fullscreen API.
- Gracefully handles unsupported browser/platform cases.
- Does not break layout when hidden, disabled, or unsupported.
- On mobile, this should be easy to discover but not consume primary scrubber space.

---

## 16. Collapse secondary controls into a 3-dot menu when space is constrained

### Desired Behavior

The secondary control list should collapse into a 3-dot menu based on available space.

The heuristic should:

- Keep controls expanded in reasonable landscape views.
- Collapse controls in typical mobile portrait views.
- Consider the resulting width available for the time scrubber.
- Prefer giving the scrubber a reasonable usable width.

### Suggested Heuristic

Define a minimum useful scrubber width, for example:

```text
minimumUsefulScrubberWidth = 180px
```

Then evaluate:

```text
availableControlBarWidth
- playButtonWidth
- secondaryControlsExpandedWidth
- requiredGaps
```

If the remaining scrubber width would be below the minimum useful width, collapse secondary controls into a 3-dot menu.

Use measured widths where possible instead of brittle viewport-only thresholds.

### Acceptance Criteria

- Secondary controls are expanded on desktop.
- Secondary controls are expanded in reasonable mobile landscape views.
- Secondary controls collapse in typical mobile portrait views.
- Scrubber remains usable when controls are collapsed.
- Control bar remains one line.
- 3-dot menu exposes:
  - Play speed
  - Traveler speed
  - Traveler distance
  - Full screen toggle
- No control is lost when collapsed.

---

# Phase 5 — Validation Passes

## 17. Desktop validation

### Scenarios

Validate desktop with:

- Wide desktop window
- Medium desktop window
- Narrow desktop window above mobile threshold
- Signal propagation panel visible
- Signal propagation panel dragged
- Signal propagation panel resized
- Stream overlay visible

### Acceptance Criteria

- Desktop still feels mostly like the original experience.
- Header/title spacing is improved.
- No major layout regressions.
- Signal panel drag and resize both work.

---

## 18. Mobile landscape validation

### Scenarios

Validate mobile landscape with browser dev tools and, if possible, a real device.

### Acceptance Criteria

- Primary POV fills the screen.
- Tree/subject is centered in the left half.
- Secondary view appears on the right.
- Secondary view uses about 60% viewport height.
- Controls fit on one line.
- Secondary controls are expanded when there is enough space.
- No overlap between controls, primary subject, and secondary view.
- Telescope view can replace stream view.
- Telescope view is not draggable or resizable.

---

## 19. Mobile portrait validation

### Scenarios

Validate mobile portrait with browser dev tools and, if possible, a real device.

### Acceptance Criteria

- Layout uses top/bottom split.
- Primary POV remains dominant.
- Secondary view appears below primary POV.
- Controls remain one line.
- Secondary controls collapse into 3-dot menu when needed.
- Scrubber remains reasonably wide.
- `tnow / tmax` label is gone.
- Reset button is gone.
- Telescope view can replace stream view.
- Telescope view is not draggable or resizable.

---

# Suggested Implementation Order

1. Refactor layout mode detection into a single clear place.
2. Tighten the bottom control bar:
   - Smaller play button
   - Remove Reset
   - Remove `tnow / tmax`
   - Compact secondary controls
3. Add secondary-control collapse heuristic and 3-dot menu.
4. Add full screen toggle to secondary controls.
5. Move desktop view metadata/title/pills into compact horizontal view header.
6. Implement mobile landscape layout:
   - Primary POV full-screen
   - Camera subject centered in left half
   - Secondary overlay on right
7. Implement mobile portrait layout:
   - Primary top
   - Secondary bottom
8. Add mobile stream/telescope selector.
9. Rename incoming stream labels to `Telescope view of <target>`.
10. Make desktop Signal propagation panel draggable while preserving resize.
11. Perform desktop/mobile validation passes.

---

# Non-Goals

Do not include these in this pass unless required by the layout work:

- Changing relativity math
- Changing signal propagation timing
- Redesigning the entire visual style
- Adding new simulation features
- Adding tutorial content
- Reworking the tree/time visualization
- Rewriting the rendering engine