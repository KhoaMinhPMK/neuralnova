# VPS Node.js File Server Setup - Step by Step

## 🎯 **MỤC TIÊU**:
Deploy Node.js file server lên VPS để chạy trên port 3000

---

## 📋 **STEP 1: CHECK NODE.JS TRÊN VPS**

### **SSH vào VPS**:
```bash
ssh user@neuralnova.space
```

### **Check Node.js version**:
```bash
node --version
npm --version
```

**Nếu chưa có Node.js hoặc version < 18**, install:

### **Install Node.js 20.x LTS** (Ubuntu/Debian):
```bash
# Update system
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x.x
npm --version   # Should be v10.x.x
```

### **Install Node.js** (CentOS/AlmaLinux):
```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify
node --version
npm --version
```

---

## 📋 **STEP 2: UPLOAD FILE-SERVER**

### **Option A: Git** (Khuyến nghị):
```bash
# Trên local
git add file-server/
git commit -m "feat: Node.js file server"
git push origin main

# Trên VPS
ssh user@neuralnova.space
cd /var/www/neuralnova  # Hoặc path của bạn
git pull origin main
```

### **Option B: SCP Upload**:
```bash
# Từ máy local (PowerShell/CMD)
scp -r file-server user@neuralnova.space:/var/www/neuralnova/
```

### **Verify**:
```bash
# Trên VPS
ls -la /var/www/neuralnova/file-server/
# Phải thấy: server.js, package.json, config.js...
```

---

## 📋 **STEP 3: INSTALL DEPENDENCIES**

```bash
cd /var/www/neuralnova/file-server

# Install packages
npm install --production

# Verify
ls -la node_modules/
# Phải thấy: express, multer, sharp, cors...
```

---

## 📋 **STEP 4: CREATE UPLOAD FOLDERS**

```bash
# Create directories
mkdir -p uploads/avatars
mkdir -p uploads/covers
mkdir -p uploads/posts

# Set permissions
chmod -R 755 uploads
chown -R www-data:www-data uploads  # hoặc user của Apache/Nginx

# Verify
ls -la uploads/
```

---

## 📋 **STEP 5: INSTALL PM2** (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

---

## 📋 **STEP 6: START SERVER**

```bash
cd /var/www/neuralnova/file-server

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 list
# Should see: neuralnova-files | online | 2 instances

# Check logs
pm2 logs neuralnova-files --lines 20
```

**Expected output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NeuralNova File Server
📡 Port: 3000
✅ Server ready!
```

---

## 📋 **STEP 7: SETUP AUTO-START** (Khởi động cùng VPS)

```bash
# Generate startup script
pm2 startup

# Copy and run the command PM2 shows (something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user

# Save current PM2 list
pm2 save
```

**Verify**:
```bash
# Reboot VPS
sudo reboot

# After reboot, SSH lại
ssh user@neuralnova.space

# Check PM2
pm2 list
# Should see: neuralnova-files | online
```

---

## 📋 **STEP 8: CONFIGURE FIREWALL**

### **Allow Port 3000**:
```bash
# UFW (Ubuntu)
sudo ufw allow 3000/tcp
sudo ufw reload
sudo ufw status

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### **Check if port is open**:
```bash
netstat -tlnp | grep 3000
# Should see: tcp ... :3000 ... LISTEN
```

---

## 📋 **STEP 9: TEST SERVER**

### **Test từ VPS**:
```bash
curl http://localhost:3000/health
```

**Expected**:
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 12.345
}
```

### **Test từ browser**:
```
https://neuralnova.space:3000/health
```

**Nếu thấy JSON** → ✅ SUCCESS!  
**Nếu timeout** → Firewall blocking

---

## 🔥 **TROUBLESHOOTING**:

### **Port 3000 bị block**:
```bash
# Check firewall
sudo ufw status
sudo iptables -L -n | grep 3000

# Allow port
sudo ufw allow 3000
```

### **Server không start**:
```bash
# Check logs
pm2 logs neuralnova-files --lines 50

# Restart
pm2 restart neuralnova-files

# Check process
pm2 describe neuralnova-files
```

### **Permission errors**:
```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/neuralnova/file-server
chmod -R 755 uploads/
```

---

## ✅ **VERIFICATION CHECKLIST**:

- [ ] Node.js installed (v18+)
- [ ] PM2 installed
- [ ] file-server uploaded
- [ ] npm install completed
- [ ] Upload folders created
- [ ] Server started with PM2
- [ ] Auto-startup configured
- [ ] Firewall port 3000 open
- [ ] Health endpoint accessible
- [ ] Can upload from frontend

---

## 🎯 **FINAL TEST**:

### **1. Health Check**:
```
https://neuralnova.space:3000/health
```

### **2. Upload Test**:
```bash
curl -F "avatar=@test.jpg" https://neuralnova.space:3000/upload/avatar
```

### **3. Frontend Test**:
```
https://neuralnova.space/pages/profile/index.html
→ Upload avatar
→ Check Console
```

**Expected**:
```
📤 Uploading avatar to Node.js server...
📡 Avatar upload status: 200
📦 Avatar response: {success: true, file: {...}}
✅ Profile picture updated!
```

---

## 🚀 **QUICK COMMANDS SUMMARY**:

```bash
# 1. SSH
ssh user@neuralnova.space

# 2. Go to project
cd /var/www/neuralnova

# 3. Pull code
git pull origin main

# 4. Setup
cd file-server
npm install --production
mkdir -p uploads/{avatars,covers,posts}
chmod -R 755 uploads

# 5. Install PM2 (if not installed)
sudo npm install -g pm2

# 6. Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Open firewall
sudo ufw allow 3000/tcp
sudo ufw reload

# 8. Test
curl http://localhost:3000/health
```

**Done!** 🎉

---

**Bắt đầu từ STEP 1 nhé! Paste output của từng step cho tôi biết!** 🚀
