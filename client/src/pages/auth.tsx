import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) =>
      apiRequest("/api/auth/login", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) =>
      apiRequest("/api/auth/register", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, firstName, lastName });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
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
          {!isLogin && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "0.5rem"
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "1rem"
                  }}
                  required={!isLogin}
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
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "1rem"
                  }}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

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
            disabled={loginMutation.isPending || registerMutation.isPending}
            style={{
              width: "100%",
              backgroundColor: "#059669",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
              opacity: loginMutation.isPending || registerMutation.isPending ? 0.5 : 1
            }}
          >
            {loginMutation.isPending || registerMutation.isPending
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

          {(loginMutation.error || registerMutation.error) && (
            <div style={{
              color: "#dc2626",
              fontSize: "0.875rem",
              textAlign: "center"
            }}>
              {loginMutation.error?.message || registerMutation.error?.message}
            </div>
          )}
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: "#059669",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}