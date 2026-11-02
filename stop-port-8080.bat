@echo off
title Free Port 8080
color 0E
echo ================================================================
echo            CHECKING AND CLEARING PORT 8080
echo ================================================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Found process with PID %%a listening on port 8080.
    echo Terminating PID %%a...
    taskkill /F /PID %%a
)

echo.
echo Port 8080 is now available!
pause

