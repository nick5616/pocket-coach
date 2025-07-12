import { Link, useLocation } from "wouter";
import { Home, Dumbbell, BarChart3, PenTool, User } from "lucide-react";
import styles from "./bottom-navigation.module.css";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { 
      path: "/", 
      icon: Home, 
      label: "Home",
      svgClass: styles.homeSvg,
      svgPath: "M2 8c0-1 1-2 2-2h0.5c1 0 2 1 2 2v4c0 1-1 2-2 2H4c-1 0-2-1-2-2V8z M8 6c0-1 1-2 2-2h4c1 0 2 1 2 2v8c0 1-1 2-2 2h-4c-1 0-2-1-2-2V6z M20 4c0-1 1-2 2-2h4c1 0 2 1 2 2v12c0 1-1 2-2 2h-4c-1 0-2-1-2-2V4z",
      gradient: "homeGradient"
    },
    { 
      path: "/workout-journal", 
      icon: PenTool, 
      label: "Workout",
      svgClass: styles.workoutSvg,
      svgPath: "M6 2c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z M14 6c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z M22 4c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z",
      gradient: "workoutGradient"
    },
    { 
      path: "/workouts", 
      icon: Dumbbell, 
      label: "History",
      svgClass: styles.historySvg,
      svgPath: "M2 8 Q6 4 12 8 Q18 12 24 8 Q30 4 36 8 Q42 12 48 8",
      gradient: "historyGradient"
    },
    { 
      path: "/progress", 
      icon: BarChart3, 
      label: "Progress",
      svgClass: styles.progressSvg,
      svgPath: "M4 12h4v4H4z M12 8h4v8h-4z M20 4h4v12h-4z M28 10h4v6h-4z M36 6h4v10h-4z",
      gradient: "progressGradient"
    },
    { 
      path: "/profile", 
      icon: User, 
      label: "Profile",
      svgClass: styles.profileSvg,
      svgPath: "M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12s5.4 12 12 12 12-5.4 12-12z M16 8c0-2.2-1.8-4-4-4s-4 1.8-4 4 1.8 4 4 4 4-1.8 4-4z M32 16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z",
      gradient: "profileGradient"
    },
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.navList}>
        {navItems.map(({ path, icon: Icon, label, svgClass, svgPath, gradient }, index) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <div className={styles.navSvgContainer}>
                <svg 
                  width="48" 
                  height="16" 
                  viewBox="0 0 48 16" 
                  className={svgClass}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="workoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                  </defs>
                  <path 
                    d={svgPath} 
                    fill={`url(#${gradient})`} 
                    stroke="none"
                    fillOpacity="0.9"
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
