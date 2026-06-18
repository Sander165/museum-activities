"use client";

import { useState } from "react";
import type { Activity } from "@/types/activity";
import TypeFilter, {
  type FilterValue,
} from "@/components/TypeFilter/TypeFilter";
import styles from "./ActivityBrowser.module.css";

interface ActivityBrowserProps {
  initialActivities: Activity[];
}

export default function ActivityBrowser({
  initialActivities,
}: ActivityBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const visible =
    activeFilter === "all"
      ? initialActivities
      : initialActivities.filter((a) => a.type === activeFilter);

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <TypeFilter active={activeFilter} onChange={setActiveFilter} />
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>
          Geen activiteiten gevonden voor dit type.
        </p>
      ) : (
        <p className={styles.count}>
          {/* Placeholder — ActivityList replaces this in plan 03 */}
          {visible.length} activiteit{visible.length !== 1 ? "en" : ""}{" "}
          gevonden.
        </p>
      )}
    </div>
  );
}
