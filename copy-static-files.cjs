#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist`);
    return false;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  return true;
}

// Copy static files from dist/public to server/public
const srcDir = path.join(__dirname, 'dist', 'public');
const destDir = path.join(__dirname, 'server', 'public');

console.log('Copying static files for production deployment...');
console.log(`From: ${srcDir}`);
console.log(`To: ${destDir}`);

if (copyRecursive(srcDir, destDir)) {
  console.log('Static files copied successfully!');
  
  // List files to verify
  if (fs.existsSync(destDir)) {
    const files = fs.readdirSync(destDir);
    console.log('Files in server/public:', files);
  }
} else {
  console.error('Failed to copy static files. Make sure to run "npm run build" first.');
  process.exit(1);
}