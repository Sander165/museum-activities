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
