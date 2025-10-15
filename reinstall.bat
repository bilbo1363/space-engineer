@echo off
cls

echo ========================================
echo   Reinstall dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo WARNING: This will delete node_modules and reinstall all dependencies
echo.
echo Continue? (Y/N)
set /p confirm=

if /i "%confirm%" NEQ "Y" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Deleting node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo [OK] node_modules deleted
) else (
    echo [INFO] node_modules not found
)

echo.
echo Deleting package-lock.json...
if exist "package-lock.json" (
    del /f /q package-lock.json
    echo [OK] package-lock.json deleted
) else (
    echo [INFO] package-lock.json not found
)

echo.
echo Installing dependencies...
call npm install --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies successfully reinstalled!
echo.
echo You can now run start.bat
echo.
pause
