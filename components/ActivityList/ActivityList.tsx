import type { Activity } from "@/types/activity";
import { groupByDate } from "@/utils/activities";
import { capitalise } from "@/utils/string";
import DateGroup from "@/components/DateGroup/DateGroup";
import styles from "./ActivityList.module.css";

interface ActivityListProps {
  activities: Activity[];
  onBook: (activity: Activity) => void;
}

export default function ActivityList({
  activities,
  onBook,
}: ActivityListProps) {
  const groups = groupByDate(activities);

  if (groups.length === 0) {
    return (
      <p className={styles.empty}>Geen activiteiten gevonden voor dit type.</p>
    );
  }

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <DateGroup
          key={group.date}
          label={capitalise(group.label)}
          activities={group.activities}
          onBook={onBook}
        />
      ))}
    </div>
  );
}
