import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Weight, Flame } from "lucide-react";
import type { Workout } from "@shared/schema";

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
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success-green/10 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-success-green" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{workout.name}</h4>
              <p className="text-xs text-gray-500">
                {formatDate(workout.createdAt!)} {workout.completedAt && `, ${formatTime(workout.completedAt)}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {workout.duration ? `${workout.duration}m` : "--"}
            </div>
            <div className="text-xs text-gray-500">duration</div>
          </div>
        </div>

        {workout.notes && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="text-xs text-gray-600 mb-2">Workout Notes:</div>
            <p className="text-sm text-gray-800 line-clamp-2">{workout.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {workout.calories && (
              <div className="flex items-center text-xs text-gray-500">
                <Flame className="h-3 w-3 text-energetic-orange mr-1" />
                <span>{workout.calories} cal</span>
              </div>
            )}
            {workout.totalVolume && (
              <div className="flex items-center text-xs text-gray-500">
                <Weight className="h-3 w-3 text-gray-400 mr-1" />
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
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Badge variant="secondary" className="bg-duolingo-green/10 text-duolingo-green">
              <span className="mr-1">🤖</span>
              AI Analysis Complete
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
