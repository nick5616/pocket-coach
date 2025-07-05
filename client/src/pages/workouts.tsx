import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar,
  Clock,
  Dumbbell,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  Timer,
  Weight
} from "lucide-react";
import LoadingScreen from "@/components/loading-screen";
import type { Workout, Exercise } from "@shared/schema";

interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in-progress">("all");

  const { data: workouts = [], isLoading } = useQuery<WorkoutWithExercises[]>({
    queryKey: ["/api/workouts"],
  });

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "completed" && workout.isCompleted) ||
      (filterStatus === "in-progress" && !workout.isCompleted);
    
    return matchesSearch && matchesFilter;
  });

  const completedWorkouts = workouts.filter((w) => w.isCompleted);
  const inProgressWorkouts = workouts.filter((w) => !w.isCompleted);

  if (isLoading) {
    return <LoadingScreen message="Loading your workouts..." />;
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 className="text-heading-2">Workout History</h1>
              <p className="text-body">Track your fitness journey</p>
            </div>
            <Link href="/workout-journal" className="btn btn-primary">
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              New Workout
            </Link>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
          {/* Search and Filter */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: 'var(--spacing-sm)', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: '1rem', 
                  height: '1rem',
                  color: 'var(--gray-400)'
                }} />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 2.5rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    background: 'white'
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "completed" | "in-progress")}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
              <div className="stat-card">
                <div className="stat-value">{workouts.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{completedWorkouts.length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{inProgressWorkouts.length}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
          </div>

          {/* Workout List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))
            ) : (
              <EmptyState searchTerm={searchTerm} filterStatus={filterStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkoutCard({ workout }: { workout: WorkoutWithExercises }) {
  const totalExercises = workout.exercises?.length || 0;
  const completedExercises = workout.exercises?.filter(e => e.isCompleted).length || 0;
  const duration = workout.duration ? Math.round(workout.duration / 60) : 0;

  return (
    <Link href={`/workouts/${workout.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ 
        padding: 'var(--spacing-lg)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ flex: 1 }}>
            <h3 className="text-heading-3" style={{ marginBottom: 'var(--spacing-xs)' }}>
              {workout.name || 'Untitled Workout'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <Calendar style={{ width: '0.875rem', height: '0.875rem', color: 'var(--gray-400)' }} />
                <span className="text-caption">
                  {new Date(workout.createdAt).toLocaleDateString()}
                </span>
              </div>
              {duration > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <Clock style={{ width: '0.875rem', height: '0.875rem', color: 'var(--gray-400)' }} />
                  <span className="text-caption">{duration}m</span>
                </div>
              )}
            </div>
          </div>
          
          {workout.isCompleted ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: 'var(--primary-50)',
              color: 'var(--primary-700)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} />
              Complete
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: 'var(--warning)',
              color: 'white',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              <Timer style={{ width: '0.875rem', height: '0.875rem' }} />
              In Progress
            </div>
          )}
        </div>

        {/* Exercise Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <Dumbbell style={{ width: '1rem', height: '1rem', color: 'var(--gray-400)' }} />
              <span className="text-body">{totalExercises} exercises</span>
            </div>
            {workout.totalVolume && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <Weight style={{ width: '1rem', height: '1rem', color: 'var(--gray-400)' }} />
                <span className="text-body">{Math.round(workout.totalVolume).toLocaleString()} lbs</span>
              </div>
            )}
          </div>

          {totalExercises > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <div style={{
                width: '3rem',
                height: '0.25rem',
                background: 'var(--gray-200)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(completedExercises / totalExercises) * 100}%`,
                  height: '100%',
                  background: workout.isCompleted ? 'var(--success)' : 'var(--warning)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span className="text-caption">
                {completedExercises}/{totalExercises}
              </span>
            </div>
          )}
        </div>

        {workout.notes && (
          <div style={{ 
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--primary-300)'
          }}>
            <p className="text-body" style={{ 
              fontStyle: 'italic',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {workout.notes}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ 
  searchTerm, 
  filterStatus 
}: { 
  searchTerm: string; 
  filterStatus: string; 
}) {
  const isFiltered = searchTerm || filterStatus !== "all";

  return (
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
        <Dumbbell style={{ width: '2rem', height: '2rem', color: 'var(--gray-400)' }} />
      </div>
      
      <h3 className="text-heading-3" style={{ marginBottom: 'var(--spacing-sm)' }}>
        {isFiltered ? "No workouts found" : "No workouts yet"}
      </h3>
      
      <p className="text-body" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {isFiltered 
          ? "Try adjusting your search or filter settings"
          : "Start your fitness journey by creating your first workout!"
        }
      </p>

      {!isFiltered && (
        <Link href="/workout-journal" className="btn btn-primary">
          <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Create First Workout
        </Link>
      )}
    </div>
  );
}