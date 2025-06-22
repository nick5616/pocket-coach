import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Progress } from "@/components/Progress";
import BottomNavigation from "@/components/bottom-navigation";
import AchievementModal from "@/components/achievement-modal";
import WorkoutCard from "@/components/workout-card";
import {
  Bell,
  User as UserIcon,
  Play,
  PenTool,
  TrendingUp,
  Target,
  Lightbulb,
  Plus,
  ChartLine,
  Calendar,
  Flame,
} from "lucide-react";
import type { WorkoutStats, AIRecommendation } from "@/lib/types";
import type { User, Workout, Goal, Achievement } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import styles from "./home.module.css";

export default function Home() {
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);

  const { user: authUser, isAuthenticated } = useAuth();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", authUser?.id],
    queryFn: () => fetch(`/api/user/${authUser?.id}`).then((res) => res.json()),
    enabled: !!authUser?.id,
  });

  const { data: recentWorkouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
    enabled: isAuthenticated,
  });

  // Find ongoing workout (not completed)
  const ongoingWorkout = recentWorkouts.find((w) => !w.isCompleted && !w.completedAt);

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals", { userId }],
    queryFn: () =>
      fetch(`/api/goals?userId=${userId}`).then((res) => res.json()),
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements", { userId }],
    queryFn: () =>
      fetch(`/api/achievements?userId=${userId}`).then((res) => res.json()),
  });

  // Check for new achievements
  useEffect(() => {
    const unviewedAchievement = achievements.find(
      (achievement) => !achievement.isViewed,
    );
    if (unviewedAchievement) {
      setCurrentAchievement(unviewedAchievement);
      setShowAchievement(true);
    }
  }, [achievements]);

  const todayStats: WorkoutStats = {
    workouts: recentWorkouts.filter((w) => {
      const today = new Date();
      const workoutDate = new Date(w.createdAt!);
      return workoutDate.toDateString() === today.toDateString();
    }).length,
    exercises: 0, // Would be calculated from today's workouts
    timeMinutes: 0, // Would be calculated from today's workouts
  };

  const aiRecommendation: AIRecommendation = {
    message:
      "Based on your last push session, let's focus on shoulders today. Your lateral raises showed great progress - time to challenge those delts!",
    focusAreas: ["shoulders", "delts"],
  };

  const greeting = () => {
    const hour = new Date().getHours();
    const name = user?.username || "User";

    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-duolingo-green rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43L22 13.43l-1.43-1.57z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pocket Coach</h1>
              <p className="text-xs text-gray-600">
                {user?.currentStreak || 0} day streak
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <Bell className="h-5 w-5" />
                {achievements.filter((a) => !a.isViewed).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-energetic-orange text-white text-xs rounded-full flex items-center justify-center">
                    {achievements.filter((a) => !a.isViewed).length}
                  </span>
                )}
              </Button>
            </div>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <UserIcon className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        {/* Welcome Section */}
        <section
          className="px-4 py-6"
          style={{
            background: "linear-gradient(135deg, #65a30d 0%, #16a34a 100%)",
            color: "white",
          }}
        >
          <div className="mb-4">
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: "#ffffff", fontWeight: "bold" }}
            >
              {greeting()}
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "#ffffff", opacity: 0.95 }}
            >
              Ready to crush today's workout?
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                backgroundColor: "rgba(21, 128, 61, 0.7)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
              }}
            >
              <div className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                {todayStats.workouts}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "#ffffff", opacity: 0.9 }}
              >
                Workouts
              </div>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                backgroundColor: "rgba(21, 128, 61, 0.7)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
              }}
            >
              <div className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                {todayStats.exercises}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "#ffffff", opacity: 0.9 }}
              >
                Exercises
              </div>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                backgroundColor: "rgba(21, 128, 61, 0.7)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
              }}
            >
              <div className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                {todayStats.timeMinutes}
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "#ffffff", opacity: 0.9 }}
              >
                Minutes
              </div>
            </div>
          </div>
        </section>

        {/* Primary Action */}
        <section className="px-4 py-6 -mt-4 relative z-10">
          {ongoingWorkout ? (
            <Link href={`/workout-journal/${ongoingWorkout.id}`}>
              <Button
                size="lg"
                className="w-full h-16 bg-duolingo-blue hover:bg-duolingo-blue/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Play className="h-6 w-6" />
                  <span className="text-lg font-semibold max-w-[280px] truncate">
                    Resume "{ongoingWorkout.name}"
                  </span>
                </div>
              </Button>
            </Link>
          ) : (
            <div className="space-y-3">
              <Link href="/workout-journal">
                <Button
                  size="lg"
                  className="w-full h-16 bg-duolingo-blue hover:bg-duolingo-blue/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Play className="h-6 w-6" />
                    <span className="text-lg font-semibold">
                      Start New Workout
                    </span>
                  </div>
                </Button>
              </Link>
              <Link href="/programs">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">
                      View Programs
                    </span>
                  </div>
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-3 text-center">
            <Link href="/programs">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                View Training Programs
              </Button>
            </Link>
          </div>
        </section>

        {/* AI Recommendation */}
        <section className="px-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="font-semibold">AI Coach Recommendation</h3>
              </div>
              <p className="text-purple-100 text-sm mb-3">
                {aiRecommendation.message}
              </p>
              <Link href="/programs">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                >
                  View Full Program
                </Button>
              </Link>
            </div>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full"></div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Workouts
            </h3>
            <Link href="/workouts">
              <Button
                variant="ghost"
                size="sm"
                className="text-duolingo-blue hover:text-duolingo-blue/80"
              >
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onViewDetails={() => {
                    // Navigate to workout details
                    window.location.href = `/workouts/${workout.id}`;
                  }}
                />
              ))
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    No workouts yet
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Start your first workout to see it here!
                  </p>
                  <Link href="/workout-journal">
                    <Button
                      size="sm"
                      className="bg-duolingo-green hover:bg-duolingo-green/90"
                    >
                      Start First Workout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Progress Insights */}
        <section className="px-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Progress Insights
          </h3>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-duolingo-green/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <ChartLine className="h-5 w-5 text-duolingo-green" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Strength Gains Detected
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Your bench press has improved 8% over the last 3 weeks.
                      You're ready for heavier weight!
                    </p>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                      <span>Based on 9 workouts</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-energetic-orange/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Target className="h-5 w-5 text-energetic-orange" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Focus Area Suggestion
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Your shoulder development is progressing well, but rear
                      delts could use more attention for balanced growth.
                    </p>
                    <div className="flex items-center text-xs text-gray-600">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      <span>AI Pattern Analysis</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Goals */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="text-duolingo-blue hover:text-duolingo-blue/80"
              >
                Edit
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {goals.length > 0 ? (
              goals.slice(0, 2).map((goal) => {
                const progress = goal.targetValue
                  ? Math.min(100, (goal.currentValue! / goal.targetValue) * 100)
                  : 0;

                const getStatusColor = () => {
                  if (progress >= 80)
                    return "bg-success-green/10 text-success-green";
                  if (progress >= 50)
                    return "bg-warning-orange/10 text-warning-orange";
                  return "bg-gray-100 text-gray-600";
                };

                return (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-duolingo-blue/10 rounded-lg flex items-center justify-center mr-3">
                            <Target className="h-4 w-4 text-duolingo-blue" />
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {goal.title}
                          </h4>
                        </div>
                        <Badge className={getStatusColor()}>
                          {progress >= 80
                            ? "On Track"
                            : progress >= 50
                              ? "Needs Focus"
                              : "Getting Started"}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <p className="text-sm text-gray-700">
                        {goal.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    No goals set
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Set your first fitness goal to track progress!
                  </p>
                  <Link href="/profile">
                    <Button
                      size="sm"
                      className="bg-duolingo-green hover:bg-duolingo-green/90"
                    >
                      Set Goals
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-30">
        <Link href="/workout-journal">
          <Button
            size="icon"
            className="w-14 h-14 bg-duolingo-green hover:bg-duolingo-green/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <BottomNavigation />

      {/* Achievement Modal */}
      {currentAchievement && (
        <AchievementModal
          isOpen={showAchievement}
          onClose={() => {
            setShowAchievement(false);
            // Mark achievement as viewed
            fetch(`/api/achievements/${currentAchievement.id}/viewed`, {
              method: "PATCH",
              credentials: "include",
            });
          }}
          achievement={{
            type: currentAchievement.type,
            title: currentAchievement.title,
            description: currentAchievement.description || "Great achievement!",
            data: currentAchievement.data,
          }}
        />
      )}
    </div>
  );
}
