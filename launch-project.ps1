# Teacher Connect Project Launcher (PowerShell)
# This script automatically sets up and launches the Teacher Connect project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Teacher Connect Project Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory and navigate to project
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Join-Path $scriptDir "teacher-connect-app"

# Check if project directory exists
if (-not (Test-Path $projectDir)) {
    Write-Host "ERROR: Project directory not found at $projectDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $projectDir
Write-Host "Changed to project directory: $projectDir" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: npm is not available" -ForegroundColor Red
    Write-Host "Please ensure Node.js is properly installed" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npm install
        Write-Host ""
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

# Launch the development server
Write-Host "Starting Teacher Connect development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will be available at: " -NoNewline
Write-Host "http://localhost:3000/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when you're done" -ForegroundColor Magenta
Write-Host ""

# Try to open browser automatically
try {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000/"
    Write-Host "Opening browser automatically..." -ForegroundColor Green
} catch {
    Write-Host "Could not open browser automatically. Please navigate to http://localhost:3000/ manually" -ForegroundColor Yellow
}

# Start the dev server
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "Development server encountered an error" -ForegroundColor Red
}

Write-Host ""
Write-Host "Development server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
