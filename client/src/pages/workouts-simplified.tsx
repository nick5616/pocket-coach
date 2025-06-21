import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import BottomNavigation from "@/components/bottom-navigation";
import WorkoutCard from "@/components/workout-card";
import { Search, Filter, Plus, Calendar, Clock } from "lucide-react";
import type { Workout } from "@shared/schema";

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "completed" | "in-progress">("all");
  const userId = 1; // Demo user

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading workouts...</div>
      </div>
    );
  }

  return (
    <>
      <main className="pb-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
              <p className="text-gray-600 mt-1">Track your fitness journey</p>
            </div>
            <Link href="/workout-journal">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Workout
              </Button>
            </Link>
          </div>
        </header>

        {/* Workout Stats */}
        <section className="px-4 py-6 bg-white border-b">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{workouts.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completedWorkouts.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{inProgressWorkouts.length}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="px-4 py-4 bg-white border-b">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={selectedFilter === "all" ? "primary" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
              >
                All ({workouts.length})
              </Button>
              <Button 
                variant={selectedFilter === "completed" ? "primary" : "outline"}
                onClick={() => setSelectedFilter("completed")}
                size="sm"
              >
                Done ({completedWorkouts.length})
              </Button>
              <Button 
                variant={selectedFilter === "in-progress" ? "primary" : "outline"}
                onClick={() => setSelectedFilter("in-progress")}
                size="sm"
              >
                Active ({inProgressWorkouts.length})
              </Button>
            </div>
          </div>
        </section>

        {/* Workouts List */}
        <section className="px-4 py-4">
          {filteredWorkouts.length > 0 ? (
            <div className="space-y-4">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onViewDetails={() => {
                    // Navigate to workout details
                    window.location.href = `/workout-journal/${workout.id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start your fitness journey by creating your first workout"
                }
              </p>
              {!searchTerm && selectedFilter === "all" && (
                <Link href="/workout-journal">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Workout
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </>
  );
}