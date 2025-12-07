@echo off
echo ========================================
echo   Starting Verified Resume Application
echo ========================================
echo.
echo Configuration:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001 (internal)
echo.
echo Starting Backend Server (Port 3001)...
start "Backend API - Port 3001" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Application (Port 3000)...
start "Frontend App - Port 3000" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Application Starting!
echo ========================================
echo.
echo Open your browser to:
echo   http://localhost:3000
echo.
echo The frontend will automatically proxy API calls to the backend.
echo.
echo NOTE: Make sure MongoDB is running first!
echo       Run: mongod
echo.
pause
