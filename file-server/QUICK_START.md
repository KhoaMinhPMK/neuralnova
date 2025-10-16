# 🚀 Quick Start - 3 Phút Setup

## 📁 **STEP 1: Copy Folder**

Copy folder `file-server` ra **Desktop** (hoặc bất kỳ đâu):

```
Từ: E:\project\neuralnova\neuralnova\file-server
Đến: C:\Users\YourName\Desktop\neuralnova-file-server
```

---

## 📦 **STEP 2: Install** (Chỉ làm 1 lần):

Mở **PowerShell** tại folder (Click phải → Open in Terminal):

```bash
npm install
```

**Chờ 1-2 phút** để install packages...

---

## 📂 **STEP 3: Create Folders**:

```bash
mkdir uploads\avatars
mkdir uploads\covers
mkdir uploads\posts
```

---

## ▶️ **STEP 4: Start Server**:

```bash
npm start
```

**Xong! Sẽ thấy**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NeuralNova File Server
📡 Port: 3000
✅ Server ready!
```

---

## 🧪 **STEP 5: Test**:

Mở browser: **http://localhost:3000/health**

**Sẽ thấy**:
```json
{
  "success": true,
  "status": "healthy"
}
```

---

## ✅ **XONG! Server đã chạy!**

Bây giờ:
1. ✅ File server chạy trên `localhost:3000`
2. ✅ Frontend tự động detect và dùng local server
3. ✅ Upload avatar/cover sẽ qua Node.js server
4. ✅ Ảnh tự động optimize → WebP

---

## 🔄 **STOP/START**:

### **Stop**:
```
Ctrl + C
```

### **Start lại**:
```bash
npm start
```

---

## 🎯 **ĐỂ DÙNG VỚI PROFILE PAGE**:

1. Start file server: `npm start`
2. Start XAMPP (Apache, MySQL)
3. Mở browser: `http://localhost/neuralnova/pages/profile/index.html`
4. Upload avatar/cover → Tự động qua Node.js server
5. Done!

---

**3 phút là xong!** ⚡

**Chỉ cần**:
1. Copy folder
2. `npm install`
3. Create folders
4. `npm start`

**Đơn giản!** 🎉
