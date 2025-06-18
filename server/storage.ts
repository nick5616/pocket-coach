import { 
  users, goals, workouts, exercises, programs, achievements,
  type User, type InsertUser,
  type Goal, type InsertGoal,
  type Workout, type InsertWorkout,
  type Exercise, type InsertExercise,
  type Program, type InsertProgram,
  type Achievement, type InsertAchievement
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

  // Programs
  getUserPrograms(userId: number): Promise<Program[]>;
  getActiveProgram(userId: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, updates: Partial<Program>): Promise<Program | undefined>;

  // Achievements
  getUserAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  markAchievementViewed(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goals: Map<number, Goal>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private programs: Map<number, Program>;
  private achievements: Map<number, Achievement>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.goals = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.programs = new Map();
    this.achievements = new Map();
    this.currentId = 1;

    // Create demo user
    this.createUser({
      username: "alex",
      password: "password123",
      email: "alex@example.com"
    });
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
}

export const storage = new MemStorage();
