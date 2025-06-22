import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Workouts from "@/pages/workouts";
import WorkoutJournal from "@/pages/workout-journal";
import ProgramWorkout from "@/pages/program-workout";
import Progress from "@/pages/progress-simple";
import Programs from "@/pages/programs-simple";
import Profile from "@/pages/profile-simple";
import { registerServiceWorker, setupPWAInstallPrompt } from "@/lib/pwa";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
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

  useEffect(() => {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{
        height: '100vh',
        maxWidth: '28rem',
        margin: '0 auto',
        backgroundColor: isDark ? '#111827' : '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* PWA Status Bar */}
        <div style={{
          backgroundColor: '#58CC02',
          height: '2rem',
          width: '100%',
          flexShrink: 0
        }}></div>
        
        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          <Router />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
