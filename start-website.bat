@echo off
TITLE AL SHAFI HOMEO STORE - Local Server
echo ===================================================
echo     AL SHAFI HOMEO STORE - Starting Web App
echo ===================================================
echo.
cd /d "%~dp0\server"
echo [1/2] Checking database...
if not exist "data\store.db" (
    echo Seeding database...
    node src/seed.js
)
echo.
echo [2/2] Launching AL SHAFI HOMEO STORE on http://localhost:5000 ...
echo.
echo ===================================================
echo   Store URL:   http://localhost:5000
echo   Admin Panel: http://localhost:5000/admin
echo   Credentials: Set in your private server\.env file
echo   Doctor:      Dr. Musab Maqsood (+92 348 5349232)
echo   Clinic:      Raja Bazar, Rawalpindi
echo ===================================================
echo Keep this window OPEN while browsing your store.
echo Press Ctrl+C to stop the server anytime.
echo.
node src/index.js
pause
