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
