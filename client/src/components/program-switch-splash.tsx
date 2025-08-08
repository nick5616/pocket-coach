import { useEffect } from "react";
import { Sparkles, CheckCircle, Zap } from "lucide-react";
import styles from "./splash-screen.module.css";

interface ProgramSwitchSplashProps {
  programName: string;
  onComplete: () => void;
}

export default function ProgramSwitchSplash({ programName, onComplete }: ProgramSwitchSplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <CheckCircle className={styles.successIcon} />
          <div className={styles.sparkles}>
            <Sparkles className={styles.sparkle} />
            <Sparkles className={`${styles.sparkle} ${styles.sparkle2}`} />
            <Zap className={`${styles.sparkle} ${styles.sparkle3}`} />
          </div>
        </div>
        
        <h2 className={styles.title}>Program Activated!</h2>
        <p className={styles.subtitle}>
          <strong>{programName}</strong> is now your active program
        </p>
        
        <div className={styles.checkmark}>
          <div className={styles.checkmarkStem}></div>
          <div className={styles.checkmarkKick}></div>
        </div>
      </div>
    </div>
  );
}