# 00 — Overview & Architecture

## Goal

Museum Activity Calendar: browse activities grouped by date, filter by type, reserve a spot via a booking flow, see a confirmation. Spots update live after booking.

## Stack

- Next.js 16 App Router, TypeScript, CSS Modules.
- No layout libraries. Keep HTML semantic.

## Component tree

```
app/page.tsx                 (Server: loads activities.json)
└─ ActivityBrowser           (Client: owns filter + booking state)
   ├─ Header                 (static)
   ├─ TypeFilter             (filter by activity type)
   ├─ ActivityList           (groups by date)
   │  └─ DateGroup
   │     └─ ActivityCard     (→ opens modal)
   └─ BookingModal           (form → confirmation, both states)
```

## State (lives in `ActivityBrowser`)

- `activities` — local copy of data so `availableSpots` can update after booking.
- `activeFilter: ActivityType | "all"`.
- `selectedActivity` — drives the modal (null = closed).
- `bookingStep: "form" | "confirmed"` + last booking details.

## Data flow

1. Server reads `data/activities.json`, passes to client browser.
2. Filter is derived (no mutation).
3. Booking decrements `availableSpots` in local state, then shows confirmation.

## Build order

Foundations → Card → List → Filter → Modal → Confirmation → polish.

## Out of scope

Real backend/persistence, auth, payments. Booking is client-side only.
