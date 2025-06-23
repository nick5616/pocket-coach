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
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import LoadingScreen from "@/components/loading-screen";

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
import { useToast } from "@/hooks/use-toast";
import { ExerciseMuscleGroups } from "@/components/exercise-muscle-groups";
import BottomNavigation from "@/components/bottom-navigation";
import AchievementModal from "@/components/achievement-modal";
import { type Workout, type Exercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import styles from "@/styles/workout-journal.module.css";

export default function WorkoutJournal() {
  const { id: workoutId } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const [aiGenerateName, setAiGenerateName] = useState(false);
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editExerciseNotes, setEditExerciseNotes] = useState("");

  const [skippedExercises, setSkippedExercises] = useState<Set<number>>(
    new Set(),
  );
  const [swappedExercises, setSwappedExercises] = useState<Map<number, any>>(
    new Map(),
  );
  const [deleteExerciseId, setDeleteExerciseId] = useState<number | null>(null);

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
      fetch("/api/programs/active", { credentials: "include" }).then((res) => res.json()),
    // Always fetch active program to get today's workout
  });

  const { data: todaysWorkout, isLoading: todaysWorkoutLoading } = useQuery({
    queryKey: ["/api/programs/active/today"],
    queryFn: async () => {
      console.log("Fetching today's workout from /api/programs/active/today");
      const response = await fetch("/api/programs/active/today", { credentials: "include" });
      const data = await response.json();
      console.log("Today's workout response:", data);
      return data;
    },
    enabled: !!activeProgram, // Fetch when active program exists
  });

  const totalVolume = calculateWorkoutVolume(exercises as Exercise[]);

  // Mutations - Must be declared before any conditional returns
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      aiGenerateName: boolean;
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

  // Show loading screen if any essential data is still loading
  const isLoading = workoutLoading || exercisesLoading || activeProgramLoading || todaysWorkoutLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading workout..." />;
  }

  // Handlers
  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workoutData = {
        name: workoutName || "Unnamed Workout",
        aiGenerateName: aiGenerateName,
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
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className={styles.title}>
              {workoutId ? workout?.name || "Workout" : "New Workout"}
            </h1>
          </div>
          {workoutId && totalVolume > 0 && (
            <div className={styles.volumeIndicator}>
              <Gem className="h-4 w-4" />
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
              <div className={styles.dateDisplay}>
                <div className={styles.dateLabel}>Today's workout</div>
                <div className={styles.dateValue}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className={styles.formGroup}>
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

              <div className={styles.checkboxGroup}>
                <Checkbox
                  id="aiGenerateName"
                  checked={aiGenerateName}
                  onChange={(e) => setAiGenerateName(e.target.checked)}
                />
                <div>
                  <label
                    htmlFor="aiGenerateName"
                    className={styles.checkboxLabel}
                  >
                    Have AI name it later
                  </label>
                  <div className={styles.checkboxDescription}>
                    AI will create a name based on your exercises
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                style={{ width: "100%" }}
                disabled={
                  createWorkoutMutation.isPending ||
                  (!workoutName && !aiGenerateName)
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
              {todaysWorkout?.workout?.exercises &&
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
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {muscle}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>

                          {/* 2x2 Action Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs ${isSkipped ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={isSkipped}
                              onClick={() =>
                                handleExactCompletion(currentExercise, index)
                              }
                            >
                              ✅ As Prescribed
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`text-xs ${isSkipped ? "opacity-50 cursor-not-allowed" : ""}`}
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
                              className={`text-xs ${isSkipped ? "opacity-50 cursor-not-allowed" : ""}`}
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
                              className="text-xs"
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
                  {(todaysWorkout?.exercises || []).map((programmedEx, index) => {
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
                        <div className="mb-3">
                          <h3
                            className={`font-semibold text-base mb-1 ${isSkipped ? "text-gray-500" : "text-blue-900"}`}
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
                              <div className="flex flex-wrap gap-1">
                                {currentExercise.muscleGroups.map(
                                  (muscle: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {muscle}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            )}
                        </div>

                        {/* 2x2 Action Buttons */}
                        <div className={styles.actionButtons}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={`text-xs ${isSkipped ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={isSkipped}
                            onClick={() =>
                              handleExactCompletion(currentExercise, index)
                            }
                          >
                            ✅ As Prescribed
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={`text-xs ${isSkipped ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={isSkipped}
                            onClick={() =>
                              handleModifiedCompletion(currentExercise, index)
                            }
                          >
                            📝 With Changes
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={`text-xs ${isSkipped ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={isSkipped}
                            onClick={() =>
                              handleSwapExercise(currentExercise, index)
                            }
                          >
                            🔄 Swap Exercise
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSkipExercise(index)}
                          >
                            {isSkipped ? "↩️ Unskip" : "⏭️ Skip Today"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            {/* Workout Input */}
            <section className="px-4 py-4">
              <div className="bg-white rounded-lg border border-gray-200">
                <Textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="How's your workout going? Log exercises, sets, reps, or just your thoughts..."
                  className="border-0 resize-none min-h-[120px]"
                />
                <div className="border-t border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {saveStatus === "typing" && "Typing..."}
                      {saveStatus === "saved" && "✓ Saved!"}
                    </div>
                    <Button
                      onClick={handleSendThoughts}
                      disabled={!currentInput.trim() || isSending}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to AI
                    </Button>
                  </div>
                  {isSending && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${sendProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
            {/* Completed Exercises */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Completed Exercises</h2>
              <div className="_completedExercises_eqdug_250 pl-[0px] pr-[0px] pt-[0px] pb-[0px]">
                {exercises.map((exercise: Exercise) => (
                  <div
                    key={exercise.id}
                    className={styles.completedExerciseCard}
                  >
                    <div className={styles.completedExerciseHeader}>
                      <div className={styles.completedExerciseInfo}>
                        <h3 className={styles.completedExerciseTitle}>
                          {exercise.name}
                        </h3>
                      </div>
                      <div className={styles.completedExerciseActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExercise(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteExerciseId(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Muscle Groups outside the header */}
                    {exercise.muscleGroups &&
                      exercise.muscleGroups.length > 0 && (
                        <div className={styles.completedMuscleGroups}>
                          {exercise.muscleGroups.map((muscle, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      )}

                    {/* Compact Exercise Stats */}
                    <div className={styles.completedExerciseStats}>
                      <div className={styles.completedStatsLeft}>
                        <span className={styles.completedStatsText}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </span>
                        {exercise.weight && (
                          <span className={styles.completedStatsText}>
                            {exercise.weight} lbs
                          </span>
                        )}
                      </div>
                      <div className={styles.completedStatsRight}>
                        {exercise.rpe && (
                          <span className={styles.completedRpeText}>
                            RPE {exercise.rpe}
                          </span>
                        )}
                        {exercise.weight && exercise.sets && (
                          <span className={styles.completedVolumeText}>
                            Vol:{" "}
                            {exercise.weight *
                              exercise.sets *
                              (exercise.reps || 10)}{" "}
                            lbs
                          </span>
                        )}
                      </div>
                    </div>

                    {exercise.notes && (
                      <div className={styles.exerciseNotesContainer}>
                        <div className={styles.exerciseNotesLabel}>Notes:</div>
                        <p className={styles.exerciseNotesText}>
                          {exercise.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            {/* Complete Workout Button */}
            <section className="px-4 pb-6">
              <Button
                onClick={() => setShowCompleteDialog(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Workout
              </Button>
            </section>
          </div>
        )}
      </main>
      {/* Complete Workout Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Workout</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600">
              Are you ready to finish this workout? AI will analyze your session
              and provide insights.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="h-5 w-5 text-green-500" />
                <span className="font-medium">
                  {exercises.length} exercises logged
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Started{" "}
                  {workout?.createdAt
                    ? new Date(workout.createdAt).toLocaleTimeString()
                    : "today"}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
                className="flex-1"
              >
                Keep Going
              </Button>
              <Button
                onClick={() => completeWorkoutMutation.mutate()}
                disabled={completeWorkoutMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {completeWorkoutMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2" />
                    Completing...
                  </>
                ) : (
                  "Complete Workout"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Exercise Edit Dialog */}
      <Dialog
        open={!!editingExercise}
        onOpenChange={() => setEditingExercise(null)}
      >
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>

          {editingExercise && (
            <form onSubmit={handleUpdateExercise} className="space-y-4">
              <div>
                <label
                  htmlFor="exerciseName"
                  className="block text-sm font-medium text-gray-700 mb-2"
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

              <div>
                <label
                  htmlFor="exerciseNotes"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  onClick={() => setEditingExercise(null)}
                  className="flex-1"
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
              className="flex-1"
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
