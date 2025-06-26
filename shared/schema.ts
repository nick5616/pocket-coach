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
  // Subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("inactive"), // "active", "inactive", "canceled", "past_due"
  subscriptionType: varchar("subscription_type").default("free"), // "free", "beta", "premium"
  freeAccessGranted: boolean("free_access_granted").default(false), // Admin can grant free premium access
  freeAccessReason: text("free_access_reason"), // Why free access was granted
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin actions log for tracking who gets free access
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminUserId: varchar("admin_user_id").notNull(),
  targetUserId: varchar("target_user_id").notNull(),
  action: text("action").notNull(), // "grant_free_access", "revoke_access", etc.
  reason: text("reason"),
  metadata: jsonb("metadata"), // Additional action data
  createdAt: timestamp("created_at").defaultNow(),
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
  programType: text("program_type"), // "ppl", "bro_split", "upper_lower", "full_body", "custom"
  splitType: text("split_type"), // "push_pull_legs", "chest_back_shoulders_arms_legs", "upper_lower"
  targetMuscles: text("target_muscles").array(), // ["rear_delt", "medial_delt", "chest_upper"]
  weeklyFrequency: integer("weekly_frequency").default(3), // Days per week
  currentWeek: integer("current_week").default(1),
  currentDay: integer("current_day").default(0), // Day of week (0-6)
  autoProgression: boolean("auto_progression").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const muscleGroups = pgTable("muscle_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "rear_delt", "medial_delt", "anterior_delt", etc.
  parentGroup: text("parent_group"), // "shoulders", "chest", "back" - for grouping
  region: text("region").notNull(), // "upper", "lower", "core"
  displayName: text("display_name").notNull(), // "Rear Deltoid", "Medial Deltoid"
  svgId: text("svg_id").notNull(), // SVG element ID for mapping
  svgPath: text("svg_path"), // SVG path data for detailed mapping
  anatomicalName: text("anatomical_name"), // Scientific muscle name
  primaryFunction: text("primary_function"), // "shoulder abduction", "shoulder flexion"
  exerciseCount: integer("exercise_count").default(0), // Track how many exercises target this
});

export const exerciseMuscleMapping = pgTable("exercise_muscle_mapping", {
  id: serial("id").primaryKey(),
  exerciseName: text("exercise_name").notNull(),
  muscleGroupId: integer("muscle_group_id").notNull().references(() => muscleGroups.id),
  primaryMuscle: boolean("primary_muscle").notNull().default(true),
  activationLevel: integer("activation_level").default(80), // 0-100 how much this exercise targets the muscle
});

// User preferences for muscle targeting
export const userMusclePreferences = pgTable("user_muscle_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  muscleGroupId: integer("muscle_group_id").notNull().references(() => muscleGroups.id),
  priority: integer("priority").default(5), // 1-10, how important is building this muscle
  currentSatisfaction: integer("current_satisfaction").default(5), // 1-10, how happy with current size
  targetGrowth: text("target_growth").default("maintain"), // "shrink", "maintain", "grow", "grow_significantly"
  weeklyVolumeTarget: integer("weekly_volume_target"), // Target weekly sets for this muscle
  lastUpdated: timestamp("last_updated").defaultNow(),
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
  userPreferences: many(userMusclePreferences),
}));

export const userMusclePreferencesRelations = relations(userMusclePreferences, ({ one }) => ({
  user: one(users, {
    fields: [userMusclePreferences.userId],
    references: [users.id],
  }),
  muscleGroup: one(muscleGroups, {
    fields: [userMusclePreferences.muscleGroupId],
    references: [muscleGroups.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  adminUser: one(users, {
    fields: [adminActions.adminUserId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [adminActions.targetUserId],
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

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
});

export const insertUserMusclePreferenceSchema = createInsertSchema(userMusclePreferences).omit({
  id: true,
  lastUpdated: true,
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

export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;

export type UserMusclePreference = typeof userMusclePreferences.$inferSelect;
export type InsertUserMusclePreference = z.infer<typeof insertUserMusclePreferenceSchema>;
