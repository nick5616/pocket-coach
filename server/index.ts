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

// Simple cache control for HTML in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && (req.path === '/' || req.path.endsWith('.html'))) {
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

  // Simple service worker blocking
  app.use((req, res, next) => {
    if (req.path === '/sw.js') {
      return res.status(404).send('Service worker not available');
    }
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {



    await setupVite(app, server);
  } else {
    // In production, serve directly from dist/public
    const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
    
    if (!fs.existsSync(distPath)) {
      log("❌ Build directory not found. Run 'npm run build' first.");
      process.exit(1);
    }
    
    // Verify build integrity by checking for required files
    const indexPath = path.resolve(distPath, "index.html");
    const assetsPath = path.join(distPath, 'assets');
    
    if (!fs.existsSync(indexPath)) {
      log("❌ index.html not found in build directory. Build may be incomplete.");
      process.exit(1);
    }
    
    if (!fs.existsSync(assetsPath)) {
      log("❌ Assets directory not found in build. Build may be incomplete.");
      process.exit(1);
    }
    
    // Log build information for debugging
    try {
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');
      const jsMatch = htmlContent.match(/assets\/(index-[^.]+\.js)/);
      const cssMatch = htmlContent.match(/assets\/(index-[^.]+\.css)/);
      
      log(`✅ Production build verified:`);
      log(`   📁 Build directory: ${distPath}`);
      if (jsMatch) log(`   📄 JS asset: ${jsMatch[1]}`);
      if (cssMatch) log(`   🎨 CSS asset: ${cssMatch[1]}`);
      
      // Verify assets actually exist
      if (jsMatch && !fs.existsSync(path.join(assetsPath, jsMatch[1]))) {
        log(`❌ Referenced JS file ${jsMatch[1]} does not exist in assets directory!`);
        process.exit(1);
      }
      if (cssMatch && !fs.existsSync(path.join(assetsPath, cssMatch[1]))) {
        log(`❌ Referenced CSS file ${cssMatch[1]} does not exist in assets directory!`);
        process.exit(1);
      }
      
      log(`✅ All referenced assets verified to exist on disk.`);
    } catch (err) {
      log(`⚠️  Could not verify build integrity: ${err}`);
    }
    
    // Serve assets normally
    app.use(express.static(distPath));
    
    // Fallback to index.html for SPA routing
    app.use("*", (req, res) => {
      res.sendFile(indexPath);
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
