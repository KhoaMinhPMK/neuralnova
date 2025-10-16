@echo off
echo Stopping File Server...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping process ID: %%a
    taskkill /F /PID %%a
)

echo.
echo Server da dung!
pause

