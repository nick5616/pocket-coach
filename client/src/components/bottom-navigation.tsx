import { Link, useLocation } from "wouter";
import { Home, Dumbbell, BarChart3, PenTool, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Workout } from "@shared/schema";
import styles from "./bottom-navigation.module.css";

export default function BottomNavigation() {
  const [location] = useLocation();
  
  // Check if there's an active workout (check all workouts, not just recent ones)
  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", { limit: 100 }],
  });
  
  const hasActiveWorkout = workouts.some((w) => !w.isCompleted);

  const navItems = [
    { 
      path: "/", 
      icon: Home, 
      label: "Home",
      svgClass: styles.homeSvg,
      svgPath: "M2 8c0-1 1-2 2-2h0.5c1 0 2 1 2 2v4c0 1-1 2-2 2H4c-1 0-2-1-2-2V8z M8 6c0-1 1-2 2-2h4c1 0 2 1 2 2v8c0 1-1 2-2 2h-4c-1 0-2-1-2-2V6z M20 4c0-1 1-2 2-2h4c1 0 2 1 2 2v12c0 1-1 2-2 2h-4c-1 0-2-1-2-2V4z",
      gradient: "homeGradient",
      isWorkoutTab: false
    },
    { 
      path: "/workout-journal", 
      icon: PenTool, 
      label: "Workout",
      svgClass: styles.workoutSvg,
      svgPath: "M6 2c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z M14 6c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z M22 4c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z",
      gradient: "workoutGradient",
      isWorkoutTab: true
    },
    { 
      path: "/workouts", 
      icon: Dumbbell, 
      label: "History",
      svgClass: styles.historySvg,
      svgPath: "M2 8 Q6 4 12 8 Q18 12 24 8 Q30 4 36 8 Q42 12 48 8",
      gradient: "historyGradient",
      isWorkoutTab: false
    },
    { 
      path: "/progress", 
      icon: BarChart3, 
      label: "Progress",
      svgClass: styles.progressSvg,
      svgPath: "M4 12h4v4H4z M12 8h4v8h-4z M20 4h4v12h-4z M28 10h4v6h-4z M36 6h4v10h-4z",
      gradient: "progressGradient",
      isWorkoutTab: false
    },
    { 
      path: "/profile", 
      icon: User, 
      label: "Profile",
      svgClass: styles.profileSvg,
      svgPath: "M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12s5.4 12 12 12 12-5.4 12-12z M16 8c0-2.2-1.8-4-4-4s-4 1.8-4 4 1.8 4 4 4 4-1.8 4-4z M32 16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z",
      gradient: "profileGradient",
      isWorkoutTab: false
    },
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.navList}>
        {navItems.map(({ path, icon: Icon, label, svgClass, svgPath, gradient, isWorkoutTab }, index) => {
          const isActive = location === path;
          const showActiveWorkoutIndicator = isWorkoutTab && hasActiveWorkout;
          return (
            <Link
              key={path}
              href={path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""} ${showActiveWorkoutIndicator ? styles.navItemWorkoutActive : ""}`}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <div className={styles.navSvgContainer}>
                <svg 
                  className={svgClass}
                  viewBox="0 0 100 8" 
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id={`${gradient}-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={index === 0 ? "#22c55e" : index === 1 ? "#f59e0b" : index === 2 ? "#8b5cf6" : index === 3 ? "#ef4444" : "#06b6d4"} />
                      <stop offset="100%" stopColor={index === 0 ? "#16a34a" : index === 1 ? "#d97706" : index === 2 ? "#7c3aed" : index === 3 ? "#dc2626" : "#0891b2"} />
                    </linearGradient>
                  </defs>
                  <path 
                    d={index === 0 ? "M0,4 Q25,2 50,4 T100,4 L100,8 L0,8 Z" : 
                        index === 1 ? "M0,6 Q20,2 40,6 Q60,2 80,6 Q90,3 100,6 L100,8 L0,8 Z" :
                        index === 2 ? "M0,5 Q30,1 60,5 Q70,7 100,3 L100,8 L0,8 Z" :
                        index === 3 ? "M0,3 Q25,7 50,3 Q75,7 100,3 L100,8 L0,8 Z" :
                        "M0,4 Q20,6 40,4 Q60,2 80,4 Q90,6 100,4 L100,8 L0,8 Z"} 
                    fill={`url(#${gradient}-${index})`} 
                    stroke="none"
                  />
                </svg>
              </div>
              <Icon className={styles.navIcon} />
              <span className={`${styles.navText} ${isActive ? styles.navTextActive : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
