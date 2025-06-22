import { Dumbbell, Heart, Target } from "lucide-react";
import styles from "./loading-screen.module.css";

interface LoadingScreenProps {
  message?: string;
  showIcons?: boolean;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  showIcons = true 
}: LoadingScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo Animation */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <Dumbbell className={styles.dumbbell} />
          </div>
        </div>

        {/* Floating Icons */}
        {showIcons && (
          <div className={styles.floatingIcons}>
            <div className={`${styles.floatingIcon} ${styles.icon1}`}>
              <Heart />
            </div>
            <div className={`${styles.floatingIcon} ${styles.icon2}`}>
              <Target />
            </div>
          </div>
        )}

        {/* Loading Message */}
        <p className={styles.message}>
          {message}
        </p>

        {/* Pulse Indicator */}
        <div className={styles.pulseContainer}>
          <div className={styles.pulseBar}></div>
        </div>
      </div>

      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>
    </div>
  );
}