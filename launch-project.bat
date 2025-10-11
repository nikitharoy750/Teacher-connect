@echo off
echo ========================================
echo    Teacher Connect Project Launcher
echo ========================================
echo.

:: Change to the project directory
cd /d "%~dp0teacher-connect-app"

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    echo Please ensure Node.js is properly installed
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes on first run...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies already installed
    echo.
)

:: Launch the development server
echo Starting Teacher Connect development server...
echo.
echo The application will be available at: http://localhost:3000/
echo.
echo Press Ctrl+C to stop the server when you're done
echo.

:: Start the dev server
npm run dev

:: If we get here, the server was stopped
echo.
echo Development server stopped.
pause
