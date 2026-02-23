@echo off
REM Copy .htaccess to dist folder after build
REM This script is run automatically by the build command via package.json

if exist ".htaccess" (
  echo 📋 Copying .htaccess to dist folder...
  copy .htaccess dist\.htaccess
  echo ✅ .htaccess copied successfully
) else (
  echo ⚠️  .htaccess not found in current directory
  exit /b 1
)
