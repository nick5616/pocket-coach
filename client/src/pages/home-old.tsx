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
import LoadingScreen from "../components/loading-screen";
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
// Removed useAuth import
import styles from "./home-old.module.css";

export default function Home() {
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);

  // const { user: authUser, isAuthenticated } = useAuth(); // Removed - auth handled in main App
  const authUser = { id: "auth-user" }; // Placeholder
  const isAuthenticated = true; // Placeholder

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user", authUser?.id],
    queryFn: () => fetch(`/api/user/${authUser?.id}`).then((res) => res.json()),
    enabled: !!authUser?.id,
  });

  const { data: recentWorkouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
    enabled: isAuthenticated,
  });

  // Find ongoing workout (not completed)
  const ongoingWorkout = recentWorkouts.find(
    (w) => !w.isCompleted && !w.completedAt,
  );

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: isAuthenticated,
  });

  const { data: activeProgram, isLoading: activeProgramLoading } = useQuery({
    queryKey: ["/api/programs/active"],
    enabled: isAuthenticated,
  });

  // Show loading screen if any essential data is still loading
  const isLoading = userLoading || workoutsLoading || goalsLoading || achievementsLoading || activeProgramLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

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
    exercises: recentWorkouts
      .filter((w) => {
        const today = new Date();
        const workoutDate = new Date(w.createdAt!);
        return workoutDate.toDateString() === today.toDateString();
      })
      .reduce(
        (total, workout) => total + ((workout as any).exercises?.length || 0),
        0,
      ),
    timeMinutes: recentWorkouts
      .filter((w) => {
        const today = new Date();
        const workoutDate = new Date(w.createdAt!);
        return workoutDate.toDateString() === today.toDateString();
      })
      .reduce((total, workout) => {
        if (workout.completedAt && workout.createdAt) {
          const duration =
            new Date(workout.completedAt).getTime() -
            new Date(workout.createdAt).getTime();
          return total + Math.round(duration / (1000 * 60));
        }
        return total;
      }, 0),
  };

  // Generate AI recommendation based on recent workout data
  const aiRecommendation: AIRecommendation = (() => {
    if (!recentWorkouts.length) {
      return {
        message:
          "Ready to start your fitness journey? Let's begin with a balanced workout to establish your baseline.",
        focusAreas: ["full body", "foundation"],
      };
    }

    const lastWorkout = recentWorkouts[0];
    const daysSinceLastWorkout = Math.floor(
      (Date.now() - new Date(lastWorkout.createdAt!).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastWorkout === 0) {
      return {
        message:
          "Great work today! Consider some light stretching or mobility work to aid recovery.",
        focusAreas: ["recovery", "mobility"],
      };
    } else if (daysSinceLastWorkout === 1) {
      return {
        message:
          "Perfect timing for your next session. Your body has had time to recover and adapt.",
        focusAreas: ["progression", "strength"],
      };
    } else if (daysSinceLastWorkout <= 3) {
      return {
        message:
          "Time to get back in there! Your muscles are ready for the next challenge.",
        focusAreas: ["consistency", "endurance"],
      };
    } else {
      return {
        message:
          "Welcome back! Let's ease into it with a moderate session to rebuild momentum.",
        focusAreas: ["restart", "foundation"],
      };
    }
  })();

  const greeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || authUser?.firstName || "User";

    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerActions}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-duolingo-green rounded-full flex items-center justify-center">
              <svg
                style={{width: "1rem", height: "1rem"}} text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43L22 13.43l-1.43-1.57z" />
              </svg>
            </div>
            <div>
              <h1 className={styles.headerTitle}>Pocket Coach</h1>
              <p className="text-xs text-gray-600">
                {user?.currentStreak || 0} day streak
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.achievementButton}>
              <Button
                variant="ghost"
                size="icon"
              >
                <Bell className="h-5 w-5" />
                {achievements.filter((a) => !a.isViewed).length > 0 && (
                  <span className={styles.achievementBadge}>
                    {achievements.filter((a) => !a.isViewed).length}
                  </span>
                )}
              </Button>
            </div>
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
              >
                <UserIcon className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h2 className={styles.welcomeTitle}>
              {greeting()}
            </h2>
            <p className={styles.welcomeSubtitle}>
              Ready to crush today's workout?
            </p>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {todayStats.workouts}
              </div>
              <div className={styles.statLabel}>
                Workouts
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {todayStats.exercises}
              </div>
              <div className={styles.statLabel}>
                Exercises
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {todayStats.timeMinutes}
              </div>
              <div className={styles.statLabel}>
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
          ) : activeProgram ? (
            <div style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
              <Link href={`/workouts/program/${activeProgram?.id}`}>
                <Button
                  size="lg"
                  className="w-full h-16 bg-duolingo-blue hover:bg-duolingo-blue/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Play className="h-6 w-6" />
                    <span className="text-lg font-semibold max-w-[280px] truncate">
                      Begin: {activeProgram?.name || "Today's Workout"}
                    </span>
                  </div>
                </Button>
              </Link>
              <Link href="/workout-journal">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">Freestyle a workout</span>
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
                    <ChartLine className="h-5 w-5" />
                    <span className="font-semibold">View programs</span>
                  </div>
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              <div className="text-center text-gray-600 text-sm mb-4">
                You do not appear to be in a program
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
                <Link href="/workout-journal">
                  <Button
                    size="lg"
                    className="w-full h-16 bg-duolingo-blue hover:bg-duolingo-blue/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Play className="h-6 w-6" />
                      <span className="text-lg font-semibold">
                        Freestyle a workout
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
                      <span className="font-semibold">Find a program</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* AI Recommendation */}
        <section className="px-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg
                    style={{width: "1rem", height: "1rem"}}"
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
            <h3 style={{fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)"}}>
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

          <div style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
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
              <Card style={{border: "2px dashed var(--border-secondary)"}}>
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

        {/* Progress Insights - Show only when user has workout data */}
        {recentWorkouts.length > 0 && (
          <section className="px-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Progress Insights
            </h3>
            <Card style={{border: "2px dashed var(--border-secondary)"}}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ChartLine className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Building Your Profile
                </h4>
                <p className="text-sm text-gray-500">
                  Complete more workouts to unlock personalized insights and
                  progress analysis.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Goals */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{fontSize: "1.125rem", fontWeight: "600", color: "var(--text-primary)"}}>Your Goals</h3>
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

          <div style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
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
                    <CardContent className={styles.content}>
                      <div className={styles.header}>
                        <div className={styles.headerLeft}>
                          <div className="w-8 h-8 bg-duolingo-blue/10 rounded-lg flex items-center justify-center mr-3">
                            <Target className="h-4 w-4 text-duolingo-blue" />
                          </div>
                          <h4 style={{fontWeight: "600", color: "var(--text-primary)"}}>
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
              <Card style={{border: "2px dashed var(--border-secondary)"}}>
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
