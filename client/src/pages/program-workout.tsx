import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Progress } from "@/components/Progress";
import { ExerciseMuscleGroups } from "@/components/exercise-muscle-groups";
import LoadingScreen from "@/components/loading-screen";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: program, isLoading: programLoading } = useQuery<Program>({
    queryKey: ["/api/programs", programId],
    queryFn: () =>
      fetch(`/api/programs/${programId}`, { credentials: "include" }).then((res) => res.json()),
    enabled: !!programId,
  });

  const { data: todaysWorkout, isLoading: workoutLoading } = useQuery({
    queryKey: ["/api/programs", programId, "today"],
    queryFn: () =>
      fetch(`/api/programs/${programId}/today`, { credentials: "include" }).then((res) => res.json()),
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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            </Button>
            <div>
              <h1 className={styles.programTitle}>{program.name}</h1>
              <p className={styles.sessionSubtitle}>Today's Session</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className={styles.content}>
        {/* Workout Header */}
        <section className={styles.workoutHeader}>
          <div className={styles.workoutHeaderContent}>
            <h2 className={styles.workoutTitle}>{workout.name || "Today's Workout"}</h2>
            <p className={styles.workoutDescription}>
              {insights.description || "Time to push your limits and make progress"}
            </p>
            
            {/* Difficulty & Stats */}
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{exercises.length}</div>
                <div className={styles.statLabel}>Exercises</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{insights.estimatedTime || "45"}</div>
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
              <div className={styles.coachingCard}>
                <div className={styles.cardHeader}>
                  <h3 className={`${styles.cardTitle} ${styles.cardTitleFocus}`}>
                    <Target className={styles.cardIcon} />
                    Today's Focus
                  </h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.focusAreas}>
                    {insights.focusAreas.map((area: string, index: number) => (
                      <div key={index} className={styles.focusItem}>
                        <div className={styles.focusBullet}></div>
                        <span className={styles.focusText}>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Challenges & PR Opportunities */}
            {insights.challenges && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <Zap className="h-5 w-5 mr-2" />
                    Expect Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{insights.challenges}</p>
                  {insights.prOpportunities && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <Trophy className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="font-semibold text-orange-800">PR Opportunity</span>
                      </div>
                      <p className="text-orange-700 text-sm">{insights.prOpportunities}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Encouragement */}
            {insights.encouragement && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Heart className="h-5 w-5 mr-2" />
                    You've Got This
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{insights.encouragement}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Exercise Preview */}
        <section className="px-4 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Exercises</h3>
          <div className="space-y-3">
            {exercises.map((exercise: any, index: number) => (
              <Card key={index} className="border-l-4 border-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                    <ExerciseMuscleGroups exerciseName={exercise.name} />
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                    <p className="text-sm text-gray-600 mt-2 italic">"{exercise.notes}"</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Start Workout Button */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
        <Button
          onClick={handleStartWorkout}
          disabled={createWorkoutMutation.isPending}
          size="lg"
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <Play className="h-6 w-6" />
            <span className="text-lg font-semibold">
              {createWorkoutMutation.isPending ? "Starting..." : "Start Workout"}
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}