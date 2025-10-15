# 🚀 NeuralNova Deployment Guide

**Quick Start**: Get your social network running in 30 minutes

---

## 📋 Pre-Deployment Checklist

- [ ] VPS with PHP 8.0+ & MySQL 8.0+
- [ ] Domain: `neuralnova.space` configured
- [ ] Apache/Nginx with .htaccess support
- [ ] Git installed on VPS
- [ ] phpMyAdmin access (optional but recommended)

---

## 🔧 Step 1: Deploy Code (5 min)

### **On Local Machine**

```bash
# Navigate to project
cd E:\project\neuralnova\neuralnova

# Add all new files
git add backend/
git add document/

# Commit
git commit -m "Phase 1-8: Complete Facebook-like social network backend"

# Push to repository
git push origin main
```

### **On VPS**

```bash
# SSH into your VPS
ssh user@neuralnova.space

# Navigate to web directory
cd /path/to/neuralnova

# Pull latest code
git pull origin main

# Verify files
ls -la backend/api/profile/
ls -la backend/sql/
```

---

## 🗄️ Step 2: Run Database Migrations (10 min)

### **Method 1: phpMyAdmin** (Recommended)

1. Open: `https://neuralnova.space/phpmyadmin`
2. Login with your MySQL credentials
3. Select database: `neuralnova`
4. Click **SQL** tab
5. Run each file in order:

**Copy & paste entire content of each file:**

```
✅ 002_users_profile_extension.sql
✅ 003_posts_table.sql
✅ 004_reactions_table.sql
✅ 005_comments_table.sql
✅ 006_activities_table.sql
```

6. Click **Go** after pasting each file
7. Look for "Query OK" messages

### **Method 2: MySQL CLI**

```bash
# Login to MySQL
mysql -u root -p

# Select database
USE neuralnova;

# Run migrations
SOURCE /path/to/neuralnova/backend/sql/002_users_profile_extension.sql;
SOURCE /path/to/neuralnova/backend/sql/003_posts_table.sql;
SOURCE /path/to/neuralnova/backend/sql/004_reactions_table.sql;
SOURCE /path/to/neuralnova/backend/sql/005_comments_table.sql;
SOURCE /path/to/neuralnova/backend/sql/006_activities_table.sql;

# Exit
EXIT;
```

### **Verify Migrations**

```sql
-- Check tables exist
SHOW TABLES;
-- Expected: activities, comments, posts, reactions, users

-- Check users table extended
DESCRIBE users;
-- Should include: bio, interests, country, avatar_url, cover_url, etc.

-- Check posts table
DESCRIBE posts;
-- Should have: species, region, bloom_window, media_url, etc.
```

---

## 📁 Step 3: Set File Permissions (5 min)

```bash
# Navigate to backend
cd /path/to/neuralnova/backend

# Create upload directories if not exist
mkdir -p uploads/avatars
mkdir -p uploads/covers
mkdir -p uploads/posts

# Set directory permissions (755 = rwxr-xr-x)
chmod 755 uploads/
chmod 755 uploads/avatars/
chmod 755 uploads/covers/
chmod 755 uploads/posts/

# Set ownership to web server user
chown -R www-data:www-data uploads/
# OR on CentOS/RHEL:
# chown -R apache:apache uploads/

# Verify permissions
ls -la uploads/
# Should show: drwxr-xr-x ... www-data www-data
```

### **Troubleshoot Permission Issues**

If uploads fail with "Permission denied":

```bash
# More permissive (temporary for testing)
chmod 777 uploads/
chmod 777 uploads/avatars/
chmod 777 uploads/covers/
chmod 777 uploads/posts/

# Then check which user PHP runs as
<?php echo exec('whoami'); ?>

# Set ownership accordingly
chown -R {php-user}:{php-user} uploads/
```

---

## 🔍 Step 4: Verify php.ini Settings (2 min)

Check upload limits:

```bash
# Find php.ini location
php --ini

# Edit php.ini
sudo nano /etc/php/8.0/apache2/php.ini
# OR
sudo nano /etc/php.ini
```

**Required settings:**

```ini
upload_max_filesize = 25M
post_max_size = 30M
memory_limit = 128M
max_execution_time = 300
```

**After editing:**

```bash
# Restart Apache
sudo systemctl restart apache2
# OR
sudo service httpd restart
```

---

## 🧪 Step 5: Test APIs (5 min)

### **Open Test Suite**

```
https://neuralnova.space/backend/test/test-all-apis.html
```

### **Test Flow**

1. **Register User**
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Password123`
   - Click **Register**
   - ✅ Should see: `"success": true`

2. **Login**
   - Use same credentials
   - Click **Login**
   - ✅ Should see: `"success": true`, `"user": {...}`

3. **Check Session**
   - Click **Check Session**
   - ✅ Should see: `"authenticated": true`

4. **Update Profile**
   - Fill in bio, interests, country, username
   - Click **Update Profile**
   - ✅ Should see updated data

5. **Upload Avatar**
   - Select image file
   - Click **Upload Avatar**
   - ✅ Should see: `"success": true`, `"url": "..."`

6. **Create Post**
   - Fill caption, select species/region
   - Optionally add media
   - Click **Create Post**
   - ✅ Should see: `"success": true`, `"post": {...}`

7. **Get Feed**
   - Click **Get Feed**
   - ✅ Should see list of posts

8. **Add Reaction**
   - Enter Post ID: `1`
   - Select reaction type
   - Click **Add Reaction**
   - ✅ Should see: `"success": true`, `"counts": {...}`

9. **Add Comment**
   - Enter Post ID: `1`
   - Write comment
   - Click **Add Comment**
   - ✅ Should see: `"success": true`, `"comment": {...}`

**All green** = ✅ Deployment successful!

---

## 🐛 Common Issues & Fixes

### **Issue 1: "Database connection failed"**

**Fix**:
```php
// Check backend/config/database.php
define('DB_HOST', 'localhost');  // Or your DB host
define('DB_USER', 'root');       // Your MySQL user
define('DB_PASS', 'your-password'); // Your MySQL password
define('DB_NAME', 'neuralnova');
```

---

### **Issue 2: "403 Forbidden" on API calls**

**Fix**:
```bash
# Check .htaccess in backend/
cat backend/.htaccess

# Should have:
Require all granted
Options +Indexes +FollowSymLinks

# Restart Apache
sudo systemctl restart apache2
```

---

### **Issue 3: "File upload failed"**

**Fix**:
```bash
# Check permissions
ls -la backend/uploads/

# Should be:
drwxr-xr-x ... www-data www-data ... avatars/
drwxr-xr-x ... www-data www-data ... covers/
drwxr-xr-x ... www-data www-data ... posts/

# If not:
chown -R www-data:www-data backend/uploads/
chmod 755 backend/uploads/*

# Check PHP limits
php -i | grep upload_max_filesize
# Should be >= 25M
```

---

### **Issue 4: "CORS error" from frontend**

**Fix**:
```php
// Already in all API files:
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// If still failing, check Apache config:
# sudo nano /etc/apache2/apache2.conf
# Add:
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
```

---

### **Issue 5: "Session not persisting"**

**Fix**:
```bash
# Check session save path
php -i | grep session.save_path

# Ensure directory exists and is writable
mkdir -p /var/lib/php/sessions
chmod 1733 /var/lib/php/sessions
```

---

## 📊 Step 6: Verify Database Data (3 min)

```sql
-- Login to MySQL
mysql -u root -p neuralnova

-- Check users
SELECT id, full_name, email, bio, interests, country FROM users;

-- Check posts
SELECT p.id, u.full_name, p.caption, p.species, p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Check reactions
SELECT p.id AS post_id, r.reaction_type, COUNT(*) AS count
FROM posts p
LEFT JOIN reactions r ON p.id = r.post_id
GROUP BY p.id, r.reaction_type;

-- Check comments
SELECT c.id, u.full_name, c.comment_text, c.created_at
FROM comments c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 10;
```

---

## 🔐 Step 7: Security Hardening (Optional)

### **1. Restrict API Access**

```apache
# backend/api/.htaccess
# Allow only from your domain
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTP_REFERER} !^https://neuralnova\.space/ [NC]
    RewriteRule ^(.*)$ - [F,L]
</IfModule>
```

### **2. Enable HTTPS Only**

```apache
# Redirect HTTP to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### **3. Hide PHP Version**

```ini
# php.ini
expose_php = Off
```

### **4. Backup Database**

```bash
# Setup daily backup cron
crontab -e

# Add:
0 2 * * * mysqldump -u root -p'password' neuralnova > /backup/neuralnova_$(date +\%Y\%m\%d).sql
```

---

## ✅ Post-Deployment Checklist

- [ ] All 5 SQL migrations run successfully
- [ ] `uploads/` directories created with correct permissions
- [ ] Test suite shows all green ✅
- [ ] At least 1 user registered
- [ ] At least 1 post created
- [ ] Reactions working
- [ ] Comments working
- [ ] File uploads working (avatar, cover, post media)
- [ ] API accessible from frontend
- [ ] HTTPS enabled (production)
- [ ] Database backups configured

---

## 🎯 Next: Frontend Integration

Now that backend is deployed:

1. **Test from frontend**:
   ```javascript
   fetch('https://neuralnova.space/backend/api/posts/feed.php')
     .then(res => res.json())
     .then(data => console.log(data));
   ```

2. **Update profile page**:
   - Replace `localStorage` with API calls
   - Use real authentication
   - Load posts from database

3. **See**: `PROFILE_BACKEND_ROADMAP.md` for frontend integration plan

---

## 📞 Quick Reference

### **Test Suite**
```
https://neuralnova.space/backend/test/test-all-apis.html
```

### **API Base URL**
```
https://neuralnova.space/backend/api
```

### **Endpoints**
```
/api/auth/register.php
/api/auth/login.php
/api/profile/get.php
/api/posts/feed.php
... (18 total)
```

### **Database**
```
Name: neuralnova
Tables: 5 (users, posts, reactions, comments, activities)
User: root (change in production!)
```

---

**Deployment Time**: ~30 minutes  
**Difficulty**: ⭐⭐ (Intermediate)  
**Status**: ✅ Production Ready

*Built with ❤️ for NeuralNova*
