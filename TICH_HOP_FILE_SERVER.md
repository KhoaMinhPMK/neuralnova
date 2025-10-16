# 🎉 Tích hợp File Server hoàn tất!

File server đã được tích hợp vào Dashboard và Profile để upload ảnh.

## ✅ Đã hoàn thành:

### 1. **File Server**
- ✅ Server Node.js đơn giản tại `file-server/`
- ✅ API upload file: `POST /upload?type=posts|avatars|covers`
- ✅ Serve static files: `GET /uploads/{type}/{filename}`
- ✅ Port: 3001
- ✅ CORS enabled cho phép truy cập từ mọi nguồn

### 2. **Dashboard** (`pages/dashboard/`)
- ✅ Upload ảnh cho bài viết (posts)
- ✅ Modal tạo bài viết có nút "Add Photo"
- ✅ Preview ảnh trước khi đăng
- ✅ Upload lên file server → Lưu URL vào database

### 3. **Profile** (`pages/profile/`)
- ✅ Upload ảnh đại diện (avatar)
- ✅ Upload ảnh bìa (cover)
- ✅ Upload → Save URL vào database

## 🚀 Cách sử dụng:

### Bước 1: Khởi động File Server trên VPS

```powershell
# Trên VPS Windows
cd C:\xampp\htdocs\neuralnova\file-server

# Cách 1: Chạy thường
node server.js

# Cách 2: Chạy với PM2 (khuyến nghị)
pm2 start server.js --name file-server
pm2 save
```

### Bước 2: Kiểm tra server

Mở trình duyệt: `http://160.30.113.26:3001`

Nếu thấy JSON response → Server OK! ✅

### Bước 3: Test upload

#### **Test với file test.html:**
1. Mở `file-server/test.html`
2. Nhập Server URL: `http://160.30.113.26:3001`
3. Chọn ảnh và upload
4. Nếu thành công → Thấy URL ảnh

#### **Test với Dashboard:**
1. Mở `http://localhost/neuralnova/pages/dashboard/`
2. Click vào ô "What's on your mind?"
3. Click "Add Photo"
4. Chọn ảnh → Xem preview
5. Nhập nội dung → Click "Post"
6. Ảnh sẽ upload lên VPS và URL được lưu vào database

#### **Test với Profile:**
1. Mở `http://localhost/neuralnova/pages/profile/`
2. Click "Edit Cover Photo"
3. Chọn ảnh → Upload tự động
4. Ảnh bìa sẽ thay đổi ngay

## 📡 Cấu hình API

### File: `pages/dashboard/app.js` và `pages/profile/app.js`

```javascript
const FILE_SERVER = isLocal
    ? 'http://localhost:3001'           // Local: máy dev
    : 'http://160.30.113.26:3001';     // Production: VPS
```

### Các endpoint upload:

```javascript
// Avatar
POST http://160.30.113.26:3001/upload?type=avatars
FormData: { file: <image-file> }

// Cover
POST http://160.30.113.26:3001/upload?type=covers
FormData: { file: <image-file> }

// Post Image
POST http://160.30.113.26:3001/upload?type=posts
FormData: { file: <image-file> }
```

### Response format:

```json
{
  "success": true,
  "message": "Upload thành công!",
  "file": {
    "name": "1729092000000-abc123-image.jpg",
    "originalName": "image.jpg",
    "mimetype": "image/jpeg",
    "size": 524288,
    "path": "/uploads/posts/1729092000000-abc123-image.jpg",
    "url": "http://160.30.113.26:3001/uploads/posts/1729092000000-abc123-image.jpg"
  }
}
```

## 🔄 Luồng hoạt động:

### Upload Avatar/Cover:
```
1. User chọn ảnh
2. Frontend upload lên File Server (http://160.30.113.26:3001/upload)
3. File Server lưu ảnh vào thư mục uploads/ và trả về URL
4. Frontend gọi PHP Backend API để lưu URL vào database
5. UI cập nhật hiển thị ảnh mới
```

### Upload Post Image:
```
1. User click "Add Photo" trong modal Create Post
2. Chọn ảnh → Preview hiển thị ngay
3. Ảnh upload lên File Server ngay lập tức
4. Khi click "Post", gửi cả content và image URL lên PHP Backend
5. Backend lưu post với image URL vào database
6. Feed reload và hiển thị post mới có ảnh
```

## 📁 Cấu trúc Files:

```
neuralnova/
├── file-server/                      # File Server Node.js
│   ├── server.js                     # Main server
│   ├── package.json                  # Dependencies
│   ├── test.html                     # Test upload UI
│   ├── restart.bat                   # Restart server
│   ├── start.bat                     # Start server
│   ├── stop.bat                      # Stop server
│   └── uploads/                      # Folder lưu ảnh
│       ├── avatars/
│       ├── covers/
│       └── posts/
│
├── pages/
│   ├── dashboard/
│   │   ├── app.js                    # ✅ Đã tích hợp upload
│   │   └── index.html                # ✅ Đã có UI upload
│   │
│   └── profile/
│       ├── app.js                    # ✅ Đã tích hợp upload
│       └── index.html                # Avatar & Cover upload
│
└── TICH_HOP_FILE_SERVER.md          # File này
```

## 🛠️ Scripts hữu ích:

### Trên VPS:

```powershell
# Restart server
cd C:\xampp\htdocs\neuralnova\file-server
.\restart.bat

# Xem logs với PM2
pm2 logs file-server

# Stop server
.\stop.bat

# Kiểm tra port
netstat -ano | findstr :3001
```

### Kiểm tra upload từ command line:

```bash
# Test upload
curl -X POST http://160.30.113.26:3001/upload?type=posts \
  -F "file=@image.jpg"

# Test health check
curl http://160.30.113.26:3001
```

## 🐛 Troubleshooting:

### 1. **Không upload được từ Dashboard/Profile**

**Triệu chứng:** Click upload nhưng không có gì xảy ra

**Giải pháp:**
- Mở Console (F12) xem lỗi
- Kiểm tra file server có đang chạy: `http://160.30.113.26:3001`
- Kiểm tra CORS: Server phải cho phép origin của bạn

### 2. **"Failed to upload image"**

**Triệu chứng:** Toast hiển thị lỗi upload

**Giải pháp:**
- Kiểm tra file < 10MB
- Kiểm tra file là ảnh (jpg, png, gif, webp)
- Xem logs server: `pm2 logs file-server`
- Xem Console trình duyệt

### 3. **Server bị crash/stop**

**Triệu chứng:** Không truy cập được `http://160.30.113.26:3001`

**Giải pháp:**
```powershell
cd C:\xampp\htdocs\neuralnova\file-server
.\restart.bat
```

Hoặc:
```powershell
pm2 restart file-server
pm2 logs file-server
```

### 4. **Ảnh không hiển thị sau khi upload**

**Triệu chứng:** Upload thành công nhưng ảnh không hiển thị

**Giải pháp:**
- Kiểm tra URL ảnh có đúng không (nhấn F12 → Network)
- Kiểm tra file có tồn tại: `http://160.30.113.26:3001/uploads/posts/{filename}`
- Xem firewall có block port 3001 không

### 5. **Mixed Content Error (HTTPS → HTTP)**

**Triệu chứng:** Lỗi "Mixed Content" trong Console

**Giải pháp:**
- Nếu site chính dùng HTTPS, file server cũng phải dùng HTTPS
- Hoặc cho phép Mixed Content trong browser (chỉ để dev)

## 📊 Logs & Monitoring:

### Xem logs real-time:
```powershell
pm2 logs file-server --lines 100
```

### Xem status:
```powershell
pm2 status
```

### Xem resource usage:
```powershell
pm2 monit
```

## 🔒 Bảo mật:

**Hiện tại:**
- ✅ CORS: Cho phép tất cả origins (`*`)
- ✅ File type: Chỉ cho phép ảnh
- ✅ File size: Max 10MB
- ⚠️ Rate limiting: Chưa có

**Để tăng cường bảo mật trong production:**
1. Giới hạn CORS origins cụ thể
2. Thêm authentication
3. Thêm rate limiting
4. Scan virus cho uploaded files
5. Dùng HTTPS

## ✨ Features có sẵn:

- ✅ Upload ảnh avatar
- ✅ Upload ảnh cover
- ✅ Upload ảnh bài viết
- ✅ Preview ảnh trước khi upload
- ✅ Xóa ảnh preview
- ✅ Progress indicator
- ✅ Error handling
- ✅ Toast notifications
- ✅ Auto-detect local vs production
- ✅ CORS support

## 🎯 Next Steps (Tùy chọn):

1. **Thêm video upload**
2. **Compress ảnh trước khi upload**
3. **Multiple images cho 1 post**
4. **Drag & drop upload**
5. **Crop/edit ảnh trước khi upload**
6. **CDN integration**

---

## 💡 Tips:

1. **Development:** Chạy file server local (`localhost:3001`)
2. **Production:** File server chạy trên VPS (`160.30.113.26:3001`)
3. **Auto-detect:** Code tự động phát hiện môi trường và dùng đúng URL
4. **PM2:** Nên dùng PM2 để server tự động restart khi crash

## 📞 Support:

Nếu có vấn đề, check:
1. Console trình duyệt (F12)
2. PM2 logs: `pm2 logs file-server`
3. Network tab (F12 → Network)
4. Server health: `http://160.30.113.26:3001`

---

**Hoàn thành!** Giờ bạn đã có hệ thống upload ảnh hoàn chỉnh! 🎉
