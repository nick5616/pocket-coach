import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ArrowLeft, Dumbbell, Target, Clock, Zap } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import LoadingSkeleton from "@/components/loading-skeleton";
import styles from "./home.module.css";

interface TodayWorkout {
  program: {
    id: number;
    name: string;
    description: string;
  };
  todayWorkout: {
    dayNumber: number;
    name: string;
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      restTime: number;
      notes?: string;
    }>;
  };
  progress: {
    completedDays: number;
    totalDays: number;
    streak: number;
  };
}

export default function WorkoutProgram() {
  const [, setLocation] = useLocation();

  const { data: todayWorkout, isLoading } = useQuery<TodayWorkout>({
    queryKey: ['/api/programs/active/today'],
  });

  const handleStartWorkout = () => {
    if (!todayWorkout) return;
    
    const params = new URLSearchParams({
      name: todayWorkout.todayWorkout.name,
      programId: todayWorkout.program.id.toString(),
      date: new Date().toISOString().split('T')[0]
    });
    setLocation(`/workout?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className={`${styles.container} page`}>
          <LoadingSkeleton />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!todayWorkout) {
    return (
      <div className="app-container">
        <div className={`${styles.container} page`}>
          <Card className={styles.mainCard}>
            <CardContent style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Target style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#9ca3af' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No Active Program
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                You don't have an active program to continue
              </p>
              <Button
                onClick={() => setLocation("/programs")}
                variant="primary"
              >
                View Programs
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className={`${styles.container} page`}>
        <div className={styles.header}>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            size="sm"
            className={styles.backButton}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Back
          </Button>
        </div>

        <Card className={styles.mainCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Dumbbell className={styles.titleIcon} />
              {todayWorkout.todayWorkout.name}
            </CardTitle>
            <p className={styles.cardDescription}>
              {todayWorkout.program.name} • Day {todayWorkout.todayWorkout.dayNumber}
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Progress Stats */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Badge variant="outline">
                  <Target style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {todayWorkout.progress.completedDays}/{todayWorkout.progress.totalDays} Days
                </Badge>
                <Badge variant="outline">
                  <Zap style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {todayWorkout.progress.streak} Day Streak
                </Badge>
              </div>

              {/* Today's Workout Preview */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                  Today's Exercises ({todayWorkout.todayWorkout.exercises.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {todayWorkout.todayWorkout.exercises.slice(0, 4).map((exercise, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                          {exercise.name}
                        </div>
                        {exercise.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {exercise.notes}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        <span>{exercise.sets} sets</span>
                        <span>•</span>
                        <span>{exercise.reps} reps</span>
                        <Clock style={{ width: '0.75rem', height: '0.75rem', marginLeft: '0.25rem' }} />
                        <span>{exercise.restTime}s</span>
                      </div>
                    </div>
                  ))}
                  
                  {todayWorkout.todayWorkout.exercises.length > 4 && (
                    <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                      +{todayWorkout.todayWorkout.exercises.length - 4} more exercises
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <Button
                  onClick={handleStartWorkout}
                  size="lg"
                  variant="primary"
                  style={{ width: '100%', padding: '1rem' }}
                >
                  <Dumbbell style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Continue {todayWorkout.todayWorkout.name}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}