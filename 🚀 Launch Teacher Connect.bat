@echo off
title Teacher Connect Launcher
color 0A

echo.
echo  ████████╗███████╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
echo  ╚══██╔══╝██╔════╝██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗
echo     ██║   █████╗  ███████║██║     ███████║█████╗  ██████╔╝
echo     ██║   ██╔══╝  ██╔══██║██║     ██╔══██║██╔══╝  ██╔══██╗
echo     ██║   ███████╗██║  ██║╚██████╗██║  ██║███████╗██║  ██║
echo     ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo              ██████╗ ██████╗ ███╗   ███╗███╗   ███╗███████╗ ██████╗████████╗
echo             ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔════╝██╔════╝╚══██╔══╝
echo             ██║     ██║   ██║██╔████╔██║██╔████╔██║█████╗  ██║        ██║   
echo             ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══╝  ██║        ██║   
echo             ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║███████╗╚██████╗   ██║   
echo              ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝   ╚═╝   
echo.
echo                                   Project Launcher
echo.
echo ================================================================================

cd /d "%~dp0teacher-connect-app"

:: Check Node.js
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

:: Check npm
echo [2/4] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not available!
    pause
    exit /b 1
)
echo ✅ npm is available

:: Install dependencies if needed
echo [3/4] Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies... (this may take a few minutes)
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed!
) else (
    echo ✅ Dependencies already installed
)

:: Launch server
echo [4/4] Starting development server...
echo.
echo 🌐 Your app will be available at: http://localhost:3000/
echo 🔄 Auto-reload is enabled for development
echo 🛑 Press Ctrl+C to stop the server
echo.

:: Try to open browser after a delay
start /b timeout /t 3 /nobreak >nul && start http://localhost:3000/

:: Start the development server
npm run dev

echo.
echo 👋 Development server stopped. Thanks for using Teacher Connect!
pause
