import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  currentStreak: integer("current_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: real("target_value"),
  currentValue: real("current_value").default(0),
  unit: text("unit"), // "lbs", "kg", "reps", "inches", etc.
  category: text("category").notNull(), // "strength", "muscle_building", "endurance"
  muscleGroup: text("muscle_group"), // "shoulders", "chest", "back", etc.
  status: text("status").default("active"), // "active", "completed", "paused"
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  notes: text("notes"), // Free-form workout journal entry
  duration: integer("duration"), // in minutes
  totalVolume: real("total_volume"), // total weight lifted
  calories: integer("calories"),
  aiAnalysis: jsonb("ai_analysis"), // AI-generated insights and recommendations
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  name: text("name").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: real("weight"),
  rpe: integer("rpe"), // Rate of Perceived Exertion (1-10)
  restTime: integer("rest_time"), // in seconds
  notes: text("notes"),
  muscleGroups: text("muscle_groups").array(), // ["shoulders", "chest"]
  createdAt: timestamp("created_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  schedule: jsonb("schedule"), // Weekly schedule structure
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const muscleGroups = pgTable("muscle_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "chest", "back", "shoulders", etc.
  region: text("region").notNull(), // "upper", "lower", "core"
  displayName: text("display_name").notNull(), // "Chest", "Back", "Shoulders"
  svgId: text("svg_id").notNull(), // SVG element ID for mapping
});

export const exerciseMuscleMapping = pgTable("exercise_muscle_mapping", {
  id: serial("id").primaryKey(),
  exerciseName: text("exercise_name").notNull(),
  muscleGroupId: integer("muscle_group_id").notNull().references(() => muscleGroups.id),
  primaryMuscle: boolean("primary_muscle").default(true),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "workout_complete", "streak", "goal_achieved", etc.
  title: text("title").notNull(),
  description: text("description"),
  data: jsonb("data"), // Additional achievement data
  isViewed: boolean("is_viewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  currentStreak: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  currentValue: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  totalVolume: true,
  aiAnalysis: true,
  isCompleted: true,
  completedAt: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
});

export const insertMuscleGroupSchema = createInsertSchema(muscleGroups).omit({
  id: true,
});

export const insertExerciseMuscleMapSchema = createInsertSchema(exerciseMuscleMapping).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  isViewed: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type MuscleGroup = typeof muscleGroups.$inferSelect;
export type InsertMuscleGroup = z.infer<typeof insertMuscleGroupSchema>;

export type ExerciseMuscleMapping = typeof exerciseMuscleMapping.$inferSelect;
export type InsertExerciseMuscleMapping = z.infer<typeof insertExerciseMuscleMapSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
