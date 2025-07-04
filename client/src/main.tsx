import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("PocketCoach: Main.tsx loaded successfully");

const root = createRoot(document.getElementById("root")!);
console.log("PocketCoach: About to render App component");
root.render(<App />);
