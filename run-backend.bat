@echo off
title TownTrek Spring Boot Backend (Port 8080)
color 0B
echo ================================================================
echo           TOWNTREK SPRING BOOT BACKEND SERVER
echo ================================================================
echo.

echo [1/3] Terminating any stale process on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Freeing port 8080 from process PID %%a...
    taskkill /F /PID %%a >nul 2>nul
)

:: Locate Maven if not in PATH
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\apache-maven\bin\mvn.cmd" (
        set "PATH=C:\Program Files\apache-maven\bin;%PATH%"
    ) else if exist "C:\apache-maven\bin\mvn.cmd" (
        set "PATH=C:\apache-maven\bin;%PATH%"
    )
)

echo [2/3] Navigating to backend directory...
cd /d "%~dp0backend"

echo [3/3] Compiling and starting Spring Boot with live MySQL integration...
echo.
mvn spring-boot:run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ================================================================
    echo [BACKEND TERMINAL ERROR DIAGNOSTICS]
    echo.
    echo 1. If error says 'Communications link failure' or 'Connection refused':
    echo    Ensure MySQL service is started (services.msc -> MySQL80 -> Start).
    echo.
    echo 2. If error says 'Access denied for user root':
    echo    Check password in db.properties (currently: Aravintth@10).
    echo ================================================================
    pause
)
