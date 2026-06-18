# Museum redesign plan
_Exported on 6/18/2026 at 15:15:00 GMT+2 from Cursor (3.7.42)_

---

**User**

Create a plan for a full redesign. Create a design for a modern creative museum offering tours, workshops and readings to the public. Use a color palette that feels warm and inviting. Use existing tokens but with new values where needed. 

---

**Cursor**

I'll research the current codebase structure, design tokens, and components before drafting a redesign plan.

Let me explore the full project structure and design tokens.

Let me read the key design files: globals.css (tokens), layout, and the main components.

Now let me read the remaining components to understand the full design surface.

Let me read the remaining UI building blocks.

Let me read the remaining component logic files for completeness.

I've reviewed the full project: a Next.js App Router app with CSS-module components and a design-token system in [app/globals.css](museum-activities/app/globals.css). It's a Dutch museum activities/booking app (tours, workshops, readings, kids program) with a clean but neutral, text-only card layout. Notably, each activity has an `imageUrl` that the current design never displays.

One scoping decision shapes the plan significantly, so let me confirm direction before writing it.

> **How far should the redesign go beyond colors?**
> - Full creative redesign (Recommended): warm palette + image-forward cards using the existing imageUrl, a richer hero header, refreshed typography/spacing, and restyled modal/filters/badges ✔
> - Restyle + layout polish, but no card images (keep current text-only cards, just modernize hero, spacing, type, and components)
> - Minimal: only swap the color tokens to a warm palette, keep all layout and structure identical

Let me check the Next.js config to confirm whether remote images are already allowed (relevant for image-forward cards).

I have everything I need. Here's the redesign plan.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Now redesign the Header with a warm hero, kicker label, and serif title.

Now I'll rewrite ActivityCard to be image-forward with an image on the left (media-left layout on wide screens, stacked on mobile) using next/image.

Now warm up Button, BookingModal, and DateGroup. Badge.module.css already picks up the new badge token values automatically, so no changes needed there.

Now update BookingModal.module.css — serif modal title, warm input focus, warm confirmation icon:

Now let's check for linter errors across the changed files and then start the dev server to verify visually.

A dev server is already running on port 3000. Let me navigate the browser to it and take a screenshot.

The page loaded. Let me take a screenshot to verify visually.

The redesign is rendering beautifully. Let me scroll down to verify more cards and states.

Looking great — warm cream background, serif date headings, image cards with badge overlay, golden "almost-full" chip, terracotta CTA buttons. Let me scroll further to see the sold-out state.

All the states are working correctly:
- "Nog 3 plekken" shows in warm gold with a pill background
- "Uitverkocht" shows in terracotta with the soft accent tint chip
- The "Vol" disabled button appears greyed out
- Sold-out card has reduced opacity

Let me also open the booking modal to verify it:

There's a hydration error showing. Let me take a screenshot to inspect and then check if it's pre-existing.

The modal looks excellent - serif title, warm capacity bar in terracotta, warm input styling. The "1 Issue" badge is a Next.js dev overlay. Let me check if the hydration issue is pre-existing or introduced by the redesign.

The hydration issue is pre-existing and unrelated to the redesign — it's the `toLocaleDateString("nl-NL")` call in `utils/date.ts` which differs between server and client locale. My changes don't touch that file.

The modal looks great — serif title, terracotta capacity bar fill, warm inputs. Let me quickly scroll down in the modal to see the submit button and then mark everything complete.

Everything looks polished. The redesign is complete and visually verified. Let me mark the final todo as done.

All 8 todos are complete. Here's a summary of every change made:

**Tokens** (`app/globals.css`) — Warm cream palette throughout: `#faf4ea` background, `#2a211b` espresso text, `#c2410c` terracotta accent. Added `--color-accent-soft` (peach tint), `--color-gold` (ochre), `--font-serif`, and warm-tinted badge colors (clay, ochre, olive, berry). Shadows now use warm amber undertones instead of neutral black.

**Fonts** (`app/layout.tsx`) — Added Fraunces display serif via `next/font/google`, exposed as `--font-fraunces`, applied alongside Geist on `<html>`.

**Hero** (`Header.tsx` + `Header.module.css`) — Warm diagonal gradient background, gold kicker label ("MUSEUMPROGRAMMA"), serif italic `<em>` in the title in terracotta, more generous padding.

**Image cards** (`ActivityCard.tsx` + `ActivityCard.module.css`) — Media-left horizontal layout using `next/image` (stacks vertically on mobile), badge overlaid on the image corner, serif card title, warm lift-on-hover with terracotta accent border, availability chips now use warm pill styling.

**next.config.ts** — Added Unsplash `remotePatterns` for `next/image`.

**Filters** (`TypeFilter.module.css`) — Active pills use terracotta, hover uses the soft peach tint + accent border.

**Remaining components** — `Button.module.css`: warmer disabled color, secondary hover uses peach tint. `DateGroup.module.css`: serif date headings. `BookingModal.module.css`: serif modal/confirmation titles, terracotta input focus border, warm confirmation icon tint.

---

**User**

Can we also redesign the modal, the image could also be reused here. You have full creative freedom to reimagine this. Make sure the buttons are clear and form fields have a logical width.

---

**Cursor**

I'll redesign the booking modal with the activity image as a hero. Let me read the current modal files first.

This is a great enhancement. I'll reimagine the modal with the activity image as a hero banner (text overlaid on a gradient scrim), present for both the form and confirmation steps, with clearer full-width buttons and sensible field widths. Let me rewrite the component.

Now the CSS for the redesigned modal:

The confirmation actions live inside the padded `body`, so its extra padding is redundant. Let me fix that.

Now let me check for lint errors and verify in the browser.

Let me open the modal by clicking the first "Reserveer" button and take a screenshot.

The form looks great — full-width fields, a logically narrow party-size input, and a prominent full-width CTA. Let me scroll up within the modal to see the image hero.

The hero looks excellent. One issue: the badge pill is stretching full-width because flex children stretch by default. Let me fix the hero content alignment.

Now let me fill the form and submit to verify the confirmation step. Let me type into the fields and submit.

Let me fill the email and submit to see the confirmation step.

The confirmation step rendered. Let me take a screenshot to verify it.

The modal redesign is complete and verified across both steps. The badge now sizes correctly after the alignment fix.

Here's what the reimagined booking modal now offers:

**Hero banner (shared across both steps)**
- The activity's `imageUrl` is reused as a full-width hero with a dark bottom-up gradient scrim for legibility (falls back to a warm terracotta→gold gradient when no image exists).
- Overlaid on it: the type badge, the serif activity title in white, and a single meta line combining date · time · location.
- A circular, semi-opaque white close button floats top-right so it stays legible over any image.

**Form step**
- Description + capacity bar sit below the hero, then a clearly separated form section.
- Name and email are full-width; "Aantal personen" is constrained to a logical narrow width (160px).
- Inputs get a warm terracotta focus ring (`box-shadow` using `--color-accent-soft`).
- The submit button is now full-width and prominent with a larger tap target.

**Confirmation step**
- Keeps the same image hero for continuity, then a green success check, serif "Reservering bevestigd!" heading.
- A structured summary card (Wanneer / Waar / Personen) replaces the loose text lines, plus the confirmation email.
- Two equal-width, clearly distinguished buttons (secondary "Terug naar overzicht" + primary "Nog een activiteit"), which stack on narrow screens.

Note: the "1 Issue" Next.js dev overlay is a pre-existing hydration warning from locale date formatting in `utils/date.ts` (`toLocaleDateString("nl-NL")`), unrelated to these styling changes.

---

**User**

Some images are not loading in, why might this be

---

**Cursor**

Looking at the screenshot, two cards show the broken-image icon (Kinderprogramma "Schilderen als Rembrandt" and Rondleiding "Hedendaagse Collectie") while the Lezing card loads fine. Let me check the data for those activities' image URLs.

Let me test the failing URLs versus a working one to confirm the cause.

That confirms it. Here's why those images aren't loading.

**The image URLs themselves return `404 Not Found`** — it's not a code or config problem.

The two broken cards point to Unsplash photo IDs that no longer exist:
- `photo-1596464716127-f2a6d550abd4` (Kinderprogramma: Schilderen als Rembrandt) → **404**
- `photo-1566054757930-a46f0b7ff12a` (Rondleiding: Hedendaagse Collectie) → **404**

A working one like the Lezing card (`photo-1507003211169-0a1dd7228f2d`) returns **200**. So Unsplash has removed/changed those specific photos since the data was written. The browser requests them, gets a 404, and shows the broken-image icon.

These URLs live in [data/activities.json](museum-activities/data/activities.json) (`act-004` and `act-005`), and a few others in that file are likely dead too.

A couple of ways to handle it — want me to do one of these?

1. **Replace the dead URLs** with valid Unsplash photo IDs (I can verify each returns 200 first). Cleanest fix for these specific entries.
2. **Add a graceful fallback** in `ActivityCard` so any image that fails to load is replaced by a warm placeholder (e.g. a gradient + type label) via `next/image`'s `onError`. This makes the UI resilient to any future dead links, not just these two.
3. **Both** — swap the known-dead URLs now and add the fallback for robustness.

I'd recommend option 3. Let me know and I'll implement it. (Note: with `next/image`, a 404 from a remote host shows the broken state; a runtime `onError` fallback needs the card to be a client component or a small wrapper, which I'd add.)

---

**User**

Add a fallback, images can already be null, use the same design if it doesn't load

---

**Cursor**

I'll add an `onError` fallback to both the card and the modal so a failed image renders exactly like the existing `imageUrl === null` design. That requires the card to be a client component (the modal already is).

Now the modal — add the same fallback so a failed image shows the existing gradient `heroFallback`.

Now let me verify in the browser that the previously-broken cards fall back to the text-only design.

The fallback works. The "Kinderprogramma: Schilderen als Rembrandt" card whose image returns 404 now renders exactly like the `imageUrl === null` design — no broken-image placeholder, just the text-only card with the badge and time in the inline meta row. The Lezing card with a valid image still shows its photo.

Done. Here's what I added:

- **`ActivityCard`** ([ActivityCard.tsx](museum-activities/components/ActivityCard/ActivityCard.tsx)): now a client component with `imageFailed` state. `showImage = Boolean(activity.imageUrl) && !imageFailed`. The `next/image` gets an `onError` handler that flips `imageFailed` to `true`, after which the card renders the identical no-image layout (badge + time in the body meta row).
- **`BookingModal`** ([BookingModal.tsx](museum-activities/components/BookingModal/BookingModal.tsx)): same pattern — on image error it falls back to the existing `heroFallback` gradient hero, identical to the null-image case.

Both treat a failed load exactly like a missing image, so there are no broken-image icons regardless of whether the URL is `null` or just dead. The two genuinely dead URLs in [data/activities.json](museum-activities/data/activities.json) (`act-004`, `act-005`) now degrade gracefully — let me know if you'd also like me to swap those for working photo URLs.

