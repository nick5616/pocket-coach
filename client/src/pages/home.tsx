import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  Play,
  Star,
  Flame,
  Award,
  Clock,
  Plus,
  ChevronRight,
} from "lucide-react";
import LoadingScreen from "../components/loading-screen";
import type { Workout, Goal } from "@shared/schema";

export default function Home() {
  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<
    Workout[]
  >({
    queryKey: ["/api/workouts"],
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: activeProgram } = useQuery({
    queryKey: ["/api/programs/active"],
  });

  const isLoading = workoutsLoading || goalsLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading your fitness journey..." />;
  }

  // Calculate today's stats
  const today = new Date().toDateString();
  const todaysWorkouts = workouts.filter(
    (w) => w.createdAt && new Date(w.createdAt).toDateString() === today,
  );

  const completedWorkouts = workouts.filter((w) => w.isCompleted);
  const currentStreak = 7; // Would be calculated from workout dates

  const todayStats = {
    workouts: todaysWorkouts.length,
    duration: todaysWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0),
    exercises: todaysWorkouts.reduce(
      (acc, w) => acc + (w.exercises?.length || 0),
      0,
    ),
  };

  const inProgressWorkout = workouts.find((w) => !w.isCompleted);

  return (
    <div>
      {/* Welcome Header */}
      <header
        style={{
          background:
            "linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)",
          color: "white",
          padding: "var(--spacing-xl) 0 var(--spacing-2xl)",
        }}
      >
        <div className="container">
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h1
              className="text-heading-1"
              style={{ color: "white", marginBottom: "var(--spacing-xs)" }}
            >
              Welcome back!
            </h1>
            <p
              className="text-body"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              Ready to crush your fitness goals today?
            </p>
          </div>

          {/* Streak Counter */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--spacing-lg)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: "var(--warning)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "var(--spacing-md)",
                  }}
                >
                  <Flame
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {currentStreak} Day Streak
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    Keep the momentum going!
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "var(--warning)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--spacing-xs) var(--spacing-sm)",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                ON FIRE
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="container" style={{ paddingTop: "var(--spacing-xl)" }}>
          {/* Resume Workout CTA */}
          {inProgressWorkout && (
            <div style={{ marginBottom: "var(--spacing-xl)" }}>
              <Link
                href={`/workout-journal/${inProgressWorkout.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 100%)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--spacing-lg)",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "var(--spacing-sm)",
                          }}
                        >
                          <Play
                            style={{
                              width: "1rem",
                              height: "1rem",
                              marginRight: "var(--spacing-xs)",
                              fill: "white",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Resume Workout
                          </span>
                        </div>
                        <h3
                          className="text-heading-3"
                          style={{
                            color: "white",
                            marginBottom: "var(--spacing-xs)",
                          }}
                        >
                          {inProgressWorkout.name || "Untitled Workout"}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.9)",
                          }}
                        >
                          Pick up where you left off
                        </p>
                      </div>
                      <ChevronRight
                        style={{
                          width: "1.5rem",
                          height: "1.5rem",
                          color: "white",
                        }}
                      />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      right: "-50%",
                      width: "200%",
                      height: "200%",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                      transform: "rotate(45deg)",
                    }}
                  />
                </div>
              </Link>
            </div>
          )}

          {/* Today's Stats */}
          <section style={{ marginBottom: "var(--spacing-xl)" }}>
            <h2
              className="text-heading-2"
              style={{ marginBottom: "var(--spacing-lg)" }}
            >
              Today's Progress
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "var(--spacing-sm)",
              }}
            >
              <div className="stat-card">
                <div className="stat-value">{todayStats.workouts}</div>
                <div className="stat-label">Workouts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {Math.round(todayStats.duration / 60)}
                </div>
                <div className="stat-label">Minutes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{todayStats.exercises}</div>
                <div className="stat-label">Exercises</div>
              </div>
            </div>
          </section>

          {/* Main Actions */}
          <section style={{ marginBottom: "var(--spacing-xl)" }}>
            <h2
              className="text-heading-2"
              style={{ marginBottom: "var(--spacing-lg)" }}
            >
              Quick Start
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-md)",
              }}
            >
              {activeProgram ? (
                <Link
                  href="/workout-journal"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card"
                    style={{
                      padding: "var(--spacing-md)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: "2px solid var(--primary-200)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "3rem",
                            height: "3rem",
                            background: "var(--primary-100)",
                            borderRadius: "var(--radius-xl)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "var(--spacing-md)",
                          }}
                        >
                          <Target
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              color: "var(--primary-600)",
                            }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-heading-3"
                            style={{ marginBottom: "var(--spacing-xs)" }}
                          >
                            Continue Program
                          </h3>
                          <p className="text-body">Today's scheduled workout</p>
                        </div>
                      </div>
                      <div
                        style={{
                          background: "var(--primary-500)",
                          color: "white",
                          borderRadius: "50%",
                          width: "2rem",
                          height: "2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Play
                          style={{
                            width: "0.875rem",
                            height: "0.875rem",
                            fill: "white",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/workout-journal"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card"
                    style={{
                      padding: "var(--spacing-md)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: "2px solid var(--primary-200)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "3rem",
                            height: "3rem",
                            background: "var(--primary-100)",
                            borderRadius: "var(--radius-xl)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "var(--spacing-md)",
                          }}
                        >
                          <Plus
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              color: "var(--primary-600)",
                            }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-heading-3"
                            style={{ marginBottom: "var(--spacing-xs)" }}
                          >
                            Start New Workout
                          </h3>
                          <p className="text-body">Create a custom session</p>
                        </div>
                      </div>
                      <div
                        style={{
                          background: "var(--primary-500)",
                          color: "white",
                          borderRadius: "50%",
                          width: "2rem",
                          height: "2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ChevronRight
                          style={{ width: "0.875rem", height: "0.875rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              <Link href="/programs" style={{ textDecoration: "none" }}>
                <div
                  className="card"
                  style={{
                    padding: "var(--spacing-md)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          background: "var(--secondary-100)",
                          borderRadius: "var(--radius-xl)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "var(--spacing-md)",
                        }}
                      >
                        <Calendar
                          style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            color: "var(--secondary-600)",
                          }}
                        />
                      </div>
                      <div>
                        <h3
                          className="text-heading-3"
                          style={{ marginBottom: "var(--spacing-xs)" }}
                        >
                          Browse Programs
                        </h3>
                        <p className="text-body">Structured training plans</p>
                      </div>
                    </div>
                    <ChevronRight
                      style={{
                        width: "1rem",
                        height: "1rem",
                        color: "var(--gray-400)",
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Goals Preview */}
          {goals.length > 0 && (
            <section style={{ marginBottom: "var(--spacing-xl)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--spacing-lg)",
                }}
              >
                <h2 className="text-heading-2">Active Goals</h2>
                <Link
                  href="/progress"
                  className="text-body"
                  style={{
                    color: "var(--primary-600)",
                    textDecoration: "none",
                  }}
                >
                  View All
                </Link>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-md)",
                }}
              >
                {goals.slice(0, 2).map((goal) => {
                  const progress = goal.targetValue
                    ? Math.min(
                        100,
                        (goal.currentValue! / goal.targetValue) * 100,
                      )
                    : 0;

                  return (
                    <div
                      key={goal.id}
                      className="card"
                      style={{ padding: "var(--spacing-lg)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "var(--spacing-md)",
                        }}
                      >
                        <h4 className="text-heading-3">{goal.title}</h4>
                        <div
                          style={{
                            background:
                              progress >= 80
                                ? "var(--success)"
                                : progress >= 50
                                  ? "var(--warning)"
                                  : "var(--gray-400)",
                            color: "white",
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {Math.round(progress)}%
                        </div>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "0.5rem",
                          background: "var(--gray-200)",
                          borderRadius: "var(--radius-sm)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            height: "100%",
                            background:
                              progress >= 80
                                ? "var(--success)"
                                : progress >= 50
                                  ? "var(--warning)"
                                  : "var(--gray-400)",
                            transition: "width 0.3s ease",
                            borderRadius: "var(--radius-sm)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recent Activity */}
          {completedWorkouts.length > 0 && (
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--spacing-lg)",
                }}
              >
                <h2 className="text-heading-2">Recent Workouts</h2>
                <Link
                  href="/workouts"
                  className="text-body"
                  style={{
                    color: "var(--primary-600)",
                    textDecoration: "none",
                  }}
                >
                  View All
                </Link>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-md)",
                }}
              >
                {completedWorkouts.slice(0, 3).map((workout) => (
                  <Link
                    key={workout.id}
                    href={`/workout-journal/${workout.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="card"
                      style={{
                        padding: "var(--spacing-lg)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              background: "var(--success)",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "var(--spacing-md)",
                            }}
                          >
                            <Dumbbell
                              style={{
                                width: "1.25rem",
                                height: "1.25rem",
                                color: "white",
                              }}
                            />
                          </div>
                          <div>
                            <h4
                              className="text-heading-3"
                              style={{ marginBottom: "var(--spacing-xs)" }}
                            >
                              {workout.name || "Untitled Workout"}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-md)",
                              }}
                            >
                              <span className="text-caption">
                                {workout.createdAt
                                  ? new Date(
                                      workout.createdAt,
                                    ).toLocaleDateString()
                                  : "No date"}
                              </span>
                              {workout.duration && (
                                <span className="text-caption">
                                  {Math.round(workout.duration / 60)}m
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          style={{
                            width: "1rem",
                            height: "1rem",
                            color: "var(--gray-400)",
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
