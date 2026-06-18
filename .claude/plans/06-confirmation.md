# 06 — Confirmation

## Purpose

Confirm a successful reservation and offer next steps. Rendered as the second step inside the modal.

## Content (from wireframe)

- Heading: **Reservering bevestigd!**
- Activity title
- Date · time range
- Summary: "{aantal} personen · {locatie}"
- Note: "Een bevestiging is verstuurd naar {email}"

## Actions

- **Terug naar overzicht** → close modal, reset booking state.
- **Nog een activiteit** → close modal, return to overview to pick another.

## Behavior

- Reads last booking details (activity, name, email, party size).
- Overview already reflects the updated `availableSpots`.

## A11y

- Move focus to confirmation heading; announce success (e.g. `role="status"`).

## Done when

- Confirmation shows correct booking summary; both actions return to the overview cleanly with state reset.
