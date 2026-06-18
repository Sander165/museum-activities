import activitiesData from "@/data/activities.json";
import type { ActivitiesData } from "@/types/activity";
import Header from "@/components/Header/Header";

const { activities } = activitiesData as ActivitiesData;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ActivityBrowser (client) goes here — plan 02 + */}
        <p style={{ padding: "2rem", color: "var(--color-text-muted)" }}>
          {activities.length} activiteiten geladen.
        </p>
      </main>
    </>
  );
}
