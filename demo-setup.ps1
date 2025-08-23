Write-Host "🚀 JobPal Demo Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Cyan

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\server'; pip install -r requirements.txt; python app.py" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Write-Host "Starting React app on http://localhost:3000" -ForegroundColor Cyan

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\client'; npm install; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Demo Tips:" -ForegroundColor Yellow
Write-Host "1. Wait for both servers to fully load" -ForegroundColor White
Write-Host "2. Click '🎯 Load Demo Data' in the app" -ForegroundColor White
Write-Host "3. Click '🚀 Match Resume to Job' to see AI in action" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Gray
Read-Host
