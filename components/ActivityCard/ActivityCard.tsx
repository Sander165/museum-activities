"use client";

import { useState } from "react";
import Image from "next/image";
import type { Activity } from "@/types/activity";
import { useParam } from "@/hooks/useParam";
import { getAvailability } from "@/utils/activities";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LocationPinIcon from "@/components/ui/icons/LocationPinIcon";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [, openModal] = useParam("modal", activity.id);
  const showImage = Boolean(activity.imageUrl) && !imageFailed;
  const availability = getAvailability(activity);
  const isSoldOut = availability === "sold-out";
  const isAlmostFull = availability === "almost-full";

  function renderAvailability() {
    if (isSoldOut) {
      return <span className={styles.soldOut}>Uitverkocht</span>;
    }
    if (isAlmostFull) {
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
      {showImage && activity.imageUrl && (
        <div className={styles.imageWrap}>
          <Image
            src={activity.imageUrl}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, 280px"
            className={styles.image}
            onError={() => setImageFailed(true)}
          />
          <div className={styles.imageBadge}>
            <Badge type={activity.type} />
          </div>
        </div>
      )}

      <div className={styles.body}>
        {!showImage && (
          <div className={styles.meta}>
            <Badge type={activity.type} />
            <time className={styles.time}>
              {activity.startTime} – {activity.endTime}
            </time>
          </div>
        )}

        {showImage && (
          <time className={styles.time}>
            {activity.startTime} – {activity.endTime}
          </time>
        )}

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
            onClick={() => openModal(true)}
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
