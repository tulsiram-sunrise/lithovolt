#!/usr/bin/env node

/**
 * Copy .htaccess to dist folder after Vite build
 * This script runs automatically as part of: npm run build
 * Works on Windows, Mac, and Linux
 */

const fs = require('fs');
const path = require('path');

const htaccessSource = path.join(__dirname, '..', '.htaccess');
const distDir = path.join(__dirname, '..', 'dist');
const htaccessDest = path.join(distDir, '.htaccess');

try {
  // Check if dist folder exists
  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Check if .htaccess exists
  if (!fs.existsSync(htaccessSource)) {
    console.error('❌ Error: .htaccess file not found in project root.');
    process.exit(1);
  }

  // Copy .htaccess to dist
  fs.copyFileSync(htaccessSource, htaccessDest);
  console.log('✅ .htaccess copied to dist folder successfully');

  // Verify the copy
  if (fs.existsSync(htaccessDest)) {
    const stats = fs.statSync(htaccessDest);
    console.log(`   File size: ${stats.size} bytes`);
    console.log(`   Location: ${htaccessDest}`);
  }
} catch (error) {
  console.error(`❌ Error copying .htaccess: ${error.message}`);
  process.exit(1);
}
