# CORS Fix for Localhost Testing

## ❌ **VẤN ĐỀ**:
```
Access-Control-Allow-Origin header must not be '*' when credentials mode is 'include'
```

Lỗi xảy ra khi test từ **localhost:5500** (Live Server) call API production.

---

## ✅ **ĐÃ FIX**:

### **File Updated**: `backend/api/auth/check-session.php`

**Logic mới**:
- ✅ Cho phép localhost với **bất kỳ port nào** (5500, 3000, 8080...)
- ✅ Cho phép 127.0.0.1 với **bất kỳ port nào**
- ✅ Vẫn an toàn cho production (chỉ neuralnova.space)

---

## 🚀 **DEPLOYMENT**:

### **Option 1: Upload Manual**
```bash
# SSH vào VPS
ssh user@neuralnova.space

# Navigate to backend
cd /path/to/neuralnova/backend/api/auth/

# Edit file
nano check-session.php

# Copy nội dung từ local file và paste
# Save: Ctrl+X, Y, Enter
```

### **Option 2: SCP Upload**
```bash
scp backend/api/auth/check-session.php user@neuralnova.space:/path/to/neuralnova/backend/api/auth/
```

### **Option 3: Git Push**
```bash
git add backend/api/auth/check-session.php
git commit -m "fix: CORS for localhost testing"
git push origin main

# Trên server
cd /path/to/neuralnova
git pull origin main
```

---

## 🧪 **TEST NGAY**:

### **1. Hard Refresh Browser**:
```
Ctrl + Shift + R
```

### **2. Clear Cache**:
```javascript
// Console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### **3. Check Console**:
Không còn CORS error, sẽ thấy:
```
📦 Profile data: {success: true, user: {...}}
✅ Profile loaded: Your Name Posts: X
```

---

## 🔧 **ALTERNATIVE: Test trên Production**

Thay vì test localhost, upload lên server và test trực tiếp:

```bash
# Upload profile page
scp -r pages/profile/* user@neuralnova.space:/path/to/web/pages/profile/

# Access
https://neuralnova.space/pages/profile/index.html
```

**Ưu điểm**:
- ✅ Không cần fix CORS
- ✅ Test environment giống production 100%
- ✅ Không cần local server

---

## 📋 **CHECKLIST**:

- [ ] Upload `check-session.php` lên server
- [ ] Clear browser cache
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Check Console - không còn CORS error
- [ ] Profile name hiện đúng
- [ ] Posts count hiện đúng
- [ ] Posts feed hiện data

---

## 🚨 **NẾU VẪN LỖI**:

### **Check trên server**:
```bash
# Verify file đã update chưa
ssh user@neuralnova.space
cat /path/to/neuralnova/backend/api/auth/check-session.php | head -50

# Restart PHP-FPM (nếu cần)
sudo systemctl restart php-fpm
# hoặc
sudo systemctl restart apache2
```

### **Check CORS headers**:
```bash
# Test CORS
curl -H "Origin: http://127.0.0.1:5500" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     -v \
     https://neuralnova.space/backend/api/auth/check-session.php
```

**Expected response**:
```
Access-Control-Allow-Origin: http://127.0.0.1:5500
Access-Control-Allow-Credentials: true
```

---

## 💡 **TIP**:

Để tránh CORS issues trong development, khuyến nghị:

1. **Setup local backend** (XAMPP/WAMP)
2. **Hoặc test trên production** (upload và test trực tiếp)
3. **Hoặc dùng proxy** (webpack dev server, vite, etc.)

---

**Updated**: 2025-10-16
**Status**: ✅ Fixed - Ready to deploy
