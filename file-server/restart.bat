@echo off
echo ========================================
echo  Restarting File Server...
echo ========================================

REM Kill process tren port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping process ID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Doi 2 giay
timeout /t 2 /nobreak >nul

REM Start server
echo Starting server...
cd /d %~dp0
start "" node server.js

echo.
echo ========================================
echo  Server da duoc restart!
echo  Truy cap: http://160.30.113.26:3001
echo ========================================
echo.
pause

