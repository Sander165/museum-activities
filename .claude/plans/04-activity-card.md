# 04 — Activity Card

## Purpose

Display one activity and trigger the booking flow.

## Content (from wireframe)

- Type badge (Rondleiding / Workshop / Lezing / Kinderprogramma)
- Time range: `startTime – endTime`
- Title
- Description
- Location
- Availability line + `Reserveer` action

## Availability states

- **Available**: "4 van 12 plekken beschikbaar" → enabled `Reserveer`.
- **Almost full** (low spots, e.g. ≤ ~3): "Nog 3 plekken" + urgency styling.
- **Sold out** (`availableSpots === 0`): "Uitverkocht" / "Vol", button disabled, card visually distinct (muted), not clickable.
- Derive state with a helper (e.g. `getAvailability(activity)`).

## Markup

- `<article>` per card; badge, `<time>` for the range.
- `Reserveer` is a real `<button>`; disabled state uses `disabled` + `aria-disabled`.
- Optional `imageUrl` (Next `<Image>`), with graceful fallback when null.

## Styling

- Color-code type badges per activity type.
- Clear hierarchy: title > meta > description.

## Done when

- All three availability states render correctly; sold-out cannot be booked; clicking `Reserveer` opens the modal for that activity.
