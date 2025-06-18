export interface User {
  id: number;
  username: string;
  email?: string;
  currentStreak: number;
}

export interface WorkoutStats {
  workouts: number;
  exercises: number;
  timeMinutes: number;
  calories?: number;
}

export interface AIRecommendation {
  message: string;
  program?: string;
  focusAreas: string[];
}

export interface ProgressInsight {
  type: "strength" | "endurance" | "muscle_building" | "suggestion";
  title: string;
  description: string;
  icon: string;
  data?: any;
}
