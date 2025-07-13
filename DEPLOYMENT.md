# PocketCoach Deployment Guide

## Production Deployment Issue Fix

The Chrome error "Unexpected token '<'" occurs because the browser is loading HTML instead of JavaScript files. This happens when:

1. Asset file names don't match between build and deployment
2. Server is running in development mode instead of production
3. Static files aren't served correctly

## Current Asset Issue

- Browser expects: `index-CgyiaBAf.js` and `sw.js`
- Built assets: `index-DIztqsJr.js` (and no sw.js)

## Solution

### For Replit Deployment:

1. **Build the production assets:**
   ```bash
   npm run build
   ```

2. **Ensure NODE_ENV is set to production** in Replit deployment:
   - In Replit deployment settings, set environment variable:
   - `NODE_ENV=production`

3. **Start command should be:**
   ```bash
   node dist/index.js
   ```

### Key Changes Made:

- ✅ Removed service worker references to prevent `sw.js` errors
- ✅ Enhanced production MIME type handling
- ✅ Improved static file serving
- ✅ Removed demo text from login page

### Verification Steps:

1. Check that `dist/public/` contains the built assets
2. Verify NODE_ENV is set to "production" in deployment
3. Confirm the server uses `serveStatic()` function for production mode
4. Test that assets are served with correct MIME types

### If Issues Persist:

1. Clear browser cache completely
2. Check Replit deployment logs for errors
3. Verify the deployment is using the correct start command
4. Ensure database environment variables are set correctly