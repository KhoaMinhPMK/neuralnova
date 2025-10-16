@echo off
REM Regenerate XAMPP SSL Certificate (Windows)
REM Run as Administrator

echo ========================================
echo XAMPP SSL Certificate Generator
echo ========================================
echo.

set OPENSSL_CONF=C:\xampp\apache\conf\openssl.cnf
set OPENSSL_BIN=C:\xampp\apache\bin\openssl.exe

if not exist "%OPENSSL_BIN%" (
    echo ERROR: OpenSSL not found at %OPENSSL_BIN%
    echo Please adjust path if XAMPP is installed elsewhere
    pause
    exit /b 1
)

cd C:\xampp\apache

echo Backing up old certificates...
if exist conf\ssl.crt\server.crt (
    copy conf\ssl.crt\server.crt conf\ssl.crt\server.crt.bak
)
if exist conf\ssl.key\server.key (
    copy conf\ssl.key\server.key conf\ssl.key\server.key.bak
)

echo.
echo Generating new SSL certificate for neuralnova.space...
echo.

REM Generate new certificate valid for 10 years
"%OPENSSL_BIN%" req -new -x509 -nodes ^
    -days 3650 ^
    -keyout conf\ssl.key\server.key ^
    -out conf\ssl.crt\server.crt ^
    -subj "/C=US/ST=State/L=City/O=NeuralNova/CN=neuralnova.space" ^
    -addext "subjectAltName=DNS:neuralnova.space,DNS:www.neuralnova.space,DNS:localhost,IP:127.0.0.1"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to generate certificate
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! New certificate generated:
echo ========================================
echo Certificate: C:\xampp\apache\conf\ssl.crt\server.crt
echo Private Key: C:\xampp\apache\conf\ssl.key\server.key
echo Valid for: 10 years
echo.
echo Next steps:
echo 1. Restart Apache (XAMPP Control Panel)
echo 2. Import new cert to Windows Trust Store:
echo    certutil -addstore -f "ROOT" "C:\xampp\apache\conf\ssl.crt\server.crt"
echo 3. Restart browser
echo 4. Restart Node.js server (file-server)
echo ========================================
pause

