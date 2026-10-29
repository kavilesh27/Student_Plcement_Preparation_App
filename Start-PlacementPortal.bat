@echo off
setlocal
title PlacementPrep AI - Portal Launcher
color 0A
cls
set "PROJECT_DIR=%~dp0"
set "SERVER_DIR=%PROJECT_DIR%server"
set "CLIENT_DIR=%PROJECT_DIR%client"
echo.
echo  =====================================================
echo    PlacementPrep AI - Student Placement Portal
echo    Starting All Services...
echo  =====================================================
echo.

:: -------------------------------------------------------
:: Check Node.js
:: -------------------------------------------------------
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] npm is not installed or not in PATH.
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

if not exist "%SERVER_DIR%\server.js" (
    echo  [ERROR] Backend was not found at "%SERVER_DIR%".
    echo  Keep this launcher in the project root beside the server and client folders.
    pause
    exit /b 1
)

if not exist "%CLIENT_DIR%\package.json" (
    echo  [ERROR] Frontend was not found at "%CLIENT_DIR%".
    echo  Keep this launcher in the project root beside the server and client folders.
    pause
    exit /b 1
)

:: -------------------------------------------------------
:: Check MongoDB is running (tries to connect to port 27017)
:: -------------------------------------------------------
echo  [1/3] Checking MongoDB...
powershell -Command "try { $null = [System.Net.Sockets.TcpClient]::new('localhost', 27017); Write-Host '         MongoDB is running on port 27017  OK' } catch { Write-Host '  [WARNING] MongoDB does not appear to be running on port 27017.'; Write-Host '            Start MongoDB before logging in, or the app will not work.'; Write-Host '            Default install: C:\Program Files\MongoDB\Server\*\bin\mongod.exe' }"
echo.
timeout /t 2 /nobreak >nul

:: -------------------------------------------------------
:: Start Backend API Server (port 5000)
:: -------------------------------------------------------
echo  [2/3] Starting Backend API Server on port 5000...
start "PlacementPrep - Backend API (port 5000)" /D "%SERVER_DIR%" "%ComSpec%" /k "call npm.cmd start"
timeout /t 4 /nobreak >nul

:: -------------------------------------------------------
:: Start Frontend Dev Server (port 5173)
:: -------------------------------------------------------
echo  [3/3] Starting Frontend Dev Server on port 5173...
start "PlacementPrep - Frontend Dev (port 5173)" /D "%CLIENT_DIR%" "%ComSpec%" /k "call npm.cmd run dev -- --host 127.0.0.1"

echo  Waiting for the frontend to start...
powershell -NoProfile -Command "$deadline = (Get-Date).AddSeconds(30); do { $client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 5173); $client.Dispose(); exit 0 } catch { $client.Dispose(); Start-Sleep -Seconds 1 } } while ((Get-Date) -lt $deadline); exit 1"
if errorlevel 1 (
    echo.
    echo  [ERROR] The frontend did not start on port 5173.
    echo  Check the Frontend Dev terminal for npm or Vite errors.
    echo  If dependencies are missing, run "npm install" in the client folder.
    pause
    exit /b 1
)

:: -------------------------------------------------------
:: Open browser
:: -------------------------------------------------------
echo.
echo  Opening browser at http://127.0.0.1:5173 ...
start "" "http://127.0.0.1:5173"

:: -------------------------------------------------------
:: Done
:: -------------------------------------------------------
echo.
echo  =====================================================
echo    All services started!
echo.
echo    Frontend   :  http://127.0.0.1:5173
echo    Backend API:  http://localhost:5000/api/health
echo.
echo    Login Credentials (seeded):
echo    Student  : aditya.verma@student.college.edu
echo    Staff    : placement.coordinator@college.edu
echo    Admin    : admin@college.edu
echo    Password : Password@123
echo.
echo    To stop: Close the two terminal windows that
echo    opened for Backend and Frontend.
echo  =====================================================
echo.
pause
