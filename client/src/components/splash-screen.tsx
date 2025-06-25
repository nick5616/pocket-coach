import { useEffect, useState } from "react";
import { Dumbbell, Heart, Target } from "lucide-react";
import styles from "./splash-screen.module.css";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 300);
    const timer2 = setTimeout(() => setStage(2), 800);
    const timer3 = setTimeout(() => setStage(3), 1300);
    const timer4 = setTimeout(() => setStage(4), 1800);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setLoadingComplete(true);
          setTimeout(() => setShowTapPrompt(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 25);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearInterval(progressTimer);
    };
  }, []);

  const handleTap = () => {
    if (loadingComplete && onComplete) {
      console.log('Splash screen tap to start');
      onComplete();
    }
  };

  return (
    <div className={styles.container} onClick={handleTap}>
      <div className={styles.content}>
        {/* Logo Animation */}
        <div className={`${styles.logoContainer} ${stage >= 1 ? styles.logoVisible : ''}`}>
          <div className={styles.logoIcon}>
            <Dumbbell className={styles.dumbbell} />
          </div>
          <h1 className={`${styles.logoText} ${stage >= 2 ? styles.logoTextVisible : ''}`}>
            Pocket<span className={styles.accent}>Coach</span>
          </h1>
        </div>

        {/* Floating Icons */}
        <div className={styles.floatingIcons}>
          <div className={`${styles.floatingIcon} ${styles.icon1} ${stage >= 2 ? styles.iconVisible : ''}`}>
            <Heart />
          </div>
          <div className={`${styles.floatingIcon} ${styles.icon2} ${stage >= 3 ? styles.iconVisible : ''}`}>
            <Target />
          </div>
        </div>

        {/* Tagline */}
        <p className={`${styles.tagline} ${stage >= 3 ? styles.taglineVisible : ''}`}>
          Your Personal Fitness Journey
        </p>

        {/* Progress Bar */}
        <div className={`${styles.progressContainer} ${stage >= 2 ? styles.progressVisible : ''}`}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {loadingComplete ? '' : 'Loading your workout experience...'}
          </p>
        </div>

        {/* Tap Prompt */}
        {showTapPrompt && (
          <div className={`${styles.tapPrompt} ${styles.tapPromptVisible}`}>
            <p>Tap anywhere to begin</p>
          </div>
        )}
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