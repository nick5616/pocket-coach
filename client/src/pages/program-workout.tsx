import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Progress } from "@/components/Progress";
import { ExerciseMuscleGroups } from "@/components/exercise-muscle-groups";
import LoadingScreen from "@/components/loading-screen";
// Removed useAuth import - authentication handled in main App
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  ChevronLeft,
  Target,
  TrendingUp,
  Zap,
  Heart,
  Trophy,
  Star,
} from "lucide-react";
import type { Program, Workout, Exercise } from "../../../shared/schema";
import styles from "./program-workout.module.css";

export default function ProgramWorkout() {
  const { programId } = useParams();
  const [, setLocation] = useLocation();
  // const { user } = useAuth(); // Removed - auth handled in main App
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const { data: program, isLoading: programLoading } = useQuery<Program>({
    queryKey: ["/api/programs", programId],
    queryFn: () =>
      fetch(`/api/programs/${programId}`, { credentials: "include" }).then(
        (res) => res.json(),
      ),
    enabled: !!programId,
  });

  const { data: todaysWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ["/api/programs", programId, "today"],
    queryFn: () =>
      fetch(`/api/programs/${programId}/today`, {
        credentials: "include",
      }).then((res) => res.json()),
    enabled: !!programId,
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(workoutData),
      });
      if (!response.ok) throw new Error("Failed to create workout");
      return response.json();
    },
    onSuccess: (workout: Workout) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      setLocation(`/workout-journal/${workout.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartWorkout = () => {
    if (!program || !todaysWorkout) return;

    createWorkoutMutation.mutate({
      name: (todaysWorkout as any).workout?.name || "Today's Workout",
      programId: program.id,
      exercises: (todaysWorkout as any).exercises || [],
    });
  };

  // Show loading screen if any essential data is still loading
  const isLoading = programLoading || workoutLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading workout details..." />;
  }

  if (!program || !todaysWorkout) {
    return <LoadingScreen message="Preparing program workout..." />;
  }

  const workout = (todaysWorkout as any).workout || {};
  const exercises = (todaysWorkout as any).exercises || [];
  const insights = (todaysWorkout as any).insights || {};

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      {/* Header */}
      <header className={`${styles.header} ${isDark ? styles.dark : ""}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft style={{ width: "1.25rem", height: "1.25rem" }} />
            </Button>
            <div>
              <h1
                className={`${styles.programTitle} ${isDark ? styles.dark : ""}`}
              >
                {program.name}
              </h1>
              <p
                className={`${styles.sessionSubtitle} ${isDark ? styles.dark : ""}`}
              >
                Today's Session
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className={styles.content}>
        {/* Workout Header */}
        <section className={styles.workoutHeader}>
          <div className={styles.workoutHeaderContent}>
            <h2 className={styles.workoutTitle}>
              {workout.name || "Today's Workout"}
            </h2>
            <p className={styles.workoutDescription}>
              {insights.description ||
                "Time to push your limits and make progress"}
            </p>

            {/* Difficulty & Stats */}
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{exercises.length}</div>
                <div className={styles.statLabel}>Exercises</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>
                  {insights.estimatedTime || "45"}
                </div>
                <div className={styles.statLabel}>Minutes</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.difficultyStars}>
                  {[...Array(insights.difficulty || 3)].map((_, i) => (
                    <Star key={i} className={styles.starFilled} />
                  ))}
                  {[...Array(5 - (insights.difficulty || 3))].map((_, i) => (
                    <Star key={i} className={styles.starEmpty} />
                  ))}
                </div>
                <div className={styles.statLabel}>Difficulty</div>
              </div>
            </div>
          </div>
        </section>

        {/* Coaching Insights */}
        <section className={styles.coachingSection}>
          <div className={styles.coachingCards}>
            {/* Focus Areas */}
            {insights.focusAreas && insights.focusAreas.length > 0 && (
              <div
                className={`${styles.coachingCard} ${isDark ? styles.dark : ""}`}
              >
                <div className={styles.cardHeader}>
                  <h3
                    className={`${styles.cardTitle} ${styles.cardTitleFocus}`}
                  >
                    <Target className={styles.cardIcon} />
                    Today's Focus
                  </h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.focusAreas}>
                    {insights.focusAreas.map((area: string, index: number) => (
                      <div key={index} className={styles.focusItem}>
                        <div className={styles.focusBullet}></div>
                        <span
                          className={`${styles.focusText} ${isDark ? styles.dark : ""}`}
                        >
                          {area}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Challenges & PR Opportunities */}
            {insights.challenges && (
              <div
                className={`${styles.coachingCard} ${isDark ? styles.dark : ""}`}
              >
                <div className={styles.cardHeader}>
                  <h3
                    className={`${styles.cardTitle} ${styles.cardTitleChallenge}`}
                  >
                    <Zap className={styles.cardIcon} />
                    Expect Challenge
                  </h3>
                </div>
                <div className={styles.cardContent}>
                  <p
                    className={`${styles.challengeText} ${isDark ? styles.dark : ""}`}
                  >
                    {insights.challenges}
                  </p>
                  {insights.prOpportunities && (
                    <div className={styles.prOpportunity}>
                      <div className={styles.prHeader}>
                        <Trophy className={styles.prIcon} />
                        <span className={styles.prTitle}>PR Opportunity</span>
                      </div>
                      <p className={styles.prText}>
                        {insights.prOpportunities}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Encouragement */}
            {insights.encouragement && (
              <div
                className={`${styles.coachingCard} ${isDark ? styles.dark : ""}`}
              >
                <div className={styles.cardHeader}>
                  <h3
                    className={`${styles.cardTitle} ${styles.cardTitleEncouragement}`}
                  >
                    <Heart className={styles.cardIcon} />
                    You've Got This
                  </h3>
                </div>
                <div className={styles.cardContent}>
                  <p
                    className={`${styles.encouragementText} ${isDark ? styles.dark : ""}`}
                  >
                    {insights.encouragement}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Exercise Preview */}
        <section className={styles.exercisesSection}>
          <h3
            className={`${styles.exercisesTitle} ${isDark ? styles.dark : ""}`}
          >
            Today's Exercises
          </h3>
          <div className={styles.exercisesList}>
            {exercises.map((exercise: any, index: number) => (
              <div
                key={index}
                className={`${styles.exerciseCard} ${isDark ? styles.dark : ""}`}
              >
                <div className={styles.exerciseCardContent}>
                  <div className={styles.exerciseHeader}>
                    <h4
                      className={`${styles.exerciseName} ${isDark ? styles.dark : ""}`}
                    >
                      {exercise.name}
                    </h4>
                  </div>
                  <div
                    className={`${styles.exerciseStats} ${isDark ? styles.dark : ""}`}
                  >
                    <span>{exercise.sets} sets</span>
                    <span>×</span>
                    <span>{exercise.reps} reps</span>
                    {exercise.weight && (
                      <>
                        <span>@</span>
                        <span>{exercise.weight}lbs</span>
                      </>
                    )}
                    {exercise.rpe && (
                      <>
                        <span>RPE</span>
                        <span>{exercise.rpe}</span>
                      </>
                    )}
                  </div>
                  {exercise.notes && (
                    <p
                      className={`${styles.exerciseNotes} ${isDark ? styles.dark : ""}`}
                    >
                      {exercise.notes}
                    </p>
                  )}
                  <ExerciseMuscleGroups exerciseName={exercise.name} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Start Workout Button */}
      <div className={`${styles.startButton} ${isDark ? styles.dark : ""}`}>
        <button
          onClick={handleStartWorkout}
          disabled={createWorkoutMutation.isPending}
          className={styles.startButtonInner}
        >
          <div className={styles.startButtonContent}>
            <Play className={styles.startIcon} />
            <span className={styles.startButtonText}>
              {createWorkoutMutation.isPending
                ? "Starting..."
                : "Start Workout"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
