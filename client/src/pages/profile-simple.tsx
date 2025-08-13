import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Sun, Moon, Monitor, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import LoadingScreen from "../components/loading-screen";
import { useTheme } from "../components/theme-provider";
import { EffortTrackingSettings } from "../components/effort-tracking-settings";
import BottomNavigation from "../components/bottom-navigation";
import styles from "./profile-simple.module.css";
import type { User } from "@shared/schema";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  // Update user preferences mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { height?: number; weight?: number }) => {
      const response = await apiRequest("PATCH", "/api/auth/user/preferences", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const updateHeight = (value: string) => {
    const height = value ? parseInt(value) : undefined;
    if (height && height >= 36 && height <= 96) {
      updateUserMutation.mutate({ height });
    } else if (!value) {
      updateUserMutation.mutate({ height: undefined });
    }
  };

  const updateWeight = (value: string) => {
    const weight = value ? parseFloat(value) : undefined;
    if (weight && weight >= 50 && weight <= 500) {
      updateUserMutation.mutate({ weight });
    } else if (!value) {
      updateUserMutation.mutate({ weight: undefined });
    }
  };

  const handleLogout = async () => {
    try {
      // Clear React Query cache before logout
      queryClient.clear();
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Clear any client-side cache and redirect to root
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback to hard redirect
      window.location.href = '/api/logout';
    }
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
                onClick={() => {
                  console.log('Theme button clicked:', option.value);
                  setTheme(option.value as any);
                }}
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

          {/* Effort Tracking Settings */}
          <Card>
            <CardContent>
              <EffortTrackingSettings />
            </CardContent>
          </Card>

          {/* Physical Stats */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <UserIcon className={styles.iconMedium} />
                  Physical Stats
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                    Height
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="number"
                      value={user?.height || ""}
                      onChange={(e) => updateHeight(e.target.value)}
                      placeholder="inches"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                      min="36"
                      max="96"
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>in</span>
                  </div>
                  {user?.height && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      {Math.floor((user.height || 0) / 12)}' {(user.height || 0) % 12}"
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                    Weight
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="number"
                      value={user?.weight || ""}
                      onChange={(e) => updateWeight(e.target.value)}
                      placeholder="pounds"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                      min="50"
                      max="500"
                      step="0.1"
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>lbs</span>
                  </div>
                  {user?.weight && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      {(user.weight / 2.205).toFixed(1)} kg
                    </div>
                  )}
                </div>
              </div>
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