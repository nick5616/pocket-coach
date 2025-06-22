import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Progress } from "@/components/Progress";
import { ExerciseMuscleGroups } from "@/components/exercise-muscle-groups";
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
import type { Program, Workout, Exercise } from "../../shared/schema";

export default function ProgramWorkout() {
  const { programId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: program } = useQuery<Program>({
    queryKey: ["/api/programs", programId],
    enabled: !!programId,
  });

  const { data: todaysWorkout } = useQuery({
    queryKey: ["/api/programs", programId, "today"],
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
      name: todaysWorkout.workout.name,
      programId: program.id,
      exercises: todaysWorkout.exercises || [],
    });
  };

  if (!program || !todaysWorkout) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout details...</p>
        </div>
      </div>
    );
  }

  const workout = todaysWorkout.workout;
  const exercises = todaysWorkout.exercises || [];
  const insights = todaysWorkout.insights || {};

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{program.name}</h1>
              <p className="text-sm text-gray-600">Today's Session</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Workout Header */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{workout.name}</h2>
            <p className="text-blue-100 text-sm mb-4">
              {insights.description || "Time to push your limits and make progress"}
            </p>
            
            {/* Difficulty & Stats */}
            <div className="flex justify-center space-x-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{exercises.length}</div>
                <div className="text-xs text-blue-200">Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{insights.estimatedTime || "45"}</div>
                <div className="text-xs text-blue-200">Minutes</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {[...Array(insights.difficulty || 3)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-300" />
                  ))}
                  {[...Array(5 - (insights.difficulty || 3))].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-blue-300" />
                  ))}
                </div>
                <div className="text-xs text-blue-200">Difficulty</div>
              </div>
            </div>
          </div>
        </section>

        {/* Coaching Insights */}
        <section className="px-4 py-6">
          <div className="space-y-4">
            {/* Focus Areas */}
            {insights.focusAreas && insights.focusAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <Target className="h-5 w-5 mr-2" />
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.focusAreas.map((area: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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