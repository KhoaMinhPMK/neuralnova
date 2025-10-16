# Setup File Server Standalone - Desktop

## 📋 **HƯỚNG DẪN ĐẶT Ở DESKTOP**:

### **1. Copy Folder**:
```
Từ: E:\project\neuralnova\neuralnova\file-server\
Đến: C:\Users\YourName\Desktop\neuralnova-file-server\
```

Hoặc bất kỳ đâu bạn muốn!

---

## 🚀 **SETUP STEPS**:

### **2. Install Node.js** (nếu chưa có):
- Download: https://nodejs.org/
- Chọn LTS version (18.x hoặc 20.x)
- Install → Next → Next → Finish

### **3. Install Dependencies**:
```bash
# Mở PowerShell/CMD tại folder file-server
cd C:\Users\YourName\Desktop\neuralnova-file-server

# Install packages
npm install
```

**Sẽ install**:
- express (web framework)
- multer (file upload)
- sharp (image optimization)
- cors (CORS handling)
- helmet (security)
- compression (gzip)

### **4. Create Upload Folders**:
```bash
mkdir uploads\avatars
mkdir uploads\covers
mkdir uploads\posts
```

Hoặc tạo thủ công:
```
neuralnova-file-server/
└── uploads/
    ├── avatars/
    ├── covers/
    └── posts/
```

### **5. Config (Optional)**:
Mở `config.js`, sửa nếu cần:
```javascript
// Line 2
port: 3000,  // Đổi port nếu muốn (3001, 8080...)

// Line 23
publicUrl: 'http://localhost:3000/uploads'  // For local testing
```

---

## ▶️ **START SERVER**:

### **Development Mode** (tự reload khi code thay đổi):
```bash
npm run dev
```

### **Production Mode**:
```bash
npm start
```

**Output sẽ thấy**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NeuralNova File Server
📡 Port: 3000
🌍 Environment: development
📁 Upload path: ./uploads
🔗 Public URL: http://localhost:3000/uploads
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoints:
  POST /upload/avatar   - Upload avatar (max 5MB)
  POST /upload/cover    - Upload cover (max 10MB)
  POST /upload/post     - Upload post media (max 50MB)
  DELETE /delete/:type/:filename
  GET /info/:type/:filename
  GET /health

✅ Server ready!
```

---

## 🧪 **TEST LOCAL**:

### **1. Check Health**:
Mở browser: `http://localhost:3000/health`

**Sẽ thấy**:
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 12.345
}
```

### **2. Test Upload**:
```bash
# Tạo file test
curl -F "avatar=@test.jpg" http://localhost:3000/upload/avatar
```

**Hoặc dùng Postman/Insomnia**:
- URL: `http://localhost:3000/upload/avatar`
- Method: POST
- Body: form-data
- Key: `avatar`
- Value: Choose file

---

## 🌐 **CONNECT FRONTEND**:

### **For Local Testing**:
Update `pages/profile/app.js` line 4:
```javascript
const FILE_SERVER = 'http://localhost:3000';
```

### **For Production**:
```javascript
const FILE_SERVER = 'https://neuralnova.space:3000';
```

---

## 🔧 **USEFUL COMMANDS**:

### **Stop Server**:
```
Ctrl + C
```

### **Restart Server**:
```bash
npm start
```

### **Check Port**:
```bash
netstat -ano | findstr :3000
```

### **Kill Port 3000**:
```bash
npx kill-port 3000
```

---

## 📂 **FOLDER CẦN COPY**:

Copy **toàn bộ** folder này:
```
file-server/
├── server.js
├── config.js
├── package.json
├── ecosystem.config.js
├── Dockerfile
├── .dockerignore
├── .gitignore
├── README.md
├── DEPLOYMENT.md
└── SETUP_STANDALONE.md (file này)
```

Sang Desktop hoặc bất kỳ đâu!

---

## ✅ **CHECKLIST**:

- [ ] Copy folder ra Desktop
- [ ] Install Node.js (nếu chưa)
- [ ] `npm install`
- [ ] Create uploads folders
- [ ] `npm start`
- [ ] Check `http://localhost:3000/health`
- [ ] Test upload
- [ ] Update frontend FILE_SERVER config
- [ ] Test from profile page

---

**Copy folder và làm theo checklist là xong!** 🎉
