# 🖼️ Fix hiển thị ảnh - Proxy qua Apache

## ❌ Vấn đề:

Ảnh upload thành công nhưng không hiển thị vì Mixed Content:
```
https://neuralnova.space  →  ❌ http://160.30.113.26:3001/uploads/image.jpg
```

## ✅ Giải pháp: Proxy ảnh qua Apache

### Bước 1: Update Apache config

Mở file: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

Thêm vào trong `<VirtualHost *:443>` của neuralnova.space:

```apache
<VirtualHost *:443>
    ServerName neuralnova.space
    DocumentRoot "C:/xampp/htdocs/neuralnova"
    SSLEngine on
    SSLCertificateFile "C:/MyCertificates/fullchain.pem"
    SSLCertificateKeyFile "C:/MyCertificates/privkey.pem"
    
    <Directory "C:/xampp/htdocs/neuralnova">
        AllowOverride All
        Require all granted
    </Directory>

    # ========== FILE SERVER REVERSE PROXY ==========
    ProxyPreserveHost On
    ProxyRequests Off
    
    # API endpoints
    <Location /file-server>
        ProxyPass http://localhost:3001
        ProxyPassReverse http://localhost:3001
        
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Location>
    
    # ⭐ THÊM DÒNG NÀY - Proxy uploads qua HTTPS
    <Location /uploads>
        ProxyPass http://localhost:3001/uploads
        ProxyPassReverse http://localhost:3001/uploads
        
        Header always set Access-Control-Allow-Origin "*"
        Header always set Cache-Control "public, max-age=31536000"
    </Location>
    # ================================================

</VirtualHost>
```

### Bước 2: Restart Apache

XAMPP Control Panel → Stop Apache → Start

### Bước 3: Test

Truy cập ảnh qua HTTPS:
```
https://neuralnova.space/uploads/avatars/filename.jpg
```

Nếu thấy ảnh → ✅ Proxy OK!

---

## Không cần sửa code!

URLs trong database giữ nguyên:
```
http://160.30.113.26:3001/uploads/...
```

Nhưng hiển thị qua Apache proxy:
```
https://neuralnova.space/uploads/...
```

noteId: "dfac2f10aa7e11f0bb8ab337bc42cc1f"
tags: []

---

