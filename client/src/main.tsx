import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// No service worker needed - removed to prevent sw.js errors

// CRITICAL FIX: Override fetch to handle cached asset errors in desktop browsers
// This prevents the "Unexpected token '<'" error when browsers request old cached assets
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  try {
    const response = await originalFetch.apply(this, args);
    
    // If we get HTML when expecting JavaScript/CSS (common sign of 404 fallback)
    const url = args[0] as string;
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      if (url.includes('/assets/') && (url.endsWith('.js') || url.endsWith('.css'))) {
        console.warn(`🔧 PocketCoach: Asset ${url} returned HTML instead of expected file type. This is likely a cached asset that no longer exists.`);
        console.warn('💡 Suggestion: Clear your browser cache or use incognito mode to fix this issue.');
        
        // Return a proper error response instead of HTML
        return new Response(
          JSON.stringify({
            error: 'Cached asset not found',
            message: `The asset ${url} appears to be from an old build. Please clear your browser cache.`,
            suggestion: 'Clear browser cache and refresh the page'
          }), 
          { 
            status: 404, 
            statusText: 'Cached Asset Not Found',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    return response;
  } catch (error) {
    console.error('PocketCoach: Fetch error:', error);
    throw error;
  }
};

// CRITICAL FIX: Handle script loading errors from cached assets
// This catches the "Unexpected token '<'" errors when browsers load old cached JS files
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  const filename = event.filename || '';
  
  // Check if this is the specific error from cached assets
  if (errorMessage.includes('Unexpected token') && filename.includes('/assets/')) {
    console.error('🚨 PocketCoach: Detected cached asset loading error');
    console.error(`❌ Error: ${errorMessage}`);
    console.error(`📁 File: ${filename}`);
    console.warn('💡 SOLUTION: This error occurs when your browser has cached old asset files that no longer exist.');
    console.warn('🔧 To fix: Clear your browser cache completely and refresh the page.');
    console.warn('🕵️ Alternative: Open this page in incognito/private mode to bypass cache.');
    
    // Show user-friendly error message
    const rootElement = document.getElementById("root");
    if (rootElement && !rootElement.innerHTML.includes('cached asset')) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: system-ui; color: #333; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; margin-top: 50px;">
          <h1 style="color: #d63384; margin-bottom: 20px;">⚠️ PocketCoach - Cache Issue Detected</h1>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
            <strong>Problem:</strong> Your browser is trying to load old cached files that no longer exist.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            <strong>Quick Fix:</strong>
          </p>
          <ol style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            <li style="margin-bottom: 10px;"><strong>Clear browser cache completely</strong> (Ctrl+Shift+Delete on Windows/Linux, Cmd+Shift+Delete on Mac)</li>
            <li style="margin-bottom: 10px;"><strong>Refresh this page</strong> (F5 or Ctrl+R)</li>
            <li style="margin-bottom: 10px;"><strong>Alternative:</strong> Open in incognito/private mode</li>
          </ol>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <strong>Technical Details:</strong><br>
            Error: ${errorMessage}<br>
            File: ${filename}
          </div>
        </div>
      `;
    }
    
    // Prevent the error from propagating further
    event.preventDefault();
    return false;
  }
}, true);

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
