# TypeScript type for activities JSON
_Exported on 6/18/2026 at 15:14:08 GMT+2 from Cursor (3.7.42)_

---

**User**

@museum-activities/data/activities.json Create me a typescript type

---

**Cursor**

I'll read `activities.json` and scan the project for existing TypeScript patterns so the new type matches the codebase.


Creating;
 add a TypeScript types file from the JSON shape, including nullable `description` and `imageUrl`.


I've added `types/activity.ts` based on the structure of `activities.json`:

- **`ActivityType`** — union of the four activity categories
- **`Activity`** — a single activity (with `description` and `imageUrl` as `string | null`, since some entries use `null`)
- **`ActivitiesData`** — the root object with an `activities` array

Usage with your JSON file:

```typescript
import activitiesData from "@/data/activities.json";
import type { ActivitiesData, Activity } from "@/types/activity";

const data = activitiesData as ActivitiesData;
const activities: Activity[] = data.activities;
```

