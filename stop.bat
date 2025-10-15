@echo off
cls

echo ========================================
echo   Stop all Node.js processes
echo ========================================
echo.

echo WARNING: This will stop ALL Node.js processes!
echo.
echo Continue? (Y/N)
set /p confirm=

if /i "%confirm%" NEQ "Y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Searching for Node.js processes...
tasklist | findstr /i "node.exe" >nul 2>&1

if errorlevel 1 (
    echo [OK] No Node.js processes found
) else (
    echo Stopping processes...
    taskkill /F /IM node.exe >nul 2>&1
    echo [OK] All Node.js processes stopped
)

echo.
pause
