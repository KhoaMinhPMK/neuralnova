# 📁 SQL Database Schemas

## 🚀 Cách import vào phpMyAdmin

### Bước 1: Mở phpMyAdmin
- Truy cập: `http://localhost/phpmyadmin` (local)
- Hoặc: VPS phpMyAdmin URL của bạn

### Bước 2: Import SQL file
1. Click tab **"Import"** ở menu trên
2. Click **"Choose File"** → Chọn file `001_users_table.sql`
3. Click **"Go"** để execute
4. Kiểm tra message: "Users table created successfully!"

### Bước 3: Verify
```sql
USE neuralnova;
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
```

---

## 📊 Database Schema

### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto increment |
| `full_name` | VARCHAR(100) | Họ tên người dùng |
| `email` | VARCHAR(150) | Email (unique) |
| `password` | VARCHAR(255) | Password đã hash (bcrypt) |
| `email_verified` | TINYINT | 0=chưa verify, 1=đã verify |
| `verification_token` | VARCHAR(64) | Token verify email (null) |
| `verification_token_expires` | DATETIME | Hết hạn token |
| `reset_token` | VARCHAR(64) | Token reset password |
| `reset_token_expires` | DATETIME | Hết hạn reset token |
| `status` | ENUM | 'active', 'inactive', 'banned' |
| `google_id` | VARCHAR(100) | Google OAuth ID (future) |
| `facebook_id` | VARCHAR(100) | Facebook OAuth ID (future) |
| `github_id` | VARCHAR(100) | GitHub OAuth ID (future) |
| `linkedin_id` | VARCHAR(100) | LinkedIn OAuth ID (future) |
| `avatar_url` | VARCHAR(255) | URL avatar |
| `phone` | VARCHAR(20) | Số điện thoại (optional) |
| `last_login` | DATETIME | Lần login cuối |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian update |

---

## 🔐 Test Account

**Email:** `test@neuralnova.space`  
**Password:** `Test@123`

Dùng để test login sau khi import database!

---

## 🛡️ Security Features (Prepared for Future)

### ✅ Current (Phase 1)
- Password hashing với bcrypt
- Email unique constraint
- Status management

### 🔜 Future (Phase 2)
- Email verification system
- Password reset flow
- Social OAuth integration
- 2FA authentication
- Login attempt tracking
- IP whitelist/blacklist

---

## 📝 Notes

- **Database Name**: `neuralnova`
- **Character Set**: `utf8mb4` (hỗ trợ emoji & special chars)
- **Collation**: `utf8mb4_unicode_ci`
- **Engine**: InnoDB (hỗ trợ foreign keys & transactions)

---

## 🔧 Troubleshooting

### Lỗi: "Database already exists"
```sql
DROP DATABASE neuralnova;
-- Rồi import lại file SQL
```

### Lỗi: "Table already exists"
```sql
DROP TABLE users;
-- Rồi import lại file SQL
```

### Lỗi: Character encoding
Đảm bảo phpMyAdmin sử dụng `utf8mb4`:
- Connections → `utf8mb4_unicode_ci`

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
