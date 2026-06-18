"use client";

import { useState } from "react";
import type { Activity } from "@/types/activity";
import TypeFilter, {
  type FilterValue,
} from "@/components/TypeFilter/TypeFilter";
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
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const visible =
    activeFilter === "all"
      ? activities
      : activities.filter((a) => a.type === activeFilter);

  function handleBook(activity: Activity) {
    setSelectedActivity(activity);
  }

  function handleConfirm({ activity, partySize }: BookingDetails) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? { ...a, availableSpots: Math.max(0, a.availableSpots - partySize) }
          : a,
      ),
    );
  }

  function handleClose() {
    setSelectedActivity(null);
  }

  // Keep the modal in sync with updated spot counts
  const liveActivity = selectedActivity
    ? (activities.find((a) => a.id === selectedActivity.id) ?? selectedActivity)
    : null;

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <TypeFilter active={activeFilter} onChange={setActiveFilter} />
      </div>

      <ActivityList activities={visible} onBook={handleBook} />

      {liveActivity && (
        <BookingModal
          activity={liveActivity}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
