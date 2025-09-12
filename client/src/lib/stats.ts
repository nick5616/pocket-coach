import type { Workout } from "@shared/schema";

/**
 * Calculate the current workout streak based on completed workouts.
 * A streak is consecutive days with at least one completed workout.
 * 
 * @param completedWorkouts Array of completed workouts
 * @returns The current streak count (number of consecutive days)
 */
export function calculateCurrentStreak(completedWorkouts: Workout[]): number {
  if (completedWorkouts.length === 0) return 0;
  
  // Get unique dates from completed workouts (normalized to local date)
  const workoutDates = new Set<string>();
  completedWorkouts.forEach(workout => {
    if (workout.createdAt) {
      const date = new Date(workout.createdAt);
      // Normalize to local date string (YYYY-MM-DD format)
      const localDateString = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0');
      workoutDates.add(localDateString);
    }
  });
  
  if (workoutDates.size === 0) return 0;
  
  // Start from today and count consecutive days backwards
  let streak = 0;
  const today = new Date();
  let currentDate = new Date(today);
  
  while (true) {
    const dateString = currentDate.getFullYear() + '-' + 
      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentDate.getDate()).padStart(2, '0');
    
    if (workoutDates.has(dateString)) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken - no workout on this day
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate the longest workout streak from completed workouts.
 * 
 * @param completedWorkouts Array of completed workouts
 * @returns The longest streak count
 */
export function calculateLongestStreak(completedWorkouts: Workout[]): number {
  if (completedWorkouts.length === 0) return 0;
  
  // Get unique dates from completed workouts (normalized to local date)
  const workoutDates = new Set<string>();
  completedWorkouts.forEach(workout => {
    if (workout.createdAt) {
      const date = new Date(workout.createdAt);
      const localDateString = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0');
      workoutDates.add(localDateString);
    }
  });
  
  if (workoutDates.size === 0) return 0;
  
  // Sort dates to find longest consecutive sequence
  const sortedDates = Array.from(workoutDates).sort();
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);
    
    // Check if dates are consecutive (1 day apart)
    const timeDiff = currentDate.getTime() - prevDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return longestStreak;
}