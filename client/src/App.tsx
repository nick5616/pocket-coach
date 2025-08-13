import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/theme-provider";
import { UserPreferencesProvider } from "./contexts/user-preferences-context";
import Welcome from "./pages/welcome";
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import Programs from "./pages/programs";
import ProgramGeneration from "./pages/program-generation";
import ProgramModify from "./pages/program-modify";
import ProgramConfirmation from "./pages/program-confirmation";
import Progress from "./pages/progress";
import ProfileSimple from "./pages/profile-simple";
import WorkoutJournal from "./pages/workout-journal";
import WorkoutQuick from "./pages/workout-quick";
import WorkoutProgram from "./pages/workout-program";
import ProgramWorkout from "./pages/program-workout";
import Workouts from "./pages/workouts";
import BottomNavigation from "./components/bottom-navigation";

// Check authentication status
function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user", { credentials: "include" });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshAuth = () => {
    setIsLoading(true);
    // Clear all cached queries on auth change
    queryClient.clear();
    checkAuth();
  };

  return { user, isLoading, isAuthenticated: !!user, refreshAuth };
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show welcome/auth flow for unauthenticated users
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route component={Welcome} />
      </Switch>
    );
  }

  // Show main app for authenticated users
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/programs" component={Programs} />
          <Route path="/programs/generate" component={ProgramGeneration} />
          <Route path="/programs/modify" component={ProgramModify} />
          <Route path="/programs/confirm" component={ProgramConfirmation} />
          <Route path="/progress" component={Progress} />
          <Route path="/profile" component={ProfileSimple} />
          <Route path="/workouts" component={Workouts} />
          <Route path="/workouts/:id" component={WorkoutJournal} />
          <Route path="/workout-journal/:id?" component={WorkoutJournal} />
          <Route path="/workout-quick" component={WorkoutQuick} />
          <Route path="/workout-program" component={WorkoutProgram} />
          <Route path="/workouts/program/:programId" component={ProgramWorkout} />
          {/* Auth routes should redirect to home if user is authenticated */}
          <Route path="/register" component={Home} />
          <Route path="/login" component={Home} />
          <Route path="/welcome" component={Home} />
          <Route>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h1>Page Not Found</h1>
              <a href="/" style={{ color: "#059669" }}>Go Home</a>
            </div>
          </Route>
        </Switch>
      </div>
      <BottomNavigation />
    </div>
  );
}

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const root = window.document.documentElement;
    // Ensure light theme is applied by default if no theme is set
    if (!root.classList.contains('light') && !root.classList.contains('dark')) {
      root.classList.add('light');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserPreferencesProvider>
          <div style={{
            height: '100vh',
            width: '100%',
            margin: '0',
            position: 'relative',
            backgroundColor: 'var(--bg-primary, #ffffff)',
            transition: 'all 0.2s ease'
          }}>
            <AppContent />
          </div>
        </UserPreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;