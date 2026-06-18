import type { ActivityType } from "@/types/activity";
import { TYPE_LABELS } from "@/utils/activities";
import styles from "./Badge.module.css";

interface BadgeProps {
  type: ActivityType;
}

export default function Badge({ type }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${type}`]}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}
