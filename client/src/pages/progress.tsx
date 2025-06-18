import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BottomNavigation from "@/components/bottom-navigation";
import BodyVisualization from "@/components/body-visualization";
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
  const [selectedMuscles, setSelectedMuscles] = useState<number[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [showMuscleDetails, setShowMuscleDetails] = useState(false);
  
  const userId = 1;

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", { userId }],
    queryFn: () => fetch(`/api/workouts?userId=${userId}`).then(res => res.json()),
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals", { userId }],
    queryFn: () => fetch(`/api/goals?userId=${userId}`).then(res => res.json()),
  });

  const { data: muscleProgress, isLoading: progressLoading } = useQuery<MuscleProgress>({
    queryKey: ["/api/muscle-groups", selectedMuscle?.id, "progress", userId],
    queryFn: async () => {
      if (!selectedMuscle) return null;
      const response = await fetch(`/api/muscle-groups/${selectedMuscle.id}/progress?userId=${userId}`);
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
    currentStreak: 7, // Would be calculated from workout dates
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

  if (workoutsLoading) {
    return (
      <div className="pb-20">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
          <h1 className="text-lg font-bold text-gray-900">Progress</h1>
        </header>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32 loading-shimmer"></div>
          ))}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
        <h1 className="text-lg font-bold text-gray-900">Progress</h1>
      </header>

      <main className="pb-20">
        {/* Stats Overview */}
        <section className="px-4 py-6" style={{
          background: 'linear-gradient(135deg, #65a30d 0%, #16a34a 100%)',
          color: 'white'
        }}>
          <h2 className="text-xl font-bold mb-4" style={{color: '#ffffff'}}>Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{progressStats.totalWorkouts}</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Total Workouts</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{Math.round(progressStats.totalTime / 60)}h</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Time Trained</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>
                {progressStats.totalVolume > 0 ? `${Math.round(progressStats.totalVolume / 1000)}K` : "0"}
              </div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Volume (lbs)</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{progressStats.currentStreak}</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Day Streak</div>
            </div>
          </div>
        </section>

        <Tabs defaultValue="body" className="px-4 py-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="body">Body Map</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="space-y-6 mt-6">
            {/* Body Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Muscle Group Progress
                  </span>
                  {selectedMuscles.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMuscles([])}
                    >
                      Clear Selection
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BodyVisualization
                  userId={userId}
                  onMuscleSelect={handleMuscleSelect}
                  selectedMuscles={selectedMuscles}
                />
                
                {selectedMuscles.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Muscle Groups</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMuscles.map(muscleId => (
                        <Badge key={muscleId} variant="secondary">
                          Muscle {muscleId}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => {
                        // TODO: Integrate with AI program generation
                        console.log("Generate program for muscles:", selectedMuscles);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Program for Selected Muscles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => {
                    // TODO: Navigate to workout creation with muscle focus
                  }}
                >
                  <span className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Targeted Workout
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => {
                    // TODO: Navigate to goal creation
                  }}
                >
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Set Muscle Group Goal
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4 mt-6">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = goal.targetValue ? 
                  Math.min(100, (goal.currentValue! / goal.targetValue) * 100) : 0;
                
                return (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <Target className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            progress >= 80 ? "bg-green-100 text-green-600" :
                            progress >= 50 ? "bg-orange-100 text-orange-600" :
                            "bg-gray-100 text-gray-600"
                          }
                        >
                          {Math.round(progress)}%
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-3">{goal.description}</p>
                      )}

                      {goal.targetDate && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals set</h3>
                  <p className="text-gray-500 mb-4">
                    Set fitness goals to track your progress and stay motivated!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-green-600"><TrendingUp className="h-5 w-5" /></span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Strength Gains Detected</h4>
                    <p className="text-sm text-gray-600">Your bench press has improved 8% over the last 3 weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-orange-600"><Flame className="h-5 w-5" /></span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Consistency Champion</h4>
                    <p className="text-sm text-gray-600">7 day workout streak! Keep the momentum going</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-blue-600"><Zap className="h-5 w-5" /></span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Volume Milestone</h4>
                    <p className="text-sm text-gray-600">You've lifted over 50,000 lbs this month!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  AI Pattern Analysis
                </h4>
                <p className="text-purple-100 text-sm mb-3">
                  Your workout intensity has been increasing steadily. Consider adding a deload week to prevent overtraining.
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    Strength Focus
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Progressive Overload
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Muscle Details Modal */}
      <Dialog open={showMuscleDetails} onOpenChange={setShowMuscleDetails}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{selectedMuscle?.displayName} Progress</DialogTitle>
          </DialogHeader>
          
          {selectedMuscle && (
            <div className="space-y-4">
              {progressLoading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : muscleProgress ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{muscleProgress.frequency}</div>
                      <div className="text-xs text-gray-500">Workouts</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {muscleProgress.volume > 0 ? `${Math.round(muscleProgress.volume / 1000)}K` : "0"}
                      </div>
                      <div className="text-xs text-gray-500">Volume (lbs)</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Training Intensity</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(muscleProgress.intensity * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${muscleProgress.intensity * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Last trained: {formatLastWorked(muscleProgress.lastWorked)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleMuscleToggle(selectedMuscle);
                        setShowMuscleDetails(false);
                      }}
                    >
                      Add to Selection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Set goal for this muscle group
                      }}
                    >
                      <Target className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  No progress data available
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </>
  );
}