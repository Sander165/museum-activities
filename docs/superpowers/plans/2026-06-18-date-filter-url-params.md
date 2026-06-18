# Date Filter + URL Params Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a date range filter (from/to, defaulting to today → today+7) and move all filter and modal state into URL search params, using two generic reusable hooks.

**Architecture:** Two generic hooks (`useParam` for boolean toggles, `useStringParam` for free-form strings) own URL reads/writes. Filter and modal components become self-contained — each reads and writes its own URL slice directly. `ActivityBrowser` reads `useSearchParams()` once to compute the filtered list and the active modal.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, `next/navigation` (`useSearchParams`, `useRouter`, `usePathname`).

## Global Constraints

- All route/navigation imports come from `next/navigation`, NOT `react-router`
- Use `router.replace(..., { scroll: false })` for all URL updates — no scroll jump, no history spam
- `useSearchParams()` requires a `<Suspense>` boundary in the ancestor tree — this is added in Task 5
- Build must pass with `npm run build` after Tasks 1, 2, and 5 (intermediate tasks 3–4 introduce TS errors that Task 5 resolves)
- CSS variables reference `globals.css` — use only: `--space-1` through `--space-16`, `--text-xs`/`--text-sm`/`--text-base`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-surface`, `--color-accent`, `--radius-sm`/`--radius-md`/`--radius-full`
- No external dependencies — implement with Next.js built-ins only

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `hooks/useParam.ts` | Create | Boolean toggle for a specific `key=value` URL param |
| `hooks/useStringParam.ts` | Create | String getter/setter for a URL param with optional default |
| `components/DateFilter/DateFilter.tsx` | Create | Date range picker (from/to) — self-contained via `useStringParam` |
| `components/DateFilter/DateFilter.module.css` | Create | DateFilter styles |
| `components/DateFilter/index.ts` | Create | Barrel export |
| `components/TypeFilter/TypeFilter.tsx` | Modify | Remove `active`/`onChange` props; use `useStringParam('type')` internally |
| `components/ActivityCard/ActivityCard.tsx` | Modify | Remove `onBook` prop; use `useParam('modal', activity.id)` for open |
| `components/DateGroup/DateGroup.tsx` | Modify | Remove `onBook` prop (no longer needs to thread it) |
| `components/ActivityList/ActivityList.tsx` | Modify | Remove `onBook` prop; update empty-state message |
| `components/BookingModal/BookingModal.tsx` | Modify | Remove `onClose` prop; use `useParam('modal', activity.id)` for close |
| `components/ActivityBrowser/ActivityBrowser.tsx` | Modify | Drop filter/modal state; read `useSearchParams()` to compute `visible` + `selectedActivity`; add `DateFilter` |
| `components/ActivityBrowser/ActivityBrowser.module.css` | Modify | Add flex column layout to `.controls` |
| `app/page.tsx` | Modify | Wrap `ActivityBrowser` in `<Suspense>` |

---

## Task 1: Create generic URL param hooks

**Files:**
- Create: `hooks/useParam.ts`
- Create: `hooks/useStringParam.ts`

**Interfaces:**
- Produces:
  - `useParam(key: string, value: string): [boolean, (active: boolean) => void]`
  - `useStringParam(key: string, defaultValue?: string): [string | null, (value: string | null) => void]`

- [ ] **Step 1: Create `hooks/useParam.ts`**

```typescript
"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useParam(
  key: string,
  value: string,
): [boolean, (active: boolean) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParam = useCallback(
    (active: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (active) {
        if (params.get(key) !== value) params.set(key, value);
      } else {
        if (params.get(key) === value) params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, value, searchParams, router, pathname],
  );

  return [searchParams.get(key) === value, setParam];
}
```

- [ ] **Step 2: Create `hooks/useStringParam.ts`**

```typescript
"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useStringParam(
  key: string,
  defaultValue?: string,
): [string | null, (value: string | null) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParam = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, defaultValue, searchParams, router, pathname],
  );

  return [searchParams.get(key) ?? defaultValue ?? null, setParam];
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds. Hooks are unused but valid TypeScript.

- [ ] **Step 4: Commit**

```bash
git add hooks/useParam.ts hooks/useStringParam.ts
git commit -m "feat: add generic URL param hooks (useParam, useStringParam)"
```

---

## Task 2: Create DateFilter component

**Files:**
- Create: `components/DateFilter/DateFilter.module.css`
- Create: `components/DateFilter/DateFilter.tsx`
- Create: `components/DateFilter/index.ts`

**Interfaces:**
- Consumes: `useStringParam` from `@/hooks/useStringParam`
- Produces: `<DateFilter />` — self-contained, no props. Reads/writes `?from` and `?to` URL params. Defaults to today → today+7 when params are absent.

- [ ] **Step 1: Create `components/DateFilter/DateFilter.module.css`**

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.range {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.fieldLabel {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
}

.input {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-family: inherit;
  transition: border-color 150ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
}
```

- [ ] **Step 2: Create `components/DateFilter/DateFilter.tsx`**

```typescript
"use client";

import { useStringParam } from "@/hooks/useStringParam";
import styles from "./DateFilter.module.css";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextWeekISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function DateFilter() {
  const defaultFrom = todayISO();
  const defaultTo = nextWeekISO();

  const [from, setFrom] = useStringParam("from", defaultFrom);
  const [to, setTo] = useStringParam("to", defaultTo);

  const fromValue = from ?? defaultFrom;
  const toValue = to ?? defaultTo;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label} id="date-filter-label">
        Filter op datum
      </span>
      <div className={styles.range} aria-labelledby="date-filter-label">
        <div className={styles.field}>
          <label htmlFor="date-from" className={styles.fieldLabel}>
            Van
          </label>
          <input
            id="date-from"
            type="date"
            className={styles.input}
            value={fromValue}
            max={toValue}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="date-to" className={styles.fieldLabel}>
            Tot
          </label>
          <input
            id="date-to"
            type="date"
            className={styles.input}
            value={toValue}
            min={fromValue}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/DateFilter/index.ts`**

```typescript
export { default } from "./DateFilter";
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds. Component is unused but valid TypeScript.

- [ ] **Step 5: Commit**

```bash
git add components/DateFilter/
git commit -m "feat: add DateFilter component with from/to URL params"
```

---

## Task 3: Remove prop-drilling chain (TypeFilter + ActivityCard + DateGroup + ActivityList)

Each component becomes self-contained — reads/writes its own URL slice via the hooks. The `onBook` callback chain (ActivityBrowser → ActivityList → DateGroup → ActivityCard) is eliminated. TypeFilter's `active`/`onChange` props are removed.

**Files:**
- Modify: `components/TypeFilter/TypeFilter.tsx`
- Modify: `components/ActivityCard/ActivityCard.tsx`
- Modify: `components/DateGroup/DateGroup.tsx`
- Modify: `components/ActivityList/ActivityList.tsx`

⚠️ **After this task, `npm run build` will fail** because `ActivityBrowser` still passes the now-removed props. This is expected — Task 5 resolves all type errors.

- [ ] **Step 1: Replace `components/TypeFilter/TypeFilter.tsx`**

Remove `active`/`onChange` props. Use `useStringParam('type')` internally — `null` means "all", any ActivityType string means that filter is active.

```typescript
"use client";

import { useStringParam } from "@/hooks/useStringParam";
import type { ActivityType } from "@/types/activity";
import { TYPE_LABELS } from "@/utils/activities";
import styles from "./TypeFilter.module.css";

export type FilterValue = ActivityType | "all";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Alles" },
  ...(Object.entries(TYPE_LABELS) as [ActivityType, string][]).map(
    ([value, label]) => ({ value, label }),
  ),
];

export default function TypeFilter() {
  const [activeType, setActiveType] = useStringParam("type");

  return (
    <div className={styles.wrapper}>
      <span className={styles.label} id="filter-label">
        Filter op type activiteit
      </span>
      <div
        className={styles.group}
        role="group"
        aria-labelledby="filter-label"
      >
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={styles.pill}
            aria-pressed={
              value === "all" ? !activeType : activeType === value
            }
            onClick={() => setActiveType(value === "all" ? null : value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/ActivityCard/ActivityCard.tsx`**

Remove `onBook` prop. Use `useParam('modal', activity.id)` — the "Reserveer" button calls `openModal(true)` to set `?modal=<id>`.

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";
import type { Activity } from "@/types/activity";
import { useParam } from "@/hooks/useParam";
import { getAvailability } from "@/utils/activities";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LocationPinIcon from "@/components/ui/icons/LocationPinIcon";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [, openModal] = useParam("modal", activity.id);
  const showImage = Boolean(activity.imageUrl) && !imageFailed;
  const availability = getAvailability(activity);
  const isSoldOut = availability === "sold-out";
  const isAlmostFull = availability === "almost-full";

  function renderAvailability() {
    if (isSoldOut) {
      return <span className={styles.soldOut}>Uitverkocht</span>;
    }
    if (isAlmostFull) {
      return (
        <span className={styles.almostFull}>
          Nog {activity.availableSpots}{" "}
          {activity.availableSpots === 1 ? "plek" : "plekken"}
        </span>
      );
    }
    return (
      <span className={styles.available}>
        {activity.availableSpots} van {activity.capacity} plekken beschikbaar
      </span>
    );
  }

  return (
    <article
      className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ""}`}
      aria-label={activity.title}
    >
      {showImage && activity.imageUrl && (
        <div className={styles.imageWrap}>
          <Image
            src={activity.imageUrl}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, 280px"
            className={styles.image}
            onError={() => setImageFailed(true)}
          />
          <div className={styles.imageBadge}>
            <Badge type={activity.type} />
          </div>
        </div>
      )}

      <div className={styles.body}>
        {!showImage && (
          <div className={styles.meta}>
            <Badge type={activity.type} />
            <time className={styles.time}>
              {activity.startTime} – {activity.endTime}
            </time>
          </div>
        )}

        {showImage && (
          <time className={styles.time}>
            {activity.startTime} – {activity.endTime}
          </time>
        )}

        <h3 className={styles.title}>{activity.title}</h3>

        {activity.description && (
          <p className={styles.description}>{activity.description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.footerMeta}>
            <span className={styles.location}>
              <LocationPinIcon />
              {activity.location}
            </span>
            {renderAvailability()}
          </div>

          <Button
            variant="primary"
            className={styles.bookButton}
            onClick={() => openModal(true)}
            disabled={isSoldOut}
            aria-disabled={isSoldOut}
          >
            {isSoldOut ? "Vol" : "Reserveer"}
          </Button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Replace `components/DateGroup/DateGroup.tsx`**

Remove `onBook` prop — `ActivityCard` is self-contained:

```typescript
import type { Activity } from "@/types/activity";
import ActivityCard from "@/components/ActivityCard/ActivityCard";
import styles from "./DateGroup.module.css";

interface DateGroupProps {
  label: string;
  activities: Activity[];
}

export default function DateGroup({ label, activities }: DateGroupProps) {
  return (
    <section className={styles.group}>
      <header className={styles.header}>
        <h2 className={styles.date}>{label}</h2>
        <span className={styles.count}>
          {activities.length} activiteit{activities.length !== 1 ? "en" : ""}
        </span>
      </header>

      <ul className={styles.cards} role="list">
        {activities.map((activity) => (
          <li key={activity.id}>
            <ActivityCard activity={activity} />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Replace `components/ActivityList/ActivityList.tsx`**

Remove `onBook` prop and update the empty-state message to reflect combined filters:

```typescript
import type { Activity } from "@/types/activity";
import { groupByDate } from "@/utils/activities";
import { capitalise } from "@/utils/string";
import DateGroup from "@/components/DateGroup/DateGroup";
import styles from "./ActivityList.module.css";

interface ActivityListProps {
  activities: Activity[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  const groups = groupByDate(activities);

  if (groups.length === 0) {
    return (
      <p className={styles.empty}>
        Geen activiteiten gevonden voor deze filters.
      </p>
    );
  }

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <DateGroup
          key={group.date}
          label={capitalise(group.label)}
          activities={group.activities}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/TypeFilter/TypeFilter.tsx components/ActivityCard/ActivityCard.tsx components/DateGroup/DateGroup.tsx components/ActivityList/ActivityList.tsx
git commit -m "refactor: components self-manage URL params, remove prop-drilling chain"
```

---

## Task 4: Refactor BookingModal to close via URL param

**Files:**
- Modify: `components/BookingModal/BookingModal.tsx`

**Interfaces:**
- Consumes: `useParam` from `@/hooks/useParam`
- Produces: `<BookingModal activity={...} onConfirm={...} />` — `onClose` prop is removed; close calls `setOpen(false)` via hook

⚠️ Build will still fail after this task (ActivityBrowser still passes `onClose`). This is expected — resolved in Task 5.

- [ ] **Step 1: Replace `components/BookingModal/BookingModal.tsx`**

Remove `onClose` from `BookingModalProps`. Add `useParam('modal', activity.id)` and wrap `handleClose` in `useCallback`. The three close triggers (✕ button, overlay click, Escape key, "Terug naar overzicht", "Nog een activiteit") all call `handleClose`.

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Activity } from "@/types/activity";
import { useParam } from "@/hooks/useParam";
import { getAvailability, pluraliseSpots } from "@/utils/activities";
import { capitalise } from "@/utils/string";
import { formatDutchDate } from "@/utils/date";
import { isValidEmail } from "@/utils/validation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CloseIcon from "@/components/ui/icons/CloseIcon";
import LocationPinIcon from "@/components/ui/icons/LocationPinIcon";
import styles from "./BookingModal.module.css";

export type BookingDetails = {
  activity: Activity;
  name: string;
  email: string;
  partySize: number;
};

interface BookingModalProps {
  activity: Activity;
  onConfirm: (details: BookingDetails) => void;
}

type FormErrors = {
  name?: string;
  email?: string;
  partySize?: string;
};

export default function BookingModal({
  activity,
  onConfirm,
}: BookingModalProps) {
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFailed, setImageFailed] = useState(false);

  const [, setOpen] = useParam("modal", activity.id);

  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const handleClose = useCallback(() => {
    (triggerRef.current as HTMLElement | null)?.focus();
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  useEffect(() => {
    if (step === "confirmed") {
      confirmHeadingRef.current?.focus();
    }
  }, [step]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Vul je naam in.";
    if (!email.trim()) next.email = "Vul je e-mailadres in.";
    else if (!isValidEmail(email))
      next.email = "Vul een geldig e-mailadres in.";
    if (partySize < 1) next.partySize = "Minimaal 1 persoon.";
    else if (partySize > activity.availableSpots)
      next.partySize = `Maximaal ${pluraliseSpots(activity.availableSpots)} beschikbaar.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const details: BookingDetails = { activity, name, email, partySize };
    onConfirm(details);
    setStep("confirmed");
  }

  const dateLabel = capitalise(formatDutchDate(activity.date));
  const showImage = Boolean(activity.imageUrl) && !imageFailed;
  const availability = getAvailability(activity);
  const capacityPercent = Math.round(
    ((activity.capacity - activity.availableSpots) / activity.capacity) * 100,
  );

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={styles.panel}
        tabIndex={-1}
      >
        <div className={styles.hero}>
          {showImage && activity.imageUrl ? (
            <Image
              src={activity.imageUrl}
              alt=""
              fill
              sizes="560px"
              className={styles.heroImage}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className={styles.heroFallback} aria-hidden="true" />
          )}
          <div className={styles.heroScrim} aria-hidden="true" />

          <Button
            variant="icon"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Sluit venster"
          >
            <CloseIcon />
          </Button>

          <div className={styles.heroContent}>
            <Badge type={activity.type} />
            <h2 id="modal-title" className={styles.heroTitle}>
              {activity.title}
            </h2>
            <div className={styles.heroMeta}>
              <span>
                {dateLabel} · {activity.startTime} – {activity.endTime}
              </span>
              <span className={styles.heroLocation}>
                <LocationPinIcon width={13} height={13} />
                {activity.location}
              </span>
            </div>
          </div>
        </div>

        {step === "form" ? (
          <div className={styles.body}>
            {activity.description && (
              <p className={styles.description}>{activity.description}</p>
            )}

            <div className={styles.capacity}>
              <span className={styles.capacityLabel}>
                {availability === "sold-out"
                  ? "Uitverkocht"
                  : `${activity.availableSpots} van ${activity.capacity} plekken beschikbaar`}
              </span>
              <div
                className={styles.capacityBar}
                role="meter"
                aria-valuenow={activity.capacity - activity.availableSpots}
                aria-valuemin={0}
                aria-valuemax={activity.capacity}
                aria-label="Bezetting"
              >
                <div
                  className={styles.capacityFill}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <h3 className={styles.formTitle}>Reserveer een plek</h3>

              <div className={styles.field}>
                <label htmlFor="booking-name" className={styles.label}>
                  Naam
                </label>
                <input
                  id="booking-name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Jan de Vries"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  autoComplete="name"
                />
                {errors.name && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="booking-email" className={styles.label}>
                  E-mailadres
                </label>
                <input
                  id="booking-email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="jan@voorbeeld.nl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={`${styles.field} ${styles.fieldNarrow}`}>
                <label htmlFor="booking-party-size" className={styles.label}>
                  Aantal personen
                </label>
                <input
                  id="booking-party-size"
                  type="number"
                  className={`${styles.input} ${errors.partySize ? styles.inputError : ""}`}
                  min={1}
                  max={activity.availableSpots}
                  value={partySize}
                  onChange={(e) => {
                    setPartySize(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, partySize: undefined }));
                  }}
                />
                {errors.partySize && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.partySize}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
              >
                Bevestig reservering
              </Button>

              <p className={styles.disclaimer}>
                Je ontvangt een bevestiging per e-mail. Gratis annuleren tot 24
                uur van tevoren.
              </p>
            </form>
          </div>
        ) : (
          <div className={styles.body}>
            <div className={styles.confirmation} role="status">
              <div className={styles.confirmationIcon} aria-hidden="true">
                ✓
              </div>
              <h3
                ref={confirmHeadingRef}
                className={styles.confirmationTitle}
                tabIndex={-1}
              >
                Reservering bevestigd!
              </h3>

              <dl className={styles.summary}>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryTerm}>Wanneer</dt>
                  <dd className={styles.summaryValue}>
                    {dateLabel} · {activity.startTime} – {activity.endTime}
                  </dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryTerm}>Waar</dt>
                  <dd className={styles.summaryValue}>{activity.location}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryTerm}>Personen</dt>
                  <dd className={styles.summaryValue}>
                    {partySize} {partySize === 1 ? "persoon" : "personen"}
                  </dd>
                </div>
              </dl>

              <p className={styles.confirmationEmail}>
                Een bevestiging is verstuurd naar <strong>{email}</strong>
              </p>
            </div>

            <div className={styles.confirmationActions}>
              <Button
                variant="secondary"
                className={styles.actionButton}
                onClick={handleClose}
              >
                Terug naar overzicht
              </Button>
              <Button
                variant="primary"
                className={styles.actionButton}
                onClick={handleClose}
              >
                Nog een activiteit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BookingModal/BookingModal.tsx
git commit -m "refactor: BookingModal closes via URL param, remove onClose prop"
```

---

## Task 5: Wire ActivityBrowser + add Suspense to page

This task completes the wiring, resolves all TypeScript errors from Tasks 3–4, and adds the `<Suspense>` boundary required by Next.js for `useSearchParams`.

**Files:**
- Modify: `components/ActivityBrowser/ActivityBrowser.tsx`
- Modify: `components/ActivityBrowser/ActivityBrowser.module.css`
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `components/ActivityBrowser/ActivityBrowser.tsx`**

Drop `activeFilter` and `selectedActivity` state. Read `useSearchParams()` to compute `visible` and `selectedActivity`. Add `DateFilter`. Keep `activities` state for spot-decrement on confirm.

```typescript
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Activity } from "@/types/activity";
import TypeFilter from "@/components/TypeFilter/TypeFilter";
import DateFilter from "@/components/DateFilter";
import ActivityList from "@/components/ActivityList/ActivityList";
import BookingModal, {
  type BookingDetails,
} from "@/components/BookingModal/BookingModal";
import styles from "./ActivityBrowser.module.css";

interface ActivityBrowserProps {
  initialActivities: Activity[];
}

export default function ActivityBrowser({
  initialActivities,
}: ActivityBrowserProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const searchParams = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  })();

  const typeParam = searchParams.get("type");
  const from = searchParams.get("from") ?? today;
  const to = searchParams.get("to") ?? nextWeek;
  const modalId = searchParams.get("modal");

  const visible = activities.filter(
    (a) =>
      (!typeParam || a.type === typeParam) &&
      a.date >= from &&
      a.date <= to,
  );

  const selectedActivity =
    modalId !== null
      ? (activities.find((a) => a.id === modalId) ?? null)
      : null;

  function handleConfirm({ activity, partySize }: BookingDetails) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? { ...a, availableSpots: Math.max(0, a.availableSpots - partySize) }
          : a,
      ),
    );
  }

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <TypeFilter />
        <DateFilter />
      </div>

      <ActivityList activities={visible} />

      {selectedActivity && (
        <BookingModal activity={selectedActivity} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace `components/ActivityBrowser/ActivityBrowser.module.css`**

Add flex column layout to `.controls` so TypeFilter and DateFilter stack with consistent spacing:

```css
.browser {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--content-padding) var(--space-16);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.empty,
.count {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
```

- [ ] **Step 3: Replace `app/page.tsx`**

Wrap `ActivityBrowser` in `<Suspense>` — required by Next.js App Router when any component in the tree calls `useSearchParams()`:

```typescript
import { Suspense } from "react";
import activitiesData from "@/data/activities.json";
import type { ActivitiesData } from "@/types/activity";
import Header from "@/components/Header/Header";
import ActivityBrowser from "@/components/ActivityBrowser/ActivityBrowser";

const { activities } = activitiesData as ActivitiesData;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Suspense>
          <ActivityBrowser initialActivities={activities} />
        </Suspense>
      </main>
    </>
  );
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with zero TypeScript errors. All errors from Tasks 3–4 are now resolved.

- [ ] **Step 5: Commit**

```bash
git add components/ActivityBrowser/ActivityBrowser.tsx components/ActivityBrowser/ActivityBrowser.module.css app/page.tsx
git commit -m "feat: URL-driven ActivityBrowser with date filter and Suspense boundary"
```

---

## Verification

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and test:

1. **Default state**: URL is `/`. Date inputs show today → today+7. "Alles" button is active. No modal.
2. **Type filter**: Click "Workshop" → URL becomes `/?type=workshop`, list filters. Refresh — filter persists. Click "Alles" — `type` param removed, URL returns to `/`.
3. **Toggle type**: Click active type button → deselects (param removed, shows all).
4. **Date filter — from**: Change "Van" to a later date. URL gains `?from=YYYY-MM-DD`. Activities before that date disappear.
5. **Date filter — to**: Change "Tot" to an earlier date. URL gains `?to=YYYY-MM-DD`. Activities after that date disappear.
6. **Combined**: Set `/?type=rondleiding&from=2026-06-20&to=2026-06-28`. Refresh — both filters persist exactly.
7. **Modal open**: Click "Reserveer" on any card. URL gains `?modal=act-XXX`. Modal opens.
8. **Modal close — ✕ button**: Click ✕. `modal` param removed. Modal closes.
9. **Modal close — Escape**: Open modal, press Escape. Modal closes.
10. **Modal close — overlay**: Open modal, click the backdrop. Modal closes.
11. **Deep link to modal**: Navigate directly to `/?modal=act-001`. Modal opens on load.
12. **Booking flow**: Complete a booking. Confirm screen appears. Click "Terug naar overzicht". Modal closes, spot count decremented.
13. **Clean URLs**: With all filters at defaults, URL is `/` (no params).
