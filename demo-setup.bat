@echo off
echo 🚀 JobPal Demo Setup Script
echo ================================
echo.

echo 📋 Checking prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 16+
    pause
    exit /b 1
)

echo ✅ Python and Node.js found!
echo.

echo 🔧 Starting Backend Server...
echo Starting Flask server on http://localhost:5000
start "JobPal Backend" cmd /k "cd /d %~dp0server && pip install -r requirements.txt && python app.py"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🎨 Starting Frontend...
echo Starting React app on http://localhost:3000
start "JobPal Frontend" cmd /k "cd /d %~dp0client && npm install && npm start"

echo.
echo 🎉 Both servers are starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 💡 Demo Tips:
echo 1. Wait for both servers to fully load
echo 2. Click "🎯 Load Demo Data" in the app
echo 3. Click "🚀 Match Resume to Job" to see AI in action
echo.
pause
