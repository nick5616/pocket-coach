import { 
  users, goals, workouts, exercises, programs, achievements, muscleGroups, exerciseMuscleMapping,
  type User, type InsertUser,
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
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(userId: number, streak: number): Promise<void>;

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
  constructor() {
    // Initialize muscle groups on startup
    this.initializeMuscleGroups();
  }

  private async initializeMuscleGroups() {
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

    // Create demo user
    await this.createUser({
      username: "alex",
      password: "password123",
      email: "alex@example.com"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    await db.update(users).set({ currentStreak: streak }).where(eq(users.id, userId));
  }

  // Goals
  async getUserGoals(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const [goal] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return goal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Workouts
  async getUserWorkouts(userId: number, limit?: number): Promise<Workout[]> {
    const query = db.select().from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout || undefined;
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await db.insert(workouts).values(insertWorkout).returning();
    return workout;
  }

  async updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined> {
    const [workout] = await db.update(workouts).set(updates).where(eq(workouts.id, id)).returning();
    return workout || undefined;
  }

  async completeWorkout(id: number, analysis: any): Promise<Workout | undefined> {
    const [workout] = await db.update(workouts)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        aiAnalysis: analysis
      })
      .where(eq(workouts.id, id))
      .returning();
    return workout || undefined;
  }

  // Exercises
  async getWorkoutExercises(workoutId: number): Promise<Exercise[]> {
    return await db.select().from(exercises).where(eq(exercises.workoutId, workoutId));
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db.insert(exercises).values(insertExercise).returning();
    return exercise;
  }

  async updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    const [exercise] = await db.update(exercises).set(updates).where(eq(exercises.id, id)).returning();
    return exercise || undefined;
  }

  async deleteExercise(id: number): Promise<boolean> {
    const result = await db.delete(exercises).where(eq(exercises.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Programs
  async getUserPrograms(userId: number): Promise<Program[]> {
    return await db.select().from(programs).where(eq(programs.userId, userId));
  }

  async getActiveProgram(userId: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs)
      .where(and(eq(programs.userId, userId), eq(programs.isActive, true)));
    return program || undefined;
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db.insert(programs).values(insertProgram).returning();
    return program;
  }

  async updateProgram(id: number, updates: Partial<Program>): Promise<Program | undefined> {
    const [program] = await db.update(programs).set(updates).where(eq(programs.id, id)).returning();
    return program || undefined;
  }

  // Achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.createdAt));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  async markAchievementViewed(id: number): Promise<void> {
    await db.update(achievements).set({ isViewed: true }).where(eq(achievements.id, id));
  }

  // Muscle Groups
  async getAllMuscleGroups(): Promise<MuscleGroup[]> {
    return await db.select().from(muscleGroups);
  }

  async getMuscleGroup(id: number): Promise<MuscleGroup | undefined> {
    const [muscleGroup] = await db.select().from(muscleGroups).where(eq(muscleGroups.id, id));
    return muscleGroup || undefined;
  }

  async createMuscleGroup(insertMuscleGroup: InsertMuscleGroup): Promise<MuscleGroup> {
    const [muscleGroup] = await db.insert(muscleGroups).values(insertMuscleGroup).returning();
    return muscleGroup;
  }

  // Exercise Muscle Mapping
  async getExerciseMuscleMapping(exerciseName: string): Promise<ExerciseMuscleMapping[]> {
    return await db.select().from(exerciseMuscleMapping)
      .where(sql`LOWER(${exerciseMuscleMapping.exerciseName}) LIKE LOWER(${'%' + exerciseName + '%'})`);
  }

  async createExerciseMuscleMapping(insertMapping: InsertExerciseMuscleMapping): Promise<ExerciseMuscleMapping> {
    const [mapping] = await db.insert(exerciseMuscleMapping).values(insertMapping).returning();
    return mapping;
  }

  async getMuscleGroupProgress(userId: number, muscleGroupId: number): Promise<{
    frequency: number;
    volume: number;
    lastWorked: Date | null;
    intensity: number;
  }> {
    const userWorkouts = await this.getUserWorkouts(userId);
    const completedWorkouts = userWorkouts.filter(w => w.isCompleted);
    
    let frequency = 0;
    let totalVolume = 0;
    let lastWorked: Date | null = null;
    
    // Get all exercises from completed workouts
    for (const workout of completedWorkouts) {
      const exercises = await this.getWorkoutExercises(workout.id);
      
      for (const exercise of exercises) {
        // Check if this exercise targets the muscle group
        const mappings = await this.getExerciseMuscleMapping(exercise.name);
        const targetsThisMuscle = mappings.some(m => m.muscleGroupId === muscleGroupId);
        
        if (targetsThisMuscle) {
          frequency++;
          if (exercise.sets && exercise.reps && exercise.weight) {
            totalVolume += exercise.sets * exercise.reps * exercise.weight;
          }
          
          if (!lastWorked || workout.completedAt! > lastWorked) {
            lastWorked = workout.completedAt!;
          }
        }
      }
    }
    
    // Calculate intensity (0-1 scale) based on frequency and recency
    const daysSinceLastWorked = lastWorked 
      ? Math.floor((Date.now() - lastWorked.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const recencyScore = Math.max(0, 1 - (daysSinceLastWorked / 14)); // Decay over 2 weeks
    const frequencyScore = Math.min(1, frequency / 10); // Max at 10 workouts
    const intensity = (frequencyScore * 0.7) + (recencyScore * 0.3);
    
    return {
      frequency,
      volume: totalVolume,
      lastWorked,
      intensity
    };
  }
}

export const storage = new DatabaseStorage();
