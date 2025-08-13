import { useState, useEffect } from "react";
import { Badge } from "./Badge";
import { useMuscleGroups } from "../hooks/use-muscle-groups";
import styles from "./exercise-muscle-groups.module.css";

interface ExerciseMuscleGroupsProps {
  exerciseName: string;
  className?: string;
  isBodyweight?: boolean;
  baseWeight?: number;
  exerciseWeight?: number | null;
}

export function ExerciseMuscleGroups({ 
  exerciseName, 
  className = "",
  isBodyweight,
  baseWeight,
  exerciseWeight 
}: ExerciseMuscleGroupsProps) {
  const { data: muscleGroupsData, isLoading } = useMuscleGroups(exerciseName);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className={`${styles.loadingContainer} ${className}`}>
        <div className={`${styles.loadingSkeleton} ${styles.loadingSkeletonWide} ${isDark ? styles.dark : ''}`}></div>
        <div className={`${styles.loadingSkeleton} ${styles.loadingSkeletonNarrow} ${isDark ? styles.dark : ''}`}></div>
      </div>
    );
  }

  if (!muscleGroupsData?.muscleGroups || muscleGroupsData.muscleGroups.length === 0) {
    return null;
  }

  const getWeightDisplay = () => {
    if (isBodyweight) {
      return "Bodyweight";
    }
    if (baseWeight && baseWeight > 0) {
      const totalWeight = (exerciseWeight || 0) + baseWeight;
      return `${exerciseWeight || 0} + ${baseWeight} = ${totalWeight} lbs`;
    }
    return null;
  };

  const weightDisplay = getWeightDisplay();

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.muscleGroups}>
        {muscleGroupsData.muscleGroups.map((muscle: string, idx: number) => (
          <Badge key={idx} variant="secondary">
            {muscle}
          </Badge>
        ))}
      </div>
      {weightDisplay && (
        <div className={styles.weightInfo}>
          <span className={styles.weightText}>{weightDisplay}</span>
        </div>
      )}
    </div>
  );
}