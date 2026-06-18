"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Activity } from "@/types/activity";
import { getAvailability, pluraliseSpots } from "@/utils/activities";
import { capitalise } from "@/utils/string";
import { formatDutchDate } from "@/utils/date";
import { isValidEmail } from "@/utils/validation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CloseIcon from "@/components/ui/icons/CloseIcon";
import LocationPinIcon from "@/components/ui/icons/LocationPinIcon";
import styles from "./BookingModal.module.css";

export type BookingDetails = {
  activity: Activity;
  name: string;
  email: string;
  partySize: number;
};

interface BookingModalProps {
  activity: Activity;
  onConfirm: (details: BookingDetails) => void;
  onClose: () => void;
}

type FormErrors = {
  name?: string;
  email?: string;
  partySize?: string;
};

export default function BookingModal({
  activity,
  onConfirm,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFailed, setImageFailed] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (step === "confirmed") {
      confirmHeadingRef.current?.focus();
    }
  }, [step]);

  function handleClose() {
    (triggerRef.current as HTMLElement | null)?.focus();
    onClose();
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Vul je naam in.";
    if (!email.trim()) next.email = "Vul je e-mailadres in.";
    else if (!isValidEmail(email))
      next.email = "Vul een geldig e-mailadres in.";
    if (partySize < 1) next.partySize = "Minimaal 1 persoon.";
    else if (partySize > activity.availableSpots)
      next.partySize = `Maximaal ${pluraliseSpots(activity.availableSpots)} beschikbaar.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const details: BookingDetails = { activity, name, email, partySize };
    onConfirm(details);
    setStep("confirmed");
  }

  const dateLabel = capitalise(formatDutchDate(activity.date));
  const showImage = Boolean(activity.imageUrl) && !imageFailed;
  const availability = getAvailability(activity);
  const capacityPercent = Math.round(
    ((activity.capacity - activity.availableSpots) / activity.capacity) * 100,
  );

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={styles.panel}
        tabIndex={-1}
      >
        {/* ── Hero (shared across steps) ── */}
        <div className={styles.hero}>
          {showImage && activity.imageUrl ? (
            <Image
              src={activity.imageUrl}
              alt=""
              fill
              sizes="560px"
              className={styles.heroImage}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className={styles.heroFallback} aria-hidden="true" />
          )}
          <div className={styles.heroScrim} aria-hidden="true" />

          <Button
            variant="icon"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Sluit venster"
          >
            <CloseIcon />
          </Button>

          <div className={styles.heroContent}>
            <Badge type={activity.type} />
            <h2 id="modal-title" className={styles.heroTitle}>
              {activity.title}
            </h2>
            <div className={styles.heroMeta}>
              <span>
                {dateLabel} · {activity.startTime} – {activity.endTime}
              </span>
              <span className={styles.heroLocation}>
                <LocationPinIcon width={13} height={13} />
                {activity.location}
              </span>
            </div>
          </div>
        </div>

        {step === "form" ? (
          <div className={styles.body}>
            {activity.description && (
              <p className={styles.description}>{activity.description}</p>
            )}

            {/* ── Capacity bar ── */}
            <div className={styles.capacity}>
              <span className={styles.capacityLabel}>
                {availability === "sold-out"
                  ? "Uitverkocht"
                  : `${activity.availableSpots} van ${activity.capacity} plekken beschikbaar`}
              </span>
              <div
                className={styles.capacityBar}
                role="meter"
                aria-valuenow={activity.capacity - activity.availableSpots}
                aria-valuemin={0}
                aria-valuemax={activity.capacity}
                aria-label="Bezetting"
              >
                <div
                  className={styles.capacityFill}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>

            {/* ── Form ── */}
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <h3 className={styles.formTitle}>Reserveer een plek</h3>

              <div className={styles.field}>
                <label htmlFor="booking-name" className={styles.label}>
                  Naam
                </label>
                <input
                  id="booking-name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Jan de Vries"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  autoComplete="name"
                />
                {errors.name && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="booking-email" className={styles.label}>
                  E-mailadres
                </label>
                <input
                  id="booking-email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="jan@voorbeeld.nl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={`${styles.field} ${styles.fieldNarrow}`}>
                <label htmlFor="booking-party-size" className={styles.label}>
                  Aantal personen
                </label>
                <input
                  id="booking-party-size"
                  type="number"
                  className={`${styles.input} ${errors.partySize ? styles.inputError : ""}`}
                  min={1}
                  max={activity.availableSpots}
                  value={partySize}
                  onChange={(e) => {
                    setPartySize(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, partySize: undefined }));
                  }}
                />
                {errors.partySize && (
                  <span className={styles.errorMessage} role="alert">
                    {errors.partySize}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className={styles.submitButton}
              >
                Bevestig reservering
              </Button>

              <p className={styles.disclaimer}>
                Je ontvangt een bevestiging per e-mail. Gratis annuleren tot 24
                uur van tevoren.
              </p>
            </form>
          </div>
        ) : (
          /* ── Confirmation step ── */
          <div className={styles.body}>
            <div className={styles.confirmation} role="status">
              <div className={styles.confirmationIcon} aria-hidden="true">
                ✓
              </div>
              <h3
                ref={confirmHeadingRef}
                className={styles.confirmationTitle}
                tabIndex={-1}
              >
                Reservering bevestigd!
              </h3>

              <dl className={styles.summary}>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryTerm}>Wanneer</dt>
                  <dd className={styles.summaryValue}>
                    {dateLabel} · {activity.startTime} – {activity.endTime}
                  </dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryTerm}>Waar</dt>
                  <dd className={styles.summaryValue}>{activity.location}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.summaryTerm}>Personen</dt>
                  <dd className={styles.summaryValue}>
                    {partySize} {partySize === 1 ? "persoon" : "personen"}
                  </dd>
                </div>
              </dl>

              <p className={styles.confirmationEmail}>
                Een bevestiging is verstuurd naar <strong>{email}</strong>
              </p>
            </div>

            <div className={styles.confirmationActions}>
              <Button
                variant="secondary"
                className={styles.actionButton}
                onClick={handleClose}
              >
                Terug naar overzicht
              </Button>
              <Button
                variant="primary"
                className={styles.actionButton}
                onClick={handleClose}
              >
                Nog een activiteit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
