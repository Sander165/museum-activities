import type { Activity } from "@/types/activity";
import { getAvailability } from "@/utils/activities";
import styles from "./ActivityCard.module.css";

const TYPE_LABELS: Record<Activity["type"], string> = {
  rondleiding: "Rondleiding",
  workshop: "Workshop",
  lezing: "Lezing",
  kinderprogramma: "Kinderprogramma",
};

interface ActivityCardProps {
  activity: Activity;
  onBook: (activity: Activity) => void;
}

export default function ActivityCard({ activity, onBook }: ActivityCardProps) {
  const availability = getAvailability(activity);
  const isSoldOut = availability === "sold-out";

  function renderAvailability() {
    if (isSoldOut) {
      return <span className={styles.soldOut}>Uitverkocht</span>;
    }
    if (availability === "almost-full") {
      return (
        <span className={styles.almostFull}>
          Nog {activity.availableSpots}{" "}
          {activity.availableSpots === 1 ? "plek" : "plekken"}
        </span>
      );
    }
    return (
      <span className={styles.available}>
        {activity.availableSpots} van {activity.capacity} plekken beschikbaar
      </span>
    );
  }

  return (
    <article
      className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ""}`}
      aria-label={activity.title}
    >
      <div className={styles.body}>
        <div className={styles.meta}>
          <span
            className={`${styles.badge} ${styles[`badge--${activity.type}`]}`}
          >
            {TYPE_LABELS[activity.type]}
          </span>
          <time className={styles.time}>
            {activity.startTime} – {activity.endTime}
          </time>
        </div>

        <h3 className={styles.title}>{activity.title}</h3>

        {activity.description && (
          <p className={styles.description}>{activity.description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.footerMeta}>
            <span className={styles.location}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {activity.location}
            </span>
            {renderAvailability()}
          </div>

          <button
            type="button"
            className={styles.bookButton}
            onClick={() => onBook(activity)}
            disabled={isSoldOut}
            aria-disabled={isSoldOut}
          >
            {isSoldOut ? "Vol" : "Reserveer"}
          </button>
        </div>
      </div>
    </article>
  );
}
