import type { Activity } from "@/types/activity";
import { getAvailability } from "@/utils/activities";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LocationPinIcon from "@/components/ui/icons/LocationPinIcon";
import styles from "./ActivityCard.module.css";

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
          <Badge type={activity.type} />
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
              <LocationPinIcon />
              {activity.location}
            </span>
            {renderAvailability()}
          </div>

          <Button
            variant="primary"
            className={styles.bookButton}
            onClick={() => onBook(activity)}
            disabled={isSoldOut}
            aria-disabled={isSoldOut}
          >
            {isSoldOut ? "Vol" : "Reserveer"}
          </Button>
        </div>
      </div>
    </article>
  );
}
