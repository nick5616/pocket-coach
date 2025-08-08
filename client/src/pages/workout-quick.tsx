import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { ArrowLeft, Dumbbell, Calendar, Clock } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import styles from "./home.module.css";

export default function WorkoutQuick() {
  const [, setLocation] = useLocation();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Format date to show current date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return isToday ? "Today" : date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartWorkout = () => {
    const params = new URLSearchParams({
      name: workoutName || "Quick Workout",
      date: selectedDate
    });
    setLocation(`/workout?${params.toString()}`);
  };

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
              Quick Workout
            </CardTitle>
            <p className={styles.cardDescription}>
              Start a flexible workout session with any exercises you choose
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className={styles.formLabel}>
                  Workout Name (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Upper Body Push, Leg Day, etc."
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className={styles.input}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Leave blank for AI to generate a name based on your exercises
                </p>
              </div>

              <div>
                <label className={styles.formLabel}>
                  <Calendar style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} />
                  Workout Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={styles.input}
                />
                <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: '500' }}>
                  {formatDate(selectedDate)}
                </p>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <Button
                  onClick={handleStartWorkout}
                  size="lg"
                  variant="primary"
                  style={{ width: '100%', padding: '1rem' }}
                >
                  <Dumbbell style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Start Quick Workout
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