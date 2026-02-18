export interface ScheduleEntry {
  day: string;
  startTime: string;
  course: string;
  duration: number;
}

export interface SavedPlan {
  id: string;
  createdAt: string;
  color: string;
  title: string;
  description: string;
  schedule: ScheduleEntry[];
  orientation: "vertical" | "horizontal";
}
