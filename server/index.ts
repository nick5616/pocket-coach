import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // Check if static files exist, if not try to copy them
    const staticPath = path.resolve(import.meta.dirname, "public");
    const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
    
    if (!fs.existsSync(staticPath) && fs.existsSync(distPath)) {
      log("Static files not found, copying from dist/public...");
      try {
        await fs.promises.mkdir(staticPath, { recursive: true });
        const files = await fs.promises.readdir(distPath);
        for (const file of files) {
          const srcFile = path.join(distPath, file);
          const destFile = path.join(staticPath, file);
          const stat = await fs.promises.stat(srcFile);
          if (stat.isDirectory()) {
            await fs.promises.cp(srcFile, destFile, { recursive: true });
          } else {
            await fs.promises.copyFile(srcFile, destFile);
          }
        }
        log("Static files copied successfully!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log(`Error copying static files: ${errorMessage}`);
      }
    }
    
    // Add specific static file handling before calling serveStatic
    app.use('/assets', express.static(path.join(staticPath, 'assets'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        }
      }
    }));
    
    serveStatic(app);
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
