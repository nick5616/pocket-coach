// Check for iframe and redirect BEFORE any imports or React code
if (typeof window !== 'undefined' && window.self !== window.top) {
  window.location.href = '/demo';
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Pocket Coach!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different details.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <Card>
          <CardHeader>
            <CardTitle className={styles.title}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                {!isLogin && (
                  <>
                    <div className={styles.inputGroup}>
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </>
                )}
                <div className={styles.inputGroup}>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading
                  ? (isLogin ? "Signing in..." : "Creating account...")
                  : (isLogin ? "Sign In" : "Create Account")
                }
              </Button>
            </form>

            <div className={styles.toggleContainer}>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.toggleButton}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}