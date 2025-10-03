import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log(
                    "PocketCoach: Service Worker registered successfully:",
                    registration
                );
            })
            .catch((error) => {
                console.log(
                    "PocketCoach: Service Worker registration failed:",
                    error
                );
            });
    });
}

// CRITICAL FIX: Override fetch to handle cached asset errors in desktop browsers
// This prevents the "Unexpected token '<'" error when browsers request old cached assets
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    try {
        const response = await originalFetch.apply(this, args);

        // If we get HTML when expecting JavaScript/CSS (common sign of 404 fallback)
        const url = args[0] as string;
        if (
            response.ok &&
            response.headers.get("content-type")?.includes("text/html")
        ) {
            if (
                url.includes("/assets/") &&
                (url.endsWith(".js") || url.endsWith(".css"))
            ) {
                console.warn(
                    `🔧 PocketCoach: Asset ${url} returned HTML instead of expected file type. This is likely a cached asset that no longer exists.`
                );
                console.warn(
                    "💡 Suggestion: Clear your browser cache or use incognito mode to fix this issue."
                );

                // Return a proper error response instead of HTML
                return new Response(
                    JSON.stringify({
                        error: "Cached asset not found",
                        message: `The asset ${url} appears to be from an old build. Please clear your browser cache.`,
                        suggestion: "Clear browser cache and refresh the page",
                    }),
                    {
                        status: 404,
                        statusText: "Cached Asset Not Found",
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        }

        return response;
    } catch (error) {
        console.error("PocketCoach: Fetch error:", error);
        throw error;
    }
};

// CRITICAL FIX: Enhanced error handling for cached asset issues
window.addEventListener(
    "error",
    (event) => {
        const errorMessage = event.message || "";
        const filename = event.filename || "";

        // Check for cached asset errors - both syntax errors and loading failures
        const isCachedAssetError =
            (errorMessage.includes("Unexpected token") &&
                filename.includes("/assets/")) ||
            (filename.includes("/assets/") &&
                filename.match(/index-[a-zA-Z0-9_]{8,}\.js$/)) ||
            (errorMessage.includes("Loading module") &&
                filename.includes("/assets/"));

        if (isCachedAssetError) {
            console.error("🚨 PocketCoach: Cached asset error detected");
            console.error(`❌ Error: ${errorMessage}`);
            console.error(`📁 File: ${filename}`);

            // Force immediate reload to try to get fresh assets
            console.warn("🔄 Attempting automatic recovery...");

            // Clear any existing content and show recovery message
            const rootElement = document.getElementById("root");
            if (rootElement) {
                rootElement.innerHTML = `
        <div style="padding: 20px; font-family: system-ui; color: #333; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; margin-top: 50px; text-align: center;">
          <h1 style="color: #d63384; margin-bottom: 20px;">🔄 PocketCoach - Recovering from Cache Issue</h1>
          <p style="font-size: 18px; margin-bottom: 20px;">Detected old cached files. Attempting automatic recovery...</p>
          <div style="background: #e7f3ff; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>If this page doesn't reload automatically:</strong></p>
            <ol style="text-align: left; margin: 10px 0;">
              <li>Clear your browser cache (Ctrl+Shift+Delete)</li>
              <li>Hard refresh (Ctrl+Shift+R)</li>
              <li>Or open in incognito mode</li>
            </ol>
          </div>
          <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">
            Manual Refresh
          </button>
        </div>
      `;

                // Try multiple recovery strategies
                setTimeout(() => {
                    console.warn("🔄 Forcing hard reload...");
                    location.reload();
                }, 2000);
            }

            event.preventDefault();
            return false;
        }
    },
    true
);

// Additional check for blank screens after load
window.addEventListener("load", () => {
    setTimeout(() => {
        const rootElement = document.getElementById("root");
        if (
            rootElement &&
            (!rootElement.innerHTML || rootElement.innerHTML.trim() === "")
        ) {
            console.warn(
                "🚨 PocketCoach: Blank screen detected - possible cache issue"
            );

            // Check if we have script tags with old cached assets
            const scripts = document.querySelectorAll(
                'script[src*="/assets/"]'
            );
            const hasOldAssets = Array.from(scripts).some((script) => {
                const src = script.getAttribute("src") || "";
                return src.match(/\/assets\/[^\/]+-[a-zA-Z0-9_]{8,}\.js$/);
            });

            if (hasOldAssets) {
                console.warn(
                    "🔄 Found old cached asset references - forcing reload"
                );
                location.reload();
            }
        }
    }, 1000);
});

console.log("PocketCoach: Starting React application");

// Debug production issues
if (process.env.NODE_ENV === "production") {
    console.log("PocketCoach: Running in production mode");
} else {
    console.log("PocketCoach: Running in development mode");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("PocketCoach: Root element not found!");
    throw new Error("Root element not found");
}

console.log("PocketCoach: Creating React root and rendering app");
try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("PocketCoach: App rendered successfully");
} catch (error) {
    console.error("PocketCoach: Error rendering app:", error);
    // Fallback display
    const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
    rootElement.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; color: #333;">
      <h1>PocketCoach</h1>
      <p>Sorry, there was an error loading the application.</p>
      <p>Error: ${errorMessage}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}
