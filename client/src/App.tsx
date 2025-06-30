function App() {
  console.log("App component rendering...");
  
  return (
    <div style={{
      height: '100vh',
      maxWidth: '28rem',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      position: 'relative',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: '#333'
    }}>
      <div>
        <h1>PocketCoach</h1>
        <p>App is loading successfully!</p>
        <p>No iframe issues detected.</p>
      </div>
    </div>
  );
}

export default App;
