import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, Target, TrendingUp, Calendar } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  const { data: workouts = [] } = useQuery({
    queryKey: ["/api/workouts"],
    queryFn: async () => {
      const response = await fetch("/api/workouts?limit=5", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch workouts");
      return response.json();
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    },
  });

  const todayStats = {
    exercises: workouts.filter(w => 
      new Date(w.createdAt).toDateString() === new Date().toDateString()
    ).reduce((acc, w) => acc + (w.exercises?.length || 0), 0),
    workouts: workouts.filter(w => 
      new Date(w.createdAt).toDateString() === new Date().toDateString()
    ).length,
    duration: workouts.filter(w => 
      new Date(w.createdAt).toDateString() === new Date().toDateString()
    ).reduce((acc, w) => acc + (w.duration || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Coach'}!
          </h1>
          <p className="text-green-100">Ready for today's workout?</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Today's Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Progress</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayStats.exercises}</div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todayStats.workouts}</div>
              <div className="text-sm text-gray-600">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{todayStats.duration}m</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          
          <button className="w-full bg-green-600 text-white p-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-green-700 transition-colors">
            <Dumbbell className="h-5 w-5" />
            <span className="font-medium">Start New Workout</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
              <Target className="h-4 w-4" />
              <span className="text-sm">Goals</span>
            </button>
            <button className="bg-purple-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Progress</span>
            </button>
          </div>
        </div>

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Workouts</h2>
            <div className="space-y-3">
              {workouts.slice(0, 3).map((workout: any) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{workout.name}</div>
                    <div className="text-sm text-gray-600">
                      {workout.exercises?.length || 0} exercises • {workout.duration || 0}m
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Goals */}
        {goals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Goals</h2>
            <div className="space-y-3">
              {goals.slice(0, 2).map((goal: any) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800">{goal.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{goal.description}</div>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{
                          width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {goal.currentValue}/{goal.targetValue} {goal.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="h-20"></div>
    </div>
  );
}