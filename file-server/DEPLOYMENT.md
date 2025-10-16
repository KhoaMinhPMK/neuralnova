# File Server Deployment Guide

## 🚀 **QUICK START**:

### **1. Install Dependencies**:
```bash
cd file-server
npm install
```

### **2. Create Upload Folders**:
```bash
mkdir -p uploads/avatars uploads/covers uploads/posts
chmod -R 755 uploads
```

### **3. Start Server**:
```bash
# Development
npm run dev

# Production
npm start

# Or with PM2
npm run pm2:start
```

---

## 📡 **DEPLOYMENT TO VPS**:

### **Method 1: Direct Deployment**

```bash
# 1. Upload files to server
scp -r file-server/* user@neuralnova.space:/path/to/neuralnova/file-server/

# 2. SSH to server
ssh user@neuralnova.space

# 3. Install dependencies
cd /path/to/neuralnova/file-server
npm install --production

# 4. Create directories
mkdir -p uploads/avatars uploads/covers uploads/posts
chmod -R 755 uploads

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Method 2: Git Deployment**

```bash
# Local
git add file-server/
git commit -m "feat: add Node.js file server"
git push origin main

# Server
ssh user@neuralnova.space
cd /path/to/neuralnova
git pull origin main
cd file-server
npm install --production
pm2 start ecosystem.config.js
```

### **Method 3: Docker Deployment**

```bash
# Build image
docker build -t neuralnova-files .

# Run container
docker run -d \
  --name neuralnova-files \
  -p 3000:3000 \
  -v /path/to/uploads:/app/uploads \
  --restart unless-stopped \
  neuralnova-files
```

---

## 🌐 **NGINX CONFIGURATION**:

### **Add to `/etc/nginx/sites-available/neuralnova.space`**:

```nginx
# Node.js File Server - Port 3000
upstream file_server {
    server localhost:3000;
}

server {
    listen 80;
    server_name neuralnova.space;

    # Existing PHP config...

    # File upload endpoint (reverse proxy to Node.js)
    location /file-server/ {
        proxy_pass http://file_server/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # File upload size limit
        client_max_body_size 50M;
        
        # Timeouts
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Static file serving (uploaded files)
    location /uploads/ {
        alias /path/to/neuralnova/file-server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
}
```

### **Test & Reload**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔥 **FIREWALL SETUP**:

### **Allow Port 3000** (if using direct port access):
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

### **Or use Nginx proxy** (recommended):
- Access qua `/file-server/` endpoint
- Không cần expose port 3000 ra ngoài
- An toàn hơn

---

## 📊 **MONITORING**:

### **PM2 Commands**:
```bash
pm2 list                          # List all processes
pm2 logs neuralnova-files         # View logs
pm2 monit                         # Monitor resources
pm2 restart neuralnova-files      # Restart server
pm2 reload neuralnova-files       # Zero-downtime reload
pm2 stop neuralnova-files         # Stop server
```

### **Check Server Health**:
```bash
curl https://neuralnova.space:3000/health
# Or via Nginx proxy
curl https://neuralnova.space/file-server/health
```

---

## 🧪 **TESTING**:

### **1. Test Upload Avatar**:
```bash
curl -X POST \
  -F "avatar=@test.jpg" \
  https://neuralnova.space:3000/upload/avatar
```

**Expected response**:
```json
{
  "success": true,
  "file": {
    "url": "https://neuralnova.space:3000/uploads/avatars/avatar-123.webp",
    "filename": "avatar-123.webp",
    "size": 45678,
    "type": "image/webp",
    "dimensions": { "width": 500, "height": 500 }
  }
}
```

### **2. Test from Frontend**:
```javascript
// Browser Console
const formData = new FormData();
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.onchange = async (e) => {
  formData.append('avatar', e.target.files[0]);
  const res = await fetch('https://neuralnova.space:3000/upload/avatar', {
    method: 'POST',
    body: formData
  });
  console.log(await res.json());
};
fileInput.click();
```

---

## 🎯 **DEPLOYMENT CHECKLIST**:

- [ ] Upload file-server folder to VPS
- [ ] Run `npm install --production`
- [ ] Create upload directories
- [ ] Set permissions (chmod 755)
- [ ] Start PM2 server
- [ ] Configure Nginx reverse proxy
- [ ] Test health endpoint
- [ ] Test upload endpoints
- [ ] Update firewall rules
- [ ] Test from frontend

---

## 🚨 **TROUBLESHOOTING**:

### **Server won't start**:
```bash
# Check port availability
netstat -tlnp | grep 3000

# Check logs
pm2 logs neuralnova-files --lines 100
```

### **Upload fails**:
```bash
# Check directory permissions
ls -la uploads/

# Check disk space
df -h
```

### **CORS errors**:
- Verify `allowedOrigins` in `config.js`
- Check browser Console for exact error
- Update Nginx CORS headers if using proxy

---

**Ready to deploy!** 🚀
