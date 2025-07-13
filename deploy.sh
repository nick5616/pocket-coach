#!/bin/bash
# PocketCoach Production Deployment Script

echo "🚀 Starting PocketCoach production deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf server/public/

# Build fresh production assets
echo "📦 Building production assets..."
npm run build

# Verify build completed successfully
if [ ! -f "dist/index.js" ] || [ ! -d "dist/public/assets" ]; then
    echo "❌ Build failed! Missing required files."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📊 Built assets:"
ls -la dist/public/assets/

# Extract the actual asset filenames from the built HTML
ASSETS=$(grep -o 'assets/[^"]*' dist/public/index.html)
echo "🔗 Asset references in HTML:"
echo "$ASSETS"

echo ""
echo "🌐 To deploy to production:"
echo "1. Set environment variable: NODE_ENV=production"
echo "2. Use start command: node dist/index.js"
echo "3. Ensure these assets are accessible:"
echo "$ASSETS"

echo ""
echo "🔧 Debug info for current issue:"
echo "- Built assets are in: dist/public/assets/"
echo "- Chrome is looking for: index-CgyiaBAf.js"
echo "- Actual built file: $(ls dist/public/assets/*.js | xargs basename)"
echo ""
echo "💡 This mismatch suggests the deployment is using an old build cache."