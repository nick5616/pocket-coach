import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Monitor, LogOut, Settings } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import LoadingScreen from "../components/loading-screen";
import { useTheme } from "../components/theme-provider";
import BottomNavigation from "../components/bottom-navigation";

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
      <div className="space-y-3">
        <h3 className="text-heading-3">Theme Preference</h3>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as any)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                  ${theme === option.value 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="text-heading-2">Profile</h1>
        </div>
      </div>
      
      <div className="page-content">
        <div className="container space-y-6 py-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold">{user?.email}</div>
                  <div className="text-caption">PocketCoach Member</div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="stat-value">5</div>
              <div className="stat-label">Workouts This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">12</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}