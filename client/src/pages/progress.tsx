import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import BottomNavigation from "@/components/bottom-navigation";
import BodyVisualization from "@/components/body-visualization";
import LoadingScreen from "../components/loading-screen";
import styles from "@/styles/progress.module.css";
import { 
  Target, 
  Calendar, 
  Flame,
  Trophy,
  Activity,
  ChevronRight,
  Plus,
  TrendingUp,
  Zap,
  Clock,
  Weight,
  BarChart3
} from "lucide-react";
import { calculateCurrentStreak } from "../lib/stats";
import type { Workout, Goal, MuscleGroup } from "@shared/schema";

interface MuscleProgress {
  frequency: number;
  volume: number;
  lastWorked: Date | null;
  intensity: number;
}

export default function Progress() {
  const [selectedTab, setSelectedTab] = useState<'body' | 'goals' | 'insights'>('body');
  const [selectedMuscles, setSelectedMuscles] = useState<number[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [showMuscleDetails, setShowMuscleDetails] = useState(false);
  
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", { limit: 200 }],
    staleTime: 3 * 60 * 1000, // 3 minutes cache for progress
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache for goals
  });

  const { data: muscleProgress, isLoading: progressLoading } = useQuery<MuscleProgress>({
    queryKey: ["/api/muscle-groups", selectedMuscle?.id, "progress"],
    queryFn: async () => {
      if (!selectedMuscle) return null;
      const response = await fetch(`/api/muscle-groups/${selectedMuscle.id}/progress`);
      if (!response.ok) throw new Error('Failed to fetch muscle progress');
      return response.json();
    },
    enabled: !!selectedMuscle,
  });

  // Calculate overall progress stats
  const completedWorkouts = workouts.filter(w => w.isCompleted);
  
  
  const progressStats = {
    totalWorkouts: completedWorkouts.length,
    totalTime: completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    totalVolume: completedWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
    totalCalories: completedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
    currentStreak: calculateCurrentStreak(completedWorkouts),
  };

  const handleMuscleSelect = (muscleGroup: MuscleGroup) => {
    setSelectedMuscle(muscleGroup);
    setShowMuscleDetails(true);
  };

  const handleMuscleToggle = (muscleGroup: MuscleGroup) => {
    setSelectedMuscles(prev => {
      if (prev.includes(muscleGroup.id)) {
        return prev.filter(id => id !== muscleGroup.id);
      } else {
        return [...prev, muscleGroup.id];
      }
    });
  };

  const formatLastWorked = (date: Date | null) => {
    if (!date) return "Never trained";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // Show loading screen if any essential data is still loading
  const isLoading = workoutsLoading || goalsLoading;

  if (isLoading) {
    return <LoadingScreen message="Analyzing your progress data..." />;
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <h1 className="text-heading-2">Progress</h1>
        </div>
      </header>

      <div className="page-content">
        {/* Stats Overview */}
        <section className={styles.statsSection}>
          <div className="container">
            <h2 className={`text-heading-2 ${styles.statsTitle}`}>Your Stats</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{progressStats.totalWorkouts}</div>
                <div className={styles.statLabel}>Total Workouts</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{Math.round(progressStats.totalTime / 60)}h</div>
                <div className={styles.statLabel}>Time Trained</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {progressStats.totalVolume > 0 ? `${Math.round(progressStats.totalVolume / 1000)}K` : "0"}
                </div>
                <div className={styles.statLabel}>Volume (lbs)</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{progressStats.currentStreak}</div>
                <div className={styles.statLabel}>Day Streak</div>
              </div>
            </div>
          </div>
        </section>

        <div className={`container ${styles.containerTopPadding}`}>
          {/* Tab Navigation */}
          <div className={styles.tabContainer}>
            <div className={styles.tabNavigation}>
              <button
                className={`btn ${selectedTab === 'body' ? 'btn-primary' : 'btn-secondary'} ${styles.tabButton}`}
                onClick={() => setSelectedTab('body')}
              >
                Body Map
              </button>
              <button
                className={`btn ${selectedTab === 'goals' ? 'btn-primary' : 'btn-secondary'} ${styles.tabButton}`}
                onClick={() => setSelectedTab('goals')}
              >
                Goals
              </button>
              <button
                className={`btn ${selectedTab === 'insights' ? 'btn-primary' : 'btn-secondary'} ${styles.tabButton}`}
                onClick={() => setSelectedTab('insights')}
              >
                Insights
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'body' && (
            <div className={styles.tabContent}>
              {/* Body Visualization */}
              <div className={`card ${styles.cardWithPadding}`}>
                <h3 className={`text-heading-3 ${styles.sectionHeader}`}>
                  <Activity className={styles.sectionIcon} style={{ color: 'var(--secondary-600)' }} />
                  Muscle Group Progress
                  {selectedMuscles.length > 0 && (
                    <button
                      className={`btn btn-secondary ${styles.clearButton}`}
                      onClick={() => setSelectedMuscles([])}
                    >
                      Clear Selection
                    </button>
                  )}
                </h3>
                
                {/* Placeholder for BodyVisualization */}
                <div className={styles.bodyVisualizationPlaceholder}>
                  <div className={styles.placeholderContent}>
                    <Activity className={styles.placeholderIcon} />
                    <h4 className={`text-heading-3 ${styles.placeholderTitle}`}>Body Visualization</h4>
                    <p className="text-body">Interactive muscle group heat map coming soon</p>
                  </div>
                </div>
                
                {selectedMuscles.length > 0 && (
                  <div className={styles.selectedMusclesSection}>
                    <h4 className={`text-heading-3 ${styles.selectedMusclesTitle}`}>
                      Selected Muscle Groups
                    </h4>
                    <div className={styles.musclesList}>
                      {selectedMuscles.map(muscleId => (
                        <Badge key={muscleId} className={styles.muscleBadge}>
                          Muscle {muscleId}
                        </Badge>
                      ))}
                    </div>
                    <button
                      className={`btn btn-primary ${styles.generateButton}`}
                      onClick={() => {
                        console.log("Generate program for muscles:", selectedMuscles);
                      }}
                    >
                      <Plus className={styles.generateButtonIcon} />
                      Generate Program for Selected Muscles
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className={`card ${styles.cardWithPadding}`}>
                <h3 className={`text-heading-3 ${styles.sectionHeader}`}>
                  <Target className={styles.sectionIcon} style={{ color: 'var(--primary-600)' }} />
                  Quick Actions
                </h3>
                <div className={styles.quickActionsGrid}>
                  <button className={`btn btn-secondary ${styles.actionButton}`}>
                    <span className={styles.actionButtonContent}>
                      <Plus className={styles.actionIcon} />
                      Start Targeted Workout
                    </span>
                    <ChevronRight className={styles.chevronIcon} />
                  </button>
                  
                  <button className={`btn btn-secondary ${styles.actionButton}`}>
                    <span className={styles.actionButtonContent}>
                      <Target className={styles.actionIcon} />
                      Set Muscle Group Goal
                    </span>
                    <ChevronRight className={styles.chevronIcon} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'goals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {goals.length > 0 ? (
                goals.map((goal) => {
                  const progress = goal.targetValue ? 
                    Math.min(100, (goal.currentValue! / goal.targetValue) * 100) : 0;
                  
                  return (
                    <div key={goal.id} className={`card ${styles.goalCard}`}>
                      <div className={styles.goalHeader}>
                        <div className={styles.goalHeaderLeft}>
                          <div className={styles.goalIconContainer}>
                            <Target className={styles.goalIcon} />
                          </div>
                          <div>
                            <h4 className="text-heading-3">{goal.title}</h4>
                            <p className={`text-body ${styles.goalCategory}`}>{goal.category}</p>
                          </div>
                        </div>
                        <Badge className={
                          progress >= 80 ? styles.badgeSuccess :
                          progress >= 50 ? styles.badgeWarning : styles.badgeNeutral
                        }>
                          {Math.round(progress)}%
                        </Badge>
                      </div>

                      <div className={styles.goalProgressSection}>
                        <div className={styles.goalProgressHeader}>
                          <span className="text-body">Progress</span>
                          <span className="text-body">
                            {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <div className={styles.goalProgressBar}>
                          <div 
                            className={`${styles.goalProgressFill} ${
                              progress >= 80 ? styles.progressFillSuccess :
                              progress >= 50 ? styles.progressFillWarning : styles.progressFillNeutral
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {goal.description && (
                        <p className={`text-body ${styles.goalDescription}`}>{goal.description}</p>
                      )}

                      {goal.targetDate && (
                        <div className={styles.goalDate}>
                          <Calendar className={styles.goalDateIcon} />
                          <span className="text-caption">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={`card ${styles.emptyState}`}>
                  <div className={styles.iconContainerLarge}>
                    <Target className={styles.insightIcon} style={{ color: 'var(--text-tertiary)', width: '2rem', height: '2rem' }} />
                  </div>
                  <h3 className={`text-heading-3 ${styles.emptyStateTitle}`}>No goals set</h3>
                  <p className={`text-body ${styles.emptyStateDescription}`}>
                    Set fitness goals to track your progress and stay motivated!
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'insights' && (
            <div className={styles.tabContent}>
              {completedWorkouts.length === 0 ? (
                <div className={`card ${styles.emptyState}`}>
                  <div className={styles.iconContainerLarge}>
                    <BarChart3 className={styles.insightIcon} style={{ color: 'var(--text-tertiary)', width: '2rem', height: '2rem' }} />
                  </div>
                  <h3 className={`text-heading-3 ${styles.emptyStateTitle}`}>No insights available</h3>
                  <p className={`text-body ${styles.emptyStateDescription}`}>
                    Complete some workouts to see personalized insights and progress analysis!
                  </p>
                </div>
              ) : (
                <>
                  {/* Real streak insight */}
                  {progressStats.currentStreak > 0 && (
                    <div className={`card ${styles.insightCard}`}>
                      <div className={styles.insightHeader}>
                        <div className={styles.iconContainerWarning}>
                          <Flame className={styles.insightIcon} />
                        </div>
                        <div className={styles.insightContent}>
                          <h4 className={`text-heading-3 ${styles.insightTitle}`}>
                            {progressStats.currentStreak === 1 ? 'Great Start!' : 'Consistency Champion'}
                          </h4>
                          <p className="text-body">
                            {progressStats.currentStreak} day workout streak! Keep the momentum going
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real volume insight */}
                  {progressStats.totalVolume > 0 && (
                    <div className={`card ${styles.insightCard}`}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: 'var(--secondary-500)',
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 'var(--spacing-md)',
                          flexShrink: 0
                        }}>
                          <Weight style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className="text-heading-3" style={{ marginBottom: 'var(--spacing-xs)' }}>Training Volume</h4>
                          <p className="text-body">
                            You've lifted {Math.round(progressStats.totalVolume).toLocaleString()} lbs total across all workouts!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real workout frequency insight */}
                  {progressStats.totalWorkouts >= 3 && (
                    <div className={`card ${styles.insightCard}`}>
                      <div className={styles.insightHeader}>
                        <div className={styles.iconContainerPrimary}>
                          <Activity className={styles.insightIcon} style={{ color: 'var(--primary-600)' }} />
                        </div>
                        <div className={styles.insightContent}>
                          <h4 className={`text-heading-3 ${styles.insightTitle}`}>Training Progress</h4>
                          <p className="text-body">
                            {progressStats.totalWorkouts} workouts completed with {Math.round(progressStats.totalTime / 60)} hours of training time
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Time investment insight */}
                  {progressStats.totalTime > 0 && (
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: 'var(--success)',
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 'var(--spacing-md)',
                          flexShrink: 0
                        }}>
                          <Clock style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className="text-heading-3" style={{ marginBottom: 'var(--spacing-xs)' }}>Time Investment</h4>
                          <p className="text-body">
                            {Math.round(progressStats.totalTime / 60)} hours invested in your fitness journey. 
                            Average workout: {Math.round(progressStats.totalTime / progressStats.totalWorkouts)} minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Muscle Details Dialog */}
        {showMuscleDetails && selectedMuscle && (
          <Dialog open={showMuscleDetails} onOpenChange={setShowMuscleDetails}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedMuscle.name} Progress</DialogTitle>
              </DialogHeader>
              <div style={{ padding: 'var(--spacing-md)' }}>
                {muscleProgress ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-body">Frequency</span>
                      <span className="text-body">{muscleProgress.frequency}x/week</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-body">Volume</span>
                      <span className="text-body">{muscleProgress.volume.toLocaleString()} lbs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-body">Last Worked</span>
                      <span className="text-body">{formatLastWorked(muscleProgress.lastWorked)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-body">Loading muscle group data...</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}