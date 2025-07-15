import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/home";
import Programs from "./pages/programs";
import Progress from "./pages/progress";
import ProfileSimple from "./pages/profile-simple";
import WorkoutJournal from "./pages/workout-journal";
import ProgramWorkout from "./pages/program-workout";
import Workouts from "./pages/workouts";
import BottomNavigation from "./components/bottom-navigation";

// Authentication Page Component
function AuthPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Instead of window.location.reload(), refresh auth state
        onLoginSuccess();
      } else {
        const errorData = await response.text();
        setError(errorData || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #f0fff4 0%, #e6f3ff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        width: "100%",
        maxWidth: "400px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "0.5rem"
          }}>PocketCoach</h1>
          <p style={{ color: "#6b7280" }}>Your Personal Fitness Journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "1rem"
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "0.5rem"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "1rem"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              backgroundColor: "#059669",
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.375rem",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? "Please wait..." : "Sign In"}
          </button>

          {error && (
            <div style={{
              color: "#dc2626",
              fontSize: "0.875rem",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}
        </form>


      </div>
    </div>
  );
}



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
  const { user, isLoading, isAuthenticated, refreshAuth } = useAuth();

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
    return <AuthPage onLoginSuccess={refreshAuth} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/programs" component={Programs} />
          <Route path="/progress" component={Progress} />
          <Route path="/profile" component={ProfileSimple} />
          <Route path="/workouts" component={Workouts} />
          <Route path="/workout-journal/:id?" component={WorkoutJournal} />
          <Route path="/workouts/program/:programId" component={ProgramWorkout} />
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;