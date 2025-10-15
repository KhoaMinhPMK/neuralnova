# ✅ Phase 1: Database Migration - Complete

**Date**: October 15, 2025  
**Status**: 🟢 Ready to Deploy  
**Duration**: 2-3 hours

---

## 📦 Files Created

### **SQL Migration Files** (backend/sql/):
```
✅ 002_users_profile_extension.sql    (Extend users table)
✅ 003_posts_table.sql                (Posts with bloom tracking)
✅ 004_reactions_table.sql            (Like, heart, flower, wow)
✅ 005_comments_table.sql             (Comments system)
✅ 006_activities_table.sql           (Activity timeline - optional)
✅ README.md                          (Migration guide)
```

**Total**: 5 migration files + 1 README

---

## 🗄️ Database Changes Summary

### **1. Users Table** (Extended - 9 new columns)

| Column | Type | Description |
|--------|------|-------------|
| `bio` | TEXT | User introduction/bio |
| `interests` | VARCHAR(500) | Hobbies (comma-separated) |
| `country` | VARCHAR(2) | Country code (VN, US, JP) |
| `avatar_url` | VARCHAR(255) | Avatar file path |
| `cover_url` | VARCHAR(255) | Cover photo path |
| `gps_coords` | VARCHAR(100) | GPS coordinates |
| `ip_region` | VARCHAR(50) | IP region selection |
| `ip_display` | VARCHAR(100) | Display IP address |
| `custom_user_id` | VARCHAR(50) | Custom username (UNIQUE) |

**Indexes Added**: `country`, `custom_user_id`

---

### **2. Posts Table** (New - 15 columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key (AUTO_INCREMENT) |
| `user_id` | INT | Foreign key to users |
| `species` | VARCHAR(50) | Flower species |
| `region` | VARCHAR(50) | Climate region |
| `bloom_window` | VARCHAR(50) | Bloom period |
| `species_info` | TEXT | Species description |
| `coordinates` | VARCHAR(100) | GPS coordinates |
| `post_date` | DATE | Observation date |
| `caption` | TEXT | Post caption |
| `media_url` | VARCHAR(255) | Media file path |
| `media_type` | ENUM | image/video/none |
| `is_public` | TINYINT(1) | Public/private |
| `blur_location` | TINYINT(1) | Blur GPS yes/no |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes**: `user_id`, `created_at`, `species`, `region`, `post_date`, `is_public`

---

### **3. Reactions Table** (New - 5 columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `post_id` | INT | Foreign key to posts |
| `user_id` | INT | Foreign key to users |
| `reaction_type` | ENUM | like/heart/flower/wow |
| `created_at` | TIMESTAMP | Reaction time |

**Unique Constraint**: (post_id, user_id, reaction_type)  
**Indexes**: `post_id`, `user_id`, `reaction_type`

---

### **4. Comments Table** (New - 6 columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `post_id` | INT | Foreign key to posts |
| `user_id` | INT | Foreign key to users |
| `comment_text` | TEXT | Comment content |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last edit time |

**Indexes**: `post_id`, `user_id`, `created_at`

---

### **5. Activities Table** (Optional - 7 columns)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `user_id` | INT | Foreign key to users |
| `activity_type` | ENUM | post_created/comment_added/etc. |
| `entity_type` | ENUM | post/comment/user |
| `entity_id` | INT | ID of entity |
| `metadata` | JSON | Additional data |
| `created_at` | TIMESTAMP | Activity time |

**Indexes**: `user_id`, `created_at`, `activity_type`, (entity_type, entity_id)

---

## 🚀 How to Deploy (3 Methods)

### **Method 1: phpMyAdmin** (Recommended for VPS)

1. Login: `https://neuralnova.space/phpmyadmin`
2. Select database: `neuralnova`
3. Click **SQL** tab
4. Copy entire content of each file:
   - `002_users_profile_extension.sql`
   - `003_posts_table.sql`
   - `004_reactions_table.sql`
   - `005_comments_table.sql`
   - `006_activities_table.sql`
5. Paste and click **Go**
6. Check for "Query OK" or success message
7. Repeat for all 5 files

**Total time**: ~5 minutes

---

### **Method 2: MySQL Command Line**

```bash
# SSH into VPS
ssh user@neuralnova.space

# Navigate to SQL folder
cd /path/to/backend/sql

# Login to MySQL
mysql -u root -p

# Run migrations
USE neuralnova;
SOURCE 002_users_profile_extension.sql;
SOURCE 003_posts_table.sql;
SOURCE 004_reactions_table.sql;
SOURCE 005_comments_table.sql;
SOURCE 006_activities_table.sql;

# Exit
EXIT;
```

---

### **Method 3: Batch Import**

```bash
# Navigate to SQL folder
cd /path/to/backend/sql

# Run all migrations at once
for file in 00{2..6}*.sql; do
  echo "Running $file..."
  mysql -u root -p neuralnova < "$file"
done
```

---

## ✅ Verification Steps

### **Step 1: Check All Tables Exist**

```sql
SHOW TABLES;
```

**Expected Output**:
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

✅ Should show **5 tables**

---

### **Step 2: Check Users Table Extended**

```sql
DESCRIBE users;
```

**Expected**: Should see new columns:
- `bio`
- `interests`
- `country`
- `avatar_url`
- `cover_url`
- `gps_coords`
- `ip_region`
- `ip_display`
- `custom_user_id`

---

### **Step 3: Check Posts Table**

```sql
DESCRIBE posts;
```

**Expected**: Should see 15 columns including:
- `species`, `region`, `bloom_window`
- `coordinates`, `post_date`
- `media_url`, `media_type`
- `is_public`, `blur_location`

---

### **Step 4: Check Foreign Keys**

```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'neuralnova'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Expected Foreign Keys**:
- `posts.user_id` → `users.id`
- `reactions.post_id` → `posts.id`
- `reactions.user_id` → `users.id`
- `comments.post_id` → `posts.id`
- `comments.user_id` → `users.id`
- `activities.user_id` → `users.id`

---

### **Step 5: Check Indexes**

```sql
SHOW INDEX FROM posts;
SHOW INDEX FROM reactions;
SHOW INDEX FROM comments;
```

**Expected**: Multiple indexes for performance

---

## 🧪 Test with Sample Data

### **Insert Test Post**

```sql
INSERT INTO posts (
    user_id, 
    species, 
    region, 
    bloom_window, 
    caption, 
    media_type
) VALUES (
    1,
    'sakura',
    'temperate-n',
    '03-04',
    'Test post - Beautiful cherry blossoms!',
    'none'
);
```

**Expected**: 1 row inserted

---

### **Insert Test Reaction**

```sql
INSERT INTO reactions (post_id, user_id, reaction_type) 
VALUES (1, 1, 'heart');
```

**Expected**: 1 row inserted

---

### **Insert Test Comment**

```sql
INSERT INTO comments (post_id, user_id, comment_text) 
VALUES (1, 1, 'Love this! 🌸');
```

**Expected**: 1 row inserted

---

### **Verify Test Data**

```sql
SELECT 
    p.id AS post_id,
    p.caption,
    u.full_name AS author,
    (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) AS reaction_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
FROM posts p
JOIN users u ON p.user_id = u.id;
```

**Expected Output**:
```
+---------+----------------------------------+--------+----------------+---------------+
| post_id | caption                          | author | reaction_count | comment_count |
+---------+----------------------------------+--------+----------------+---------------+
|       1 | Test post - Beautiful cherry...  | (name) |              1 |             1 |
+---------+----------------------------------+--------+----------------+---------------+
```

---

## 🎯 Success Criteria

- [x] 5 SQL files created
- [x] README.md with instructions
- [ ] All 5 migrations run successfully
- [ ] All tables exist in database
- [ ] Foreign keys working
- [ ] Indexes created
- [ ] Sample data inserts work
- [ ] Verification queries pass

---

## 🔄 Rollback Plan

If something goes wrong:

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

## ⚠️ Important Notes

1. **Backup First**: Always backup database before migration
   ```bash
   mysqldump -u root -p neuralnova > backup_before_migration.sql
   ```

2. **Run in Order**: Must run files in sequence (002 → 003 → 004 → 005 → 006)

3. **Foreign Keys**: `users` table must exist first (from 001_users_table.sql)

4. **IF NOT EXISTS**: Safe to run multiple times (won't duplicate)

5. **VPS Deployment**: 
   - Update files via Git: `git pull origin main`
   - Or upload via FTP/SFTP
   - Then run migrations via phpMyAdmin

---

## 📊 Database Size Estimate

| Table | Est. Size per 1000 records |
|-------|---------------------------|
| users (extended) | ~500 KB |
| posts | ~1 MB |
| reactions | ~100 KB |
| comments | ~200 KB |
| activities | ~150 KB |

**Total for 1000 users with 10 posts each**: ~20-30 MB

---

## 🎉 Phase 1 Complete!

**What's Done**:
- ✅ Database schema designed
- ✅ 5 SQL migration files created
- ✅ Indexes for performance
- ✅ Foreign key constraints
- ✅ Documentation & guides

**What's Next**: 
➡️ **Phase 2**: File Upload System  
➡️ Create `backend/includes/file_upload.php`  
➡️ Create upload directories  
➡️ Set permissions

---

**Status**: ✅ Ready to Deploy  
**Files**: 6 (5 SQL + 1 README)  
**Tables**: 5 (users extended + 4 new)  
**Time to Deploy**: ~5-10 minutes
