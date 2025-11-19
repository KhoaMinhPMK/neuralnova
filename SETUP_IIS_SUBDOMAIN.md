# 🌐 Setup IIS Site cho File Server

## Bước 1: Tạo IIS Site

### 1.1. Mở IIS Manager
- Windows Key + R → `inetmgr` → Enter

### 1.2. Add New Website
1. Right-click **Sites** → **Add Website**
2. Điền thông tin:

```
Site name: neuralnova-files
Physical path: C:\inetpub\wwwroot\neuralnova.space\file-server
```

3. Click **Select...** để chọn Application Pool:
   - Application Pool: **DefaultAppPool** 
   - Click **OK**

4. Binding settings:
```
Type: http
IP address: All Unassigned
Port: 80
Host name: files.neuralnova.space
```

5. Click **OK**

### 1.3. Configure Application Pool (QUAN TRỌNG!)

1. Click **Application Pools** (menu bên trái)
2. Tìm pool của site `neuralnova-files`
3. Right-click → **Advanced Settings**
4. Đổi settings sau:

```
.NET CLR Version: No Managed Code
Start Mode: AlwaysRunning
Idle Time-out (minutes): 0
```

5. Click **OK**

---

## Bước 2: Verify web.config

File `web.config` đã có sẵn tại:
```
C:\inetpub\wwwroot\neuralnova.space\file-server\web.config
```

Nội dung:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:3001/{R:1}" />
                    <serverVariables>
                        <set name="HTTP_X_ORIGINAL_HOST" value="{HTTP_HOST}" />
                        <set name="HTTP_X_FORWARDED_FOR" value="{REMOTE_ADDR}" />
                    </serverVariables>
                </rule>
            </rules>
        </rewrite>
        <directoryBrowse enabled="false" />
    </system.webServer>
</configuration>
```

✅ File này đã OK, không cần sửa gì!

---

## Bước 3: Point DNS

Trong **Domain DNS Settings** (GoDaddy, Cloudflare, etc.):

### 3.1. Thêm A Record

```
Type: A
Name: files
Value: <VPS_IP_ADDRESS>
TTL: 3600 (hoặc Auto)
```

VD: Nếu domain chính là `neuralnova.space`, IP VPS là `160.30.113.26`:
```
Type: A
Name: files
Value: 160.30.113.26
TTL: 3600
```

### 3.2. Đợi DNS Propagate

DNS thường mất 5-30 phút để update. Check bằng:

```powershell
# Windows Command Prompt
nslookup files.neuralnova.space

# Hoặc dùng online tool:
# https://dnschecker.org
```

---

## Bước 4: Test IIS Reverse Proxy

### 4.1. Test Health

Mở browser hoặc dùng curl:

```powershell
# Test trực tiếp Node.js
curl http://localhost:3001

# Test qua IIS
curl http://files.neuralnova.space
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Server đang chạy!",
  "time": "2025-11-19T..."
}
```

### 4.2. Test Upload

```powershell
# Tạo file test
echo "test upload" > test.txt

# Upload qua IIS
curl -F "file=@test.txt" http://files.neuralnova.space/upload
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Upload thành công!",
  "file": {
    "name": "1234567890-abc123.txt",
    "url": "http://files.neuralnova.space/uploads/1234567890-abc123.txt"
  }
}
```

---

## Bước 5: Setup SSL (HTTPS) - QUAN TRỌNG!

### 5.1. Download Win-ACME

```powershell
# Download Win-ACME
# https://www.win-acme.com/

# Unzip to: C:\Tools\win-acme
```

### 5.2. Run Win-ACME

```powershell
# Navigate to folder
cd C:\Tools\win-acme

# Run as Administrator
.\wacs.exe
```

### 5.3. Certificate Wizard

Làm theo wizard:

```
1. Choose: N - Create certificate (default settings)
2. Choose: 2 - Manual input
3. Host: files.neuralnova.space
4. Friendly name: neuralnova-files
5. Validation: 1 - [http-01] Save verification files on (network) path
6. Path: C:\inetpub\wwwroot\neuralnova.space\file-server
7. Continue? Y
8. Store: Enter (default)
9. Installation: 1 - Create or update https bindings in IIS
10. Site: neuralnova-files
11. Continue? Y
12. Schedule task for auto-renew? Y
```

Win-ACME sẽ:
- ✅ Tạo SSL certificate từ Let's Encrypt (FREE)
- ✅ Bind certificate vào IIS site
- ✅ Setup auto-renew task (chạy mỗi ngày, renew trước 30 ngày hết hạn)

### 5.4. Verify HTTPS

```powershell
# Test HTTPS
curl https://files.neuralnova.space

# Check certificate
# Mở browser: https://files.neuralnova.space
# Click vào 🔒 lock icon → Certificate
```

---

## Bước 6: Force HTTPS Redirect (Optional)

Để tự động redirect HTTP → HTTPS, update `web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <!-- HTTPS Redirect -->
                <rule name="Force HTTPS" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions>
                        <add input="{HTTPS}" pattern="^OFF$" />
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
                </rule>
                
                <!-- Reverse Proxy -->
                <rule name="ReverseProxyInboundRule" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:3001/{R:1}" />
                    <serverVariables>
                        <set name="HTTP_X_ORIGINAL_HOST" value="{HTTP_HOST}" />
                        <set name="HTTP_X_FORWARDED_FOR" value="{REMOTE_ADDR}" />
                    </serverVariables>
                </rule>
            </rules>
        </rewrite>
        <directoryBrowse enabled="false" />
    </system.webServer>
</configuration>
```

---

## ✅ Final Checklist

- [ ] IIS site created: `neuralnova-files`
- [ ] Application pool: No Managed Code
- [ ] `web.config` exists và correct
- [ ] DNS A record added: `files` → VPS IP
- [ ] DNS propagated (check với nslookup)
- [ ] HTTP test working: `http://files.neuralnova.space`
- [ ] SSL certificate installed
- [ ] HTTPS test working: `https://files.neuralnova.space`
- [ ] Upload test successful
- [ ] Auto-renew task scheduled
- [ ] PM2 service `online`

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to files.neuralnova.space"

**Check:**
```powershell
# 1. Check DNS
nslookup files.neuralnova.space

# 2. Check IIS site running
# IIS Manager → Sites → neuralnova-files → Status: Started

# 3. Check Node.js running
pm2 status

# 4. Test localhost first
curl http://localhost:3001
curl http://localhost (IIS)
```

### Issue 2: "502 Bad Gateway"

**Nghĩa là:** IIS OK nhưng không connect được tới Node.js

**Fix:**
```powershell
# Restart Node.js
pm2 restart neuralnova-fileserver

# Check logs
pm2 logs
```

### Issue 3: "SSL Certificate Error"

**Fix:**
```powershell
# Re-run Win-ACME
cd C:\Tools\win-acme
.\wacs.exe

# Choose: A - Renew all
```

### Issue 4: "Upload fails with 404"

**Check:**
```powershell
# Kiểm tra web.config có đúng không
type C:\inetpub\wwwroot\neuralnova.space\file-server\web.config

# Test upload trực tiếp vào Node.js
curl -F "file=@test.txt" http://localhost:3001/upload
```

---

## 📊 URLs sau khi setup

| Service | URL | Purpose |
|---------|-----|---------|
| **Main Site** | https://neuralnova.space | Frontend |
| **API** | https://neuralnova.space/backend/api | PHP Backend |
| **File Server** | https://files.neuralnova.space | Upload/Download |
| **Health Check** | https://files.neuralnova.space | Server status |

---

**Setup Date:** 2025-11-19
**Expire:** SSL auto-renew every 90 days
