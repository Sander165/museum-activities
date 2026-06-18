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
