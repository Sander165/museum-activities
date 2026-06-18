/**
 * Format an ISO date string to a Dutch long-form date.
 * e.g. "2026-06-20" → "zaterdag 20 juni 2026"
 *
 * Uses UTC to avoid timezone shifts on date-only strings.
 * Caller is responsible for capitalising if needed.
 */
export function formatDutchDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
