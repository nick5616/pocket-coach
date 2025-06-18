import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/bottom-navigation";
import ProgressChart from "@/components/progress-chart";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  ChartLine,
  Flame,
  Zap,
  Trophy,
  Activity
} from "lucide-react";
import type { Workout, Goal } from "@shared/schema";

export default function Progress() {
  const [timeRange, setTimeRange] = useState("4w");
  const [selectedMetric, setSelectedMetric] = useState("volume");
  
  const userId = 1; // Mock user ID

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", { userId }],
    queryFn: () => fetch(`/api/workouts?userId=${userId}`).then(res => res.json()),
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals", { userId }],
    queryFn: () => fetch(`/api/goals?userId=${userId}`).then(res => res.json()),
  });

  // Calculate progress data
  const completedWorkouts = workouts.filter(w => w.isCompleted);
  
  const progressStats = {
    totalWorkouts: completedWorkouts.length,
    totalTime: completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    totalVolume: completedWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
    totalCalories: completedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
    currentStreak: 7, // Would be calculated from workout dates
    longestStreak: 12, // Would be calculated from historical data
  };

  // Generate chart data based on time range
  const generateChartData = (metric: string) => {
    const now = new Date();
    const daysBack = timeRange === "1w" ? 7 : timeRange === "4w" ? 28 : timeRange === "3m" ? 90 : 365;
    const data = [];

    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayWorkouts = completedWorkouts.filter(w => {
        const workoutDate = new Date(w.completedAt!);
        return workoutDate.toDateString() === date.toDateString();
      });

      let value = 0;
      switch (metric) {
        case "volume":
          value = dayWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
          break;
        case "duration":
          value = dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
          break;
        case "calories":
          value = dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
          break;
        case "workouts":
          value = dayWorkouts.length;
          break;
      }

      data.push({
        date: date.toISOString(),
        value: value,
      });
    }

    return data;
  };

  const chartData = generateChartData(selectedMetric);

  const getMetricUnit = () => {
    switch (selectedMetric) {
      case "volume": return " lbs";
      case "duration": return " min";
      case "calories": return " cal";
      case "workouts": return "";
      default: return "";
    }
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case "volume": return "#1CB0F6";
      case "duration": return "#58CC02";
      case "calories": return "#FF9600";
      case "workouts": return "#9C27B0";
      default: return "#58CC02";
    }
  };

  const progressInsights = [
    {
      type: "strength",
      title: "Strength Gains Detected",
      description: "Your bench press has improved 8% over the last 3 weeks",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-success-green",
      bgColor: "bg-success-green/10"
    },
    {
      type: "consistency",
      title: "Consistency Champion",
      description: "7 day workout streak! Keep the momentum going",
      icon: <Flame className="h-5 w-5" />,
      color: "text-energetic-orange",
      bgColor: "bg-energetic-orange/10"
    },
    {
      type: "volume",
      title: "Volume Milestone",
      description: "You've lifted over 50,000 lbs this month!",
      icon: <Zap className="h-5 w-5" />,
      color: "text-duolingo-blue",
      bgColor: "bg-duolingo-blue/10"
    }
  ];

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
        <section className="bg-gradient-to-r from-duolingo-green to-green-600 text-white px-4 py-6">
          <h2 className="text-xl font-bold mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{progressStats.totalWorkouts}</div>
              <div className="text-xs text-green-100">Total Workouts</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{Math.round(progressStats.totalTime / 60)}h</div>
              <div className="text-xs text-green-100">Time Trained</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">
                {progressStats.totalVolume > 0 ? `${Math.round(progressStats.totalVolume / 1000)}K` : "0"}
              </div>
              <div className="text-xs text-green-100">Volume (lbs)</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{progressStats.currentStreak}</div>
              <div className="text-xs text-green-100">Day Streak 🔥</div>
            </div>
          </div>
        </section>

        <Tabs defaultValue="charts" className="px-4 py-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6 mt-6">
            {/* Chart Controls */}
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">Last Week</SelectItem>
                  <SelectItem value="4w">Last 4 Weeks</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="calories">Calories</SelectItem>
                  <SelectItem value="workouts">Workouts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progress Chart */}
            <ProgressChart
              title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Progress`}
              data={chartData}
              color={getMetricColor()}
              unit={getMetricUnit()}
            />

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-energetic-orange" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-green/10 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-success-green/20 rounded-full flex items-center justify-center mr-3">
                      <Flame className="h-5 w-5 text-success-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Week Warrior</h4>
                      <p className="text-sm text-gray-600">7 day workout streak</p>
                    </div>
                  </div>
                  <Badge className="bg-success-green text-white">New!</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-duolingo-blue/20 rounded-full flex items-center justify-center mr-3">
                      <Activity className="h-5 w-5 text-duolingo-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Volume Master</h4>
                      <p className="text-sm text-gray-600">50K lbs lifted this month</p>
                    </div>
                  </div>
                  <Badge variant="secondary">3 days ago</Badge>
                </div>
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
                          <div className="w-10 h-10 bg-duolingo-green/10 rounded-lg flex items-center justify-center mr-3">
                            <Target className="h-5 w-5 text-duolingo-green" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            progress >= 80 ? "bg-success-green/10 text-success-green" :
                            progress >= 50 ? "bg-warning-orange/10 text-warning-orange" :
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
                            className="bg-duolingo-green h-2 rounded-full transition-all duration-300" 
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
            {progressInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={`w-10 h-10 ${insight.bgColor} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                      <span className={insight.color}>{insight.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* AI Insights */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <ChartLine className="h-5 w-5 mr-2" />
                  AI Pattern Analysis
                </h4>
                <p className="text-purple-100 text-sm mb-3">
                  Your workout intensity has been increasing steadily. Consider adding a deload week 
                  after 2 more sessions to prevent overtraining and optimize recovery.
                </p>
                <Badge className="bg-white/20 text-white">
                  Recommendation
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </>
  );
}
