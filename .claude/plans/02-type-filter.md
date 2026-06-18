# 02 — Type Filter

## Purpose

Filter the overview by activity type. Label: "Filter op type activiteit".

## Options

`Alles` · `Rondleiding` · `Workshop` · `Lezing` · `Kinderprogramma`
(maps to `ActivityType` + an `"all"` value)

## Behavior

- Single-select; `Alles` is default.
- Controlled by `activeFilter` state in `ActivityBrowser`.
- Filtering is derived — never mutate the activities array.
- Empty result → friendly "geen activiteiten" message.

## Markup

- Semantic group of buttons (e.g. `role="group"`, or radio-style for a11y).
- Active state visually distinct; `aria-pressed` / `aria-current`.
- Keyboard focusable, visible focus ring.

## Styling

- Horizontal pill/tab row, wraps on mobile.

## Done when

- Selecting a type filters the list; counts/groups update; active state clear.
