import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("PocketCoach: Main.tsx loaded successfully");

// Force service worker cleanup
if ('serviceWorker' in navigator) {
  console.log("PocketCoach: Forcing service worker cleanup");
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log("PocketCoach: Service worker cleanup registration successful");
      registration.update();
    })
    .catch(err => {
      console.log("PocketCoach: Service worker cleanup failed:", err);
    });
}

const root = createRoot(document.getElementById("root")!);
console.log("PocketCoach: About to render App component");
root.render(<App />);
