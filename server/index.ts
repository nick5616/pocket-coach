import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure MIME types for production to fix module script loading
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (req.path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (req.path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    } else if (req.path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    }
    next();
  });
}

// Add cache-busting headers only for production deployments
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.path.startsWith("/api") && !req.path.includes("/@")) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // UNIVERSAL ASSET BLOCKING: Must happen BEFORE any static file serving or Vite middleware
  app.use((req, res, next) => {
    // Handle service worker requests that no longer exist
    if (req.path === '/sw.js') {
      log("Service worker request blocked - returning 404", "cache-fix");
      return res.status(404).send('Service worker not available');
    }
    
    // Handle hashed asset files that are cached but don't exist
    // Pattern matches: /assets/index-CgyiaBAf.js, /assets/main-ABC123XYZ.css, etc.
    const hashedAssetPattern = /^\/assets\/[^\/]+\-[a-zA-Z0-9_]{8,12}\.(js|css)$/;
    
    if (hashedAssetPattern.test(req.path)) {
      const mode = process.env.NODE_ENV === "production" ? "PRODUCTION" : "DEVELOPMENT";
      log(`[${mode}] Cached asset blocked EARLY: ${req.path}`, "cache-fix");
      
      // Return proper content type with valid code to prevent syntax errors
      if (req.path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(404).send(`// PocketCoach: Asset not found - cached file no longer exists
console.error("Cached asset error - Please clear your browser cache and refresh the page");
console.warn("Missing file: ${req.path}");
// This prevents the 'Unexpected token <' error by providing valid JavaScript`);
      } else if (req.path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(404).send('/* PocketCoach: Asset not found - cached file no longer exists */');
      }
      return res.status(404).send('Asset not found - cached file from browser cache');
    }
    
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {

    // AGGRESSIVE cache-busting for HTML to force fresh asset references
    app.use((req, res, next) => {
      if (req.path === '/' || req.path.endsWith('.html')) {
        // Force complete cache invalidation for HTML pages
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader('Vary', '*');
      } else if (!req.path.startsWith("/api") && !req.path.includes("/@vite")) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      next();
    });

    await setupVite(app, server);
  } else {
    // In production, serve directly from dist/public
    const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
    
    if (!fs.existsSync(distPath)) {
      log("Build directory not found. Run 'npm run build' first.");
      process.exit(1);
    }
    
    log(`Serving static files from: ${distPath}`);
    
    // Serve static assets with proper MIME types and cache headers
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        }
        // Set proper cache headers for hashed assets
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }));
    
    // Serve other static files (manifest, etc.)
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    
    // Fallback to index.html for SPA routing with cache-busting
    app.use("*", (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Add timestamp to HTML to help with debugging cache issues
      const indexPath = path.resolve(distPath, "index.html");
      try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        
        // Add cache-busting comment at the end
        const timestamp = new Date().toISOString();
        html = html.replace('</html>', `<!-- Build timestamp: ${timestamp} -->\n</html>`);
        
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.send(html);
      } catch (err) {
        log(`Error serving index.html: ${err}`);
        res.status(500).send('Server Error');
      }
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
