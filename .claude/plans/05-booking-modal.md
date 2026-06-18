# 05 — Booking Modal

## Purpose

Show activity detail + collect a reservation. Hosts both the form and confirmation steps.

## Detail header (from wireframe)

- Type · weekday date · time range
- Title, location
- Full description
- Availability: "4 van 12 plekken beschikbaar" + visual indicator (e.g. capacity bar)

## Form fields (minimum required)

- **Naam** (text, required)
- **E-mailadres** (email, required, validated)
- **Aantal personen** (number, min 1, max = `availableSpots`)
- Submit: **Bevestig reservering**
- Helper note: "Je ontvangt een bevestiging per e-mail. Gratis annuleren tot 24 uur van tevoren."

## Behavior

- Open from a card; `selectedActivity` drives content.
- Client validation; block submit > available spots.
- On submit → decrement `availableSpots` in state → switch to confirmation step.
- Close via ×, backdrop click, and `Esc`.

## A11y

- `role="dialog"`, `aria-modal`, labelled by title.
- Focus trap + return focus to trigger on close.
- Labels tied to inputs; inline error messages.

## Styling

- Centered overlay + backdrop; scroll-locked body; responsive (full-screen on mobile).

## Done when

- Valid submission updates spots and advances to confirmation; invalid input is blocked with clear errors; modal is keyboard-accessible.
