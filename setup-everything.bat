@echo off
echo ============================================
echo   Verified Resume - Complete Setup
echo ============================================
echo.

echo Step 1: Installing all dependencies...
echo ----------------------------------------
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing backend dependencies...
echo ----------------------------------------
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 3: Installing frontend dependencies...
echo ----------------------------------------
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend npm install failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 4: Installing contracts dependencies...
echo ----------------------------------------
cd contracts
call npm install
if errorlevel 1 (
    echo ERROR: Contracts npm install failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 5: Creating necessary directories...
echo ----------------------------------------
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\uploads" mkdir backend\uploads

echo.
echo Step 6: Checking environment file...
echo ----------------------------------------
if not exist "backend\.env" (
    echo Creating backend\.env from template...
    copy env.example.txt backend\.env
    echo.
    echo ============================================
    echo   IMPORTANT: Edit backend\.env file!
    echo ============================================
    echo.
    echo Please edit backend\.env and set:
    echo   - DATABASE_URL
    echo   - JWT_SECRET
    echo   - OPENAI_API_KEY (optional)
    echo.
) else (
    echo backend\.env already exists, skipping...
)

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next steps:
echo   1. Edit backend\.env with your configuration
echo   2. Start MongoDB: mongod
echo   3. Start backend: start-backend.bat
echo   4. Start frontend: start-frontend.bat
echo.
pause

