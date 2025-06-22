import { Badge } from "./Badge";
import { useMuscleGroups } from "../hooks/use-muscle-groups";

interface ExerciseMuscleGroupsProps {
  exerciseName: string;
  className?: string;
}

export function ExerciseMuscleGroups({ exerciseName, className = "" }: ExerciseMuscleGroupsProps) {
  const { data: muscleGroupsData, isLoading } = useMuscleGroups(exerciseName);

  if (isLoading) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!muscleGroupsData?.muscleGroups || muscleGroupsData.muscleGroups.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {muscleGroupsData.muscleGroups.map((muscle: string, idx: number) => (
        <Badge key={idx} variant="secondary" className="text-xs">
          {muscle}
        </Badge>
      ))}
    </div>
  );
}