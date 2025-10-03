import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  Trash2,
  Send,
  Trophy,
  Target,
  Calendar,
  Clock,
  Gem,
  Dumbbell,
  Hash,
  Weight,
  Sparkles,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import LoadingScreen from "../components/loading-screen";
import LoadingSkeleton from "../components/loading-skeleton";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/Dialog";
import { Checkbox } from "@/components/Checkbox";
import { Progress } from "@/components/Progress";
import { useToast } from "@/hooks/use-toast";
import { ExerciseMuscleGroups } from "@/components/exercise-muscle-groups";
import BottomNavigation from "@/components/bottom-navigation";
import AchievementModal from "@/components/achievement-modal";
import { useUserPreferences, getEffortTrackingInfo, convertRirToRpe, convertRpeToRir } from "@/contexts/user-preferences-context";
import { type Workout, type Exercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import styles from "@/styles/workout-journal.module.css";

export default function WorkoutJournal() {
  const { id: workoutId } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { effortTrackingPreference } = useUserPreferences();
  const effortTrackingInfo = getEffortTrackingInfo(effortTrackingPreference);

  // Form states
  const [isEditing, setIsEditing] = useState(true);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  // Journal states
  const [currentInput, setCurrentInput] = useState("");
  const [currentThought, setCurrentThought] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "typing" | "saved">(
    "idle",
  );
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Form data states
  const [workoutName, setWorkoutName] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editExerciseNotes, setEditExerciseNotes] = useState("");
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(
    null,
  );
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupNotes, setEditGroupNotes] = useState("");
  const [editingSetData, setEditingSetData] = useState<
    Record<number, { reps?: number; weight?: number; effort?: number }>
  >({});

  const [skippedExercises, setSkippedExercises] = useState<Set<number>>(
    new Set(),
  );
  const [swappedExercises, setSwappedExercises] = useState<Map<number, any>>(
    new Map(),
  );
  const [deleteExerciseId, setDeleteExerciseId] = useState<number | null>(null);
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  
  // Exercise modification sheet state
  const [modifyingExercise, setModifyingExercise] = useState<{ exercise: any; index: number } | null>(null);
  const [modifiedSets, setModifiedSets] = useState<number>(0);
  const [modifiedReps, setModifiedReps] = useState<number>(0);
  const [modifiedRpe, setModifiedRpe] = useState<number>(0);
  
  // Card-based navigation states
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [showGestureHints, setShowGestureHints] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Group exercises by name for display
  // Helper function to title case strings
  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  const groupExercisesByName = (exercises: Exercise[]) => {
    const grouped = new Map<string, Exercise[]>();

    exercises.forEach((exercise) => {
      const name = exercise.name;
      if (!grouped.has(name)) {
        grouped.set(name, []);
      }
      grouped.get(name)!.push(exercise);
    });

    return Array.from(grouped.entries()).map(([name, exerciseGroup]) => {
      // Collect all unique notes from exercises in this group
      const allNotes = exerciseGroup
        .map((e) => e.notes)
        .filter((note) => note && note.trim())
        .filter((note, index, arr) => arr.indexOf(note) === index);

      return {
        name: toTitleCase(name),
        exercises: exerciseGroup,
        muscleGroups: exerciseGroup[0]?.muscleGroups || [],
        notes: allNotes.length > 0 ? allNotes.join("; ") : null,
      };
    });
  };

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Queries
  const { data: workout, isLoading: workoutLoading } = useQuery({
    queryKey: ["/api/workouts", workoutId],
    queryFn: () =>
      fetch(`/api/workouts/${workoutId}`).then((res) => res.json()),
    enabled: !!workoutId,
  });

  // Calculate total workout volume (Force × Distance approximation)
  const calculateWorkoutVolume = (exercises: Exercise[]) => {
    return exercises.reduce((total, exercise) => {
      if (exercise.weight && exercise.sets) {
        // Approximate volume as weight × sets × reps (using average 10 reps if not specified)
        const reps = exercise.reps || 10;
        return total + exercise.weight * exercise.sets * reps;
      }
      return total;
    }, 0);
  };

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ["/api/workouts", workoutId, "exercises"],
    queryFn: () =>
      fetch(`/api/exercises?workoutId=${workoutId}`).then((res) => res.json()),
    enabled: !!workoutId,
  });

  const { data: activeProgram, isLoading: activeProgramLoading } = useQuery({
    queryKey: ["/api/programs/active"],
    queryFn: () =>
      fetch("/api/programs/active", { credentials: "include" }).then((res) =>
        res.json(),
      ),
    enabled: !workoutId,
  });

  const { data: todaysWorkout, isLoading: todaysWorkoutLoading } = useQuery({
    queryKey: ["/api/programs/active/today"],
    queryFn: () =>
      fetch("/api/programs/active/today", { credentials: "include" }).then(
        (res) => res.json(),
      ),
    enabled: !workoutId && !!activeProgram,
  });

  const totalVolume = calculateWorkoutVolume(exercises as Exercise[]);

  // Check if workout is completed
  const isWorkoutCompleted = workout?.isCompleted || false;

  // Mutations - Must be declared before any conditional returns
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      aiGenerateName: boolean;
      date?: string;
    }) => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create workout");
      return response.json();
    },
    onSuccess: (newWorkout) => {
      // Navigate to the newly created workout
      setLocation(`/workout-journal/${newWorkout.id}`);
    },
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workouts/${workoutId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to complete workout");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.achievements?.length > 0) {
        setCurrentAchievement(data.achievements[0]);
        setShowAchievement(true);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs/active/today"] });
      // Stay on workout page - don't navigate away
      toast({
        title: "Workout Complete!",
        description: "Great work! Your progress has been saved.",
      });
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; notes: string }) => {
      const response = await fetch(`/api/exercises/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, notes: data.notes }),
      });
      if (!response.ok) throw new Error("Failed to update exercise");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts", workoutId, "exercises"],
      });
      setEditingExercise(null);
      toast({ title: "Exercise updated successfully" });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete exercise");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts", workoutId, "exercises"],
      });
      toast({ title: "Exercise deleted successfully" });
    },
  });

  const aiEditMutation = useMutation({
    mutationFn: async ({ exerciseId, instruction }: { exerciseId: number; instruction: string }) => {
      const response = await apiRequest("POST", `/api/exercises/${exerciseId}/edit-with-ai`, {
        editInstruction: instruction
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Exercise Updated!",
        description: data.changesSummary || "Exercise successfully updated with your changes.",
      });
      
      // Refresh exercise data with correct query keys
      if (workoutId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/workouts", workoutId, "exercises"] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ["/api/workouts", workoutId] 
        });
      }
      queryClient.invalidateQueries({ 
        queryKey: ["/api/workouts"] 
      });
      
      // Close dialog and clear instruction
      setEditingExercise(null);
      setAiEditInstruction("");
    },
    onError: (error: any) => {
      console.error("AI edit error:", error);
      toast({
        title: "Edit Failed",
        description: "Could not process your edit instruction. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createExerciseFromProgramMutation = useMutation({
    mutationFn: async (data: {
      workoutId: string;
      programmedExercise: any;
    }) => {
      const response = await fetch("/api/exercises/from-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error("Failed to create exercise from program");
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries to refresh the exercise list
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts", variables.workoutId, "exercises"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts", variables.workoutId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts"],
      });
    },
  });

  const swapExerciseMutation = useMutation({
    mutationFn: async (data: { originalExercise: any; reason?: string }) => {
      const response = await fetch("/api/exercises/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to swap exercise");
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({ title: "Exercise swapped successfully" });
    },
  });

  // Handler functions
  const handleAiEdit = () => {
    if (!editingExercise || !aiEditInstruction.trim()) return;
    
    aiEditMutation.mutate({
      exerciseId: editingExercise.id,
      instruction: aiEditInstruction.trim()
    });
  };

  // Only show loading screen on initial load for existing workout
  const isInitialLoading = workoutId && workoutLoading;

  if (isInitialLoading) {
    return <LoadingScreen message="Loading workout..." />;
  }

  // Handlers
  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workoutData = {
        name: workoutName || "Unnamed Workout",
        aiGenerateName: !isCustomName,
        date:
          workoutDate !== new Date().toISOString().split("T")[0]
            ? workoutDate
            : undefined,
      };

      const result = await createWorkoutMutation.mutateAsync(workoutData);
      setLocation(`/workout-journal/${result.id}`);
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  };

  const handleExactCompletion = async (programmedEx: any, index: number) => {
    try {
      // Create workout if it doesn't exist yet
      if (!workoutId) {
        const result = await createWorkoutMutation.mutateAsync({
          date: workoutDate,
          name: workoutName || (isCustomName ? "Untitled Workout" : ""),
          aiGenerateName: !isCustomName && !workoutName
        });
        await createExerciseFromProgramMutation.mutateAsync({
          workoutId: result.id,
          programmedExercise: programmedEx,
        });
        // Stay on the same page, just refetch data
        queryClient.invalidateQueries({ queryKey: ["/api/workouts", result.id] });
      } else {
        await createExerciseFromProgramMutation.mutateAsync({
          workoutId: workoutId,
          programmedExercise: programmedEx,
        });
      }
    } catch (error) {
      console.error("Failed to complete exercise:", error);
      toast({
        title: "Error",
        description: "Failed to complete exercise. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleModifiedCompletion = (programmedEx: any, index: number) => {
    setModifyingExercise({ exercise: programmedEx, index });
    setModifiedSets(programmedEx.sets);
    setModifiedReps(programmedEx.reps);
    setModifiedRpe(programmedEx.rpe);
  };

  const handleSwapExercise = async (programmedEx: any, index: number) => {
    try {
      const result = await swapExerciseMutation.mutateAsync({
        originalExercise: programmedEx,
        reason: "User requested swap",
      });

      // Update the swapped exercises map
      const newSwappedExercises = new Map(swappedExercises);
      newSwappedExercises.set(index, result.swappedExercise);
      setSwappedExercises(newSwappedExercises);
    } catch (error) {
      console.error("Failed to swap exercise:", error);
    }
  };

  const handleSkipExercise = (index: number) => {
    const newSkippedExercises = new Set(skippedExercises);
    if (skippedExercises.has(index)) {
      newSkippedExercises.delete(index);
    } else {
      newSkippedExercises.add(index);
    }
    setSkippedExercises(newSkippedExercises);
  };

  const handleSaveModifiedExercise = async () => {
    if (!modifyingExercise) return;
    
    const modifiedExercise = {
      ...modifyingExercise.exercise,
      sets: modifiedSets,
      reps: modifiedReps,
      rpe: modifiedRpe
    };

    // If workout doesn't exist yet, create it first
    if (!workoutId) {
      try {
        const result = await createWorkoutMutation.mutateAsync({
          date: workoutDate,
          name: workoutName || (isCustomName ? "Untitled Workout" : ""),
          aiGenerateName: !isCustomName && !workoutName
        });
        const newWorkoutId = result.id;
        
        // Complete exercise with modified values
        await createExerciseFromProgramMutation.mutateAsync({
          workoutId: newWorkoutId,
          programmedExercise: modifiedExercise
        });
        
        setCompletedExercises(prev => new Set(prev).add(modifyingExercise.index));
        setModifyingExercise(null);
        // Stay on the same page, just refetch data
        queryClient.invalidateQueries({ queryKey: ["/api/workouts", newWorkoutId] });
      } catch (error) {
        console.error('Error creating workout/exercise:', error);
        toast({
          title: "Error",
          description: "Failed to create workout. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Complete exercise with modified values in existing workout
      try {
        await createExerciseFromProgramMutation.mutateAsync({
          workoutId: workoutId,
          programmedExercise: modifiedExercise
        });
        setCompletedExercises(prev => new Set(prev).add(modifyingExercise.index));
        setModifyingExercise(null);
        
        // Auto-advance to next exercise
        if (modifyingExercise.index < (exercises?.length || todaysWorkout?.workout?.exercises?.length || 0) - 1) {
          setTimeout(() => setCurrentExerciseIndex(prev => prev + 1), 300);
        }
      } catch (error) {
        console.error('Error completing exercise:', error);
        toast({
          title: "Error",
          description: "Failed to complete exercise. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;

    try {
      await updateExerciseMutation.mutateAsync({
        id: editingExercise.id,
        name: editExerciseName,
        notes: editExerciseNotes,
      });
    } catch (error) {
      console.error("Failed to update exercise:", error);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditExerciseName(exercise.name);
    setEditExerciseNotes(exercise.notes || "");
  };

  const handleDeleteExercise = async () => {
    if (deleteExerciseId) {
      await deleteExerciseMutation.mutateAsync(deleteExerciseId);
      setDeleteExerciseId(null);
    }
  };

  // Journal logic (simplified for this clean version)
  const handleSendThoughts = async () => {
    if (!currentInput.trim()) return;

    setIsSending(true);
    setSendProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setSendProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await fetch(`/api/workouts/${workoutId}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentInput }),
      });

      clearInterval(progressInterval);
      setSendProgress(100);

      setTimeout(() => {
        setCurrentInput("");
        setIsSending(false);
        setSendProgress(0);
        queryClient.invalidateQueries({
          queryKey: ["/api/workouts", workoutId, "exercises"],
        });
      }, 500);
    } catch (error) {
      console.error("Failed to send thoughts:", error);
      setIsSending(false);
      setSendProgress(0);
    }
  };

  // Loading states
  if (workoutId && !workout) {
    return <div>Loading workout...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft style={{ width: "1rem", height: "1rem" }} />
              </Button>
            </Link>
            <h1 className={styles.title}>
              {workoutId ? workout?.name || "Workout" : "New Workout"}
            </h1>
          </div>
          {workoutId && totalVolume > 0 && (
            <div className={styles.volumeIndicator}>
              <Gem style={{ width: "1rem", height: "1rem" }} />
              <span className={styles.volumeText}>
                {Math.round(totalVolume / 1000)}k kg
              </span>
            </div>
          )}
        </div>
      </header>
      {/* Content */}
      <main className={styles.main}>
        {/* Show programmed exercises if available - regardless of workoutId */}
        {todaysWorkout?.workout?.exercises && todaysWorkout.workout.exercises.length > 0 ? (
          <section className={styles.section}>
                {/* Progress Indicator */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h2 className={styles.sectionTitle}>Today's Workout</h2>
                    <span className={styles.progressText}>
                      {completedExercises.size} / {todaysWorkout.workout.exercises.length} complete
                    </span>
                  </div>
                  <Progress 
                    value={(completedExercises.size / todaysWorkout.workout.exercises.length) * 100} 
                    style={{ height: "8px" }}
                  />
                </div>

                {/* All Exercises List - Swipeable Cards */}
                <div className={styles.exerciseList}>
                  {todaysWorkout.workout.exercises.map((programmedEx: any, index: number) => {
                    const currentExercise = swappedExercises.get(index) || programmedEx;
                    const isSkipped = skippedExercises.has(index);
                    const isCompleted = completedExercises.has(index);

                    return (
                      <motion.div
                        key={index}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={async (e, { offset }) => {
                          // Small delay to prevent tap triggering
                          setTimeout(() => setIsDragging(false), 100);
                          
                          if (isCompleted) return; // Can't swipe completed exercises
                          
                          const swipeThreshold = 100;
                          if (offset.x > swipeThreshold) {
                            // Swipe right - complete as prescribed
                            setCompletedExercises(prev => new Set(prev).add(index));
                            await handleExactCompletion(currentExercise, index);
                          } else if (offset.x < -swipeThreshold) {
                            // Swipe left - skip
                            handleSkipExercise(index);
                          }
                        }}
                        style={{
                          cursor: isCompleted ? "default" : "grab",
                          touchAction: "none",
                          marginBottom: "1rem"
                        }}
                        whileTap={{ cursor: isCompleted ? "default" : "grabbing" }}
                        data-testid={`exercise-card-${index}`}
                      >
                        <div
                          className={`${styles.swipeableExerciseCard} ${isSkipped ? styles.exerciseCardSkipped : ""} ${isCompleted ? styles.exerciseCardCompleted : ""}`}
                          onClick={() => {
                            if (!isDragging && !isSkipped && !isCompleted) {
                              handleModifiedCompletion(currentExercise, index);
                            }
                          }}
                        >
                          {/* Exercise Number Badge */}
                          <div className={styles.exerciseNumber}>
                            {isCompleted ? (
                              <CheckCircle style={{ width: "1.25rem", height: "1.25rem", color: "var(--success-600)" }} />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          {/* Swipe Hints - Show only on first incomplete exercise */}
                          {showGestureHints && !isCompleted && !isSkipped && completedExercises.size === 0 && index === 0 && (
                            <div className={styles.swipeHints}>
                              <span className={styles.swipeHintLeft}>← Skip</span>
                              <span className={styles.swipeHintRight}>Complete ✓ →</span>
                            </div>
                          )}

                          <div className={styles.exerciseCardContent}>
                            <h3 className={`${styles.exerciseName} ${isSkipped ? styles.skippedText : ""} ${isCompleted ? styles.completedText : ""}`}>
                              {currentExercise.name}
                            </h3>
                            <div className={styles.exerciseDetails}>
                              <span className={isSkipped ? styles.skippedText : ""}>
                                {currentExercise.sets} sets × {currentExercise.reps} reps
                              </span>
                            </div>
                            {currentExercise.muscleGroups && currentExercise.muscleGroups.length > 0 && (
                              <div className={styles.muscleGroupsRow}>
                                {currentExercise.muscleGroups.map((muscle: string, idx: number) => (
                                  <Badge key={idx} variant="secondary">{muscle}</Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Status indicator */}
                          {isSkipped && (
                            <div className={styles.statusBadge}>
                              <span>Skipped</span>
                            </div>
                          )}
                          {isCompleted && !isSkipped && (
                            <div className={styles.statusBadgeCompleted}>
                              <span>✓</span>
                            </div>
                          )}

                          {/* Tap to edit hint */}
                          {!isCompleted && !isSkipped && (
                            <div className={styles.tapHint}>
                              👆 Tap to adjust
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Complete Workout Button */}
                {completedExercises.size > 0 && (
                  <div style={{ marginTop: "2rem", paddingBottom: "2rem" }}>
                    <Button
                      onClick={() => setShowCompleteDialog(true)}
                      style={{ width: "100%" }}
                      data-testid="button-complete-workout"
                    >
                      <Trophy style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.5rem" }} />
                      Complete Workout
                    </Button>
                  </div>
                )}
              </section>
            ) : !workoutId ? (
              // Create Workout Form (when no programmed exercises and no workout yet)
              <section className={styles.createWorkoutForm}>
                <form onSubmit={handleCreateWorkout}>
                  <div className={styles.formGroup}>
                    <label htmlFor="workoutDate" className={styles.formLabel}>
                      Workout Date
                    </label>
                    <Input
                      id="workoutDate"
                      type="date"
                      value={workoutDate}
                      onChange={(e) => setWorkoutDate(e.target.value)}
                      disabled={!isEditing}
                    />
                    <div className={styles.dateHelper}>
                      {workoutDate === new Date().toISOString().split("T")[0]
                        ? "Today's workout"
                        : "Backfilling workout"}
                    </div>
                  </div>

                  <div className={styles.checkboxGroup}>
                    <Checkbox
                      id="customNameCheckbox"
                      checked={isCustomName}
                      onChange={(e) => setIsCustomName(e.target.checked)}
                    />
                    <div>
                      <label
                        htmlFor="customNameCheckbox"
                        className={styles.checkboxLabel}
                      >
                        Custom name
                      </label>
                      <div className={styles.checkboxDescription}>
                        Name this workout yourself
                      </div>
                    </div>
                  </div>

                  {isCustomName && (
                    <div
                      className={styles.formGroup}
                      style={{ marginTop: "1.5rem" }}
                    >
                      <label htmlFor="workoutName" className={styles.formLabel}>
                        Workout Name
                      </label>
                      <Input
                        id="workoutName"
                        type="text"
                        placeholder="e.g., Push Day - Chest & Shoulders"
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    style={{ width: "100%" }}
                    disabled={
                      createWorkoutMutation.isPending ||
                      (!workoutName && isCustomName)
                    }
                  >
                    {createWorkoutMutation.isPending
                      ? "Creating..."
                      : "Start Workout"}
                  </Button>
                </form>
              </section>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>Workout completed</p>
              </div>
            )}
      </main>
      {/* Complete Workout Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Workout</DialogTitle>
            <p>
              Are you ready to finish this workout? AI will analyze your session
              and provide insights.
            </p>
          </DialogHeader>

          <div className={styles.dialogSummary}>
            <div className={styles.dialogSummaryItem}>
              <Target className="h-5 w-5" style={{ color: "#10b981" }} />
              <span className={styles.dialogSummaryText}>
                {exercises.length} exercises logged
              </span>
            </div>
            <div className={styles.dialogSummaryItem}>
              <Clock className="h-5 w-5" style={{ color: "#3b82f6" }} />
              <span className={styles.dialogTimeText}>
                Started{" "}
                {workout?.createdAt
                  ? new Date(workout.createdAt).toLocaleTimeString()
                  : "today"}
              </span>
            </div>
          </div>

          <div className={styles.dialogButtonRow}>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
              style={{ flex: 1 }}
            >
              Keep Going
            </Button>
            <Button
              onClick={() => completeWorkoutMutation.mutate()}
              disabled={completeWorkoutMutation.isPending}
              variant="primary"
              style={{ flex: 1 }}
            >
              {completeWorkoutMutation.isPending ? (
                <>
                  <div className={styles.dialogLoadingSpinner} />
                  Completing...
                </>
              ) : (
                "Complete Workout"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Exercise Edit Dialog */}
      <Dialog
        open={!!editingExercise}
        onOpenChange={() => {
          setEditingExercise(null);
          setAiEditInstruction("");
        }}
      >
        <DialogContent style={{ maxWidth: "42rem", maxHeight: "80vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>

          <div style={{ background: "red", color: "white", padding: "10px", margin: "10px 0" }}>
            DEBUG: Modal is rendering - Exercise: {editingExercise?.name}
          </div>

          {editingExercise && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* AI Editing Section */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Sparkles style={{ width: "1rem", height: "1rem", color: "#3b82f6" }} />
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>Quick Edit with Natural Language</h3>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem", margin: 0 }}>
                  Tell me what to change in plain English. Examples: "change weight to 135", "make it 3 sets", "RPE was actually 8"
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <Textarea
                    placeholder="What would you like to change? (e.g., 'change weight to 135 pounds', 'make it 3 sets instead of 4')"
                    value={aiEditInstruction}
                    onChange={(e) => setAiEditInstruction(e.target.value)}
                    rows={2}
                    style={{ resize: "none" }}
                  />
                  <Button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={!aiEditInstruction.trim() || aiEditMutation.isPending}
                    style={{ width: "100%" }}
                  >
                    {aiEditMutation.isPending ? (
                      <>
                        <div style={{ 
                          width: "1rem", 
                          height: "1rem", 
                          border: "2px solid white", 
                          borderTop: "2px solid transparent", 
                          borderRadius: "50%", 
                          animation: "spin 1s linear infinite",
                          marginRight: "0.5rem" 
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                        Update Exercise
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ position: "relative", padding: "1rem 0" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                  <span style={{ width: "100%", borderTop: "1px solid #d1d5db" }} />
                </div>
                <div style={{ position: "relative", display: "flex", justifyContent: "center", fontSize: "0.875rem" }}>
                  <span style={{ background: "white", padding: "0 0.5rem", color: "#6b7280" }}>or edit manually</span>
                </div>
              </div>

              {/* Manual Editing Section */}
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.75rem", marginTop: 0 }}>Manual Edit</h3>
                <form onSubmit={handleUpdateExercise}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="exerciseName"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Exercise Name
                    </label>
                    <Input
                      id="exerciseName"
                      type="text"
                      value={editExerciseName}
                      onChange={(e) => setEditExerciseName(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="exerciseNotes"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Notes
                    </label>
                    <Textarea
                      id="exerciseNotes"
                      value={editExerciseNotes}
                      onChange={(e) => setEditExerciseNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingExercise(null);
                        setAiEditInstruction("");
                      }}
                      style={{ flex: "1" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      disabled={updateExerciseMutation.isPending}
                    >
                      {updateExerciseMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Exercise Modification Bottom Sheet */}
      <Dialog
        open={!!modifyingExercise}
        onOpenChange={() => setModifyingExercise(null)}
      >
        <DialogContent style={{ maxWidth: "500px" }}>
          <DialogHeader>
            <DialogTitle>Adjust Exercise</DialogTitle>
            <DialogDescription>
              Modify the sets, reps, or RPE for this exercise
            </DialogDescription>
          </DialogHeader>

          {modifyingExercise && (
            <div style={{ padding: "1rem 0" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem", textAlign: "center" }}>
                {modifyingExercise.exercise.name}
              </h3>

              {/* Sets Control */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.75rem", textAlign: "center" }}>
                  Sets
                </label>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModifiedSets(Math.max(1, modifiedSets - 1))}
                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                  >
                    −
                  </Button>
                  <span style={{ fontSize: "2rem", fontWeight: "700", minWidth: "60px", textAlign: "center" }}>
                    {modifiedSets}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModifiedSets(modifiedSets + 1)}
                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Reps Control */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.75rem", textAlign: "center" }}>
                  Reps
                </label>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModifiedReps(Math.max(1, modifiedReps - 1))}
                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                  >
                    −
                  </Button>
                  <span style={{ fontSize: "2rem", fontWeight: "700", minWidth: "60px", textAlign: "center" }}>
                    {modifiedReps}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModifiedReps(modifiedReps + 1)}
                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* RPE Control */}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.75rem", textAlign: "center" }}>
                  RPE
                </label>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModifiedRpe(Math.max(1, modifiedRpe - 1))}
                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                  >
                    −
                  </Button>
                  <span style={{ fontSize: "2rem", fontWeight: "700", minWidth: "60px", textAlign: "center", color: "var(--primary-600)" }}>
                    {modifiedRpe}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModifiedRpe(Math.min(10, modifiedRpe + 1))}
                    style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModifyingExercise(null)}
                  style={{ flex: 1, height: "50px", fontSize: "1rem" }}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveModifiedExercise}
                  style={{ flex: 1, height: "50px", fontSize: "1rem", background: "var(--success-500)", color: "white" }}
                >
                  Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Achievement Modal */}
      {currentAchievement && (
        <AchievementModal
          isOpen={showAchievement}
          onClose={() => setShowAchievement(false)}
          achievement={{
            type: currentAchievement.type,
            title: currentAchievement.title,
            description: currentAchievement.description || "Great achievement!",
            data: currentAchievement.data,
          }}
        />
      )}
      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteExerciseId}
        onOpenChange={() => setDeleteExerciseId(null)}
      >
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exercise? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteExerciseId(null)}
              style={{ flex: "1" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteExercise}
              disabled={deleteExerciseMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteExerciseMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>



      {!workoutId && <BottomNavigation />}
    </div>
  );
}
