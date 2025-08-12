import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Dumbbell, Eye, EyeOff, ArrowLeft } from "lucide-react";
import styles from "@/styles/auth.module.css";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Registration successful, keep loading screen and redirect after delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500); // Give extra time for the loading animation to complete
    },
    onError: (error: Error) => {
      setIsCreatingAccount(false);
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email.trim() || !password.trim() || !firstName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsCreatingAccount(true);
    registerMutation.mutate({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const goToSignIn = () => {
    setLocation("/login");
  };

  const goBack = () => {
    setLocation("/");
  };

  // Show loading splash screen during registration
  if (registerMutation.isPending || isCreatingAccount) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingIconContainer}>
            <Dumbbell className={styles.loadingIcon} />
          </div>
          <h2 className={styles.loadingTitle}>Creating Your Account</h2>
          <p className={styles.loadingSubtitle}>
            {registerMutation.isPending 
              ? "Setting up your personalized fitness journey..." 
              : "Finalizing your account setup..."}
          </p>
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill}></div>
          </div>
          <p className={styles.loadingNote}>This usually takes a few seconds</p>
        </div>
      </div>
    );
  }

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

        {/* Registration Form */}
        <div className={styles.formContainer}>
          <Card className={styles.formCard}>
            <CardHeader className={styles.formHeader}>
              <CardTitle className={styles.formTitle}>Create Your Account</CardTitle>
              <CardDescription className={styles.formDescription}>
                Start your fitness journey with personalized coaching
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.formContent}>
              <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                  <div className={styles.errorAlert}>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label htmlFor="firstName" className={styles.label}>
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="lastName" className={styles.label}>
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address *
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
                    Password *
                  </label>
                  <div className={styles.inputContainer}>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                <div className={styles.field}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password *
                  </label>
                  <div className={styles.inputContainer}>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.passwordToggle}
                    >
                      {showConfirmPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`${styles.submitButton} ${styles.primaryButton}`}
                  size="lg"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>

                <div className={styles.authLink}>
                  <p className={styles.authLinkText}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={goToSignIn}
                      className={styles.authLinkButton}
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>By creating an account, you agree to our terms of service and privacy policy</p>
        </div>
      </div>
    </div>
  );
}