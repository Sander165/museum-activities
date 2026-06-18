"use client";

import { useState } from "react";
import type { Activity } from "@/types/activity";
import TypeFilter, {
  type FilterValue,
} from "@/components/TypeFilter/TypeFilter";
import ActivityList from "@/components/ActivityList/ActivityList";
import styles from "./ActivityBrowser.module.css";

interface ActivityBrowserProps {
  initialActivities: Activity[];
}

export default function ActivityBrowser({
  initialActivities,
}: ActivityBrowserProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const visible =
    activeFilter === "all"
      ? activities
      : activities.filter((a) => a.type === activeFilter);

  function handleBook(activity: Activity) {
    // Booking modal — wired in plan 05
    console.log("book", activity.id);
  }

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <TypeFilter active={activeFilter} onChange={setActiveFilter} />
      </div>
      <ActivityList activities={visible} onBook={handleBook} />
    </div>
  );
}
