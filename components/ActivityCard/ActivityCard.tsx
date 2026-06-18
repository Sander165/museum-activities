import type { Activity } from "@/types/activity";

interface ActivityCardProps {
  activity: Activity;
  onBook: (activity: Activity) => void;
}

// Stub — replaced in plan 04
export default function ActivityCard({ activity, onBook }: ActivityCardProps) {
  return (
    <article>
      <strong>{activity.title}</strong>
      <button type="button" onClick={() => onBook(activity)}>
        Reserveer
      </button>
    </article>
  );
}
