import { Suspense } from "react";
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
        <Suspense>
          <ActivityBrowser initialActivities={activities} />
        </Suspense>
      </main>
    </>
  );
}
