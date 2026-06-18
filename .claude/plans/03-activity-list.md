# 03 — Activity List (grouped by date)

## Purpose

Render filtered activities grouped by date, in chronological order.

## Grouping logic

- Group by `date`; sort dates ascending, activities by `startTime`.
- Date heading: localized Dutch long date, e.g. "Zaterdag 20 juni 2026".
- Count label per group: "2 activiteiten" (singular/plural aware).
- Helper in `lib/` (e.g. `groupByDate`, `formatDutchDate`).

## Structure

- `ActivityList` maps groups → `DateGroup`.
- `DateGroup`: semantic `<section>` with heading + list of `ActivityCard`.

## Styling

- Sticky or clearly separated date headers.
- Consistent vertical rhythm between groups and cards.

## Done when

- Activities appear under correct date headers, sorted, with accurate counts, reflecting the active filter.
