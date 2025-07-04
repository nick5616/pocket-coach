import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Home from "@/pages/home";
import Workouts from "@/pages/workouts";
import WorkoutJournal from "@/pages/workout-journal";
import ProgramWorkout from "@/pages/program-workout";
import Progress from "@/pages/progress-simple";
import Programs from "@/pages/programs-simple";
import Profile from "@/pages/profile-simple";
import SplashScreen from "@/components/splash-screen";
import { registerServiceWorker, setupPWAInstallPrompt } from "@/lib/pwa";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check authentication status
    fetch("/api/auth/user", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(user => setIsAuthenticated(!!user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.125rem' 
    }}>Loading...</div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={AuthPage} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/workouts" component={Workouts} />
          <Route path="/workout-journal" component={WorkoutJournal} />
          <Route path="/workout-journal/:id" component={WorkoutJournal} />
          <Route path="/workouts/program/:programId" component={ProgramWorkout} />
          <Route path="/progress" component={Progress} />
          <Route path="/programs" component={Programs} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    try {
      // Initialize PWA features
      registerServiceWorker();
      setupPWAInstallPrompt();
      
      // Check for dark mode preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('theme');
      const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      
      setIsDark(shouldUseDark);
      
      // Apply dark class to document
      if (shouldUseDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Set theme color for mobile browsers
      const metaThemeColor = document.querySelector("meta[name=theme-color]");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#58CC02");
      }
    } catch (error) {
      console.error('App initialization error:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <div style={{
          height: '100vh',
          maxWidth: '448px',
          margin: '0 auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backgroundColor: isDark ? '#111827' : '#ffffff'
        }}>
          <AppContent />
        </div>
      )}
    </QueryClientProvider>
  );
}

export default App;
