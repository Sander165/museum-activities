# Modal close button issue on mobile
_Exported on 6/18/2026 at 15:15:25 GMT+2 from Cursor (3.7.42)_

---

**User**

The modal close button doesnt work on mobile, fix this

---

**Cursor**

Investigating the BookingModal close button — likely a touch/z-index or pointer-events issue on mobile.


Checking stacking and whether hero content overlaps the close button on smaller screens.


The close button sits under `.heroContent`, which stacks above it in the DOM. On the shorter mobile hero, that content overlaps the button and intercepts taps.


The close button was being blocked by overlapping hero layers on mobile.

**Cause:** `.heroContent` and `.heroScrim` are absolutely positioned over the hero. On mobile the hero is shorter (168px vs 200px), so the title and metadata extend upward and sit on top of the close button in the stacking order. Taps hit those divs instead of the button.

**Fix:** In `BookingModal.module.css`:
1. Added `pointer-events: none` to `.heroScrim` and `.heroContent` so touches pass through the decorative overlays
2. Added `z-index: 1` to `.closeButton` so it stays above other hero layers

Verified at a 390px mobile viewport: the close button receives taps and closes the modal correctly.

---

**User**

Make sure this is the same styling for both dialogs

---

**Cursor**

Searching the codebase for dialog/modal components to compare their styling.


Restructuring the modal so the close button stays fixed while the body scrolls, and unifying shell styling for the form and confirmation steps.


Both modal steps (booking form and confirmation) now share the same shell and close-button behavior.

**What was inconsistent**
- The close button lived inside the hero, so hero text could block taps on mobile.
- The whole panel scrolled, so the close button could scroll away on the longer form step but stay visible on confirmation.
- The confirmation actions section didn’t match the form’s bordered section divider.

**What changed**

1. **Shared shell** — Close button is a direct child of `.panel` (not inside the hero), with `z-index: 2`, so it works the same on both steps and breakpoints.

2. **Scroll split** — The panel uses flex layout: fixed hero header + scrollable `.body`. The close button stays visible while form content scrolls.

3. **Hero layers** — All hero children use `pointer-events: none` so decorative overlays never intercept taps.

4. **Matching sections** — `.confirmationActions` now uses the same top border and padding as `.form`.

5. **Focus style** — Restored `:focus-visible` on the close button for keyboard users.

The booking form and confirmation steps now use the same modal chrome, close button styling, and interaction behavior on desktop and mobile.

