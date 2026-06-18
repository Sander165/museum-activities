# Date Filter + URL Params Design

**Date:** 2026-06-18  
**Status:** Approved

## Context

The museum activities browser currently manages all state (type filter, modal open/close) in React component state inside `ActivityBrowser`. This means filters are lost on page refresh and cannot be shared via URL. The goal is to move all filter state and modal state into URL search params so that filter combinations are bookmarkable and shareable, and to add a date range filter (from / to) defaulting to today → today+7.

## Hooks

Two generic, reusable hooks — no domain-specific hook.

### `hooks/useParam.ts`

Boolean toggle for a specific key=value pair in the URL. Adapted from react-router pattern to Next.js `next/navigation`.

```typescript
export function useParam(key: string, value: string): [boolean, (active: boolean) => void]
```

- Returns `[isActive, setActive]`
- `setActive(true)` → sets `?key=value` (no-op if already set)
- `setActive(false)` → removes the param if its current value matches `value`
- Uses `router.replace(..., { scroll: false })` — no scroll jump, no history spam
- Uses `useCallback` with correct deps

**Used by:** each TypeFilter button, each ActivityCard's reserve button, BookingModal's close button.

### `hooks/useStringParam.ts`

Free-form string getter/setter for a URL param with an optional default.

```typescript
export function useStringParam(key: string, defaultValue?: string): [string | null, (v: string | null) => void]
```

- Returns `[currentValue, setValue]` where `currentValue` falls back to `defaultValue` when the param is absent
- `setValue(v)` deletes the param when `v === null` or `v === defaultValue` (clean URLs — defaults are never written)
- Same `router.replace` + `scroll: false` pattern

**Used by:** DateFilter's from/to inputs.

## URL Schema

| Param | Type | Default (when absent) | Example |
|-------|------|-----------------------|---------|
| `type` | ActivityType string | `"all"` (show all) | `?type=workshop` |
| `from` | YYYY-MM-DD | today | `?from=2026-06-20` |
| `to` | YYYY-MM-DD | today + 7 days | `?to=2026-06-27` |
| `modal` | activity id | absent = closed | `?modal=act-003` |

Clean URL examples:
- `/` — all types, default week, no modal
- `/?type=rondleiding` — filtered by type, default dates
- `/?from=2026-06-25&to=2026-07-02` — custom date range, all types
- `/?modal=act-003` — modal open, all filters at default

## Components

### New: `components/DateFilter/DateFilter.tsx`

Self-contained date range picker. Computes today and today+7 on mount (client-side only — no SSR date issues since it's a Client Component inside Suspense).

```tsx
export function DateFilter() {
  const today    = /* new Date().toISOString().slice(0, 10) */
  const nextWeek = /* today + 7 days */
  const [from, setFrom] = useStringParam('from', today)
  const [to, setTo]     = useStringParam('to', nextWeek)

  return (
    <div>
      <input type="date" value={from ?? today} onChange={...} />
      <input type="date" value={to ?? nextWeek} onChange={...} />
    </div>
  )
}
```

Constraints: `to` input's `min` is `from`; `from` input's `max` is `to`. Prevents invalid ranges.

### Modified: `components/TypeFilter/TypeFilter.tsx`

Removes `active` and `onChange` props. Each button calls `useParam('type', type)` internally.

```tsx
// Before: <TypeFilter active={activeFilter} onChange={setActiveFilter} />
// After:  <TypeFilter />  (no props needed — self-contained)
```

The "Alles" (all) button is special: active when `type` param is absent. Its setter deletes the param.

### Modified: `components/ActivityCard/ActivityCard.tsx`

Removes `onBook` callback prop. Reserve button calls `useParam('modal', activity.id)` setter with `true`.

```tsx
// Before: <button onClick={() => onBook(activity)}>Reserveer</button>
// After:  button uses useParam('modal', activity.id) → setOpen(true)
```

### Modified: `components/BookingModal/BookingModal.tsx`

Removes `onClose` prop. Close action (✕ button, "Terug naar overzicht" button, Escape key) calls `useParam('modal', activity.id)` setter with `false`.

Still receives `activity` prop from `ActivityBrowser` (needed for display and the `onConfirm` callback which updates `availableSpots`).

### Modified: `components/ActivityBrowser/ActivityBrowser.tsx`

Drops all state (`activeFilter`, `selectedActivity`, `activities` tracking for spots). Reads `useSearchParams()` directly to compute the filtered visible list and the modal's selected activity.

```tsx
export function ActivityBrowser({ initialActivities }) {
  const [activities, setActivities] = useState(initialActivities)  // kept for spot updates
  const searchParams = useSearchParams()

  const typeFilter = searchParams.get('type') ?? 'all'
  const from       = searchParams.get('from') ?? today
  const to         = searchParams.get('to')   ?? nextWeek
  const modalId    = searchParams.get('modal')

  const visible = activities.filter(a =>
    (typeFilter === 'all' || a.type === typeFilter) &&
    a.date >= from &&
    a.date <= to
  )

  const selectedActivity = activities.find(a => a.id === modalId) ?? null

  return (
    <>
      <TypeFilter />
      <DateFilter />
      <ActivityList activities={visible} />
      {selectedActivity && (
        <BookingModal activity={selectedActivity} onConfirm={handleConfirm} />
      )}
    </>
  )
}
```

Note: `activities` state is kept (as a local array) for the spot-decrement on confirm. This is the only remaining React state.

### Modified: `app/page.tsx`

Wraps `ActivityBrowser` in `<Suspense>` — required by Next.js App Router when any descendant calls `useSearchParams()`.

```tsx
<Suspense fallback={<ActivityBrowserSkeleton />}>
  <ActivityBrowser initialActivities={activities} />
</Suspense>
```

## File Changes Summary

| File | Change |
|------|--------|
| `hooks/useParam.ts` | **New** — boolean toggle hook |
| `hooks/useStringParam.ts` | **New** — string param hook |
| `components/DateFilter/DateFilter.tsx` | **New** — date range picker |
| `components/DateFilter/index.ts` | **New** — barrel export |
| `components/TypeFilter/TypeFilter.tsx` | Modify — remove props, use useParam internally |
| `components/ActivityCard/ActivityCard.tsx` | Modify — remove onBook prop, use useParam |
| `components/BookingModal/BookingModal.tsx` | Modify — remove onClose prop, use useParam |
| `components/ActivityBrowser/ActivityBrowser.tsx` | Modify — drop filter state, read searchParams |
| `app/page.tsx` | Modify — add Suspense boundary |

## Filtering Logic

String comparison on ISO dates is safe and correct (`"2026-06-18" >= "2026-06-18"` works lexicographically). No date parsing needed.

```typescript
a.date >= from && a.date <= to  // inclusive range
```

## Verification

1. **Manual test — default state**: Load `/`. Confirm date range defaults to today→today+7, all types shown, no modal.
2. **Manual test — type filter**: Click a type button. Confirm URL updates to `?type=workshop`, list filters, refresh preserves filter.
3. **Manual test — date filter**: Change from/to dates. Confirm URL updates, activities outside range disappear.
4. **Manual test — modal**: Click "Reserveer". Confirm `?modal=act-XXX` appears in URL. Close modal — param disappears.
5. **Manual test — deep link**: Paste `/?type=lezing&from=2026-06-22&to=2026-06-28&modal=act-005` into browser. Confirm correct filter + modal open on load.
6. **Manual test — clean URLs**: Reset all filters to defaults. Confirm URL becomes `/` with no params.
7. **Build check**: `npm run build` passes with no type errors.
