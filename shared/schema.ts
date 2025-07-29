import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  currentStreak: integer("current_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
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
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  notes: text("notes"), // Free-form workout journal entry
  duration: integer("duration"), // in minutes
  totalVolume: real("total_volume"), // total weight lifted
  calories: integer("calories"),
  aiAnalysis: jsonb("ai_analysis"), // AI-generated insights and recommendations
  aiGenerateName: boolean("ai_generate_name").default(false),
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
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  schedule: jsonb("schedule"), // Weekly schedule structure
  aiGenerated: boolean("ai_generated").default(false),
  durationWeeks: integer("duration_weeks").default(4),
  difficulty: text("difficulty").default("beginner"), // "beginner", "intermediate", "advanced"
  focusAreas: text("focus_areas").array(), // ["strength", "cardio", "flexibility"]
  equipment: text("equipment").array(), // ["dumbbells", "barbell", "bodyweight"]
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
  primaryMuscle: boolean("primary_muscle").notNull().default(true),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "workout_complete", "streak", "goal_achieved", etc.
  title: text("title").notNull(),
  description: text("description"),
  data: jsonb("data"), // Additional achievement data
  isViewed: boolean("is_viewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  goals: many(goals),
  workouts: many(workouts),
  programs: many(programs),
  achievements: many(achievements),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
}));

export const programsRelations = relations(programs, ({ one }) => ({
  user: one(users, {
    fields: [programs.userId],
    references: [users.id],
  }),
}));

export const exerciseMuscleMappingRelations = relations(exerciseMuscleMapping, ({ one }) => ({
  muscleGroup: one(muscleGroups, {
    fields: [exerciseMuscleMapping.muscleGroupId],
    references: [muscleGroups.id],
  }),
}));

export const muscleGroupsRelations = relations(muscleGroups, ({ many }) => ({
  exerciseMappings: many(exerciseMuscleMapping),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  currentStreak: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  currentStreak: true,
  createdAt: true,
  updatedAt: true,
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

// Program generation types
export const programGenerationSchema = z.object({
  // Primary input
  goals: z.string().min(1, "Please describe your fitness goals"),
  
  // Optional info
  experience: z.string().optional(),
  availableDays: z.number().min(1).max(7).optional(),
  equipment: z.array(z.string()).optional(),
  
  // Internal use for confirmation flow
  isConfirmation: z.boolean().default(false),
  generatedProgram: z.any().optional(), // Generated program data for confirmation
});

export const programConfirmationSchema = z.object({
  program: z.any(), // Generated program structure
  feedback: z.string().optional(), // User feedback for modifications
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

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

export type ProgramGenerationData = z.infer<typeof programGenerationSchema>;
export type ProgramConfirmationData = z.infer<typeof programConfirmationSchema>;
