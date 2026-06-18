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
