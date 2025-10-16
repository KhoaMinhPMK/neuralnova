@echo off
cd /d %~dp0

echo Restarting with PM2...

REM Kill process cu
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 1 /nobreak >nul

REM Start voi PM2
pm2 delete file-server >nul 2>&1
pm2 start server.js --name file-server
pm2 save

echo.
echo Server da restart voi PM2!
echo Xem logs: pm2 logs file-server
echo.
pause

