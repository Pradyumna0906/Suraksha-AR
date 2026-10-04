@echo off
setlocal
cd /d "%~dp0mobile-app"

if not exist "node_modules\" (
  echo Installing mobile-app dependencies for the first run...
  npm ci
  if errorlevel 1 exit /b %errorlevel%
)

npm run dev
endlocal
