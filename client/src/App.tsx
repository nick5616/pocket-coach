import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Demo from "@/pages/demo";
import Home from "@/pages/home";
import Workouts from "@/pages/workouts";
import WorkoutJournal from "@/pages/workout-journal";
import ProgramWorkout from "@/pages/program-workout";
import Progress from "@/pages/progress-simple";
import Programs from "@/pages/programs-simple";
import Profile from "@/pages/profile-simple";
import BetaSubscription from "@/pages/beta-subscription";
import Admin from "@/pages/admin";
import SplashScreen from "@/components/splash-screen";
import { registerServiceWorker, setupPWAInstallPrompt } from "@/lib/pwa";

function Router() {
  const [location] = useLocation();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: true,
    retry: false,
    staleTime: 5000,
  });

  console.log('Router state:', { location, user: !!user, isLoading, error });

  // Handle demo route specifically to prevent loops
  if (location === '/demo') {
    console.log('Rendering Demo component');
    return <Demo />;
  }

  // Show loading screen while checking auth
  if (isLoading) {
    console.log('Rendering SplashScreen for loading');
    return <SplashScreen onComplete={() => {
      console.log('Auth loading splash complete - this should not happen');
    }} />;
  }

  // Show auth if no user
  if (!user) {
    console.log('No user, rendering Auth');
    return <Auth />;
  }

  console.log('User authenticated, rendering main routes');

  // Authenticated routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/workout-journal" component={WorkoutJournal} />
      <Route path="/workout-journal/:id" component={WorkoutJournal} />
      <Route path="/workouts/program/:programId" component={ProgramWorkout} />
      <Route path="/progress" component={Progress} />
      <Route path="/programs" component={Programs} />
      <Route path="/profile" component={Profile} />
      <Route path="/beta-subscription" component={BetaSubscription} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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
      {showSplash ? (
        <SplashScreen onComplete={() => {
          console.log('Main splash complete, showing app');
          setShowSplash(false);
        }} />
      ) : (
        <div style={{
          height: '100vh',
          maxWidth: '28rem',
          margin: '0 auto',
          backgroundColor: isDark ? '#111827' : '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}>
          <Router />
        </div>
      )}
    </QueryClientProvider>
  );
}

export default App;
