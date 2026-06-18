import type { Activity, ActivityType } from "@/types/activity";
import { formatDutchDate } from "@/utils/date";

export const TYPE_LABELS: Record<ActivityType, string> = {
  rondleiding: "Rondleiding",
  workshop: "Workshop",
  lezing: "Lezing",
  kinderprogramma: "Kinderprogramma",
};

export type AvailabilityState = "available" | "almost-full" | "sold-out";

const ALMOST_FULL_THRESHOLD = 3;

export function getAvailability(activity: Activity): AvailabilityState {
  if (activity.availableSpots === 0) return "sold-out";
  if (activity.availableSpots <= ALMOST_FULL_THRESHOLD) return "almost-full";
  return "available";
}

export function pluraliseSpots(n: number): string {
  return `${n} ${n === 1 ? "plek" : "plekken"}`;
}

export type DateGroup = {
  date: string; // ISO "YYYY-MM-DD"
  label: string; // "zaterdag 20 juni 2026"
  activities: Activity[];
};

export function groupByDate(activities: Activity[]): DateGroup[] {
  const map = new Map<string, Activity[]>();

  for (const activity of activities) {
    const group = map.get(activity.date) ?? [];
    group.push(activity);
    map.set(activity.date, group);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      label: formatDutchDate(date),
      activities: items
        .slice()
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
}
