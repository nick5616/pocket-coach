import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { CheckCircle, Clock, Weight, Flame } from "lucide-react";
import type { Workout } from "@shared/schema";
import styles from "./workout-card.module.css";

interface WorkoutCardProps {
  workout: Workout;
  onViewDetails: () => void;
}

export default function WorkoutCard({ workout, onViewDetails }: WorkoutCardProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown date";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateObj.toLocaleDateString();
  };

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown time";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid time";
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconContainer}>
              <CheckCircle className="h-5 w-5 text-success-green" />
            </div>
            <div>
              <h4 style={{fontWeight: "600", color: "var(--text-primary)"}}>{workout.name}</h4>
              <p className="text-xs text-gray-600">
                {formatDate(workout.createdAt!)} {workout.completedAt && `, ${formatTime(workout.completedAt)}`}
              </p>
            </div>
          </div>
          <div style={{textAlign: "right"}}>
            <div className="text-lg font-bold text-gray-900">
              {workout.duration ? `${workout.duration}m` : "--"}
            </div>
            <div className="text-xs text-gray-600">duration</div>
          </div>
        </div>

        {workout.notes && (
          <div className={styles.detailsContainer}>
            <div className="text-xs text-gray-700 mb-2">Workout Notes:</div>
            <p className="text-sm text-gray-900 line-clamp-2">{workout.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {workout.calories && (
              <div className="flex items-center text-xs text-gray-700">
                <Flame className="h-3 w-3 text-energetic-orange mr-1" />
                <span>{workout.calories} cal</span>
              </div>
            )}
            {workout.totalVolume && (
              <div className="flex items-center text-xs text-gray-700">
                <Weight className="h-3 w-3 text-gray-600 mr-1" />
                <span>{Math.round(workout.totalVolume).toLocaleString()} lbs</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-duolingo-blue hover:text-duolingo-blue/80"
          >
            View Details
          </Button>
        </div>

        {workout.isCompleted && workout.aiAnalysis && (
          <div className={styles.aiAnalysisSection}>
            <Badge variant="secondary" className={styles.aiAnalysisBadge}>
              <span className={styles.aiIcon}>🤖</span>
              AI Analysis Complete
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
