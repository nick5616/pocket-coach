#!/bin/bash
# PocketCoach Production Deployment Script v2.0
# Ensures fresh builds and resolves cache-related deployment issues

set -e  # Exit on any error

echo "🚀 Starting PocketCoach production deployment..."
echo "📅 Deployment started at: $(date)"

# Function to log with timestamp
log() {
    echo "[$(date +'%H:%M:%S')] $1"
}

# Clean ALL previous builds and caches
log "🧹 Cleaning previous builds and caches..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf server/public/

# Clear npm cache to ensure fresh dependency resolution
log "🔄 Clearing npm cache..."
npm cache clean --force

# Install dependencies fresh (helps with deployment consistency)
log "📦 Installing dependencies..."
npm ci --omit=dev --production=false

# Build fresh production assets with explicit cache busting
log "🏗️  Building production assets..."
VITE_BUILD_TIME=$(date +%s) npm run build

# Verify build completed successfully
if [ ! -f "dist/index.js" ]; then
    log "❌ Backend build failed! dist/index.js not found."
    exit 1
fi

if [ ! -d "dist/public/assets" ]; then
    log "❌ Frontend build failed! dist/public/assets not found."
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    log "❌ Frontend build failed! dist/public/index.html not found."
    exit 1
fi

log "✅ Build completed successfully!"

# Extract and validate asset references
log "🔍 Validating build integrity..."
ASSETS=$(grep -o 'assets/[^"]*' dist/public/index.html)
JS_FILE=$(echo "$ASSETS" | grep '\.js$' | head -1)
CSS_FILE=$(echo "$ASSETS" | grep '\.css$' | head -1)

log "📄 Asset references in HTML:"
echo "$ASSETS" | sed 's/^/   /'

# Verify assets exist on disk
if [ -n "$JS_FILE" ] && [ ! -f "dist/public/$JS_FILE" ]; then
    log "❌ Referenced JS file not found: dist/public/$JS_FILE"
    exit 1
fi

if [ -n "$CSS_FILE" ] && [ ! -f "dist/public/$CSS_FILE" ]; then
    log "❌ Referenced CSS file not found: dist/public/$CSS_FILE"
    exit 1
fi

log "✅ All referenced assets verified on disk"

# Display build summary
log "📊 Build summary:"
echo "   📁 Build directory: dist/public/"
echo "   📄 JS asset: $JS_FILE"
echo "   🎨 CSS asset: $CSS_FILE"
echo "   📦 Backend bundle: dist/index.js ($(du -h dist/index.js | cut -f1))"

# File size analysis
TOTAL_SIZE=$(du -sh dist/public/assets/ | cut -f1)
log "📈 Total assets size: $TOTAL_SIZE"

# Generate deployment verification file
cat > dist/deployment-info.json << EOF
{
  "buildTime": "$(date -Iseconds)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "jsAsset": "$JS_FILE",
  "cssAsset": "$CSS_FILE",
  "totalAssetsSize": "$TOTAL_SIZE",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "buildSuccess": true
}
EOF

log "✅ Generated deployment verification file"

echo ""
log "🌐 Replit Deployment Instructions:"
echo "   1. Set environment variables:"
echo "      NODE_ENV=production"
echo "   2. Use start command:"
echo "      node dist/index.js"
echo "   3. Clear any existing deployment cache in Replit"
echo "   4. Verify deployment health at: /api/health"

echo ""
log "🔧 Cache-busting measures implemented:"
echo "   ✅ Cleared all build directories"
echo "   ✅ Cleared npm and Vite caches"
echo "   ✅ Fresh dependency installation"
echo "   ✅ Build-time timestamp injection"
echo "   ✅ Comprehensive asset validation"

echo ""
log "🎯 This build should resolve the asset loading issues:"
echo "   - Old cached references: index-CgyiaBAf.js, index-JfdqVIWx.css"
echo "   - New fresh references: $JS_FILE, $CSS_FILE"

log "🚀 Deployment preparation complete! Deploy to production now."