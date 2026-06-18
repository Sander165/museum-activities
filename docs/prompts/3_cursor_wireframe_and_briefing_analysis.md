# Wireframe and briefing analysis
_Exported on 6/18/2026 at 15:14:39 GMT+2 from Cursor (3.7.42)_

---

**User**

Analyse the wireframes & briefing. @museum-activities/.claude/context/norday-front-end-assessment-briefing.pdf  @museum-activities/.claude/context/norday-front-end-assessment-wireframes.pdf structured plans for each section. Keep the plans small and to the point.
  I want multiple plans in md saved md files for each of the different components.

---

**Cursor**

I'll start by reading the briefing and wireframes PDFs to understand the requirements.

Now let me look at the existing project structure to understand the current state.

Let me check the full project structure and remaining config.

I've analyzed the briefing and wireframes. Here's my understanding:

- **Goal**: A Museum Activity Calendar (Next.js 16 App Router, TypeScript, CSS Modules) where visitors browse activities grouped by date and reserve spots.
- **Three states** from the wireframe: (1) activity overview with type filter, (2) booking modal with form, (3) confirmation.
- **Data**: 27 activities in `data/activities.json`, typed in `types/activity.ts`. Includes sold-out (`availableSpots: 0`) and almost-full cases.

I'll create small, focused plan files per component in `.claude/plans/`.

I'll write all the plan files now.

Done. I analyzed the briefing + wireframes and wrote eight small, focused plans in `.claude/plans/`:

| File | Covers |
|------|--------|
| `00-overview.md` | Architecture, component tree, state, build order, scope |
| `01-layout-header.md` | Page shell, header, intro, design tokens |
| `02-type-filter.md` | Type filter bar (Alles / Rondleiding / …) |
| `03-activity-list.md` | Date grouping, sorting, count labels |
| `04-activity-card.md` | Card content + available / almost-full / sold-out states |
| `05-booking-modal.md` | Detail header + reservation form |
| `06-confirmation.md` | Confirmation step + next-step actions |
| `07-state-and-data.md` | Data loading, client state, booking spot updates, helpers |

Key decisions baked in (reasonable defaults, flag if you'd prefer otherwise):
- **Client-side state in a single `ActivityBrowser`** as the source of truth, with the Server Component (`page.tsx`) just loading the JSON. Booking updates `availableSpots` locally, no backend.
- **Modal hosts both the form and confirmation** as two steps (`bookingStep`), matching the three wireframe states.
- **Availability derived via a helper** so sold-out/almost-full styling and disabled booking stay consistent.
- Plans intentionally describe *what/why* per component rather than full code, so they stay small.

A couple of things I left open for you to confirm during build: the exact "almost full" threshold (I assumed ≤ ~3 spots, matching the wireframe's "Nog 3 plekken") and whether to add the optional `localStorage` persistence stretch.

Want me to start implementing from these plans (beginning with foundations + the activity card), or adjust any plan first?

---

**User**

Continue building the plans one by one, when a plan is done let me review it first. 

---

**Cursor**

Starting with **01 — Layout & Header** since it's the foundation everything else sits on. Let me read the current files before touching anything.

Good. Now I'll implement the layout + header plan: update `layout.tsx`, expand `globals.css` with design tokens, create a `Header` component with its CSS Module, and wire up `page.tsx`.

Now create the `Header` component:

Now update `page.tsx` to wire in the header and stub the page shell:

Clean. Let me do a quick sanity check that the dev server can compile:

Build passes. Here's what was done for **01 — Layout & Header**:

**`app/layout.tsx`**
- `lang="nl"` (Dutch)
- Metadata updated to real title + description
- Dropped the unused mono font

**`app/globals.css`**
- Full design token set: colours (background, surface, border, text, muted, accent), type-badge colours per activity type, spacing scale, type scale, radii, shadows, layout vars (`--content-max-width`, `--content-padding`)
- Minimal reset + base body styles
- `.sr-only` utility class for a11y

**`components/Header/Header.tsx` + `Header.module.css`**
- Semantic `<header>` with `<h1>` and intro `<p>`, content-column constrained to `--content-max-width`
- Responsive: h1 scales down on narrow screens

**`app/page.tsx`**
- Loads `activities.json`, typed as `ActivitiesData`, passes data down (ready for `ActivityBrowser`)
- Header rendered; placeholder for what comes next

Ready to move on to **02 — Type Filter** when you are.

---

**User**

Conitnue

---

**Cursor**

Moving to **02 — Type Filter**. Let me read the plan first.

The filter needs its own label/display names for the Dutch UI. I'll create the `TypeFilter` component plus the shared `ActivityBrowser` client wrapper that owns the state (since filter state needs to live somewhere, and the browser will also own booking state later).

Now create `ActivityBrowser` — the client wrapper that owns `activeFilter` state and renders the filter. It'll grow in later plans to own booking state too.

Wire `ActivityBrowser` into `page.tsx`:

Clean build. Here's what was done for **02 — Type Filter**:

**`components/TypeFilter/TypeFilter.tsx`**
- Stateless, controlled component — accepts `active` + `onChange` from parent
- `role="group"` + `aria-labelledby` for the label; each button uses `aria-pressed`
- `FILTERS` constant defines all five options with their Dutch labels

**`components/TypeFilter/TypeFilter.module.css`**
- Pill-style buttons with a clear active state (filled dark)
- Wraps on narrow screens; focus ring on `:focus-visible`

**`components/ActivityBrowser/ActivityBrowser.tsx`**
- Client component that owns `activeFilter` state (will grow to own booking state in later plans)
- Passes filtered `visible` array down (derived, no mutation)
- Empty state message when no activities match

**`app/page.tsx`**
- Server component loads JSON, hands off to `ActivityBrowser`

Ready to move on to **03 — Activity List** when you say so.

---

**User**

continue

---

**Cursor**

Moving to **03 — Activity List**. Reading the plan first.

---

**User**

Continue

---

**Cursor**

Good. I'll create the `lib/` helpers, `ActivityList`, `DateGroup`, and a stub `ActivityCard` (the real card comes in plan 04). Then wire it into `ActivityBrowser`.

Now a minimal stub `ActivityCard` so the tree compiles (the real implementation is plan 04):

Now update `ActivityBrowser` to use `ActivityList` and wire in the `onBook` callback stub:

Clean. Here's what was done for **03 — Activity List**:

**`lib/activities.ts`**
- `groupByDate` — groups activities by ISO date, sorts dates ascending, activities within each group by `startTime`
- `formatDutchDate` — uses `Intl` (`nl-NL`) to produce "Zaterdag 20 juni 2026"; UTC-anchored to avoid timezone shifts on date-only strings
- `capitalise` — uppercases the first letter (nl-NL locale returns lowercase weekday names)

**`components/ActivityList`**
- Maps groups → `DateGroup`; delegates the empty state here

**`components/DateGroup`**
- Semantic `<section>` with a `<header>` containing the date `<h2>` + count badge
- Renders a `<ul role="list">` of `ActivityCard` items

**`components/ActivityCard`** (stub)
- Minimal placeholder so the tree compiles — replaced in plan 04

**`ActivityBrowser`** updated
- Now holds the local `activities` copy (ready for spot decrements in plan 05)
- Passes `visible` to `ActivityList` + `onBook` stub

Ready for **04 — Activity Card** on your go.

---

**User**

Move the activities utils to a util folder, create different files and only group utils that match together

---

**Cursor**

Good call. Currently `lib/activities.ts` mixes three unrelated concerns. I'll split them into a `utils/` folder with focused files.

Three distinct concerns: string formatting, date formatting, activity grouping. Each gets its own file.

Update the import in `ActivityList` and delete the old `lib/` file:

Clean. The `utils/` folder now has three focused files:

| File | What it holds |
|------|--------------|
| `utils/string.ts` | `capitalise` — general string helpers |
| `utils/date.ts` | `formatDutchDate` — Intl date formatting |
| `utils/activities.ts` | `groupByDate`, `DateGroup` — activity-domain logic (imports from `date.ts`) |

`lib/` is gone. Ready for **04 — Activity Card**?

---

**User**

continue

---

**Cursor**

First I'll add the availability helper to `utils/activities.ts`, then replace the card stub.

Now replace the stub `ActivityCard` with the full implementation:

Clean. Here's what was done for **04 — Activity Card**:

**`utils/activities.ts`** (extended)
- `getAvailability` — returns `"available" | "almost-full" | "sold-out"`, threshold at ≤ 3 spots

**`components/ActivityCard/ActivityCard.tsx`**
- Type badge (colour-coded per type via CSS custom properties), `<time>` for range, title, description, location with a pin icon
- Three availability states: normal text / amber "Nog N plekken" / red "Uitverkocht"
- `Reserveer` button: enabled normally, `disabled` + `aria-disabled` when sold out, label becomes "Vol"
- Sold-out card gets `opacity: 0.6` and suppressed hover

**`ActivityCard.module.css`**
- Badge colours pull from the tokens set in `globals.css`
- Clear visual hierarchy: badge+time → title → description → footer (location + availability + CTA)
- Smooth hover lift via `box-shadow` transition

Ready for **05 — Booking Modal** on your go.

---

**User**

don't use abbreviations like bookBtn for styling, keep it clear

---

**Cursor**

Just the one offender: `bookBtn`. Renaming it to `bookButton` in both files.

Done. `bookBtn` → `bookButton` in both the component and its CSS module. I'll keep this convention going — no abbreviations in class names from here on. Ready for **05 — Booking Modal**?

---

**User**

Continue

---

**Cursor**

Plans 05 and 06 belong together — the modal hosts both steps. Let me also check the current `ActivityBrowser` before touching it.

I'll build the modal + confirmation as one component (`BookingModal`), then wire everything into `ActivityBrowser`. Starting with a utility for email validation, then the modal itself.

Now the modal — it contains both the booking form step and the confirmation step:

Now wire everything into `ActivityBrowser` — add the full booking state and render the modal:

Clean. Here's what was done for **05 + 06 — Booking Modal & Confirmation**:

**`utils/validation.ts`** — `isValidEmail` regex, isolated from the modal logic.

**`components/BookingModal/BookingModal.tsx`**
- Two steps in one component: `"form"` and `"confirmed"`
- Detail header: type badge, Dutch date + time, title, location, description, capacity bar (fills proportionally via inline `width`)
- Form: name, email, party size — all validated inline; errors clear on change; party size is capped to `availableSpots`
- `role="dialog"` + `aria-modal` + `aria-labelledby`; Escape closes; backdrop click closes; focus returns to trigger on close; confirmation heading gets focus on step change
- Body scroll locked while open via `overflow: hidden`
- Mobile: slides up from bottom (sheet pattern)

**`components/ActivityBrowser/ActivityBrowser.tsx`**
- `handleConfirm` decrements `availableSpots` immutably — card availability updates instantly after booking
- `liveActivity` lookup keeps the modal in sync with updated spot counts (so the capacity bar reflects the new state if re-opened)

That completes all 7 plans. The full flow — browse → filter → reserve → confirm — is now working end to end. Want me to do a final pass for polish or anything you spotted during review?

