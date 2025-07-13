import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// No service worker needed - removed to prevent sw.js errors

console.log('PocketCoach: Starting React application');

// Debug production issues
if (process.env.NODE_ENV === 'production') {
  console.log('PocketCoach: Running in production mode');
} else {
  console.log('PocketCoach: Running in development mode');
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('PocketCoach: Root element not found!');
  throw new Error('Root element not found');
}

console.log('PocketCoach: Creating React root and rendering app');
try {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('PocketCoach: App rendered successfully');
} catch (error) {
  console.error('PocketCoach: Error rendering app:', error);
  // Fallback display
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; color: #333;">
      <h1>PocketCoach</h1>
      <p>Sorry, there was an error loading the application.</p>
      <p>Error: ${errorMessage}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}
