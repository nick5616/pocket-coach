import { 
  users, goals, workouts, exercises, programs, achievements, muscleGroups, exerciseMuscleMapping, adminActions,
  type User, type InsertUser, type UpsertUser,
  type Goal, type InsertGoal,
  type Workout, type InsertWorkout,
  type Exercise, type InsertExercise,
  type Program, type InsertProgram,
  type Achievement, type InsertAchievement,
  type MuscleGroup, type InsertMuscleGroup,
  type ExerciseMuscleMapping, type InsertExerciseMuscleMapping,
  type AdminAction, type InsertAdminAction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users - Email/Password Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; passwordHash: string; firstName?: string | null; lastName?: string | null; }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStreak(userId: string, streak: number): Promise<void>;

  // Goals
  getUserGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Workouts
  getUserWorkouts(userId: string, limit?: number): Promise<Workout[]>;
  getUserWorkoutsWithExercises(userId: string, limit?: number): Promise<(Workout & { exercises: Exercise[] })[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined>;
  completeWorkout(id: number, analysis: any): Promise<Workout | undefined>;

  // Exercises
  getWorkoutExercises(workoutId: number): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;

  // Programs
  getUserPrograms(userId: string): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  getActiveProgram(userId: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, updates: Partial<Program>): Promise<Program | undefined>;

  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  markAchievementViewed(id: number): Promise<void>;

  // Muscle Groups
  getAllMuscleGroups(): Promise<MuscleGroup[]>;
  getMuscleGroup(id: number): Promise<MuscleGroup | undefined>;
  createMuscleGroup(muscleGroup: InsertMuscleGroup): Promise<MuscleGroup>;

  // Exercise Muscle Mapping
  getExerciseMuscleMapping(exerciseName: string): Promise<ExerciseMuscleMapping[]>;
  createExerciseMuscleMapping(mapping: InsertExerciseMuscleMapping): Promise<ExerciseMuscleMapping>;
  getMuscleGroupProgress(userId: string, muscleGroupId: number): Promise<{
    frequency: number;
    volume: number;
    lastWorked: Date | null;
    intensity: number; // 0-1 scale for heat map
  }>;

  // Subscription Management
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  updateUserSubscription(userId: string, updates: {
    subscriptionStatus?: string;
    subscriptionType?: string;
    subscriptionEndsAt?: Date;
    trialEndsAt?: Date;
  }): Promise<User>;
  getUserSubscriptionStatus(userId: string): Promise<{
    hasAccess: boolean;
    subscriptionType: string;
    subscriptionStatus: string;
    reason: string;
  }>;

  // Admin Access Management
  grantFreeAccess(adminUserId: string, targetUserId: string, reason: string): Promise<void>;
  revokeFreeAccess(adminUserId: string, targetUserId: string, reason: string): Promise<void>;
  getAdminActions(limit?: number): Promise<AdminAction[]>;
  createAdminAction(action: InsertAdminAction): Promise<AdminAction>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    await this.initializeMuscleGroups();
    this.initialized = true;
  }

  private async initializeMuscleGroups() {
    try {
      // Check if muscle groups are already initialized
      const existingGroups = await db.select().from(muscleGroups).limit(1);
      if (existingGroups.length > 0) return;

      const muscleGroupsData = [
        { name: "chest", region: "upper", displayName: "Chest", svgId: "chest" },
        { name: "back", region: "upper", displayName: "Back", svgId: "back" },
        { name: "shoulders", region: "upper", displayName: "Shoulders", svgId: "shoulders" },
        { name: "biceps", region: "upper", displayName: "Biceps", svgId: "biceps" },
        { name: "triceps", region: "upper", displayName: "Triceps", svgId: "triceps" },
        { name: "forearms", region: "upper", displayName: "Forearms", svgId: "forearms" },
        { name: "abs", region: "core", displayName: "Abs", svgId: "abs" },
        { name: "obliques", region: "core", displayName: "Obliques", svgId: "obliques" },
        { name: "lower_back", region: "core", displayName: "Lower Back", svgId: "lower-back" },
        { name: "quads", region: "lower", displayName: "Quadriceps", svgId: "quads" },
        { name: "hamstrings", region: "lower", displayName: "Hamstrings", svgId: "hamstrings" },
        { name: "glutes", region: "lower", displayName: "Glutes", svgId: "glutes" },
        { name: "calves", region: "lower", displayName: "Calves", svgId: "calves" },
      ];

      const insertedGroups = await db.insert(muscleGroups).values(muscleGroupsData).returning();

      // Initialize common exercise-muscle mappings
      const exerciseMappings = [
        // Chest exercises
        { exerciseName: "bench press", muscleGroupId: insertedGroups[0].id, primaryMuscle: true },
        { exerciseName: "push ups", muscleGroupId: insertedGroups[0].id, primaryMuscle: true },
        { exerciseName: "dumbbell press", muscleGroupId: insertedGroups[0].id, primaryMuscle: true },
        { exerciseName: "incline press", muscleGroupId: insertedGroups[0].id, primaryMuscle: true },
        { exerciseName: "chest fly", muscleGroupId: insertedGroups[0].id, primaryMuscle: true },
        
        // Back exercises
        { exerciseName: "pull ups", muscleGroupId: insertedGroups[1].id, primaryMuscle: true },
        { exerciseName: "rows", muscleGroupId: insertedGroups[1].id, primaryMuscle: true },
        { exerciseName: "lat pulldown", muscleGroupId: insertedGroups[1].id, primaryMuscle: true },
        { exerciseName: "deadlift", muscleGroupId: insertedGroups[1].id, primaryMuscle: true },
        
        // Shoulder exercises
        { exerciseName: "shoulder press", muscleGroupId: insertedGroups[2].id, primaryMuscle: true },
        { exerciseName: "lateral raises", muscleGroupId: insertedGroups[2].id, primaryMuscle: true },
        { exerciseName: "front raises", muscleGroupId: insertedGroups[2].id, primaryMuscle: true },
        
        // Leg exercises
        { exerciseName: "squats", muscleGroupId: insertedGroups[9].id, primaryMuscle: true },
        { exerciseName: "lunges", muscleGroupId: insertedGroups[9].id, primaryMuscle: true },
        { exerciseName: "leg press", muscleGroupId: insertedGroups[9].id, primaryMuscle: true },
        { exerciseName: "leg curls", muscleGroupId: insertedGroups[10].id, primaryMuscle: true },
        { exerciseName: "calf raises", muscleGroupId: insertedGroups[12].id, primaryMuscle: true },
      ];

      await db.insert(exerciseMuscleMapping).values(exerciseMappings);
    } catch (error) {
      console.error("Failed to initialize muscle groups:", error);
      // Don't throw error to prevent app startup failure
    }
  }

  // Users - Updated for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { email: string; passwordHash: string; firstName?: string | null; lastName?: string | null; }): Promise<User> {
    await this.ensureInitialized();
    // Generate a unique ID using timestamp and random
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id,
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    await this.ensureInitialized();
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    await this.ensureInitialized();
    await db.update(users).set({ currentStreak: streak }).where(eq(users.id, userId));
  }

  // Goals
  async getUserGoals(userId: string): Promise<Goal[]> {
    await this.ensureInitialized();
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    await this.ensureInitialized();
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    await this.ensureInitialized();
    const [goal] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return goal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    await this.ensureInitialized();
    const result = await db.delete(goals).where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Workouts
  async getUserWorkouts(userId: string, limit?: number): Promise<Workout[]> {
    await this.ensureInitialized();
    const query = db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.createdAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getUserWorkoutsWithExercises(userId: string, limit?: number): Promise<(Workout & { exercises: Exercise[] })[]> {
    await this.ensureInitialized();
    
    // First get workouts
    const workoutQuery = db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.createdAt));
    const workoutList = limit ? await workoutQuery.limit(limit) : await workoutQuery;
    
    if (workoutList.length === 0) {
      return [];
    }
    
    // Get all exercises for these workouts using individual queries (still faster than N+1)
    const exercisePromises = workoutList.map(workout => 
      db.select().from(exercises).where(eq(exercises.workoutId, workout.id))
    );
    const exerciseLists = await Promise.all(exercisePromises);
    
    // Combine workouts with their exercises
    return workoutList.map((workout, index) => ({
      ...workout,
      exercises: exerciseLists[index] || []
    }));
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    await this.ensureInitialized();
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout || undefined;
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    await this.ensureInitialized();
    const [workout] = await db.insert(workouts).values(insertWorkout).returning();
    return workout;
  }

  async updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined> {
    await this.ensureInitialized();
    const [workout] = await db.update(workouts).set(updates).where(eq(workouts.id, id)).returning();
    return workout || undefined;
  }

  async completeWorkout(id: number, analysis: any): Promise<Workout | undefined> {
    await this.ensureInitialized();
    const [workout] = await db.update(workouts)
      .set({ aiAnalysis: analysis, isCompleted: true, completedAt: new Date() })
      .where(eq(workouts.id, id))
      .returning();
    return workout || undefined;
  }

  // Exercises
  async getWorkoutExercises(workoutId: number): Promise<Exercise[]> {
    await this.ensureInitialized();
    return await db.select().from(exercises).where(eq(exercises.workoutId, workoutId));
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    await this.ensureInitialized();
    const [exercise] = await db.insert(exercises).values(insertExercise).returning();
    return exercise;
  }

  async updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    await this.ensureInitialized();
    const [exercise] = await db.update(exercises).set(updates).where(eq(exercises.id, id)).returning();
    return exercise || undefined;
  }

  async deleteExercise(id: number): Promise<boolean> {
    await this.ensureInitialized();
    const result = await db.delete(exercises).where(eq(exercises.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Programs
  async getUserPrograms(userId: string): Promise<Program[]> {
    await this.ensureInitialized();
    return await db.select().from(programs).where(eq(programs.userId, userId)).orderBy(desc(programs.createdAt));
  }

  async getProgram(id: number): Promise<Program | undefined> {
    await this.ensureInitialized();
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program || undefined;
  }

  async getActiveProgram(userId: string): Promise<Program | undefined> {
    await this.ensureInitialized();
    const [program] = await db.select().from(programs)
      .where(and(eq(programs.userId, userId), eq(programs.isActive, true)));
    return program || undefined;
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    await this.ensureInitialized();
    const [program] = await db.insert(programs).values(insertProgram).returning();
    return program;
  }

  async updateProgram(id: number, updates: Partial<Program>): Promise<Program | undefined> {
    await this.ensureInitialized();
    const [program] = await db.update(programs).set(updates).where(eq(programs.id, id)).returning();
    return program || undefined;
  }

  // Achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    await this.ensureInitialized();
    return await db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.createdAt));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    await this.ensureInitialized();
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  async markAchievementViewed(id: number): Promise<void> {
    await this.ensureInitialized();
    await db.update(achievements).set({ isViewed: true }).where(eq(achievements.id, id));
  }

  // Muscle Groups
  async getAllMuscleGroups(): Promise<MuscleGroup[]> {
    await this.ensureInitialized();
    return await db.select().from(muscleGroups);
  }

  async getMuscleGroup(id: number): Promise<MuscleGroup | undefined> {
    await this.ensureInitialized();
    const [muscleGroup] = await db.select().from(muscleGroups).where(eq(muscleGroups.id, id));
    return muscleGroup || undefined;
  }

  async createMuscleGroup(insertMuscleGroup: InsertMuscleGroup): Promise<MuscleGroup> {
    await this.ensureInitialized();
    const [muscleGroup] = await db.insert(muscleGroups).values(insertMuscleGroup).returning();
    return muscleGroup;
  }

  // Exercise Muscle Mapping
  async getExerciseMuscleMapping(exerciseName: string): Promise<ExerciseMuscleMapping[]> {
    await this.ensureInitialized();
    return await db.select().from(exerciseMuscleMapping).where(eq(exerciseMuscleMapping.exerciseName, exerciseName));
  }

  async createExerciseMuscleMapping(insertMapping: InsertExerciseMuscleMapping): Promise<ExerciseMuscleMapping> {
    await this.ensureInitialized();
    const [mapping] = await db.insert(exerciseMuscleMapping).values(insertMapping).returning();
    return mapping;
  }

  async getMuscleGroupProgress(userId: string, muscleGroupId: number): Promise<{
    frequency: number;
    volume: number;
    lastWorked: Date | null;
    intensity: number;
  }> {
    await this.ensureInitialized();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get workouts that targeted this muscle group in the last 30 days
    const workoutsWithExercises = await db
      .select({
        workoutId: workouts.id,
        workoutDate: workouts.createdAt,
        exerciseName: exercises.name,
        sets: exercises.sets,
        reps: exercises.reps,
        weight: exercises.weight
      })
      .from(workouts)
      .innerJoin(exercises, eq(exercises.workoutId, workouts.id))
      .innerJoin(exerciseMuscleMapping, eq(exerciseMuscleMapping.exerciseName, exercises.name))
      .where(and(
        eq(workouts.userId, userId),
        eq(exerciseMuscleMapping.muscleGroupId, muscleGroupId),
        sql`${workouts.createdAt} >= ${thirtyDaysAgo}`
      ));

    if (workoutsWithExercises.length === 0) {
      return {
        frequency: 0,
        volume: 0,
        lastWorked: null,
        intensity: 0
      };
    }

    // Calculate metrics
    const frequency = workoutsWithExercises.length;
    const volume = workoutsWithExercises.reduce((total, exercise) => {
      const sets = exercise.sets || 0;
      const reps = exercise.reps || 0;
      const weight = exercise.weight || 0;
      return total + (sets * reps * weight);
    }, 0);

    const lastWorked = workoutsWithExercises.length > 0
      ? workoutsWithExercises
          .sort((a, b) => {
            const dateB = a.workoutDate ? new Date(a.workoutDate).getTime() : 0;
            const dateA = b.workoutDate ? new Date(b.workoutDate).getTime() : 0;
            return dateA - dateB;
          })[0]
          .workoutDate
      : null;

    // Calculate intensity (0-1 scale based on frequency and volume)
    const maxFrequency = 30; // Max possible workouts in 30 days
    const normalizedFrequency = Math.min(frequency / maxFrequency, 1);
    const normalizedVolume = Math.min(volume / 10000, 1); // Normalize volume to reasonable max
    const intensity = (normalizedFrequency + normalizedVolume) / 2;

    return {
      frequency,
      volume,
      lastWorked,
      intensity
    };
  }
}

export const storage = new DatabaseStorage();