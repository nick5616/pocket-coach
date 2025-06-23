import { useState, useEffect } from "react";
import { Badge } from "./Badge";
import { useMuscleGroups } from "../hooks/use-muscle-groups";
import styles from "./exercise-muscle-groups.module.css";

interface ExerciseMuscleGroupsProps {
  exerciseName: string;
  className?: string;
}

export function ExerciseMuscleGroups({ exerciseName, className = "" }: ExerciseMuscleGroupsProps) {
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

  return (
    <div className={`${styles.container} ${className}`}>
      {muscleGroupsData.muscleGroups.map((muscle: string, idx: number) => (
        <Badge key={idx} variant="secondary">
          {muscle}
        </Badge>
      ))}
    </div>
  );
}