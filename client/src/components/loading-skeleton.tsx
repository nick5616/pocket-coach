import styles from "./loading-skeleton.module.css";

interface LoadingSkeletonProps {
  variant?: "card" | "line" | "circle" | "button" | "workout" | "program";
  count?: number;
  height?: string;
  width?: string;
}

export default function LoadingSkeleton({ 
  variant = "line", 
  count = 1, 
  height,
  width 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.circle} style={{ width: '3rem', height: '3rem' }} />
              <div className={styles.cardHeaderText}>
                <div className={styles.line} style={{ width: '60%', height: '1.25rem' }} />
                <div className={styles.line} style={{ width: '80%', height: '1rem' }} />
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.line} style={{ width: '100%', height: '1rem' }} />
              <div className={styles.line} style={{ width: '75%', height: '1rem' }} />
              <div className={styles.line} style={{ width: '50%', height: '1rem' }} />
            </div>
          </div>
        );

      case "workout":
        return (
          <div className={styles.workoutCard}>
            <div className={styles.workoutHeader}>
              <div className={styles.line} style={{ width: '40%', height: '1.5rem' }} />
              <div className={styles.circle} style={{ width: '2rem', height: '2rem' }} />
            </div>
            <div className={styles.workoutStats}>
              <div className={styles.statItem}>
                <div className={styles.line} style={{ width: '3rem', height: '1rem' }} />
                <div className={styles.line} style={{ width: '2rem', height: '0.875rem' }} />
              </div>
              <div className={styles.statItem}>
                <div className={styles.line} style={{ width: '3rem', height: '1rem' }} />
                <div className={styles.line} style={{ width: '2rem', height: '0.875rem' }} />
              </div>
              <div className={styles.statItem}>
                <div className={styles.line} style={{ width: '3rem', height: '1rem' }} />
                <div className={styles.line} style={{ width: '2rem', height: '0.875rem' }} />
              </div>
            </div>
            <div className={styles.workoutButtons}>
              <div className={styles.button} style={{ width: '6rem', height: '2.5rem' }} />
              <div className={styles.button} style={{ width: '6rem', height: '2.5rem' }} />
            </div>
          </div>
        );

      case "program":
        return (
          <div className={styles.programCard}>
            <div className={styles.programHeader}>
              <div className={styles.line} style={{ width: '70%', height: '1.5rem' }} />
              <div className={styles.line} style={{ width: '40%', height: '1rem' }} />
            </div>
            <div className={styles.programContent}>
              <div className={styles.line} style={{ width: '100%', height: '1rem' }} />
              <div className={styles.line} style={{ width: '85%', height: '1rem' }} />
            </div>
            <div className={styles.programBadges}>
              <div className={styles.badge} style={{ width: '4rem', height: '1.5rem' }} />
              <div className={styles.badge} style={{ width: '5rem', height: '1.5rem' }} />
              <div className={styles.badge} style={{ width: '4.5rem', height: '1.5rem' }} />
            </div>
          </div>
        );

      case "circle":
        return (
          <div 
            className={styles.circle} 
            style={{ 
              width: width || '2rem', 
              height: height || '2rem' 
            }} 
          />
        );

      case "button":
        return (
          <div 
            className={styles.button} 
            style={{ 
              width: width || '6rem', 
              height: height || '2.5rem' 
            }} 
          />
        );

      default:
        return (
          <div 
            className={styles.line} 
            style={{ 
              width: width || '100%', 
              height: height || '1rem' 
            }} 
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.item}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}