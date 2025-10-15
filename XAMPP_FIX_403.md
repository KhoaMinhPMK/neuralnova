# 🔧 Fix 403 Forbidden Error - XAMPP

## ❌ Error:
```
Forbidden
You don't have permission to access this resource.
Apache/2.4.58 (Win64) Server at neuralnova.space Port 443
```

---

## ✅ Solutions:

### **Solution 1: Update .htaccess (DONE ✅)**

File `.htaccess` đã được update với:
```apache
# Allow Access
<IfModule mod_authz_core.c>
  Require all granted
</IfModule>

Options +Indexes +FollowSymLinks
DirectoryIndex index.html index.php
```

---

### **Solution 2: Fix XAMPP httpd.conf**

#### **Bước 1: Mở XAMPP Config**

1. Mở **XAMPP Control Panel**
2. Click **"Config"** bên cạnh Apache
3. Chọn **"httpd.conf"**

#### **Bước 2: Tìm và sửa Directory config**

Tìm dòng này (Ctrl+F):
```apache
<Directory "C:/xampp/htdocs">
```

Sửa thành:
```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

**Lưu file!**

---

### **Solution 3: Fix Virtual Host Config (nếu dùng virtual host)**

Vì bạn đang truy cập qua `neuralnova.space` thay vì `localhost`, có virtual host.

#### **Bước 1: Mở httpd-vhosts.conf**

1. XAMPP Control Panel → Apache → **Config**
2. Chọn **"httpd-vhosts.conf"**

#### **Bước 2: Thêm/Sửa Virtual Host**

Tìm hoặc thêm config cho `neuralnova.space`:

```apache
<VirtualHost *:80>
    ServerName neuralnova.space
    ServerAlias www.neuralnova.space
    DocumentRoot "C:/xampp/htdocs/neuralnova"
    
    <Directory "C:/xampp/htdocs/neuralnova">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "logs/neuralnova-error.log"
    CustomLog "logs/neuralnova-access.log" common
</VirtualHost>

# SSL Virtual Host (Port 443)
<VirtualHost *:443>
    ServerName neuralnova.space
    ServerAlias www.neuralnova.space
    DocumentRoot "C:/xampp/htdocs/neuralnova"
    
    <Directory "C:/xampp/htdocs/neuralnova">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    SSLEngine on
    SSLCertificateFile "conf/ssl.crt/server.crt"
    SSLCertificateKeyFile "conf/ssl.key/server.key"
    
    ErrorLog "logs/neuralnova-ssl-error.log"
    CustomLog "logs/neuralnova-ssl-access.log" common
</VirtualHost>
```

**Lưu file!**

---

### **Solution 4: Fix Windows hosts file**

Đảm bảo `neuralnova.space` trỏ về localhost.

#### **Bước 1: Mở Notepad as Administrator**

1. Right-click **Notepad**
2. Chọn **"Run as administrator"**

#### **Bước 2: Mở file hosts**

File → Open:
```
C:\Windows\System32\drivers\etc\hosts
```

#### **Bước 3: Thêm dòng này**

```
127.0.0.1 neuralnova.space
127.0.0.1 www.neuralnova.space
```

**Lưu file!**

---

### **Solution 5: Restart Apache**

Sau khi sửa bất kỳ file config nào:

1. Mở **XAMPP Control Panel**
2. Click **"Stop"** Apache
3. Chờ 2-3 giây
4. Click **"Start"** Apache

---

## 🧪 Test lại:

### **HTTP (Port 80):**
```
http://neuralnova.space/pages/auth/index.html
http://neuralnova.space/backend/tests/simple-test.html
```

### **HTTPS (Port 443):**
```
https://neuralnova.space/pages/auth/index.html
https://neuralnova.space/backend/tests/simple-test.html
```

### **Hoặc dùng localhost:**
```
http://localhost/neuralnova/pages/auth/index.html
http://localhost/neuralnova/backend/tests/simple-test.html
```

---

## 🔍 Debug nếu vẫn lỗi:

### **Check Apache Error Log:**

XAMPP Control Panel → Apache → **Logs** button → **"Error"**

Xem dòng cuối có gì, gửi cho tôi.

---

### **Test permissions:**

Mở CMD as Administrator:
```cmd
cd C:\xampp\htdocs\neuralnova
dir /s
```

Xem có file nào bị deny không.

---

## 📝 Tóm tắt các bước:

1. ✅ `.htaccess` đã fix (automatic)
2. ⏳ Sửa `httpd.conf` → Thêm `Require all granted`
3. ⏳ Sửa `httpd-vhosts.conf` → Thêm `<Directory>` config
4. ⏳ Restart Apache
5. ⏳ Test lại

---

**Thử các solution trên và báo kết quả nhé!** 🚀

---

**Quick Fix Command:**
```cmd
# Run as Administrator
net stop Apache2.4
net start Apache2.4
```
