@echo off
title TownTrek - MySQL Database Initializer
color 0A
echo ================================================================
echo            TOWNTREK MYSQL DATABASE INITIALIZER
echo ================================================================
echo.
echo Target Database : movie_booking_db
echo Target User     : root
echo SQL Source      : database\migration_towntrek.sql
echo.

:: Detect MySQL executable in common paths if not in PATH
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        set "PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin;%PATH%"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" (
        set "PATH=C:\Program Files\MySQL\MySQL Server 8.4\bin;%PATH%"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe" (
        set "PATH=C:\Program Files\MySQL\MySQL Server 8.1\bin;%PATH%"
    ) else if exist "C:\xampp\mysql\bin\mysql.exe" (
        set "PATH=C:\xampp\mysql\bin;%PATH%"
    )
)

echo [1/2] Connecting to MySQL and executing schema + seed records...
mysql -u root -pAravintth@10 -e "CREATE DATABASE IF NOT EXISTS movie_booking_db;" 2>nul
mysql -u root -pAravintth@10 movie_booking_db < "%~dp0database\migration_towntrek.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo [SUCCESS] Database 'movie_booking_db' is 100%% initialized!
    echo All 9 movies, 8 shows, 240 seats, and events are in MySQL!
    echo ================================================================
) else (
    echo.
    echo [Notice] Trying fallback without password in case root has no password...
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS movie_booking_db;" 2>nul
    mysql -u root movie_booking_db < "%~dp0database\migration_towntrek.sql"
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================================================
        echo [SUCCESS] Database 'movie_booking_db' initialized with blank password!
        echo ================================================================
    ) else (
        echo.
        echo ================================================================
        echo [MANUAL OPTION]
        echo If mysql command is not found on PATH, open MySQL Workbench:
        echo   1. Connect to Local MySQL
        echo   2. Open file: database\migration_towntrek.sql
        echo   3. Click the lightning bolt icon (Execute)
        echo ================================================================
    )
)

echo.
pause
