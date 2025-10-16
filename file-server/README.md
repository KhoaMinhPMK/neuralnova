# NeuralNova File Upload Server

Node.js microservice for handling file uploads with automatic optimization.

## 🚀 **Features**

- ✅ Image upload & auto-optimization (WebP conversion)
- ✅ Video upload support (MP4, WebM)
- ✅ Auto-resize & compression
- ✅ Rate limiting & security
- ✅ CORS configured
- ✅ PM2 cluster mode

---

## 📦 **Installation**

### **1. Install Dependencies**:
```bash
cd file-server
npm install
```

### **2. Create Upload Directories**:
```bash
mkdir -p uploads/avatars
mkdir -p uploads/covers
mkdir -p uploads/posts
```

### **3. Setup Environment** (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

---

## 🔧 **Development**

### **Start Dev Server**:
```bash
npm run dev
```

Server runs on: `http://localhost:3000`

### **Test Endpoints**:
```bash
# Health check
curl http://localhost:3000/health

# Upload avatar
curl -F "avatar=@test.jpg" http://localhost:3000/upload/avatar

# Upload cover
curl -F "cover=@test.jpg" http://localhost:3000/upload/cover

# Upload post media
curl -F "media=@test.jpg" http://localhost:3000/upload/post
```

---

## 🚀 **Production Deployment**

### **1. Install PM2**:
```bash
npm install -g pm2
```

### **2. Start with PM2**:
```bash
npm run pm2:start
```

### **3. Setup Auto-start**:
```bash
pm2 startup
pm2 save
```

### **4. Monitor**:
```bash
pm2 list
pm2 logs neuralnova-files
pm2 monit
```

---

## 🌐 **Nginx Reverse Proxy**

Add to your Nginx config:

```nginx
# File server
location /file-server/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 50M;
}

# Static uploads
location /uploads/ {
    alias /path/to/neuralnova/file-server/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📡 **API Endpoints**

### **POST /upload/avatar**
Upload user avatar (auto-resize to 500x500px)

**Request**:
```bash
curl -X POST \
  -F "avatar=@image.jpg" \
  https://neuralnova.space:3000/upload/avatar
```

**Response**:
```json
{
  "success": true,
  "file": {
    "url": "https://neuralnova.space:3000/uploads/avatars/avatar-123456.webp",
    "filename": "avatar-123456.webp",
    "size": 45678,
    "type": "image/webp",
    "dimensions": { "width": 500, "height": 500 }
  }
}
```

### **POST /upload/cover**
Upload cover photo (auto-resize to 1200x400px)

### **POST /upload/post**
Upload post media (max 1920x1920px for images, no resize for videos)

### **DELETE /delete/:type/:filename**
Delete uploaded file

### **GET /info/:type/:filename**
Get file metadata

### **GET /health**
Health check endpoint

---

## 🔒 **Security**

- ✅ Helmet.js security headers
- ✅ Rate limiting (100 requests per 15 min)
- ✅ File type validation
- ✅ File size limits
- ✅ CORS whitelist
- ✅ Auto image optimization
- ✅ Compression enabled

---

## 📊 **File Limits**

| Type | Max Size | Dimensions |
|------|----------|------------|
| Avatar | 5MB | 500x500px (auto-resize) |
| Cover | 10MB | 1200x400px (auto-resize) |
| Post Image | 50MB | Max 1920x1920px |
| Post Video | 50MB | No resize |

---

## 🛠️ **Troubleshooting**

### **Port already in use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or
npx kill-port 3000
```

### **Permission denied**:
```bash
chmod -R 755 uploads/
```

### **PM2 not starting**:
```bash
pm2 delete neuralnova-files
pm2 start ecosystem.config.js
```

---

## 📈 **Performance**

- **Cluster mode**: 2 instances for load balancing
- **Memory limit**: 500MB per instance
- **Auto-restart**: On crash or high memory
- **Compression**: Gzip enabled
- **Image optimization**: WebP conversion (30-50% smaller)

---

## 🔗 **Integration with PHP Backend**

### **Frontend uploads to Node.js**:
```javascript
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('https://neuralnova.space:3000/upload/avatar', {
  method: 'POST',
  body: formData
});

const data = await response.json();
// data.file.url → Save to database via PHP API
```

### **PHP saves URL to database**:
```php
// Receive URL from frontend
$avatarUrl = $_POST['avatar_url'];

// Save to database
$stmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
$stmt->execute([$avatarUrl, $userId]);
```

---

**Created**: 2025-10-16  
**Version**: 1.0.0  
**Status**: Ready for deployment 🚀
