import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Monitor, LogOut, Settings } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import LoadingScreen from "../components/loading-screen";
import { useTheme } from "../components/theme-provider";
import BottomNavigation from "../components/bottom-navigation";
import styles from "./profile-simple.module.css";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const ThemeToggle = () => {
    const themeOptions = [
      { value: "light", label: "Light", icon: Sun },
      { value: "dark", label: "Dark", icon: Moon },
      { value: "system", label: "System", icon: Monitor },
    ];

    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--text-primary)" }}>Theme Preference</h3>
        <div className={styles.themeGrid}>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as any)}
                className={`${styles.themeButton} ${theme === option.value ? styles.themeButtonActive : ""}`}
              >
                <Icon className={styles.iconMedium} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text-primary)" }}>Profile</h1>
        </div>
      </div>
      
      <div className={styles.pageContent}>
        <div className={`${styles.container} ${styles.spaceY6} ${styles.py6}`}>
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className={styles.userInfoHeader}>
                  <div className={styles.userAvatar}>
                    <span>
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.userInfo}>
                    <h2>{user?.email}</h2>
                    <p>PocketCoach Member</p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Settings className={styles.iconMedium} />
                  App Settings
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            <Card>
              <CardContent style={{ padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-600)" }}>5</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Workouts This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-600)" }}>12</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Day Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className={styles.logoutButton}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <LogOut style={{ width: "1rem", height: "1rem" }} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}