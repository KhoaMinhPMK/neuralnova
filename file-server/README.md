# 📤 Simple File Server

Server đơn giản để upload và lưu file.

## 🚀 Cài đặt & Chạy

```bash
# 1. Cài packages
npm install

# 2. Chạy server
npm start
```

Server chạy tại: http://localhost:3001

## 📡 API

### Upload file
```bash
curl -X POST http://localhost:3001/upload -F "file=@image.jpg"
```

### Upload nhiều files
```bash
curl -X POST http://localhost:3001/upload-multiple -F "files=@image1.jpg" -F "files=@image2.jpg"
```

### Xem file
```
http://localhost:3001/uploads/filename.jpg
```

### Liệt kê files
```bash
curl http://localhost:3001/list
```

### Xóa file
```bash
curl -X DELETE http://localhost:3001/delete/filename.jpg
```

## 💻 Sử dụng trong JavaScript

```javascript
// Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3001/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.file.url); // URL của file
```

## 🌐 Deploy lên VPS Windows

1. **Cài Node.js** trên VPS: https://nodejs.org/
2. **Upload folder này** lên VPS
3. **Mở PowerShell** và chạy:
   ```powershell
   cd C:\path\to\file-server
   npm install
   npm start
   ```
4. **Mở port 3001**:
   ```powershell
   New-NetFirewallRule -DisplayName "File Server" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
   ```
5. **Truy cập**: http://IP-VPS:3001

## 📝 Lưu ý

- Files được lưu trong thư mục `uploads/`
- Max file size: 10MB
- Port mặc định: 3001 (đổi trong server.js nếu cần)
- CORS: Cho phép tất cả origins

Xong! 🎉
