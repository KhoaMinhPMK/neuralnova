# 🚀 Quick Start - Dashboard

## 📝 **3 TRƯỜNG HỢP KHI LOAD DASHBOARD**

### **✅ Case 1: Database trống (chưa có posts)**
**Console sẽ hiện**:
```
📭 No posts in database yet. Create your first post!
```

**UI sẽ hiện**:
```
    📰
No posts yet
Be the first to share something!
```

**→ BÌNH THƯỜNG! Tạo post đầu tiên ngay bây giờ:**

---

### **❌ Case 2: Backend error**
**Console sẽ hiện**:
```
❌ Backend error: [error message]
```

**→ KIỂM TRA:**
- Backend có chạy không?
- Database có kết nối không?
- Có logged in không?

---

### **❌ Case 3: Network error**
**Console sẽ hiện**:
```
❌ Network error loading posts: [error]
```

**→ KIỂM TRA:**
- URL backend có đúng không?
- CORS headers có đúng không?
- Server có chạy không?

---

## 🎯 **CÁCH TẠO POST ĐẦU TIÊN**

### **Option 1: Qua UI** ⭐ (RECOMMENDED)

1. **Click "What's on your mind?"**
   
2. **Modal mở ra, nhập nội dung**:
   ```
   Đây là post đầu tiên của tôi! 🚀
   ```

3. **(Optional) Nhập Image URL**:
   ```
   ../../assets/images/logo.png
   ```
   
   Hoặc dùng online image:
   ```
   https://via.placeholder.com/600x400/0066cc/ffffff?text=My+First+Post
   ```

4. **Click "Post"**

5. **✅ Post mới xuất hiện ngay!**

---

### **Option 2: Qua SQL**

Chạy lệnh này trong phpMyAdmin:

```sql
-- Thay user_id=1 bằng ID của bạn
-- Lấy user_id: SELECT * FROM users;

INSERT INTO posts (user_id, content, image_url, visibility, created_at) 
VALUES 
(1, 'Đây là post đầu tiên của tôi! 🚀', 
 'https://via.placeholder.com/600x400/0066cc/ffffff?text=First+Post', 
 'public', 
 NOW());
```

**Sau đó refresh dashboard** (`F5`)

---

### **Option 3: Chạy Sample Posts SQL**

```sql
-- File: backend/test/create-sample-posts.sql
-- Copy toàn bộ nội dung file và paste vào phpMyAdmin
-- Nhớ thay user_id cho phù hợp
```

**Sau đó refresh dashboard** (`F5`)

---

## 🧪 **KIỂM TRA SAU KHI TẠO POST**

### **Console phải hiện**:
```
✅ Loaded 1 posts from database
```
Hoặc
```
✅ Loaded 6 posts from database
```

### **UI phải hiện**:
```
┌──────────────────────────────┐
│ What's on your mind?         │
├──────────────────────────────┤
│ 👤 Your Name                 │
│    just now                  │
│                              │
│ Đây là post đầu tiên! 🚀    │
│ [Image nếu có]               │
│                              │
│ 👍❤️🌱 0    0 comments       │
│ [Like] [Comment] [Share]     │
└──────────────────────────────┘
```

---

## ✅ **CHECKLIST**

- [ ] Hard refresh browser (`Ctrl + F5`)
- [ ] Console hiển thị "Dashboard v2.0"
- [ ] Login thành công
- [ ] Dashboard load (trống hoặc có posts)
- [ ] Create post qua UI
- [ ] Post mới xuất hiện
- [ ] Like button hoạt động
- [ ] Comment button hoạt động

---

## 🎯 **EXPECTED BEHAVIORS**

### **Database trống**:
- ✅ Empty state hiện ra
- ✅ "Create post" vẫn hoạt động
- ✅ Không có error

### **Database có posts**:
- ✅ Posts hiển thị theo thứ tự mới nhất
- ✅ Avatar + tên user
- ✅ Time "just now", "2 hours ago"...
- ✅ Like/Comment buttons active

### **After creating post**:
- ✅ Modal đóng
- ✅ Toast "Post created!"
- ✅ Post mới xuất hiện ở đầu feed
- ✅ Counter = 0 likes, 0 comments

---

## 🚨 **TROUBLESHOOTING**

### **"Failed to connect to server"**
→ Backend không chạy hoặc URL sai
```javascript
// Check trong Console:
console.log(API_BASE);
// Should be: http://localhost/neuralnova/backend/api
```

### **"Not authenticated"**
→ Chưa login hoặc session hết hạn
```
Solution: Login lại
```

### **Empty state nhưng DB có posts**
→ SQL query có vấn đề hoặc user_id không khớp
```sql
-- Check trong phpMyAdmin:
SELECT * FROM posts WHERE visibility = 'public' ORDER BY created_at DESC;
```

### **Create post không làm gì**
→ Mở Console, xem error
```
F12 → Console tab
```

---

**Tóm lại**: Nếu thấy empty state → **BÌNH THƯỜNG**, chỉ cần tạo post đầu tiên! 🚀
