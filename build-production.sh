#!/bin/bash
# Production build script with guaranteed cache clearing
# This ensures fresh builds with matching asset hashes

echo "🚀 PocketCoach Production Build - Cache-Free"
echo "============================================="

# Clear all potential caches
echo "🧹 Clearing all caches..."
rm -rf dist
rm -rf node_modules/.vite  
rm -rf .vite
rm -rf node_modules/.cache

# Run the actual build
echo "🔨 Building with fresh cache..."
npm run build

# Verify the build
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Production build completed successfully"