import styles from "./demo-banner.module.css";

interface DemoBannerProps {
  onStartTrial?: () => void;
}

export default function DemoBanner({ onStartTrial }: DemoBannerProps) {
  const handleStartTrial = () => {
    if (onStartTrial) {
      onStartTrial();
    } else {
      // Open in new tab for full experience
      window.open(window.location.origin, '_blank');
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>💪</div>
        <div className={styles.text}>
          <h3 className={styles.title}>You're viewing the demo version</h3>
          <p className={styles.description}>
            Experience the full power of AI-powered fitness tracking with your own account
          </p>
        </div>
        <button onClick={handleStartTrial} className={styles.ctaButton}>
          Start Free Trial
        </button>
      </div>
    </div>
  );
}