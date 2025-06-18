import { Link, useLocation } from "wouter";
import { Home, Dumbbell, BarChart3, PenTool, User } from "lucide-react";

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 max-w-md mx-auto">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? "text-duolingo-green"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
