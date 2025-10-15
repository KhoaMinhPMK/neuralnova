# 🚀 NeuralNova Backend - Deployment Guide

## 📋 Deployment Checklist

### 1. Local Development (XAMPP)

#### Setup XAMPP
```bash
# 1. Copy backend folder vào
C:\xampp\htdocs\neuralnova\backend\

# 2. Start Apache & MySQL trong XAMPP Control Panel

# 3. Import database
# Mở: http://localhost/phpmyadmin
# Import: backend/sql/001_users_table.sql

# 4. Config database
# Edit: backend/config/database.php
```

#### Test Local
```
http://localhost/neuralnova/backend/test-api.html
```

---

### 2. VPS Production Deployment

#### Step 1: Git Push từ local

```bash
# Trên máy local (XAMPP)
cd C:\xampp\htdocs\neuralnova

# Add backend files
git add backend/
git commit -m "feat: add authentication backend API"

# Push to GitHub
git push origin main
```

#### Step 2: Git Pull trên VPS

```bash
# SSH vào VPS
ssh user@neuralnova.space

# Navigate to web directory
cd /var/www/html/neuralnova  # Hoặc path của bạn

# Pull latest code
git pull origin main

# Set permissions
chmod 755 backend/
chmod 644 backend/api/auth/*.php
chmod 644 backend/config/*.php
```

#### Step 3: Database Setup trên VPS

```bash
# Option 1: phpMyAdmin
# Truy cập: https://neuralnova.space/phpmyadmin
# Import: backend/sql/001_users_table.sql

# Option 2: MySQL CLI
mysql -u your_user -p your_database < backend/sql/001_users_table.sql
```

#### Step 4: Configure Database

```bash
# Edit config on VPS
nano backend/config/database.php

# Update credentials:
define('DB_HOST', 'localhost');
define('DB_NAME', 'neuralnova');
define('DB_USER', 'your_vps_user');
define('DB_PASS', 'your_vps_password');
```

#### Step 5: Set Permissions

```bash
# Backend directory
chmod 755 backend/
chmod 755 backend/api/
chmod 755 backend/api/auth/
chmod 755 backend/config/
chmod 755 backend/includes/

# PHP files (read + execute)
find backend/ -name "*.php" -exec chmod 644 {} \;

# Config files (stricter)
chmod 600 backend/config/database.php
```

#### Step 6: Test API

```bash
# Test from VPS
curl https://neuralnova.space/backend/api/auth/check-session.php

# Should return:
# {"success":false,"message":"Not authenticated",...}
```

---

## 🔐 Production Security

### 1. Update CORS

Edit `backend/.htaccess`:

```apache
# Change from:
Header set Access-Control-Allow-Origin "*"

# To:
Header set Access-Control-Allow-Origin "https://neuralnova.space"
```

### 2. Enable HTTPS

Edit `backend/includes/session.php`:

```php
// Change from:
ini_set('session.cookie_secure', 0);

// To:
ini_set('session.cookie_secure', 1); // Require HTTPS
```

### 3. Disable Error Display

Edit `backend/api/auth/*.php`:

```php
// Remove or comment out:
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// Keep only:
error_log("Error message");
```

### 4. Strong Database Password

```bash
# On VPS, change MySQL password
mysql -u root -p

mysql> ALTER USER 'neuralnova_user'@'localhost' IDENTIFIED BY 'Strong!Pass123@';
mysql> FLUSH PRIVILEGES;
```

---

## 🧪 Testing Workflow

### Local Test (XAMPP)
```
http://localhost/neuralnova/backend/test-api.html
```

### Production Test
```
https://neuralnova.space/backend/test-api.html
```

### Test Scenarios

1. ✅ **Register new user**
   - Test with valid data
   - Test with duplicate email
   - Test with weak password

2. ✅ **Login existing user**
   - Test with correct credentials
   - Test with wrong password
   - Test with non-existent email

3. ✅ **Check session**
   - Test when logged in
   - Test when not logged in

4. ✅ **Logout**
   - Test successful logout
   - Verify session destroyed

---

## 🐛 Troubleshooting

### Issue: "Connection refused"

**Cause:** API không accessible

**Solution:**
```bash
# Check Apache running
systemctl status apache2

# Check file permissions
ls -la backend/api/auth/

# Check .htaccess
cat backend/.htaccess
```

---

### Issue: "Database connection failed"

**Cause:** Wrong credentials hoặc MySQL không chạy

**Solution:**
```bash
# Check MySQL running
systemctl status mysql

# Test database connection
mysql -u your_user -p your_database -e "SELECT 1;"

# Verify credentials in config
cat backend/config/database.php
```

---

### Issue: "CORS error in browser"

**Cause:** CORS headers không đúng

**Solution:**
```bash
# Check .htaccess CORS headers
cat backend/.htaccess | grep "Access-Control"

# Update to your domain:
Header set Access-Control-Allow-Origin "https://neuralnova.space"
```

---

### Issue: "Session not working"

**Cause:** Cookie settings hoặc session path

**Solution:**
```bash
# Check PHP session settings
php -i | grep session

# Ensure session directory writable
ls -ld /var/lib/php/sessions

# Set permissions if needed
sudo chmod 1777 /var/lib/php/sessions
```

---

## 📊 Monitoring

### Check Error Logs

```bash
# Apache error log
tail -f /var/log/apache2/error.log

# PHP error log
tail -f /var/log/php_errors.log

# Custom app log (nếu set)
tail -f /var/www/html/neuralnova/backend/logs/app.log
```

### Database Health

```bash
mysql -u root -p

mysql> SELECT COUNT(*) FROM neuralnova.users;
mysql> SELECT * FROM neuralnova.users ORDER BY created_at DESC LIMIT 5;
mysql> SHOW PROCESSLIST;
```

---

## 🔄 Update Workflow

```bash
# 1. Local: Develop & test
# Edit files in XAMPP

# 2. Local: Commit & push
git add backend/
git commit -m "fix: update validation logic"
git push origin main

# 3. VPS: Pull changes
ssh user@neuralnova.space
cd /var/www/html/neuralnova
git pull origin main

# 4. VPS: Test
curl https://neuralnova.space/backend/api/auth/check-session.php

# 5. Monitor logs
tail -f /var/log/apache2/error.log
```

---

## ✅ Post-Deployment Checklist

- [ ] Database imported successfully
- [ ] Config credentials updated
- [ ] File permissions set correctly
- [ ] CORS configured for production domain
- [ ] HTTPS enabled for sessions
- [ ] Error logging enabled
- [ ] Test all API endpoints
- [ ] Monitor error logs for 24 hours
- [ ] Backup database created

---

## 📞 Support

**Developer:** NeuralNova Team  
**Last Updated:** October 15, 2025

**Common Commands:**
```bash
# Restart Apache
sudo systemctl restart apache2

# Restart MySQL
sudo systemctl restart mysql

# Check logs
tail -f /var/log/apache2/error.log

# Database backup
mysqldump -u root -p neuralnova > backup_$(date +%Y%m%d).sql
```
