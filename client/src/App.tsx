import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Workouts from "@/pages/workouts";
import WorkoutJournal from "@/pages/workout-journal";
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
  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    setupPWAInstallPrompt();
    
    // Set theme color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#58CC02");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
        {/* PWA Status Bar */}
        <div className="bg-duolingo-green h-8 w-full"></div>
        
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
