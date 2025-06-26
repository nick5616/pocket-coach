import { Dumbbell } from "lucide-react";
import styles from "./splash-screen.module.css";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  // Auto-complete after 2 seconds
  setTimeout(() => {
    if (onComplete) {
      console.log('Splash screen auto-complete');
      onComplete();
    }
  }, 2000);

  const handleClick = () => {
    if (onComplete) {
      console.log('Splash screen tap to start');
      onComplete();
    }
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <Dumbbell className={styles.dumbbell} />
          </div>
          <h1 className={styles.logoText}>
            Pocket<span className={styles.accent}>Coach</span>
          </h1>
        </div>
        <p className={styles.tagline}>
          Your Personal Fitness Journey
        </p>
        <div className={styles.loadingText}>
          Loading muscle targeting system...
        </div>
      </div>
    </div>
  );
}