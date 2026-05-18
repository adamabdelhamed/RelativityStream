# Layout and UX Backlog

## Independent Items

### Move view metadata into the top of each view

**Problem:** Vertical gap between the global `Relativity Simulator` title and the main POV title (e.g., `Earth local experience`) with pills like `Local clock 0.0y` makes the middle of the screen feel cramped.

**Desired Behavior:** Move per-view title and metadata pills to the top of the view as a compact horizontal row:

```text
Earth local experience    Local clock 0.0y    Observing traveler
```

**What needs to change:**

- Desktop has less vertical dead space between the global app title and the main visualization.
- The main POV title and related pills appear as a compact horizontal header inside or near the top of the view.
- The view content area gains meaningful vertical space.
- No overlap with the simulation canvas.

---

### Make Signal propagation panel draggable on desktop

**Current Behavior:** Signal propagation panel is resizable but not draggable on desktop.

**Desired Behavior:** The Signal propagation panel should be both resizable and draggable.

**What needs to change:**

- Desktop users can drag the Signal propagation panel.
- Existing resize behavior still works.
- Dragging does not interfere with resizing.
- Panel remains bounded so it cannot be lost completely off-screen.
- Mobile behavior unchanged: telescope/signal view is not draggable or resizable on mobile.

---

### Introduce explicit layout modes

**Problem:** Layout logic needs clear centralization for desktop, mobile landscape, and mobile portrait.

**Desired Behavior:** The app should have a single, stable way to determine and apply layout mode.

**What needs to change:**

- Layout mode can be determined consistently (desktop, mobile-landscape, mobile-portrait).
- Mobile landscape and mobile portrait do not share accidental desktop layout assumptions.
- The code has a clear place where layout constants are defined.
- Raw viewport checks are not scattered across the app.

---

### Mobile landscape: primary POV full-screen with subject centered in left half

**Dependencies:** Requires layout mode detection.

**Desired Behavior:** In mobile landscape, the primary POV fills the screen with the tree/subject centered inside the left half, leaving room for the secondary view overlay on the right.

**What needs to change:**

- Primary POV remains full-screen in mobile landscape.
- Tree/subject is visually centered in the left half, not the whole screen.
- Secondary overlay does not cover the main subject.
- Framing remains stable while the simulation runs.
- Manual pan/zoom auto-camera opt-out behavior still applies.

---

### Mobile landscape: secondary stream overlay on the right

**Dependencies:** Requires layout mode detection; pairs with "primary POV full-screen with subject centered in left half."

**Desired Behavior:** In mobile landscape, the streamed POV overlay appears on the right half of the screen, taking about 60% of viewport height with reasonable inset.

**Tunable constants:**

```text
mobileLandscapeOverlayHeightRatio = 0.60
mobileLandscapeOverlayInset = ...
mobileLandscapeOverlayWidthRatio = ...
```

**What needs to change:**

- Secondary view is placed on the right side.
- It does not overlap the primary subject.
- Height is approximately 60% of viewport height and tunable.
- Insets are visually reasonable.
- No drag/resize handles appear on mobile.

---

### Mobile portrait: primary POV top, secondary view bottom

**Dependencies:** Requires layout mode detection.

**Desired Behavior:** In mobile portrait, the layout uses a top/bottom split instead of left/right, with the primary POV dominant.

**Layout:** 
```text
+-----------------------------+
|       primary POV           |
|       current view          |
+-----------------------------+
|       secondary view        |
+-----------------------------+
|       compact controls      |
+-----------------------------+
```

**What needs to change:**

- Portrait does not use the landscape side-by-side strategy.
- Primary POV has enough vertical space to feel useful.
- Secondary view is clearly subordinate.
- Controls remain visible and compact.
- Nothing overlaps the bottom control bar.

---

### Rename incoming stream label

**Desired Behavior:** Replace `Incoming stream` with dynamic labels like `Telescope view of traveler` or `Telescope view of earth` depending on which POV is being viewed.

**What needs to change:**

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

### Add mobile secondary-view selector

**Dependencies:** Requires "Mobile: hide Signal propagation panel by default" and layout mode detection.

**Desired Behavior:** On mobile, provide a compact way to choose what appears in the secondary view area (Stream or Telescope).

**Potential UI options:**
- Small segmented control
- Compact pill toggle
- Secondary-control menu item
- Minimal icon/text toggle

**What needs to change:**

- User can switch between stream and telescope view on mobile.
- The selected mode is visually obvious.
- The selector does not crowd the simulation.
- The telescope view uses the same secondary slot as the stream view.
- No extra floating panel appears on mobile.

---

### Tighten the player control bar

**Problem:** Bottom controls take too much room and can wrap or become visually heavy.

**Desired Behavior:** The control bar should be shorter, single-line only, compact, stable in height, and usable on desktop and mobile.

**What needs to change:**

- Control bar never wraps.
- Control bar height does not change based on available width.
- Controls remain tappable/clickable.
- Mobile control bar feels intentionally designed.
- Desktop control bar still feels comfortable.

---

### Make the play button smaller

**Dependencies:** Pairs with "Tighten the player control bar."

**Desired Behavior:** The play button should use less space while remaining easy to tap on mobile and visually primary.

**What needs to change:**

- Play button is visually smaller than current implementation.
- It remains easy to tap on mobile.
- It remains visually primary.
- It aligns cleanly with the scrubber.

---

### Remove the Reset button

**Dependencies:** Pairs with "Tighten the player control bar."

**Desired Behavior:** Remove the `Reset` button entirely from the primary control bar.

**What needs to change:**

- Reset button no longer appears in the control bar.
- Layout closes the gap left by Reset.
- No broken references or dead handlers remain.
- If reset functionality is still needed internally, it can remain callable from code, but not visible in this control bar.

---

### Remove the `tnow / tmax` label after the scrubber

**Dependencies:** Pairs with "Tighten the player control bar."

**Problem:** The label immediately after the time scrubber takes too much horizontal space and adds cognitive load.

**Desired Behavior:** Remove that label from the visible control bar.

**What needs to change:**

- The scrubber no longer has a visible `tnow / tmax` label after it.
- Scrubber gains more horizontal room.
- No layout gap remains where the label used to be.

---

### Compact the secondary control list

**Dependencies:** Pairs with "Tighten the player control bar."

**Desired Behavior:** Secondary controls (Play speed, Traveler speed, Traveler distance, Full screen toggle) should become visually compact with no visible borders, minimal padding, and small text/icon footprint.

**What needs to change:**

- Secondary controls are less visually dominant.
- Buttons do not have visible borders.
- Controls still show current values clearly where relevant.
- Full screen toggle is included as a secondary control option.

---

### Add full screen toggle

**Dependencies:** Pairs with "Compact the secondary control list."

**Desired Behavior:** The control bar needs a full screen toggle so mobile users can remove browser chrome.

**What needs to change:**

- Full screen toggle is available from the secondary controls.
- Works in browsers that support the Fullscreen API.
- Gracefully handles unsupported browser/platform cases.
- Does not break layout when hidden, disabled, or unsupported.
- On mobile, this should be easy to discover but not consume primary scrubber space.

---

### Collapse secondary controls into a 3-dot menu when space is constrained

**Dependencies:** Requires "Add full screen toggle" and "Compact the secondary control list."

**Desired Behavior:** The secondary control list should collapse into a 3-dot menu based on available space, keeping controls expanded in landscape views but collapsing in typical mobile portrait.

**Collapse heuristic:**
- Define minimum useful scrubber width (e.g., 180px).
- Evaluate: `availableControlBarWidth - playButtonWidth - secondaryControlsExpandedWidth - requiredGaps`.
- If remaining scrubber width would be below minimum, collapse secondary controls.
- Use measured widths where possible instead of brittle viewport-only thresholds.

**What needs to change:**

- Secondary controls are expanded on desktop and reasonable mobile landscape views.
- Secondary controls collapse in typical mobile portrait views.
- Scrubber remains usable when controls are collapsed.
- Control bar remains one line.
- 3-dot menu exposes: Play speed, Traveler speed, Traveler distance, Full screen toggle.
- No control is lost when collapsed.

---

### Desktop validation

**Dependencies:** All desktop-visible items should be complete before this validation pass.

**Validation scenarios:**
- Wide desktop window
- Medium desktop window
- Narrow desktop window above mobile threshold
- Signal propagation panel visible
- Signal propagation panel dragged
- Signal propagation panel resized
- Stream overlay visible

**What to verify:**

- Desktop still feels mostly like the original experience.
- Header/title spacing is improved.
- No major layout regressions.
- Signal panel drag and resize both work.

---

### Mobile landscape validation

**Dependencies:** All mobile landscape items should be complete before this validation pass.

**Validation scenarios:**
- Mobile landscape with browser dev tools
- Real device if possible

**What to verify:**

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

### Mobile portrait validation

**Dependencies:** All mobile portrait items should be complete before this validation pass.

**Validation scenarios:**
- Mobile portrait with browser dev tools
- Real device if possible

**What to verify:**

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

