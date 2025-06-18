import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/bottom-navigation";
import WorkoutCard from "@/components/workout-card";
import { Search, Filter, Plus, Calendar, Clock } from "lucide-react";
import type { Workout } from "@shared/schema";

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Mock user data
  const userId = 1;

  const { data: workouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", { userId }],
    queryFn: () => fetch(`/api/workouts?userId=${userId}`).then(res => res.json()),
  });

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (workout.notes && workout.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "completed" && workout.isCompleted) ||
                         (selectedFilter === "in-progress" && !workout.isCompleted);
    
    return matchesSearch && matchesFilter;
  });

  const completedWorkouts = workouts.filter(w => w.isCompleted);
  const inProgressWorkouts = workouts.filter(w => !w.isCompleted);

  const workoutStats = {
    total: workouts.length,
    completed: completedWorkouts.length,
    totalTime: completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    totalVolume: completedWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
          <h1 className="text-lg font-bold text-gray-900">My Workouts</h1>
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
        <h1 className="text-lg font-bold text-gray-900">My Workouts</h1>
      </header>

      <main className="pb-20">
        {/* Stats Overview */}
        <section className="px-4 py-6" style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
          color: 'white'
        }}>
          <h2 className="text-xl font-bold mb-4" style={{color: '#ffffff'}}>Workout Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(30, 64, 175, 0.7)',
              border: '1px solid rgba(59, 130, 246, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{workoutStats.completed}</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Completed</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(30, 64, 175, 0.7)',
              border: '1px solid rgba(59, 130, 246, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{Math.round(workoutStats.totalTime / 60)}h</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Total Time</div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="px-4 py-4 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({workouts.length})</TabsTrigger>
                <TabsTrigger value="completed">Done ({completedWorkouts.length})</TabsTrigger>
                <TabsTrigger value="in-progress">Active ({inProgressWorkouts.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Workouts List */}
        <section className="px-4">
          {filteredWorkouts.length > 0 ? (
            <div className="space-y-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onViewDetails={() => {
                    // Navigate to workout details
                    window.location.href = `/workouts/${workout.id}`;
                  }}
                />
              ))}
            </div>
          ) : workouts.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts yet</h3>
                <p className="text-gray-500 mb-4">
                  Start tracking your fitness journey by logging your first workout!
                </p>
                <Link href="/workout-journal">
                  <Button className="bg-duolingo-green hover:bg-duolingo-green/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Start First Workout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filter criteria.
                </p>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedFilter("all"); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
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
    </>
  );
}
