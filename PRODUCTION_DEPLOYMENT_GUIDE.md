# Production Deployment Guide - PocketCoach

## Problem Resolved
Fixed blank screen and 404 asset errors in production caused by deployment cache conflicts between old asset references (`index-CgyiaBAf.js`, `index-JfdqVIWx.css`) and new builds.

## Solution Summary
Enhanced deployment pipeline with comprehensive cache-busting and build verification to ensure fresh assets are properly deployed.

## Quick Deploy Steps

### 1. Run the Deployment Script
```bash
./deploy.sh
```

This script automatically:
- Clears all caches (npm, Vite, build directories)
- Installs fresh dependencies
- Creates new production build
- Verifies all assets exist and match HTML references
- Generates deployment verification file

### 2. Deploy to Replit

#### Environment Variables
Set in your Replit deployment:
```
NODE_ENV=production
```

#### Start Command
```
node dist/index.js
```

#### Clear Deployment Cache
In Replit deployment settings, clear any existing deployment cache to ensure fresh deployment.

### 3. Verify Deployment

#### Health Check
Visit: `https://your-app.replit.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "environment": "production",
  "deployment": {
    "buildTime": "2025-08-03T22:38:25+00:00",
    "jsAsset": "assets/index-q66wmNgr.js",
    "cssAsset": "assets/index-DaSqvVCd.css",
    "buildSuccess": true
  }
}
```

#### Asset Verification
Check that these URLs load correctly:
- `https://your-app.replit.app/assets/index-q66wmNgr.js`
- `https://your-app.replit.app/assets/index-DaSqvVCd.css`

## Technical Improvements Made

### Server Enhancements
- ✅ Build integrity verification on startup
- ✅ Asset existence validation before serving
- ✅ Detailed logging for missing assets
- ✅ Enhanced 404 handling with available asset listing
- ✅ Comprehensive HTML cache-busting

### Deployment Script
- ✅ Complete cache clearing (npm, Vite, build)
- ✅ Fresh dependency installation
- ✅ Asset validation pipeline
- ✅ Build verification with exit codes
- ✅ Deployment metadata generation

### Monitoring
- ✅ Health check endpoint with build information
- ✅ Detailed error logging in production
- ✅ Build timestamp injection for debugging

## Troubleshooting

### If assets still return 404:
1. Check the health endpoint for deployment info
2. Verify the build completed successfully (look for deployment-info.json)
3. Clear browser cache completely
4. Check Replit deployment logs for asset path errors

### If blank screen persists:
1. Open browser developer tools
2. Check Console for specific error messages
3. Verify Network tab shows correct asset loading
4. Use health endpoint to confirm production environment

## Build Files
- `dist/index.js` - Production server bundle
- `dist/public/index.html` - Main HTML file with asset references
- `dist/public/assets/` - Hashed JS and CSS files
- `dist/deployment-info.json` - Build metadata for verification

## Next Steps
After successful deployment, monitor the health endpoint and verify all functionality works correctly. The enhanced error handling will provide detailed logs if any issues occur.