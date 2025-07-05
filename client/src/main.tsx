import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('PocketCoach: Unregistering service worker');
      registration.unregister();
    }
  });
}

console.log('PocketCoach: Starting React application');
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
