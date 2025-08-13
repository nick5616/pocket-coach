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
      setLocation("/");
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
      
      // Refresh exercise data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/exercises", { workoutId: parseInt(workoutId || "0") }] 
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/workouts", workoutId, "exercises"],
      });
      toast({ title: "Exercise completed successfully" });
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
      await createExerciseFromProgramMutation.mutateAsync({
        workoutId: workoutId!,
        programmedExercise: programmedEx,
      });
    } catch (error) {
      console.error("Failed to complete exercise:", error);
    }
  };

  const handleModifiedCompletion = (programmedEx: any, index: number) => {
    const exerciseText = `${programmedEx.name} - ${programmedEx.sets} sets × ${programmedEx.reps} reps @ RPE `;
    setCurrentInput(exerciseText);
    inputRef.current?.focus();
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
        {!workoutId ? (
          // Create Workout Form
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
          // Workout Journal
          <div>
            {/* Programmed Exercises */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Programmed Exercises</h2>
              {todaysWorkoutLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingText}>Loading today's workout...</div>
                </div>
              ) : activeProgramLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingText}>Loading your program...</div>
                </div>
              ) : todaysWorkout?.workout?.exercises &&
              todaysWorkout.workout.exercises.length > 0 ? (
                <div className={styles.programmedExercises}>
                  {todaysWorkout.workout.exercises.map(
                    (programmedEx: any, index: number) => {
                      const currentExercise =
                        swappedExercises.get(index) || programmedEx;
                      const isSkipped = skippedExercises.has(index);

                      return (
                        <div
                          key={index}
                          className={
                            isSkipped
                              ? `${styles.programmedExerciseCard} ${styles.exerciseCardSkipped}`
                              : styles.programmedExerciseCard
                          }
                        >
                          <div className={styles.exerciseHeader}>
                            <h3
                              className={
                                isSkipped
                                  ? `${styles.exerciseName} ${styles.exerciseNameSkipped}`
                                  : styles.exerciseName
                              }
                            >
                              {currentExercise.name}
                            </h3>
                            <div
                              className={
                                isSkipped
                                  ? `${styles.exerciseStats} ${styles.exerciseStatsSkipped}`
                                  : styles.exerciseStats
                              }
                            >
                              <span>
                                {currentExercise.sets} sets ×{" "}
                                {currentExercise.reps} reps
                              </span>
                              <span className={styles.exerciseRpe}>
                                RPE {currentExercise.rpe}
                              </span>
                            </div>
                            {currentExercise.muscleGroups &&
                              currentExercise.muscleGroups.length > 0 && (
                                <div className={styles.muscleGroupsContainer}>
                                  {currentExercise.muscleGroups.map(
                                    (muscle: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {muscle}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>

                          <div className={styles.actionButtons}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSkipped}
                              onClick={() =>
                                handleExactCompletion(currentExercise, index)
                              }
                            >
                              As Prescribed
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSkipped}
                              onClick={() =>
                                handleModifiedCompletion(currentExercise, index)
                              }
                            >
                              📝 With Changes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSkipped}
                              onClick={() =>
                                handleSwapExercise(currentExercise, index)
                              }
                            >
                              🔄 Swap Exercise
                            </Button>
                            <Button
                              variant={isSkipped ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleSkipExercise(index)}
                            >
                              {isSkipped ? "↩️ Unskip" : "⏭️ Skip Today"}
                            </Button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className={styles.programmedExercises}>
                  {(todaysWorkout?.exercises || []).map(
                    (programmedEx: any, index: number) => {
                      const currentExercise =
                        swappedExercises.get(index) || programmedEx;
                      const isSkipped = skippedExercises.has(index);

                      return (
                        <div
                          key={index}
                          className={
                            isSkipped
                              ? `${styles.programmedExerciseCard} ${styles.exerciseCardSkipped}`
                              : styles.programmedExerciseCard
                          }
                        >
                          <div className={styles.exerciseHeader}>
                            <h3
                              className={
                                isSkipped
                                  ? `${styles.exerciseName} ${styles.exerciseNameSkipped}`
                                  : styles.exerciseName
                              }
                            >
                              {currentExercise.name}
                            </h3>
                            <div className={styles.exerciseStatsContainer}>
                              <span
                                className={
                                  isSkipped
                                    ? styles.exerciseStatsTextSkipped
                                    : styles.exerciseStatsText
                                }
                              >
                                {currentExercise.sets} sets ×{" "}
                                {currentExercise.reps} reps
                              </span>
                              <span
                                className={
                                  isSkipped
                                    ? styles.exerciseRpeTextSkipped
                                    : styles.exerciseRpeText
                                }
                              >
                                RPE {currentExercise.rpe}
                              </span>
                            </div>
                            {currentExercise.muscleGroups &&
                              currentExercise.muscleGroups.length > 0 && (
                                <div className={styles.muscleGroupsContainer}>
                                  {currentExercise.muscleGroups.map(
                                    (muscle: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {muscle}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>

                          {/* 2x2 Action Buttons - Only show for active workouts */}
                          {!isWorkoutCompleted && (
                            <div className={styles.actionButtons}>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSkipped}
                                onClick={() =>
                                  handleExactCompletion(currentExercise, index)
                                }
                              >
                                As Prescribed
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSkipped}
                                onClick={() =>
                                  handleModifiedCompletion(
                                    currentExercise,
                                    index,
                                  )
                                }
                              >
                                📝 With Changes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSkipped}
                                onClick={() =>
                                  handleSwapExercise(currentExercise, index)
                                }
                              >
                                🔄 Swap Exercise
                              </Button>
                              <Button
                                variant={isSkipped ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleSkipExercise(index)}
                              >
                                {isSkipped ? "↩️ Unskip" : "⏭️ Skip Today"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>
            {/* Workout Input - Only show for active workouts */}
            {!isWorkoutCompleted && (
              <section className={styles.workoutInput}>
                <div className={styles.inputContainer}>
                  <Textarea
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="How's your workout going? Log exercises, sets, reps, or just your thoughts..."
                  />
                  <div className={styles.inputFooter}>
                    <div className={styles.inputStatus}>
                      <div className={styles.statusText}>
                        {saveStatus === "typing" && "Typing..."}
                        {saveStatus === "saved" && "✓ Saved!"}
                      </div>
                      <Button
                        onClick={handleSendThoughts}
                        disabled={!currentInput.trim() || isSending}
                        size="sm"
                      >
                        <Send
                          style={{
                            width: "1rem",
                            height: "1rem",
                            marginRight: "0.5rem",
                          }}
                        />
                        Send to AI
                      </Button>
                    </div>
                    {isSending && sendProgress > 0 && (
                      <div className={styles.progressBar}>
                        <Progress value={sendProgress} />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            {/* Completed Exercises */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {isWorkoutCompleted ? "Workout Summary" : "Completed Exercises"}
                {isWorkoutCompleted && (
                  <span className={styles.completedBadge}>
                    <CheckCircle style={{ width: "1rem", height: "1rem" }} />
                    Completed
                  </span>
                )}
              </h2>
              {exercisesLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingText}>Loading exercises...</div>
                </div>
              ) : (
                <div className={styles.completedExercises}>
                  {groupExercisesByName(exercises).map(
                  (exerciseGroup, groupIndex) => {
                    const totalSets = exerciseGroup.exercises.length;
                    const totalVolume = exerciseGroup.exercises.reduce(
                      (sum, ex) =>
                        sum +
                        (ex.weight || 0) * (ex.sets || 1) * (ex.reps || 0),
                      0,
                    );
                    const rpeValues = exerciseGroup.exercises
                      .filter((ex) => ex.rpe);
                    const avgEffort = rpeValues.length > 0
                      ? rpeValues.reduce((sum, ex) => {
                          const rpe = ex.rpe || 0;
                          // Convert RPE to display format based on user preference
                          const displayValue = effortTrackingPreference === "rir" 
                            ? convertRpeToRir(rpe) 
                            : rpe;
                          return sum + displayValue;
                        }, 0) / rpeValues.length
                      : 0;

                    return (
                      <div
                        key={`${exerciseGroup.name}-${groupIndex}`}
                        className={styles.completedExerciseCard}
                      >
                        {editingGroupIndex === groupIndex ? (
                          <div className={styles.editModeContainer}>
                            <Input
                              value={editGroupName}
                              onChange={(e) => setEditGroupName(e.target.value)}
                              className={styles.editExerciseNameInput}
                              placeholder="Exercise name"
                            />
                          </div>
                        ) : (
                          <div className={styles.completedExerciseHeader}>
                            <div className={styles.completedExerciseInfo}>
                              <h3 className={styles.completedExerciseTitle}>
                                {exerciseGroup.name}
                              </h3>
                            </div>
                            <div className={styles.completedExerciseActions}>
                              {!isWorkoutCompleted && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingGroupIndex(groupIndex);
                                      setEditGroupName(exerciseGroup.name);
                                      setEditGroupNotes(
                                        exerciseGroup.notes || "",
                                      );
                                      // Initialize editing data for each set
                                      const initialSetData: Record<
                                        number,
                                        {
                                          reps?: number;
                                          weight?: number;
                                          effort?: number;
                                        }
                                      > = {};
                                      exerciseGroup.exercises.forEach(
                                        (exercise) => {
                                          // Convert RPE to display format based on user preference
                                          const effortValue = exercise.rpe
                                            ? effortTrackingPreference === "rir"
                                              ? convertRpeToRir(exercise.rpe)
                                              : exercise.rpe
                                            : undefined;
                                          
                                          initialSetData[exercise.id] = {
                                            reps: exercise.reps || undefined,
                                            weight: exercise.weight || undefined,
                                            effort: effortValue,
                                          };
                                        },
                                      );
                                      setEditingSetData(initialSetData);
                                    }}
                                  >
                                    <Edit
                                      style={{ width: "1rem", height: "1rem" }}
                                    />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteExerciseId(
                                        exerciseGroup.exercises[0].id,
                                      )
                                    }
                                  >
                                    <Trash2
                                      style={{ width: "1rem", height: "1rem" }}
                                    />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Muscle Groups */}
                        {exerciseGroup.muscleGroups.length > 0 && (
                          <div className={styles.completedMuscleGroups}>
                            {exerciseGroup.muscleGroups.map((muscle, index) => (
                              <Badge key={index} variant="secondary">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Sets Display */}
                        <div className={styles.exerciseSetsGrid}>
                          <div className={styles.setsHeader}>
                            <span className={styles.setHeaderItem}>Set</span>
                            <span className={styles.setHeaderItem}>Reps</span>
                            <span className={styles.setHeaderItem}>Weight</span>
                            {effortTrackingPreference !== "none" && (
                              <span className={styles.setHeaderItem}>{effortTrackingInfo.label}</span>
                            )}
                            {editingGroupIndex === groupIndex && (
                              <span className={styles.setHeaderItem}>
                                Action
                              </span>
                            )}
                          </div>
                          {exerciseGroup.exercises.map((exercise, setIndex) => (
                            <div
                              key={exercise.id}
                              className={`${styles.exerciseSetRow} ${editingGroupIndex === groupIndex ? styles.exerciseSetRowEditing : ""}`}
                            >
                              <span className={styles.setNumber}>
                                {setIndex + 1}
                              </span>
                              {editingGroupIndex === groupIndex ? (
                                <>
                                  <input
                                    type="number"
                                    value={
                                      editingSetData[exercise.id]?.reps || ""
                                    }
                                    onChange={(e) =>
                                      setEditingSetData((prev) => ({
                                        ...prev,
                                        [exercise.id]: {
                                          ...prev[exercise.id],
                                          reps: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                        },
                                      }))
                                    }
                                    className={styles.setInput}
                                    placeholder="Reps"
                                  />
                                  <input
                                    type="number"
                                    value={
                                      editingSetData[exercise.id]?.weight || ""
                                    }
                                    onChange={(e) =>
                                      setEditingSetData((prev) => ({
                                        ...prev,
                                        [exercise.id]: {
                                          ...prev[exercise.id],
                                          weight: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                        },
                                      }))
                                    }
                                    className={styles.setInput}
                                    placeholder="Weight"
                                  />
                                  {effortTrackingPreference !== "none" && (
                                    <input
                                      type="number"
                                      value={editingSetData[exercise.id]?.effort || ""}
                                      onChange={(e) =>
                                        setEditingSetData((prev) => ({
                                          ...prev,
                                          [exercise.id]: {
                                            ...prev[exercise.id],
                                            effort: e.target.value
                                              ? parseInt(e.target.value)
                                              : undefined,
                                          },
                                        }))
                                      }
                                      className={styles.setInput}
                                      placeholder={effortTrackingInfo.placeholder}
                                      min={effortTrackingInfo.min}
                                      max={effortTrackingInfo.max}
                                    />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteExerciseId(exercise.id)
                                    }
                                    className={styles.deleteSetButton}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span className={styles.setReps}>
                                    {exercise.reps}
                                  </span>
                                  <span className={styles.setWeight}>
                                    {exercise.weight
                                      ? `${exercise.weight} lbs`
                                      : "-"}
                                  </span>
                                  {effortTrackingPreference !== "none" && (
                                    <span className={styles.setRpe}>
                                      {exercise.rpe
                                        ? effortTrackingPreference === "rir"
                                          ? convertRpeToRir(exercise.rpe)
                                          : exercise.rpe
                                        : "-"}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Summary Stats */}
                        <div className={styles.completedExerciseStats}>
                          <div className={styles.completedStatsLeft}>
                            <span className={styles.completedStatsText}>
                              {totalSets} sets total
                            </span>
                          </div>
                          <div className={styles.completedStatsRight}>
                            {effortTrackingPreference !== "none" && avgEffort > 0 && (
                              <span className={styles.completedRpeText}>
                                Avg {effortTrackingInfo.label} {avgEffort.toFixed(1)}
                              </span>
                            )}
                            {totalVolume > 0 && (
                              <span className={styles.completedVolumeText}>
                                Vol: {totalVolume} lbs
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notes Section */}
                        {editingGroupIndex === groupIndex ? (
                          <div className={styles.exerciseNotesContainer}>
                            <div className={styles.exerciseNotesLabel}>
                              Notes:
                            </div>
                            <Textarea
                              value={editGroupNotes}
                              onChange={(e) =>
                                setEditGroupNotes(e.target.value)
                              }
                              placeholder="Add notes about this exercise..."
                              rows={2}
                            />
                          </div>
                        ) : exerciseGroup.notes ? (
                          <div className={styles.exerciseNotesContainer}>
                            <div className={styles.exerciseNotesLabel}>
                              Notes:
                            </div>
                            <p className={styles.exerciseNotesText}>
                              {exerciseGroup.notes}
                            </p>
                          </div>
                        ) : null}

                        {/* Edit Mode Buttons - Always at bottom when editing */}
                        {editingGroupIndex === groupIndex && (
                          <div className={styles.editModeButtons}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Update each exercise in the group
                                  for (const exercise of exerciseGroup.exercises) {
                                    const setData = editingSetData[exercise.id];
                                    if (setData) {
                                      // Convert effort value to RPE for database storage
                                      const rpeValue = setData.effort
                                        ? effortTrackingPreference === "rir"
                                          ? convertRirToRpe(setData.effort)
                                          : setData.effort
                                        : undefined;

                                      await apiRequest("PATCH", `/api/exercises/${exercise.id}`, {
                                        name: editGroupName,
                                        notes: editGroupNotes,
                                        reps: setData.reps,
                                        weight: setData.weight,
                                        rpe: rpeValue,
                                      });
                                    }
                                  }
                                  // Invalidate queries to refresh data
                                  await queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
                                  toast({ title: "Exercise updated successfully" });
                                  setEditingGroupIndex(null);
                                  setEditingSetData({});
                                } catch (error) {
                                  console.error("Failed to save exercise:", error);
                                  toast({ 
                                    title: "Failed to save exercise", 
                                    variant: "destructive" 
                                  });
                                }
                              }}
                              className={styles.editModeButton}
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingGroupIndex(null);
                                setEditingSetData({});
                              }}
                              className={styles.editModeButton}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
                </div>
              )}
            </section>
            {/* Complete Workout Button - Only show for active workouts */}
            {!isWorkoutCompleted && (
              <section className={styles.completeWorkoutSection}>
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  variant="primary"
                  style={{ width: "100%" }}
                >
                  <Trophy
                    style={{
                      width: "1rem",
                      height: "1rem",
                      marginRight: "0.5rem",
                    }}
                  />
                  Complete Workout
                </Button>
              </section>
            )}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>

          {editingExercise && (
            <div className="space-y-6">
              {/* AI Editing Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h3 className="text-lg font-semibold">Quick Edit with Natural Language</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Tell me what to change in plain English. Examples: "change weight to 135", "make it 3 sets", "RPE was actually 8"
                </p>
                <div className="space-y-3">
                  <Textarea
                    placeholder="What would you like to change? (e.g., 'change weight to 135 pounds', 'make it 3 sets instead of 4')"
                    value={aiEditInstruction}
                    onChange={(e) => setAiEditInstruction(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  <Button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={!aiEditInstruction.trim() || aiEditMutation.isPending}
                    className="w-full"
                  >
                    {aiEditMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Update Exercise
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or edit manually</span>
                </div>
              </div>

              {/* Manual Editing Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Manual Edit</h3>
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
