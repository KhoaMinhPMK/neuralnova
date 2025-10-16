# Profile Page - Quick Fix Guide

## ❌ **CURRENT ERRORS**:

### **1. Badges API - 500 Error**
### **2. Timeline API - 500 Error**
### **3. Avatar Upload - 422 Error**

---

## 🔧 **FIX 1: Run Database Migration**

### **Missing Migration**: `007_posts_enhancement.sql`

```sql
-- SSH vào server
ssh user@neuralnova.space

-- Login to MySQL
mysql -u username -p neuralnova

-- Run migration
source /path/to/neuralnova/backend/sql/007_posts_enhancement.sql;

-- Verify
SHOW COLUMNS FROM posts LIKE 'species';
SHOW COLUMNS FROM posts LIKE 'observation_date';
```

**Hoặc copy/paste SQL trực tiếp**:
```sql
USE neuralnova;

ALTER TABLE posts 
ADD COLUMN species VARCHAR(100) DEFAULT NULL COMMENT 'Flower species',
ADD COLUMN region VARCHAR(50) DEFAULT NULL COMMENT 'Climate region',
ADD COLUMN bloom_window VARCHAR(20) DEFAULT NULL COMMENT 'Bloom window',
ADD COLUMN observation_date DATE DEFAULT NULL COMMENT 'Observation date',
ADD COLUMN coordinates VARCHAR(100) DEFAULT NULL COMMENT 'GPS coordinates',
ADD COLUMN species_info TEXT DEFAULT NULL COMMENT 'Species info';

CREATE INDEX idx_posts_species ON posts(species);
CREATE INDEX idx_posts_region ON posts(region);
CREATE INDEX idx_posts_observation_date ON posts(observation_date);
```

---

## 🔧 **FIX 2: Upload Backend Files**

### **Files cần upload**:
1. `backend/api/profile/badges.php` (fixed handleCors)
2. `backend/api/profile/timeline.php` (fixed handleCors)
3. `backend/api/posts/upload-media.php` (fixed handleCors)
4. `backend/api/auth/check-session.php` (localhost CORS)

### **Upload command**:
```bash
# SSH upload
scp backend/api/profile/badges.php user@server:/path/to/backend/api/profile/
scp backend/api/profile/timeline.php user@server:/path/to/backend/api/profile/
scp backend/api/posts/upload-media.php user@server:/path/to/backend/api/posts/
scp backend/api/auth/check-session.php user@server:/path/to/backend/api/auth/

# Or Git
git add backend/
git commit -m "fix: badges, timeline, upload APIs"
git push origin main
# Then on server: git pull
```

---

## 🔧 **FIX 3: Upload Frontend Files**

### **Files cần upload**:
1. `pages/profile/index.html` (v5.4)
2. `pages/profile/app.js` (v5.4)
3. `pages/profile/style.css` (v4.0)

### **Upload command**:
```bash
scp pages/profile/* user@server:/path/to/web/pages/profile/

# Or Git
git add pages/profile/
git commit -m "feat: redesign profile - Facebook style"
git push origin main
# Then on server: git pull
```

---

## ✅ **VERIFICATION STEPS**:

### **1. Check Database**:
```sql
-- Login to MySQL
mysql -u username -p neuralnova

-- Check if columns exist
DESCRIBE posts;

-- Should see: species, region, bloom_window, observation_date, coordinates, species_info
```

### **2. Check Backend Files**:
```bash
ssh user@server
ls -la /path/to/backend/api/profile/badges.php
ls -la /path/to/backend/api/profile/timeline.php
# Check modified date
```

### **3. Test on Browser**:
```
https://neuralnova.space/pages/profile/index.html
```

Open Console (F12), should see:
```
✅ Profile loaded: khoaminh Posts: 2
✅ Badges loaded
✅ Stats loaded
✅ Posts loaded
```

---

## 🚨 **CRITICAL**:

**Không thể test được nếu**:
1. ❌ Database migration chưa chạy
2. ❌ Backend files chưa upload
3. ❌ Frontend files chưa upload
4. ❌ Browser cache chưa clear

**Phải làm đủ 4 bước trên thì mới test được!**

---

## 🎯 **QUICK ACTION**:

### **Option A: Git Push (Nhanh nhất)**
```bash
# Local
git add .
git commit -m "fix: profile page complete redesign"
git push origin main

# Server
cd /path/to/neuralnova
git pull origin main

# Run SQL
mysql -u user -p neuralnova < backend/sql/007_posts_enhancement.sql
```

### **Option B: Manual Upload**
1. Upload 3 backend files
2. Upload 3 frontend files
3. Run SQL migration
4. Hard refresh browser

---

**Chọn Option A hoặc B và làm xong thì test lại nhé!** 🚀
