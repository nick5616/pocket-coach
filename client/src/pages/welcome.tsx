import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Dumbbell, Target, TrendingUp, Users } from "lucide-react";
import styles from "@/styles/auth.module.css";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('pocket_coach_visited');
    if (hasVisited) {
      setIsReturningUser(true);
    }
  }, []);

  const handleGetStarted = () => {
    // Mark user as having visited
    localStorage.setItem('pocket_coach_visited', 'true');
    setLocation('/register');
  };

  const handleSignIn = () => {
    setLocation('/login');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeBrandContainer}>
            <Dumbbell className={styles.welcomeBrandIcon} />
            <h1 className={styles.welcomeTitle}>
              Pocket Coach
            </h1>
          </div>
          <p className={styles.welcomeDescription}>
            Transform your fitness journey with personalized workout programs, 
            intelligent tracking, and adaptive coaching that evolves with your progress.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          <Card className={styles.featureCard}>
            <CardHeader>
              <Target className={styles.featureIcon} />
              <CardTitle className={styles.featureTitle}>Smart Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={styles.featureDescription}>
                Custom workout programs tailored to your goals, experience level, and available equipment.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className={styles.featureCard}>
            <CardHeader>
              <TrendingUp className={styles.featureIcon} />
              <CardTitle className={styles.featureTitle}>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={styles.featureDescription}>
                Track your workouts, monitor progress, and get insights that help you reach your fitness goals faster.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className={styles.featureCard}>
            <CardHeader>
              <Users className={styles.featureIcon} />
              <CardTitle className={styles.featureTitle}>Personal Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className={styles.featureDescription}>
                Get personalized recommendations and adaptive programs that evolve with your fitness journey.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaContainer}>
          <Card className={styles.ctaCard}>
            <CardHeader>
              <CardTitle className={styles.formTitle}>
                {isReturningUser ? "Welcome Back!" : "Ready to Start?"}
              </CardTitle>
              <CardDescription className={styles.formDescription}>
                {isReturningUser 
                  ? "Sign in to continue your fitness journey or create a new account."
                  : "Join thousands of users transforming their fitness with personalized coaching."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.ctaActions}>
              <Button 
                onClick={handleGetStarted}
                className={styles.primaryButton}
                size="lg"
              >
                {isReturningUser ? "Create Account" : "Get Started Free"}
              </Button>
              
              {isReturningUser && (
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="lg"
                >
                  Sign In
                </Button>
              )}
              
              {!isReturningUser && (
                <p className={styles.authLinkText}>
                  Already have an account?{" "}
                  <button
                    onClick={handleSignIn}
                    className={styles.authLinkButton}
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className={styles.welcomeFooter}>
          <p className={styles.welcomeFooterText}>Start your transformation today • No equipment required • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}