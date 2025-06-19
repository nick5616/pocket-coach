import { 
  users, goals, workouts, exercises, sets, programs, achievements, muscleGroups, exerciseMuscleMapping,
  type User, type InsertUser,
  type Goal, type InsertGoal,
  type Workout, type InsertWorkout,
  type Exercise, type InsertExercise,
  type Set, type InsertSet,
  type Program, type InsertProgram,
  type Achievement, type InsertAchievement,
  type MuscleGroup, type InsertMuscleGroup,
  type ExerciseMuscleMapping, type InsertExerciseMuscleMapping
} from "@shared/schema";

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

  // Sets
  getExerciseSets(exerciseId: number): Promise<Set[]>;
  createSet(set: InsertSet): Promise<Set>;
  updateSet(id: number, updates: Partial<Set>): Promise<Set | undefined>;
  deleteSet(id: number): Promise<boolean>;
  getWorkoutSets(workoutId: number): Promise<(Set & { exerciseName: string })[]>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goals: Map<number, Goal>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private sets: Map<number, Set>;
  private programs: Map<number, Program>;
  private achievements: Map<number, Achievement>;
  private muscleGroups: Map<number, MuscleGroup>;
  private exerciseMuscleMapping: Map<number, ExerciseMuscleMapping>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.goals = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.sets = new Map();
    this.programs = new Map();
    this.achievements = new Map();
    this.muscleGroups = new Map();
    this.exerciseMuscleMapping = new Map();
    this.currentId = 1;

    // Create demo user
    this.createUser({
      username: "alex",
      password: "password123",
      email: "alex@example.com"
    });

    // Initialize muscle groups
    this.initializeMuscleGroups();
  }

  private async initializeMuscleGroups() {
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

    for (const data of muscleGroupsData) {
      await this.createMuscleGroup(data);
    }

    // Initialize common exercise-muscle mappings
    const exerciseMappings = [
      // Chest exercises
      { exerciseName: "bench press", muscleGroupId: 1, primaryMuscle: true },
      { exerciseName: "push ups", muscleGroupId: 1, primaryMuscle: true },
      { exerciseName: "dumbbell press", muscleGroupId: 1, primaryMuscle: true },
      { exerciseName: "incline press", muscleGroupId: 1, primaryMuscle: true },
      { exerciseName: "chest fly", muscleGroupId: 1, primaryMuscle: true },
      
      // Back exercises
      { exerciseName: "pull ups", muscleGroupId: 2, primaryMuscle: true },
      { exerciseName: "rows", muscleGroupId: 2, primaryMuscle: true },
      { exerciseName: "lat pulldown", muscleGroupId: 2, primaryMuscle: true },
      { exerciseName: "deadlift", muscleGroupId: 2, primaryMuscle: true },
      
      // Shoulder exercises
      { exerciseName: "shoulder press", muscleGroupId: 3, primaryMuscle: true },
      { exerciseName: "lateral raises", muscleGroupId: 3, primaryMuscle: true },
      { exerciseName: "front raises", muscleGroupId: 3, primaryMuscle: true },
      
      // Leg exercises
      { exerciseName: "squats", muscleGroupId: 10, primaryMuscle: true },
      { exerciseName: "lunges", muscleGroupId: 10, primaryMuscle: true },
      { exerciseName: "leg press", muscleGroupId: 10, primaryMuscle: true },
      { exerciseName: "leg curls", muscleGroupId: 11, primaryMuscle: true },
      { exerciseName: "calf raises", muscleGroupId: 13, primaryMuscle: true },
    ];

    for (const mapping of exerciseMappings) {
      await this.createExerciseMuscleMapping(mapping);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      currentStreak: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.currentStreak = streak;
      this.users.set(userId, user);
    }
  }

  // Goals
  async getUserGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentId++;
    const goal: Goal = {
      ...insertGoal,
      id,
      description: insertGoal.description || null,
      targetValue: insertGoal.targetValue || null,
      unit: insertGoal.unit || null,
      muscleGroup: insertGoal.muscleGroup || null,
      status: insertGoal.status || "active",
      targetDate: insertGoal.targetDate || null,
      currentValue: 0,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (goal) {
      const updated = { ...goal, ...updates };
      this.goals.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Workouts
  async getUserWorkouts(userId: number, limit?: number): Promise<Workout[]> {
    const userWorkouts = Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    return limit ? userWorkouts.slice(0, limit) : userWorkouts;
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentId++;
    const workout: Workout = {
      ...insertWorkout,
      id,
      notes: insertWorkout.notes || null,
      duration: insertWorkout.duration || null,
      calories: insertWorkout.calories || null,
      totalVolume: 0,
      aiAnalysis: null,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date()
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (workout) {
      const updated = { ...workout, ...updates };
      this.workouts.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async completeWorkout(id: number, analysis: any): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (workout) {
      const updated = {
        ...workout,
        isCompleted: true,
        completedAt: new Date(),
        aiAnalysis: analysis
      };
      this.workouts.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Exercises
  async getWorkoutExercises(workoutId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => exercise.workoutId === workoutId);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.currentId++;
    const exercise: Exercise = {
      ...insertExercise,
      id,
      notes: insertExercise.notes || null,
      sets: insertExercise.sets || null,
      reps: insertExercise.reps || null,
      weight: insertExercise.weight || null,
      rpe: insertExercise.rpe || null,
      restTime: insertExercise.restTime || null,
      muscleGroups: insertExercise.muscleGroups || null,
      createdAt: new Date()
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (exercise) {
      const updated = { ...exercise, ...updates };
      this.exercises.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Programs
  async getUserPrograms(userId: number): Promise<Program[]> {
    return Array.from(this.programs.values()).filter(program => program.userId === userId);
  }

  async getActiveProgram(userId: number): Promise<Program | undefined> {
    return Array.from(this.programs.values()).find(program => program.userId === userId && program.isActive);
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.currentId++;
    const program: Program = {
      ...insertProgram,
      id,
      description: insertProgram.description || null,
      isActive: insertProgram.isActive || false,
      schedule: insertProgram.schedule || null,
      aiGenerated: insertProgram.aiGenerated || false,
      createdAt: new Date()
    };
    this.programs.set(id, program);
    return program;
  }

  async updateProgram(id: number, updates: Partial<Program>): Promise<Program | undefined> {
    const program = this.programs.get(id);
    if (program) {
      const updated = { ...program, ...updates };
      this.programs.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId++;
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      description: insertAchievement.description || null,
      data: insertAchievement.data || null,
      isViewed: false,
      createdAt: new Date()
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async markAchievementViewed(id: number): Promise<void> {
    const achievement = this.achievements.get(id);
    if (achievement) {
      achievement.isViewed = true;
      this.achievements.set(id, achievement);
    }
  }

  // Muscle Groups
  async getAllMuscleGroups(): Promise<MuscleGroup[]> {
    return Array.from(this.muscleGroups.values());
  }

  async getMuscleGroup(id: number): Promise<MuscleGroup | undefined> {
    return this.muscleGroups.get(id);
  }

  async createMuscleGroup(insertMuscleGroup: InsertMuscleGroup): Promise<MuscleGroup> {
    const id = this.currentId++;
    const muscleGroup: MuscleGroup = {
      ...insertMuscleGroup,
      id
    };
    this.muscleGroups.set(id, muscleGroup);
    return muscleGroup;
  }

  // Exercise Muscle Mapping
  async getExerciseMuscleMapping(exerciseName: string): Promise<ExerciseMuscleMapping[]> {
    return Array.from(this.exerciseMuscleMapping.values())
      .filter(mapping => mapping.exerciseName.toLowerCase().includes(exerciseName.toLowerCase()));
  }

  async createExerciseMuscleMapping(insertMapping: InsertExerciseMuscleMapping): Promise<ExerciseMuscleMapping> {
    const id = this.currentId++;
    const mapping: ExerciseMuscleMapping = {
      ...insertMapping,
      id,
      primaryMuscle: insertMapping.primaryMuscle ?? true
    };
    this.exerciseMuscleMapping.set(id, mapping);
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

export const storage = new MemStorage();
