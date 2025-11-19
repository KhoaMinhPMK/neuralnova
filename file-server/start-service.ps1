# =============================================
# NeuralNova File Server - Windows Service Setup
# =============================================

Write-Host "🚀 Setting up NeuralNova File Server as Windows Service..." -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "👉 Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 1: Check Node.js
Write-Host "📦 Step 1: Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   👉 Download from: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""

# Step 2: Install PM2
Write-Host "📦 Step 2: Installing PM2 globally..." -ForegroundColor Cyan
try {
    $pm2Check = Get-Command pm2 -ErrorAction SilentlyContinue
    if ($pm2Check) {
        Write-Host "   ✅ PM2 is already installed" -ForegroundColor Green
    } else {
        Write-Host "   Installing PM2..." -ForegroundColor Yellow
        npm install -g pm2
        npm install -g pm2-windows-startup
        Write-Host "   ✅ PM2 installed successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Failed to install PM2: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

# Step 3: Setup PM2 Windows Startup
Write-Host "📦 Step 3: Setting up PM2 startup..." -ForegroundColor Cyan
try {
    pm2-startup install
    Write-Host "   ✅ PM2 startup configured" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Warning: PM2 startup setup failed (might already be configured)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Install dependencies
Write-Host "📦 Step 4: Installing Node.js dependencies..." -ForegroundColor Cyan
$currentDir = Get-Location
try {
    npm install
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to install dependencies: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

# Step 5: Create logs directory
Write-Host "📁 Step 5: Creating logs directory..." -ForegroundColor Cyan
$logsDir = Join-Path $currentDir "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
    Write-Host "   ✅ Logs directory created" -ForegroundColor Green
} else {
    Write-Host "   ✅ Logs directory already exists" -ForegroundColor Green
}

Write-Host ""

# Step 6: Stop existing PM2 process (if any)
Write-Host "🛑 Step 6: Stopping existing service (if any)..." -ForegroundColor Cyan
try {
    pm2 delete neuralnova-fileserver 2>$null
    Write-Host "   ✅ Stopped existing service" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️ No existing service to stop" -ForegroundColor Gray
}

Write-Host ""

# Step 7: Start with PM2
Write-Host "🚀 Step 7: Starting File Server with PM2..." -ForegroundColor Cyan
try {
    pm2 start ecosystem.config.js
    Write-Host "   ✅ File Server started successfully!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to start service: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

# Step 8: Save PM2 configuration
Write-Host "💾 Step 8: Saving PM2 configuration..." -ForegroundColor Cyan
try {
    pm2 save
    Write-Host "   ✅ PM2 configuration saved" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Warning: Failed to save PM2 config" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ FILE SERVER SETUP COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "🔗 Service URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "   pm2 status              - Check service status" -ForegroundColor White
Write-Host "   pm2 logs                - View logs" -ForegroundColor White
Write-Host "   pm2 restart neuralnova-fileserver - Restart service" -ForegroundColor White
Write-Host "   pm2 stop neuralnova-fileserver    - Stop service" -ForegroundColor White
Write-Host "   pm2 delete neuralnova-fileserver  - Remove service" -ForegroundColor White
Write-Host ""
Write-Host "🎉 The service will auto-start on Windows boot!" -ForegroundColor Green
Write-Host ""

pause
