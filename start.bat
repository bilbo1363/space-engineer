@echo off
cls

echo ========================================
echo   Space Engineer - Start
echo ========================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Download from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js installed
node --version
echo.

echo Checking npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm installed
npm --version
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    call npm install --legacy-peer-deps
    echo.
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed!
    echo.
)

echo Starting dev server...
echo.
echo Wait for the address message (usually http://localhost:5173/)
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start server!
    pause
)
