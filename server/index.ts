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
    
    // Smart asset serving that adapts to available files
    app.use('/assets', (req, res, next) => {
      const cleanPath = req.path.split('?')[0];
      const requestedFile = path.basename(cleanPath);
      const assetPath = path.join(assetsPath, requestedFile);
      
      log(`🔍 Asset request: ${req.path}`);
      
      // If exact file exists, serve it
      if (fs.existsSync(assetPath)) {
        log(`✅ Found exact asset: ${requestedFile}`);
        return next();
      }
      
      // If exact file doesn't exist, try to find a similar file (deployment hash mismatch fallback)
      try {
        const availableAssets = fs.readdirSync(assetsPath);
        log(`🔄 Asset ${requestedFile} not found, checking available assets: ${availableAssets.join(', ')}`);
        
        // Try to find the correct asset by type (JS or CSS)
        let fallbackAsset = null;
        if (requestedFile.includes('.js')) {
          fallbackAsset = availableAssets.find(file => file.startsWith('index-') && file.endsWith('.js'));
        } else if (requestedFile.includes('.css')) {
          fallbackAsset = availableAssets.find(file => file.startsWith('index-') && file.endsWith('.css'));
        }
        
        if (fallbackAsset) {
          log(`🎯 Serving fallback asset: ${fallbackAsset} instead of ${requestedFile}`);
          const fallbackPath = path.join(assetsPath, fallbackAsset);
          
          // Set proper headers
          if (fallbackAsset.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
          } else if (fallbackAsset.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=UTF-8');
          }
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          
          return res.sendFile(fallbackPath);
        }
      } catch (e) {
        log(`❌ Error finding fallback asset: ${e}`);
      }
      
      // No suitable asset found
      log(`❌ No asset found for: ${requestedFile}`);
      return res.status(404).json({
        error: 'Asset not found',
        requested: requestedFile,
        message: 'No matching asset file found. This may be a deployment cache issue.'
      });
    }, express.static(assetsPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        }
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
    
    // Fallback to index.html for SPA routing with enhanced cache-busting
    app.use("*", (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('ETag', ''); // Clear any ETag to prevent conditional requests
      
      try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        
        // Add cache-busting timestamp to asset URLs
        const timestamp = Date.now();
        html = html.replace(/\/assets\/(index-[^.]+\.(js|css))/g, `/assets/$1?v=${timestamp}`);
        
        // Add comprehensive debugging info
        const serverStartTime = new Date().toISOString();
        const buildInfo = `
<!-- PocketCoach Build Info -->
<!-- Build timestamp: ${serverStartTime} -->
<!-- Cache buster: ${timestamp} -->
<!-- Environment: ${process.env.NODE_ENV || 'development'} -->
<!-- Replit ID: ${process.env.REPL_ID || 'local'} -->
<!-- Node version: ${process.version} -->
</html>`;
        
        html = html.replace('</html>', buildInfo);
        
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.send(html);
      } catch (err) {
        log(`❌ Error serving index.html: ${err}`);
        res.status(500).json({
          error: 'Server Error',
          message: 'Could not serve application HTML',
          timestamp: new Date().toISOString()
        });
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
