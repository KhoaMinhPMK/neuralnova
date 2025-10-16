# Windows VPS Setup Guide - Node.js HTTPS File Server

## 🪟 Windows VPS Solution

Node.js server với SSL trực tiếp - **KHÔNG CẦN Apache/IIS proxy!**

---

## 📋 Prerequisites

1. ✅ Node.js installed
2. ✅ SSL certificate cho `neuralnova.space`
3. ✅ Port 3000 mở trên firewall

---

## 🔍 Bước 1: Tìm SSL Certificate

Bạn đang dùng XAMPP/Apache? SSL cert thường ở đây:

### **Option A: XAMPP**
```
C:\xampp\apache\conf\ssl.key\server.key
C:\xampp\apache\conf\ssl.crt\server.crt
```

### **Option B: Let's Encrypt / Certbot**
```
C:\Certbot\live\neuralnova.space\privkey.pem
C:\Certbot\live\neuralnova.space\fullchain.pem
```

### **Option C: Custom Location**
```
C:\ssl\neuralnova.key
C:\ssl\neuralnova.crt
```

**Kiểm tra:**
```powershell
# Check if files exist
Test-Path "C:\xampp\apache\conf\ssl.key\server.key"
Test-Path "C:\xampp\apache\conf\ssl.crt\server.crt"
```

---

## ⚙️ Bước 2: Cấu Hình SSL Path

Mở file `file-server/server-https.js` và chỉnh **dòng 244-262**:

```javascript
const SSL_PATHS = {
  // Option 1: XAMPP default (if using XAMPP)
  xampp: {
    key: 'C:\\xampp\\apache\\conf\\ssl.key\\server.key',
    cert: 'C:\\xampp\\apache\\conf\\ssl.crt\\server.crt'
  },
  // Option 2: Let's Encrypt / Certbot
  letsencrypt: {
    key: 'C:\\Certbot\\live\\neuralnova.space\\privkey.pem',
    cert: 'C:\\Certbot\\live\\neuralnova.space\\fullchain.pem'
  },
  // Option 3: Custom location
  custom: {
    key: 'C:\\ssl\\neuralnova.key',  // <-- THAY ĐỔI Ở ĐÂY
    cert: 'C:\\ssl\\neuralnova.crt'  // <-- THAY ĐỔI Ở ĐÂY
  }
};
```

**Lưu ý**: Dùng `\\` (double backslash) cho Windows paths!

---

## 🚀 Bước 3: Chạy Node.js Server

### **A. Test Local (Development)**

```powershell
# Navigate to file-server directory
cd E:\project\neuralnova\neuralnova\file-server

# Install dependencies (if not done)
npm install

# Run HTTPS server
node server-https.js
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 NeuralNova File Server - HTTPS Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Found SSL certificates: xampp
   Key:  C:\xampp\apache\conf\ssl.key\server.key
   Cert: C:\xampp\apache\conf\ssl.crt\server.crt
✅ Server running on: https://neuralnova.space:3000
📁 Uploads directory: E:\...\file-server\uploads
🔗 Public URL: https://neuralnova.space:3000/uploads
📊 Max file sizes:
   - Avatar: 5MB
   - Cover: 10MB
   - Post: 50MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Test: https://neuralnova.space:3000/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **B. Test Health Check**

Mở browser:
```
https://neuralnova.space:3000/health
```

Expected:
```json
{
  "success": true,
  "status": "healthy",
  "protocol": "https",
  "uptime": 5.123,
  "timestamp": "2025-10-16T..."
}
```

---

## 🔥 Bước 4: Mở Port 3000 trên Firewall

### **Windows Firewall**

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js File Server" `
  -Direction Inbound `
  -LocalPort 3000 `
  -Protocol TCP `
  -Action Allow

# Verify
Get-NetFirewallRule -DisplayName "Node.js File Server"
```

### **Cloud Provider Firewall**

Nếu dùng AWS/Azure/DigitalOcean:
1. Vào Security Groups / Firewall settings
2. Add rule: **TCP port 3000** → Allow from **0.0.0.0/0**

---

## 🎯 Bước 5: Deploy & Test

### **Push Code to VPS**

```bash
# From local machine
git add .
git commit -m "feat: add HTTPS support for Windows VPS"
git push origin main
```

### **Pull on VPS**

```powershell
# On Windows VPS (PowerShell)
cd C:\xampp\htdocs\neuralnova
git pull origin main

# Install dependencies (if needed)
cd file-server
npm install

# Run HTTPS server
node server-https.js
```

### **Keep Server Running (PM2)**

```powershell
# Install PM2 globally (one time)
npm install -g pm2

# Start server with PM2
cd file-server
pm2 start server-https.js --name neuralnova-file-server

# Auto-start on Windows boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs neuralnova-file-server
```

---

## 🧪 Test Upload

1. **Push Frontend**:
   ```bash
   git push origin main
   ```

2. **Pull on VPS**:
   ```powershell
   cd C:\xampp\htdocs\neuralnova
   git pull origin main
   ```

3. **Hard Refresh Browser**: `Ctrl + Shift + R`

4. **Open Profile**:
   ```
   https://neuralnova.space/pages/profile/index.html
   ```

5. **Console Check (F12)**:
   ```
   📁 File Server: https://neuralnova.space:3000
   ```

6. **Upload Avatar** và xem console output

---

## ❌ Troubleshooting

### Issue: "SSL certificates not found! Starting HTTP server..."

**Cause**: Server không tìm thấy SSL certificate

**Fix**:
1. Check SSL files exist:
   ```powershell
   Test-Path "C:\xampp\apache\conf\ssl.key\server.key"
   ```
2. Update `SSL_PATHS` in `server-https.js` với đúng path
3. Restart server

### Issue: Port 3000 already in use

**Cause**: Server khác đang chạy trên port 3000

**Fix**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in config.js
```

### Issue: "ERR_CERT_AUTHORITY_INVALID"

**Cause**: SSL certificate self-signed (XAMPP default)

**Fix**:
1. Browser sẽ warning → Click "Advanced" → "Proceed to neuralnova.space"
2. OR get real SSL certificate (Let's Encrypt free)

### Issue: Still Mixed Content Error

**Cause**: Frontend config wrong

**Check**:
```javascript
// pages/profile/app.js - line 13
const FILE_SERVER = 'https://neuralnova.space:3000';  // Must be HTTPS
```

---

## 🎓 Why This Works

```
Browser (HTTPS) → Node.js:3000 (HTTPS) ✅ 
          ↓
     Same protocol - No Mixed Content Error!
```

**No Apache/IIS proxy needed!** Node.js handles SSL directly.

---

## 📊 Architecture

```
┌──────────────────────────────────────────────┐
│  Browser (HTTPS)                             │
└──────────────┬───────────────────────────────┘
               │
               ├─→ https://neuralnova.space/       (Apache/IIS - Frontend)
               │
               └─→ https://neuralnova.space:3000/  (Node.js - File Server)
```

---

## ✅ Checklist

- [ ] SSL certificate found and paths configured in `server-https.js`
- [ ] Port 3000 opened in Windows Firewall
- [ ] Port 3000 opened in Cloud Provider Firewall (if any)
- [ ] Node.js server running: `node server-https.js`
- [ ] Health check works: `https://neuralnova.space:3000/health`
- [ ] Frontend updated and pushed to VPS
- [ ] Browser cache cleared (Ctrl + Shift + R)
- [ ] Avatar upload tested successfully
- [ ] PM2 configured for auto-start (optional but recommended)

---

## 🆚 Alternative: Apache Reverse Proxy

Nếu không muốn dùng Node.js HTTPS, có thể dùng Apache mod_proxy:

See: `APACHE_PROXY_WINDOWS.md` (coming soon if needed)

---

## 📞 Need Help?

Common SSL cert locations on Windows:
- XAMPP: `C:\xampp\apache\conf\ssl.*\`
- Certbot: `C:\Certbot\live\<domain>\`
- IIS: `C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys\`

Paste output of this command if server won't start:
```powershell
node server-https.js
```
