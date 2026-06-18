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
