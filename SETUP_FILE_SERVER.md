# 🚀 Setup File Server trên Windows IIS

Hướng dẫn deploy Node.js File Server với IIS Reverse Proxy

---

## 📋 Prerequisites

- [x] Windows Server với IIS đã cài
- [x] Node.js đã cài (https://nodejs.org/)
- [x] Domain/Subdomain đã point về VPS IP
- [x] Admin access

---

## ⚡ Quick Start (Recommended)

### Bước 1: Chạy PowerShell Script

```powershell
# Mở PowerShell AS ADMINISTRATOR
# Right-click PowerShell → Run as Administrator

# Navigate to file-server folder
cd E:\project\neuralnova\neuralnova\file-server

# Run setup script
.\start-service.ps1
```

Script sẽ tự động:
- ✅ Cài PM2
- ✅ Setup PM2 startup
- ✅ Install dependencies
- ✅ Start service
- ✅ Save configuration

---

## 🔧 Manual Setup (Nếu script không chạy được)

### Bước 1: Install PM2

```powershell
npm install -g pm2
npm install -g pm2-windows-startup

# Setup startup
pm2-startup install
```

### Bước 2: Install Dependencies

```powershell
cd E:\project\neuralnova\neuralnova\file-server
npm install
```

### Bước 3: Start Service

```powershell
# Start with PM2
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Check status
pm2 status
```

---

## 🌐 IIS Setup (Reverse Proxy)

### Bước 1: Install IIS Modules

1. **Download và cài:**
   - URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite
   - Application Request Routing: https://www.iis.net/downloads/microsoft/application-request-routing

### Bước 2: Enable ARR Proxy

1. Mở **IIS Manager**
2. Click vào **Server name** (root level)
3. Double-click **Application Request Routing Cache**
4. Click **Server Proxy Settings** (panel bên phải)
5. ✅ Check **"Enable Proxy"**
6. Set **Response buffer threshold**: `0`
7. Click **Apply**

### Bước 3: Tạo IIS Site

1. **Add New Website:**
   - Site name: `neuralnova-files`
   - Physical path: `E:\project\neuralnova\neuralnova\file-server`
   - Binding:
     - Type: `http`
     - Port: `80`
     - Host name: `files.neuralnova.space`

2. **Application Pool Settings:**
   - Right-click site → Manage Website → Advanced Settings
   - Application Pool: Click (...) → Select `.NET CLR Version`: `No Managed Code`

### Bước 4: Verify web.config

File `web.config` đã được tạo sẵn tại `E:\project\neuralnova\neuralnova\file-server\web.config`

Test bằng cách:
```powershell
# Test Node.js trực tiếp
curl http://localhost:3001/health

# Test qua IIS
curl http://files.neuralnova.space/health
```

---

## 🔐 SSL Setup (Let's Encrypt - Free)

### Option 1: Win-ACME (Recommended)

```powershell
# Download Win-ACME
# https://www.win-acme.com/

# Run win-acme
.\wacs.exe

# Follow wizard:
# 1. Choose: M - Create certificate (full options)
# 2. Choose: 2 - Manual input
# 3. Host: files.neuralnova.space
# 4. Site: neuralnova-files
# 5. Validation: http-01
# 6. Store: Yes (IIS Central Certificate Store)
# 7. Installation: 1 - Single binding of an IIS site
# 8. Auto-renew: Yes
```

Win-ACME sẽ tự động:
- ✅ Tạo SSL certificate
- ✅ Bind vào IIS site
- ✅ Setup auto-renew task (90 days)

### Option 2: Certbot

```powershell
# Install Certbot
choco install certbot

# Get certificate
certbot certonly --webroot -w E:\project\neuralnova\neuralnova\file-server -d files.neuralnova.space

# Import to IIS manually
```

---

## 🔥 Firewall Rules

```powershell
# Allow HTTP (port 80)
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Allow Node.js (internal only - optional)
New-NetFirewallRule -DisplayName "Node.js FileServer" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

## 📝 Update Code với Domain Mới

### File: `pages/profile/app.js`

```javascript
const FILE_SERVER = isLocal
    ? 'http://localhost:3001'
    : 'https://files.neuralnova.space';  // ← Update domain
```

### File: `pages/dashboard/app.js`

```javascript
const FILE_SERVER = isLocal
    ? 'http://localhost:3001'
    : 'https://files.neuralnova.space';  // ← Update domain
```

---

## 🧪 Testing

### Test 1: Health Check

```powershell
# Direct Node.js
curl http://localhost:3001/health

# Through IIS
curl http://files.neuralnova.space/health

# With SSL
curl https://files.neuralnova.space/health
```

### Test 2: Upload File

```powershell
# Create test image
echo "test" > test.txt

# Upload
curl -F "file=@test.txt" http://files.neuralnova.space/upload?type=avatars
```

Expected response:
```json
{
  "success": true,
  "file": {
    "url": "https://files.neuralnova.space/uploads/avatars/...",
    "filename": "...",
    "size": 1234
  }
}
```

### Test 3: Access URL

```powershell
# Open in browser
start https://files.neuralnova.space/uploads/avatars/yourfile.jpg
```

---

## 📊 Monitoring

### PM2 Commands

```powershell
# Status
pm2 status

# Logs (real-time)
pm2 logs neuralnova-fileserver

# Logs (last 100 lines)
pm2 logs neuralnova-fileserver --lines 100

# Restart
pm2 restart neuralnova-fileserver

# Stop
pm2 stop neuralnova-fileserver

# Memory usage
pm2 monit
```

### Log Files

```
file-server/logs/
├── error.log      ← PM2 error logs
├── out.log        ← PM2 output logs
└── combined.log   ← Application logs (nếu có)
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot access port 3001"

**Solution:**
```powershell
# Check if port is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F

# Restart PM2
pm2 restart neuralnova-fileserver
```

### Issue 2: "IIS returns 500 error"

**Solution:**
1. Check **Failed Request Tracing** trong IIS
2. Enable **Detailed Errors**: 
   - IIS → Site → Error Pages → Edit Feature Settings
   - Set to: **Detailed errors**
3. Check PM2 logs: `pm2 logs`

### Issue 3: "SSL certificate không work"

**Solution:**
```powershell
# Re-run Win-ACME
.\wacs.exe --renew

# Check certificate binding
netsh http show sslcert

# Restart IIS
iisreset
```

### Issue 4: "Upload fails with CORS error"

**Solution:** 
Check `server.js` có CORS middleware:
```javascript
app.use(cors({
    origin: ['https://neuralnova.space', 'https://files.neuralnova.space'],
    credentials: true
}));
```

---

## ✅ Final Checklist

- [ ] PM2 installed và service running
- [ ] IIS URL Rewrite + ARR installed
- [ ] ARR Proxy enabled
- [ ] IIS site created với binding
- [ ] web.config configured
- [ ] Firewall ports opened
- [ ] DNS pointing to VPS IP
- [ ] SSL certificate installed
- [ ] Code updated với new domain
- [ ] Health check working
- [ ] Upload test successful
- [ ] Auto-start on boot tested

---

## 🎯 Quick Reference

| Component | URL/Path |
|-----------|----------|
| **Node.js Direct** | http://localhost:3001 |
| **IIS Public** | https://files.neuralnova.space |
| **Upload Endpoint** | /upload?type=avatars |
| **Health Check** | /health |
| **Logs** | file-server/logs/ |
| **PM2 Config** | file-server/ecosystem.config.js |
| **IIS Config** | file-server/web.config |

---

## 📞 Support

Nếu gặp vấn đề:
1. Check PM2 logs: `pm2 logs`
2. Check IIS logs: `C:\inetpub\logs\LogFiles\`
3. Enable detailed errors trong IIS
4. Test từng layer: Node → IIS → SSL

---

**Last Updated:** 2025-11-19
