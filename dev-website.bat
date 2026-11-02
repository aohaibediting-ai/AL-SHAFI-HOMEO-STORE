@echo off
TITLE AL SHAFI HOMEO STORE - Development Mode
echo ===================================================
echo   AL SHAFI HOMEO STORE - Development Hot-Reload
echo ===================================================
echo.
cd /d "%~dp0"
echo Starting Backend and Frontend concurrently...
npm run dev
pause
