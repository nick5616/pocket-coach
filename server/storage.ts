import { 
  users, goals, workouts, exercises, programs, achievements, muscleGroups, exerciseMuscleMapping,
  type User, type InsertUser, type UpsertUser,
  type Goal, type InsertGoal,
  type Workout, type InsertWorkout,
  type Exercise, type InsertExercise,
  type Program, type InsertProgram,
  type Achievement, type InsertAchievement,
  type MuscleGroup, type InsertMuscleGroup,
  type ExerciseMuscleMapping, type InsertExerciseMuscleMapping
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users - Updated for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStreak(userId: string, streak: number): Promise<void>;

  // Goals
  getUserGoals(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Workouts
  getUserWorkouts(userId: number, limit?: number): Promise<Workout[]>;
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
  getUserPrograms(userId: number): Promise<Program[]>;
  getActiveProgram(userId: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, updates: Partial<Program>): Promise<Program | undefined>;

  // Achievements
  getUserAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  markAchievementViewed(id: number): Promise<void>;

  // Muscle Groups
  getAllMuscleGroups(): Promise<MuscleGroup[]>;
  getMuscleGroup(id: number): Promise<MuscleGroup | undefined>;
  createMuscleGroup(muscleGroup: InsertMuscleGroup): Promise<MuscleGroup>;

  // Exercise Muscle Mapping
  getExerciseMuscleMapping(exerciseName: string): Promise<ExerciseMuscleMapping[]>;
  createExerciseMuscleMapping(mapping: InsertExerciseMuscleMapping): Promise<ExerciseMuscleMapping>;
  getMuscleGroupProgress(userId: number, muscleGroupId: number): Promise<{
    frequency: number;
    volume: number;
    lastWorked: Date | null;
    intensity: number; // 0-1 scale for heat map
  }>;
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

      // Create demo user if it doesn't exist
      const existingUser = await db.select().from(users).where(eq(users.username, "alex")).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          username: "alex",
          password: "password123",
          email: "alex@example.com"
        });
      }
    } catch (error) {
      console.error("Failed to initialize muscle groups:", error);
      // Don't throw error to prevent app startup failure
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureInitialized();
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    await this.ensureInitialized();
    await db.update(users).set({ currentStreak: streak }).where(eq(users.id, userId));
  }

  // Goals
  async getUserGoals(userId: number): Promise<Goal[]> {
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
  async getUserWorkouts(userId: number, limit?: number): Promise<Workout[]> {
    await this.ensureInitialized();
    const query = db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.createdAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
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
      .set({ status: "completed", analysis, completedAt: new Date() })
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
    return result.rowCount > 0;
  }

  // Programs
  async getUserPrograms(userId: number): Promise<Program[]> {
    await this.ensureInitialized();
    return await db.select().from(programs).where(eq(programs.userId, userId)).orderBy(desc(programs.createdAt));
  }

  async getActiveProgram(userId: number): Promise<Program | undefined> {
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
  async getUserAchievements(userId: number): Promise<Achievement[]> {
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

  async getMuscleGroupProgress(userId: number, muscleGroupId: number): Promise<{
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

    const lastWorked = workoutsWithExercises
      .sort((a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime())[0]
      .workoutDate;

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