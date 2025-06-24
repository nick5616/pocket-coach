import { Button } from "./Button";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import styles from "./marketing-fallback.module.css";

interface MarketingFallbackProps {
  onStartTrial: () => void;
}

export default function MarketingFallback({ onStartTrial }: MarketingFallbackProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.icon}>🏋️‍♂️</div>
          <h1 className={styles.title}>Pocket Coach</h1>
          <p className={styles.subtitle}>AI-Powered Personal Fitness Trainer</p>
        </div>

        <div className={styles.features}>
          <Card className={styles.featureCard}>
            <CardHeader>
              <CardTitle className={styles.featureTitle}>🧠 Smart Workout Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={styles.featureText}>
                Get personalized insights and recommendations powered by advanced AI
              </p>
            </CardContent>
          </Card>

          <Card className={styles.featureCard}>
            <CardHeader>
              <CardTitle className={styles.featureTitle}>📊 Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={styles.featureText}>
                Visual progress monitoring with detailed muscle group heat maps
              </p>
            </CardContent>
          </Card>

          <Card className={styles.featureCard}>
            <CardHeader>
              <CardTitle className={styles.featureTitle}>📱 Mobile-First PWA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={styles.featureText}>
                Install on your phone for a native app experience
              </p>
            </CardContent>
          </Card>
        </div>

        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to transform your fitness journey?</h2>
          <p className={styles.ctaDescription}>
            Start tracking workouts, setting goals, and getting AI-powered recommendations today.
          </p>
          <Button onClick={onStartTrial} size="lg" className={styles.ctaButton}>
            Start Your Free Trial
          </Button>
          <p className={styles.disclaimer}>
            No credit card required • Full access • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}