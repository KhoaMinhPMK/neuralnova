# 🔒 Setup HTTPS cho File Server

Hướng dẫn setup HTTPS để tránh Mixed Content Error.

## ❌ Vấn đề:

Browser block khi HTTPS site gọi HTTP server:
```
https://neuralnova.space → http://160.30.113.26:3001 ❌ BLOCKED!
```

## ✅ Giải pháp:

### Option 1: Tạm thời - Allow Mixed Content (Nhanh)

**Chrome:**
1. Click biểu tượng ổ khóa trên URL bar
2. "Site settings" → "Insecure content" → "Allow"
3. Reload page

**Firefox:**
1. Click shield icon trên URL bar
2. "Disable protection for now"

---

### Option 2: Setup HTTPS (Lâu dài - Khuyến nghị)

## 🔐 Bước 1: Tạo Self-Signed Certificate

Trên VPS Windows, mở PowerShell:

```powershell
cd C:\xampp\htdocs\neuralnova\file-server

# Tạo thư mục ssl
mkdir ssl

# Tạo self-signed certificate (valid 365 ngày)
# Yêu cầu OpenSSL (có sẵn trong Git for Windows)
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=160.30.113.26"
```

**Nếu không có OpenSSL:**

Download Git for Windows (có OpenSSL): https://git-scm.com/download/win

Hoặc dùng online tool: https://certificatetools.com/

## 🚀 Bước 2: Chạy HTTPS Server

```powershell
# Stop HTTP server cũ
pm2 stop file-server

# Start HTTPS server
node server-https.js

# Hoặc với PM2
pm2 start server-https.js --name file-server-https
pm2 save
```

Server sẽ chạy 2 ports:
- **HTTP**: 3001 (giữ nguyên cho compatibility)
- **HTTPS**: 3002 (mới)

## 🔥 Bước 3: Mở Port 3002 trên Firewall

```powershell
New-NetFirewallRule -DisplayName "File Server HTTPS" -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
```

## 🌐 Bước 4: Cập nhật Frontend Code

Sửa file `pages/profile/app.js` và `pages/dashboard/app.js`:

```javascript
const FILE_SERVER = isLocal
    ? 'http://localhost:3001'
    : 'https://160.30.113.26:3002';  // Changed to HTTPS port 3002
```

## ⚠️ Bước 5: Trust Self-Signed Certificate

Vì dùng self-signed certificate, browser sẽ cảnh báo "Not Secure". Để bypass:

**Trên máy client (máy dùng để browse):**

1. Truy cập: `https://160.30.113.26:3002`
2. Browser hiện cảnh báo "Your connection is not private"
3. Click "Advanced" → "Proceed to 160.30.113.26 (unsafe)"
4. Giờ browser đã trust certificate này

**Hoặc:** Add certificate vào Trusted Root Certificates (khuyến nghị)

## 🎯 Test:

```bash
# Test HTTPS
curl -k https://160.30.113.26:3002

# Test upload
curl -k -X POST https://160.30.113.26:3002/upload -F "file=@image.jpg"
```

(`-k` = ignore certificate verification)

---

## 🌟 Option 3: Dùng Domain + Let's Encrypt (Production đúng chuẩn)

### Bước 1: Trỏ subdomain về VPS

Vào quản lý DNS của domain và thêm:
```
A Record: files.neuralnova.space → 160.30.113.26
```

### Bước 2: Install Certbot trên Windows

Download: https://dl.eff.org/certbot-beta-installer-win32.exe

### Bước 3: Lấy SSL Certificate

```powershell
certbot certonly --standalone -d files.neuralnova.space
```

Certificates sẽ được lưu tại:
- `C:\Certbot\live\files.neuralnova.space\fullchain.pem`
- `C:\Certbot\live\files.neuralnova.space\privkey.pem`

### Bước 4: Update server-https.js

```javascript
const httpsOptions = {
    key: fs.readFileSync('C:\\Certbot\\live\\files.neuralnova.space\\privkey.pem'),
    cert: fs.readFileSync('C:\\Certbot\\live\\files.neuralnova.space\\fullchain.pem')
};
```

### Bước 5: Update Frontend

```javascript
const FILE_SERVER = isLocal
    ? 'http://localhost:3001'
    : 'https://files.neuralnova.space';  // Proper domain!
```

### Bước 6: Auto-renew Certificate

Let's Encrypt certificates expire sau 90 ngày. Setup auto-renew:

Tạo Task Scheduler chạy hàng tháng:
```powershell
certbot renew
pm2 restart file-server-https
```

---

## 📊 So sánh Options:

| Option | Pros | Cons | Khuyến nghị |
|--------|------|------|-------------|
| 1. Allow Mixed Content | ✅ Nhanh nhất<br>✅ Không cần setup gì | ❌ Không an toàn<br>❌ Chỉ cho test<br>❌ Mỗi user phải allow | Test only |
| 2. Self-Signed Cert | ✅ Miễn phí<br>✅ Setup nhanh | ❌ Browser warning<br>❌ Mỗi user phải trust | Dev/Staging |
| 3. Let's Encrypt + Domain | ✅ Miễn phí<br>✅ Trusted certificate<br>✅ No browser warning | ❌ Cần domain<br>❌ Setup lâu hơn | **Production** |

## 🎯 Khuyến nghị theo mục đích:

### Đang dev/test → **Option 1** (Allow Mixed Content)
- Nhanh nhất
- Chỉ cần click vài cái trong browser

### Có VPS nhưng chưa có domain → **Option 2** (Self-Signed)
- Setup trong 5 phút
- User phải trust certificate 1 lần

### Production với domain → **Option 3** (Let's Encrypt)
- Chuẩn nhất
- Không có warning
- Professional

---

## 🔍 Troubleshooting:

### 1. "openssl command not found"

**Solution:** Install Git for Windows (có OpenSSL built-in)

### 2. Certificate expired

**Solution:** Renew certificate
```powershell
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=160.30.113.26"
pm2 restart file-server-https
```

### 3. Port 3002 không access được

**Solution:** Check firewall
```powershell
New-NetFirewallRule -DisplayName "File Server HTTPS" -Direction Inbound -LocalPort 3002 -Protocol TCP -Allow
```

### 4. Still getting Mixed Content error

**Solution:** 
- Clear browser cache
- Check console để xem đang call URL nào
- Đảm bảo frontend code đã update đúng URL HTTPS

---

## 💡 Quick Start (Nhanh nhất):

**Giải pháp tạm thời (1 phút):**

1. Truy cập site: `https://neuralnova.space/pages/profile/`
2. Click vào shield/lock icon trên URL bar
3. Allow insecure content
4. Reload page
5. Upload ảnh ngay!

Done! ✅

---

**Có câu hỏi?** Check logs:
```powershell
pm2 logs file-server-https
```

noteId: "6cf2e320aa7811f0bb8ab337bc42cc1f"
tags: []

---

