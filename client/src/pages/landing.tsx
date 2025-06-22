import { useState, useEffect } from "react";
import { Dumbbell, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import styles from "./landing.module.css";

export default function Landing() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ''}`}>
      <div className={styles.content}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.iconContainer}>
            <div className={styles.iconBackground}>
              <Dumbbell className={styles.icon} />
            </div>
          </div>
          <h1 className={styles.title}>
            Pocket Coach
          </h1>
          <p className={styles.subtitle}>
            Your intelligent fitness companion that transforms workout tracking into personalized coaching
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className={styles.button}
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureHeader}>
              <div className={`${styles.featureIconBackground} ${styles.ai}`}>
                <Zap className={`${styles.featureIcon} ${styles.ai}`} />
              </div>
              <h3 className={styles.featureTitle}>AI-Powered Analysis</h3>
            </div>
            <p className={styles.featureDescription}>
              Get personalized insights and recommendations based on your workout patterns and goals
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureHeader}>
              <div className={`${styles.featureIconBackground} ${styles.goal}`}>
                <Target className={`${styles.featureIcon} ${styles.goal}`} />
              </div>
              <h3 className={styles.featureTitle}>Goal Tracking</h3>
            </div>
            <p className={styles.featureDescription}>
              Set meaningful fitness goals and track your progress with detailed analytics
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureHeader}>
              <div className={`${styles.featureIconBackground} ${styles.progress}`}>
                <TrendingUp className={`${styles.featureIcon} ${styles.progress}`} />
              </div>
              <h3 className={styles.featureTitle}>Progress Visualization</h3>
            </div>
            <p className={styles.featureDescription}>
              Watch your strength and fitness improve with intuitive charts and muscle group heatmaps
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Ready to transform your fitness journey?</p>
        </div>
      </div>
    </div>
  );
}