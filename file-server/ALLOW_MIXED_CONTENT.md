# Allow Mixed Content in Browser

## 🔓 Mixed Content là gì?

**Mixed Content** = HTTPS page load HTTP resources

```
https://neuralnova.space (HTTPS) → http://neuralnova.space:3000 (HTTP)
```

Browser mặc định **block** để bảo mật. Nhưng chúng ta cần **allow** để upload files.

---

## 🌐 Chrome / Edge (Chromium-based)

### **Option 1: Allow for Specific Site (Recommended)**

1. Click **shield icon** (🛡️) bên trái URL bar khi thấy "Mixed content blocked"
2. Click **"Site settings"**
3. Tìm **"Insecure content"**
4. Chọn **"Allow"**
5. Refresh page

### **Option 2: Temporary Flag (Development)**

1. Close all Chrome/Edge windows
2. Run Chrome with flag:
   ```cmd
   chrome.exe --allow-running-insecure-content --user-data-dir=C:\temp\chrome-dev
   ```
3. Navigate to `https://neuralnova.space`
4. Upload will work

### **Option 3: Extension (DevTools)**

1. Open DevTools (F12)
2. Click **Console** tab
3. When you see "Mixed Content" warning
4. Click **"Load unsafe scripts"** in the warning banner

---

## 🦊 Firefox

### **Option 1: Allow for Page**

1. Khi thấy **shield icon** (🛡️) bên trái URL bar
2. Click shield → **"Disable Protection for This Session"**
3. Refresh page

### **Option 2: Permanent Setting**

1. Type in URL bar: `about:config`
2. Click **"Accept the Risk and Continue"**
3. Search: `security.mixed_content.block_active_content`
4. Double-click to set to **false**
5. Restart browser

**Warning**: This affects ALL sites! Revert sau khi test xong.

---

## 🎯 Safari

1. **Safari** → **Preferences**
2. **Security** tab
3. Uncheck **"Warn when visiting a fraudulent website"** (temporary)
4. Refresh page

---

## ⚡ QUICK START

### **Bước 1: Deploy Code**

```bash
# Local
git add .
git commit -m "fix: use HTTP for file server with mixed content"
git push origin main
```

```powershell
# VPS
cd C:\xampp\htdocs\neuralnova
git pull origin main

# Stop HTTPS server (if running)
# Start HTTP server
cd file-server
node server.js
# OR: npm start
```

### **Bước 2: Test Health Check**

```
http://neuralnova.space:3000/health
```

Expected:
```json
{"success":true,"status":"healthy",...}
```

### **Bước 3: Allow Mixed Content**

**Chrome/Edge**:
1. Go to: `https://neuralnova.space/pages/profile/index.html`
2. Click shield icon 🛡️
3. **Site settings** → **Insecure content** → **Allow**
4. Refresh

**Firefox**:
1. Go to: `https://neuralnova.space/pages/profile/index.html`
2. Click shield icon 🛡️
3. **Disable Protection for This Session**
4. Refresh

### **Bước 4: Upload Avatar**

1. Console (F12) should show:
   ```
   📁 File Server: http://neuralnova.space:3000
   ```
2. Upload avatar
3. Should work! ✅

---

## 🔍 Troubleshooting

### Issue: Still "Mixed Content" error

**Fix**: Make sure you:
1. ✅ Allowed insecure content in browser settings
2. ✅ Refreshed page after allowing (Ctrl + Shift + R)
3. ✅ Node.js server running on port 3000
4. ✅ Console shows `http://` (not `https://`)

### Issue: Shield icon not showing

**Fix**: 
- Browser already blocking silently
- Check console (F12) for "Mixed Content" error
- Manually allow via `chrome://settings/content/siteDetails?site=https://neuralnova.space`

---

## ⚖️ Security Note

**Mixed content is blocked for good reasons!**

For development/testing: OK to allow ✅  
For production: **Get real SSL certificate** or **use Nginx proxy** 🔒

---

## 🎓 Why This Works

```
Browser Settings: Allow HTTP from this site
        ↓
HTTPS page → HTTP resource = ALLOWED
        ↓
Upload works! ✅
```

Browser trusts **your explicit permission** to load HTTP resources.

---

## 📚 References

- [MDN: Mixed Content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
- [Chrome: Insecure Content](https://support.google.com/chrome/answer/1342714)
