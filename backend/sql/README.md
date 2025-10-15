# 📊 NeuralNova Database Schema

**Version**: 2.0  
**Last Updated**: October 15, 2025

---

## 📋 Migration Files

### **Phase 1: User Authentication** (✅ Completed)
- `001_users_table.sql` - Base users table with authentication

### **Phase 2: Profile & Social Network** (🆕 New)
- `002_users_profile_extension.sql` - Extend users with profile fields
- `003_posts_table.sql` - Posts with bloom tracking
- `004_reactions_table.sql` - Reactions (like, heart, flower, wow)
- `005_comments_table.sql` - Comments on posts
- `006_activities_table.sql` - Activity timeline (optional)

---

## 🚀 How to Run Migrations

### **Method 1: phpMyAdmin (Recommended for VPS)**

1. Login to phpMyAdmin
2. Select database `neuralnova`
3. Go to **SQL** tab
4. Copy entire content of each file
5. Run in order: `002` → `003` → `004` → `005` → `006`
6. Check for success messages

### **Method 2: MySQL Command Line**

```bash
# Login to MySQL
mysql -u root -p

# Select database
USE neuralnova;

# Run migrations in order
SOURCE /path/to/backend/sql/002_users_profile_extension.sql;
SOURCE /path/to/backend/sql/003_posts_table.sql;
SOURCE /path/to/backend/sql/004_reactions_table.sql;
SOURCE /path/to/backend/sql/005_comments_table.sql;
SOURCE /path/to/backend/sql/006_activities_table.sql;
```

### **Method 3: Single Command (All at once)**

```bash
cd /path/to/backend/sql
mysql -u root -p neuralnova < 002_users_profile_extension.sql
mysql -u root -p neuralnova < 003_posts_table.sql
mysql -u root -p neuralnova < 004_reactions_table.sql
mysql -u root -p neuralnova < 005_comments_table.sql
mysql -u root -p neuralnova < 006_activities_table.sql
```

---

## 🗄️ Database Schema Overview

### **1. Users Table** (Extended)

```sql
users (
    -- Existing fields from 001_users_table.sql
    id, full_name, email, password, status, created_at, ...
    
    -- New profile fields
    bio TEXT,                    -- User introduction
    interests VARCHAR(500),      -- Hobbies (comma-separated)
    country VARCHAR(2),          -- Country code (VN, US, JP, etc.)
    avatar_url VARCHAR(255),     -- Avatar path
    cover_url VARCHAR(255),      -- Cover photo path
    gps_coords VARCHAR(100),     -- GPS location
    ip_region VARCHAR(50),       -- IP region
    ip_display VARCHAR(100),     -- Display IP
    custom_user_id VARCHAR(50)   -- Custom username
)
```

**Indexes**:
- `email` (UNIQUE)
- `custom_user_id` (UNIQUE)
- `country`

---

### **2. Posts Table**

```sql
posts (
    id INT PRIMARY KEY,
    user_id INT,                 -- FK to users
    
    -- Bloom tracking
    species VARCHAR(50),         -- sakura, lotus, etc.
    region VARCHAR(50),          -- temperate-n, tropical, etc.
    bloom_window VARCHAR(50),    -- 03-04, Quanh năm
    species_info TEXT,           -- Description
    
    -- Location & Time
    coordinates VARCHAR(100),    -- GPS coords
    post_date DATE,             -- Observation date
    
    -- Content
    caption TEXT,               -- Post text
    media_url VARCHAR(255),     -- Image/video path
    media_type ENUM,            -- image, video, none
    
    -- Privacy
    is_public TINYINT(1),       -- 1=public, 0=private
    blur_location TINYINT(1),   -- 1=blur, 0=exact
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Indexes**:
- `user_id`
- `created_at`
- `species`
- `region`
- `post_date`
- `is_public`

---

### **3. Reactions Table**

```sql
reactions (
    id INT PRIMARY KEY,
    post_id INT,                -- FK to posts
    user_id INT,                -- FK to users
    reaction_type ENUM(         -- like, heart, flower, wow
        'like', 'heart', 'flower', 'wow'
    ),
    created_at TIMESTAMP,
    
    UNIQUE (post_id, user_id, reaction_type)
)
```

**Constraints**:
- One user can only have ONE of each reaction type per post
- Cascade delete when post or user is deleted

---

### **4. Comments Table**

```sql
comments (
    id INT PRIMARY KEY,
    post_id INT,                -- FK to posts
    user_id INT,                -- FK to users
    comment_text TEXT,          -- Comment content
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Indexes**:
- `post_id`
- `user_id`
- `created_at`

---

### **5. Activities Table** (Optional)

```sql
activities (
    id INT PRIMARY KEY,
    user_id INT,                -- FK to users
    activity_type ENUM(
        'post_created', 
        'comment_added', 
        'reaction_added', 
        'profile_updated'
    ),
    entity_type ENUM('post', 'comment', 'user'),
    entity_id INT,              -- ID of post/comment/user
    metadata JSON,              -- Additional data
    created_at TIMESTAMP
)
```

**Use Case**: Generate timeline/newsfeed of user activities

---

## 🔍 Verification Queries

### **Check All Tables**

```sql
SHOW TABLES;
```

Expected output:
```
+----------------------+
| Tables_in_neuralnova |
+----------------------+
| activities           |
| comments             |
| posts                |
| reactions            |
| users                |
+----------------------+
```

---

### **Count Records**

```sql
SELECT 
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM posts) AS posts,
    (SELECT COUNT(*) FROM reactions) AS reactions,
    (SELECT COUNT(*) FROM comments) AS comments,
    (SELECT COUNT(*) FROM activities) AS activities;
```

---

### **Check User Profile Fields**

```sql
SELECT 
    id, 
    full_name, 
    email, 
    bio, 
    interests, 
    country, 
    avatar_url, 
    custom_user_id 
FROM users 
LIMIT 5;
```

---

### **Check Posts with User Info**

```sql
SELECT 
    p.id,
    u.full_name AS author,
    p.species,
    p.region,
    p.caption,
    p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
```

---

### **Check Reactions Count per Post**

```sql
SELECT 
    p.id AS post_id,
    p.caption,
    COUNT(r.id) AS total_reactions,
    SUM(CASE WHEN r.reaction_type = 'like' THEN 1 ELSE 0 END) AS likes,
    SUM(CASE WHEN r.reaction_type = 'heart' THEN 1 ELSE 0 END) AS hearts,
    SUM(CASE WHEN r.reaction_type = 'flower' THEN 1 ELSE 0 END) AS flowers,
    SUM(CASE WHEN r.reaction_type = 'wow' THEN 1 ELSE 0 END) AS wows
FROM posts p
LEFT JOIN reactions r ON p.id = r.post_id
GROUP BY p.id
ORDER BY total_reactions DESC
LIMIT 10;
```

---

### **Check Comments per Post**

```sql
SELECT 
    p.id AS post_id,
    p.caption,
    COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id
ORDER BY comment_count DESC
LIMIT 10;
```

---

## 🔧 Rollback (If Needed)

If you need to undo changes:

```sql
-- Drop new tables (in reverse order)
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS posts;

-- Remove profile fields from users
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS interests;
ALTER TABLE users DROP COLUMN IF EXISTS country;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE users DROP COLUMN IF EXISTS cover_url;
ALTER TABLE users DROP COLUMN IF EXISTS gps_coords;
ALTER TABLE users DROP COLUMN IF EXISTS ip_region;
ALTER TABLE users DROP COLUMN IF EXISTS ip_display;
ALTER TABLE users DROP COLUMN IF EXISTS custom_user_id;
```

---

## 📊 Sample Data (For Testing)

### **Insert Sample Post**

```sql
INSERT INTO posts (
    user_id, 
    species, 
    region, 
    bloom_window, 
    species_info, 
    coordinates, 
    post_date, 
    caption, 
    media_type
) VALUES (
    1,
    'sakura',
    'temperate-n',
    '03-04',
    'Cherry blossoms bloom in spring',
    '35.6762, 139.6503',
    '2025-03-15',
    'Beautiful sakura in Tokyo!',
    'none'
);
```

### **Insert Sample Reaction**

```sql
INSERT INTO reactions (post_id, user_id, reaction_type) 
VALUES (1, 1, 'heart');
```

### **Insert Sample Comment**

```sql
INSERT INTO comments (post_id, user_id, comment_text) 
VALUES (1, 1, 'Amazing flowers! 🌸');
```

---

## 🎯 Next Steps

After running migrations:

1. ✅ Verify all tables created
2. ✅ Run verification queries
3. ✅ Insert sample data (optional)
4. ➡️ Move to Phase 2: File Upload System
5. ➡️ Move to Phase 3: Backend APIs

---

## 📞 Troubleshooting

### **Error: Table already exists**

This is normal if running migrations multiple times. The `IF NOT EXISTS` clause will skip creation.

### **Error: Foreign key constraint fails**

Make sure `users` table exists first (from `001_users_table.sql`).

### **Error: Duplicate column**

Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (MySQL 8.0+) or check if column already exists.

### **Error: Permission denied**

Ensure MySQL user has `CREATE`, `ALTER`, `INDEX` privileges:

```sql
GRANT CREATE, ALTER, INDEX ON neuralnova.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

---

**Database Schema Version**: 2.0  
**Status**: ✅ Ready for Production  
**Tables**: 5 (users, posts, reactions, comments, activities)  
**Total Fields**: 50+
