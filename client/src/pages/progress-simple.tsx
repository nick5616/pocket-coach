import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import BottomNavigation from "@/components/bottom-navigation";
import BodyVisualization from "@/components/body-visualization";
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Flame,
  Activity,
} from "lucide-react";
import type { Goal, Workout, Achievement } from "@shared/schema";
import LoadingScreen from "../components/loading-screen";
import styles from './progress-simple.module.css';

export default function Progress() {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "goals" | "body" | "achievements"
  >("overview");
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const userId = 1; // Demo user

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals", { userId }],
    queryFn: () =>
      fetch(`/api/goals?userId=${userId}`).then((res) => res.json()),
  });

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<
    Workout[]
  >({
    queryKey: ["/api/workouts", { userId }],
    queryFn: () =>
      fetch(`/api/workouts?userId=${userId}`).then((res) => res.json()),
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<
    Achievement[]
  >({
    queryKey: ["/api/achievements", { userId }],
    queryFn: () =>
      fetch(`/api/achievements?userId=${userId}`).then((res) => res.json()),
  });

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  if (goalsLoading || workoutsLoading || achievementsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingScreen message="Loading your progress..." />
      </div>
    );
  }

  return (
    <>
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.headerTitle}>Progress</h1>
              <p className={styles.headerSubtitle}>
                Track your fitness achievements
              </p>
            </div>
            <div className={styles.achievementsBadge}>
              <Award style={{width: "1.5rem", height: "1.5rem", color: "var(--warning)"}} />
              <span className={styles.achievementsCount}>
                {achievements.length}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <section className={styles.tabNav}>
          <div className={styles.tabGrid}>
            <Button
              variant={selectedTab === "overview" ? "primary" : "outline"}
              onClick={() => setSelectedTab("overview")}
              size="sm"
            >
              Overview
            </Button>
            <Button
              variant={selectedTab === "goals" ? "primary" : "outline"}
              onClick={() => setSelectedTab("goals")}
              size="sm"
            >
              Goals
            </Button>
            <Button
              variant={selectedTab === "body" ? "primary" : "outline"}
              onClick={() => setSelectedTab("body")}
              size="sm"
            >
              Body Map
            </Button>
            <Button
              variant={selectedTab === "achievements" ? "primary" : "outline"}
              onClick={() => setSelectedTab("achievements")}
              size="sm"
            >
              Awards
            </Button>
          </div>
        </section>

        {/* Tab Content */}
        <section className={styles.tabContent}>
          {selectedTab === "overview" && (
            <div className={styles.overviewContent}>
              <div className={styles.statsGrid}>
                <Card>
                  <CardContent className={styles.statCard}>
                    <div className={`${styles.statValue} ${styles.statValueBlue}`}>
                      {workouts.length}
                    </div>
                    <div className={styles.statLabel}>Total Workouts</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className={styles.statCard}>
                    <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                      {goals.filter((g) => g.status === "completed").length}
                    </div>
                    <div className={styles.statLabel}>Goals Achieved</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {workouts.slice(0, 3).map((workout) => (
                    <div
                      key={workout.id}
                      style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-primary)"}}
                      className="last:border-b-0"
                    >
                      <div>
                        <div style={{fontWeight: "500", color: "var(--text-primary)"}}>{workout.name}</div>
                        <div style={{fontSize: "0.875rem", color: "var(--text-secondary)"}}>
                          {new Date(workout.createdAt!).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={workout.isCompleted ? "default" : "secondary"}
                      >
                        {workout.isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "goals" && (
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  style={{cursor: "pointer", transition: "box-shadow 0.2s"}}
                  onClick={() => setSelectedGoalId(goal.id)}
                >
                  <CardContent className={styles.content}>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                      <div style={{flex: "1"}}>
                        <h3 style={{fontWeight: "500", color: "var(--text-primary)"}}>{goal.title}</h3>
                        <p style={{fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem"}}>
                          {goal.description}
                        </p>
                        <div style={{display: "flex", alignItems: "center", marginTop: "0.5rem", gap: "1rem"}}>
                          <Badge
                            variant={
                              goal.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {goal.category}
                          </Badge>
                          <span style={{fontSize: "0.875rem", color: "var(--text-secondary)"}}>
                            {goal.currentValue || 0} / {goal.targetValue}{" "}
                            {goal.unit}
                          </span>
                        </div>
                      </div>
                      <Target style={{width: "1.25rem", height: "1.25rem", color: "var(--text-tertiary)"}} />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {goals.length === 0 && (
                <Card>
                  <CardContent style={{padding: "2rem", textAlign: "center"}}>
                    <Target style={{width: "3rem", height: "3rem", color: "var(--text-tertiary)", margin: "0 auto 1rem auto"}} />
                    <h3 style={{fontSize: "1.125rem", fontWeight: "500", color: "var(--text-primary)", marginBottom: "0.5rem"}}>
                      No goals set
                    </h3>
                    <p style={{color: "var(--text-secondary)"}}>
                      Set your first fitness goal to start tracking progress
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedTab === "body" && (
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              <Card>
                <CardHeader>
                  <CardTitle>Body Heat Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <BodyVisualization userId={userId} />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "achievements" && (
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className={styles.content}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award style={{width: "1.25rem", height: "1.25rem"}} text-yellow-600" />
                      </div>
                      <div style={{flex: "1"}}>
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            achievement.createdAt!,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{achievement.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {achievements.length === 0 && (
                <Card>
                  <CardContent style={{padding: "2rem", textAlign: "center"}}>
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No achievements yet
                    </h3>
                    <p style={{color: "var(--text-secondary)"}}>
                      Complete workouts and goals to earn achievements
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Goal Details Dialog */}
      {selectedGoal && (
        <Dialog
          open={!!selectedGoal}
          onOpenChange={() => setSelectedGoalId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGoal.title}</DialogTitle>
            </DialogHeader>
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              <p style={{color: "var(--text-secondary)"}}>{selectedGoal.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span>
                    {selectedGoal.currentValue || 0} /{" "}
                    {selectedGoal.targetValue} {selectedGoal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((selectedGoal.currentValue || 0) / (selectedGoal.targetValue || 1)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <BottomNavigation />
    </>
  );
}
