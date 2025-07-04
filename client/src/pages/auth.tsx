import { useState } from "react";

export default function AuthPage() {
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
        // Successful login - reload page
        window.location.reload();
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

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Use any email/password to login for demo
          </p>
        </div>
      </div>
    </div>
  );
}