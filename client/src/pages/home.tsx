import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Progress } from "@/components/Progress";
import BottomNavigation from "@/components/bottom-navigation";
import AchievementModal from "@/components/achievement-modal";
import WorkoutCard from "@/components/workout-card";
import LoadingScreen from "@/components/loading-screen";
import DemoBanner from "@/components/demo-banner";
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

// Static fallback component for when React context is broken
function StaticHomeFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#ffffff'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Pocket Coach</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Please reload the page or try demo mode.
        </p>
        <button
          onClick={() => window.location.href = '/demo'}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#58cc02',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Continue with Demo
        </button>
        <button
          onClick={() => window.location.href = '/auth'}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            color: '#000000',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState<any>(null);
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  // Check if this is demo mode
  const isDemoUser = authUser?.email === 'demo@pocketcoach.app';

  // Redirect to auth if not authenticated (but avoid redirect loops)
  useEffect(() => {
    if (!authLoading && !authUser && window.location.pathname === '/') {
      console.log('Not authenticated, redirecting to auth page');
      setLocation('/auth');
    }
  }, [authUser, authLoading, setLocation]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!authUser) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background, #ffffff)',
        color: 'var(--foreground, #000000)',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--card, #ffffff)',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: '1rem' }}>Pocket Coach</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Please log in to continue
          </p>
          <button
            onClick={() => setLocation('/auth')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#58cc02',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/user/${authUser?.id}`],
    enabled: !!authUser?.id,
  });

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
    enabled: !!authUser?.id,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!authUser?.id,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!authUser?.id,
  });

  const { data: activeProgram, isLoading: programLoading } = useQuery({
    queryKey: ["/api/programs/active"],
    enabled: !!authUser?.id,
  });

  // Show loading screen if any essential data is still loading
  const isLoading = userLoading || workoutsLoading || goalsLoading || achievementsLoading || programLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading your fitness dashboard..." />;
  }

  // Check for any ongoing (incomplete) workouts
  const ongoingWorkout = workouts.find((w) => !w.isCompleted);

  // Get recent workouts for stats
  const recentWorkouts = workouts
    .filter((w) => w.isCompleted)
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    )
    .slice(0, 10);

  // Calculate today's stats
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
      .reduce((total, workout) => total + (workout.duration || 0), 0),
  };

  // Generate AI recommendation based on workout history
  const aiRecommendation: AIRecommendation = (() => {
    if (recentWorkouts.length === 0) {
      return {
        message:
          "Ready to start your fitness journey? Begin with foundational movements to build strength and confidence.",
        focusAreas: ["Foundation Building", "Form Development"],
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
          "Great work today! Consider light stretching or mobility work to aid recovery.",
        focusAreas: ["Recovery", "Mobility"],
      };
    } else if (daysSinceLastWorkout <= 2) {
      return {
        message:
          "Perfect timing for your next session. Focus on progressive overload and challenging yourself.",
        focusAreas: ["Progressive Overload", "Strength Building"],
      };
    } else if (daysSinceLastWorkout <= 7) {
      return {
        message:
          "Time to get back in there! Start with a moderate intensity to rebuild momentum.",
        focusAreas: ["Momentum Building", "Consistency"],
      };
    } else {
      return {
        message:
          "Welcome back! Start with lighter weights and focus on movement quality as you return to training.",
        focusAreas: ["Movement Quality", "Gradual Return"],
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
      {isDemoUser && <DemoBanner />}
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Pocket Coach</h1>
        <div className={styles.headerActions}>
          <div className={styles.achievementButton}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAchievement(true)}
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
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h2 className={styles.welcomeTitle}>{greeting()}</h2>
            <p className={styles.welcomeSubtitle}>
              Ready to crush today's workout?
            </p>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{todayStats.workouts}</div>
              <div className={styles.statLabel}>Workouts</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{todayStats.exercises}</div>
              <div className={styles.statLabel}>Exercises</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{todayStats.timeMinutes}</div>
              <div className={styles.statLabel}>Minutes</div>
            </div>
          </div>
        </section>

        {/* Primary Action */}
        <section className={styles.actionsSection}>
          {ongoingWorkout ? (
            <Link href={`/workout-journal/${ongoingWorkout.id}`}>
              <button className={styles.resumeButton}>
                <Play className="h-6 w-6" />
                <span>Resume "{ongoingWorkout.name}"</span>
              </button>
            </Link>
          ) : activeProgram ? (
            <div className={styles.actionButtons}>
              <Link href={`/workouts/program/${(activeProgram as any)?.id}`}>
                <button className={styles.programButton}>
                  <Play className="h-6 w-6" />
                  <span>
                    Begin: {(activeProgram as any)?.name || "Today's Workout"}
                  </span>
                </button>
              </Link>
              <Link href="/workout-journal">
                <button className={styles.secondaryButton}>
                  <Calendar className="h-5 w-5" />
                  <span>Freestyle a workout</span>
                </button>
              </Link>
              <Link href="/programs">
                <button className={styles.secondaryButton}>
                  <ChartLine className="h-5 w-5" />
                  <span>View programs</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className={styles.noProgram}>
              <h3 className={styles.noProgramTitle}>
                You do not appear to be in a program
              </h3>
              <div className={styles.actionButtons}>
                <Link href="/workout-journal">
                  <button className={styles.primaryButton}>
                    <Play className="h-6 w-6" />
                    <span>Freestyle a workout</span>
                  </button>
                </Link>
                <Link href="/programs">
                  <button className={styles.secondaryButton}>
                    <Calendar className="h-5 w-5" />
                    <span>Find a program</span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* AI Recommendation */}
        <section className={styles.aiSection}>
          <div className={styles.aiCard}>
            <div className={styles.aiContent}>
              <div className={styles.aiHeader}>
                <div className={styles.aiIcon}>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className={styles.aiTitle}>AI Coach Recommendation</h3>
              </div>
              <p className={styles.aiMessage}>{aiRecommendation.message}</p>
              <Link href="/programs">
                <button className={styles.aiButton}>View Full Program</button>
              </Link>
            </div>
            <div className={styles.aiDecoration1}></div>
            <div className={styles.aiDecoration2}></div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Workouts</h3>
            <Link href="/workouts">
              <button className={styles.sectionButton}>View All</button>
            </Link>
          </div>

          <div className={styles.contentList}>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onViewDetails={() => {
                    window.location.href = `/workouts/${workout.id}`;
                  }}
                />
              ))
            ) : (
              <Card className={styles.emptyState}>
                <CardContent className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className={styles.emptyTitle}>No workouts yet</h4>
                  <p className={styles.emptyDescription}>
                    Start your first workout to see it here!
                  </p>
                  <Link href="/workout-journal">
                    <button className={styles.emptyButton}>
                      Start First Workout
                    </button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Progress Insights - Show only when user has workout data */}
        {recentWorkouts.length > 0 && (
          <section className={styles.progressSection}>
            <h3 className={styles.sectionTitle}>Your Progress Insights</h3>
            <Card className={styles.progressCard}>
              <CardContent className={styles.progressCard}>
                <div className={styles.progressIcon}>
                  <ChartLine className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className={styles.progressTitle}>Building Your Profile</h4>
                <p className={styles.progressDescription}>
                  Complete more workouts to unlock personalized insights and
                  progress analysis.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Goals */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Your Goals</h3>
            <Link href="/profile">
              <button className={styles.sectionButton}>Edit</button>
            </Link>
          </div>

          <div className={styles.contentList}>
            {goals.length > 0 ? (
              goals.slice(0, 2).map((goal) => {
                const progress = goal.targetValue
                  ? Math.min(100, (goal.currentValue! / goal.targetValue) * 100)
                  : 0;

                const getStatusColor = () => {
                  if (progress >= 80) return styles.goalBadgeGreen;
                  if (progress >= 50) return styles.goalBadgeYellow;
                  return styles.goalBadgeRed;
                };

                return (
                  <Card key={goal.id} className={styles.goalCard}>
                    <CardContent className={styles.goalCard}>
                      <div className={styles.goalHeader}>
                        <h4 className={styles.goalTitle}>{goal.title}</h4>
                        <span
                          className={`${styles.goalBadge} ${getStatusColor()}`}
                        >
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.goalProgress}>
                        <Progress value={progress} />
                      </div>
                      <div className={styles.goalStats}>
                        <span>
                          {goal.currentValue || 0} / {goal.targetValue}{" "}
                          {goal.unit}
                        </span>
                        <span>{goal.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className={styles.emptyState}>
                <CardContent className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Target className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className={styles.emptyTitle}>No goals set</h4>
                  <p className={styles.emptyDescription}>
                    Set your first fitness goal to track progress!
                  </p>
                  <Link href="/profile">
                    <button className={styles.emptyButton}>Create Goal</button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />

      {showAchievement && achievementData && (
        <AchievementModal
          isOpen={showAchievement}
          onClose={() => setShowAchievement(false)}
          achievement={achievementData}
        />
      )}
    </div>
  );
}
