@echo off
echo ========================================
echo Starting Earth Intelligence Platform
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8081
echo ========================================
echo.
echo Press any key to exit this window...
echo (The servers will continue running in separate windows)
pause >nul
