import { Link, useLocation } from "wouter";
import { Home, Dumbbell, BarChart3, PenTool, User } from "lucide-react";
import styles from "./bottom-navigation.module.css";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workout-journal", icon: PenTool, label: "Workout" },
    { path: "/workouts", icon: Dumbbell, label: "History" },
    { path: "/progress", icon: BarChart3, label: "Progress" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.navList}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
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
