Write-Host "📱 JobPal Mobile Demo Setup" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Perfect for showing to recruiters on your phone!" -ForegroundColor Green
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

Write-Host "📱 MOBILE DEMO INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Wait for both servers to fully load" -ForegroundColor White
Write-Host "2. On your phone, connect to the same WiFi network" -ForegroundColor White
Write-Host "3. Find your computer's IP address (usually starts with 192.168.x.x)" -ForegroundColor White
Write-Host "4. On your phone, open browser and go to: http://[YOUR_IP]:3000" -ForegroundColor White
Write-Host "5. The app will look perfect on mobile!" -ForegroundColor White
Write-Host ""

Write-Host "💡 Demo Tips for Recruiters:" -ForegroundColor Yellow
Write-Host "• Show the beautiful mobile interface" -ForegroundColor White
Write-Host "• Click '🎯 Load Demo Data' to populate sample data" -ForegroundColor White
Write-Host "• Click '🚀 Match Resume to Job' to show AI in action" -ForegroundColor White
Write-Host "• Highlight: 'Everything runs locally - no cloud costs!'" -ForegroundColor White
Write-Host ""

Write-Host "🔍 To find your IP address, run: ipconfig" -ForegroundColor Cyan
Write-Host "Look for 'IPv4 Address' under your WiFi adapter" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press Enter to continue..." -ForegroundColor Gray
Read-Host
