import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Workouts from "@/pages/workouts";
import WorkoutJournal from "@/pages/workout-journal";
import Progress from "@/pages/progress";
import Programs from "@/pages/programs";
import Profile from "@/pages/profile";
import { registerServiceWorker, setupPWAInstallPrompt } from "@/lib/pwa";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/workout-journal" component={WorkoutJournal} />
      <Route path="/workout-journal/:id" component={WorkoutJournal} />
      <Route path="/progress" component={Progress} />
      <Route path="/programs" component={Programs} />
      <Route path="/profile" component={Profile} />
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
      <TooltipProvider>
        <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
          {/* PWA Status Bar */}
          <div className="bg-duolingo-green h-8 w-full"></div>
          
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
