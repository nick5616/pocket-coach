import { Sparkles, Dumbbell, Target, Calendar } from "lucide-react";
import styles from "./program-generation-loading.module.css";

export default function ProgramGenerationLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.iconContainer}>
          <Sparkles className={styles.mainIcon} />
          <div className={styles.floatingIcons}>
            <Dumbbell className={styles.floatingIcon} />
            <Target className={`${styles.floatingIcon} ${styles.floatingIcon2}`} />
            <Calendar className={`${styles.floatingIcon} ${styles.floatingIcon3}`} />
          </div>
        </div>
        
        <h2 className={styles.title}>Creating Your Program</h2>
        <p className={styles.subtitle}>Our AI is analyzing your goals and designing a personalized workout program</p>
        
        <div className={styles.progressSteps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>✓</div>
            <span>Understanding your goals</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>⚡</div>
            <span>Selecting optimal exercises</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>📊</div>
            <span>Structuring your program</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>🎯</div>
            <span>Finalizing your plan</span>
          </div>
        </div>
        
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill}></div>
        </div>
        
        <p className={styles.note}>This usually takes 10-15 seconds</p>
      </div>
    </div>
  );
}