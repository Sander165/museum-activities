export type ActivityType =
  | "rondleiding"
  | "workshop"
  | "lezing"
  | "kinderprogramma";

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSpots: number;
  location: string;
  imageUrl: string | null;
};

export type ActivitiesData = {
  activities: Activity[];
};
