"use client";

import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/types/activity";
import { getAvailability } from "@/utils/activities";
import { capitalise } from "@/utils/string";
import { formatDutchDate } from "@/utils/date";
import { isValidEmail } from "@/utils/validation";
import styles from "./BookingModal.module.css";

const TYPE_LABELS: Record<Activity["type"], string> = {
  rondleiding: "Rondleiding",
  workshop: "Workshop",
  lezing: "Lezing",
  kinderprogramma: "Kinderprogramma",
};

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
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Remember what had focus before opening so we can restore it on close
  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
  }, []);

  // Move focus to confirmation heading after step change
  useEffect(() => {
    if (step === "confirmed") {
      confirmHeadingRef.current?.focus();
    }
  }, [step]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
      next.partySize = `Maximaal ${activity.availableSpots} ${activity.availableSpots === 1 ? "plek" : "plekken"} beschikbaar.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const details: BookingDetails = { activity, name, email, partySize };
    setBooking(details);
    onConfirm(details);
    setStep("confirmed");
  }

  const dateLabel = capitalise(formatDutchDate(activity.date));
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
        {/* ── Close button ── */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Sluit venster"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {step === "form" ? (
          <>
            {/* ── Activity detail ── */}
            <div className={styles.detail}>
              <div className={styles.detailMeta}>
                <span
                  className={`${styles.badge} ${styles[`badge--${activity.type}`]}`}
                >
                  {TYPE_LABELS[activity.type]}
                </span>
                <span className={styles.detailDate}>
                  {dateLabel} · {activity.startTime} – {activity.endTime}
                </span>
              </div>

              <h2 id="modal-title" className={styles.detailTitle}>
                {activity.title}
              </h2>

              <p className={styles.detailLocation}>
                <svg
                  width="13"
                  height="13"
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
              </p>

              {activity.description && (
                <p className={styles.detailDescription}>
                  {activity.description}
                </p>
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

              <div className={styles.field}>
                <label htmlFor="booking-party-size" className={styles.label}>
                  Aantal personen
                </label>
                <input
                  id="booking-party-size"
                  type="number"
                  className={`${styles.input} ${styles.inputNarrow} ${errors.partySize ? styles.inputError : ""}`}
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

              <button type="submit" className={styles.submitButton}>
                Bevestig reservering
              </button>

              <p className={styles.disclaimer}>
                Je ontvangt een bevestiging per e-mail. Gratis annuleren tot 24
                uur van tevoren.
              </p>
            </form>
          </>
        ) : (
          /* ── Confirmation step ── */
          <div className={styles.confirmation} role="status">
            <div className={styles.confirmationIcon} aria-hidden="true">
              ✓
            </div>
            <h2
              ref={confirmHeadingRef}
              id="modal-title"
              className={styles.confirmationTitle}
              tabIndex={-1}
            >
              Reservering bevestigd!
            </h2>

            {booking && (
              <div className={styles.confirmationSummary}>
                <p className={styles.confirmationActivityTitle}>
                  {booking.activity.title}
                </p>
                <p className={styles.confirmationMeta}>
                  {capitalise(formatDutchDate(booking.activity.date))} ·{" "}
                  {booking.activity.startTime} – {booking.activity.endTime}
                </p>
                <p className={styles.confirmationMeta}>
                  {booking.partySize}{" "}
                  {booking.partySize === 1 ? "persoon" : "personen"} ·{" "}
                  {booking.activity.location}
                </p>
                <p className={styles.confirmationEmail}>
                  Een bevestiging is verstuurd naar{" "}
                  <strong>{booking.email}</strong>
                </p>
              </div>
            )}

            <div className={styles.confirmationActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleClose}
              >
                Terug naar overzicht
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleClose}
              >
                Nog een activiteit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
