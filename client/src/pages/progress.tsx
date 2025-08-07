import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import BottomNavigation from "@/components/bottom-navigation";
import BodyVisualization from "@/components/body-visualization";
import LoadingScreen from "../components/loading-screen";
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
    queryKey: ["/api/workouts"],
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
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
  
  // Calculate real workout streak from actual data
  const calculateCurrentStreak = () => {
    if (completedWorkouts.length === 0) return 0;
    
    const today = new Date();
    const sortedWorkouts = completedWorkouts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.createdAt);
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = new Date(workoutDate);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const progressStats = {
    totalWorkouts: completedWorkouts.length,
    totalTime: completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    totalVolume: completedWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
    totalCalories: completedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
    currentStreak: calculateCurrentStreak(),
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
        <section style={{
          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)',
          color: 'white',
          padding: 'var(--spacing-xl) var(--spacing-md)'
        }}>
          <div className="container">
            <h2 className="text-heading-2" style={{ color: 'white', marginBottom: 'var(--spacing-lg)' }}>Your Stats</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
              <div className="stat-card" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                <div className="stat-value" style={{ color: 'white' }}>{progressStats.totalWorkouts}</div>
                <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Workouts</div>
              </div>
              <div className="stat-card" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                <div className="stat-value" style={{ color: 'white' }}>{Math.round(progressStats.totalTime / 60)}h</div>
                <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Time Trained</div>
              </div>
              <div className="stat-card" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                <div className="stat-value" style={{ color: 'white' }}>
                  {progressStats.totalVolume > 0 ? `${Math.round(progressStats.totalVolume / 1000)}K` : "0"}
                </div>
                <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Volume (lbs)</div>
              </div>
              <div className="stat-card" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                <div className="stat-value" style={{ color: 'white' }}>{progressStats.currentStreak}</div>
                <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Day Streak</div>
              </div>
            </div>
          </div>
        </section>

        <div className="container" style={{ paddingTop: 'var(--spacing-xl)' }}>
          {/* Tab Navigation */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              width: '100%',
              background: 'var(--gray-100)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xs)',
              gap: 'var(--spacing-xs)'
            }}>
              <button
                className={`btn ${selectedTab === 'body' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedTab('body')}
                style={{ margin: 0, fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              >
                Body Map
              </button>
              <button
                className={`btn ${selectedTab === 'goals' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedTab('goals')}
                style={{ margin: 0, fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              >
                Goals
              </button>
              <button
                className={`btn ${selectedTab === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedTab('insights')}
                style={{ margin: 0, fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              >
                Insights
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'body' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {/* Body Visualization */}
              <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                <h3 className="text-heading-3" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 'var(--spacing-lg)' 
                }}>
                  <Activity style={{ width: '1.25rem', height: '1.25rem', marginRight: 'var(--spacing-sm)', color: 'var(--secondary-600)' }} />
                  Muscle Group Progress
                  {selectedMuscles.length > 0 && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedMuscles([])}
                      style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                    >
                      Clear Selection
                    </button>
                  )}
                </h3>
                
                {/* Placeholder for BodyVisualization */}
                <div style={{
                  height: '20rem',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed var(--gray-200)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Activity style={{ width: '3rem', height: '3rem', color: 'var(--gray-400)', margin: '0 auto var(--spacing-md)' }} />
                    <h4 className="text-heading-3" style={{ marginBottom: 'var(--spacing-sm)' }}>Body Visualization</h4>
                    <p className="text-body">Interactive muscle group heat map coming soon</p>
                  </div>
                </div>
                
                {selectedMuscles.length > 0 && (
                  <div style={{
                    marginTop: 'var(--spacing-lg)',
                    padding: 'var(--spacing-lg)',
                    background: 'var(--secondary-50)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <h4 className="text-heading-3" style={{ color: 'var(--secondary-700)', marginBottom: 'var(--spacing-md)' }}>
                      Selected Muscle Groups
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                      {selectedMuscles.map(muscleId => (
                        <Badge key={muscleId} style={{ background: 'var(--secondary-100)', color: 'var(--secondary-700)' }}>
                          Muscle {muscleId}
                        </Badge>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        console.log("Generate program for muscles:", selectedMuscles);
                      }}
                      style={{ width: '100%' }}
                    >
                      <Plus style={{ width: '1rem', height: '1rem', marginRight: 'var(--spacing-sm)' }} />
                      Generate Program for Selected Muscles
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                <h3 className="text-heading-3" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 'var(--spacing-lg)' 
                }}>
                  <Target style={{ width: '1.25rem', height: '1.25rem', marginRight: 'var(--spacing-sm)', color: 'var(--primary-600)' }} />
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <button className="btn btn-secondary" style={{ 
                    width: '100%', 
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-md)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <Plus style={{ width: '1rem', height: '1rem', marginRight: 'var(--spacing-sm)' }} />
                      Start Targeted Workout
                    </span>
                    <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                  </button>
                  
                  <button className="btn btn-secondary" style={{ 
                    width: '100%', 
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-md)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <Target style={{ width: '1rem', height: '1rem', marginRight: 'var(--spacing-sm)' }} />
                      Set Muscle Group Goal
                    </span>
                    <ChevronRight style={{ width: '1rem', height: '1rem' }} />
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
                    <div key={goal.id} className="card" style={{ padding: 'var(--spacing-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'var(--primary-100)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 'var(--spacing-md)'
                          }}>
                            <Target style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-600)' }} />
                          </div>
                          <div>
                            <h4 className="text-heading-3">{goal.title}</h4>
                            <p className="text-body" style={{ textTransform: 'capitalize' }}>{goal.category}</p>
                          </div>
                        </div>
                        <Badge style={{
                          background: progress >= 80 ? 'var(--success)' :
                                    progress >= 50 ? 'var(--warning)' : 'var(--gray-400)',
                          color: 'white'
                        }}>
                          {Math.round(progress)}%
                        </Badge>
                      </div>

                      <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                          <span className="text-body">Progress</span>
                          <span className="text-body">
                            {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '0.5rem',
                          background: 'var(--gray-200)',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: progress >= 80 ? 'var(--success)' :
                                      progress >= 50 ? 'var(--warning)' : 'var(--gray-400)',
                            transition: 'width 0.3s ease',
                            borderRadius: 'var(--radius-sm)'
                          }} />
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-body" style={{ marginBottom: 'var(--spacing-md)' }}>{goal.description}</p>
                      )}

                      {goal.targetDate && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Calendar style={{ width: '0.875rem', height: '0.875rem', marginRight: 'var(--spacing-xs)', color: 'var(--gray-400)' }} />
                          <span className="text-caption">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="card" style={{ 
                  padding: 'var(--spacing-2xl)', 
                  textAlign: 'center',
                  border: '2px dashed var(--gray-200)'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'var(--gray-100)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--spacing-lg)'
                  }}>
                    <Target style={{ width: '2rem', height: '2rem', color: 'var(--gray-400)' }} />
                  </div>
                  <h3 className="text-heading-3" style={{ marginBottom: 'var(--spacing-sm)' }}>No goals set</h3>
                  <p className="text-body" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    Set fitness goals to track your progress and stay motivated!
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              {completedWorkouts.length === 0 ? (
                <div className="card" style={{ 
                  padding: 'var(--spacing-2xl)', 
                  textAlign: 'center',
                  border: '2px dashed var(--gray-200)'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'var(--gray-100)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--spacing-lg)'
                  }}>
                    <BarChart3 style={{ width: '2rem', height: '2rem', color: 'var(--gray-400)' }} />
                  </div>
                  <h3 className="text-heading-3" style={{ marginBottom: 'var(--spacing-sm)' }}>No insights available</h3>
                  <p className="text-body" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    Complete some workouts to see personalized insights and progress analysis!
                  </p>
                </div>
              ) : (
                <>
                  {/* Real streak insight */}
                  {progressStats.currentStreak > 0 && (
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: 'var(--warning)',
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 'var(--spacing-md)',
                          flexShrink: 0
                        }}>
                          <Flame style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className="text-heading-3" style={{ marginBottom: 'var(--spacing-xs)' }}>
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
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
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
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: 'var(--primary-100)',
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 'var(--spacing-md)',
                          flexShrink: 0
                        }}>
                          <Activity style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-600)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className="text-heading-3" style={{ marginBottom: 'var(--spacing-xs)' }}>Training Progress</h4>
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