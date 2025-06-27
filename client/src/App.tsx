import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
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
import MuscleTargeting from "@/pages/muscle-targeting";
import ProgramBuilder from "@/pages/program-builder";
import SplashScreen from "@/components/splash-screen";
import ErrorBoundary from "@/components/error-boundary";
import { registerServiceWorker, setupPWAInstallPrompt } from "@/lib/pwa";

function AppRouter() {
  // Iframe detection and auto-redirect to demo (only once per session)
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    const inIframe = window.self !== window.top;
    if (inIframe && location === "/auth" && !sessionStorage.getItem('iframe-redirected')) {
      console.log('Iframe detected on auth page, redirecting to demo mode');
      sessionStorage.setItem('iframe-redirected', 'true');
      setLocation("/demo");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      {/* Always available routes */}
      <Route path="/demo" component={Demo} />
      <Route path="/auth" component={Auth} />
      
      {/* Protected routes - wrap each in error boundary */}
      <Route path="/" component={() => (
        <ErrorBoundary>
          <Home />
        </ErrorBoundary>
      )} />
      <Route path="/workouts" component={() => (
        <ErrorBoundary>
          <Workouts />
        </ErrorBoundary>
      )} />
      <Route path="/workout-journal" component={() => (
        <ErrorBoundary>
          <WorkoutJournal />
        </ErrorBoundary>
      )} />
      <Route path="/workout-journal/:id" component={() => (
        <ErrorBoundary>
          <WorkoutJournal />
        </ErrorBoundary>
      )} />
      <Route path="/workouts/program/:programId" component={() => (
        <ErrorBoundary>
          <ProgramWorkout />
        </ErrorBoundary>
      )} />
      <Route path="/progress" component={() => (
        <ErrorBoundary>
          <Progress />
        </ErrorBoundary>
      )} />
      <Route path="/programs" component={() => (
        <ErrorBoundary>
          <Programs />
        </ErrorBoundary>
      )} />
      <Route path="/profile" component={() => (
        <ErrorBoundary>
          <Profile />
        </ErrorBoundary>
      )} />
      <Route path="/beta-subscription" component={() => (
        <ErrorBoundary>
          <BetaSubscription />
        </ErrorBoundary>
      )} />
      <Route path="/admin" component={() => (
        <ErrorBoundary>
          <Admin />
        </ErrorBoundary>
      )} />
      <Route path="/muscle-targeting" component={() => (
        <ErrorBoundary>
          <MuscleTargeting />
        </ErrorBoundary>
      )} />
      <Route path="/program-builder" component={() => (
        <ErrorBoundary>
          <ProgramBuilder />
        </ErrorBoundary>
      )} />
      
      {/* Fallback */}
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
    
    // Check for dark mode preference with priority: saved > device preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    let shouldUseDark = prefersDark; // Default to device preference
    if (savedTheme) {
      shouldUseDark = savedTheme === 'dark';
    }
    
    setIsDark(shouldUseDark);
    
    // Apply dark class to document
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Listen for device preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newIsDark = e.matches;
        setIsDark(newIsDark);
        if (newIsDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Set theme color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", shouldUseDark ? "#1a1a1a" : "#58CC02");
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ErrorBoundary>
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
            <ErrorBoundary>
              <Router>
                <AppRouter />
              </Router>
            </ErrorBoundary>
          </div>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
