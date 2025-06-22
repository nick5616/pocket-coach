import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertWorkoutSchema, 
  insertExerciseSchema, 
  insertGoalSchema,
  insertProgramSchema 
} from "@shared/schema";
import { analyzeWorkout, parseWorkoutJournal, generateWorkoutName, generatePersonalizedProgram } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes (simplified for demo)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, email: user.email, currentStreak: user.currentStreak } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username, email: user.email, currentStreak: user.currentStreak });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const workouts = await storage.getUserWorkouts(userId, limit);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workout = await storage.getWorkout(parseInt(req.params.id));
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const exercises = await storage.getWorkoutExercises(workout.id);
      res.json({ ...workout, exercises });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const { aiGenerateName, ...workoutData } = req.body;
      const validatedData = insertWorkoutSchema.parse(workoutData);
      const workout = await storage.createWorkout({
        ...validatedData,
        aiGenerateName: aiGenerateName || false
      });
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.post("/api/workouts/:id/journal", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Journal content is required" });
      }

      // Parse the journal using AI
      const parsedData = await parseWorkoutJournal(content);
      
      // Update workout with parsed data
      const workout = await storage.updateWorkout(workoutId, {
        notes: content,
        duration: parsedData.duration
      });

      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }

      // Create exercises from parsed data
      const exercises = [];
      for (const exerciseData of parsedData.exercises) {
        const exercise = await storage.createExercise({
          workoutId: workoutId,
          name: exerciseData.name,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          weight: exerciseData.weight,
          rpe: exerciseData.rpe,
          muscleGroups: exerciseData.muscleGroups
        });
        exercises.push(exercise);
      }

      res.json({ workout: { ...workout, exercises }, parsedData });
    } catch (error) {
      console.error("Journal processing error:", error);
      res.status(500).json({ message: "Failed to process journal entry" });
    }
  });

  app.post("/api/workouts/:id/complete", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }

      const exercises = await storage.getWorkoutExercises(workoutId);
      const userGoals = await storage.getUserGoals(workout.userId);
      const previousWorkouts = await storage.getUserWorkouts(workout.userId, 5);

      // Get AI analysis
      const analysis = await analyzeWorkout(
        workout.notes || "",
        exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets || undefined,
          reps: ex.reps || undefined,
          weight: ex.weight || undefined,
          rpe: ex.rpe || undefined
        })),
        userGoals.map(goal => ({
          title: goal.title,
          category: goal.category,
          muscleGroup: goal.muscleGroup || undefined,
          targetValue: goal.targetValue || undefined,
          currentValue: goal.currentValue || undefined
        })),
        previousWorkouts.map(w => ({
          name: w.name,
          notes: w.notes || undefined,
          createdAt: w.createdAt!
        }))
      );

      // Calculate total volume
      const totalVolume = exercises.reduce((sum, ex) => {
        return sum + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0));
      }, 0);

      // Generate AI name if requested
      let finalName = workout.name;
      if (workout.aiGenerateName && exercises.length > 0) {
        try {
          const aiName = await generateWorkoutName(exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets || undefined,
            reps: ex.reps || undefined,
            weight: ex.weight || undefined
          })));
          finalName = aiName;
        } catch (error) {
          console.error("AI name generation failed:", error);
          // Keep original name if AI fails
        }
      }

      // Complete the workout with AI name
      const completedWorkout = await storage.completeWorkout(workoutId, analysis);
      
      // Update the workout name if AI generated one
      if (finalName !== workout.name) {
        await storage.updateWorkout(workoutId, { name: finalName });
      }
      
      if (completedWorkout) {
        await storage.updateWorkout(workoutId, {
          totalVolume: totalVolume,
          calories: analysis.estimatedCalories
        });

        // Update user streak
        const user = await storage.getUser(workout.userId);
        if (user) {
          await storage.updateUserStreak(workout.userId, (user.currentStreak || 0) + 1);
        }

        // Create achievement
        await storage.createAchievement({
          userId: workout.userId,
          type: "workout_complete",
          title: "Great Work!",
          description: `You've completed ${finalName}. Keep up the momentum!`,
          data: { workoutId: workoutId, analysis: analysis }
        });
      }

      res.json({ workout: completedWorkout, analysis });
    } catch (error) {
      console.error("Workout completion error:", error);
      res.status(500).json({ message: "Failed to complete workout" });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const workoutId = parseInt(req.query.workoutId as string);
      if (!workoutId) {
        return res.status(400).json({ message: "workoutId is required" });
      }
      
      const exercises = await storage.getWorkoutExercises(workoutId);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const validatedData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(validatedData);
      res.json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  app.patch("/api/exercises/:id", async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const updates = req.body;
      
      const exercise = await storage.updateExercise(exerciseId, updates);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.id);
      
      const success = await storage.deleteExercise(exerciseId);
      if (!success) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });

  // Create exercise from programmed exercise (exact completion)
  app.post("/api/exercises/from-program", async (req, res) => {
    try {
      const { workoutId, programmedExercise } = req.body;
      
      // Get muscle groups from database/AI
      const { getExerciseMuscleGroups } = await import('./services/muscle-groups.js');
      const muscleGroups = await getExerciseMuscleGroups(programmedExercise.name);
      
      const exercise = await storage.createExercise({
        workoutId,
        name: programmedExercise.name,
        sets: programmedExercise.sets,
        reps: programmedExercise.reps,
        weight: programmedExercise.weight || null,
        rpe: programmedExercise.rpe || null,
        restTime: programmedExercise.restTime || null,
        notes: "Completed as programmed",
        muscleGroups: muscleGroups
      });

      res.json(exercise);
    } catch (error) {
      console.error("Error creating exercise from program:", error);
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Get muscle groups for an exercise
  app.get("/api/exercises/:exerciseName/muscle-groups", async (req, res) => {
    try {
      const { exerciseName } = req.params;
      const { getExerciseMuscleGroups } = await import('./services/muscle-groups.js');
      const muscleGroups = await getExerciseMuscleGroups(exerciseName);
      
      res.json({ muscleGroups });
    } catch (error) {
      console.error("Error getting muscle groups for exercise:", error);
      res.status(500).json({ message: "Failed to get muscle groups" });
    }
  });

  // Swap exercise for equivalent
  app.post("/api/exercises/swap", async (req, res) => {
    try {
      const { originalExercise, reason } = req.body;
      
      const { swapExerciseForEquivalent } = await import('./services/exercise-swap');
      const swappedExercise = await swapExerciseForEquivalent(originalExercise, reason);
      
      res.json({ swappedExercise });
    } catch (error) {
      console.error("Error swapping exercise:", error);
      res.status(500).json({ message: "Failed to swap exercise" });
    }
  });

  // Goal routes
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const updates = req.body;
      
      const goal = await storage.updateGoal(goalId, updates);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Program routes
  app.get("/api/programs", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const programs = await storage.getUserPrograms(userId);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get("/api/programs/active", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const program = await storage.getActiveProgram(userId);
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active program" });
    }
  });

  app.post("/api/programs/generate", async (req, res) => {
    try {
      const { userId, experience, availableDays, equipment } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const userGoals = await storage.getUserGoals(userId);
      
      const generatedProgram = await generatePersonalizedProgram(
        userGoals.map(goal => ({
          title: goal.title,
          category: goal.category,
          muscleGroup: goal.muscleGroup || undefined
        })),
        experience || "intermediate",
        availableDays || 3,
        equipment || ["dumbbells", "barbell", "bench"]
      );

      const program = await storage.createProgram({
        userId: userId,
        name: generatedProgram.name,
        description: generatedProgram.description,
        schedule: generatedProgram.schedule,
        aiGenerated: true,
        isActive: false
      });

      res.json(program);
    } catch (error) {
      console.error("Program generation error:", error);
      res.status(500).json({ message: "Failed to generate program" });
    }
  });

  app.patch("/api/programs/:id", async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const updates = req.body;
      
      // If activating a program, deactivate all other programs for this user first
      if (updates.isActive === true) {
        const program = await storage.updateProgram(programId, { isActive: false });
        if (program) {
          // Get all user programs and deactivate them
          const userPrograms = await storage.getUserPrograms(program.userId);
          for (const userProgram of userPrograms) {
            if (userProgram.id !== programId) {
              await storage.updateProgram(userProgram.id, { isActive: false });
            }
          }
        }
      }
      
      const program = await storage.updateProgram(programId, updates);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      console.error("Program update error:", error);
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  app.get("/api/programs/active/today", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const program = await storage.getActiveProgram(userId);
      
      if (!program) {
        return res.status(404).json({ message: "Program not found or not active" });
      }

      // Calculate which day of the program we're on
      const startDate = new Date(program.createdAt!);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Parse the schedule to get today's workout
      let schedule: any = {};
      try {
        schedule = typeof program.schedule === 'string' ? JSON.parse(program.schedule) : program.schedule;
      } catch (error) {
        return res.status(500).json({ message: "Invalid program schedule format" });
      }
      
      // Get the current week and day
      const weekNumber = Math.floor(daysDiff / 7) % (schedule.weeks?.length || 1);
      const dayNumber = daysDiff % 7;
      
      const currentWeek = schedule.weeks?.[weekNumber];
      const todaysWorkout = currentWeek?.days?.[dayNumber];
      
      if (!todaysWorkout || todaysWorkout.isRestDay) {
        return res.status(404).json({ message: "Today is a rest day or no workout scheduled" });
      }
      
      res.json({
        program,
        workout: todaysWorkout,
        weekNumber: weekNumber + 1,
        dayNumber: dayNumber + 1
      });
    } catch (error) {
      console.error("Today's workout error:", error);
      res.status(500).json({ message: "Failed to fetch today's workout" });
    }
  });

  app.get("/api/programs/:id/today", async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const program = await storage.getActiveProgram(1); // Mock user ID
      
      if (!program || program.id !== programId) {
        return res.status(404).json({ message: "Program not found or not active" });
      }

      // Calculate which day of the program we're on
      const startDate = new Date(program.createdAt!);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const schedule = program.schedule as { days?: any[] };
      if (!schedule || !schedule.days || !Array.isArray(schedule.days)) {
        return res.status(400).json({ message: "Program has no schedule" });
      }

      // Get current workout day (cycle through program days)
      const programDays = schedule.days;
      const currentDayIndex = daysDiff % programDays.length;
      const todaysWorkout = programDays[currentDayIndex];

      res.json({
        programName: program.name,
        dayNumber: currentDayIndex + 1,
        totalDays: programDays.length,
        workout: todaysWorkout
      });
    } catch (error) {
      console.error("Program today workout error:", error);
      res.status(500).json({ message: "Failed to get today's workout" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.patch("/api/achievements/:id/viewed", async (req, res) => {
    try {
      const achievementId = parseInt(req.params.id);
      if (isNaN(achievementId)) {
        return res.status(400).json({ message: "Invalid achievement ID" });
      }
      await storage.markAchievementViewed(achievementId);
      res.json({ success: true });
    } catch (error) {
      console.error("Achievement viewing error:", error);
      res.status(500).json({ message: "Failed to mark achievement as viewed" });
    }
  });

  // Muscle Groups routes
  app.get("/api/muscle-groups", async (req, res) => {
    try {
      const muscleGroups = await storage.getAllMuscleGroups();
      res.json(muscleGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch muscle groups" });
    }
  });

  app.get("/api/muscle-groups/:id/progress", async (req, res) => {
    try {
      const muscleGroupId = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const progress = await storage.getMuscleGroupProgress(userId, muscleGroupId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch muscle group progress" });
    }
  });

  app.get("/api/progress/heat-map", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const muscleGroups = await storage.getAllMuscleGroups();
      const heatMapData = [];
      
      for (const muscleGroup of muscleGroups) {
        const progress = await storage.getMuscleGroupProgress(userId, muscleGroup.id);
        heatMapData.push({
          muscleGroup,
          progress
        });
      }
      
      res.json(heatMapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heat map data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
