#!/bin/bash

# Copy .htaccess to dist folder after build
# This script is run automatically by the build command via shovel/package.json

if [ -f ".htaccess" ]; then
  echo "📋 Copying .htaccess to dist folder..."
  cp .htaccess dist/
  echo "✅ .htaccess copied successfully"
else
  echo "⚠️  .htaccess not found in current directory"
  exit 1
fi
