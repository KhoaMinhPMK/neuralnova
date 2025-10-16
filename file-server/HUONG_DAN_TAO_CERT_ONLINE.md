# 🔐 Hướng dẫn tạo SSL Certificate bằng CertificateTools.com

Hướng dẫn chi tiết từng bước tạo self-signed certificate online không cần OpenSSL.

## 📝 Bước 1: Truy cập trang web

Mở: **https://certificatetools.com/**

## 🔑 Bước 2: Tạo Private Key

### 2.1. Chọn loại Private Key:

Tại mục **"Private Key"**, click vào dropdown và chọn:

```
✅ "Generate PKCS#8 RSA Private Key"
```

### 2.2. Chọn độ dài key:

Chọn: **2048 Bit** (hoặc 4096 Bit nếu muốn bảo mật cao hơn)

### 2.3. Mã hóa key (Optional):

- Nếu bạn muốn password-protect private key → Tích "Encrypt"
- Nếu không → **Bỏ trống** (dễ hơn cho dev)

**Khuyến nghị:** Bỏ trống cho đơn giản

---

## 📋 Bước 3: Điền thông tin Subject

Tại mục **"Subject Attributes"**, điền các thông tin:

| Field | Giá trị ví dụ | Mô tả |
|-------|---------------|-------|
| **Common Name (CN)** | `160.30.113.26` | ⚠️ **QUAN TRỌNG** - IP VPS của bạn |
| **Country (C)** | `VN` | Mã quốc gia (2 chữ cái) |
| **State (ST)** | `Ho Chi Minh` | Tỉnh/Thành phố |
| **Locality (L)** | `Ho Chi Minh` | Quận/Huyện |
| **Organization (O)** | `NeuralNova` | Tên tổ chức |
| **Organizational Unit (OU)** | `IT` | Phòng ban (optional) |

**Lưu ý:** Common Name **PHẢI** là IP hoặc domain của VPS!

---

## 🌐 Bước 4: Thêm Subject Alternative Names (Optional nhưng nên có)

Tại mục **"Subject Alternative Names"**:

### 4.1. Click "Add" → Chọn "IP"

Nhập: `160.30.113.26` (IP VPS của bạn)

### 4.2. Click "Add" thêm lần nữa → Chọn "DNS" (nếu có domain)

Nhập: `files.neuralnova.space` (nếu bạn có domain)

**Ví dụ kết quả:**
```
IP: 160.30.113.26
DNS: files.neuralnova.space
```

---

## 🔧 Bước 5: Cấu hình x509v3 Extensions

### 5.1. Key Usage (Để nguyên hoặc tùy chỉnh)

Tích các options sau:
- ✅ Digital Signature
- ✅ Key Encipherment

### 5.2. Extended Key Usage

Tích:
- ✅ **TLS Web Server Authentication** ← Quan trọng!

### 5.3. Basic Constraints (CA)

- **CA**: Chọn **"No"** (vì đây không phải Certificate Authority)
- Giữ nguyên các option khác

---

## ⏰ Bước 6: Chọn thời hạn Certificate

Tại mục **"CSR Options"**:

### 6.1. Hash Algorithm:
Chọn: **SHA256** (default OK)

### 6.2. Chọn "Self-Sign"
✅ Tích vào **"Self-Sign"**

### 6.3. Thời hạn:
- Chọn **365** Day(s) - Certificate có hiệu lực 1 năm
- Hoặc **3650** Day(s) nếu muốn 10 năm

---

## 🚀 Bước 7: Generate Certificate!

Click nút **"Submit"** màu xanh lá ở cuối trang!

⏳ Đợi vài giây...

---

## 💾 Bước 8: Download Files

Sau khi generate xong, trang sẽ hiển thị kết quả.

### 8.1. Download Private Key

1. Tìm phần **"Private Key"**
2. Click nút **"Download PEM"**
3. Lưu file với tên: **`key.pem`**

### 8.2. Download Certificate

1. Tìm phần **"Certificate"**
2. Click nút **"Download PEM"**
3. Lưu file với tên: **`cert.pem`**

---

## 📁 Bước 9: Upload lên VPS

### 9.1. Tạo thư mục ssl trên VPS

Kết nối VPS qua RDP, mở PowerShell:

```powershell
cd C:\xampp\htdocs\neuralnova\file-server
mkdir ssl
```

### 9.2. Copy 2 files vào thư mục ssl

Copy 2 files bạn vừa download vào thư mục:
```
C:\xampp\htdocs\neuralnova\file-server\ssl\
├── key.pem
└── cert.pem
```

**Cách copy:**
- Dùng RDP: Copy/Paste trực tiếp
- Hoặc dùng WinSCP/FileZilla để upload

---

## 🔥 Bước 10: Cấu hình Server sử dụng Certificate

### 10.1. Mở file server-https.js

Kiểm tra xem đã có code đọc cert chưa:

```javascript
const certPath = path.join(__dirname, 'ssl', 'cert.pem');
const keyPath = path.join(__dirname, 'ssl', 'key.pem');

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

https.createServer(httpsOptions, app).listen(3002, '0.0.0.0', () => {
    console.log('🔒 HTTPS Server running on port 3002');
});
```

✅ Nếu đã có → OK!

### 10.2. Stop server cũ

```powershell
pm2 stop file-server
# Hoặc
.\stop.bat
```

### 10.3. Start HTTPS server

```powershell
node server-https.js
```

Hoặc với PM2:

```powershell
pm2 start server-https.js --name file-server-https
pm2 save
```

---

## 🌐 Bước 11: Mở Port 3002 trên Firewall

```powershell
# Mở PowerShell với quyền Administrator
New-NetFirewallRule -DisplayName "File Server HTTPS" -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
```

---

## 🧪 Bước 12: Test HTTPS Server

### 12.1. Test từ trình duyệt

Mở: `https://160.30.113.26:3002`

**Lưu ý:** Browser sẽ cảnh báo "Not Secure" vì đây là self-signed certificate.

Click: **"Advanced"** → **"Proceed to 160.30.113.26"**

Nếu thấy JSON response → ✅ **HTTPS đang hoạt động!**

### 12.2. Test với curl

```bash
curl -k https://160.30.113.26:3002
```

(`-k` = bỏ qua certificate verification)

---

## 🎨 Bước 13: Cập nhật Frontend Code

Sửa file `pages/profile/app.js` và `pages/dashboard/app.js`:

```javascript
const FILE_SERVER = isLocal
    ? 'http://localhost:3001'
    : 'https://160.30.113.26:3002';  // ← Changed to HTTPS!
```

Lưu file và test lại!

---

## ✅ Bước 14: Trust Certificate (Quan trọng!)

Vì đây là self-signed cert, browser sẽ cảnh báo. Để bypass:

### Trên máy client (máy bạn dùng để browse):

1. Mở: `https://160.30.113.26:3002` trên Chrome/Firefox
2. Browser hiện cảnh báo **"Your connection is not private"**
3. Click **"Advanced"**
4. Click **"Proceed to 160.30.113.26 (unsafe)"**
5. ✅ Done! Browser đã trust certificate này

Giờ khi upload ảnh từ `https://neuralnova.space` → Không còn lỗi Mixed Content nữa!

---

## 📊 Tóm tắt các bước:

| Bước | Hành động | Thời gian |
|------|-----------|-----------|
| 1-2 | Truy cập certificatetools.com + Chọn RSA 2048 | 30s |
| 3-4 | Điền thông tin (CN = IP VPS) + Add SAN | 1 phút |
| 5-6 | Cấu hình extensions + Self-sign 365 days | 30s |
| 7-8 | Submit + Download key.pem + cert.pem | 30s |
| 9 | Upload 2 files vào VPS/ssl/ | 1 phút |
| 10 | Restart server với server-https.js | 30s |
| 11 | Mở port 3002 firewall | 30s |
| 12-14 | Test + Trust certificate | 1 phút |

**Tổng thời gian:** ~5-7 phút

---

## 🎯 Kết quả cuối cùng:

```
✅ File server chạy HTTPS trên port 3002
✅ Certificate valid 1 năm
✅ Upload ảnh từ HTTPS site không còn lỗi
✅ No more Mixed Content errors!
```

---

## 🔍 Troubleshooting:

### 1. "Cannot find module ssl/key.pem"

**Nguyên nhân:** Files không đúng vị trí

**Giải pháp:**
```powershell
# Check xem files có tồn tại không
dir C:\xampp\htdocs\neuralnova\file-server\ssl\

# Phải thấy 2 files:
# cert.pem
# key.pem
```

### 2. "Port 3002 already in use"

**Giải pháp:**
```powershell
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### 3. Browser vẫn báo "Not Secure"

**Đây là bình thường** với self-signed cert. Chỉ cần:
- Click "Advanced" → "Proceed"
- Hoặc add cert vào Trusted Root Certificates

### 4. Vẫn bị Mixed Content Error

**Giải pháp:**
- Clear browser cache (Ctrl+Shift+Del)
- Check console xem đang call URL nào
- Đảm bảo frontend code đã dùng HTTPS URL

---

## 💡 Tips:

1. **Common Name = IP VPS** là quan trọng nhất!
2. Thêm Subject Alternative Name (IP) để tránh lỗi
3. Certificate valid 365 ngày → Note lại để renew
4. Self-signed cert sẽ có browser warning → OK cho dev/test
5. Production nên dùng Let's Encrypt với domain thực

---

## 🌟 Nâng cao: Add Certificate vào Trusted (Windows)

Nếu muốn bỏ browser warning hoàn toàn:

1. Download `cert.pem` về máy local
2. Đổi tên thành `cert.crt`
3. Double-click file
4. Click "Install Certificate"
5. Chọn "Current User" → Next
6. Chọn "Place all certificates in the following store"
7. Browse → Chọn "Trusted Root Certification Authorities"
8. Next → Finish
9. Restart browser
10. ✅ Không còn warning!

---

## 📞 Cần giúp?

- Check logs: `pm2 logs file-server-https`
- Test certificate: `curl -k https://160.30.113.26:3002`
- Verify certificate: Mở trên browser và xem cert info (click ổ khóa)

---

**Xong rồi!** Giờ bạn đã có HTTPS file server! 🎉

Không còn Mixed Content Error nữa! 🚀
