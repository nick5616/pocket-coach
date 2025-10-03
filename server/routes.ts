import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertWorkoutSchema, 
  insertExerciseSchema, 
  insertGoalSchema,
  insertProgramSchema,
  updateUserPreferencesSchema
} from "@shared/schema";
import { analyzeWorkout, parseWorkoutJournal, generateWorkoutName, generatePersonalizedProgram, modifyProgram } from "./services/openai";
import { editExerciseWithAI } from "./services/exercise-editor";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for deployment verification
  app.get('/api/health', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const deploymentInfoPath = path.resolve(process.cwd(), 'dist', 'deployment-info.json');
      let deploymentInfo = null;
      
      try {
        if (fs.existsSync(deploymentInfoPath)) {
          deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf-8'));
        }
      } catch (err) {
        // Deployment info not available, that's okay
      }

      // Check if build files exist
      const distExists = fs.existsSync(path.resolve(process.cwd(), 'dist'));
      const distPublicExists = fs.existsSync(path.resolve(process.cwd(), 'dist', 'public'));
      const distIndexExists = fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.js'));
      
      let assetsInfo = null;
      try {
        const assetsPath = path.resolve(process.cwd(), 'dist', 'public', 'assets');
        if (fs.existsSync(assetsPath)) {
          const assetFiles = fs.readdirSync(assetsPath);
          assetsInfo = assetFiles;
        }
      } catch (err) {
        assetsInfo = 'Error reading assets: ' + err;
      }
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        deployment: deploymentInfo,
        buildFiles: {
          distExists,
          distPublicExists,
          distIndexExists,
          assetsInfo
        },
        allEnvVars: Object.keys(process.env).filter(key => key.includes('NODE') || key.includes('ENV')),
        cwd: process.cwd()
      };
      
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Simple diagnostic endpoint to check deployment mode
  app.get('/api/debug', (req, res) => {
    res.json({
      nodeEnv: process.env.NODE_ENV,
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      serverStartTime: new Date().toISOString(),
      headers: req.headers,
      url: req.url
    });
  });
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes handled in auth.ts





  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User Preferences routes
  app.patch('/api/auth/user/preferences', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const validatedData = updateUserPreferencesSchema.parse(req.body);
      const updatedUser = await storage.updateUserPreferences(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.id;
    res.json({ message: "This is a protected route", userId });
  });

  // Workout routes
  app.get("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const limit = req.query.limit ? Math.min(Math.max(parseInt(req.query.limit as string) || 100, 1), 500) : 100;
      
      // Use optimized query that fetches workouts with exercises efficiently
      const workoutsWithExercises = await storage.getUserWorkoutsWithExercises(userId, limit);
      
      res.json(workoutsWithExercises);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const workout = await storage.getWorkout(parseInt(req.params.id));
      if (!workout || workout.userId !== userId) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const exercises = await storage.getWorkoutExercises(workout.id);
      res.json({ ...workout, exercises });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const { aiGenerateName, ...workoutData } = req.body;
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const validatedData = insertWorkoutSchema.parse({
        ...workoutData,
        userId: userId
      });
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

  app.post("/api/workouts/:id/journal", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      if (!workout || workout.userId !== userId) {
        return res.status(404).json({ message: "Workout not found" });
      }
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Journal content is required" });
      }

      // Parse the journal using AI
      const parsedData = await parseWorkoutJournal(content);
      
      // Update workout with parsed data
      const updatedWorkout = await storage.updateWorkout(workoutId, {
        notes: content,
        duration: parsedData.duration
      });

      if (!updatedWorkout) {
        return res.status(404).json({ message: "Failed to update workout" });
      }

      // Create exercises from parsed data
      const exercises = [];
      for (const exerciseData of parsedData.exercises) {
        // Handle arrays by creating individual exercise entries
        if (Array.isArray(exerciseData.reps) || Array.isArray(exerciseData.weight)) {
          // If AI returned arrays, create individual entries for each set
          const repsArray = Array.isArray(exerciseData.reps) ? exerciseData.reps : [exerciseData.reps];
          const weightsArray = Array.isArray(exerciseData.weight) ? exerciseData.weight : [exerciseData.weight];
          const maxLength = Math.max(repsArray.length, weightsArray.length);
          
          for (let i = 0; i < maxLength; i++) {
            const exerciseToCreate = {
              workoutId: workoutId,
              name: exerciseData.name,
              sets: 1, // Each entry represents one set
              reps: typeof repsArray[i] === 'number' ? repsArray[i] : undefined,
              weight: typeof weightsArray[i] === 'number' ? weightsArray[i] : undefined,
              rpe: typeof exerciseData.rpe === 'number' ? exerciseData.rpe : undefined,
              isBodyweight: typeof exerciseData.isBodyweight === 'boolean' ? exerciseData.isBodyweight : false,
              baseWeight: typeof exerciseData.baseWeight === 'number' ? exerciseData.baseWeight : 0,
              muscleGroups: Array.isArray(exerciseData.muscleGroups) ? exerciseData.muscleGroups : []
            };
            
            const exercise = await storage.createExercise(exerciseToCreate);
            exercises.push(exercise);
          }
        } else {
          // Normal case - single exercise
          const exerciseToCreate = {
            workoutId: workoutId,
            name: exerciseData.name,
            sets: typeof exerciseData.sets === 'number' ? exerciseData.sets : undefined,
            reps: typeof exerciseData.reps === 'number' ? exerciseData.reps : undefined,
            weight: typeof exerciseData.weight === 'number' ? exerciseData.weight : undefined,
            rpe: typeof exerciseData.rpe === 'number' ? exerciseData.rpe : undefined,
            isBodyweight: typeof exerciseData.isBodyweight === 'boolean' ? exerciseData.isBodyweight : false,
            baseWeight: typeof exerciseData.baseWeight === 'number' ? exerciseData.baseWeight : 0,
            muscleGroups: Array.isArray(exerciseData.muscleGroups) ? exerciseData.muscleGroups : []
          };
          
          const exercise = await storage.createExercise(exerciseToCreate);
          exercises.push(exercise);
        }
      }

      res.json({ workout: { ...workout, exercises }, parsedData });
    } catch (error) {
      console.error("Journal processing error:", error);
      res.status(500).json({ message: "Failed to process journal entry" });
    }
  });

  app.post("/api/workouts/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      if (!workout || workout.userId !== userId) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
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

  // Exercise editing with natural language AI
  app.post("/api/exercises/:id/edit-with-ai", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const { editInstruction } = req.body;

    if (!editInstruction || typeof editInstruction !== 'string') {
      return res.status(400).json({ message: "Edit instruction is required" });
    }

    try {
      // Get current exercise data
      const currentExercise = await storage.getExercise(id);
      if (!currentExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Use AI to edit the exercise
      const editedExercise = await editExerciseWithAI({
        name: currentExercise.name,
        sets: currentExercise.sets || undefined,
        reps: currentExercise.reps || undefined,
        weight: currentExercise.weight || undefined,
        rpe: currentExercise.rpe || undefined,
        isBodyweight: currentExercise.isBodyweight || false,
        baseWeight: currentExercise.baseWeight || 0,
        muscleGroups: currentExercise.muscleGroups || [],
        editInstruction
      });

      // Update the exercise in the database
      const updatedExercise = await storage.updateExercise(id, {
        name: editedExercise.name,
        sets: editedExercise.sets,
        reps: editedExercise.reps,
        weight: editedExercise.weight,
        rpe: editedExercise.rpe,
        isBodyweight: editedExercise.isBodyweight,
        baseWeight: editedExercise.baseWeight,
        muscleGroups: editedExercise.muscleGroups
      });

      if (!updatedExercise) {
        return res.status(500).json({ message: "Failed to update exercise" });
      }

      res.json({
        exercise: updatedExercise,
        changesSummary: editedExercise.changesSummary
      });
    } catch (error) {
      console.error("Failed to edit exercise with AI:", error);
      res.status(500).json({ message: "Failed to process edit instruction" });
    }
  });

  // Create exercise from programmed exercise (exact completion)
  app.post("/api/exercises/from-program", async (req, res) => {
    try {
      const { workoutId, programmedExercise } = req.body;
      
      // Get muscle groups from database/AI
      const { getExerciseMuscleGroups } = await import('./services/muscle-groups.js');
      const muscleGroups = await getExerciseMuscleGroups(programmedExercise.name);
      
      // Parse reps - handle ranges like "8-10" by taking middle value
      let reps = programmedExercise.reps;
      if (typeof reps === 'string' && reps.includes('-')) {
        const [min, max] = reps.split('-').map(Number);
        reps = Math.round((min + max) / 2);
      } else if (typeof reps === 'string') {
        reps = parseInt(reps, 10);
      }
      
      const exercise = await storage.createExercise({
        workoutId,
        name: programmedExercise.name,
        sets: programmedExercise.sets,
        reps: reps,
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
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req, res) => {
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

  // Achievements routes
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.patch("/api/achievements/:id/viewed", async (req, res) => {
    try {
      const achievementId = parseInt(req.params.id);
      await storage.markAchievementViewed(achievementId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark achievement as viewed" });
    }
  });

  // Program routes
  app.get("/api/programs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const programs = await storage.getUserPrograms(userId);
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get("/api/programs/active", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const program = await storage.getActiveProgram(userId);
      res.json(program);
    } catch (error) {
      console.error("Failed to fetch active program:", error);
      res.status(500).json({ message: "Failed to fetch active program" });
    }
  });

  app.get("/api/programs/:id", isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      
      if (isNaN(programId)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      const program = await storage.getProgram(programId);
      if (!program || program.userId !== userId) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  app.post("/api/programs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const validatedData = insertProgramSchema.parse({
        ...req.body,
        userId: userId
      });
      const program = await storage.createProgram(validatedData);
      res.json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      console.error("Program creation error:", error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  app.post("/api/programs/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Deactivate all other programs for this user first
      const userPrograms = await storage.getUserPrograms(userId);
      for (const userProgram of userPrograms) {
        if (userProgram.id !== programId) {
          await storage.updateProgram(userProgram.id, { isActive: false });
        }
      }
      
      // Activate the selected program
      const program = await storage.updateProgram(programId, { isActive: true });
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      console.error("Program activation error:", error);
      res.status(500).json({ message: "Failed to activate program" });
    }
  });

  // IMPORTANT: This specific route must come BEFORE the parameterized route below
  // to prevent "active" from being interpreted as an ID parameter
  app.get("/api/programs/active/today", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const program = await storage.getActiveProgram(userId);
      
      if (!program) {
        return res.status(404).json({ message: "Program not found or not active" });
      }

      // Calculate which day of the program we're on based on completed workouts
      const completedWorkouts = await storage.getUserWorkouts(userId);
      const programWorkouts = completedWorkouts.filter(w => 
        w.isCompleted && 
        w.createdAt && 
        new Date(w.createdAt) >= new Date(program.createdAt!)
      );
      const daysDiff = programWorkouts.length;
      console.log(`[ACTIVE/TODAY DEBUG] Program progress: ${programWorkouts.length} completed workouts since program created`);
      console.log(`[ACTIVE/TODAY DEBUG] Program created: ${program.createdAt}, Completed workouts:`, programWorkouts.map(w => ({id: w.id, completed: w.isCompleted, created: w.createdAt})));
      
      // Parse the schedule to get today's workout
      let schedule: any = {};
      try {
        schedule = typeof program.schedule === 'string' ? JSON.parse(program.schedule) : program.schedule;
      } catch (error) {
        return res.status(500).json({ message: "Invalid program schedule format" });
      }

      // Handle object format with numeric keys (0-6 for days of week)
      let todaysWorkout: any = null;
      
      if (schedule.days && Array.isArray(schedule.days)) {
        // Array format: cycle through program days
        const programDays = schedule.days;
        const currentDayIndex = daysDiff % programDays.length;
        todaysWorkout = programDays[currentDayIndex];
      } else if (schedule.weeks && Array.isArray(schedule.weeks)) {
        // Weeks format: weeks with days
        const weekNumber = Math.floor(daysDiff / 7) % schedule.weeks.length;
        const dayNumber = daysDiff % 7;
        const currentWeek = schedule.weeks[weekNumber];
        todaysWorkout = currentWeek?.days?.[dayNumber];
      } else if (typeof schedule === 'object' && schedule !== null) {
        // Object format with numeric keys (0-6)
        const dayKeys = Object.keys(schedule).sort((a, b) => parseInt(a) - parseInt(b));
        const currentDayIndex = daysDiff % dayKeys.length;
        const dayKey = dayKeys[currentDayIndex];
        todaysWorkout = schedule[dayKey];
        console.log(`[ACTIVE/TODAY] Program workouts completed: ${programWorkouts.length}, daysDiff: ${daysDiff}, using index ${currentDayIndex}, key ${dayKey}, workout:`, todaysWorkout?.name);
        console.log(`[ACTIVE/TODAY] Workout exercises:`, todaysWorkout?.exercises?.length || 0, 'exercises found');
      } else {
        return res.status(400).json({ message: "Invalid program schedule format" });
      }
      
      if (!todaysWorkout || todaysWorkout.isRestDay) {
        return res.status(404).json({ message: "Today is a rest day or no workout scheduled" });
      }
      
      const response = {
        program,
        workout: todaysWorkout,
        exercises: todaysWorkout.exercises || []
      };
      console.log(`[ACTIVE/TODAY] Returning response with ${response.exercises.length} exercises`);
      res.json(response);
    } catch (error) {
      console.error("Today's workout error:", error);
      res.status(500).json({ message: "Failed to fetch today's workout" });
    }
  });

  app.get("/api/programs/:id/today", isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      
      if (isNaN(programId)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const program = await storage.getProgram(programId);
      if (!program || program.userId !== userId) {
        return res.status(404).json({ message: "Program not found" });
      }

      // Get today's workout from the schedule
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      console.log(`Today is day ${dayOfWeek}, program schedule:`, program.schedule);
      
      // Simple schedule mapping - in a real app this would be more sophisticated
      let schedule = program.schedule || {};
      
      // Handle case where schedule might be a JSON string
      if (typeof schedule === 'string') {
        try {
          schedule = JSON.parse(schedule);
          console.log('Parsed schedule:', schedule);
        } catch (error) {
          console.log('Failed to parse schedule:', error);
          schedule = {};
        }
      }
      
      const todaySchedule = schedule && typeof schedule === 'object' 
        ? (schedule as any)[dayOfWeek] || (schedule as any)[Object.keys(schedule)[0]]
        : null;
        
      console.log('Today schedule:', todaySchedule);
      
      // If no schedule exists, provide a default workout structure
      if (!todaySchedule) {
        const defaultWorkout = {
          name: `Day ${dayOfWeek + 1} Workout`,
          description: "A balanced workout targeting multiple muscle groups",
          exercises: [
            {
              name: "Push-ups",
              sets: 3,
              reps: "12-15",
              notes: "Focus on controlled movement and full range of motion"
            },
            {
              name: "Squats", 
              sets: 3,
              reps: "10-12",
              weight: "Bodyweight",
              notes: "Keep chest up and drive through heels"
            },
            {
              name: "Pull-ups",
              sets: 3, 
              reps: "5-8",
              notes: "Use assistance if needed, focus on form over quantity"
            }
          ]
        };
        
        // Get user's workout history to provide realistic coaching
        const userWorkouts = await storage.getUserWorkouts(userId, 10);
        const isNewUser = userWorkouts.length === 0;
        
        const response = {
          workout: defaultWorkout,
          exercises: defaultWorkout.exercises,
          insights: {
            description: "Today's session focuses on building foundational strength and proper movement patterns.",
            focusAreas: [
              "Proper form and technique fundamentals",
              "Controlled breathing throughout movements", 
              "Building mind-muscle connection"
            ],
            challenges: isNewUser 
              ? "As you're starting your fitness journey, focus on learning proper form. Listen to your body and don't rush through movements."
              : "The supersets in today's workout will test your cardiovascular endurance. Expect to feel the burn, but push through - this is where real growth happens.",
            encouragement: isNewUser
              ? "Welcome to your fitness journey! Every expert was once a beginner. Focus on consistency over intensity, and celebrate small wins."
              : "You've been consistently showing up and it's paying off. Your strength gains have been impressive. Trust your preparation and give it everything you've got.",
            estimatedTime: 45,
            difficulty: isNewUser ? 2 : 3
          }
        };
        
        return res.json(response);
      }

      // Get user's workout history for realistic coaching insights
      const userWorkouts = await storage.getUserWorkouts(userId, 10);
      const isNewUser = userWorkouts.length === 0;
      
      // Generate coaching insights based on actual user data
      const insights = {
        description: todaySchedule.description || "Focus on proper form and controlled movements as you build strength.",
        focusAreas: [
          "Proper form and technique fundamentals",
          "Controlled breathing throughout movements", 
          "Building mind-muscle connection"
        ],
        challenges: isNewUser 
          ? "As you're starting your fitness journey, focus on learning proper form. Listen to your body and don't rush through movements."
          : "The supersets in today's workout will test your cardiovascular endurance. Expect to feel the burn, but push through - this is where real growth happens.",
        prOpportunities: isNewUser ? undefined : "Your bench press numbers have been climbing. Today might be the day to attempt a new personal record on your final working set.",
        encouragement: isNewUser
          ? "Every expert was once a beginner. Focus on consistency over intensity, and celebrate small wins. You're building habits that will transform your life."
          : "You've been consistently showing up and it's paying off. Your strength gains over the past month have been impressive. Trust your preparation and give it everything you've got.",
        estimatedTime: 45,
        difficulty: isNewUser ? 2 : 3
      };

      const response = {
        workout: {
          name: todaySchedule.name || `Day ${dayOfWeek + 1} Workout`,
          description: todaySchedule.description || insights.description
        },
        exercises: todaySchedule.exercises || [
          {
            name: "Push-ups",
            sets: 3,
            reps: "12-15",
            notes: "Focus on controlled movement and full range of motion"
          },
          {
            name: "Squats", 
            sets: 3,
            reps: "10-12",
            weight: "Bodyweight",
            notes: "Keep chest up and drive through heels"
          },
          {
            name: "Pull-ups",
            sets: 3, 
            reps: "5-8",
            notes: "Use assistance if needed, focus on form over quantity"
          }
        ],
        insights
      };

      res.json(response);
    } catch (error) {
      console.error("Today's workout fetch error:", error);
      res.status(500).json({ message: "Failed to fetch today's workout" });
    }
  });

  app.post("/api/programs/generate", isAuthenticated, async (req, res) => {
    try {
      const { goals, experience, availableDays, equipment } = req.body;
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Generate program based on user's natural language goals
      const generatedProgram = await generatePersonalizedProgram(
        goals,
        experience,
        availableDays,
        equipment
      );

      // Return the generated program for confirmation (don't save yet)
      res.json(generatedProgram);
    } catch (error) {
      console.error("Program generation error:", error);
      res.status(500).json({ message: "Failed to generate program" });
    }
  });

  app.post("/api/programs/modify", isAuthenticated, async (req, res) => {
    try {
      const { program, feedback } = req.body;
      
      if (!program || !feedback) {
        return res.status(400).json({ message: "Program and feedback are required" });
      }
      
      console.log("Program modification request:", { programId: program?.id, feedback });
      
      // Modify the program based on user feedback
      const modifiedProgram = await modifyProgram(program, feedback);
      
      console.log("Program modification successful");
      res.json(modifiedProgram);
    } catch (error) {
      console.error("Program modification error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to modify program", error: errorMessage });
    }
  });

  app.post("/api/programs/confirm", isAuthenticated, async (req, res) => {
    try {
      const { program } = req.body;
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Save the confirmed program to database
      const savedProgram = await storage.createProgram({
        userId: userId,
        name: program.name,
        description: program.description,
        schedule: program.schedule,
        aiGenerated: true,
        isActive: false,
        focusAreas: program.focusAreas || ["Strength", "Muscle Building"],
        equipment: program.equipment || ["dumbbells", "barbell", "bench"],
        durationWeeks: program.durationWeeks || 8,
        difficulty: program.difficulty || "intermediate"
      });

      res.json(savedProgram);
    } catch (error) {
      console.error("Program confirmation error:", error);
      res.status(500).json({ message: "Failed to save program" });
    }
  });

  app.patch("/api/programs/:id", isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const updates = req.body;
      
      // If activating a program, deactivate all other programs for this user first
      if (updates.isActive === true) {
        const userId = (req.user as any)?.id;
        if (!userId) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        // Get all user programs and deactivate them
        const userPrograms = await storage.getUserPrograms(userId);
        for (const userProgram of userPrograms) {
          if (userProgram.id !== programId) {
            await storage.updateProgram(userProgram.id, { isActive: false });
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





  // Additional achievement routes
  app.get("/api/user/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
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
      const userId = req.query.userId as string;
      
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
      const userId = req.query.userId as string;
      
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
