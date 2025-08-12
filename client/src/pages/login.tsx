import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Dumbbell, Eye, EyeOff, ArrowLeft } from "lucide-react";
import styles from "@/styles/auth.module.css";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Login successful, redirect to app
      window.location.reload(); // This will trigger the auth check in App.tsx
    },
    onError: (error: Error) => {
      setError(error.message || "Invalid email or password");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  const goToRegister = () => {
    setLocation("/register");
  };

  const goBack = () => {
    setLocation("/");
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Button
            onClick={goBack}
            variant="ghost"
            size="sm"
            className={styles.backButton}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Back
          </Button>
          <div className={styles.brandContainer}>
            <Dumbbell className={styles.brandIcon} />
            <h1 className={styles.brandTitle}>
              Pocket Coach
            </h1>
          </div>
        </div>

        {/* Login Form */}
        <div className={styles.formContainer}>
          <Card className={styles.formCard}>
            <CardHeader className={styles.formHeader}>
              <CardTitle className={styles.formTitle}>Welcome Back!</CardTitle>
              <CardDescription className={styles.formDescription}>
                Sign in to continue your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.formContent}>
              <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                  <div className={styles.errorAlert}>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}

                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputContainer}>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`${styles.submitButton} ${styles.primaryButton}`}
                  size="lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>

                <div className={styles.authLink}>
                  <p className={styles.authLinkText}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={goToRegister}
                      className={styles.authLinkButton}
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>Secure login • Your data is protected</p>
        </div>
      </div>
    </div>
  );
}