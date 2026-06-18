import activitiesData from "@/data/activities.json";
import type { ActivitiesData } from "@/types/activity";
import Header from "@/components/Header/Header";
import ActivityBrowser from "@/components/ActivityBrowser/ActivityBrowser";

const { activities } = activitiesData as ActivitiesData;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <ActivityBrowser initialActivities={activities} />
      </main>
    </>
  );
}
