import type { Activity } from "@/types/activity";
import { formatDutchDate } from "@/utils/date";

export type DateGroup = {
  date: string; // ISO "YYYY-MM-DD"
  label: string; // "zaterdag 20 juni 2026"
  activities: Activity[];
};

/** Group activities by date and sort both dates and activities chronologically. */
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
