"use client";

import type { ActivityType } from "@/types/activity";
import styles from "./TypeFilter.module.css";

export type FilterValue = ActivityType | "all";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "rondleiding", label: "Rondleiding" },
  { value: "workshop", label: "Workshop" },
  { value: "lezing", label: "Lezing" },
  { value: "kinderprogramma", label: "Kinderprogramma" },
];

interface TypeFilterProps {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
}

export default function TypeFilter({ active, onChange }: TypeFilterProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label} id="filter-label">
        Filter op type activiteit
      </span>
      <div className={styles.group} role="group" aria-labelledby="filter-label">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={styles.pill}
            aria-pressed={active === value}
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
