import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertWorkoutSchema, 
  insertExerciseSchema, 
  insertGoalSchema,
  insertProgramSchema 
} from "@shared/schema";
import { analyzeWorkout, parseWorkoutJournal, generateWorkoutName, generatePersonalizedProgram } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    res.json({ message: "This is a protected route", userId });
  });

  // Workout routes
  app.get("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // Use optimized query that fetches workouts with exercises efficiently
      const workoutsWithExercises = await storage.getUserWorkoutsWithExercises(userId, limit);
      
      res.json(workoutsWithExercises);
    } catch (error) {
      console.error("Error fetching workouts:", error);
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
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Goals routes
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
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

  // Achievements routes
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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
      const { experience, availableDays, equipment } = req.body;
      const userId = req.user.id;

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
        isActive: false,
        focusAreas: generatedProgram.focusAreas || ["Strength", "Muscle Building"],
        equipment: equipment || ["dumbbells", "barbell", "bench"],
        durationWeeks: generatedProgram.durationWeeks || 8,
        difficulty: generatedProgram.difficulty || "intermediate"
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

  // CRITICAL: Specific route must come before parameterized route to avoid Express route conflicts
  app.get("/api/programs/active/today", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const program = await storage.getActiveProgram(userId);
      
      if (!program || program.id !== programId) {
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
      
      // Parse the schedule
      let schedule: any = {};
      try {
        schedule = typeof program.schedule === 'string' ? JSON.parse(program.schedule) : program.schedule;
      } catch (error) {
        return res.status(500).json({ message: "Invalid program schedule format" });
      }
      
      // Handle different schedule formats
      let todaysWorkout: any = null;
      let currentDayIndex: number = 0;
      
      if (schedule.days && Array.isArray(schedule.days)) {
        // Array format: cycle through program days
        const programDays = schedule.days;
        currentDayIndex = daysDiff % programDays.length;
        todaysWorkout = programDays[currentDayIndex];
      } else if (typeof schedule === 'object' && schedule !== null) {
        // Object format with numeric keys (0-6)
        const dayKeys = Object.keys(schedule).sort((a, b) => parseInt(a) - parseInt(b));
        if (dayKeys.length === 0) {
          return res.status(400).json({ message: "Program has no schedule" });
        }
        currentDayIndex = daysDiff % dayKeys.length;
        const dayKey = dayKeys[currentDayIndex];
        todaysWorkout = schedule[dayKey];
        console.log(`Program ${programId} - Completed workouts: ${programWorkouts.length}, daysDiff: ${daysDiff}, using index ${currentDayIndex}, key ${dayKey}, workout:`, todaysWorkout?.name);
      } else {
        return res.status(400).json({ message: "Program has no schedule" });
      }

      // Get user's workout history for realistic coaching insights
      const userWorkouts = await storage.getUserWorkouts(userId, 10);
      const isNewUser = userWorkouts.length === 0;
      
      // Generate workout-specific insights based on today's exercises
      const exerciseNames = todaysWorkout.exercises?.map((ex: any) => ex.name.toLowerCase()) || [];
      const isLegDay = exerciseNames.some((name: string) => 
        name.includes('squat') || name.includes('lunge') || name.includes('leg') || name.includes('calf')
      );
      const isUpperBody = exerciseNames.some((name: string) => 
        name.includes('push') || name.includes('pull') || name.includes('press') || name.includes('chest')
      );
      
      // Generate coaching insights based on actual workout content
      const insights = {
        description: todaysWorkout.description || "Focus on proper form and controlled movements as you build strength.",
        focusAreas: isLegDay ? [
          "Proper squat depth and knee tracking",
          "Controlled movement tempo", 
          "Core stability throughout exercises"
        ] : isUpperBody ? [
          "Shoulder blade retraction and stability",
          "Controlled eccentric (lowering) phase",
          "Breathing rhythm during exercises"
        ] : [
          "Proper form and technique fundamentals",
          "Controlled breathing throughout movements", 
          "Building mind-muscle connection"
        ],
        challenges: isNewUser 
          ? "Focus on learning proper form with these foundational movements. Listen to your body and don't rush."
          : isLegDay 
            ? "Lower body workouts challenge your largest muscle groups. Expect fatigue but push through - this builds real functional strength."
            : "Today's session will test your upper body endurance. Focus on quality over speed.",
        prOpportunities: isNewUser ? undefined : isLegDay 
          ? "Your squat form has been improving. Consider adding slightly more weight if you can maintain perfect technique."
          : "You've been consistent with your training. Today might be a good day to challenge yourself with an extra set.",
        encouragement: isNewUser
          ? "Every expert was once a beginner. Focus on consistency over intensity, and celebrate small wins."
          : "Your dedication is paying off. Each workout builds on the last - keep pushing forward.",
        estimatedTime: 45,
        difficulty: 3
      };

      // Calculate total days for response
      let totalDays = 7; // Default for object format
      if (schedule.days && Array.isArray(schedule.days)) {
        totalDays = schedule.days.length;
      } else if (typeof schedule === 'object' && schedule !== null) {
        totalDays = Object.keys(schedule).length;
      }

      res.json({
        programName: program.name,
        dayNumber: currentDayIndex + 1,
        totalDays: totalDays,
        workout: todaysWorkout,
        exercises: todaysWorkout.exercises || [],
        insights: insights
      });
    } catch (error) {
      console.error("Program today workout error:", error);
      res.status(500).json({ message: "Failed to get today's workout" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
