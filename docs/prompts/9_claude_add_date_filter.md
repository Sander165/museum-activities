 ▐▛███▜▌   Claude Code v2.1.181
▝▜█████▛▘  Sonnet 4.6 · API Usage Billing
  ▘▘ ▝▝    ~/museum-activities/museum-activities


❯ Create a plan for adding a date filter, it should use a from and to date,     
  default to the following week. Additionally the filters should be able to be  
  saved in url parameters instead of state. Use a custom hook to manage the     
  parameters. The reserve modals should also work using url params. Keep it     
  clean & modular.                                                              

  Thought for 6s (ctrl+o to expand)

⏺ Skill(superpowers:brainstorming)
  ⎿  Successfully loaded skill

  Thought for 3s (ctrl+o to expand)

⏺ Exploring the project structure now.

⏺ 2 Explore agents finished (ctrl+o to expand)
   ├ Explore project structure and existing filter/modal/state patterns · 0 tool uses
   │ ⎿  Done
   └ Explore data shape and activity fields relevant to date filtering · 0 tool uses
     ⎿  Done

  Thought for 1m 43s (ctrl+o to expand)

⏺ Good picture of the project now. Here's what I found:

  - Activity dates: date field is an ISO string (YYYY-MM-DD), startTime/endTime
  are HH:MM strings
  - Current state: activeFilter (type) and selectedActivity (modal) both live in
  ActivityBrowser component state — no URL params at all
  - Modal: opened by setting selectedActivity, closed by clearing it
  - Filter: type-only, applied as a simple array filter
  - No Suspense boundary yet around the client component (needed for
  useSearchParams)
  - 27 activities ranging from 2026-06-20 onwards

⏺ One question before proposing approaches — what should "following week" mean
  as a default?

⏺ User answered Claude's questions:
  ⎿  · What does "default to the following week" mean for the date range? → 
     Today → today + 7 days
⏺ Perfect. Now let me propose approaches for the custom hook design — that's the
  core architectural decision.

  ---
  The question: How should the useActivityFilters hook handle defaults in the
  URL?

  Option A — Defaults omitted from URL (clean URLs)
  When params match defaults (type=all, from=today, to=today+7), they're not
  written to the URL. The URL stays clean (/) until the user actively changes a
  filter. The hook computes defaults at read-time.

  - Pro: Shareable URLs stay short and readable
  - Con: Computing "today" happens at render time; slight complexity in the hook
  - Recommendation: Best for UX — nobody wants
  ?type=all&from=2026-06-18&to=2026-06-25 by default

  Option B — Params always in URL
  Every state change writes all params to the URL, including defaults.

  - Pro: Simpler hook logic (always read from URL)
  - Con: Ugly default URLs, and users who share a link that "expires" tomorrow
  (from/to become stale)

  Option C — Hybrid: type param omitted at default, dates always explicit
  Type defaults to "all" when absent, but dates are always written (since they
  change daily).

  - Pro: Balances cleanliness with date explicitness
  - Con: Slightly inconsistent mental model

  My recommendation: Option A. Type param absent = "all", date params absent =
  rolling today+7 default. Shareable URLs only include non-default state, which
  is the expected behavior for a filter URL.

⏺ User answered Claude's questions:
  ⎿  · Which URL approach do you prefer? → Option A — Defaults omitted 
     (Recommended)

⏺ Let me now present the full design.

  ---
  Design: Date Filter + URL Params

  Architecture

  The core idea: one custom hook owns all URL-driven state. Every filter and the
  modal ID flow through it. Components become controlled — they read from the
  hook, write through the hook, nothing else.

  page.tsx (Server Component)
    └─ <Suspense>
         └─ ActivityBrowser (Client, "use client")
              ├─ useActivityFilters()          ← single source of truth
              ├─ TypeFilter                    ← reads/writes via hook
              ├─ DateFilter                    ← reads/writes via hook
              ├─ ActivityList                  ← receives filtered activities
              └─ BookingModal                  ← controlled by modalId from hook

  Does this overall structure look right?

  ---
  The useActivityFilters Hook

  // hooks/useActivityFilters.ts
  export function useActivityFilters() {
    // URL params: ?type=workshop&from=2026-06-20&to=2026-06-27&modal=act-003

    return {
      // Read
      typeFilter,    // FilterValue — "all" when param absent
      dateFrom,      // "YYYY-MM-DD" — today when param absent
      dateTo,        // "YYYY-MM-DD" — today+7 when param absent
      modalId,       // string | null

      // Write (use router.replace for no scroll-jump, no history spam)
      setTypeFilter, // (v: FilterValue) → removes 'type' param if "all"
      setDateFrom,   // (d: string) → removes 'from' param if matches default
      setDateTo,     // (d: string) → removes 'to' param if matches default
      openModal,     // (id: string) → sets 'modal' param
      closeModal,    // () → removes 'modal' param
    }
  }

  The hook uses useSearchParams(), useRouter(), and usePathname() from Next.js.
  All writes use router.replace (no back-button clutter).

  Does this hook API look right?

⏺ User declined to answer questions
  ⎿  · Does the hook API look right? (Yes, looks good / Combine date setters 
     into one / Other change needed)

⏺ User answered Claude's questions:
  ⎿  · What would you like to clarify or change about the hook API? → This 
     doesn't feel like a very reuseable hook when I want to use other types of 
     params

❯ this doesn't feel like a very reuseable hook when I want to use it for other  
  components that might set params                                              

  Thought for 21s (ctrl+o to expand)

⏺ Good catch — a domain-specific hook that knows about typeFilter, dateFrom,
  dateTo, and modalId couples the URL logic to the activity domain, making it
  hard to use from other components.

  Two cleaner approaches:

  Option A — Generic primitive, no domain wrapper
  A single useSearchParam<T>(key, options) hook that any component can call
  directly. ActivityBrowser calls it three times (once per filter + modal).
  Maximally reusable, no coupling.

  const [type, setType] = useSearchParam('type', { default: 'all' })
  const [from, setFrom] = useSearchParam('from', { default: today })
  const [modal, setModal] = useSearchParam('modal', { default: null })

  Option B — Generic primitive + thin domain hook
  Same useSearchParam as the reusable primitive, but also a thin
  useActivityFilters that composes them. Reusable for other components and
  convenient for ActivityBrowser (which needs all filter state in one place to
  apply filtering logic).

  // Any component: useSearchParam('modal', ...)
  // ActivityBrowser: useActivityFilters() → gets { typeFilter, dateFrom, 
  dateTo, modalId }
  // useActivityFilters internally just calls useSearchParam three times

⏺ User answered Claude's questions:
  ⎿  · Which hook structure do you prefer? → Here's a possible example: import {
     useCallback } from 'react';
     import { useSearchParams } from 'react-router';

     export function useParams(key: string, value: string) {
       const [searchParams, setSearchParams] = useSearchParams();

       const setParam = useCallback(
         (open: boolean) => {
           setSearchParams(
             (params) => {
               if (open) {
                 const currentValue = params.get(key);
                 if (currentValue !== value) {
                   params.set(key, value);
                 }
               } else {
                 if (params.get(key) === value) {
                   params.delete(key);
                 }
               }
               return params;
             },
             { preventScrollReset: true },
           );
         },
         [key, setSearchParams, value],
       );

       const param = searchParams.get(key) === value;

       return [param, setParam] as const;
     }


  Thought for 1m 27s (ctrl+o to expand)

⏺ The user's example is very clear — a useParams(key, value) toggle pattern
  (adapted from react-router to Next.js) with a functional updater. This pattern
  works perfectly for discrete values (type filter buttons, modal toggle). I'll
  extend it minimally for free-form strings (dates).

⏺ Here's the complete design, section by section.

  ---
  Architecture

  Two generic hooks, no domain-specific hook:

  1. useParam(key, value) — the user's pattern, adapted to Next.js
  useSearchParams + router.replace. Returns [boolean, setter]. Used for discrete
  toggles: each type filter button, each activity's modal toggle.
  2. useStringParam(key, defaultValue?) — same pattern, but for free-form
  strings. Returns [string | null, setter]. Used for date inputs.

  Components become self-contained — they read and write their own URL slice.
  ActivityBrowser reads useSearchParams() once to compute the filtered list and
  drive the modal.

  page.tsx (Server Component)
    └─ <Suspense fallback={skeleton}>   ← required for useSearchParams
         └─ ActivityBrowser (Client)
              reads searchParams → computes visible + selectedActivity
              ├─ TypeFilter           → uses useParam('type', value) per button
              ├─ DateFilter (new)     → uses useStringParam('from'),
  useStringParam('to')
              ├─ ActivityList → ActivityCard → uses useParam('modal', id) for
  open
              └─ BookingModal         → uses useParam('modal', id) for close

  Does this look right so far?

  ---
  Hooks

  hooks/useParam.ts — your pattern, adapted to Next.js:

  export function useParam(key: string, value: string) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const setParam = useCallback(
      (active: boolean) => {
        const params = new URLSearchParams(searchParams.toString())
        if (active) {
          if (params.get(key) !== value) params.set(key, value)
        } else {
          if (params.get(key) === value) params.delete(key)
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      },
      [key, value, searchParams, router, pathname]
    )

    return [searchParams.get(key) === value, setParam] as const
  }

  hooks/useStringParam.ts — for date inputs:

  export function useStringParam(key: string, defaultValue?: string) {
    // returns [currentValue (or defaultValue if absent), setter]
    // setter deletes the param when value matches defaultValue (clean URLs)
  }

  ---
  New: DateFilter component

  Renders two <input type="date"> fields. Computes today's date and today+7 as
  defaults on mount. Uses useStringParam('from', today) and useStringParam('to',
  nextWeek) internally.

  Props: none (fully self-contained via hooks).

  ---
  Changes to existing components

  TypeFilter — removes active and onChange props. Each button becomes
  self-contained, calling useParam('type', buttonValue).

  ActivityCard — removes onBook callback prop. Button calls useParam('modal', 
  activity.id) directly.

  BookingModal — gets activity prop (still needed for display). Close action
  calls useParam('modal', activity.id) setter with false. The onClose prop goes
  away.

  ActivityBrowser — drops all state (activeFilter, selectedActivity). Reads
  searchParams directly to compute visible array and selectedActivity. Passes no
  filter callbacks down.

  app/page.tsx — wraps <ActivityBrowser> in <Suspense> (required by Next.js for
  useSearchParams).

  ---
  Does this all look right? Any changes before I write the spec?

⏺ User answered Claude's questions:
  ⎿  · Any changes to the design before I write the spec? → Looks good — write 
     the spec

⏺ Writing the spec now.

⏺ Bash(mkdir -p /Users/Sander\
      Vandamme/museum-activities/museum-activities/docs/superpowers/specs)
  ⎿  Done

⏺ Write(docs/superpowers/specs/2026-06-18-date-filter-url-params-design.md)
  ⎿  Wrote 186 lines to
     docs/superpowers/specs/2026-06-18-date-filter-url-params-design.md
       2 # Date Filter + URL Params Design
       4 **Status:** Approved  
       5 
       7 ## Context
       8 The museum activities browser currently manages all state (type 
         ityBrowser`. This means filters are lost on page refresh and can
         modal state into URL search params so that filter combinations a
         re bookmarkable and shareable, and to add a date range filter (f
       9 rom / to) defaulting to today → today+7.
      10 ## Hooks
     … +224 lines (ctrl+o to expand)

⏺ Running a quick self-review of the spec...

  - Placeholders: None — all sections are concrete
  - Consistency: The activities state note (kept for spot-decrement) is
  explained; no contradiction with "drop all state"
  - Scope: Single deliverable, right-sized
  - Ambiguity: One potential issue — the "Alles" button in TypeFilter is special
  (no param vs param=all). I should clarify in the spec that it deletes the
  param rather than setting type=all. Already mentioned this. ✓
  - Date computation in DateFilter: Note that new Date() in a client component
  is fine, but there could be a hydration flash. Since DateFilter is inside a
  Suspense boundary it's fully client-rendered, so no hydration issue. ✓
⏺ Spec written to
  docs/superpowers/specs/2026-06-18-date-filter-url-params-design.md. Please
  review it and let me know if you want any changes before we write the
  implementation plan.

✻ Brewed for 7m 6s

❯ Implement it                                                                  

  Thought for 12s (ctrl+o to expand)

⏺ Skill(superpowers:writing-plans)
  ⎿  Successfully loaded skill

  Thought for 16s (ctrl+o to expand)

⏺ I'm using the writing-plans skill to create the implementation plan.

  Let me read the current source files before writing the plan.

  Thought for 5m 13s, read 13 files (ctrl+o to expand)

⏺ Good — all CSS variables are confirmed. Now I'll write the implementation
  plan.

⏺ Write(docs/superpowers/plans/2026-06-18-date-filter-url-params.md)
  ⎿  Wrote 1094 lines to
     docs/superpowers/plans/2026-06-18-date-filter-url-params.md
      2 # Date Filter + URL Params Implementation Plan
      3 > **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:su
        plans to implement this plan task-by-task. Steps use checkbox (`-
         [ ]`) syntax for tracking.
      5 **Goal:** Add a date range filter (from/to, defaulting to today →
         today+7) and move all filter and modal state into URL search par
      6 ams, using two generic reusable hooks.
      7 **Architecture:** Two generic hooks (`useParam` for boolean toggl
         Filter and modal components become self-contained — each reads a
        nd writes its own URL slice directly. `ActivityBrowse
     … +1211 lines (ctrl+o to expand)

  Thought for 25s (ctrl+o to expand)

⏺ Self-review complete. Spec coverage verified (all 6 requirements covered), no
  placeholders, type signatures consistent across all tasks.

⏺ Exited plan mode

  Thought for 7s (ctrl+o to expand)

⏺ Plan is saved to docs/superpowers/plans/2026-06-18-date-filter-url-params.md.
  Two execution options:

  1. Subagent-Driven (recommended) — fresh subagent per task, review between
  tasks
  2. Inline Execution — execute tasks in this session with checkpoints

⏺ User answered Claude's questions:
  ⎿  · Which execution approach? → Inline Execution

⏺ Skill(superpowers:executing-plans)
  ⎿  Successfully loaded skill

  Thought for 4s (ctrl+o to expand)

⏺ I'm using the executing-plans skill to implement this plan.

  Thought for 3s, read 1 file (ctrl+o to expand)

⏺ Plan looks solid — no concerns. Creating todos and executing now.
  Listed 1 directory (ctrl+o to expand)

⏺ Write(hooks/useParam.ts)
  ⎿  Wrote 28 lines to hooks/useParam.ts
       2 "use client";
       3 import { useCallback } from "react";
       4 import { usePathname, useRouter, useSearchParams } from "next/na
         vigation";
       5 
       6 export function useParam(
       7   key: string,
       8   value: string,
       9 ): [boolean, (active: boolean) => void] {
      10   const searchParams = useSearchParams();
     … +20 lines (ctrl+o to expand)

⏺ Write(hooks/useStringParam.ts)
  ⎿  Wrote 28 lines to hooks/useStringParam.ts
       2 "use client";
       3 import { useCallback } from "react";
       4 import { usePathname, useRouter, useSearchParams } from "next/na
         vigation";
       5 
       6 export function useStringParam(
       7   key: string,
       8   defaultValue?: string,
       9 ): [string | null, (value: string | null) => void] {
      10   const searchParams = useSearchParams();
     … +20 lines (ctrl+o to expand)

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && npm run
      build 2>&1 | tail -20)
  ⎿    Creating an optimized production build ...
     ✓ Compiled successfully in 1563ms
       Running TypeScript ...
     … +15 lines (ctrl+o to expand)

⏺ Build passes. Committing.

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && git add
      hooks/useParam.ts hooks/useStringParam.ts && git commit -m "feat: add
      generic URL para…)
  ⎿  [main 4ccd478] feat: add generic URL param hooks (useParam, useStringP
     aram)
      2 files changed, 56 insertions(+)
     … +2 lines (ctrl+o to expand)

⏺ Write(components/DateFilter/DateFilter.module.css)
  ⎿  Wrote 48 lines to components/DateFilter/DateFilter.module.css
       1 .wrapper {
       2   display: flex;
       3   flex-direction: column;
       4   gap: var(--space-3);
       5 }
       6 
       7 .label {
       8   font-size: var(--text-xs);
       9   font-weight: 600;
      10   text-transform: uppercase;
     … +38 lines (ctrl+o to expand)

⏺ Write(components/DateFilter/DateFilter.tsx)
  ⎿  Wrote 61 lines to components/DateFilter/DateFilter.tsx
       1 "use client";
       2 
       3 import { useStringParam } from "@/hooks/useStringParam";
       4 import styles from "./DateFilter.module.css";
       5 
       6 function todayISO(): string {
       7   return new Date().toISOString().slice(0, 10);
       8 }
       9 
      10 function nextWeekISO(): string {
     … +52 lines (ctrl+o to expand)

⏺ Write(components/DateFilter/index.ts)
  ⎿  Wrote 1 lines to components/DateFilter/index.ts
      1 export { default } from "./DateFilter";

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && npm run
      build 2>&1 | tail -10)
  ⎿  ✓ Generating static pages using 5 workers (4/4) in 165ms
       Finalizing page optimization ...
     … +6 lines (ctrl+o to expand)

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && git add
      components/DateFilter/ && git commit -m "feat: add DateFilter component
      with from/to U…)
  ⎿  [main 1df13cc] feat: add DateFilter component with from/to URL params
      3 files changed, 110 insertions(+)
      create mode 100644 components/DateFilter/DateFilter.module.css
     … +2 lines (ctrl+o to expand)

⏺ Now refactoring the prop-drilling chain. All four files in parallel:

⏺ Write(components/TypeFilter/TypeFilter.tsx)
  ⎿  Added 15 lines, removed 12 lines
      1  "use client";
      2  
      3 +import { useStringParam } from "@/hooks/useStringParam";        
      4  import type { ActivityType } from "@/types/activity";
      5  import { TYPE_LABELS } from "@/utils/activities";
      6  import styles from "./TypeFilter.module.css";
     ...
       9  
      10  const FILTERS: { value: FilterValue; label: string }[] = [
      11    { value: "all", label: "Alles" },
      11 -  ...(Object.entries(TYPE_LABELS) as [ActivityType, string][]).
         -map(([value, label]) => ({                                     
      12 -    value,                                                     
      13 -    label,                                                     
      14 -  })),                                                         
      12 +  ...(Object.entries(TYPE_LABELS) as [ActivityType, string][]).
         +map(                                                           
      13 +    ([value, label]) => ({ value, label }),                    
      14 +  ),                                                           
      15  ];
      16  
      17 -interface TypeFilterProps {                                    
      18 -  active: FilterValue;                                         
      19 -  onChange: (value: FilterValue) => void;                      
      20 -}                                                              
      17 +export default function TypeFilter() {                         
      18 +  const [activeType, setActiveType] = useStringParam("type");  
      19  
      22 -export default function TypeFilter({ active, onChange }: TypeFi
         -lterProps) {                                                   
      20    return (
      21      <div className={styles.wrapper}>
      22        <span className={styles.label} id="filter-label">
      23          Filter op type activiteit
      24        </span>
      28 -      <div className={styles.group} role="group" aria-labelledb
         -y="filter-label">                                              
      25 +      <div                                                     
      26 +        className={styles.group}                               
      27 +        role="group"                                           
      28 +        aria-labelledby="filter-label"                         
      29 +      >                                                        
      30          {FILTERS.map(({ value, label }) => (
      31            <button
      32              key={value}
      33              type="button"
      34              className={styles.pill}
      34 -            aria-pressed={active === value}                    
      35 -            onClick={() => onChange(value)}                    
      35 +            aria-pressed={                                     
      36 +              value === "all" ? !activeType : activeType === va
         +lue                                                            
      37 +            }                                                  
      38 +            onClick={() => setActiveType(value === "all" ? null
         + : value)}                                                     
      39            >
      40              {label}
      41            </button>

⏺ Write(components/ActivityCard/ActivityCard.tsx)
  ⎿  Added 4 lines, removed 3 lines
      3  import { useState } from "react";
      4  import Image from "next/image";
      5  import type { Activity } from "@/types/activity";
      6 +import { useParam } from "@/hooks/useParam";                    
      7  import { getAvailability } from "@/utils/activities";
      8  import Badge from "@/components/ui/Badge";
      9  import Button from "@/components/ui/Button";
     ...
      12  
      13  interface ActivityCardProps {
      14    activity: Activity;
      14 -  onBook: (activity: Activity) => void;                        
      15  }
      16  
      17 -export default function ActivityCard({ activity, onBook }: Acti
         -vityCardProps) {                                               
      17 +export default function ActivityCard({ activity }: ActivityCard
         +Props) {                                                       
      18    const [imageFailed, setImageFailed] = useState(false);
      19 +  const [, openModal] = useParam("modal", activity.id);        
      20    const showImage = Boolean(activity.imageUrl) && !imageFailed;
      21    const availability = getAvailability(activity);
      22    const isSoldOut = availability === "sold-out";
     ...
       96            <Button
       97              variant="primary"
       98              className={styles.bookButton}
       98 -            onClick={() => onBook(activity)}                  
       99 +            onClick={() => openModal(true)}                   
      100              disabled={isSoldOut}
      101              aria-disabled={isSoldOut}
      102            >

⏺ Write(components/DateGroup/DateGroup.tsx)  ⎿  Added 2 lines, removed 7 lines
       5  interface DateGroupProps {
       6    label: string;
       7    activities: Activity[];
       8 -  onBook: (activity: Activity) => void;                        
       8  }
       9  
      11 -export default function DateGroup({                            
      12 -  label,                                                       
      13 -  activities,                                                  
      14 -  onBook,                                                      
      15 -}: DateGroupProps) {                                           
      10 +export default function DateGroup({ label, activities }: DateGr
         +oupProps) {                                                    
      11    return (
      12      <section className={styles.group}>
      13        <header className={styles.header}>
     ...
      20        <ul className={styles.cards} role="list">
      21          {activities.map((activity) => (
      22            <li key={activity.id}>
      28 -            <ActivityCard activity={activity} onBook={onBook} /
         ->                                                              
      23 +            <ActivityCard activity={activity} />               
      24            </li>
      25          ))}
      26        </ul>

⏺ Write(components/ActivityList/ActivityList.tsx)
  ⎿  Added 4 lines, removed 7 lines
       6  
       7  interface ActivityListProps {
       8    activities: Activity[];
       9 -  onBook: (activity: Activity) => void;                        
       9  }
      10  
      12 -export default function ActivityList({                         
      13 -  activities,                                                  
      14 -  onBook,                                                      
      15 -}: ActivityListProps) {                                        
      11 +export default function ActivityList({ activities }: ActivityLi
         +stProps) {                                                     
      12    const groups = groupByDate(activities);
      13  
      14    if (groups.length === 0) {
      15      return (
      20 -      <p className={styles.empty}>Geen activiteiten gevonden vo
         -or dit type.</p>                                               
      16 +      <p className={styles.empty}>                             
      17 +        Geen activiteiten gevonden voor deze filters.          
      18 +      </p>                                                     
      19      );
      20    }
      21  
     ...
      26            key={group.date}
      27            label={capitalise(group.label)}
      28            activities={group.activities}
      31 -          onBook={onBook}                                      
      29          />
      30        ))}
      31      </div>

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && git add
      components/TypeFilter/TypeFilter.tsx
      components/ActivityCard/ActivityCard.tsx componen…)
  ⎿  [main 263c82e] refactor: components self-manage URL params, remove pro
     p-drilling chain
      4 files changed, 25 insertions(+), 29 deletions(-)

⏺ Write(components/BookingModal/BookingModal.tsx)
  ⎿  Error writing file

  Read 1 file (ctrl+o to expand)

⏺ Write(components/BookingModal/BookingModal.tsx)
  ⎿  Added 27 lines, removed 19 lines
      1  "use client";
      2  
      3 -import { useEffect, useRef, useState } from "react";            
      3 +import { useCallback, useEffect, useRef, useState } from "react"
        +;                                                               
      4  import Image from "next/image";
      5  import type { Activity } from "@/types/activity";
      6 +import { useParam } from "@/hooks/useParam";                    
      7  import { getAvailability, pluraliseSpots } from "@/utils/activit
         ies";
      8  import { capitalise } from "@/utils/string";
      9  import { formatDutchDate } from "@/utils/date";
     ...
      24  interface BookingModalProps {
      25    activity: Activity;
      26    onConfirm: (details: BookingDetails) => void;
      26 -  onClose: () => void;                                         
      27  }
      28  
      29  type FormErrors = {
     ...
      35  export default function BookingModal({
      36    activity,
      37    onConfirm,
      38 -  onClose,                                                     
      38  }: BookingModalProps) {
      39    const [step, setStep] = useState<"form" | "confirmed">("form"
          );
      40    const [name, setName] = useState("");
     ...
      43    const [errors, setErrors] = useState<FormErrors>({});
      44    const [imageFailed, setImageFailed] = useState(false);
      45  
      46 +  const [, setOpen] = useParam("modal", activity.id);          
      47 +                                                               
      48    const dialogRef = useRef<HTMLDivElement>(null);
      49    const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
      50    const triggerRef = useRef<Element | null>(null);
      51  
      52 +  const handleClose = useCallback(() => {                      
      53 +    (triggerRef.current as HTMLElement | null)?.focus();       
      54 +    setOpen(false);                                            
      55 +  }, [setOpen]);                                               
      56 +                                                               
      57    useEffect(() => {
      58      triggerRef.current = document.activeElement;
      59      dialogRef.current?.focus();
     ...
      66        document.body.style.overflow = "";
      67        document.removeEventListener("keydown", handleKeyDown);
      68      };
      63 -  }, []);                                                      
      69 +  }, [handleClose]);                                           
      70  
      71    useEffect(() => {
      72      if (step === "confirmed") {
     ...
      74      }
      75    }, [step]);
      76  
      71 -  function handleClose() {                                     
      72 -    (triggerRef.current as HTMLElement | null)?.focus();       
      73 -    onClose();                                                 
      74 -  }                                                            
      75 -                                                               
      77    function validate(): boolean {
      78      const next: FormErrors = {};
      79      if (!name.trim()) next.name = "Vul je naam in.";
     ...
      117          className={styles.panel}
      118          tabIndex={-1}
      119        >
      119 -        <Button                                               
      120 -          variant="icon"                                      
      121 -          className={styles.closeButton}                      
      122 -          onClick={handleClose}                               
      123 -          aria-label="Sluit venster"                          
      124 -        >                                                     
      125 -          <CloseIcon />                                       
      126 -        </Button>                                             
      127 -                                                              
      120          <div className={styles.hero}>
      121            {showImage && activity.imageUrl ? (
      122              <Image
     ...
      132            )}
      133            <div className={styles.heroScrim} aria-hidden="true"
            />
      134  
      135 +          <Button                                             
      136 +            variant="icon"                                    
      137 +            className={styles.closeButton}                    
      138 +            onClick={handleClose}                             
      139 +            aria-label="Sluit venster"                        
      140 +          >                                                   
      141 +            <CloseIcon />                                     
      142 +          </Button>                                           
      143 +                                                              
      144            <div className={styles.heroContent}>
      145              <Badge type={activity.type} />
      146              <h2 id="modal-title" className={styles.heroTitle}>
     ...
      311  
      312              <div className={styles.confirmationActions}>
      313                <Button
      313 -                variant="primary"                             
      314 +                variant="secondary"                           
      315                  className={styles.actionButton}
      316                  onClick={handleClose}
      317                >
      318                  Terug naar overzicht
      319                </Button>
      320 +              <Button                                         
      321 +                variant="primary"                             
      322 +                className={styles.actionButton}               
      323 +                onClick={handleClose}                         
      324 +              >                                               
      325 +                Nog een activiteit                            
      326 +              </Button>                                       
      327              </div>
      328            </div>
      329          )}

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && git add
      components/BookingModal/BookingModal.tsx && git commit -m "refactor:
      BookingModal clos…)
  ⎿  [main 2de4edc] refactor: BookingModal closes via URL param, remove onC
     lose prop
      1 file changed, 10 insertions(+), 9 deletions(-)

⏺ Write(components/ActivityBrowser/ActivityBrowser.tsx)
  ⎿  Added 31 lines, removed 31 lines
       1  "use client";
       2  
       3  import { useState } from "react";
       4 +import { useSearchParams } from "next/navigation";             
       5  import type { Activity } from "@/types/activity";
       5 -import TypeFilter, {                                           
       6 -  type FilterValue,                                            
       7 -} from "@/components/TypeFilter/TypeFilter";                   
       6 +import TypeFilter from "@/components/TypeFilter/TypeFilter";   
       7 +import DateFilter from "@/components/DateFilter";              
       8  import ActivityList from "@/components/ActivityList/ActivityLis
          t";
       9  import BookingModal, {
      10    type BookingDetails,
     ...
      19    initialActivities,
      20  }: ActivityBrowserProps) {
      21    const [activities, setActivities] = useState<Activity[]>(init
          ialActivities);
      22 -  const [activeFilter, setActiveFilter] = useState<FilterValue>
         -("all");                                                       
      23 -  const [selectedActivity, setSelectedActivity] = useState<Acti
         -vity | null>(                                                  
      24 -    null,                                                      
      25 -  );                                                           
      22 +  const searchParams = useSearchParams();                      
      23  
      27 -  const visible =                                              
      28 -    activeFilter === "all"                                     
      29 -      ? activities                                             
      30 -      : activities.filter((a) => a.type === activeFilter);     
      24 +  const today = new Date().toISOString().slice(0, 10);         
      25 +  const nextWeek = (() => {                                    
      26 +    const d = new Date();                                      
      27 +    d.setDate(d.getDate() + 7);                                
      28 +    return d.toISOString().slice(0, 10);                       
      29 +  })();                                                        
      30  
      32 -  function handleBook(activity: Activity) {                    
      33 -    setSelectedActivity(activity);                             
      34 -  }                                                            
      31 +  const typeParam = searchParams.get("type");                  
      32 +  const from = searchParams.get("from") ?? today;              
      33 +  const to = searchParams.get("to") ?? nextWeek;               
      34 +  const modalId = searchParams.get("modal");                   
      35  
      36 +  const visible = activities.filter(                           
      37 +    (a) =>                                                     
      38 +      (!typeParam || a.type === typeParam) &&                  
      39 +      a.date >= from &&                                        
      40 +      a.date <= to,                                            
      41 +  );                                                           
      42 +                                                               
      43 +  const selectedActivity =                                     
      44 +    modalId !== null                                           
      45 +      ? (activities.find((a) => a.id === modalId) ?? null)     
      46 +      : null;                                                  
      47 +                                                               
      48    function handleConfirm({ activity, partySize }: BookingDetail
          s) {
      49      setActivities((prev) =>
      50        prev.map((a) =>
     ...
      55      );
      56    }
      57  
      46 -  function handleClose() {                                     
      47 -    setSelectedActivity(null);                                 
      48 -  }                                                            
      49 -                                                               
      50 -  // Keep the modal in sync with updated spot counts           
      51 -  const liveActivity = selectedActivity                        
      52 -    ? (activities.find((a) => a.id === selectedActivity.id) ?? 
         -selectedActivity)                                              
      53 -    : null;                                                    
      54 -                                                               
      58    return (
      59      <div className={styles.browser}>
      60        <div className={styles.controls}>
      58 -        <TypeFilter active={activeFilter} onChange={setActiveFi
         -lter} />                                                       
      61 +        <TypeFilter />                                         
      62 +        <DateFilter />                                         
      63        </div>
      64  
      61 -      <ActivityList activities={visible} onBook={handleBook} />
      65 +      <ActivityList activities={visible} />                    
      66  
      63 -      {liveActivity && (                                       
      64 -        <BookingModal                                          
      65 -          activity={liveActivity}                              
      66 -          onConfirm={handleConfirm}                            
      67 -          onClose={handleClose}                                
      68 -        />                                                     
      67 +      {selectedActivity && (                                   
      68 +        <BookingModal activity={selectedActivity} onConfirm={ha
         +ndleConfirm} />                                                
      69        )}
      70      </div>
      71    );

⏺ Write(components/ActivityBrowser/ActivityBrowser.module.css)
  ⎿  Added 3 lines
       5  }
       6  
       7  .controls {
       8 +  display: flex;                                               
       9 +  flex-direction: column;                                      
      10 +  gap: var(--space-6);                                         
      11    margin-bottom: var(--space-8);
      12  }
      13  

⏺ Write(app/page.tsx)
  ⎿  Added 4 lines, removed 1 line
      1 +import { Suspense } from "react";                               
      2  import activitiesData from "@/data/activities.json";
      3  import type { ActivitiesData } from "@/types/activity";
      4  import Header from "@/components/Header/Header";
     ...
      11      <>
      12        <Header />
      13        <main>
      13 -        <ActivityBrowser initialActivities={activities} />     
      14 +        <Suspense>                                             
      15 +          <ActivityBrowser initialActivities={activities} />   
      16 +        </Suspense>                                            
      17        </main>
      18      </>
      19    );

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && npm run
      build 2>&1)
  ⎿  > museum-activities@0.1.0 build
     > next build
     … +20 lines (ctrl+o to expand)

⏺ Clean build, zero TypeScript errors. Committing.

⏺ Bash(cd /Users/Sander\ Vandamme/museum-activities/museum-activities && git add
      components/ActivityBrowser/ActivityBrowser.tsx
      components/ActivityBrowser/ActivityBrow…)
  ⎿  [main 4e89650] feat: URL-driven ActivityBrowser with date filter and S
     uspense boundary
      3 files changed, 38 insertions(+), 32 deletions(-)

⏺ All 5 tasks done. Now verifying in the browser.

⏺ Skill(verify)
  ⎿  Successfully loaded skill
  ⎿  Interrupted · What should Claude do instead?

※ recap: Adding a date range filter and moving all filter/modal state to URL params using two generic hooks. Spec is written and ready for your review at docs/superpowers/specs/2026-06-18-date-filter-url-params-design.md before we create the implementation plan. (disable recaps in /config)