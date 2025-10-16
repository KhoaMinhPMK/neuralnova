# 📊 Demo Data Setup Guide

Hướng dẫn import demo data để quay video demo.

## ⚠️ Important Notes

### Database Schema:
- Posts table uses `caption` (not `content`)
- Posts table uses `post_date` (not `observation_date`)  
- Comments table uses `comment_text` (not `content`)

**The SQL file has been updated to match your current database schema!** ✅

---

## 📋 Nội dung Demo Data

### 👥 8 Users giả:
1. **Dr. Sarah Chen** - Astrophysicist chuyên về exoplanets
2. **Mike Johnson** - Amateur astronomer & astrophotographer
3. **Emma Rodriguez** - Aerospace Engineer tại SpaceX
4. **Alex Kumar** - Science educator & YouTuber
5. **Lisa Thompson** - Physics PhD student
6. **Dr. James Martinez** - Observatory Director
7. **Maria Silva** - Space journalist
8. **Tom Anderson** - Meteorite collector

### 📝 10 Posts đa dạng:
- Khám phá khoa học (exoplanets)
- Ảnh astrophotography
- Tin tức SpaceX
- Video giáo dục
- Cập nhật PhD
- Tin tức NASA
- Thiên thạch quý hiếm

### 💬 20+ Comments
### ❤️ 50+ Reactions

## 🔑 Tài khoản Demo

**Tất cả tài khoản có password:** `Demo123!`

```
Email: astronomer.sarah@demo.space
Username: dr_sarah_chen

Email: stargazer.mike@demo.space
Username: stargazer_mike

Email: rocket.emma@demo.space
Username: rocket_emma

Email: cosmos.alex@demo.space
Username: cosmos_alex

Email: nebula.lisa@demo.space
Username: nebula_lisa

Email: observatory.james@demo.space
Username: observatory_james

Email: spacenews.maria@demo.space
Username: spacenews_maria

Email: meteorite.tom@demo.space
Username: meteorite_tom
```

## 🚀 Cách 1: Import qua phpMyAdmin (Dễ nhất)

### Bước 1: Mở phpMyAdmin
```
http://localhost/phpmyadmin
```

### Bước 2: Chọn database
Click vào database **`neuralnova`** ở sidebar trái

### Bước 3: Import file
1. Click tab **"SQL"** ở trên
2. Copy toàn bộ nội dung file `999_demo_data.sql`
3. Paste vào ô SQL query
4. Click **"Go"** ở dưới

### Bước 4: Kiểm tra
Chạy query:
```sql
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_posts FROM posts;
SELECT COUNT(*) as total_comments FROM comments;
SELECT COUNT(*) as total_reactions FROM reactions;

-- Xem posts mới nhất
SELECT id, user_id, LEFT(caption, 50) as caption_preview, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 5;
```

Nếu thấy số lượng tăng → ✅ Thành công!

---

## 🚀 Cách 2: Import qua Command Line

### Bước 1: Mở Command Prompt/PowerShell

```powershell
cd C:\xampp\htdocs\neuralnova\backend\sql
```

### Bước 2: Import SQL file

```bash
mysql -u root -p neuralnova < 999_demo_data.sql
```

Nhập password MySQL (mặc định XAMPP là để trống)

### Bước 3: Kiểm tra
```bash
mysql -u root -p neuralnova -e "SELECT COUNT(*) FROM users;"
mysql -u root -p neuralnova -e "SELECT COUNT(*) FROM posts;"
```

---

## 🔐 Generate Password Hash (Nếu cần)

Nếu bạn muốn đổi password của demo accounts:

### PHP Script:
```php
<?php
$password = "Demo123!";
$hash = password_hash($password, PASSWORD_BCRYPT);
echo "Password hash: " . $hash;
?>
```

Chạy:
```bash
php -r "echo password_hash('Demo123!', PASSWORD_BCRYPT);"
```

Copy hash và thay trong file SQL.

---

## 🧹 Xóa Demo Data (Nếu cần)

Nếu muốn xóa tất cả demo data:

```sql
-- Xóa comments
DELETE FROM comments WHERE user_id >= 6;

-- Xóa reactions
DELETE FROM reactions WHERE user_id >= 6;

-- Xóa posts
DELETE FROM posts WHERE user_id >= 6;

-- Xóa activities
DELETE FROM activities WHERE user_id >= 6;

-- Xóa users
DELETE FROM users WHERE id >= 6;

-- Reset AUTO_INCREMENT (optional)
ALTER TABLE users AUTO_INCREMENT = 6;
ALTER TABLE posts AUTO_INCREMENT = 1;
ALTER TABLE comments AUTO_INCREMENT = 1;
ALTER TABLE reactions AUTO_INCREMENT = 1;
```

---

## 📸 Tips cho Video Demo

### 1. **Login với các user khác nhau**
- Đăng nhập bằng `astronomer.sarah@demo.space` để xem posts
- Đăng nhập bằng `stargazer.mike@demo.space` để xem profile khác
- Mỗi user có avatar và cover ảnh đẹp từ Unsplash

### 2. **Demo các tính năng:**

✅ **Feed/Timeline**: Hiển thị posts đa dạng với ảnh
✅ **Like/React**: Click like trên các posts
✅ **Comment**: Viết comment mới
✅ **Profile**: Xem profile các users
✅ **Discovery**: Browse qua các users
✅ **Create Post**: Đăng post mới với/không ảnh

### 3. **Tạo drama (nếu cần 😄)**

Có thể thêm posts gây tranh cãi:
```sql
INSERT INTO posts (user_id, content, is_public, created_at) VALUES
(8, 'Hot take: Pluto should still be a planet! Who is with me? 🪐', 1, NOW());
```

### 4. **Real-time updates**

Trong khi quay video, có thể:
- Tạo user mới live
- Upload ảnh live
- Comment live
- Tất cả đều real-time!

---

## 🎬 Kịch bản Demo (30 giây - 1 phút)

### **Intro (5s)**
"Welcome to NeuralNova - The social network for space enthusiasts!"

### **Feed (10s)**
- Scroll qua feed
- Xem posts với ảnh đẹp
- Click like một vài posts

### **Interaction (10s)**
- Click vào một post
- Đọc comments
- Viết comment mới

### **Profile (10s)**
- Click vào user profile
- Xem avatar, cover, bio
- Xem posts của user đó

### **Create Post (15s)**
- Click "What's on your mind?"
- Upload ảnh
- Viết nội dung
- Post!

### **Discovery (10s)**
- Vào Discovery page
- Browse qua users
- Click profile

### **Outro (5s)**
"Join the community and share your passion for the cosmos!"

---

## 📊 Statistics sau khi import

Bạn sẽ có:
- 📱 **8 demo users** (IDs: 6-13)
- 📝 **10 posts** với nội dung chất lượng
- 💬 **20+ comments**
- ❤️ **50+ reactions**
- 🖼️ **Ảnh từ Unsplash** (professional quality)
- ✨ **Realistic usernames** và bios

---

## 🔧 Troubleshooting

### Lỗi: "Duplicate entry"

**Nguyên nhân:** Data đã tồn tại

**Giải pháp:** 
```sql
-- Xóa data cũ trước
DELETE FROM users WHERE id >= 6;
-- Rồi import lại
```

### Lỗi: "Password hash không hoạt động"

**Nguyên nhân:** Hash trong SQL không đúng

**Giải pháp:**
1. Generate hash mới:
```bash
php -r "echo password_hash('Demo123!', PASSWORD_BCRYPT);"
```
2. Replace trong file SQL
3. Import lại

### Ảnh không hiển thị

**Nguyên nhân:** URLs từ Unsplash/Pravatar có thể thay đổi

**Giải pháp:**
- Thay URLs bằng ảnh local của bạn
- Hoặc upload ảnh mới qua dashboard

---

## 🎉 Hoàn thành!

Giờ bạn đã có đủ data để:
- ✅ Quay video demo professional
- ✅ Show cho clients/investors
- ✅ Test UI/UX với data thực tế
- ✅ Giới thiệu tính năng cho users

**Chúc quay video thành công!** 🎬🚀
