# 07 — State & Data

## Data loading

- `app/page.tsx` (Server) imports `data/activities.json`, typed as `ActivitiesData`.
- Pass `activities` to the client `ActivityBrowser`.

## Client state (`ActivityBrowser`)

| State              | Type                                 | Purpose                        |
| ------------------ | ------------------------------------ | ------------------------------ |
| `activities`       | `Activity[]`                         | Local copy so spots can update |
| `activeFilter`     | `ActivityType \| "all"`              | Type filter                    |
| `selectedActivity` | `Activity \| null`                   | Open modal / detail            |
| `bookingStep`      | `"form" \| "confirmed"`              | Modal step                     |
| `lastBooking`      | `{ activityId, name, email, party }` | Confirmation summary           |

## Derived (no mutation)

- `visibleActivities` = filter by type.
- `groups` = group + sort by date/time.

## Booking update

- On confirm: copy `activities`, decrement matching `availableSpots` by party size (floor 0), set `lastBooking`, advance step.
- Re-derive availability state so card flips to almost-full / sold-out automatically.

## Helpers (`lib/`)

- `groupByDate`, `formatDutchDate`, `getAvailability`, `isValidEmail`.

## Notes

- State resets on full close (not persisted — matches assessment scope).
- Optional stretch: persist bookings to `localStorage`.

## Done when

- Filtering, booking, spot updates, and confirmation all run off this single source of truth without mutating props.
