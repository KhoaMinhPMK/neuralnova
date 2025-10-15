# 🔄 Clear Cache & Test Dashboard

**Issue**: Browser đang cache file JavaScript cũ với mockup data  
**Solution**: Hard refresh để load phiên bản mới

---

## ✅ **BƯỚC 1: HARD REFRESH**

### **Windows/Linux**:
```
Ctrl + F5
hoặc
Ctrl + Shift + R
```

### **Mac**:
```
Cmd + Shift + R
```

### **Hoặc Clear Cache Thủ Công**:
1. Mở Developer Tools (`F12`)
2. Right-click nút Reload
3. Chọn "Empty Cache and Hard Reload"

---

## ✅ **BƯỚC 2: KIỂM TRA CONSOLE**

Sau khi reload, mở Console (`F12`), bạn phải thấy:

```
🚀 Dashboard v2.0 - Loading real data from backend...
🔗 API Base: http://localhost/neuralnova/backend/api
📊 Dashboard initializing with REAL backend data...
✅ User loaded from localStorage: {id: 1, email: '...', ...}
✅ Auth checked, loading posts from database...
```

**Nếu KHÔNG thấy messages này** → Vẫn đang load file cũ, làm lại bước 1

---

## ✅ **BƯỚC 3: TEST TẠO POST**

### **1. Click "What's on your mind?"**
→ Modal mở ra

### **2. Nhập nội dung**:
```
Đây là post đầu tiên của tôi! 🚀
```

### **3. Nhập Image URL** (optional):
```
../../assets/images/logo.png
```

### **4. Click "Post"**
→ Modal đóng lại  
→ Toast "Post created!" hiện ra  
→ Post mới xuất hiện ở đầu feed

---

## ✅ **BƯỚC 4: TEST LIKE**

1. Click nút "Like" trên một post
2. Button chuyển sang màu xanh
3. Counter tăng lên 1

**Click lại để Unlike**:
- Button tắt
- Counter giảm 1

---

## ✅ **BƯỚC 5: TEST COMMENT**

1. Click nút "Comment" trên một post
2. Comments section mở ra
3. Type một comment vào input box
4. Press `Enter` (hoặc click icon send)
5. Comment mới xuất hiện
6. Counter "X comments" tăng lên

---

## 🗄️ **TẠO SAMPLE POSTS TRONG DATABASE**

Nếu dashboard trống (chưa có posts), chạy SQL này:

```sql
-- Sample Post 1
INSERT INTO posts (user_id, content, image_url, visibility, created_at) VALUES
(1, 'Welcome to NeuralNova! 🚀 This is our first post on the new social platform.', 
 'https://via.placeholder.com/600x400/0066cc/ffffff?text=Welcome', 
 'public', NOW());

-- Sample Post 2
INSERT INTO posts (user_id, content, visibility, created_at) VALUES
(1, 'Just testing the new dashboard features. Looks amazing! 🎉', 
 'public', NOW() - INTERVAL 2 HOUR);

-- Sample Post 3
INSERT INTO posts (user_id, content, image_url, visibility, created_at) VALUES
(1, 'The AI-powered bloom tracking is incredible! Check out these cherry blossoms 🌸', 
 'https://via.placeholder.com/600x400/ff69b4/ffffff?text=Cherry+Blossoms', 
 'public', NOW() - INTERVAL 5 HOUR);

-- Sample Post 4
INSERT INTO posts (user_id, content, visibility, created_at) VALUES
(1, 'Monitoring environmental changes has never been easier. This platform is a game changer! 🌍📊', 
 'public', NOW() - INTERVAL 1 DAY);
```

**Lưu ý**: Thay `user_id = 1` bằng ID của user hiện tại (lấy từ `SELECT * FROM users`)

---

## 🧪 **EXPECTED BEHAVIOR**

### **Khi Database Trống**:
```
┌──────────────────────────┐
│                          │
│       📰                 │
│   No posts yet           │
│ Be the first to share!   │
│                          │
└──────────────────────────┘
```

### **Khi Có Posts**:
```
┌──────────────────────────────┐
│ What's on your mind?         │  ← Create Post Box
├──────────────────────────────┤
│ 👤 User Name                 │
│    2 hours ago               │
│                              │
│ Post content here...         │
│ [Optional Image]             │
│                              │
│ 👍❤️🌱 0    0 comments       │
│ [Like] [Comment] [Share]     │
└──────────────────────────────┘
```

---

## 🚨 **TROUBLESHOOTING**

### **1. Vẫn thấy mockup data (Sarah Johnson, Mike Chen...)**
→ Browser vẫn cache file cũ  
→ Clear cache hoàn toàn:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Hoặc mở Incognito mode (`Ctrl + Shift + N`)

### **2. Console báo lỗi "Failed to load posts"**
→ Kiểm tra:
   - Database có bảng `posts` chưa?
   - Backend API có chạy không? (test `http://localhost/neuralnova/backend/api/posts/feed.php`)
   - CORS headers đã đúng chưa?

### **3. Dashboard trống hoàn toàn**
→ Bình thường! Database chưa có posts  
→ Tạo post đầu tiên bằng modal "What's on your mind?"  
→ Hoặc chạy SQL sample posts ở trên

### **4. "Not authenticated" hoặc redirect về login**
→ Session hết hạn  
→ Login lại  
→ localStorage sẽ được cập nhật

### **5. Create post không hoạt động**
→ Mở Console, xem error  
→ Kiểm tra:
   - `POST /api/posts/create.php` có response 200 không?
   - Có lỗi validation không?
   - User có đang logged in không?

---

## ✅ **CHECKLIST HOÀN CHỈNH**

- [ ] Hard refresh browser (`Ctrl + F5`)
- [ ] Console hiển thị "Dashboard v2.0"
- [ ] Console hiển thị "Loading real data from backend"
- [ ] Dashboard load (trống hoặc có posts từ DB)
- [ ] Click "What's on your mind?" mở modal
- [ ] Tạo post thành công
- [ ] Post mới xuất hiện trong feed
- [ ] Like button hoạt động (toggle on/off)
- [ ] Comment section mở được
- [ ] Thêm comment thành công

---

## 🎯 **FINAL CHECK**

Mở Network tab (`F12` → Network), reload trang, kiểm tra:

1. `app.js?v=2.0` - Status 200 ✅
2. `check-session.php` - Status 200 ✅
3. `feed.php?limit=20&offset=0` - Status 200 ✅

**Nếu tất cả đều 200** → Backend integration hoàn chỉnh! 🚀

---

**Updated**: October 15, 2025  
**Version**: Dashboard v2.0
