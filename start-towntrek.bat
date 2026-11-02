@echo off
title TownTrek Full-Stack Launcher
echo ================================================================
echo               TOWNTREK FULL-STACK LAUNCHER
echo ================================================================
echo.
echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "TownTrek Backend" cmd /k "call "%~dp0run-backend.bat""

echo [2/2] Starting Vite React Frontend (Port 5173)...
start "TownTrek Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ================================================================
echo Both servers are launching!
echo.
echo When the backend displays:
echo   "Started TownTrekApplication in ... seconds"
echo.
echo Open or refresh your browser at:
echo   http://localhost:5173
echo ================================================================
echo.
pause
