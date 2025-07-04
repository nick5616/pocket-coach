export default function AuthPage() {
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
        maxWidth: "400px",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "0.5rem"
        }}>PocketCoach</h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Your Personal Fitness Journey</p>
        <p style={{ color: "#374151" }}>React is loading...</p>
      </div>
    </div>
  );
}