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

  const handleStartWorkout = () => {
    // Navigate to workout creation or journal
    window.location.href = '/workout-journal';
  };

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
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(to right, #059669, #2563eb)",
        color: "white",
        padding: "1.5rem"
      }}>
        <div style={{ maxWidth: "28rem", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem"
          }}>
            Welcome back, {user?.firstName || user?.email || 'Coach'}!
          </h1>
          <p style={{ color: "#bbf7d0" }}>Ready for today's workout?</p>
        </div>
      </div>

      <div style={{
        maxWidth: "28rem",
        margin: "0 auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        {/* Today's Stats */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          padding: "1.5rem"
        }}>
          <h2 style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "1rem"
          }}>Today's Progress</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#059669"
              }}>{todayStats.exercises}</div>
              <div style={{
                fontSize: "0.875rem",
                color: "#6b7280"
              }}>Exercises</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#2563eb"
              }}>{todayStats.workouts}</div>
              <div style={{
                fontSize: "0.875rem",
                color: "#6b7280"
              }}>Workouts</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#7c3aed"
              }}>{todayStats.duration}m</div>
              <div style={{
                fontSize: "0.875rem",
                color: "#6b7280"
              }}>Minutes</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          <h2 style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1f2937"
          }}>Quick Actions</h2>
          
          <button style={{
            width: "100%",
            backgroundColor: "#059669",
            color: "white",
            padding: "1rem",
            borderRadius: "0.5rem",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }} onClick={handleStartWorkout}>
            <Dumbbell size={20} />
            <span>Start New Workout</span>
          </button>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem"
          }}>
            <button style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}>
              <Target size={16} />
              <span>Goals</span>
            </button>
            <button style={{
              backgroundColor: "#7c3aed",
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}>
              <TrendingUp size={16} />
              <span>Progress</span>
            </button>
          </div>
        </div>

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            padding: "1.5rem"
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "1rem"
            }}>Recent Workouts</h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}>
              {workouts.slice(0, 3).map((workout: any) => (
                <div key={workout.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem"
                }}>
                  <div>
                    <div style={{
                      fontWeight: "500",
                      color: "#1f2937"
                    }}>{workout.name}</div>
                    <div style={{
                      fontSize: "0.875rem",
                      color: "#6b7280"
                    }}>
                      {workout.exercises?.length || 0} exercises • {workout.duration || 0}m
                    </div>
                  </div>
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#9ca3af"
                  }}>
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Goals */}
        {goals.length > 0 && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            padding: "1.5rem"
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "1rem"
            }}>Active Goals</h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}>
              {goals.slice(0, 2).map((goal: any) => (
                <div key={goal.id} style={{
                  padding: "0.75rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem"
                }}>
                  <div style={{
                    fontWeight: "500",
                    color: "#1f2937"
                  }}>{goal.title}</div>
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginTop: "0.25rem"
                  }}>{goal.description}</div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "0.5rem"
                  }}>
                    <div style={{
                      flex: "1",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "9999px",
                      height: "0.5rem"
                    }}>
                      <div style={{
                        backgroundColor: "#059669",
                        height: "0.5rem",
                        borderRadius: "9999px",
                        width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`
                      }}></div>
                    </div>
                    <span style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#6b7280"
                    }}>
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
      <div style={{ height: "5rem" }}></div>
    </div>
  );
}