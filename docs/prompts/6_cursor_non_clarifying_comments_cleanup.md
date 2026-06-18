# Non clarifying comments cleanup
_Exported on 6/18/2026 at 15:15:13 GMT+2 from Cursor (3.7.42)_

---

**User**

cleanup non clarifying comments

---

**Cursor**

I'll scan the codebase for redundant comments and remove anything that doesn't explain non-obvious logic, starting with the file you have open.


Scanning the rest of the codebase for section-style and redundant comments to remove.


Removing section-divider and redundant comments; keeping ones that explain non-obvious behavior (UTC dates, live activity sync).


Checking for any remaining non-clarifying comments.


Removed section-divider and redundant comments across the project. Kept only comments that explain non-obvious behavior:

- **`ActivityBrowser.tsx`** — why `liveActivity` re-reads from state after booking
- **`utils/date.ts`** — UTC handling for date-only strings
- **`utils/activities.ts`** — `DateGroup` field format examples
- **`next-env.d.ts`** — untouched (Next.js generated file)

**Removed from:**
- `BookingModal.tsx` — JSX section labels (Hero, Form, etc.)
- `BookingModal.module.css`, `ActivityCard.module.css`, `Button.module.css`, `TypeFilter.module.css`, `globals.css` — CSS section headers
- `utils/string.ts`, `utils/activities.ts` — JSDoc that restated the function name

