import { useState } from "react";

// Simple test component to verify React works
function SimpleAuth() {
  const [email, setEmail] = useState("");
  
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
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "1rem",
          textAlign: "center"
        }}>PocketCoach</h1>
        <p style={{ color: "#6b7280", textAlign: "center", marginBottom: "2rem" }}>
          React hooks are working: {email.length} characters typed
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Type to test React..."
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            fontSize: "1rem"
          }}
        />
      </div>
    </div>
  );
}

function App() {
  return <SimpleAuth />;
}

export default App;